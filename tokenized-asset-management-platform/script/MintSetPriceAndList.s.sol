// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AssetNFT} from "../src/AssetNFT.sol";
import {NFTPriceOracle} from "../src/NFTPriceOracle.sol";
import {AssetMarketplace} from "../src/AssetMarketplace.sol";

/**
 * @title MintSetPriceAndList
 * @dev Comprehensive script that:
 *      1. Mints new NFTs
 *      2. Sets oracle prices for the minted NFTs
 *      3. Lists NFTs on the marketplace
 *
 * Environment Variables Required:
 * - PRIVATE_KEY: NFT owner's private key (must be NFT contract owner)
 * - ASSET_NFT_ADDRESS: Address of the AssetNFT contract
 * - PRICE_ORACLE_ADDRESS: Address of the NFTPriceOracle contract
 * - MARKETPLACE_ADDRESS: Address of the AssetMarketplace contract
 * - MINT_COUNT: Number of NFTs to mint (default: 10)
 * - PRICE_PER_NFT: Price per NFT in BNB (default: 0.01)
 * - ASSET_TYPE: Type of asset (default: "Real Estate")
 * - ASSET_VALUE: Value per asset in USD (default: 100000)
 * - BASE_URI: Base URI for NFT metadata (default: "ipfs://QmExample/")
 *
 * Usage:
 * forge script script/MintSetPriceAndList.s.sol:MintSetPriceAndListScript \
 *   --rpc-url $BSC_TESTNET_RPC_URL \
 *   --broadcast \
 *   -vvvv
 *
 * Example with custom parameters:
 * MINT_COUNT=50 PRICE_PER_NFT=0.05 ASSET_TYPE="Commercial Property" \
 * forge script script/MintSetPriceAndList.s.sol:MintSetPriceAndListScript \
 *   --rpc-url $BSC_TESTNET_RPC_URL \
 *   --broadcast \
 *   -vvvv
 */
