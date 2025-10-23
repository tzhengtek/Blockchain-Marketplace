// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AssetMarketplace} from "../src/AssetMarketplace.sol";

contract DeployMarketplaceScript is Script {
    function run() external {
        // Get environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address kycRegistryAddress = vm.envAddress("KYC_REGISTRY_ADDRESS");

        console.log("=== Deploying AssetMarketplace ===");
        console.log("Deployer address:", deployer);
        console.log("KYC Registry:", kycRegistryAddress);
        console.log("Deployer balance:", deployer.balance / 10**18, "BNB");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy AssetMarketplace
        AssetMarketplace marketplace = new AssetMarketplace(
            kycRegistryAddress,
            deployer
        );

        console.log("\n=== AssetMarketplace Deployed ===");
        console.log("Address:", address(marketplace));
        console.log("Marketplace Fee (basis points):", marketplace.marketplaceFee());
        console.log("Owner:", marketplace.owner());

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("AssetMarketplace:", address(marketplace));
        console.log("\nView on BscScan:");
        console.log("https://testnet.bscscan.com/address/", address(marketplace));
        console.log("\n=== Next Steps ===");
        console.log("1. Update .env with: MARKETPLACE_ADDRESS=", address(marketplace));
        console.log("2. KYC verify users before they can list/buy");
        console.log("3. Users must approve marketplace before listing NFTs");
    }
}
