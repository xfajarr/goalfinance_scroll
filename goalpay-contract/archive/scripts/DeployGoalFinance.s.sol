// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/GoalFinance.sol";
import "../src/MockUSDC.sol";

/**
 * @title DeployGoalFinance
 * @notice Deployment script for GoalFinance contract
 */
contract DeployGoalFinance is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MockUSDC for testing (only on testnets)
        MockUSDC mockUSDC = new MockUSDC(1_000_000 * 1e6); // 1M USDC initial supply
        console.log("MockUSDC deployed to:", address(mockUSDC));

        // Deploy GoalFinance with MockUSDC as initial supported token
        address[] memory initialTokens = new address[](1);
        initialTokens[0] = address(mockUSDC);
        GoalFinance goalFinance = new GoalFinance();
        console.log("GoalFinance deployed to:", address(goalFinance));
        
        vm.stopBroadcast();
        
        // Log deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("MockUSDC Address:", address(mockUSDC));
        console.log("GoalFinance Address:", address(goalFinance));
        console.log("Deployer:", deployer);
        console.log("USDC Token Supported:", goalFinance.isTokenSupported(address(mockUSDC)));
    }
}
