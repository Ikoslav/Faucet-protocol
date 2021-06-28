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

    address[] private assetsOfInterest;

    // ERROS
    string public constant ONLY_OWNER = "1"; // 'Only owner can call this function.'
    string public constant NO_FALLBACK = "2"; // 'Fallback not allowed.'
    string public constant VALUE_TRANSFER_FAILED = "3"; // 'Value transfer failed.'
    string public constant ON_COOLDOWN = "4"; // 'On cooldown.'
    string public constant EXCEEDING_DAILY_LIMIT = "5"; // 'Exceeing daily limit.'
    string public constant NOT_ENOUGH_FUNDS = "6"; // 'Not enough funds.'
    string public constant AMOUNT_CANNOT_BE_ZERO = "7"; // 'Amount cannot be zero.'
    string public constant DAILY_LIMIT_CANNOT_BE_ZERO = "8"; // 'Daily limit cannot be 0.'

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

        assetsOfInterest = new address[](1); // My only asset of interest is this aToken
        assetsOfInterest[0] = address(aWETH_);
    }

    modifier onlyOwner {
        require(msg.sender == owner, ONLY_OWNER);
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
            ON_COOLDOWN
        );
        require(amount > 0, AMOUNT_CANNOT_BE_ZERO);
        require(amount <= dailyLimit, EXCEEDING_DAILY_LIMIT);
        require(amount <= faucetFunds(), NOT_ENOUGH_FUNDS);

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
        INCENTIVES.claimRewards(
            assetsOfInterest,
            type(uint256).max,
            address(this)
        );

        uint256 amountOfWETH = WETH.balanceOf(address(this));

        if (amountOfWETH > 0) {
            // deposition 0 would throw error.
            POOL.deposit(address(WETH), amountOfWETH, address(this), 0);
        }
    }

    function rewardsAmount() public view returns (uint256) {
        return INCENTIVES.getRewardsBalance(assetsOfInterest, address(this));
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
        require(success, VALUE_TRANSFER_FAILED);
    }

    function setDailyLimit(uint256 newDailyLimit) external onlyOwner {
        require(newDailyLimit > 0, DAILY_LIMIT_CANNOT_BE_ZERO);
        dailyLimit = newDailyLimit;
    }

    function setOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    function setFaucetTarget(address newFaucetTarget) external onlyOwner {
        faucetTarget = newFaucetTarget;
    }

    fallback() external payable {
        revert(NO_FALLBACK);
    }
}