contract MintSetPriceAndListScript is Script {
    function run() external {
        // Get environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address nftAddress = vm.envAddress("ASSET_NFT_ADDRESS");
        address oracleAddress = vm.envAddress("PRICE_ORACLE_ADDRESS");
        address marketplaceAddress = vm.envAddress("MARKETPLACE_ADDRESS");

        // Optional parameters with defaults
        uint256 mintCount = vm.envOr("MINT_COUNT", uint256(10));
        uint256 pricePerNFTEther = vm.envOr("PRICE_PER_NFT", uint256(1)); // Default 0.01 BNB (stored as 1 to avoid decimals)
        uint256 pricePerNFT = pricePerNFTEther * 10**16; // Convert to wei (0.01 BNB)
        string memory assetType = vm.envOr("ASSET_TYPE", string("Real Estate"));
        uint256 assetValue = vm.envOr("ASSET_VALUE", uint256(100000));
        string memory baseURI = vm.envOr("BASE_URI", string("ipfs://QmExample/"));

        console.log("===========================================");
        console.log("    Mint, Set Price & List NFTs");
        console.log("===========================================");
        console.log("Deployer:", deployer);
        console.log("NFT Contract:", nftAddress);
        console.log("Price Oracle:", oracleAddress);
        console.log("Marketplace:", marketplaceAddress);
        console.log("");
        console.log("=== Parameters ===");
        console.log("NFTs to Mint:", mintCount);
        console.log("Price per NFT:", pricePerNFTEther, "* 0.01 BNB");
        console.log("Asset Type:", assetType);
        console.log("Asset Value: $", assetValue);
        console.log("");

        AssetNFT nft = AssetNFT(nftAddress);
        NFTPriceOracle oracle = NFTPriceOracle(oracleAddress);
        AssetMarketplace marketplace = AssetMarketplace(marketplaceAddress);

        // Get starting token ID
        uint256 startingTokenId;
        try nft.ownerOf(0) {
            // NFTs exist, find the next available token ID
            startingTokenId = 0;
            for (uint256 i = 0; i < 10000; i++) {
                try nft.ownerOf(i) {
                    continue;
                } catch {
                    startingTokenId = i;
                    break;
                }
            }
        } catch {
            // No NFTs minted yet
            startingTokenId = 0;
        }

        console.log("Starting Token ID:", startingTokenId);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Mint NFTs
        console.log("=== Step 1: Minting NFTs ===");
        uint256[] memory mintedTokenIds = new uint256[](mintCount);

        for (uint256 i = 0; i < mintCount; i++) {
            uint256 tokenId = startingTokenId + i;

            // Create unique metadata for each NFT
            string memory assetName = string(abi.encodePacked("Asset #", vm.toString(tokenId)));
            string memory description = string(abi.encodePacked(
                assetType,
                " valued at $",
                vm.toString(assetValue)
            ));
            string memory uri = string(abi.encodePacked(baseURI, vm.toString(tokenId), ".json"));

            // Mint the NFT
            uint256 newTokenId = nft.mintAsset(
                deployer,
                uri,
                assetName,
                description,
                assetValue,
                assetType
            );

            mintedTokenIds[i] = newTokenId;

            // Progress indicator
            if ((i + 1) % 10 == 0 || i == mintCount - 1) {
                console.log("Minted %s / %s NFTs...", i + 1, mintCount);
            }
        }

        console.log("Successfully minted", mintCount, "NFTs");
        console.log("Token IDs:", startingTokenId, "to", startingTokenId + mintCount - 1);
        console.log("");

        // Step 2: Set Oracle Prices
        console.log("=== Step 2: Setting Oracle Prices ===");

        // Prepare arrays for batch update
        uint256[] memory prices = new uint256[](mintCount);
        for (uint256 i = 0; i < mintCount; i++) {
            prices[i] = pricePerNFT;
        }

        console.log("Setting prices for", mintCount, "NFTs in batch...");
        oracle.batchUpdateNFTPrices(nftAddress, mintedTokenIds, prices);
        console.log("All oracle prices set!");
        console.log("");

        // Update collection floor price if needed
        (uint256 currentFloorPrice, , ) = oracle.getFloorPrice(nftAddress);
        if (currentFloorPrice == 0 || pricePerNFT < currentFloorPrice) {
            console.log("Updating collection floor price to", pricePerNFTEther, "* 0.01 BNB");
            oracle.updateFloorPrice(nftAddress, pricePerNFT);
        }
        console.log("");

        // Step 3: Approve Marketplace
        console.log("=== Step 3: Approving Marketplace ===");
        bool isApproved = nft.isApprovedForAll(deployer, marketplaceAddress);
        if (!isApproved) {
            nft.setApprovalForAll(marketplaceAddress, true);
            console.log("Marketplace approved for all NFTs");
        } else {
            console.log("Marketplace already approved");
        }
        console.log("");

        // Step 4: List NFTs to Marketplace
        console.log("=== Step 4: Listing NFTs to Marketplace ===");

        for (uint256 i = 0; i < mintCount; i++) {
            uint256 tokenId = mintedTokenIds[i];

            // List NFT at oracle price
            marketplace.listNFTAtOraclePrice(nftAddress, tokenId);

            // Progress indicator
            if ((i + 1) % 10 == 0 || i == mintCount - 1) {
                console.log("Listed %s / %s NFTs...", i + 1, mintCount);
            }
        }

        console.log("All", mintCount, "NFTs listed successfully!");
        console.log("");

        vm.stopBroadcast();

        // Final Summary
        console.log("===========================================");
        console.log("              SUMMARY");
        console.log("===========================================");
        console.log("NFTs Minted:", mintCount);
        console.log("Token ID Range:", startingTokenId, "-", startingTokenId + mintCount - 1);
        console.log("Oracle Prices Set:", mintCount);
        console.log("Price per NFT:", pricePerNFTEther, "* 0.01 BNB");
        console.log("NFTs Listed:", mintCount);
        console.log("");
        console.log("Asset Type:", assetType);
        console.log("Asset Value per NFT: $", assetValue);
        console.log("");
        console.log("View NFT Collection on BscScan:");
        console.log("https://testnet.bscscan.com/address/", nftAddress);
        console.log("");
        console.log("View Marketplace on BscScan:");
        console.log("https://testnet.bscscan.com/address/", marketplaceAddress);
        console.log("===========================================");
    }
}
