# RealVault - Tokenized Asset Management Platform

A KYC-enabled asset management platform on BSC Testnet featuring **RealVault Protocol (RVP)** token and **RealVault Assets (RVA)** NFTs.

## Deployed Contracts (BSC Testnet)

### Core Contracts
- **KYCRegistry**: `0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe`
  - [View on BscScan](https://testnet.bscscan.com/address/0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe)

- **RealVault Assets (RVA)**: `0x5d44D4D77FFc1eb62bcC361F0FA96122620F03B8`
  - NFT contract for tokenized real-world assets
  - [View on BscScan](https://testnet.bscscan.com/address/0x5d44D4D77FFc1eb62bcC361F0FA96122620F03B8)

- **RealVault Protocol (RVP)**: `0x9754547A1315C041ABE4682D9301EEbF591C7cB3`
  - ERC20 utility token for the platform
  - [View on BscScan](https://testnet.bscscan.com/address/0x9754547A1315C041ABE4682D9301EEbF591C7cB3)

- **AssetMarketplace**: `0x5E801F0D03675912D0C123eAeE28f428EE7aace6`
  - NFT marketplace with 2.5% platform fee
  - [View on BscScan](https://testnet.bscscan.com/address/0x5E801F0D03675912D0C123eAeE28f428EE7aace6)

### PancakeSwap V2 Liquidity Pool
- **BNB/RVP Pair**: `0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7`
  - [View on BscScan](https://testnet.bscscan.com/address/0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7)
  - [View on PancakeSwap](https://pancakeswap.finance/info/v2/pairs/0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7)
  - **Liquidity**: 10,000 RVP + 0.1 BNB
  - **Initial Price**: 1 RVP = 0.00001 BNB

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

- **[📜 Scripts Guide](./script/SCRIPTS_README.md)** - Complete guide with all script commands
- [Wagmi Swap Guide](./WAGMI_SWAP_GUIDE.md) - Frontend integration with wagmi and WalletConnect
- [Liquidity Pool Guide](./LIQUIDITY_POOL_GUIDE.md) - Complete guide for PancakeSwap V2 integration
- [Deployment Guide (BSC)](./DEPLOYMENT_BSC.md)
- [Deployment Guide (General)](./DEPLOYMENT.md)
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
