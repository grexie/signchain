// SPDX-License-Identifier: MIT
pragma solidity >0.5.16;

interface ISignable {
  function uniq() external view returns (bytes32);

  function signer() external view returns (address);
  function setSigner(address signer) external;
}