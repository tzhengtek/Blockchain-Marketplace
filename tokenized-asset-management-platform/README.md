# Tokenized Asset Management Platform

A KYC-enabled asset management platform on BSC Testnet with NFT and ERC20 token support.

## Deployed Contracts (BSC Testnet)

### Core Contracts
- **KYCRegistry**: `0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe`
  - [View on BscScan](https://testnet.bscscan.com/address/0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe)

- **AssetNFT**: `0xad6eD2CbBFB45Da005111356Fe280d10a7044371`
  - [View on BscScan](https://testnet.bscscan.com/address/0xad6eD2CbBFB45Da005111356Fe280d10a7044371)

- **AssetToken (ATK)**: `0x3DC23E01d7B7555970823274054047E521290C23`
  - [View on BscScan](https://testnet.bscscan.com/address/0x3DC23E01d7B7555970823274054047E521290C23)

### PancakeSwap V2 Liquidity Pool
- **BNB/ATK Pair**: `0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7`
  - [View on BscScan](https://testnet.bscscan.com/address/0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7)
  - [View on PancakeSwap](https://pancakeswap.finance/info/v2/pairs/0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7)
  - **Liquidity**: 10,000 ATK + 0.1 BNB
  - **Initial Price**: 1 ATK = 0.00001 BNB

### Owner Address
- **Deployer/Owner**: `0x99DaBE97d110B9339bC7E74392D1f74cE3f7F02c`

### KYC Verified Addresses
- Deployer: `0x99DaBE97d110B9339bC7E74392D1f74cE3f7F02c`
- PancakeSwap Router: `0xD99D1c33F9fC3444f8101754aBC46c52416550D1`
- Liquidity Pair: `0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7`

## Features

- KYC-verified transfers for both NFTs and tokens
- Only KYC-verified users can send or receive tokens/NFTs
- PancakeSwap V2 integration for token trading
- Asset metadata tracking for NFTs

## Documentation

- [Wagmi Swap Guide](./WAGMI_SWAP_GUIDE.md) - Frontend integration with wagmi and WalletConnect
- [Liquidity Pool Guide](./LIQUIDITY_POOL_GUIDE.md) - Complete guide for PancakeSwap V2 integration
- [Deployment Guide (BSC)](./DEPLOYMENT_BSC.md)
- [Deployment Guide (General)](./DEPLOYMENT.md)
- [Scripts Guide](./SCRIPTS_GUIDE.md)
- [Quick Start](./QUICKSTART.md)
- [Verification Guide](./VERIFICATION.md)

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

Documentation: https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
