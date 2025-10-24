# Unlist All NFTs Scripts

Two scripts are provided for unlisting (canceling) all active NFT listings from the AssetMarketplace:

## 1. UnlistAllNFTs.s.sol (Recommended)

**This is the recommended script** for unlisting NFTs from the current marketplace contract.

### Why not use Multicall3?
Due to KYC verification in the marketplace that checks `msg.sender`, using Multicall3 would cause the transaction to fail because `msg.sender` would become the Multicall3 contract address instead of your wallet address.

### Usage

```bash
# Set environment variables (or add to .env)
export TOTAL_NFTS=100  # Optional, defaults to 100

# Run the script
forge script script/UnlistAllNFTs.s.sol:UnlistAllNFTsScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### What it does:
1. Scans all NFTs (0 to TOTAL_NFTS-1) to find active listings owned by the caller
2. Cancels all found listings in a batched transaction broadcast
3. Verifies that all listings were successfully cancelled
4. Provides detailed progress logs

### Required Environment Variables:
- `PRIVATE_KEY`: Your wallet's private key
- `ASSET_NFT_ADDRESS`: Address of the NFT contract
- `MARKETPLACE_ADDRESS`: Address of the marketplace contract
- `TOTAL_NFTS` (optional): Number of NFTs to scan (default: 100)

---

## 2. UnlistAllNFTsMulticall.s.sol (Alternative/Reference)

**⚠️ WARNING:** This script will **NOT** work with the current marketplace contract due to KYC/msg.sender restrictions. It's provided as a reference for future use.

### When to use this:
- If the marketplace contract is updated to support multicall patterns
- As a reference implementation for other contracts without msg.sender restrictions
- For batch-reading operations (which work fine)

### Usage

```bash
# Set environment variables
export TOTAL_NFTS=100
export BATCH_SIZE=50  # Number of calls per multicall batch
export MULTICALL3_ADDRESS=0xcA11bde05977b3631167028862bE2a173976CA11  # Optional

# Run the script
forge script script/UnlistAllNFTsMulticall.s.sol:UnlistAllNFTsMulticallScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

### What it does:
1. Uses Multicall3 to batch-read all listings in a single call
2. Attempts to batch-cancel listings using Multicall3 (will fail with current contract)
3. Provides detailed logging of successes/failures

### Multicall3 Address:
The default Multicall3 address (`0xcA11bde05977b3631167028862bE2a173976CA11`) is deployed on most EVM chains including BSC testnet.

---

## Comparison

| Feature | UnlistAllNFTs.s.sol | UnlistAllNFTsMulticall.s.sol |
|---------|-------------------|----------------------------|
| **Works with current marketplace** | ✅ Yes | ❌ No (KYC restrictions) |
| **Gas efficiency** | Good | Excellent (if it worked) |
| **Transaction count** | N transactions (one per cancel) | 1 transaction per batch |
| **Error handling** | Individual error logs | Batch error logs |
| **Recommended for production** | ✅ Yes | ❌ No (reference only) |

---

## Example Output

```
===========================================
    Unlist All NFTs from Marketplace
===========================================
Seller: 0x99DaBE97d110B9339bC7E74392D1f74cE3f7F02c
NFT Contract: 0x54001120ED11b941692B6693D9b9859Bf05DedB8
Marketplace: 0xAC0E62c14AAD79E8bbeA594989A230B7404fDf48
Checking 100 NFTs

=== Scanning for Active Listings ===
Found active listing for Token ID: 0
Found active listing for Token ID: 1
...
Found active listing for Token ID: 99

Total active listings found: 100

=== Cancelling Listings ===
Cancelled listing for Token ID: 0
Cancelled listing for Token ID: 1
...
Progress: 10 / 100 listings cancelled
...

=== Verifying Cancellations ===

===========================================
           UNLISTING COMPLETE
===========================================
Total listings found: 100
Successfully cancelled: 100
===========================================
```

---

## Troubleshooting

### "Listing not active" error
The NFT is either:
- Not listed on the marketplace
- Already sold
- Previously cancelled

### "Not listing owner" error
You don't own the listing. Only the original lister can cancel their listing.

### "Caller not KYC verified" error
Your wallet address is not KYC verified in the KYCRegistry contract.

### Out of gas errors
- Reduce the number of NFTs being processed
- Use a higher gas limit
- Process NFTs in multiple script runs

---

## Tips

1. **Test first**: Run without `--broadcast` to simulate the transaction
2. **Check gas prices**: Use appropriate gas price for your urgency
3. **Verify listings**: Check on the marketplace frontend before/after running
4. **Save output**: Redirect console output to a file for record-keeping:
   ```bash
   forge script script/UnlistAllNFTs.s.sol:UnlistAllNFTsScript \
     --rpc-url $BSC_TESTNET_RPC_URL \
     --broadcast \
     -vvvv > unlist_output.log 2>&1
   ```
