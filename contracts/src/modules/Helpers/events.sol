// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Events {
  event OwnerUpdated(address new_);
  event AuthsUpdated(address new_, bool enabled);
  event ModuleUpdated(address module_, bytes4 sig_);
  event ModuleAdded(address module_, bytes4 sig_);
  event LeverageDone(
    address supplyToken,
    address borrowToken,
    uint256 supplyAmount,
    uint256 borrowAmount
  );
  event SupplyDone(
    address supplyToken,
    uint256 supplyAmount
  );
  event BatchSend(address to, uint256 amount, address token);
}
