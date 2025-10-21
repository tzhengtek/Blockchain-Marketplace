# RealVault Platform - Deployed Contracts

**Network:** BSC Testnet (Chain ID: 97)
**Deployment Date:** October 21, 2025
**Owner:** 0x99DaBE97d110B9339bC7E74392D1f74cE3f7F02c

---

## Core Contracts

### KYCRegistry
**Address:** `0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe`
**Description:** Manages KYC verification for users
**BscScan:** https://testnet.bscscan.com/address/0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe

**Functions:**
- `addKYC(address account)` - Add KYC for a user
- `revokeKYC(address account)` - Revoke KYC
- `isKYCVerified(address account)` - Check if user is verified

---

### RealVault Assets (RVA) - NFT Contract
**Address:** `0x5d44D4D77FFc1eb62bcC361F0FA96122620F03B8`
**Name:** RealVault Assets
**Symbol:** RVA
**Type:** ERC721 NFT
**Description:** Tokenized real-world assets as NFTs
**BscScan:** https://testnet.bscscan.com/address/0x5d44D4D77FFc1eb62bcC361F0FA96122620F03B8

**Key Features:**
- Asset metadata storage (name, description, value, type)
- KYC-gated transfers
- Asset value updates by owner
- Burnable NFTs

---

### RealVault Protocol (RVP) - Token Contract
**Address:** `0x9754547A1315C041ABE4682D9301EEbF591C7cB3`
**Name:** RealVault Protocol
**Symbol:** RVP
**Type:** ERC20 Token
**Decimals:** 18
**Initial Supply:** 1,000,000 RVP
**BscScan:** https://testnet.bscscan.com/address/0x9754547A1315C041ABE4682D9301EEbF591C7cB3

**Key Features:**
- KYC-gated transfers
- Mintable by owner
- Burnable tokens
- Full ERC20 compliance

---

### AssetMarketplace
**Address:** `0x5E801F0D03675912D0C123eAeE28f428EE7aace6`
**Marketplace Fee:** 2.5% (250 basis points)
**Description:** NFT marketplace for trading RealVault Assets
**BscScan:** https://testnet.bscscan.com/address/0x5E801F0D03675912D0C123eAeE28f428EE7aace6

**Key Features:**
- List NFTs for sale
- Buy/sell with BNB
- 2.5% platform fee
- KYC-gated trading
- Fee collection and withdrawal

**Functions:**
- `listNFT(address nftContract, uint256 tokenId, uint256 price)` - List NFT
- `buyNFT(address nftContract, uint256 tokenId)` - Buy listed NFT
- `cancelListing(address nftContract, uint256 tokenId)` - Cancel listing
- `withdrawFees()` - Owner withdraws collected fees

---

## PancakeSwap Integration

### Liquidity Pool
**BNB/RVP Pair:** `0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7`
**Initial Liquidity:** 10,000 RVP + 0.1 BNB
**Initial Price:** 1 RVP = 0.00001 BNB
**BscScan:** https://testnet.bscscan.com/address/0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7
**PancakeSwap:** https://pancakeswap.finance/info/v2/pairs/0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7

### PancakeSwap Router
**Address:** `0xD99D1c33F9fC3444f8101754aBC46c52416550D1`
**Type:** PancakeSwap V2 Router (Testnet)

### Wrapped BNB (WBNB)
**Address:** `0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd`
**Type:** WBNB on BSC Testnet

---

## Contract Interactions

### For Users

1. **Get KYC Verified**
   - Contact platform owner to add your address to KYC Registry
   - Check status: Call `isKYCVerified(yourAddress)` on KYC Registry

2. **Trade RVP Tokens**
   - Swap on PancakeSwap: Use pair `0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7`
   - Direct transfer: Must be KYC verified

3. **Buy/Sell NFTs**
   - Browse marketplace contract for listings
   - Must be KYC verified to trade
   - Payment in BNB

### For Owner

1. **Mint NFTs**
   ```solidity
   assetNFT.mintAsset(to, uri, name, description, value, assetType)
   ```

2. **Mint Tokens**
   ```solidity
   assetToken.mint(to, amount)
   ```

3. **Manage KYC**
   ```solidity
   kycRegistry.addKYC(userAddress)
   kycRegistry.revokeKYC(userAddress)
   ```

4. **Withdraw Marketplace Fees**
   ```solidity
   marketplace.withdrawFees()
   ```

---

## Quick Reference

### Owner Address
```
0x99DaBE97d110B9339bC7E74392D1f74cE3f7F02c
```

### All Contract Addresses (Copy-Paste Ready)
```
KYC_REGISTRY_ADDRESS=0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe
ASSET_NFT_ADDRESS=0x5d44D4D77FFc1eb62bcC361F0FA96122620F03B8
ASSET_TOKEN_ADDRESS=0x9754547A1315C041ABE4682D9301EEbF591C7cB3
MARKETPLACE_ADDRESS=0x5E801F0D03675912D0C123eAeE28f428EE7aace6
LIQUIDITY_PAIR_ADDRESS=0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7
PANCAKE_ROUTER_ADDRESS=0xD99D1c33F9fC3444f8101754aBC46c52416550D1
WBNB_ADDRESS=0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd
```

### JSON Format
```json
{
  "network": "BSC Testnet",
  "chainId": 97,
  "contracts": {
    "KYCRegistry": "0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe",
    "RealVaultAssets": {
      "address": "0x5d44D4D77FFc1eb62bcC361F0FA96122620F03B8",
      "name": "RealVault Assets",
      "symbol": "RVA",
      "type": "ERC721"
    },
    "RealVaultProtocol": {
      "address": "0x9754547A1315C041ABE4682D9301EEbF591C7cB3",
      "name": "RealVault Protocol",
      "symbol": "RVP",
      "type": "ERC20",
      "decimals": 18,
      "initialSupply": "1000000"
    },
    "AssetMarketplace": {
      "address": "0x5E801F0D03675912D0C123eAeE28f428EE7aace6",
      "fee": "2.5%"
    },
    "PancakeSwap": {
      "liquidityPair": "0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7",
      "router": "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
      "wbnb": "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
    }
  },
  "owner": "0x99DaBE97d110B9339bC7E74392D1f74cE3f7F02c"
}
```

---

## Useful Scripts

### Deploy New Contracts
```bash
forge script script/RedeployAll.s.sol:RedeployAllScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Update KYC Registry
```bash
forge script script/UpdateKYCRegistry.s.sol:UpdateKYCRegistryScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Add KYC to Address
```bash
forge script script/AddKYC.s.sol:AddKYCScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### Add Liquidity to PancakeSwap
```bash
forge script script/AddLiquidity.s.sol:AddLiquidityScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

---

## Security Notes

- ✅ All contracts use OpenZeppelin libraries
- ✅ ReentrancyGuard on marketplace
- ✅ KYC verification required for all transfers
- ✅ Owner-only functions for sensitive operations
- ✅ Marketplace fee capped at 10%

---

## Support & Documentation

- **Main README:** [README.md](./README.md)
- **Deployment Guide:** [DEPLOYMENT_BSC.md](./DEPLOYMENT_BSC.md)
- **Scripts Guide:** [SCRIPTS_GUIDE.md](./SCRIPTS_GUIDE.md)
- **Liquidity Pool Guide:** [LIQUIDITY_POOL_GUIDE.md](./LIQUIDITY_POOL_GUIDE.md)

---

**Last Updated:** October 21, 2025
**Platform:** RealVault - Tokenized Asset Management
