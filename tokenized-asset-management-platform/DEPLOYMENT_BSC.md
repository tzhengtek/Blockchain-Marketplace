# BSC Testnet Deployment Guide

Quick guide to deploy your KYC-enabled Asset Management contracts to BSC Testnet.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- MetaMask or another wallet with BNB on BSC Testnet
- BscScan API key (optional, for verification)

## Step 1: Get Testnet BNB

1. **Add BSC Testnet to MetaMask**
   - Network Name: BSC Testnet
   - RPC URL: `https://data-seed-prebsc-1-s1.binance.org:8545`
   - Chain ID: `97`
   - Currency Symbol: `tBNB`
   - Block Explorer: `https://testnet.bscscan.com`

2. **Get Free Testnet BNB**
   - Visit: https://testnet.bnbchain.org/faucet-smart
   - Enter your wallet address
   - Complete captcha
   - Receive 0.5 tBNB (~$150 worth at current prices)

## Step 2: Setup Environment

1. **Copy the example environment file**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file**
   ```bash
   # Get your private key from MetaMask:
   # Account Details → Show Private Key → Copy (remove 0x prefix)
   PRIVATE_KEY=your_private_key_without_0x

   # BSC Testnet RPC (already configured)
   BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545

   # Optional: For contract verification
   BSCSCAN_API_KEY=your_bscscan_api_key
   ```

3. **Get BscScan API Key (Optional)**
   - Visit: https://bscscan.com/myapikey
   - Sign up/Login
   - Create new API key
   - Add to `.env` file

## Step 3: Test Locally First

Run a dry-run to ensure everything works:

```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url $BSC_TESTNET_RPC_URL
```

This simulates the deployment without actually sending transactions.

## Step 4: Deploy to BSC Testnet

Deploy the contracts:

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vvvv
```

**Flags explained:**
- `--broadcast`: Actually sends the transactions
- `--legacy`: Uses legacy transaction format (required for BSC)
- `-vvvv`: Verbose output for debugging

## Step 5: Verify Contracts (Optional)

If you have a BscScan API key, verify your contracts:

```bash
# Verify KYCRegistry
forge verify-contract \
  --chain-id 97 \
  --compiler-version v0.8.30 \
  --constructor-args $(cast abi-encode "constructor(address)" "YOUR_DEPLOYER_ADDRESS") \
  KYC_REGISTRY_ADDRESS \
  src/KYCRegistry.sol:KYCRegistry \
  --verifier-url https://api-testnet.bscscan.com/api \
  --etherscan-api-key $BSCSCAN_API_KEY

# Verify AssetNFT
forge verify-contract \
  --chain-id 97 \
  --compiler-version v0.8.30 \
  --constructor-args $(cast abi-encode "constructor(string,string,address,address)" "Asset NFT" "ANFT" "YOUR_DEPLOYER_ADDRESS" "KYC_REGISTRY_ADDRESS") \
  ASSET_NFT_ADDRESS \
  src/AssetNFT.sol:AssetNFT \
  --verifier-url https://api-testnet.bscscan.com/api \
  --etherscan-api-key $BSCSCAN_API_KEY

# Verify AssetToken
forge verify-contract \
  --chain-id 97 \
  --compiler-version v0.8.30 \
  --constructor-args $(cast abi-encode "constructor(string,string,uint8,uint256,address,address)" "Asset Token" "ATK" 18 1000000 "YOUR_DEPLOYER_ADDRESS" "KYC_REGISTRY_ADDRESS") \
  ASSET_TOKEN_ADDRESS \
  src/AssetToken.sol:AssetToken \
  --verifier-url https://api-testnet.bscscan.com/api \
  --etherscan-api-key $BSCSCAN_API_KEY
```

## Expected Output

After successful deployment, you'll see:

```
=== Deployment Summary ===
KYCRegistry: 0x1234...
AssetNFT: 0x5678...
AssetToken: 0x9abc...
Owner: 0xYourAddress...

All contracts deployed successfully!
```

**Save these addresses!** You'll need them to interact with the contracts.

## View Your Contracts

Visit BSC Testnet Explorer:
- KYCRegistry: `https://testnet.bscscan.com/address/YOUR_KYC_ADDRESS`
- AssetNFT: `https://testnet.bscscan.com/address/YOUR_NFT_ADDRESS`
- AssetToken: `https://testnet.bscscan.com/address/YOUR_TOKEN_ADDRESS`

## Deployment Costs

Approximate gas costs on BSC Testnet (gas price ~3 gwei):
- KYCRegistry: ~0.002 tBNB
- AssetNFT: ~0.01 tBNB
- AssetToken: ~0.006 tBNB
- **Total: ~0.018 tBNB** (≈$5.40 at current prices)

Much cheaper than Ethereum! 🎉

## Troubleshooting

### Error: "Insufficient funds"
- Make sure you have at least 0.1 tBNB for gas
- Get more from the faucet: https://testnet.bnbchain.org/faucet-smart

### Error: "execution reverted"
- Check your `.env` file is configured correctly
- Make sure you removed `0x` from your private key
- Try using the `--legacy` flag

### Error: "nonce too low"
- Your wallet has pending transactions
- Wait a few minutes or reset MetaMask account

### Error: "Failed to verify"
- Wait 30-60 seconds after deployment
- Try manual verification with the commands above
- Check constructor arguments are correct

## Next Steps

After deployment, you can:

1. **Add KYC Verifiers**
   ```solidity
   kycRegistry.addAuthorizedAddress(verifierAddress);
   ```

2. **Verify Users**
   ```solidity
   kycRegistry.addKYC(userAddress);
   ```

3. **Mint NFTs**
   ```solidity
   assetNFT.mintAsset(to, uri, name, description, value, assetType);
   ```

4. **Mint Tokens**
   ```solidity
   assetToken.mint(to, amount);
   ```

## BSC Network Information

- **Network**: BSC Testnet
- **Chain ID**: 97
- **Currency**: tBNB
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545
- **Explorer**: https://testnet.bscscan.com
- **Faucet**: https://testnet.bnbchain.org/faucet-smart

## Security Reminders

⚠️ **NEVER** commit your `.env` file!
⚠️ **NEVER** share your private key!
⚠️ Use testnet for testing, mainnet for production only!

## Additional Resources

- [BSC Documentation](https://docs.bnbchain.org/)
- [BscScan Testnet](https://testnet.bscscan.com)
- [Foundry Book](https://book.getfoundry.sh/)
- [BSC Faucet](https://testnet.bnbchain.org/faucet-smart)
