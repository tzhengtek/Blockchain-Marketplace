# Deployment Guide

This guide explains how to deploy the KYC-enabled Asset Management contracts using Foundry.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- A funded wallet with ETH/MATIC for gas fees
- RPC URL for your target network

## Setup

1. **Copy the environment file**
   ```bash
   cp .env.example .env
   ```

2. **Configure your `.env` file**

   Edit the `.env` file and add your private key and RPC URL:
   ```bash
   # Your wallet private key (NEVER commit this!)
   PRIVATE_KEY=your_private_key_without_0x_prefix

   # RPC URL for your target network
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
   ```

   ⚠️ **SECURITY WARNING**: Never commit your `.env` file or share your private key!

## Getting Your Private Key

### From MetaMask:
1. Click on the three dots menu
2. Select "Account Details"
3. Click "Show Private Key"
4. Enter your password
5. Copy the private key (remove the `0x` prefix)

### From Other Wallets:
- Check your wallet's documentation for exporting private keys

## Deployment Commands

### 1. Test the deployment script locally (Dry run)
```bash
forge script script/Deploy.s.sol:DeployScript
```

### 2. Deploy to Localhost (Anvil)
```bash
# Start local node in a separate terminal
anvil

# Deploy to localhost
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast
```

### 3. Deploy to Sepolia Testnet
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### 4. Deploy to Ethereum Mainnet
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $MAINNET_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### 5. Deploy to Polygon Mumbai Testnet
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $MUMBAI_RPC_URL \
  --broadcast \
  --verify \
  --verifier-url https://api-testnet.polygonscan.com/api \
  -vvvv
```

### 6. Deploy to Polygon Mainnet
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $POLYGON_RPC_URL \
  --broadcast \
  --verify \
  --verifier-url https://api.polygonscan.com/api \
  -vvvv
```

## Command Flags Explained

- `--rpc-url`: The RPC endpoint for the network
- `--broadcast`: Actually send the transactions (without this, it's a dry run)
- `--verify`: Verify contracts on Etherscan/Polygonscan
- `--verifier-url`: Block explorer API URL (for non-Ethereum networks)
- `-vvvv`: Very verbose output (useful for debugging)

## What Gets Deployed

The script deploys 3 contracts in this order:

1. **KYCRegistry** - Manages KYC verification and authorized addresses
2. **AssetNFT** - ERC721 NFT contract for tokenized assets
3. **AssetToken** - ERC20 token contract

All contracts are deployed with your wallet address as the owner.

## After Deployment

The deployment script will output the addresses of all deployed contracts:

```
=== Deployment Summary ===
KYCRegistry: 0x...
AssetNFT: 0x...
AssetToken: 0x...
Owner: 0x...
```

**Save these addresses!** You'll need them to interact with the contracts.

## Verify Contracts Manually (if auto-verification fails)

### Ethereum/Sepolia:
```bash
forge verify-contract \
  --chain-id 11155111 \
  --compiler-version v0.8.30 \
  --constructor-args $(cast abi-encode "constructor(address)" "YOUR_OWNER_ADDRESS") \
  CONTRACT_ADDRESS \
  src/KYCRegistry.sol:KYCRegistry \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### Polygon:
```bash
forge verify-contract \
  --chain-id 137 \
  --compiler-version v0.8.30 \
  --constructor-args $(cast abi-encode "constructor(address)" "YOUR_OWNER_ADDRESS") \
  CONTRACT_ADDRESS \
  src/KYCRegistry.sol:KYCRegistry \
  --verifier-url https://api.polygonscan.com/api \
  --etherscan-api-key $POLYGONSCAN_API_KEY
```

## Common Network Chain IDs

- Ethereum Mainnet: `1`
- Sepolia Testnet: `11155111`
- Polygon Mainnet: `137`
- Mumbai Testnet: `80001`
- Localhost (Anvil): `31337`

## Troubleshooting

### Issue: "Insufficient funds"
- Make sure your wallet has enough ETH/MATIC for gas fees

### Issue: "Nonce too low"
- Reset your transaction nonce in MetaMask or wait for pending transactions

### Issue: "RPC error"
- Check your RPC URL is correct
- Try a different RPC provider (Alchemy, Infura, QuickNode)

### Issue: "Verification failed"
- Wait a few minutes and try manual verification
- Make sure you're using the correct compiler version (0.8.30)

## Gas Estimates

Approximate gas costs for deployment:
- KYCRegistry: ~500,000 gas
- AssetNFT: ~2,500,000 gas
- AssetToken: ~1,500,000 gas
- **Total: ~4,500,000 gas**

At 30 gwei and $2000 ETH: ~$270 total

## Security Best Practices

1. ✅ Never commit `.env` file
2. ✅ Use a hardware wallet for mainnet deployments
3. ✅ Test on testnets first
4. ✅ Verify contracts on block explorers
5. ✅ Run `forge test` before deployment
6. ✅ Keep your private keys secure

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Forge Script Documentation](https://book.getfoundry.sh/tutorials/solidity-scripting)
- [Alchemy RPC](https://www.alchemy.com/)
- [Infura RPC](https://www.infura.io/)
