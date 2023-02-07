// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// 0xaca091817aa8fd7863833fea1bf9f8f500eaf795

interface IERC20 {
  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external returns (bool);

  function approve(address spender, uint256 amount) external returns (bool);
}

interface IAavePool {
  function deposit(
    address asset,
    uint256 amount,
    address onBehalfOf,
    uint16 referralCode
  ) external;

  function borrow(
    address asset,
    uint256 amount,
    uint256 interestRateMode,
    uint16 referralCode,
    address onBehalfOf
  ) external;
}

contract BatchTransaction {
  event TransactionComplete(address to_, bytes data_);
  event LeverageDone(
    address supplyToken,
    address borrowToken,
    uint256 supplyAmount,
    uint256 borrowAmount
  );

  function sendBatchedTransactions(
    address[] memory _address,
    bytes[] calldata _data
  ) public {
    uint256 len_ = _address.length;
    require(len_ == _data.length, 'invalid-length');

    for (uint256 i = 0; i < len_; i++) {
      address to_ = _address[i];
      bytes memory data_ = _data[i];
      (bool sent, ) = _address[i].delegatecall(_data[i]);
      require(sent, 'Failed to send Ether');

      emit TransactionComplete(to_, data_);
    }
  }
}
