# RealVault Platform - Scripts Guide

This guide provides all commands to execute the Forge scripts for the RealVault tokenized asset management platform.

## Prerequisites

1. Make sure all environment variables are set in `.env`:
```bash
PRIVATE_KEY=your_private_key
BSC_TESTNET_RPC_URL=your_rpc_url
KYC_REGISTRY_ADDRESS=deployed_kyc_address
ASSET_NFT_ADDRESS=deployed_nft_address
ASSET_TOKEN_ADDRESS=deployed_token_address
PRICE_ORACLE_ADDRESS=deployed_oracle_address
MARKETPLACE_ADDRESS=deployed_marketplace_address
```

2. Load environment variables before running scripts:
```bash
source .env
```

---

## 🚀 Deployment Scripts

### 1. Initial Deployment (KYC, NFT, Token)
Deploys the core contracts: KYCRegistry, AssetNFT, and AssetToken.

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Outputs:** KYCRegistry, AssetNFT, AssetToken addresses

---

### 2. Deploy Price Oracle
Deploys the NFTPriceOracle contract.

```bash
forge script script/DeployOracle.s.sol:DeployOracleScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Required:** `PRIVATE_KEY`

---

### 3. Deploy Marketplace
Deploys the AssetMarketplace contract.

```bash
forge script script/DeployMarketplace.s.sol:DeployMarketplaceScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Required:** `KYC_REGISTRY_ADDRESS`, `PRICE_ORACLE_ADDRESS`

---

### 4. Complete Redeployment
Redeploys all contracts with the latest configuration.

```bash
forge script script/RedeployAll.s.sol:RedeployAllScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Required:** `KYC_REGISTRY_ADDRESS`

---

## 👤 KYC Management Scripts

### 5. Add Single KYC Verification
Verifies a single user address for KYC.

```bash
USER_ADDRESS=0xYourUserAddress \
forge script script/AddKYC.s.sol:AddKYCScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

**Required:**
- `KYC_REGISTRY_ADDRESS`
- `USER_ADDRESS`

---

### 6. Add Batch KYC Verification
Verifies multiple user addresses for KYC.

```bash
forge script script/AddKYCBatch.s.sol:AddKYCBatchScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

**Required:** `KYC_REGISTRY_ADDRESS`

**Note:** Edit the script to add addresses to the `addressesToVerify` array.

---

### 7. Add KYC with Multicall
Adds multiple KYC verifications using multicall pattern.

```bash
forge script script/AddMulticallToKYC.s.sol:AddMulticallToKYCScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

---

### 8. Update KYC Registry Address
Updates the KYC registry address in contracts.

```bash
NEW_KYC_ADDRESS=0xNewKYCAddress \
forge script script/UpdateKYCRegistry.s.sol:UpdateKYCRegistryScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

**Required:** `NEW_KYC_ADDRESS`, `ASSET_NFT_ADDRESS`

---

## 🎨 NFT Management Scripts

### 9. Mint Single NFT
Mints a single NFT to a specified recipient.

```bash
NFT_RECIPIENT=0xRecipientAddress \
NFT_URI="ipfs://your-metadata-uri/1.json" \
NFT_NAME="Luxury Apartment NYC" \
NFT_DESCRIPTION="Premium real estate in Manhattan" \
NFT_VALUE=1000000 \
NFT_TYPE="Real Estate" \
forge script script/MintNFT.s.sol:MintNFTScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

**Required:**
- `ASSET_NFT_ADDRESS`
- `KYC_REGISTRY_ADDRESS`
- `NFT_RECIPIENT`
- `NFT_URI`
- `NFT_NAME`
- `NFT_DESCRIPTION`
- `NFT_VALUE`
- `NFT_TYPE`

---

### 10. Mint, Set Price & List NFTs (Comprehensive)
Mints multiple NFTs, sets oracle prices, and lists them on the marketplace in one go.

```bash
# Default: 5 NFTs, 0.01 BNB each
forge script script/MintSetPriceAndList.s.sol:MintSetPriceAndListScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  --with-gas-price 10gwei
```

**With Custom Parameters:**
```bash
MINT_COUNT=10 \
PRICE_PER_NFT=5 \
ASSET_TYPE="Commercial Property" \
ASSET_VALUE=500000 \
BASE_URI="ipfs://QmYourCID/" \
forge script script/MintSetPriceAndList.s.sol:MintSetPriceAndListScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  --with-gas-price 10gwei
```

**Parameters:**
- `MINT_COUNT`: Number of NFTs to mint (default: 5)
- `PRICE_PER_NFT`: Price multiplier (1 = 0.01 BNB, 5 = 0.05 BNB)
- `ASSET_TYPE`: Type of asset (default: "Real Estate")
- `ASSET_VALUE`: Value in USD (default: 100000)
- `BASE_URI`: IPFS base URI (default: "ipfs://QmExample/")

---

## 💰 Token Management Scripts

### 11. Mint Tokens
Mints AssetTokens (RVP) to a recipient.

