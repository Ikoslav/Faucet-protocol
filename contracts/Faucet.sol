//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "hardhat/console.sol";

import {IERC20} from "@aave/protocol-v2/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

// TEMP SOLUTION UNTIL following file gets integrated into npm package @aave/protocol-v2 , Hardhat doesn't support imports via https.
// https://github.com/aave/protocol-v2/blob/master/contracts/interfaces/IAaveIncentivesController.sol
import "./IAaveIncentivesController.sol";

import {ILendingPool} from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import {IWETHGateway} from "@aave/protocol-v2/contracts/misc/interfaces/IWETHGateway.sol";
import {IWETH} from "@aave/protocol-v2/contracts/misc/interfaces/IWETH.sol";
import {IAToken} from "@aave/protocol-v2/contracts/interfaces/IAToken.sol";

contract Faucet {
    address private _owner;
    address private _faucetTarget;

    uint256 private _dailyLimit; // In WEI
    uint256 private _cooldownStartTimestamp;
    uint256 private _cooldownDuration; // In seconds

    ILendingPool private immutable LENDING_POOL;
    IWETHGateway private immutable WETH_GATEWAY;
    IAaveIncentivesController private immutable INCENTIVES_CONTROLLER;
    IAToken private immutable aWETH;
    IWETH private immutable WETH;

    constructor(
        uint256 dailyLimit,
        address faucetTarget,
        address aaveLendingPool,
        address aaveWETHGateway,
        address aaveIncentivesController,
        address aweth,
        address weth
    ) public {
        _owner = msg.sender;

        _dailyLimit = dailyLimit;
        _faucetTarget = faucetTarget;

        LENDING_POOL = ILendingPool(aaveLendingPool);
        WETH_GATEWAY = IWETHGateway(aaveWETHGateway);
        INCENTIVES_CONTROLLER = IAaveIncentivesController(
            aaveIncentivesController
        );

        aWETH = IAToken(aweth);
        WETH = IWETH(weth);

        // AUTHOREZE WETHGateway to use aWETH owned by this contract
        IAToken(aweth).approve(aaveWETHGateway, uint256(-1));
    }

    modifier onlyOwner {
        require(msg.sender == _owner, "Only owner can call this function.");
        _;
    }
    modifier notOnCooldown {
        require(
            (block.timestamp - _cooldownDuration) <= _cooldownStartTimestamp,
            "Faucet is on cooldown."
        );
        _;
    }

    receive() external payable {
        // Cannot be here
        // deposit();
    }

    function deposit() external payable {
        // Deposit to aave
        // ZLY SOURCE CODE !
        //  WETH_GATEWAY.depositETH{value: msg.value}(address(this), 0);
    }

    function doFaucetDrop(uint256 amount) external notOnCooldown {
        // Update cooldown  start time and  duration , duration is based on used daily limit
        // ZLY SOURCE CODE !
        //  WETH_GATEWAY.withdrawETH(amount, _faucetTarget);
    }

    // TODO Claim rewards separate  function ?

    // function _safeTransferETH(address to, uint256 value) private {
    //     (bool success, ) = to.call{value: value}(new bytes(0));
    //     require(success, "ETH_TRANSFER_FAILED");
    // }

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
        //_safeTransferETH(to, amount);
        (bool success, ) = to.call{value: amount}(new bytes(0));
        require(success, "ETH_TRANSFER_FAILED");
    }

    function setOwner(address newOwner) external onlyOwner {
        _owner = newOwner;
    }

    function setFaucetTarget(address newFaucetTarget) external onlyOwner {
        _faucetTarget = newFaucetTarget;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function faucetTarget() public view returns (address) {
        return _faucetTarget;
    }

    function dailyLimit() public view returns (uint256) {
        return _dailyLimit;
    }

    fallback() external payable {
        revert("Fallback not allowed");
    }
}
