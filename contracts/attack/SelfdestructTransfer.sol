// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract SelfdestructTransfer {
    constructor() payable {}

    function destroyAndTransfer(address payable to) external payable {
        selfdestruct(to);
    }
}