```bash
TOKEN_RECIPIENT=0xRecipientAddress \
TOKEN_AMOUNT=10000 \
forge script script/MintToken.s.sol:MintTokenScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

**Required:**
- `ASSET_TOKEN_ADDRESS`
- `TOKEN_RECIPIENT`
- `TOKEN_AMOUNT` (in whole tokens, not wei)

---

### 12. Add Liquidity to PancakeSwap
Adds liquidity to the RVP/WBNB pair on PancakeSwap V2.

```bash
forge script script/AddLiquidity.s.sol:AddLiquidityScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

**Required:** `ASSET_TOKEN_ADDRESS`

**Default Amounts:**
- 10,000 RVP tokens
- 0.1 BNB

**Note:** Edit script to customize liquidity amounts.

---

## 🏪 Marketplace Scripts

### 13. List NFT to Marketplace
Lists a single NFT on the marketplace at oracle price.

```bash
TOKEN_ID=1 \
forge script script/ListNFTToMarketplace.s.sol:ListNFTToMarketplaceScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

**Required:**
- `ASSET_NFT_ADDRESS`
- `MARKETPLACE_ADDRESS`
- `TOKEN_ID`

---

### 14. Set Oracle Prices & List Multiple NFTs
Sets oracle prices for multiple NFTs and lists them on the marketplace.

```bash
forge script script/SetOraclePricesAndList.s.sol:SetOraclePricesAndListScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  --with-gas-price 10gwei
```

**Note:** Edit script to configure token IDs and prices.

---

### 15. Unlist All NFTs
Unlists all NFTs owned by the caller from the marketplace.

```bash
forge script script/UnlistAllNFTs.s.sol:UnlistAllNFTsScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

---

### 16. Unlist All NFTs (Multicall)
Unlists all NFTs using multicall for gas efficiency.

```bash
forge script script/UnlistAllNFTsMulticall.s.sol:UnlistAllNFTsMulticallScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

See [README_UNLIST.md](./README_UNLIST.md) for detailed information.

---

## 🔐 Oracle & Authorization Scripts

### 17. Authorize Oracle
Authorizes an address as an oracle operator.

```bash
ORACLE_OPERATOR=0xOracleAddress \
forge script script/AuthorizeOracle.s.sol:AuthorizeOracleScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

**Required:**
- `PRICE_ORACLE_ADDRESS`
- `ORACLE_OPERATOR`

---

### 18. Add Authorized Address
Adds an authorized address to a contract.

```bash
AUTHORIZED_ADDRESS=0xAddressToAuthorize \
forge script script/AddAuthorizedAddress.s.sol:AddAuthorizedAddressScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

---

## 📋 Common Options

### Gas Price Options
For BSC Testnet, use these flags to ensure transaction success:

```bash
--legacy --with-gas-price 10gwei
```

### Verbose Output
- `-v`: Basic logs
- `-vv`: More detailed logs
- `-vvv`: Even more details
- `-vvvv`: Maximum verbosity (trace-level)

### Verification
Add `--verify` to verify contracts on BSCScan:

```bash
--verify -vvvv
```

Make sure `BSCSCAN_API_KEY` is set in `.env`.

---

## 🔄 Typical Workflow

### Complete Setup from Scratch

1. **Deploy Core Contracts**
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url $BSC_TESTNET_RPC_URL --broadcast --verify -vvvv
```

2. **Deploy Oracle**
```bash
forge script script/DeployOracle.s.sol:DeployOracleScript --rpc-url $BSC_TESTNET_RPC_URL --broadcast --verify -vvvv
```

3. **Deploy Marketplace**
```bash
forge script script/DeployMarketplace.s.sol:DeployMarketplaceScript --rpc-url $BSC_TESTNET_RPC_URL --broadcast --verify -vvvv
```

4. **Add Your Address to KYC**
```bash
USER_ADDRESS=$DEPLOYER_ADDRESS forge script script/AddKYC.s.sol:AddKYCScript --rpc-url $BSC_TESTNET_RPC_URL --broadcast -vvvv
```

5. **Mint and List NFTs**
```bash
MINT_COUNT=5 forge script script/MintSetPriceAndList.s.sol:MintSetPriceAndListScript --rpc-url $BSC_TESTNET_RPC_URL --broadcast --legacy --with-gas-price 10gwei
```

6. **Add Liquidity**
```bash
forge script script/AddLiquidity.s.sol:AddLiquidityScript --rpc-url $BSC_TESTNET_RPC_URL --broadcast -vvvv
```

---

## 📝 Notes

- Always test scripts on testnet before mainnet
- Keep your `.env` file secure and never commit it
- Save deployed addresses after each deployment
- Monitor gas prices for cost optimization
- Use `--legacy` flag for BSC compatibility
- Check transaction on BSCScan: `https://testnet.bscscan.com/tx/[TX_HASH]`

---

## 🐛 Troubleshooting

### Transaction Underpriced
Add higher gas price:
```bash
--legacy --with-gas-price 15gwei
```

### Nonce Too Low
Previous transaction might have succeeded. Check BSCScan.

### Insufficient Balance
Make sure your deployer address has enough BNB for gas fees.

### KYC Not Verified
Add your address to KYC before interacting with protected contracts.

---

## 📚 Additional Resources

- [Forge Documentation](https://book.getfoundry.sh/)
- [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- [BSCScan Testnet](https://testnet.bscscan.com/)
- [PancakeSwap Testnet](https://pancake.kiemtienonline360.com/)
