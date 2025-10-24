// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AssetToken} from "../src/AssetToken.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";
import {Strings} from "../lib/openzeppelin-contracts/contracts/utils/Strings.sol";

interface IPancakeRouter02 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

interface IPancakeFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IKYCRegistry {
    function addKYC(address account) external;
    function isKYCVerified(address account) external view returns (bool);
}

/**
 * @title CreatePoolAndAddLiquidity
 * @dev Creates a liquidity pool, mints tokens, and adds liquidity in one script
 *
 * Usage:
 * forge script script/CreatePoolAndAddLiquidity.s.sol:CreatePoolAndAddLiquidityScript \
 *   --rpc-url $BSC_TESTNET_RPC_URL \
 *   --broadcast \
 *   --legacy \
 *   -vvvv
 */
contract CreatePoolAndAddLiquidityScript is Script {
    // PancakeSwap V2 Router on BSC Testnet
    address constant PANCAKE_ROUTER = 0xD99D1c33F9fC3444f8101754aBC46c52416550D1;
    // WBNB on BSC Testnet
    address constant WBNB = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address tokenAddress = vm.envAddress("ASSET_TOKEN_ADDRESS");
        address kycRegistryAddress = vm.envAddress("KYC_REGISTRY_ADDRESS");

        console.log("========== Create Pool & Add Liquidity with Minting ==========");
        console.log("");
        console.log("Deployer:", deployer);
        console.log("Token Address:", tokenAddress);
        console.log("KYC Registry:", kycRegistryAddress);
        console.log("WBNB Address:", WBNB);
        console.log("Router Address:", PANCAKE_ROUTER);
        console.log("");

        // Initialize contracts
        AssetToken token = AssetToken(tokenAddress);
        IPancakeRouter02 router = IPancakeRouter02(PANCAKE_ROUTER);
        IPancakeFactory factory = IPancakeFactory(router.factory());
        IKYCRegistry kycRegistry = IKYCRegistry(kycRegistryAddress);

        // Check balances before
        console.log("=== Initial Balances ===");
        console.log("Deployer BNB:", deployer.balance / 10**18, "BNB");
        console.log("Token balance:", token.balanceOf(deployer) / 10**18, "tokens");
        console.log("");

        // Configuration
        uint256 bnbAmount = 0.05 ether; // 0.05 BNB
        uint256 tokenAmount = 2500 * 10**18; // 2500 tokens (50,000 tokens per BNB)

        console.log("=== Configuration ===");
        console.log("BNB to add:", bnbAmount / 10**18, "BNB");
        console.log("Tokens to add:", tokenAmount / 10**18, "tokens");
        console.log("");

        // Verify deployer has enough BNB
        require(deployer.balance >= bnbAmount, "Insufficient BNB balance");
        console.log("[OK] Sufficient BNB balance");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Ensure deployer is KYC verified
        console.log("");
        console.log("=== Step 1: Verify KYC Status ===");
        bool isKYC = kycRegistry.isKYCVerified(deployer);
        if (!isKYC) {
            console.log("Adding deployer to KYC registry...");
            kycRegistry.addKYC(deployer);
            console.log("[OK] Deployer KYC verified");
        } else {
            console.log("[OK] Deployer already KYC verified");
        }

        // Step 2: Check if pair exists, create if needed
        console.log("");
        console.log("=== Step 2: Check/Create Liquidity Pair ===");
        address pair = factory.getPair(tokenAddress, WBNB);
        if (pair == address(0)) {
            console.log("Creating new token/WBNB pair...");
            pair = factory.createPair(tokenAddress, WBNB);
            console.log("[OK] Pair created at:", pair);

            // Add pair to KYC registry so it can receive tokens
            console.log("Adding pair to KYC registry...");
            kycRegistry.addKYC(pair);
            console.log("[OK] Pair added to KYC registry");
        } else {
            console.log("[OK] Pair already exists at:", pair);
            // Ensure pair is KYC verified
            bool pairKYC = kycRegistry.isKYCVerified(pair);
            if (!pairKYC) {
                console.log("Adding pair to KYC registry...");
                kycRegistry.addKYC(pair);
                console.log("[OK] Pair added to KYC registry");
            }
        }

        // Step 3: Mint tokens if needed
        console.log("");
        console.log("=== Step 3: Mint Tokens ===");
        uint256 currentBalance = token.balanceOf(deployer);
        if (currentBalance < tokenAmount) {
            uint256 mintAmount = tokenAmount - currentBalance;
            console.log("Minting", mintAmount / 10**18, "tokens to deployer...");
            token.mint(deployer, mintAmount);
            console.log("[OK] Tokens minted successfully");
        } else {
            console.log("[OK] Sufficient tokens already owned");
        }

        // Step 4: Approve router to spend tokens
        console.log("");
        console.log("=== Step 4: Approve Router ===");
        token.approve(PANCAKE_ROUTER, tokenAmount);
        console.log("[OK] Approved", tokenAmount / 10**18, "tokens for router");

        // Step 5: Add liquidity
        console.log("");
        console.log("=== Step 5: Add Liquidity ===");
        console.log("Adding tokens:", tokenAmount / 10**18);
        console.log("Adding BNB:", bnbAmount / 10**18);

        (uint amountToken, uint amountETH, uint liquidity) = router.addLiquidityETH{value: bnbAmount}(
            tokenAddress,
            tokenAmount,
            tokenAmount * 95 / 100, // 5% slippage tolerance
            bnbAmount * 95 / 100,   // 5% slippage tolerance
            deployer,
            block.timestamp + 300   // 5 minutes deadline
        );

        vm.stopBroadcast();

        // Results
        console.log("");
        console.log("========== SUCCESS! Pool Created ==========");
        console.log("");
        console.log("Pair Address:", pair);
        console.log("");
        console.log("=== Liquidity Added ===");
        console.log("Tokens added:", amountToken / 10**18, "tokens");
        console.log("BNB added:", amountETH / 10**18, "BNB");
        console.log("LP tokens received:", liquidity / 10**18);
        console.log("");
        console.log("=== Verify on Explorers ===");
        console.log(string(abi.encodePacked("BscScan: https://testnet.bscscan.com/address/", _toHexString(pair))));
        console.log(string(abi.encodePacked("PancakeSwap: https://pancakeswap.finance/info/v2/pairs/", _toHexString(pair))));
        console.log("");
    }

    function _toHexString(address value) internal pure returns (string memory) {
        return Strings.toHexString(uint160(value), 20);
    }
}
