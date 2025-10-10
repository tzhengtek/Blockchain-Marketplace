# Contract Verification Guide

After deploying your contracts to BSC Testnet, verify them on BscScan using these commands.

## Prerequisites

Make sure your `.env` file has these variables set:
```bash
DEPLOYER_ADDRESS=0x99DaBE97d110B9339bC7E74392D1f74cE3f7F02c
KYC_REGISTRY_ADDRESS=0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe
ASSET_NFT_ADDRESS=0xad6eD2CbBFB45Da005111356Fe280d10a7044371
ASSET_TOKEN_ADDRESS=0x3DC23E01d7B7555970823274054047E521290C23
BSCSCAN_API_KEY=IJ81UYS7IK2C4F2XMN4KQ9HYNZFEEENM51
```

## Verification Commands

Load environment variables first:
```bash
source .env
```

### 1. Verify KYCRegistry
```bash
forge verify-contract --chain-id 97 --num-of-optimizations 200 --watch --constructor-args $(cast abi-encode "constructor(address)" "$DEPLOYER_ADDRESS") $KYC_REGISTRY_ADDRESS src/KYCRegistry.sol:KYCRegistry --etherscan-api-key $BSCSCAN_API_KEY
```

### 2. Verify AssetNFT
```bash
forge verify-contract --chain-id 97 --num-of-optimizations 200 --watch --constructor-args $(cast abi-encode "constructor(string,string,address,address)" "Asset NFT" "ANFT" "$DEPLOYER_ADDRESS" "$KYC_REGISTRY_ADDRESS") $ASSET_NFT_ADDRESS src/AssetNFT.sol:AssetNFT --etherscan-api-key $BSCSCAN_API_KEY
```

### 3. Verify AssetToken
```bash
forge verify-contract --chain-id 97 --num-of-optimizations 200 --watch --constructor-args $(cast abi-encode "constructor(string,string,uint8,uint256,address,address)" "Asset Token" "ATK" 18 1000000 "$DEPLOYER_ADDRESS" "$KYC_REGISTRY_ADDRESS") $ASSET_TOKEN_ADDRESS src/AssetToken.sol:AssetToken --etherscan-api-key $BSCSCAN_API_KEY
```

## Verify All at Once

Run all three verifications sequentially:
```bash
source .env

forge verify-contract --chain-id 97 --num-of-optimizations 200 --watch --constructor-args $(cast abi-encode "constructor(address)" "$DEPLOYER_ADDRESS") $KYC_REGISTRY_ADDRESS src/KYCRegistry.sol:KYCRegistry --etherscan-api-key $BSCSCAN_API_KEY

forge verify-contract --chain-id 97 --num-of-optimizations 200 --watch --constructor-args $(cast abi-encode "constructor(string,string,address,address)" "Asset NFT" "ANFT" "$DEPLOYER_ADDRESS" "$KYC_REGISTRY_ADDRESS") $ASSET_NFT_ADDRESS src/AssetNFT.sol:AssetNFT --etherscan-api-key $BSCSCAN_API_KEY

forge verify-contract --chain-id 97 --num-of-optimizations 200 --watch --constructor-args $(cast abi-encode "constructor(string,string,uint8,uint256,address,address)" "Asset Token" "ATK" 18 1000000 "$DEPLOYER_ADDRESS" "$KYC_REGISTRY_ADDRESS") $ASSET_TOKEN_ADDRESS src/AssetToken.sol:AssetToken --etherscan-api-key $BSCSCAN_API_KEY
```

## Check Verification Status

Visit BscScan to see your verified contracts:

- **KYCRegistry**: https://testnet.bscscan.com/address/0x7a9C49C5A1DEE1E783c8eF5cce92a49807D2Acbe#code
- **AssetNFT**: https://testnet.bscscan.com/address/0xad6eD2CbBFB45Da005111356Fe280d10a7044371#code
- **AssetToken**: https://testnet.bscscan.com/address/0x3DC23E01d7B7555970823274054047E521290C23#code

## Troubleshooting

### Error: "odd number of digits"
- Make sure you're running `source .env` first
- Check that all addresses in `.env` are valid (start with 0x)

### Error: "Already verified"
- Contract is already verified, check BscScan link

### Error: "Invalid API key"
- Check your `BSCSCAN_API_KEY` in `.env`
- Get a new key from https://bscscan.com/myapikey

## Get BscScan API Key

1. Register at https://bscscan.com/register
2. Go to https://bscscan.com/myapikey
3. Create new API key
4. Add to `.env` as `BSCSCAN_API_KEY`
