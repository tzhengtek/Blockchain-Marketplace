# PancakeSwap V2 Liquidity Pool Guide

Complete guide for deploying and interacting with your ATK/BNB liquidity pool on BSC Testnet.

## Table of Contents
- [Overview](#overview)
- [Deployed Pool Information](#deployed-pool-information)
- [Prerequisites](#prerequisites)
- [Adding Liquidity](#adding-liquidity)
- [Swapping Tokens](#swapping-tokens)
- [Removing Liquidity](#removing-liquidity)
- [KYC Requirements](#kyc-requirements)
- [Troubleshooting](#troubleshooting)

---

## Overview

Your AssetToken (ATK) is now tradable on PancakeSwap V2! The liquidity pool enables:
- Swapping BNB for ATK tokens
- Swapping ATK tokens for BNB
- Adding/removing liquidity to earn trading fees
- Price discovery for your asset token

**Important**: All participants must be KYC verified to interact with ATK tokens.

---

## Deployed Pool Information

### Liquidity Pool Details
- **Pair Contract**: `0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7`
- **Token**: AssetToken (ATK) - `0x3DC23E01d7B7555970823274054047E521290C23`
- **Base Currency**: WBNB - `0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd`
- **Router**: PancakeSwap V2 Router - `0xD99D1c33F9fC3444f8101754aBC46c52416550D1`
- **Initial Liquidity**: 10,000 ATK + 0.1 BNB
- **Initial Price**: 1 ATK = 0.00001 BNB

### View Your Pool
- **BscScan**: https://testnet.bscscan.com/address/0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7
- **PancakeSwap Info**: https://pancakeswap.finance/info/v2/pairs/0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7

---

## Prerequisites

1. **Foundry Installed**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Environment Setup**
   - Make sure your `.env` file is configured with:
     ```bash
     PRIVATE_KEY=your_private_key
     BSC_TESTNET_RPC_URL=your_rpc_url
     ASSET_TOKEN_ADDRESS=0x3DC23E01d7B7555970823274054047E521290C23
     KYC_REGISTRY_ADDRESS=0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe
     ```

3. **KYC Verification**
   - Your address must be KYC verified to interact with ATK tokens
   - Check your KYC status:
     ```bash
     source .env
     cast call $KYC_REGISTRY_ADDRESS "isKYCVerified(address)(bool)" YOUR_ADDRESS --rpc-url $BSC_TESTNET_RPC_URL
     ```

4. **Testnet BNB**
   - Get free testnet BNB from: https://testnet.bnbchain.org/faucet-smart

---

## Adding Liquidity

### Option 1: Using the Deployment Script

The easiest way to add liquidity is using the provided script:

```bash
source .env
forge script script/AddLiquidity.s.sol:AddLiquidityScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vvvv
```

**Note**: Edit the script to change the amounts:
- Open `script/AddLiquidity.s.sol`
- Modify lines 44-45:
  ```solidity
  uint256 tokenAmount = 10000 * 10**18; // Change token amount
  uint256 bnbAmount = 0.1 ether;        // Change BNB amount
  ```

### Option 2: Using Cast CLI

1. **Calculate the deadline** (5 minutes from now):
   ```bash
   DEADLINE=$(echo $(($(date +%s) + 300)))
   echo "Deadline: $DEADLINE"
   ```

2. **Approve tokens for the router**:
   ```bash
   source .env
   cast send $ASSET_TOKEN_ADDRESS \
     "approve(address,uint256)" \
     0xD99D1c33F9fC3444f8101754aBC46c52416550D1 \
     10000000000000000000000 \
     --rpc-url $BSC_TESTNET_RPC_URL \
     --private-key $PRIVATE_KEY \
     --legacy
   ```

3. **Add liquidity**:
   ```bash
   cast send 0xD99D1c33F9fC3444f8101754aBC46c52416550D1 \
     "addLiquidityETH(address,uint256,uint256,uint256,address,uint256)" \
     $ASSET_TOKEN_ADDRESS \
     10000000000000000000000 \
     9500000000000000000000 \
     95000000000000000 \
     YOUR_ADDRESS \
     $DEADLINE \
     --value 0.1ether \
     --rpc-url $BSC_TESTNET_RPC_URL \
     --private-key $PRIVATE_KEY \
     --legacy
   ```

**Parameters Explained**:
- `10000000000000000000000` = 10,000 ATK tokens (with 18 decimals)
- `9500000000000000000000` = Min 9,500 ATK (5% slippage)
- `95000000000000000` = Min 0.095 BNB (5% slippage)
- `--value 0.1ether` = 0.1 BNB to add

---

## Swapping Tokens

### Swap BNB for ATK Tokens

1. **Get expected output**:
   ```bash
   source .env
   cast call 0xD99D1c33F9fC3444f8101754aBC46c52416550D1 \
     "getAmountsOut(uint256,address[])(uint256[])" \
     10000000000000000 \
     "[0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd,0x3DC23E01d7B7555970823274054047E521290C23]" \
     --rpc-url $BSC_TESTNET_RPC_URL
   ```
   This shows how many ATK tokens you'll get for 0.01 BNB.

2. **Calculate deadline**:
   ```bash
   DEADLINE=$(echo $(($(date +%s) + 300)))
   ```

3. **Execute swap**:
   ```bash
   cast send 0xD99D1c33F9fC3444f8101754aBC46c52416550D1 \
     "swapExactETHForTokens(uint256,address[],address,uint256)" \
     862000000000000000000 \
     "[0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd,0x3DC23E01d7B7555970823274054047E521290C23]" \
     YOUR_ADDRESS \
     $DEADLINE \
     --value 0.01ether \
     --rpc-url $BSC_TESTNET_RPC_URL \
     --private-key $PRIVATE_KEY \
     --legacy
   ```

**Parameters**:
- `862000000000000000000` = Minimum ATK tokens expected (with 5% slippage)
- `--value 0.01ether` = Amount of BNB to swap

### Swap ATK for BNB

1. **Get expected output**:
   ```bash
   source .env
   cast call 0xD99D1c33F9fC3444f8101754aBC46c52416550D1 \
     "getAmountsOut(uint256,address[])(uint256[])" \
     1000000000000000000000 \
     "[0x3DC23E01d7B7555970823274054047E521290C23,0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd]" \
     --rpc-url $BSC_TESTNET_RPC_URL
   ```
   This shows how much BNB you'll get for 1,000 ATK tokens.

2. **Approve tokens**:
   ```bash
   cast send $ASSET_TOKEN_ADDRESS \
     "approve(address,uint256)" \
     0xD99D1c33F9fC3444f8101754aBC46c52416550D1 \
     1000000000000000000000 \
     --rpc-url $BSC_TESTNET_RPC_URL \
     --private-key $PRIVATE_KEY \
     --legacy
   ```

3. **Calculate deadline**:
   ```bash
   DEADLINE=$(echo $(($(date +%s) + 300)))
   ```

4. **Execute swap**:
   ```bash
   cast send 0xD99D1c33F9fC3444f8101754aBC46c52416550D1 \
     "swapExactTokensForETH(uint256,uint256,address[],address,uint256)" \
     1000000000000000000000 \
     10000000000000000 \
     "[0x3DC23E01d7B7555970823274054047E521290C23,0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd]" \
     YOUR_ADDRESS \
     $DEADLINE \
     --rpc-url $BSC_TESTNET_RPC_URL \
     --private-key $PRIVATE_KEY \
     --legacy
   ```

**Parameters**:
- `1000000000000000000000` = 1,000 ATK tokens to swap
- `10000000000000000` = Minimum BNB expected (0.01 BNB with slippage)

---

## Removing Liquidity

### Check Your LP Token Balance

```bash
source .env
cast call 0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7 \
  "balanceOf(address)(uint256)" \
  YOUR_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Remove Liquidity

1. **Approve LP tokens**:
   ```bash
   cast send 0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7 \
     "approve(address,uint256)" \
     0xD99D1c33F9fC3444f8101754aBC46c52416550D1 \
     YOUR_LP_TOKEN_AMOUNT \
     --rpc-url $BSC_TESTNET_RPC_URL \
     --private-key $PRIVATE_KEY \
     --legacy
   ```

2. **Calculate deadline**:
   ```bash
   DEADLINE=$(echo $(($(date +%s) + 300)))
   ```

3. **Remove liquidity**:
   ```bash
   cast send 0xD99D1c33F9fC3444f8101754aBC46c52416550D1 \
     "removeLiquidityETH(address,uint256,uint256,uint256,address,uint256)" \
     $ASSET_TOKEN_ADDRESS \
     YOUR_LP_TOKEN_AMOUNT \
     0 \
     0 \
     YOUR_ADDRESS \
     $DEADLINE \
     --rpc-url $BSC_TESTNET_RPC_URL \
     --private-key $PRIVATE_KEY \
     --legacy
   ```

---

## KYC Requirements

### Why KYC is Required

Your AssetToken contract enforces KYC verification for all transfers. This means:
- ✅ Only KYC-verified addresses can send or receive ATK tokens
- ✅ The PancakeSwap Router must be KYC-verified (already done)
- ✅ The Liquidity Pair contract must be KYC-verified (already done)
- ✅ All traders must be KYC-verified

### Currently KYC-Verified Addresses

```
Deployer: 0x99DaBE97d110B9339bC7E74392D1f74cE3f7F02c
PancakeSwap Router: 0xD99D1c33F9fC3444f8101754aBC46c52416550D1
Liquidity Pair: 0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7
```

### Add New KYC User

To allow new users to trade ATK tokens:

```bash
source .env
cast send $KYC_REGISTRY_ADDRESS \
  "addKYC(address)" \
  USER_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy
```

### Check KYC Status

```bash
source .env
cast call $KYC_REGISTRY_ADDRESS \
  "isKYCVerified(address)(bool)" \
  USER_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Batch Add KYC Users

Use the batch script for multiple users:

```bash
source .env
forge script script/AddKYCBatch.s.sol:AddKYCBatchScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vvvv
```

Edit `script/AddKYCBatch.s.sol` to add your list of addresses.

---

## Troubleshooting

### Error: "AssetToken: Caller is not KYC verified"

**Cause**: Your address is not KYC verified.

**Solution**: Add your address to the KYC registry:
```bash
source .env
cast send $KYC_REGISTRY_ADDRESS \
  "addKYC(address)" \
  YOUR_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy
```

### Error: "AssetToken: Recipient is not KYC verified"

**Cause**: The recipient address is not KYC verified.

**Solution**: The recipient must be added to the KYC registry before they can receive ATK tokens.

### Error: "INSUFFICIENT_OUTPUT_AMOUNT"

**Cause**: Slippage is too high or not enough liquidity.

**Solution**:
- Increase slippage tolerance (reduce minimum amount expected)
- Add more liquidity to the pool
- Reduce the swap amount

### Error: "EXPIRED"

**Cause**: Transaction deadline has passed.

**Solution**: Recalculate the deadline:
```bash
DEADLINE=$(echo $(($(date +%s) + 300)))
```

### Error: "Insufficient funds"

**Cause**: Not enough BNB or ATK tokens in your wallet.

**Solution**:
- For BNB: Get more from the faucet: https://testnet.bnbchain.org/faucet-smart
- For ATK: Mint more tokens (owner only) or swap BNB for ATK

### Swap Not Working on PancakeSwap UI

**Cause**: The PancakeSwap UI may not support testnet or custom tokens with KYC requirements.

**Solution**: Use the CLI commands provided in this guide instead.

---

## Best Practices

1. **Always Check KYC Status First**
   - Verify both sender and receiver are KYC-verified before attempting transfers

2. **Use Appropriate Slippage**
   - For low liquidity: Use 5-10% slippage
   - For high liquidity: Use 1-3% slippage

3. **Monitor Gas Prices**
   - BSC testnet usually has low gas fees (~3-5 gwei)
   - Use `--legacy` flag for better compatibility

4. **Test with Small Amounts**
   - Start with small swaps to test the system
   - Gradually increase amounts as confidence grows

5. **Keep Track of Transactions**
   - Save transaction hashes
   - Monitor on BscScan: https://testnet.bscscan.com

---

## Useful Commands

### Check Balances

```bash
source .env

# Check BNB balance
cast balance YOUR_ADDRESS --rpc-url $BSC_TESTNET_RPC_URL

# Check ATK balance
cast call $ASSET_TOKEN_ADDRESS \
  "balanceOf(address)(uint256)" \
  YOUR_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL

# Check LP token balance
cast call 0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7 \
  "balanceOf(address)(uint256)" \
  YOUR_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Check Pool Reserves

```bash
source .env
cast call 0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7 \
  "getReserves()(uint112,uint112,uint32)" \
  --rpc-url $BSC_TESTNET_RPC_URL
```

Returns: `[ATK_reserve, WBNB_reserve, timestamp]`

### Calculate Current Price

```bash
# Price of 1 ATK in BNB
cast call 0xD99D1c33F9fC3444f8101754aBC46c52416550D1 \
  "getAmountsOut(uint256,address[])(uint256[])" \
  1000000000000000000 \
  "[0x3DC23E01d7B7555970823274054047E521290C23,0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd]" \
  --rpc-url $BSC_TESTNET_RPC_URL

# Price of 1 BNB in ATK
cast call 0xD99D1c33F9fC3444f8101754aBC46c52416550D1 \
  "getAmountsOut(uint256,address[])(uint256[])" \
  1000000000000000000 \
  "[0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd,0x3DC23E01d7B7555970823274054047E521290C23]" \
  --rpc-url $BSC_TESTNET_RPC_URL
```

---

## Additional Resources

- [PancakeSwap Documentation](https://docs.pancakeswap.finance/)
- [Foundry Book](https://book.getfoundry.sh/)
- [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- [BscScan Testnet](https://testnet.bscscan.com)
- [Project README](./README.md)
- [BSC Deployment Guide](./DEPLOYMENT_BSC.md)

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review transaction on BscScan for error details
3. Verify KYC status of all parties involved
4. Check that you have sufficient BNB for gas fees

---

## Summary

You've successfully deployed a PancakeSwap V2 liquidity pool for your KYC-enabled AssetToken! Key points:

- ✅ Pool Address: `0x5a1175DdB5094B0f4FdD4475e53d22acfF10e8f7`
- ✅ Trading Pair: ATK/BNB
- ✅ KYC Required: All traders must be verified
- ✅ CLI Tools: Use Foundry Cast for all operations
- ✅ Test Successful: Swap of 0.01 BNB → 907 ATK completed

Happy trading! 🚀
