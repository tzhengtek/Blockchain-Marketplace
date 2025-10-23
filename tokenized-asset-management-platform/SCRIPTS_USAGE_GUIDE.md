# RealVault Platform - Scripts Usage Guide

Complete guide for using all deployment and interaction scripts.

---

## Table of Contents

1. [Mint RVP Tokens](#1-mint-rvp-tokens)
2. [Mint RVA NFTs](#2-mint-rva-nfts)
3. [Add Liquidity to PancakeSwap](#3-add-liquidity-to-pancakeswap)
4. [List NFT on Marketplace](#4-list-nft-on-marketplace)
5. [Buy NFT from Marketplace](#5-buy-nft-from-marketplace)
6. [Manage KYC](#6-manage-kyc)

---

## 1. Mint RVP Tokens

Mint RealVault Protocol (RVP) tokens to a KYC-verified address.

### Script: `MintToken.s.sol`

### Environment Variables

Add these to your `.env` file:

```bash
MINT_TO_ADDRESS=0x... # Recipient address (must be KYC verified)
MINT_AMOUNT=10000     # Amount in tokens (not wei)
```

### Usage

```bash
forge script script/MintToken.s.sol:MintTokenScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Example

```bash
# Mint 10,000 RVP tokens
MINT_TO_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
MINT_AMOUNT=10000

forge script script/MintToken.s.sol:MintTokenScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Requirements

- Caller must be the token owner
- Caller must be KYC verified
- Recipient must be KYC verified

---

## 2. Mint RVA NFTs

Mint a RealVault Assets (RVA) NFT representing a real-world asset.

### Script: `MintNFT.s.sol`

### Environment Variables

```bash
NFT_RECIPIENT=0x...                    # Recipient address
NFT_URI=ipfs://...                     # Token URI (IPFS or HTTP)
NFT_NAME="Luxury Apartment NYC"        # Asset name
NFT_DESCRIPTION="Premium real estate"  # Description
NFT_VALUE=1000000                      # Value in USD
NFT_TYPE="Real Estate"                 # Asset type
```

### Usage

```bash
forge script script/MintNFT.s.sol:MintNFTScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Example: Real Estate

```bash
NFT_RECIPIENT=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
NFT_URI=ipfs://QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NFT_NAME="Penthouse Manhattan"
NFT_DESCRIPTION="Luxury penthouse with skyline views"
NFT_VALUE=5000000
NFT_TYPE="Real Estate"

forge script script/MintNFT.s.sol:MintNFTScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Example: Artwork

```bash
NFT_RECIPIENT=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
NFT_URI=ipfs://QmYyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NFT_NAME="Modern Art Collection #42"
NFT_DESCRIPTION="Contemporary artwork by renowned artist"
NFT_VALUE=250000
NFT_TYPE="Artwork"

forge script script/MintNFT.s.sol:MintNFTScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Example: Vehicle

```bash
NFT_RECIPIENT=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
NFT_URI=ipfs://QmZzxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NFT_NAME="Ferrari F8 Tributo 2023"
NFT_DESCRIPTION="Red, 720hp, pristine condition"
NFT_VALUE=280000
NFT_TYPE="Vehicle"

forge script script/MintNFT.s.sol:MintNFTScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Requirements

- Caller must be the NFT contract owner
- Recipient must be KYC verified

### Asset Types

Suggested asset types:
- `Real Estate`
- `Artwork`
- `Vehicle`
- `Precious Metals`
- `Collectibles`
- `Equipment`
- `Intellectual Property`

---

## 3. Add Liquidity to PancakeSwap

Create or add to the BNB/RVP liquidity pool on PancakeSwap V2.

### Script: `AddLiquidity.s.sol`

### Configuration

Edit the script to adjust amounts (lines 47-48):

```solidity
uint256 tokenAmount = 10000 * 10**18; // 10,000 RVP tokens
uint256 bnbAmount = 0.1 ether;        // 0.1 BNB
```

### Usage

```bash
forge script script/AddLiquidity.s.sol:AddLiquidityScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Requirements

- Caller must have sufficient RVP tokens
- Caller must have sufficient BNB
- Caller must be KYC verified

### Notes

- Creates pair if it doesn't exist
- 5% slippage tolerance
- LP tokens sent to caller
- Price ratio: 1 RVP = 0.00001 BNB (initial)

---

## 4. List NFT on Marketplace

List your RVA NFT for sale on the AssetMarketplace.

### Script: `ListNFTToMarketplace.s.sol`

### Environment Variables

```bash
TOKEN_ID=0           # The NFT token ID to list
LISTING_PRICE=1      # Price in BNB (e.g., 1 = 1 BNB, 0.5 = 0.5 BNB)
```

### Usage

```bash
forge script script/ListNFTToMarketplace.s.sol:ListNFTToMarketplaceScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Example

```bash
# List NFT #0 for 1.5 BNB
TOKEN_ID=0
LISTING_PRICE=1.5

forge script script/ListNFTToMarketplace.s.sol:ListNFTToMarketplaceScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Requirements

- Caller must own the NFT
- Caller must be KYC verified
- NFT will be automatically approved for marketplace

### Marketplace Fees

- Platform fee: **2.5%**
- Seller receives: **97.5%** of sale price
- Example: 1 BNB listing → Seller gets 0.975 BNB

---

## 5. Buy NFT from Marketplace

Purchase a listed NFT from the marketplace.

### Using Forge Script

Create a simple buy script or use `cast send`:

```bash
# Get listing price first
cast call $MARKETPLACE_ADDRESS "getListing(address,uint256)(address,uint256,bool)" \
  $ASSET_NFT_ADDRESS \
  0 \
  --rpc-url $BSC_TESTNET_RPC_URL

# Buy NFT (send exact price in BNB)
cast send $MARKETPLACE_ADDRESS \
  "buyNFT(address,uint256)" \
  $ASSET_NFT_ADDRESS \
  0 \
  --value 1.5ether \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Requirements

- Buyer must be KYC verified
- Seller must be KYC verified
- Must send exact listing price
- Cannot buy your own NFT

---

## 6. Manage KYC

Add or revoke KYC verification for users.

### Add Single User

```bash
forge script script/AddKYC.s.sol:AddKYCScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

Requires in `.env`:
```bash
USER_ADDRESS=0x...  # Address to KYC verify
```

### Add Multiple Users (Batch)

```bash
forge script script/AddKYCBatch.s.sol:AddKYCBatchScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

Requires in `.env`:
```bash
USER_ADDRESSES=0x...,0x...,0x...  # Comma-separated addresses
```

### Check KYC Status

```bash
cast call $KYC_REGISTRY_ADDRESS \
  "isKYCVerified(address)(bool)" \
  0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0 \
  --rpc-url $BSC_TESTNET_RPC_URL
```

---

## Quick Command Reference

### View Token Balance

```bash
cast call $ASSET_TOKEN_ADDRESS \
  "balanceOf(address)(uint256)" \
  $YOUR_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### View NFT Owner

```bash
cast call $ASSET_NFT_ADDRESS \
  "ownerOf(uint256)(address)" \
  0 \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### View NFT Metadata

```bash
cast call $ASSET_NFT_ADDRESS \
  "getAssetMetadata(uint256)" \
  0 \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Check Marketplace Listing

```bash
cast call $MARKETPLACE_ADDRESS \
  "getListing(address,uint256)(address,uint256,bool)" \
  $ASSET_NFT_ADDRESS \
  0 \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Check Collected Fees

```bash
cast call $MARKETPLACE_ADDRESS \
  "collectedFees()(uint256)" \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Withdraw Marketplace Fees (Owner Only)

```bash
cast send $MARKETPLACE_ADDRESS \
  "withdrawFees()" \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

---

## Complete Workflow Example

### Scenario: Tokenize and Sell a Real Estate Property

```bash
# Step 1: Ensure buyer is KYC verified
USER_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
forge script script/AddKYC.s.sol:AddKYCScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast

# Step 2: Mint NFT representing the property
NFT_RECIPIENT=$DEPLOYER_ADDRESS
NFT_URI=ipfs://QmPropertyDetails...
NFT_NAME="Villa in Miami Beach"
NFT_DESCRIPTION="5BR luxury villa with ocean view"
NFT_VALUE=3500000
NFT_TYPE="Real Estate"

forge script script/MintNFT.s.sol:MintNFTScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast

# Step 3: List NFT for 10 BNB
TOKEN_ID=0
LISTING_PRICE=10

forge script script/ListNFTToMarketplace.s.sol:ListNFTToMarketplaceScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast

# Step 4: Buyer purchases (from buyer's wallet)
cast send $MARKETPLACE_ADDRESS \
  "buyNFT(address,uint256)" \
  $ASSET_NFT_ADDRESS \
  0 \
  --value 10ether \
  --private-key $BUYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL

# Step 5: Verify ownership transferred
cast call $ASSET_NFT_ADDRESS \
  "ownerOf(uint256)(address)" \
  0 \
  --rpc-url $BSC_TESTNET_RPC_URL
```

---

## Troubleshooting

### "Caller is not KYC verified"
- Add the address to KYC registry using `AddKYC.s.sol`

### "Not token owner" / "Not NFT owner"
- Ensure you're using the correct private key

### "Marketplace not approved"
- The ListNFT script handles this automatically
- If manual approval needed: Use `approve()` or `setApprovalForAll()`

### "Insufficient balance"
- For tokens: Mint more using `MintToken.s.sol`
- For BNB: Get testnet BNB from faucet

### "Transaction underpriced"
- Add `--legacy` flag to forge script command
- Or use public RPC: `https://data-seed-prebsc-1-s1.bnbchain.org:8545`

---

## Contract Addresses

See [CONTRACT_ADDRESSES.txt](./CONTRACT_ADDRESSES.txt) or [DEPLOYED_CONTRACTS.md](./DEPLOYED_CONTRACTS.md)

---

## Additional Resources

- [BscScan Testnet](https://testnet.bscscan.com/)
- [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- [PancakeSwap Testnet](https://pancakeswap.finance/)
- [IPFS Upload](https://www.pinata.cloud/) or [NFT.Storage](https://nft.storage/)

---

**Need Help?** Check the main [README.md](./README.md) or [SCRIPTS_GUIDE.md](./SCRIPTS_GUIDE.md)
