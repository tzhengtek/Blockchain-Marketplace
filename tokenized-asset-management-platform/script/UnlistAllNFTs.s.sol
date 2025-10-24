// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AssetNFT} from "../src/AssetNFT.sol";
import {AssetMarketplace} from "../src/AssetMarketplace.sol";

/**
 * @title UnlistAllNFTs
 * @dev Unlists (cancels) all active listings for NFTs owned by the caller
 *
 * Environment Variables Required:
 * - PRIVATE_KEY: NFT owner's private key
 * - ASSET_NFT_ADDRESS: Address of the RVA NFT contract
 * - MARKETPLACE_ADDRESS: Address of the marketplace
 * - TOTAL_NFTS: Total number of NFTs to check (default: 100)
 *
 * Usage:
 * forge script script/UnlistAllNFTs.s.sol:UnlistAllNFTsScript \
 *   --rpc-url $BSC_TESTNET_RPC_URL \
 *   --broadcast \
 *   -vvvv
 *
 * Note: Due to KYC checks in the marketplace that verify msg.sender,
 * we cannot use Multicall3 as it would change the msg.sender context.
 * Instead, this script efficiently batches cancellation calls in a loop.
 */
contract UnlistAllNFTsScript is Script {
    function run() external {
        // Get environment variables
        uint256 sellerPrivateKey = vm.envUint("PRIVATE_KEY");
        address seller = vm.addr(sellerPrivateKey);

        address nftAddress = vm.envAddress("ASSET_NFT_ADDRESS");
        address marketplaceAddress = vm.envAddress("MARKETPLACE_ADDRESS");

        // Default to 100 NFTs if not specified
        uint256 totalNFTs = vm.envOr("TOTAL_NFTS", uint256(100));

        console.log("===========================================");
        console.log("    Unlist All NFTs from Marketplace");
        console.log("===========================================");
        console.log("Seller:", seller);
        console.log("NFT Contract:", nftAddress);
        console.log("Marketplace:", marketplaceAddress);
        console.log("Checking", totalNFTs, "NFTs");
        console.log("");

        AssetNFT nft = AssetNFT(nftAddress);
        AssetMarketplace marketplace = AssetMarketplace(marketplaceAddress);

        // Find all active listings owned by the caller
        console.log("=== Scanning for Active Listings ===");
        uint256[] memory tokenIdsToCancel = new uint256[](totalNFTs);
        uint256 cancelCount = 0;

        for (uint256 i = 0; i < totalNFTs; i++) {
            try nft.ownerOf(i) returns (address owner) {
                // Check if this NFT is listed and owned by the caller
                (address listedSeller, , bool active) = marketplace.getListing(nftAddress, i);

                if (active && listedSeller == seller) {
                    tokenIdsToCancel[cancelCount] = i;
                    cancelCount++;
                    console.log("Found active listing for Token ID:", i);
                }
            } catch {
                // Token doesn't exist, skip
                continue;
            }
        }

        console.log("");
        console.log("Total active listings found:", cancelCount);
        console.log("");

        if (cancelCount == 0) {
            console.log("===========================================");
            console.log("    NO ACTIVE LISTINGS FOUND");
            console.log("===========================================");
            console.log("Nothing to unlist. Exiting.");
            return;
        }

        // Start broadcasting transactions
        vm.startBroadcast(sellerPrivateKey);

        console.log("=== Cancelling Listings ===");

        // Cancel all found listings
        for (uint256 i = 0; i < cancelCount; i++) {
            uint256 tokenId = tokenIdsToCancel[i];

            try marketplace.cancelListing(nftAddress, tokenId) {
                console.log("Cancelled listing for Token ID:", tokenId);

                // Progress indicator every 10 cancellations
                if ((i + 1) % 10 == 0) {
                    console.log("Progress: %s / %s listings cancelled", i + 1, cancelCount);
                }
            } catch Error(string memory reason) {
                console.log("Failed to cancel Token ID:", tokenId);
                console.log("Reason:", reason);
            } catch {
                console.log("Failed to cancel Token ID:", tokenId, "(unknown error)");
            }
        }

        vm.stopBroadcast();

        // Verify cancellations
        console.log("");
        console.log("=== Verifying Cancellations ===");
        uint256 stillActive = 0;

        for (uint256 i = 0; i < cancelCount; i++) {
            uint256 tokenId = tokenIdsToCancel[i];
            (, , bool active) = marketplace.getListing(nftAddress, tokenId);

            if (active) {
                stillActive++;
                console.log("Warning: Token ID", tokenId, "is still active");
            }
        }

        console.log("");
        console.log("===========================================");
        console.log("           UNLISTING COMPLETE");
        console.log("===========================================");
        console.log("Total listings found:", cancelCount);
        console.log("Successfully cancelled:", cancelCount - stillActive);
        if (stillActive > 0) {
            console.log("Failed to cancel:", stillActive);
        }
        console.log("");
        console.log("View Marketplace on BscScan:");
        console.log("https://testnet.bscscan.com/address/", marketplaceAddress);
        console.log("===========================================");
    }
}
