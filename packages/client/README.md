# @grexie/signchain - Signchain JavaScript Client Library

A Node.js client library for interacting with Signchain’s API, enabling secure blockchain transaction signing, wallet management, and more. This library is designed for backend use only, ensuring your API keys and sensitive data remain secure.

[![npm version](https://img.shields.io/npm/v/@grexie/signchain.svg?style=flat)](https://www.npmjs.com/package/@grexie/signchain)  
[Signchain Documentation](https://signchain.net/docs) | [API Reference](https://signchain.net/docs/api-reference)

---

## Overview

`@grexie/signchain` provides easy-to-use functions for working with Signchain’s self-hosted and hosted vaults. You can manage wallets, sign transactions, and securely handle blockchain operations without exposing your keys. This client is optimized for Ethereum-compatible chains and uses the `Sign In With Ethereum` protocol for enhanced security.

## Installation

Install the package using npm:

```bash
npm install @grexie/signchain
```

or with Yarn:

```bash
yarn add @grexie/signchain
```

## Usage

### Setting Up the Client

To get started, initialize the `SignchainClient` with your API key and vault ID. For additional options, you can configure the base URL of the API.

```typescript
import { SignchainClient } from '@grexie/signchain';

const client = new SignchainClient({
  apiKey: 'your-api-key',
  vaultId: 'your-vault-id',
});
```

### Wallet Management

1. **Create a Wallet**

   ```typescript
   const wallet = await client.createWallet({ name: "My Wallet" });
   console.log("Wallet created:", wallet);
   ```

2. **Get a Wallet**

   Retrieve an existing wallet by its Ethereum address.

   ```typescript
   const wallet = await client.getWallet("0xYourWalletAddress");
   console.log("Retrieved wallet:", wallet);
   ```

3. **List Wallets**

   List all wallets associated with your vault, with pagination options.

   ```typescript
   const wallets = await client.listWallets({ offset: 0, count: 10 });
   console.log("Wallets:", wallets);
   ```

4. **Update a Wallet**

   Update specific attributes of a wallet, such as its name.

   ```typescript
   const updatedWallet = await client.updateWallet("0xYourWalletAddress", { name: "Updated Wallet Name" });
   console.log("Updated wallet:", updatedWallet);
   ```

5. **Expire and Unexpire Wallet**

   Temporarily disable or re-enable wallets in your vault.

   ```typescript
   await client.expireWallet("0xYourWalletAddress");
   await client.unexpireWallet("0xYourWalletAddress");
   ```

### Transaction Signing

Sign transactions securely using Signchain’s API, keeping your private keys on your own infrastructure.

```typescript
const signedTx = await client.sign({
  contract: "0xYourContractAddress",
  chain: "ethereum",
  sender: "0xYourSenderAddress",
  abi: contractABI,
  functionName: "myFunction",
  args: [/* function arguments */],
});
console.log("Signed transaction:", signedTx);
```

## API Documentation

For detailed documentation of all available methods and endpoints, check out the [Signchain API Reference](https://signchain.net/docs/api-reference).

## Supported Chains

- **Ethereum**
- **Sepolia**
- **Binance Smart Chain (BSC)**
- **Polygon**
- **Local Development (for testing)**

## Environment Variables

For enhanced security, set the following environment variables:

- `SIGNCHAIN_API_KEY`: Your API key from Signchain.
- `SIGNCHAIN_VAULT_ID`: The unique ID of your Signchain vault.

## License

This project is licensed under the MIT License.

## Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) for more information on how to get involved.

---

Build with confidence on Signchain, where secure blockchain operations are made simple.