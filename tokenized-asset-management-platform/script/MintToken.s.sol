// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AssetToken} from "../src/AssetToken.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

/**
 * @title MintToken
 * @dev Mints RealVault Protocol (RVP) tokens to a specified address
 *
 * Environment Variables Required:
 * - PRIVATE_KEY: Deployer's private key (must be owner)
 * - ASSET_TOKEN_ADDRESS: Address of the RVP token contract
 * - KYC_REGISTRY_ADDRESS: Address of the KYC registry
 * - MINT_TO_ADDRESS: Recipient address (must be KYC verified)
 * - MINT_AMOUNT: Amount to mint (in tokens, not wei)
 *
 * Usage:
 * forge script script/MintToken.s.sol:MintTokenScript \
 *   --rpc-url $BSC_TESTNET_RPC_URL \
 *   --broadcast \
 *   -vvvv
 */
contract MintTokenScript is Script {
    function run() external {
        // Get environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address tokenAddress = vm.envAddress("ASSET_TOKEN_ADDRESS");
        address kycRegistryAddress = vm.envAddress("KYC_REGISTRY_ADDRESS");
        address mintToAddress = vm.envAddress("MINT_TO_ADDRESS");
        uint256 mintAmount = vm.envUint("MINT_AMOUNT"); // Amount in tokens

        console.log("===========================================");
        console.log("     Minting RealVault Protocol (RVP)");
        console.log("===========================================");
        console.log("Deployer (Owner):", deployer);
        console.log("Token Contract:", tokenAddress);
        console.log("Mint To:", mintToAddress);
        console.log("Amount:", mintAmount, "RVP");
        console.log("");

        AssetToken token = AssetToken(tokenAddress);
        KYCRegistry kycRegistry = KYCRegistry(kycRegistryAddress);

        // Pre-flight checks
        console.log("=== Pre-flight Checks ===");

        // Check owner
        address owner = token.owner();
        console.log("Token Owner:", owner);
        require(owner == deployer, "Caller is not the token owner");
        console.log("✓ Caller is owner");

        // Check deployer KYC
        bool deployerKYC = kycRegistry.isKYCVerified(deployer);
        console.log("Deployer KYC:", deployerKYC);
        require(deployerKYC, "Deployer is not KYC verified");
        console.log("✓ Deployer is KYC verified");

        // Check recipient KYC
        bool recipientKYC = kycRegistry.isKYCVerified(mintToAddress);
        console.log("Recipient KYC:", recipientKYC);
        require(recipientKYC, "Recipient is not KYC verified");
        console.log("✓ Recipient is KYC verified");

        // Get balances before
        uint256 balanceBefore = token.balanceOf(mintToAddress);
        uint256 totalSupplyBefore = token.totalSupply();
        console.log("");
        console.log("=== Before Minting ===");
        console.log("Recipient Balance:", balanceBefore / 10**18, "RVP");
        console.log("Total Supply:", totalSupplyBefore / 10**18, "RVP");
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Mint tokens (convert to wei)
        uint256 mintAmountWei = mintAmount * 10**18;
        token.mint(mintToAddress, mintAmountWei);

        vm.stopBroadcast();

        // Get balances after
        uint256 balanceAfter = token.balanceOf(mintToAddress);
        uint256 totalSupplyAfter = token.totalSupply();

        console.log("=== After Minting ===");
        console.log("Recipient Balance:", balanceAfter / 10**18, "RVP");
        console.log("Total Supply:", totalSupplyAfter / 10**18, "RVP");
        console.log("");
        console.log("===========================================");
        console.log("Minted:", mintAmount, "RVP to", mintToAddress);
        console.log("Transaction successful!");
        console.log("===========================================");
    }
}
