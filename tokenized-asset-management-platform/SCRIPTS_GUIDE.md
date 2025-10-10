# Management Scripts Guide

Scripts to manage your deployed KYC-enabled Asset Management contracts.

## Available Scripts

1. **Deploy.s.sol** - Deploy all contracts
2. **AddAuthorizedAddress.s.sol** - Add authorized KYC managers
3. **AddKYC.s.sol** - Verify a single user's KYC
4. **AddKYCBatch.s.sol** - Verify multiple users at once

---

## 1. Deploy Contracts

### Setup `.env`
```bash
PRIVATE_KEY=your_private_key_without_0x
BSC_TESTNET_RPC_URL=https://bnb-testnet.g.alchemy.com/v2/X0jmTgXNd3kEEQHnRwCSRZCtjUmEIYIW
```

### Run Deployment
```bash
source .env

forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vvvv
```

### Save Output
After deployment, save the contract addresses:
```
KYCRegistry: 0x1234...
AssetNFT: 0x5678...
AssetToken: 0x9abc...
```

---

## 2. Add Authorized Address

Authorize an address to manage KYC verifications.

### Update `.env`
```bash
PRIVATE_KEY=your_owner_private_key
BSC_TESTNET_RPC_URL=https://bnb-testnet.g.alchemy.com/v2/X0jmTgXNd3kEEQHnRwCSRZCtjUmEIYIW
KYC_REGISTRY_ADDRESS=0x1234... # Your deployed KYCRegistry address
AUTHORIZED_ADDRESS=0x5678... # Address you want to authorize
```

### Run Script
```bash
source .env

forge script script/AddAuthorizedAddress.s.sol:AddAuthorizedAddressScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vvvv
```

### What It Does
- Checks if address is already authorized
- Adds the address to authorized list
- Verifies the authorization
- Authorized address can now call:
  - `addKYC(address)`
  - `addKYCBatch(address[])`
  - `revokeKYC(address)`

### Example Output
```
=== Adding Authorized Address to KYCRegistry ===
Caller: 0xYourAddress
KYCRegistry: 0x1234...
Address to authorize: 0x5678...

Successfully authorized address!

=== Verification ===
Is authorized: true

SUCCESS: Address can now manage KYC verifications!
```

---

## 3. Add Single KYC Verification

Verify a single user's KYC status.

### Update `.env`
```bash
PRIVATE_KEY=your_private_key # Owner or authorized address
BSC_TESTNET_RPC_URL=https://bnb-testnet.g.alchemy.com/v2/X0jmTgXNd3kEEQHnRwCSRZCtjUmEIYIW
KYC_REGISTRY_ADDRESS=0x1234... # Your KYCRegistry address
USER_ADDRESS=0x9abc... # User to verify
```

### Run Script
```bash
source .env

forge script script/AddKYC.s.sol:AddKYCScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vvvv
```

### What It Does
- Checks if user is already verified
- Adds KYC verification
- Verifies the status
- User can now interact with KYC-protected functions

### Example Output
```
=== Adding KYC Verification ===
Caller: 0xYourAddress
KYCRegistry: 0x1234...
User to verify: 0x9abc...

Successfully added KYC verification!

=== Verification ===
Is KYC verified: true

SUCCESS: User can now interact with KYC-protected contracts!
```

---

## 4. Add Batch KYC Verifications

Verify multiple users at once (gas efficient).

### Update `.env`
```bash
PRIVATE_KEY=your_private_key
BSC_TESTNET_RPC_URL=https://bnb-testnet.g.alchemy.com/v2/X0jmTgXNd3kEEQHnRwCSRZCtjUmEIYIW
KYC_REGISTRY_ADDRESS=0x1234...

# Add up to 3 addresses (you can modify the script for more)
USER_ADDRESS_1=0xaaa...
USER_ADDRESS_2=0xbbb...
USER_ADDRESS_3=0xccc...
```

### Run Script
```bash
source .env

forge script script/AddKYCBatch.s.sol:AddKYCBatchScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vvvv
```

### What It Does
- Validates all addresses
- Adds all KYC verifications in one transaction
- Verifies all statuses
- More gas efficient than individual calls

