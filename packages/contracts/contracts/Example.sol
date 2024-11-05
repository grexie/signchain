// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import './Signable.sol';

contract Example is Ownable, Signable {
  address private _signer;

  struct Struct {
    uint256 test1;
    uint256 test2;
    string test3;
  }

  event Test(
    bytes4 selector,
    address test1,
    Struct test2,
    bytes32 test3,
    Signature signature
  );

  constructor() Ownable(msg.sender) {
    
  }

  function setSigner(address signer_) external onlyOwner {
    _setSigner(signer_);
  }

  function testA(
    address test1,
    Struct calldata test2,
    bytes32 test3,
    Signature calldata signature
  )
    external
    verifySignature(
      abi.encode(this.testA.selector, test1, test2, test3),
      signature
    )
  {
    emit Test(this.testA.selector, test1, test2, test3, signature);
  }

  function testB(
    address test1,
    Struct calldata test2,
    Signature calldata signature,
    bytes32 test3
  )
    external
    verifySignature(
      abi.encode(this.testB.selector, test1, test2, test3),
      signature
    )
  {
    emit Test(this.testB.selector, test1, test2, test3, signature);
  }

  function testC(
    Signature calldata signature,
    address test1,
    Struct calldata test2,
    bytes32 test3
  )
    external
    verifySignature(
      abi.encode(this.testC.selector, test1, test2, test3),
      signature
    )
  {
    emit Test(this.testC.selector, test1, test2, test3, signature);
  }
}