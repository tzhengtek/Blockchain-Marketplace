// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

contract AddKYCScript is Script {
    function run() external {
        // Get private key from environment
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address caller = vm.addr(privateKey);

        // Get KYC Registry address
        address kycRegistryAddress = vm.envAddress("KYC_REGISTRY_ADDRESS");

        // Get the address to verify
        address addressToVerify = vm.envAddress("USER_ADDRESS");

        console.log("=== Adding KYC Verification ===");
        console.log("Caller:", caller);
        console.log("KYCRegistry:", kycRegistryAddress);
        console.log("User to verify:", addressToVerify);

        // Load the KYC Registry contract
        KYCRegistry kycRegistry = KYCRegistry(kycRegistryAddress);

        vm.startBroadcast(privateKey);

        // Check if already verified
        bool isAlreadyVerified = kycRegistry.isKYCVerified(addressToVerify);

        if (isAlreadyVerified) {
            console.log("\nINFO: Address is already KYC verified!");
        } else {
            // Add KYC verification
            kycRegistry.addKYC(addressToVerify);
            console.log("\nSuccessfully added KYC verification!");
        }

        vm.stopBroadcast();

        // Verify the KYC status
        bool isVerified = kycRegistry.isKYCVerified(addressToVerify);
        console.log("\n=== Verification ===");
        console.log("Is KYC verified:", isVerified);

        if (isVerified) {
            console.log("\nSUCCESS: User can now interact with KYC-protected contracts!");
        }
    }
}
