// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import 'forge-std/Test.sol';
import '../src/modules/Batch/BatchTransactions.sol';

interface Aave {
  function deposit(
    address asset,
    uint256 amount,
    address onBehalfOf,
    uint16 referralCode
  ) external;
}

interface ERC20 {
  function approve(address _spender, uint256 _value)
    external
    returns (bool success);

  function allowance(address _owner, address _spender)
    external
    view
    returns (uint256 remaining);
}

contract BatchTest is Test {
  BatchTransaction public batch;

  function setUp() public {
    batch = new BatchTransaction();
  }

  function getApproveCalldata() public returns (bytes memory) {
    return
      abi.encodeWithSignature(
        'approve(address,uint256)',
        0x15C6b352c1F767Fa2d79625a40Ca4087Fab9a198,
        1000000
      );
  }

  function getSupplyCalldata() public returns (bytes memory) {
    return
      abi.encodeWithSignature(
        'supply(address,uint256,address,uint16)',
        0x15C6b352c1F767Fa2d79625a40Ca4087Fab9a198,
        1000000
      );
  }

  function testbatchTransaction() public {
    vm.prank(0xC3dcad3d65f72F9FE5E2D5203b5681bd8013370E);
    bytes memory approve_ = getApproveCalldata();
    address[] memory addr = new address[](1);
    bytes[] memory bytes_ = new bytes[](1);
    addr[0] = 0x65aFADD39029741B3b8f0756952C74678c9cEC93;
    bytes_[0] = approve_;
    batch.sendBatchedTransactions(addr, bytes_);
    console.log(
      ERC20(0x65aFADD39029741B3b8f0756952C74678c9cEC93).allowance(
        0xC3dcad3d65f72F9FE5E2D5203b5681bd8013370E,
        0x15C6b352c1F767Fa2d79625a40Ca4087Fab9a198
      )
    );
  }
}
