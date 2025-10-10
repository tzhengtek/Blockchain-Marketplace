# Quick Start - Deploy to BSC Testnet

The fastest way to deploy your contracts to BSC Testnet.

## 🚀 Quick Setup (5 minutes)

### 1. Install Foundry (if not installed)
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Create `.env` file
```bash
cp .env.example .env
```

Edit `.env` and add your private key:
```bash
# Your MetaMask private key (remove 0x prefix)
PRIVATE_KEY=your_private_key_here

# Alchemy RPC for BSC Testnet (already configured)
BSC_TESTNET_RPC_URL=https://bnb-testnet.g.alchemy.com/v2/X0jmTgXNd3kEEQHnRwCSRZCtjUmEIYIW
```

### 3. Get Testnet BNB

Visit the faucet and get free tBNB:
👉 https://testnet.bnbchain.org/faucet-smart

You need at least **0.1 tBNB** for deployment.

### 4. Deploy!

```bash
# Load environment variables
source .env

# Deploy contracts
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vvvv
```

## ✅ Success!

If everything worked, you'll see:

```
=== Deployment Summary ===
KYCRegistry: 0x...
AssetNFT: 0x...
AssetToken: 0x...
Owner: 0x...

All contracts deployed successfully!
```

**Save these addresses!** You'll need them.

## 📋 What Got Deployed?

1. **KYCRegistry** - Manages KYC verification
2. **AssetNFT** - ERC721 for tokenized assets
3. **AssetToken** - ERC20 token (1M supply)

All owned by your deployer address.

## 🔍 View on Explorer

Visit BSC Testnet Explorer with your contract addresses:
```
https://testnet.bscscan.com/address/YOUR_CONTRACT_ADDRESS
```

## 🎯 Next Steps

### Add a KYC Verifier
```bash
cast send KYC_REGISTRY_ADDRESS \
  "addAuthorizedAddress(address)" \
  VERIFIER_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy
```

### Verify a User's KYC
```bash
cast send KYC_REGISTRY_ADDRESS \
  "addKYC(address)" \
  USER_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy
```

### Mint an NFT
```bash
cast send ASSET_NFT_ADDRESS \
  "mintAsset(address,string,string,string,uint256,string)" \
  USER_ADDRESS \
  "ipfs://QmYourMetadata" \
  "Asset Name" \
  "Description" \
  1000 \
  "Asset Type" \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy
```

### Check KYC Status
```bash
cast call KYC_REGISTRY_ADDRESS \
  "isKYCVerified(address)" \
  USER_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Check Token Balance
```bash
cast call ASSET_TOKEN_ADDRESS \
  "balanceOf(address)" \
  YOUR_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL
```

## 🛠️ Troubleshooting

**Error: "Insufficient funds"**
- Get more tBNB from the faucet

**Error: "Transaction failed"**
- Add `--legacy` flag
- Increase gas limit with `--gas-limit 10000000`

**Can't find `cast` command**
- Run `foundryup` to install Foundry tools

## 📚 Full Documentation

For detailed deployment options and verification:
- [BSC Deployment Guide](./DEPLOYMENT_BSC.md)
- [General Deployment Guide](./DEPLOYMENT.md)

## Network Info

- **Network**: BSC Testnet
- **Chain ID**: 97
- **Explorer**: https://testnet.bscscan.com
- **Faucet**: https://testnet.bnbchain.org/faucet-smart

## 🔐 Security

⚠️ **NEVER commit your `.env` file!**
⚠️ **NEVER share your private key!**

The `.env` file is already in `.gitignore` to protect you.

---

Need help? Check the full [deployment guide](./DEPLOYMENT_BSC.md).
