//SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IAaveIncentivesController} from "./Interfaces/IAaveIncentivesController.sol";
import {ILendingPool} from "./Interfaces/ILendingPool.sol";
import {IWETH} from "./Interfaces/IWETH.sol";

contract Faucet {
    address public _owner;
    address public _faucetTarget;

    uint256 public _dailyLimit;
    uint256 public _CDStartTimestamp;
    uint256 public _CDDuration;

    ILendingPool public immutable POOL;

    IAaveIncentivesController public immutable INCENTIVES;
    IERC20 public immutable aWETH;
    IWETH public immutable WETH;

    constructor(
        uint256 dailyLimit,
        address faucetTarget,
        address aaveLendingPool,
        address aaveIncentivesController,
        address aweth,
        address weth
    ) {
        _owner = msg.sender;

        _dailyLimit = dailyLimit;
        _faucetTarget = faucetTarget;

        POOL = ILendingPool(aaveLendingPool);
        INCENTIVES = IAaveIncentivesController(aaveIncentivesController);

        WETH = IWETH(weth);
        aWETH = IERC20(aweth);
    }

    modifier onlyOwner {
        require(msg.sender == _owner, "Only owner can call this function.");
        _;
    }

    receive() external payable {
        if (msg.sender != address(WETH)) {
            deposit();
        } // else: WETH is sending us back ETH, so don't do anything (to avoid recursion)
    }

    function deposit() public payable {
        WETH.deposit{value: msg.value}();
        POOL.deposit(address(WETH), msg.value, address(this), 0);
    }

    function _safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, "ETH_TRANSFER_FAILED");
    }

    function doFaucetDrop(uint256 amount) external {
        require((block.timestamp - _CDDuration) <= _CDStartTimestamp); // require NOT ON COOLDOWN
        require(amount <= _dailyLimit); // require AMOUNT within DAILY LIMIT
        require(faucetFunds() >= amount); // require ENOUGH aTOKENS

        // Update cooldown state
        _CDStartTimestamp = block.timestamp;
        _CDDuration = 1 days / (_dailyLimit / amount);

        POOL.withdraw(address(WETH), amount, address(this));
        WETH.withdraw(amount);
        _safeTransferETH(_faucetTarget, amount);
    }

    function faucetFunds() public view returns (uint256) {
        return aWETH.balanceOf(address(this));
    }

    function claimRewards() external {
        address[] memory assets = new address[](1);
        assets[0] = address(aWETH);

        INCENTIVES.claimRewards(assets, type(uint256).max, address(this));

        uint256 amountOfWETH = WETH.balanceOf(address(this));
        POOL.deposit(address(WETH), amountOfWETH, address(this), 0);
    }

    function emergencyTokenTransfer(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }

    function emergencyEtherTransfer(address to, uint256 amount)
        external
        onlyOwner
    {
        _safeTransferETH(to, amount);
    }

    function setOwner(address newOwner) external onlyOwner {
        _owner = newOwner;
    }

    function setFaucetTarget(address newFaucetTarget) external onlyOwner {
        _faucetTarget = newFaucetTarget;
    }

    fallback() external payable {
        revert("Fallback not allowed");
    }
}
