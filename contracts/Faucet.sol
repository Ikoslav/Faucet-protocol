//SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "hardhat/console.sol";

import {ILendingPool} from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import {IWETHGateway} from "@aave/protocol-v2/contracts/misc/interfaces/IWETHGateway.sol";
import {IWETH} from "@aave/protocol-v2/contracts/misc/interfaces/IWETH.sol";
import {IAToken} from "@aave/protocol-v2/contracts/interfaces/IAToken.sol";

import {IAaveIncentivesController} from "@aave/protocol-v2/contracts/interfaces/IAaveIncentivesController.sol";

// IDELNE TOTO CHCEM MAT !
// https://github.com/aave/protocol-v2/blob/master/contracts/interfaces/IAaveIncentivesController.sol
// preco nema ktualnu verziu ?

contract Faucet {
    address private _owner;
    address private _botwallet;

    ILendingPool private immutable _aaveLendingPool;
    IWETHGateway private _aaveWETHGateway;
    IAaveIncentivesController private _aaveIncentivesController;
    IAToken private _aaveamWMATIC; // Interest bearing token

    IWETH private immutable _WMATIC; // wrapped matic

    modifier onlyOwner {
        require(msg.sender == _owner, "Only owner can call this function.");
        _;
    }

    constructor(
        address botwallet,
        address aaveLendingPool,
        address aaveWETHGateway,
        address aaveIncentivesController,
        address aaveamWMATIC,
        address WMATIC
    ) public {
        _owner = msg.sender;
        _botwallet = botwallet; // Maybe Validate ?

        _aaveLendingPool = ILendingPool(aaveLendingPool);
        _aaveWETHGateway = IWETHGateway(aaveWETHGateway);
        _aaveIncentivesController = IAaveIncentivesController(aaveIncentivesController);
        _aaveamWMATIC = IAToken(aaveamWMATIC);

        _WMATIC = IWETH(WMATIC);
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function hotwallet() public view returns (address) {
        return _botwallet;
    }
}