// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

interface IWETH {
    function deposit() external payable;

    function withdraw(uint256) external;

    function balanceOf(address account) external view returns (uint256);
}
