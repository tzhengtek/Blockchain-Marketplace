// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {NFTPriceOracle} from "../src/NFTPriceOracle.sol";

contract DeployOracleScript is Script {
    function run() external {
        // Get private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying NFTPriceOracle with address:", deployer);
        console.log("Deployer balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy NFTPriceOracle
        console.log("\n=== Deploying NFTPriceOracle ===");
        NFTPriceOracle oracle = new NFTPriceOracle(deployer);
        console.log("NFTPriceOracle deployed at:", address(oracle));

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Contract: NFTPriceOracle");
        console.log("Address:", address(oracle));
        console.log("Owner:", deployer);
        console.log("\nNFTPriceOracle deployed successfully!");
    }
}
