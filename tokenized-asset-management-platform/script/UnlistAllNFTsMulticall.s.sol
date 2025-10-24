// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AssetNFT} from "../src/AssetNFT.sol";
import {AssetMarketplace} from "../src/AssetMarketplace.sol";
import {IMulticall3} from "forge-std/interfaces/IMulticall3.sol";

/**
 * @title UnlistAllNFTsMulticall
 * @dev Unlists all NFTs using Multicall3 for batched transactions
 *
 * ⚠️ WARNING: This script will NOT work with the current marketplace contract
 * because cancelListing has a msg.sender check. When using Multicall3,
 * msg.sender becomes the Multicall3 contract, not your address.
 *
 * This script is provided as a reference for future contract versions
 * or other use cases where multicall can be used.
 *
 * For the current marketplace, use UnlistAllNFTs.s.sol instead.
 *
 * Environment Variables Required:
 * - PRIVATE_KEY: NFT owner's private key
 * - ASSET_NFT_ADDRESS: Address of the RVA NFT contract
 * - MARKETPLACE_ADDRESS: Address of the marketplace
 * - MULTICALL3_ADDRESS: Address of Multicall3 (default: 0xcA11bde05977b3631167028862bE2a173976CA11)
 * - TOTAL_NFTS: Total number of NFTs to check (default: 100)
 * - BATCH_SIZE: Number of calls per multicall batch (default: 50)
 *
 * Usage:
 * forge script script/UnlistAllNFTsMulticall.s.sol:UnlistAllNFTsMulticallScript \
 *   --rpc-url $BSC_TESTNET_RPC_URL \
 *   --broadcast \
 *   -vvvv
 */
contract UnlistAllNFTsMulticallScript is Script {
    // Multicall3 is deployed at the same address on most chains
    address constant MULTICALL3_DEFAULT = 0xcA11bde05977b3631167028862bE2a173976CA11;

    function run() external {
        // Get environment variables
        uint256 sellerPrivateKey = vm.envUint("PRIVATE_KEY");
        address seller = vm.addr(sellerPrivateKey);

        address nftAddress = vm.envAddress("ASSET_NFT_ADDRESS");
        address marketplaceAddress = vm.envAddress("MARKETPLACE_ADDRESS");
        address multicall3Address = vm.envOr("MULTICALL3_ADDRESS", MULTICALL3_DEFAULT);

        uint256 totalNFTs = vm.envOr("TOTAL_NFTS", uint256(100));
        uint256 batchSize = vm.envOr("BATCH_SIZE", uint256(50));

        console.log("===========================================");
        console.log("  Unlist All NFTs (Multicall3 Version)");
        console.log("===========================================");
        console.log("Seller:", seller);
        console.log("NFT Contract:", nftAddress);
        console.log("Marketplace:", marketplaceAddress);
        console.log("Multicall3:", multicall3Address);
        console.log("Checking", totalNFTs, "NFTs");
        console.log("Batch Size:", batchSize);
        console.log("");

        console.log("WARNING: This script may fail due to KYC checks!");
        console.log("Use UnlistAllNFTs.s.sol for the current marketplace.");
        console.log("");

        AssetNFT nft = AssetNFT(nftAddress);
        AssetMarketplace marketplace = AssetMarketplace(marketplaceAddress);
        IMulticall3 multicall = IMulticall3(multicall3Address);

        // Step 1: Use multicall to batch-read all listings
        console.log("=== Step 1: Scanning Listings (Multicall) ===");

        IMulticall3.Call3[] memory readCalls = new IMulticall3.Call3[](totalNFTs);

        for (uint256 i = 0; i < totalNFTs; i++) {
            readCalls[i] = IMulticall3.Call3({
                target: marketplaceAddress,
                allowFailure: true,
                callData: abi.encodeWithSelector(
                    marketplace.getListing.selector,
                    nftAddress,
                    i
                )
            });
        }

        // Execute multicall for reading
        IMulticall3.Result[] memory results = multicall.aggregate3(readCalls);

        // Parse results to find active listings owned by seller
        uint256[] memory tokenIdsToCancel = new uint256[](totalNFTs);
        uint256 cancelCount = 0;

        for (uint256 i = 0; i < totalNFTs; i++) {
            if (results[i].success) {
                (address listedSeller, , bool active) = abi.decode(
                    results[i].returnData,
                    (address, uint256, bool)
                );

                if (active && listedSeller == seller) {
                    tokenIdsToCancel[cancelCount] = i;
                    cancelCount++;
                    console.log("Found active listing for Token ID:", i);
                }
            }
        }

        console.log("");
        console.log("Total active listings found:", cancelCount);
        console.log("");

        if (cancelCount == 0) {
            console.log("===========================================");
            console.log("    NO ACTIVE LISTINGS FOUND");
            console.log("===========================================");
            return;
        }

        // Step 2: Batch cancel listings using multicall
        console.log("=== Step 2: Cancelling Listings (Batched) ===");

        vm.startBroadcast(sellerPrivateKey);

        // Process in batches
        uint256 processed = 0;
        while (processed < cancelCount) {
            uint256 currentBatchSize = cancelCount - processed;
            if (currentBatchSize > batchSize) {
                currentBatchSize = batchSize;
            }

            // Prepare batch of cancel calls
            IMulticall3.Call3[] memory cancelCalls = new IMulticall3.Call3[](currentBatchSize);

            for (uint256 i = 0; i < currentBatchSize; i++) {
                uint256 tokenId = tokenIdsToCancel[processed + i];
                cancelCalls[i] = IMulticall3.Call3({
                    target: marketplaceAddress,
                    allowFailure: true,
                    callData: abi.encodeWithSelector(
                        marketplace.cancelListing.selector,
                        nftAddress,
                        tokenId
                    )
                });
            }

            console.log("Processing batch:", processed / batchSize + 1);
            console.log("Batch size:", currentBatchSize);

            // Execute multicall batch
            try multicall.aggregate3(cancelCalls) returns (IMulticall3.Result[] memory batchResults) {
                // Check results
                uint256 successCount = 0;
                for (uint256 i = 0; i < currentBatchSize; i++) {
                    if (batchResults[i].success) {
                        successCount++;
                    } else {
                        uint256 tokenId = tokenIdsToCancel[processed + i];
                        console.log("Failed to cancel Token ID:", tokenId);
                    }
                }
                console.log("Successfully cancelled:", successCount, "/", currentBatchSize);
            } catch Error(string memory reason) {
                console.log("Batch failed with reason:", reason);
            } catch {
                console.log("Batch failed (unknown error)");
            }

            processed += currentBatchSize;
            console.log("");
        }

        vm.stopBroadcast();

        // Verify cancellations
        console.log("=== Verifying Cancellations ===");
        uint256 stillActive = 0;

        for (uint256 i = 0; i < cancelCount; i++) {
            uint256 tokenId = tokenIdsToCancel[i];
            (, , bool active) = marketplace.getListing(nftAddress, tokenId);

            if (active) {
                stillActive++;
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
            console.log("");
            console.log("Note: Failures expected due to KYC/msg.sender checks");
            console.log("Use UnlistAllNFTs.s.sol for the current marketplace");
        }
        console.log("===========================================");
    }
}
