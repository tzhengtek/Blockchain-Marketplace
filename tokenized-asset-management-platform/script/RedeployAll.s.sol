// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";
import {AssetNFT} from "../src/AssetNFT.sol";
import {AssetToken} from "../src/AssetToken.sol";
import {AssetMarketplace} from "../src/AssetMarketplace.sol";

/**
 * @title RedeployAll
 * @dev Complete redeployment script with new RealVault branding
 *
 * Usage:
 * forge script script/RedeployAll.s.sol:RedeployAllScript \
 *   --rpc-url $BSC_TESTNET_RPC_URL \
 *   --broadcast \
 *   --verify \
 *   -vvvv
 */
contract RedeployAllScript is Script {
    function run() external {
        // Get private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("===========================================");
        console.log("  RealVault Platform - Full Deployment");
        console.log("===========================================");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance / 10**18, "BNB");
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy KYCRegistry
        console.log("=== Step 1/4: Deploying KYCRegistry ===");
        KYCRegistry kycRegistry = new KYCRegistry(deployer);
        console.log("KYCRegistry deployed at:", address(kycRegistry));
        console.log("");

        // 2. Deploy AssetNFT (RealVault Assets)
        console.log("=== Step 2/4: Deploying RealVault Assets NFT ===");
        AssetNFT assetNFT = new AssetNFT(
            "RealVault Assets",
            "RVA",
            deployer,
            address(kycRegistry)
        );
        console.log("RealVault Assets (RVA) deployed at:", address(assetNFT));
        console.log("");

        // 3. Deploy AssetToken (RealVault Protocol)
        console.log("=== Step 3/4: Deploying RealVault Protocol Token ===");
        AssetToken assetToken = new AssetToken(
            "RealVault Protocol",
            "RVP",
            18, // decimals
            1000000, // initial supply (1,000,000 tokens)
            deployer,
            address(kycRegistry)
        );
        console.log("RealVault Protocol (RVP) deployed at:", address(assetToken));
        console.log("Initial supply: 1,000,000 RVP");
        console.log("");

        // 4. Deploy AssetMarketplace
        console.log("=== Step 4/4: Deploying AssetMarketplace ===");
        AssetMarketplace marketplace = new AssetMarketplace(
            address(kycRegistry),
            deployer
        );
        console.log("AssetMarketplace deployed at:", address(marketplace));
        console.log("Marketplace fee:", marketplace.marketplaceFee(), "basis points (2.5%)");
        console.log("");

        // Auto-verify deployer in KYC registry
        console.log("=== Auto-verifying deployer in KYC ===");
        kycRegistry.addKYC(deployer);
        console.log("Deployer KYC verified:", kycRegistry.isKYCVerified(deployer));
        console.log("");

        vm.stopBroadcast();

        // Deployment Summary
        console.log("===========================================");
        console.log("       DEPLOYMENT SUMMARY - REALVAULT");
        console.log("===========================================");
        console.log("");
        console.log("KYCRegistry:");
        console.log("  Address:", address(kycRegistry));
        console.log("  Owner:", kycRegistry.owner());
        console.log("");
        console.log("RealVault Assets (NFT):");
        console.log("  Address:", address(assetNFT));
        console.log("  Name: RealVault Assets");
        console.log("  Symbol: RVA");
        console.log("");
        console.log("RealVault Protocol (Token):");
        console.log("  Address:", address(assetToken));
        console.log("  Name: RealVault Protocol");
        console.log("  Symbol: RVP");
        console.log("  Decimals: 18");
        console.log("  Initial Supply: 1,000,000 RVP");
        console.log("");
        console.log("AssetMarketplace:");
        console.log("  Address:", address(marketplace));
        console.log("  Fee: 2.5%");
        console.log("");
        console.log("===========================================");
        console.log("         BSCSCAN VERIFICATION LINKS");
        console.log("===========================================");
        console.log("KYCRegistry:");
        console.log("  https://testnet.bscscan.com/address/", address(kycRegistry));
        console.log("");
        console.log("RealVault Assets (RVA):");
        console.log("  https://testnet.bscscan.com/address/", address(assetNFT));
        console.log("");
        console.log("RealVault Protocol (RVP):");
        console.log("  https://testnet.bscscan.com/address/", address(assetToken));
        console.log("");
        console.log("AssetMarketplace:");
        console.log("  https://testnet.bscscan.com/address/", address(marketplace));
        console.log("");
        console.log("===========================================");
        console.log("              NEXT STEPS");
        console.log("===========================================");
        console.log("1. Update your .env file with these addresses:");
        console.log("   KYC_REGISTRY_ADDRESS=", address(kycRegistry));
        console.log("   ASSET_NFT_ADDRESS=", address(assetNFT));
        console.log("   ASSET_TOKEN_ADDRESS=", address(assetToken));
        console.log("   MARKETPLACE_ADDRESS=", address(marketplace));
        console.log("");
        console.log("2. Verify contracts on BscScan (if not using --verify)");
        console.log("");
        console.log("3. Add KYC for additional users:");
        console.log("   Use script/AddKYC.s.sol or AddKYCBatch.s.sol");
        console.log("");
        console.log("4. Create liquidity pool on PancakeSwap:");
        console.log("   Use script/AddLiquidity.s.sol");
        console.log("");
        console.log("===========================================");
        console.log("All contracts deployed successfully!");
        console.log("===========================================");
    }
}
