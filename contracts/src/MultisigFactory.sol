// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import 'openzeppelin-contracts/proxy/Clones.sol';

// 0x0fa4e505896e5dcaa28df8adcde0e4b521e4b4a6
interface SafeAccount {
  function setup(
    address[] calldata _owners,
    uint256 _threshold,
    address to,
    bytes calldata data,
    address fallbackHandler,
    address paymentToken,
    uint256 payment,
    address payable paymentReceiver
  ) external;
}

contract MultisigFactory {
  event SafeCreated(address clone);
  event Initialized(address module_);

  function createSafe(
    address _implementation,
    address[] memory owners,
    uint256 threshold,
    address to,
    bytes calldata calldata_,
    address fallbackHandler,
    address paymentToken,
    uint256 payment,
    address payable paymentReceiver
  ) public returns (address instance) {
    instance = Clones.clone(_implementation);
    SafeAccount(instance).setup(
      owners,
      threshold,
      to,
      calldata_,
      fallbackHandler,
      paymentToken,
      payment,
      paymentReceiver
    );
    emit SafeCreated(instance);
  }
}
