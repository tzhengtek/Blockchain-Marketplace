// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

contract AddAuthorizedAddressScript is Script {
    function run() external {
        // Get private key and addresses from environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Get KYC Registry address from environment
        address kycRegistryAddress = vm.envAddress("KYC_REGISTRY_ADDRESS");

        // Get the address to authorize from environment
        address addressToAuthorize = vm.envAddress("AUTHORIZED_ADDRESS");

        console.log("=== Adding Authorized Address to KYCRegistry ===");
        console.log("Caller:", deployer);
        console.log("KYCRegistry:", kycRegistryAddress);
        console.log("Address to authorize:", addressToAuthorize);

        // Load the KYC Registry contract
        KYCRegistry kycRegistry = KYCRegistry(kycRegistryAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Check if already authorized
        bool isAlreadyAuthorized = kycRegistry.isAuthorized(addressToAuthorize);

        if (isAlreadyAuthorized) {
            console.log("\nWARNING: Address is already authorized!");
            console.log("Skipping...");
        } else {
            // Add authorized address
            kycRegistry.addAuthorizedAddress(addressToAuthorize);
            console.log("\nSuccessfully authorized address!");
        }

        vm.stopBroadcast();

        // Verify the authorization
        bool isAuthorized = kycRegistry.isAuthorized(addressToAuthorize);
        console.log("\n=== Verification ===");
        console.log("Is authorized:", isAuthorized);

        if (isAuthorized) {
            console.log("\nSUCCESS: Address can now manage KYC verifications!");
        }
    }
}
