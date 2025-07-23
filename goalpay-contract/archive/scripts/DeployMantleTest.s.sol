// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/GoalFinance.sol";
import "../src/MockUSDC.sol";

/**
 * @title DeployMantleTest
 * @notice Test deployment script for GoalFinance (works on any chain for testing)
 */
contract DeployMantleTest is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Testing GoalFinance Deployment ===");
        console.log("Deployer address:", deployer);
        console.log("Chain ID:", block.chainid);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MockUSDC for testing
        console.log("\n1. Deploying MockUSDC...");
        MockUSDC mockUSDC = new MockUSDC(1_000_000 * 1e6); // 1M USDC
        console.log("MockUSDC deployed at:", address(mockUSDC));
        
        // Prepare initial supported tokens
        address[] memory initialTokens = new address[](1);
        initialTokens[0] = address(mockUSDC);
        
        // Deploy GoalFinance
        console.log("\n2. Deploying GoalFinance...");
        GoalFinance goalFinance = new GoalFinance();
        console.log("GoalFinance deployed at:", address(goalFinance));
        
        // Verify configuration
        console.log("\n3. Verifying configuration...");
        console.log("Native token supported:", goalFinance.isTokenSupported(goalFinance.NATIVE_TOKEN()));
        console.log("MockUSDC supported:", goalFinance.isTokenSupported(address(mockUSDC)));
        console.log("Native token symbol:", goalFinance.getNativeTokenSymbol());
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Test Successful! ===");
        console.log("MockUSDC:", address(mockUSDC));
        console.log("GoalFinance:", address(goalFinance));
        console.log("Ready for Mantle Testnet deployment!");
    }
}