### Example Output
```
=== Batch Adding KYC Verifications ===
Caller: 0xYourAddress
KYCRegistry: 0x1234...
Address 1: 0xaaa...
Address 2: 0xbbb...
Address 3: 0xccc...

Successfully added 3 KYC verifications!

=== Verification ===
Address 0xaaa... verified: true
Address 0xbbb... verified: true
Address 0xccc... verified: true

SUCCESS: All users can now interact with KYC-protected contracts!
```

---

## Using Cast Commands (Alternative)

You can also use `cast` for simpler operations:

### Add Authorized Address
```bash
cast send $KYC_REGISTRY_ADDRESS \
  "addAuthorizedAddress(address)" \
  0x5678... \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy
```

### Add Single KYC
```bash
cast send $KYC_REGISTRY_ADDRESS \
  "addKYC(address)" \
  0x9abc... \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy
```

### Check KYC Status
```bash
cast call $KYC_REGISTRY_ADDRESS \
  "isKYCVerified(address)" \
  0x9abc... \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Check Authorization
```bash
cast call $KYC_REGISTRY_ADDRESS \
  "isAuthorized(address)" \
  0x5678... \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Revoke KYC
```bash
cast send $KYC_REGISTRY_ADDRESS \
  "revokeKYC(address)" \
  0x9abc... \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy
```

### Remove Authorized Address
```bash
cast send $KYC_REGISTRY_ADDRESS \
  "removeAuthorizedAddress(address)" \
  0x5678... \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy
```

---

## Access Control Summary

### Owner Can:
- ✅ Add/remove authorized addresses
- ✅ Add/revoke KYC verifications
- ✅ Update KYC registry in AssetNFT/AssetToken
- ✅ Mint NFTs and tokens
- ✅ Update asset values

### Authorized Addresses Can:
- ✅ Add/revoke KYC verifications
- ❌ Cannot add/remove other authorized addresses
- ❌ Cannot mint NFTs/tokens

### KYC Verified Users Can:
- ✅ Transfer NFTs/tokens
- ✅ Approve transfers
- ✅ Receive minted assets

---

## Gas Costs (BSC Testnet)

Approximate costs at 3 gwei:

| Operation | Gas | Cost (tBNB) |
|-----------|-----|-------------|
| Add Authorized | ~50,000 | ~0.00015 |
| Add Single KYC | ~45,000 | ~0.000135 |
| Add Batch (3) | ~90,000 | ~0.00027 |
| Revoke KYC | ~30,000 | ~0.00009 |

Batch operations are ~40% cheaper per user!

---

## Troubleshooting

### Error: "Caller is not owner"
- You need to use the owner's private key
- Check your `PRIVATE_KEY` in `.env`

### Error: "Caller is not owner or authorized"
- You need owner OR authorized address
- Check authorization with `isAuthorized(address)`

### Error: "Address already authorized"
- Address is already in the authorized list
- No action needed

### Error: "Address not authorized"
- Trying to remove non-authorized address
- Check current status first

---

## Best Practices

1. **Test First**: Always test on testnet before mainnet
2. **Verify Status**: Check authorization/KYC status before operations
3. **Use Batch**: For multiple users, always use batch operations
4. **Keep Records**: Maintain a list of authorized addresses and verified users
5. **Monitor Gas**: Check gas prices before operations
6. **Secure Keys**: Never commit private keys to git

---

## Quick Reference

```bash
# Deploy contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url $BSC_TESTNET_RPC_URL --broadcast --legacy -vvvv

# Add authorized address
forge script script/AddAuthorizedAddress.s.sol:AddAuthorizedAddressScript --rpc-url $BSC_TESTNET_RPC_URL --broadcast --legacy -vvvv

# Add single KYC
forge script script/AddKYC.s.sol:AddKYCScript --rpc-url $BSC_TESTNET_RPC_URL --broadcast --legacy -vvvv

# Add batch KYC
forge script script/AddKYCBatch.s.sol:AddKYCBatchScript --rpc-url $BSC_TESTNET_RPC_URL --broadcast --legacy -vvvv
```

---

Need help? Check the [deployment guide](./DEPLOYMENT_BSC.md) or [quick start](./QUICKSTART.md).
