// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {NFTPriceOracle} from "../src/NFTPriceOracle.sol";
import {AssetNFT} from "../src/AssetNFT.sol";
import {AssetMarketplace} from "../src/AssetMarketplace.sol";

contract SetOraclePricesAndListScript is Script {
    function run() external {
        // Get environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address oracleAddress = vm.envAddress("PRICE_ORACLE_ADDRESS");
        address nftAddress = vm.envAddress("ASSET_NFT_ADDRESS");
        address marketplaceAddress = vm.envAddress("MARKETPLACE_ADDRESS");

        // Price: 0.01 BNB in wei
        uint256 pricePerNFT = 0.01 ether;

        console.log("=== Setting Oracle Prices and Listing NFTs ===");
        console.log("Oracle Contract:", oracleAddress);
        console.log("NFT Collection:", nftAddress);
        console.log("Marketplace:", marketplaceAddress);
        console.log("Price per NFT: 0.01 BNB");
        console.log("Caller:", deployer);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        NFTPriceOracle oracle = NFTPriceOracle(oracleAddress);
        AssetNFT nft = AssetNFT(nftAddress);
        AssetMarketplace marketplace = AssetMarketplace(marketplaceAddress);

        // Step 1: Set oracle prices using batch update (built-in multicall approach)
        console.log("=== Step 1: Setting Oracle Prices ===");
        uint256 totalNFTs = 100;

        // Prepare arrays for batch update
        uint256[] memory tokenIds = new uint256[](totalNFTs);
        uint256[] memory prices = new uint256[](totalNFTs);

        for (uint256 i = 0; i < totalNFTs; i++) {
            tokenIds[i] = i;
            prices[i] = pricePerNFT;
        }

        console.log("Setting prices for all 100 NFTs in one transaction...");
        oracle.batchUpdateNFTPrices(nftAddress, tokenIds, prices);
        console.log("All prices set!");
        console.log("");

        // Set floor price for the collection
        console.log("Setting collection floor price to 0.01 BNB");
        oracle.updateFloorPrice(nftAddress, pricePerNFT);
        console.log("");

        // Step 2: Approve marketplace for all NFTs
        console.log("=== Step 2: Approving Marketplace ===");
        bool isApproved = nft.isApprovedForAll(deployer, marketplaceAddress);
        if (!isApproved) {
            nft.setApprovalForAll(marketplaceAddress, true);
            console.log("Marketplace approved for all NFTs");
        } else {
            console.log("Marketplace already approved");
        }
        console.log("");

        // Step 3: List all NFTs at oracle price
        console.log("=== Step 3: Listing NFTs to Marketplace ===");

        // Note: Cannot use Multicall3 because the marketplace has a KYC check that verifies msg.sender
        // When using multicall, msg.sender becomes the multicall contract, not the actual caller
        for (uint256 i = 0; i < totalNFTs; i++) {
            marketplace.listNFTAtOraclePrice(nftAddress, i);

            if ((i + 1) % 10 == 0) {
                console.log("Listed", i + 1, "NFTs...");
            }
        }
        console.log("All 100 NFTs listed!");
        console.log("");

        vm.stopBroadcast();

        console.log("===========================================");
        console.log("              SUMMARY");
        console.log("===========================================");
        console.log("Oracle Prices Set: 100 NFTs");
        console.log("Price per NFT: 0.01 BNB");
        console.log("Floor price: 0.01 BNB");
        console.log("NFTs Listed: 100");
        console.log("");
        console.log("All operations completed successfully!");
        console.log("===========================================");
    }
}
