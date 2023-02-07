// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import 'openzeppelin-contracts/proxy/Clones.sol';

interface Account {
  function addModule(bytes4[] memory sigs, address module) external;

  function initialize(address factory_, address owner_) external;
}

contract AccountFactory {
  event cloneCreated(address clone);
  event moduleAdded(address module_);

  /**
   * @dev creates a clone of the account contract and adds modules to it
   * @param _implementation the address of the base account contract
   * @param modules_ the modules to be added to the account
   * @param sigs_ the signatures of the functions to be called by the modules
   * @return instance the address of the newly created accountS
   */
  function createClone(
    address _implementation,
    address[] memory modules_,
    bytes4[][] memory sigs_
  ) public returns (address instance) {
    instance = Clones.clone(_implementation);

    //initialize the account
    Account(instance).initialize(address(this), msg.sender);
    emit cloneCreated(instance);

    uint256 len_ = modules_.length;

    for (uint256 i = 0; i < len_; ++i) {
      Account(instance).addModule(sigs_[i], modules_[i]);
      emit moduleAdded(modules_[i]);
    }
  }
}
