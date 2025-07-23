// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/GoalFinance.sol";
import "../src/MockUSDC.sol";

/**
 * @title DeployMantle
 * @notice Deployment script for GoalFinance on Mantle Testnet
 */
contract DeployMantle is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Deploying GoalFinance to Mantle Testnet ===");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance / 1e18, "MNT");
        console.log("Chain ID:", block.chainid);
        
        // Verify we're on Mantle Testnet
        require(block.chainid == 5001, "Not Mantle Testnet! Expected chain ID: 5001");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MockUSDC for testing
        console.log("\n1. Deploying MockUSDC...");
        MockUSDC mockUSDC = new MockUSDC(1_000_000 * 1e6); // 1M USDC
        console.log("MockUSDC deployed at:", address(mockUSDC));
        console.log("MockUSDC total supply:", mockUSDC.totalSupply() / 1e6, "USDC");
        
        // Prepare initial supported tokens (just USDC, native MNT is auto-supported)
        address[] memory initialTokens = new address[](1);
        initialTokens[0] = address(mockUSDC);
        
        // Deploy GoalFinance
        console.log("\n2. Deploying GoalFinance...");
        GoalFinance goalFinance = new GoalFinance();
        console.log("GoalFinance deployed at:", address(goalFinance));
        
        // Verify native token support
        console.log("\n3. Verifying configuration...");
        console.log("Native MNT supported:", goalFinance.isTokenSupported(goalFinance.NATIVE_TOKEN()));
        console.log("MockUSDC supported:", goalFinance.isTokenSupported(address(mockUSDC)));
        console.log("Native token symbol:", goalFinance.getNativeTokenSymbol());
        console.log("Contract owner:", goalFinance.owner());
        
        // Transfer some USDC to deployer for testing
        console.log("\n4. Setting up test tokens...");
        uint256 testAmount = 10000 * 1e6; // 10k USDC for testing
        console.log("Minting", testAmount / 1e6, "USDC to deployer for testing");
        
        vm.stopBroadcast();
        
        // Save deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Mantle Testnet (Chain ID: 5001)");
        console.log("MockUSDC:", address(mockUSDC));
        console.log("GoalFinance:", address(goalFinance));
        console.log("Deployer:", deployer);
        console.log("Gas used: Check transaction receipts");
        
        console.log("\n=== Next Steps ===");
        console.log("1. Verify contracts on Mantlescan");
        console.log("2. Test native MNT deposits");
        console.log("3. Test USDC vault creation");
        console.log("4. Update frontend with new addresses");
        
        console.log("\n=== Verification Commands ===");
        console.log("MockUSDC verification:");
        console.log("forge verify-contract");
        console.log(address(mockUSDC));
        console.log("src/MockUSDC.sol:MockUSDC --chain mantle_testnet");

        console.log("\nGoalFinance verification:");
        console.log("forge verify-contract");
        console.log(address(goalFinance));
        console.log("src/GoalFinance.sol:GoalFinance --chain mantle_testnet");
    }
}
