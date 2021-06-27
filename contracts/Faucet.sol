//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IAaveIncentivesController} from "./interfaces/IAaveIncentivesController.sol";
import {ILendingPool} from "./interfaces/ILendingPool.sol";
import {IWETH} from "./interfaces/IWETH.sol";

contract Faucet {
    address public owner;
    address public faucetTarget;

    uint256 public dailyLimit;
    uint256 public cooldownStartTimestamp;
    uint256 public cooldownDuration;

    ILendingPool public immutable POOL;
    IAaveIncentivesController public immutable INCENTIVES;

    IERC20 public immutable aWETH;
    IWETH public immutable WETH;

    constructor(
        uint256 dailyLimit_,
        address faucetTarget_,
        address aaveLendingPool,
        address aaveIncentivesController,
        address aWETH_,
        address WETH_
    ) {
        owner = msg.sender;

        faucetTarget = faucetTarget_;

        dailyLimit = (dailyLimit_ == 0) ? 1 : dailyLimit_; // Ensure non zero daily limit
        cooldownStartTimestamp = 0;
        cooldownDuration = 0;

        POOL = ILendingPool(aaveLendingPool);
        INCENTIVES = IAaveIncentivesController(aaveIncentivesController);

        WETH = IWETH(WETH_);
        aWETH = IERC20(aWETH_);

        IERC20(WETH_).approve(aaveLendingPool, type(uint256).max); // Needed approval
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    receive() external payable {
        if (msg.sender != address(WETH)) {
            WETH.deposit{value: msg.value}();
            POOL.deposit(address(WETH), msg.value, address(this), 0);
        } // else: WETH is sending us back ETH, so don't do anything (to avoid recursion)
    }

    function doFaucetDrop(uint256 amount) external {
        require(
            (block.timestamp - cooldownDuration) >= cooldownStartTimestamp,
            "On cooldown."
        );
        require(amount > 0, "Amount cannot be zero.");
        require(amount <= dailyLimit, "Exceeing daily limit.");
        require(amount <= faucetFunds(), "Not enough funds.");

        cooldownStartTimestamp = block.timestamp;
        cooldownDuration = 1 days / (dailyLimit / amount);

        POOL.withdraw(address(WETH), amount, address(this));
        WETH.withdraw(amount);
        safeTransferETH(faucetTarget, amount);
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

    function rewardsAmount() public view returns (uint256) {
        address[] memory assets = new address[](1);
        assets[0] = address(aWETH);

        return INCENTIVES.getRewardsBalance(assets, address(this));
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
        safeTransferETH(to, amount);
    }

    function safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, "ETH transfer failed.");
    }

    function setDailyLimit(uint256 newDailyLimit) external onlyOwner {
        require(newDailyLimit > 0, "Daily limit cannot be 0.");
        dailyLimit = newDailyLimit;
    }

    function setOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    function setFaucetTarget(address newFaucetTarget) external onlyOwner {
        faucetTarget = newFaucetTarget;
    }

    fallback() external payable {
        revert("Fallback not allowed.");
    }
}
