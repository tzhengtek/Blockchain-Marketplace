// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AssetNFT} from "../src/AssetNFT.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

/**
 * @title MintNFT
 * @dev Mints a RealVault Assets (RVA) NFT to a specified address
 *
 * Environment Variables Required:
 * - PRIVATE_KEY: Deployer's private key (must be owner)
 * - ASSET_NFT_ADDRESS: Address of the RVA NFT contract
 * - KYC_REGISTRY_ADDRESS: Address of the KYC registry
 * - NFT_RECIPIENT: Recipient address (must be KYC verified)
 * - NFT_URI: Token URI (e.g., ipfs://...)
 * - NFT_NAME: Asset name (e.g., "Luxury Apartment NYC")
 * - NFT_DESCRIPTION: Asset description
 * - NFT_VALUE: Asset value in USD (e.g., 1000000 for $1M)
 * - NFT_TYPE: Asset type (e.g., "Real Estate", "Artwork", "Vehicle")
 *
 * Usage:
 * forge script script/MintNFT.s.sol:MintNFTScript \
 *   --rpc-url $BSC_TESTNET_RPC_URL \
 *   --broadcast \
 *   -vvvv
 */
contract MintNFTScript is Script {
    function run() external {
        // Get environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address nftAddress = vm.envAddress("ASSET_NFT_ADDRESS");
        address kycRegistryAddress = vm.envAddress("KYC_REGISTRY_ADDRESS");
        address recipient = vm.envAddress("NFT_RECIPIENT");

        string memory uri = vm.envString("NFT_URI");
        string memory assetName = vm.envString("NFT_NAME");
        string memory description = vm.envString("NFT_DESCRIPTION");
        uint256 assetValue = vm.envUint("NFT_VALUE");
        string memory assetType = vm.envString("NFT_TYPE");

        console.log("===========================================");
        console.log("     Minting RealVault Assets (RVA) NFT");
        console.log("===========================================");
        console.log("Deployer (Owner):", deployer);
        console.log("NFT Contract:", nftAddress);
        console.log("Recipient:", recipient);
        console.log("");
        console.log("Asset Details:");
        console.log("  Name:", assetName);
        console.log("  Type:", assetType);
        console.log("  Value: $", assetValue);
        console.log("  URI:", uri);
        console.log("");

        AssetNFT nft = AssetNFT(nftAddress);
        KYCRegistry kycRegistry = KYCRegistry(kycRegistryAddress);

        // Pre-flight checks
        console.log("=== Pre-flight Checks ===");

        // Check owner
        address owner = nft.owner();
        console.log("NFT Owner:", owner);
        require(owner == deployer, "Caller is not the NFT owner");
        console.log("✓ Caller is owner");

        // Check recipient KYC
        bool recipientKYC = kycRegistry.isKYCVerified(recipient);
        console.log("Recipient KYC:", recipientKYC);
        require(recipientKYC, "Recipient is not KYC verified");
        console.log("✓ Recipient is KYC verified");
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Mint NFT
        uint256 tokenId = nft.mintAsset(
            recipient,
            uri,
            assetName,
            description,
            assetValue,
            assetType
        );

        vm.stopBroadcast();

        console.log("===========================================");
        console.log("           NFT MINTED SUCCESSFULLY");
        console.log("===========================================");
        console.log("Token ID:", tokenId);
        console.log("Owner:", nft.ownerOf(tokenId));
        console.log("Asset Name:", assetName);
        console.log("Asset Type:", assetType);
        console.log("Asset Value: $", assetValue);
        console.log("");
        console.log("View on BscScan:");
        console.log("https://testnet.bscscan.com/nft/", nftAddress, "/", tokenId);
        console.log("");
        console.log("===========================================");
    }
}
