# Grexie Signchain Contracts

A collection of Solidity smart contracts for interacting with the Signchain ecosystem, enabling secure and scalable blockchain transaction signing and management within decentralized applications (dApps) and private infrastructure.

[![npm version](https://img.shields.io/npm/v/@grexie/signchain-contracts.svg?style=flat)](https://www.npmjs.com/package/@grexie/signchain-contracts)  
[Signchain Documentation](https://signchain.net/docs) | [API Reference](https://signchain.net/docs/api-reference)

---

## Overview

`@grexie/signchain-contracts` offers a set of Solidity contracts to facilitate seamless integration with Signchain’s hosted and self-hosted vaults and API services, focusing on private key management and secure transaction signing. This package allows developers to incorporate secure and efficient blockchain operations within their decentralized applications and infrastructure.

## Installation

Install the package using npm:

```bash
npm install @grexie/signchain-contracts
```

or with Yarn:

```bash
yarn add @grexie/signchain-contracts
```

## Usage

1. **Importing Contracts**  
   You can import the necessary contracts into your Solidity code:

   ```solidity
   pragma solidity ^0.8.0;

   import "@grexie/signchain-contracts/Signable.sol";
   import "@grexie/signchain-contracts/ISignable.sol";
   ```

2. **Creating a Signable Contract**  
   Use the `Signable` contract to securely set up and manage a signer wallet, providing access control and transaction authorization capabilities. Ensure your `setSigner` required method is defined to allow for wallet rotation, and that it is secured using OpenZeppelin's `onlyOwner` modifier.
   
   ```solidity
   contract MyContract is Ownable, Signable {
     constructor(address signer_) {
       _setSigner(signer_);
     }
   
     function setSigner(address signer_) external onlyOwner {
       _setSigner(signer_);
     }
   }
   ```

3. **Secure Transaction Signing**
   Enable secure transaction signing through Signchain’s Vault by verifying signatures on critical functions, ensuring that sensitive operations remain safeguarded within your infrastructure.

   ```solidity
   function mint(uint256 tokens, Signature calldata signature)
     external
     verifySignature(
       abi.encode(this.mint.selector, tokens),
       signature
     ) {
     _mint(msg.sender, tokens);
   }
   ```

## Documentation

For a full overview of available functions, setup instructions, and usage examples, see the [Signchain Documentation](https://signchain.net/docs) and [API Reference](https://signchain.net/docs/api-reference).

## License

MIT License.