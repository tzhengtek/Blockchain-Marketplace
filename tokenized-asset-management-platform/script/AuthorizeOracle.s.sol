// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {NFTPriceOracle} from "../src/NFTPriceOracle.sol";

contract AuthorizeOracleScript is Script {
    function run() external {
        // Get environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address oracleAddress = vm.envAddress("PRICE_ORACLE_ADDRESS");

        // Oracle address to authorize
        address oracleOperator = 0x1EF26064961DC528673b947ecd1F7cAB74A5F963;

        console.log("=== Authorizing Oracle Operator ===");
        console.log("Caller:", deployer);
        console.log("Oracle Contract:", oracleAddress);
        console.log("Operator to Authorize:", oracleOperator);

        vm.startBroadcast(deployerPrivateKey);

        NFTPriceOracle oracle = NFTPriceOracle(oracleAddress);

        // Check if already authorized
        if (oracle.isAuthorized(oracleOperator)) {
            console.log("\nOperator is already authorized!");
        } else {
            // Authorize oracle operator
            oracle.authorizeOracle(oracleOperator);
            console.log("\nOperator authorized successfully!");
        }

        // Verify authorization
        bool isAuth = oracle.isAuthorized(oracleOperator);
        console.log("Verification - Is Authorized:", isAuth);

        vm.stopBroadcast();

        console.log("\n=== Summary ===");
        console.log("Oracle Operator:", oracleOperator);
        console.log("Status: Authorized");
    }
}
