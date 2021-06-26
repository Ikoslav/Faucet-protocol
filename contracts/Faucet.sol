//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "hardhat/console.sol";

import {IERC20} from "@aave/protocol-v2/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

// TEMP SOLUTION UNTIL following file gets integrated into npm package @aave/protocol-v2 , Hardhat doesn't support imports via https.
// https://github.com/aave/protocol-v2/blob/master/contracts/interfaces/IAaveIncentivesController.sol
import "./IAaveIncentivesController.sol";
import "./IWETHGateway.sol";

import {ILendingPool} from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
//import {IWETHGateway} from "@aave/protocol-v2/contracts/misc/interfaces/IWETHGateway.sol";
import {IWETH} from "@aave/protocol-v2/contracts/misc/interfaces/IWETH.sol";

// Asi ani tuto dependency nepotrebujem  pretoze zatial len na approve ?
//import {IAToken} from "@aave/protocol-v2/contracts/interfaces/IAToken.sol";

contract Faucet {
    // Tieto private veci prepisem na public a getre vymazem ... iba zbytocna komplikacia
    address public _owner;
    address public _faucetTarget;

    uint256 public _dailyLimit; // In WEI
    uint256 public _CDStartTimestamp;
    uint256 public _CDDuration; // In seconds

    uint256 public constant SECONDS_IN_A_DAY = 1 days; // 86400 seconds

    ILendingPool public immutable LENDING_POOL; // budem potreboval len address

    // TEORETICKY NEPOTREBUJEM ?????? mozem ist cez lending pool  ale to by bolo asi komplikovanejsie ?
    // Uvazujem nad tym ci to ale tak nespravit
    IWETHGateway public immutable WETH_GATEWAY;

    IAaveIncentivesController public immutable INCENTIVES_CONTROLLER;
    IERC20 public immutable aWETH;

    IWETH public immutable WETH; // vyuzijem pri claimovani incentives

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

        WETH = IWETH(weth);

        // AUTHOREZE WETHGateway to use aWETH owned by this contract
        aWETH = IERC20(aweth);
        IERC20(aweth).approve(aaveWETHGateway, uint256(-1));
    }

    modifier onlyOwner {
        require(msg.sender == _owner, "Only owner can call this function.");
        _;
    }

    receive() external payable {
        //  deposit(); Cannot be here
    }

    // Mozno vyuzijem ?
    //   receive() external payable {
    //     if (msg.sender != address(token)) {
    //         depositETH();
    //     } // else: WETH is sending us back ETH, so don't do anything (to avoid recursion)
    // }

    function deposit() external payable {
        WETH_GATEWAY.depositETH{value: msg.value}(
            address(LENDING_POOL),
            address(this),
            0
        );

        // WETH.deposit{value: msg.value}();
        // LENDING_POOL.deposit(address(WETH), msg.value, address(this), 0);
    }

    function doFaucetDrop(uint256 amount) external {
        // require NOT ON COOLDOWN
        require((block.timestamp - _CDDuration) <= _CDStartTimestamp);
        // require AMOUNT IN DAILY LIMIT
        require(amount <= _dailyLimit);
        // require ENOUGH aTOKENS
        require(faucetFunds() >= amount);

        // Update cooldown state
        _CDStartTimestamp = block.timestamp;
        _CDDuration = SECONDS_IN_A_DAY / (_dailyLimit / amount);

        WETH_GATEWAY.withdrawETH(address(LENDING_POOL), amount, _faucetTarget);
    }

    function faucetFunds() public view returns (uint256) {
        return aWETH.balanceOf(address(this));
    }

    function claimRewards() external {
        address[] memory assets = new address[](1);
        assets[0] = address(aWETH);

        uint256 rewardsClaimed = INCENTIVES_CONTROLLER.claimRewards(
            assets,
            uint256(-1),
            address(this)
        );

        // Need to chcek because incentives can change in the future.
        // If reward is WETH we deposit it for compounding effect.
        if (INCENTIVES_CONTROLLER.REWARD_TOKEN() == address(WETH)) {
            LENDING_POOL.deposit(
                address(WETH),
                rewardsClaimed,
                address(this),
                0
            );
        }
    }

    function withdrawFunds() external onlyOwner {
        // ZDVOJENY KOD :(
        address[] memory assets = new address[](1);
        assets[0] = address(aWETH);

        uint256 rewardsClaimed = INCENTIVES_CONTROLLER.claimRewards(
            assets,
            uint256(-1), // Everything
            address(this)
        );

        // // Need to chcek because incentives can change in the future.
        // // If reward is WETH we deposit it for compounding effect.
        // if (INCENTIVES_CONTROLLER.REWARD_TOKEN() == address(WETH)) {
        //     LENDING_POOL.deposit(
        //         address(WETH),
        //         rewardsClaimed,
        //         address(this),
        //         0
        //     );
        // }

        // WETH ZMENIM ZA ETH
        WETH.withdraw(IERC20(address(WETH)).balanceOf(address(this)));

        WETH_GATEWAY.withdrawETH(
            address(LENDING_POOL),
            uint256(-1),
            _faucetTarget
        );
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

    fallback() external payable {
        revert("Fallback not allowed");
    }
}
