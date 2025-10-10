// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

contract AddKYCBatchScript is Script {
    function run() external {
        // Get private key from environment
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address caller = vm.addr(privateKey);

        // Get KYC Registry address
        address kycRegistryAddress = vm.envAddress("KYC_REGISTRY_ADDRESS");

        console.log("=== Batch Adding KYC Verifications ===");
        console.log("Caller:", caller);
        console.log("KYCRegistry:", kycRegistryAddress);

        // Parse addresses from environment (comma-separated)
        // Example: USER_ADDRESSES=0x123...,0x456...,0x789...
        string memory addressesStr = vm.envString("USER_ADDRESSES");

        // For demonstration, we'll use a predefined array
        // In production, you'd parse the comma-separated string
        address[] memory addressesToVerify = new address[](3);

        // You can modify these addresses or read from env
        // For now, reading individual addresses
        try vm.envAddress("USER_ADDRESS_1") returns (address addr1) {
            addressesToVerify[0] = addr1;
        } catch {
            console.log("USER_ADDRESS_1 not found, using zero address");
            addressesToVerify[0] = address(0);
        }

        try vm.envAddress("USER_ADDRESS_2") returns (address addr2) {
            addressesToVerify[1] = addr2;
        } catch {
            console.log("USER_ADDRESS_2 not found");
            addressesToVerify[1] = address(0);
        }

        try vm.envAddress("USER_ADDRESS_3") returns (address addr3) {
            addressesToVerify[2] = addr3;
        } catch {
            console.log("USER_ADDRESS_3 not found");
            addressesToVerify[2] = address(0);
        }

        // Count valid addresses
        uint256 validCount = 0;
        for (uint256 i = 0; i < addressesToVerify.length; i++) {
            if (addressesToVerify[i] != address(0)) {
                validCount++;
                console.log("Address", i + 1, ":", addressesToVerify[i]);
            }
        }

        require(validCount > 0, "No valid addresses provided");

        // Create array with only valid addresses
        address[] memory validAddresses = new address[](validCount);
        uint256 index = 0;
        for (uint256 i = 0; i < addressesToVerify.length; i++) {
            if (addressesToVerify[i] != address(0)) {
                validAddresses[index] = addressesToVerify[i];
                index++;
            }
        }

        // Load the KYC Registry contract
        KYCRegistry kycRegistry = KYCRegistry(kycRegistryAddress);

        vm.startBroadcast(privateKey);

        // Add KYC verifications in batch
        kycRegistry.addKYCBatch(validAddresses);
        console.log("\nSuccessfully added", validCount, "KYC verifications!");

        vm.stopBroadcast();

        // Verify all addresses
        console.log("\n=== Verification ===");
        bool allVerified = true;
        for (uint256 i = 0; i < validAddresses.length; i++) {
            bool isVerified = kycRegistry.isKYCVerified(validAddresses[i]);
            console.log("Address", validAddresses[i], "verified:", isVerified);
            if (!isVerified) allVerified = false;
        }

        if (allVerified) {
            console.log("\nSUCCESS: All users can now interact with KYC-protected contracts!");
        }
    }
}
