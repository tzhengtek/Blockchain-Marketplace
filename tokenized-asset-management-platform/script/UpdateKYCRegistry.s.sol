// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AssetNFT} from "../src/AssetNFT.sol";
import {AssetToken} from "../src/AssetToken.sol";
import {AssetMarketplace} from "../src/AssetMarketplace.sol";

/**
 * @title UpdateKYCRegistry
 * @dev Updates the KYC Registry address in all deployed contracts
 *
 * Usage:
 * forge script script/UpdateKYCRegistry.s.sol:UpdateKYCRegistryScript \
 *   --rpc-url $BSC_TESTNET_RPC_URL \
 *   --broadcast \
 *   -vvvv
 */
contract UpdateKYCRegistryScript is Script {
    function run() external {
        // Get environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Get the KYC Registry address to use (the existing one)
        address kycRegistryAddress = vm.envAddress("KYC_REGISTRY_ADDRESS");

        // Get deployed contract addresses
        address assetNFTAddress = vm.envAddress("ASSET_NFT_ADDRESS");
        address assetTokenAddress = vm.envAddress("ASSET_TOKEN_ADDRESS");
        address marketplaceAddress = vm.envAddress("MARKETPLACE_ADDRESS");

        console.log("===========================================");
        console.log("     Updating KYC Registry Addresses");
        console.log("===========================================");
        console.log("Deployer:", deployer);
        console.log("Target KYC Registry:", kycRegistryAddress);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Update AssetNFT
        console.log("=== Updating RealVault Assets (RVA) ===");
        console.log("Contract:", assetNFTAddress);
        AssetNFT assetNFT = AssetNFT(assetNFTAddress);
        address oldNFTKYC = address(assetNFT.kycRegistry());
        console.log("Old KYC Registry:", oldNFTKYC);

        if (oldNFTKYC != kycRegistryAddress) {
            assetNFT.updateKYCRegistry(kycRegistryAddress);
            console.log("New KYC Registry:", address(assetNFT.kycRegistry()));
            console.log("Status: Updated successfully!");
        } else {
            console.log("Status: Already using correct KYC Registry");
        }
        console.log("");

        // Update AssetToken
        console.log("=== Updating RealVault Protocol (RVP) ===");
        console.log("Contract:", assetTokenAddress);
        AssetToken assetToken = AssetToken(assetTokenAddress);
        address oldTokenKYC = address(assetToken.kycRegistry());
        console.log("Old KYC Registry:", oldTokenKYC);

        if (oldTokenKYC != kycRegistryAddress) {
            assetToken.updateKYCRegistry(kycRegistryAddress);
            console.log("New KYC Registry:", address(assetToken.kycRegistry()));
            console.log("Status: Updated successfully!");
        } else {
            console.log("Status: Already using correct KYC Registry");
        }
        console.log("");

        // Update AssetMarketplace
        console.log("=== Updating AssetMarketplace ===");
        console.log("Contract:", marketplaceAddress);
        AssetMarketplace marketplace = AssetMarketplace(marketplaceAddress);
        address oldMarketplaceKYC = address(marketplace.kycRegistry());
        console.log("Old KYC Registry:", oldMarketplaceKYC);

        if (oldMarketplaceKYC != kycRegistryAddress) {
            marketplace.updateKYCRegistry(kycRegistryAddress);
            console.log("New KYC Registry:", address(marketplace.kycRegistry()));
            console.log("Status: Updated successfully!");
        } else {
            console.log("Status: Already using correct KYC Registry");
        }
        console.log("");

        vm.stopBroadcast();

        console.log("===========================================");
        console.log("         UPDATE SUMMARY");
        console.log("===========================================");
        console.log("All contracts now use KYC Registry:");
        console.log(kycRegistryAddress);
        console.log("");
        console.log("Contracts Updated:");
        console.log("  - RealVault Assets (RVA):", assetNFTAddress);
        console.log("  - RealVault Protocol (RVP):", assetTokenAddress);
        console.log("  - AssetMarketplace:", marketplaceAddress);
        console.log("");
        console.log("===========================================");
        console.log("KYC Registry update completed successfully!");
        console.log("===========================================");
    }
}
