// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";
import {AssetNFT} from "../src/AssetNFT.sol";
import {AssetToken} from "../src/AssetToken.sol";

contract DeployScript is Script {
    function run() external {
        // Get private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with address:", deployer);
        console.log("Deployer balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy KYCRegistry
        console.log("\n=== Deploying KYCRegistry ===");
        KYCRegistry kycRegistry = new KYCRegistry(deployer);
        console.log("KYCRegistry deployed at:", address(kycRegistry));

        // 2. Deploy AssetNFT
        console.log("\n=== Deploying AssetNFT ===");
        AssetNFT assetNFT = new AssetNFT(
            "Asset NFT",
            "ANFT",
            deployer,
            address(kycRegistry)
        );
        console.log("AssetNFT deployed at:", address(assetNFT));

        // 3. Deploy AssetToken
        console.log("\n=== Deploying AssetToken ===");
        AssetToken assetToken = new AssetToken(
            "Asset Token",
            "ATK",
            18, // decimals
            1000000, // initial supply (1,000,000 tokens)
            deployer,
            address(kycRegistry)
        );
        console.log("AssetToken deployed at:", address(assetToken));

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Contract: KYCRegistry");
        console.log("Address:", address(kycRegistry));
        console.log("");
        console.log("Contract: AssetNFT");
        console.log("Address:", address(assetNFT));
        console.log("");
        console.log("Contract: AssetToken");
        console.log("Address:", address(assetToken));
        console.log("");
        console.log("Owner:", deployer);
        console.log("\nAll contracts deployed successfully!");
    }
}
