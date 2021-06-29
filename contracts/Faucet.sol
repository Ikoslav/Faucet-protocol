//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IAaveIncentivesController} from "./interfaces/IAaveIncentivesController.sol";
import {ILendingPool} from "./interfaces/ILendingPool.sol";
import {IWETH} from "./interfaces/IWETH.sol";

contract Faucet {
    address public faucetOwner;
    address public faucetHandler;
    address public faucetTarget;

    uint256 public dailyLimit;
    uint256 public cooldownEnds;

    ILendingPool public immutable lendingPool;
    IAaveIncentivesController public immutable incentivesController;

    IERC20 public immutable aWETH;
    IWETH public immutable weth;

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
    string public constant ONLY_FAUCET_HANDLER = "9"; // 'Only faucet handler can call this function.'

    constructor(
        address faucetOwner_,
        address faucetHandler_,
        address faucetTarget_,
        uint256 dailyLimit_,
        address aaveLendingPool,
        address aaveIncentivesController,
        address aweth_,
        address weth_
    ) {
        faucetOwner = faucetOwner_;
        faucetHandler = faucetHandler_;
        faucetTarget = faucetTarget_;

        dailyLimit = (dailyLimit_ == 0) ? 1 : dailyLimit_; // Ensure non zero daily limit
        cooldownEnds = 0;

        lendingPool = ILendingPool(aaveLendingPool);
        incentivesController = IAaveIncentivesController(
            aaveIncentivesController
        );

        weth = IWETH(weth_);
        aWETH = IERC20(aweth_);

        IERC20(weth_).approve(aaveLendingPool, type(uint256).max); // Needed approval

        assetsOfInterest = new address[](1); // My only asset of interest is this aToken
        assetsOfInterest[0] = address(aweth_);
    }

    modifier onlyOwner {
        require(msg.sender == faucetOwner, ONLY_OWNER);
        _;
    }

    receive() external payable {
        if (msg.sender != address(weth)) {
            weth.deposit{value: msg.value}();
            lendingPool.deposit(address(weth), msg.value, address(this), 0);
        } // else: weth is sending us back ETH, so don't do anything (to avoid recursion)
    }

    function doFaucetDrop(uint256 amount) external {
        require(msg.sender == faucetHandler, ONLY_FAUCET_HANDLER);
        require(cleablock.timestamp >= cooldownEnds, ON_COOLDOWN);
        require(amount > 0, AMOUNT_CANNOT_BE_ZERO);
        require(amount <= dailyLimit, EXCEEDING_DAILY_LIMIT);
        require(amount <= faucetFunds(), NOT_ENOUGH_FUNDS);

        cooldownEnds = block.timestamp + (1 days / (dailyLimit / amount));

        lendingPool.withdraw(address(weth), amount, address(this));
        weth.withdraw(amount);

        safeTransferETH(faucetTarget, amount);
    }

    function faucetFunds() public view returns (uint256) {
        return aWETH.balanceOf(address(this));
    }

    function claimRewards() external {
        incentivesController.claimRewards(
            assetsOfInterest,
            type(uint256).max,
            address(this)
        );

        uint256 amountOfWETH = weth.balanceOf(address(this));

        if (amountOfWETH > 0) {
            lendingPool.deposit(address(weth), amountOfWETH, address(this), 0); // 0 Deposit would throw error.
        }
    }

    function rewardsAmount() public view returns (uint256) {
        return
            incentivesController.getRewardsBalance(
                assetsOfInterest,
                address(this)
            );
    }

    function tokenTransfer(
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

    function setFaucetHandler(address newFaucetHandler) external onlyOwner {
        faucetHandler = newFaucetHandler;
    }

    function setFaucetOwner(address newFaucetOwner) external onlyOwner {
        faucetOwner = newFaucetOwner;
    }

    function setFaucetTarget(address newFaucetTarget) external onlyOwner {
        faucetTarget = newFaucetTarget;
    }

    fallback() external payable {
        revert(NO_FALLBACK);
    }
}
