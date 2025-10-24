// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AssetNFT} from "../src/AssetNFT.sol";
import {AssetMarketplace} from "../src/AssetMarketplace.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ListNFTToMarketplace
 * @dev Lists a RealVault Assets (RVA) NFT on the AssetMarketplace
 *
 * Environment Variables Required:
 * - PRIVATE_KEY: NFT owner's private key
 * - ASSET_NFT_ADDRESS: Address of the RVA NFT contract
 * - MARKETPLACE_ADDRESS: Address of the marketplace
 * - KYC_REGISTRY_ADDRESS: Address of the KYC registry
 * - TOKEN_ID: Token ID to list
 * - LISTING_PRICE: Price in BNB (in ether, e.g., 0.5 for 0.5 BNB)
 *
 * Usage:
 * forge script script/ListNFTToMarketplace.s.sol:ListNFTToMarketplaceScript \
 *   --rpc-url $BSC_TESTNET_RPC_URL \
 *   --broadcast \
 *   -vvvv
 */
contract ListNFTToMarketplaceScript is Script {
    function run() external {
        // Get environment variables
        uint256 sellerPrivateKey = vm.envUint("PRIVATE_KEY");
        address seller = vm.addr(sellerPrivateKey);

        address nftAddress = vm.envAddress("ASSET_NFT_ADDRESS");
        address marketplaceAddress = vm.envAddress("MARKETPLACE_ADDRESS");
        address kycRegistryAddress = vm.envAddress("KYC_REGISTRY_ADDRESS");

        uint256 tokenId = vm.envUint("TOKEN_ID");
        uint256 listingPriceEther = vm.envUint("LISTING_PRICE"); // In ether (e.g., 1 = 1 BNB)

        // Convert to wei
        uint256 listingPrice = listingPriceEther * 10**18;

        console.log("===========================================");
        console.log("    List NFT on AssetMarketplace");
        console.log("===========================================");
        console.log("Seller:", seller);
        console.log("NFT Contract:", nftAddress);
        console.log("Marketplace:", marketplaceAddress);
        console.log("Token ID:", tokenId);
        console.log("Listing Price:", listingPriceEther, "BNB");
        console.log("");

        AssetNFT nft = AssetNFT(nftAddress);
        AssetMarketplace marketplace = AssetMarketplace(marketplaceAddress);
        KYCRegistry kycRegistry = KYCRegistry(kycRegistryAddress);

        // Pre-flight checks
        console.log("=== Pre-flight Checks ===");

        // Check ownership
        address nftOwner = nft.ownerOf(tokenId);
        console.log("NFT Owner:", nftOwner);
        require(nftOwner == seller, "Caller is not the NFT owner");
        console.log("✓ Caller owns the NFT");

        // Check seller KYC
        bool sellerKYC = kycRegistry.isKYCVerified(seller);
        console.log("Seller KYC:", sellerKYC);
        require(sellerKYC, "Seller is not KYC verified");
        console.log("✓ Seller is KYC verified");

        // Check if already listed
        (address currentSeller, uint256 currentPrice, bool active) = marketplace.getListing(nftAddress, tokenId);
        if (active) {
            console.log("⚠ Warning: NFT is already listed");
            console.log("  Current Seller:", currentSeller);
            console.log("  Current Price:", currentPrice / 10**18, "BNB");
            console.log("");
            console.log("Cancelling existing listing first...");
        }

        // Get NFT metadata
        AssetNFT.AssetMetadata memory metadata = nft.getAssetMetadata(tokenId);
        console.log("");
        console.log("=== NFT Details ===");
        console.log("Name:", metadata.name);
        console.log("Type:", metadata.assetType);
        console.log("Value: $", metadata.value);
        console.log("");

        vm.startBroadcast(sellerPrivateKey);

        // Cancel existing listing if active
        if (active && currentSeller == seller) {
            marketplace.cancelListing(nftAddress, tokenId);
            console.log("✓ Cancelled previous listing");
        }

        // Check approval
        address approvedAddress = nft.getApproved(tokenId);
        bool isApprovedForAll = nft.isApprovedForAll(seller, marketplaceAddress);

        if (approvedAddress != marketplaceAddress && !isApprovedForAll) {
            console.log("=== Approving Marketplace ===");
            nft.approve(marketplaceAddress, tokenId);
            console.log("✓ Marketplace approved for token", tokenId);
            console.log("");
        } else {
            console.log("✓ Marketplace already approved");
            console.log("");
        }

        // List NFT
        console.log("=== Listing NFT ===");
        marketplace.listNFT(nftAddress, tokenId, listingPrice);

        vm.stopBroadcast();

        // Verify listing
        (address listedSeller, uint256 listedPrice, bool isActive) = marketplace.getListing(nftAddress, tokenId);

        console.log("");
        console.log("===========================================");
        console.log("       NFT LISTED SUCCESSFULLY");
        console.log("===========================================");
        console.log("Token ID:", tokenId);
        console.log("Seller:", listedSeller);
        console.log("Price:", listedPrice / 10**18, "BNB");
        console.log("Status:", isActive ? "Active" : "Inactive");
        console.log("");
        console.log("Marketplace Fee: 2.5%");
        console.log("Seller will receive:", (listedPrice * 9750 / 10000) / 10**18, "BNB");
        console.log("Platform fee:", (listedPrice * 250 / 10000) / 10**18, "BNB");
        console.log("");
        console.log("View Marketplace on BscScan:");
        console.log("https://testnet.bscscan.com/address/", marketplaceAddress);
        console.log("");
        console.log("View NFT on BscScan:");
        console.log("https://testnet.bscscan.com/nft/", nftAddress, "/", tokenId);
        console.log("===========================================");
    }
}
