// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AssetToken} from "../src/AssetToken.sol";

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

contract AddLiquidityScript is Script {
    // PancakeSwap V2 Router on BSC Testnet
    address constant PANCAKE_ROUTER = 0xD99D1c33F9fC3444f8101754aBC46c52416550D1;
    // WBNB on BSC Testnet
    address constant WBNB = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd;

    function run() external {
        // Get environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address assetTokenAddress = vm.envAddress("ASSET_TOKEN_ADDRESS");

        console.log("=== PancakeSwap V2 Liquidity Deployment ===");
        console.log("Deployer address:", deployer);
        console.log("AssetToken address:", assetTokenAddress);
        console.log("Deployer BNB balance:", deployer.balance / 10**18, "BNB");

        AssetToken assetToken = AssetToken(assetTokenAddress);
        console.log("AssetToken balance:", assetToken.balanceOf(deployer) / 10**18, "ATK");

        // Configuration - adjust these amounts as needed
        uint256 tokenAmount = 10000 * 10**18; // 10,000 tokens
        uint256 bnbAmount = 0.1 ether; // 0.1 BNB

        require(deployer.balance >= bnbAmount, "Insufficient BNB balance");
        require(assetToken.balanceOf(deployer) >= tokenAmount, "Insufficient token balance");

        vm.startBroadcast(deployerPrivateKey);

        IPancakeRouter02 router = IPancakeRouter02(PANCAKE_ROUTER);
        IPancakeFactory factory = IPancakeFactory(router.factory());

        // Check if pair exists, create if it doesn't
        address pair = factory.getPair(assetTokenAddress, WBNB);
        if (pair == address(0)) {
            console.log("\n=== Creating new BNB/AssetToken pair ===");
            pair = factory.createPair(assetTokenAddress, WBNB);
            console.log("Pair created at:", pair);
        } else {
            console.log("\n=== BNB/AssetToken pair already exists ===");
            console.log("Pair address:", pair);
        }

        // Approve router to spend tokens
        console.log("\n=== Approving tokens ===");
        assetToken.approve(PANCAKE_ROUTER, tokenAmount);
        console.log("Approved", tokenAmount / 10**18, "tokens for router");

        // Add liquidity - BNB and AssetToken
        console.log("\n=== Adding liquidity (BNB + AssetToken) ===");
        console.log("Token amount:", tokenAmount / 10**18, "ATK");
        console.log("BNB amount:", bnbAmount / 10**18, "BNB");

        (uint amountToken, uint amountETH, uint liquidity) = router.addLiquidityETH{value: bnbAmount}(
            assetTokenAddress,
            tokenAmount,
            tokenAmount * 95 / 100, // 5% slippage tolerance
            bnbAmount * 95 / 100,   // 5% slippage tolerance
            deployer,
            block.timestamp + 300   // 5 minutes deadline
        );

        vm.stopBroadcast();

        // Log results
        console.log("\n=== Liquidity Pool Created Successfully ===");
        console.log("Tokens added:", amountToken / 10**18, "ATK");
        console.log("BNB added:", amountETH / 10**18, "BNB");
        console.log("LP tokens received:", liquidity / 10**18);
        console.log("");
        console.log("Pair address:", pair);
        console.log("");
        console.log("View on BscScan:");
        console.log("https://testnet.bscscan.com/address/", pair);
        console.log("");
        console.log("View on PancakeSwap:");
        console.log("https://pancakeswap.finance/info/v2/pairs/", pair);
    }
}
