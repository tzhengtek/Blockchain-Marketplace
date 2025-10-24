// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

/**
 * @title AddMulticallToKYC
 * @dev Adds the Multicall3 contract to the KYC registry to enable batch operations
 *
 * This allows the UnlistAllNFTsMulticall script to work by whitelisting the
 * Multicall3 contract address in the KYC registry.
 *
 * Environment Variables Required:
 * - PRIVATE_KEY: Owner's private key (must be KYC registry owner)
 * - KYC_REGISTRY_ADDRESS: Address of the KYC registry
 *
 * Usage:
 * forge script script/AddMulticallToKYC.s.sol:AddMulticallToKYCScript \
 *   --rpc-url $BSC_TESTNET_RPC_URL \
 *   --broadcast \
 *   -vvvv
 */
contract AddMulticallToKYCScript is Script {
    // Multicall3 canonical address (same on all chains)
    address constant MULTICALL3 = 0xcA11bde05977b3631167028862bE2a173976CA11;

    function run() external {
        // Get environment variables
        uint256 ownerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(ownerPrivateKey);
        address kycRegistryAddress = vm.envAddress("KYC_REGISTRY_ADDRESS");

        console.log("===========================================");
        console.log("   Add Multicall3 to KYC Registry");
        console.log("===========================================");
        console.log("Owner:", owner);
        console.log("KYC Registry:", kycRegistryAddress);
        console.log("Multicall3:", MULTICALL3);
        console.log("");

        KYCRegistry kycRegistry = KYCRegistry(kycRegistryAddress);

        // Check if already verified
        bool isAlreadyVerified = kycRegistry.isKYCVerified(MULTICALL3);
        console.log("Current KYC Status:", isAlreadyVerified ? "Verified" : "Not Verified");
        console.log("");

        if (isAlreadyVerified) {
            console.log("===========================================");
            console.log("  Multicall3 is already KYC verified!");
            console.log("===========================================");
            console.log("No action needed. You can now use the");
            console.log("UnlistAllNFTsMulticall script.");
            return;
        }

        vm.startBroadcast(ownerPrivateKey);

        console.log("=== Adding Multicall3 to KYC Registry ===");
        kycRegistry.addKYC(MULTICALL3);

        vm.stopBroadcast();

        // Verify
        bool isVerified = kycRegistry.isKYCVerified(MULTICALL3);

        console.log("");
        console.log("===========================================");
        console.log("        MULTICALL3 WHITELISTED");
        console.log("===========================================");
        console.log("Address:", MULTICALL3);
        console.log("KYC Status:", isVerified ? "Verified" : "Failed");
        console.log("");

        if (isVerified) {
            console.log("Success! You can now use multicall for:");
            console.log("- Batch unlisting NFTs");
            console.log("- Batch listing NFTs");
            console.log("- Other batch operations");
            console.log("");
            console.log("Run the multicall script:");
            console.log("forge script script/UnlistAllNFTsMulticall.s.sol:UnlistAllNFTsMulticallScript \\");
            console.log("  --rpc-url $BSC_TESTNET_RPC_URL \\");
            console.log("  --broadcast \\");
            console.log("  -vvvv");
        } else {
            console.log("Failed to verify Multicall3.");
            console.log("Please check the transaction and try again.");
        }

        console.log("===========================================");
    }
}
