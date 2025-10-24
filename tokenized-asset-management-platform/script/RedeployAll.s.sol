// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";
import {AssetNFT} from "../src/AssetNFT.sol";
import {AssetToken} from "../src/AssetToken.sol";
import {AssetMarketplace} from "../src/AssetMarketplace.sol";
import {NFTPriceOracle} from "../src/NFTPriceOracle.sol";

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
        address kycRegistryAddress = vm.envAddress("KYC_REGISTRY_ADDRESS");

        console.log("===========================================");
        console.log("  RealVault Platform - Full Deployment");
        console.log("===========================================");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance / 10**18, "BNB");
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Use existing KYCRegistry
        console.log("=== Step 1/5: Using Existing KYCRegistry ===");
        KYCRegistry kycRegistry = KYCRegistry(kycRegistryAddress);
        console.log("KYCRegistry address:", address(kycRegistry));
        console.log("");

        // 2. Deploy NFTPriceOracle
        console.log("=== Step 2/5: Deploying NFTPriceOracle ===");
        NFTPriceOracle priceOracle = new NFTPriceOracle(deployer);
        console.log("NFTPriceOracle deployed at:", address(priceOracle));

        // Authorize oracle operator
        address oracleOperator = 0x1EF26064961DC528673b947ecd1F7cAB74A5F963;
        priceOracle.authorizeOracle(oracleOperator);
        console.log("Authorized oracle operator:", oracleOperator);
        console.log("");

        // 3. Deploy AssetNFT (RealVault Assets)
        console.log("=== Step 3/5: Deploying RealVault Assets NFT ===");
        AssetNFT assetNFT = new AssetNFT(
            "RealVault Assets",
            "RVA",
            deployer,
            address(kycRegistry)
        );
        console.log("RealVault Assets (RVA) deployed at:", address(assetNFT));
        console.log("");

        // 4. Deploy AssetToken (RealVault Protocol)
        console.log("=== Step 4/5: Deploying RealVault Protocol Token ===");
        AssetToken assetToken = new AssetToken(
            "RealVault Protocol",
            "RVP",
            18, // decimals
            1000000000, // initial supply (1,000,000,000 tokens = 1 billion)
            deployer,
            address(kycRegistry)
        );
        console.log("RealVault Protocol (RVP) deployed at:", address(assetToken));
        console.log("Initial supply: 1,000,000,000 RVP (1 billion)");
        console.log("");

        // 5. Deploy AssetMarketplace
        console.log("=== Step 5/5: Deploying AssetMarketplace ===");
        AssetMarketplace marketplace = new AssetMarketplace(
            address(kycRegistry),
            address(priceOracle),
            deployer
        );
        console.log("AssetMarketplace deployed at:", address(marketplace));
        console.log("Marketplace fee:", marketplace.marketplaceFee(), "basis points (2.5%)");
        console.log("");

        // Auto-verify deployer in KYC registry
        console.log("=== Auto-verifying deployer in KYC ===");
        bool isVerified = kycRegistry.isKYCVerified(deployer);
        if (!isVerified) {
            kycRegistry.addKYC(deployer);
            console.log("Deployer KYC verified:", kycRegistry.isKYCVerified(deployer));
        } else {
            console.log("Deployer already KYC verified");
        }
        console.log("");

        // Mint 100 NFTs to deployer
        console.log("=== Minting 100 NFTs ===");
        for (uint256 i = 0; i < 100; i++) {
            uint256 tokenId = assetNFT.mintAsset(
                deployer,
                string(abi.encodePacked("https://realvault.io/metadata/", vm.toString(i))),
                string(abi.encodePacked("RealVault Asset #", vm.toString(i))),
                string(abi.encodePacked("Premium real-world asset #", vm.toString(i))),
                1000000, // 1M value placeholder
                "Real Estate"
            );

            if ((i + 1) % 10 == 0) {
                console.log("Minted", i + 1, "NFTs...");
            }
        }
        console.log("Successfully minted 100 NFTs to deployer");
        console.log("");

        vm.stopBroadcast();

        // Deployment Summary
        console.log("===========================================");
        console.log("       DEPLOYMENT SUMMARY - REALVAULT");
        console.log("===========================================");
        console.log("");
        console.log("KYCRegistry (existing):");
        console.log("  Address:", address(kycRegistry));
        console.log("");
        console.log("NFTPriceOracle (new):");
        console.log("  Address:", address(priceOracle));
        console.log("  Authorized Operator:", oracleOperator);
        console.log("");
        console.log("RealVault Assets (NFT):");
        console.log("  Address:", address(assetNFT));
        console.log("  Name: RealVault Assets");
        console.log("  Symbol: RVA");
        console.log("  Minted: 100 NFTs");
        console.log("");
        console.log("RealVault Protocol (Token):");
        console.log("  Address:", address(assetToken));
        console.log("  Name: RealVault Protocol");
        console.log("  Symbol: RVP");
        console.log("  Decimals: 18");
        console.log("  Initial Supply: 1,000,000,000 RVP (1 Billion)");
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
        console.log("NFTPriceOracle:");
        console.log("  https://testnet.bscscan.com/address/", address(priceOracle));
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
        console.log("   PRICE_ORACLE_ADDRESS=", address(priceOracle));
        console.log("   ASSET_NFT_ADDRESS=", address(assetNFT));
        console.log("   ASSET_TOKEN_ADDRESS=", address(assetToken));
        console.log("   MARKETPLACE_ADDRESS=", address(marketplace));
        console.log("");
        console.log("2. Verify contracts on BscScan (if not using --verify)");
        console.log("");
        console.log("3. Update NFT prices via oracle operator");
        console.log("");
        console.log("4. Create liquidity pool on PancakeSwap:");
        console.log("   Use script/AddLiquidity.s.sol");
        console.log("");
        console.log("===========================================");
        console.log("All contracts deployed successfully!");
        console.log("===========================================");
    }
}
