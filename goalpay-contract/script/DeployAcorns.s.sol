// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/AcornsVault.sol";
import "../src/MockUSDC.sol";
import "../src/MockUSDT.sol";
import "../src/MockDAI.sol";
import "../src/MockMorpho.sol";

/**
 * @title DeployAcorns
 * @notice Deployment script for Acorns-like micro-investing platform
 */
contract DeployAcorns is Script {
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying Acorns contracts...");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy mock tokens
        address[] memory tokens = deployMockTokens();
        
        // Deploy AcornsVault
        AcornsVault acornsVault = deployAcornsVault();
        
        // Configure supported tokens
        configureSupportedTokens(acornsVault, tokens);
        
        // Log deployment info
        logDeploymentInfo(acornsVault, tokens);
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Complete ===");
    }
    
    function deployMockTokens() internal returns (address[] memory) {
        console.log("\n--- Deploying Mock Tokens ---");
        
        // Deploy MockUSDC (1M supply)
        MockUSDC mockUSDC = new MockUSDC(1_000_000 * 1e6);
        console.log("MockUSDC deployed to:", address(mockUSDC));
        
        // Deploy MockUSDT (1M supply)
        MockUSDT mockUSDT = new MockUSDT(1_000_000 * 1e6);
        console.log("MockUSDT deployed to:", address(mockUSDT));
        
        // Deploy MockDAI (1M supply)
        MockDAI mockDAI = new MockDAI(1_000_000 * 1e18);
        console.log("MockDAI deployed to:", address(mockDAI));
        
        address[] memory tokens = new address[](3);
        tokens[0] = address(mockUSDC);
        tokens[1] = address(mockUSDT);
        tokens[2] = address(mockDAI);
        
        return tokens;
    }
    
    function deployAcornsVault() internal returns (AcornsVault) {
        console.log("\n--- Deploying AcornsVault ---");
        
        AcornsVault acornsVault = new AcornsVault();
        console.log("AcornsVault deployed to:", address(acornsVault));
        
        return acornsVault;
    }
    
    function configureSupportedTokens(AcornsVault acornsVault, address[] memory tokens) internal {
        console.log("\n--- Configuring Supported Tokens ---");
        
        // Configure USDC (1:1 rate, 6 decimals)
        acornsVault.setSupportedToken(tokens[0], true, 1e6, 6);
        console.log("USDC configured: 1:1 rate");
        
        // Configure USDT (1:1 rate, 6 decimals)
        acornsVault.setSupportedToken(tokens[1], true, 1e6, 6);
        console.log("USDT configured: 1:1 rate");
        
        // Configure DAI (1:1 rate, 18 decimals)
        acornsVault.setSupportedToken(tokens[2], true, 1e6, 18);
        console.log("DAI configured: 1:1 rate");
    }
    
    function logDeploymentInfo(AcornsVault acornsVault, address[] memory tokens) internal view {
        console.log("\n--- Deployment Summary ---");
        console.log("AcornsVault:", address(acornsVault));
        console.log("MockUSDC:", tokens[0]);
        console.log("MockUSDT:", tokens[1]);
        console.log("MockDAI:", tokens[2]);
        
        console.log("\n--- Portfolio APY Rates ---");
        console.log("Conservative:", acornsVault.CONSERVATIVE_APY(), "basis points (4%)");
        console.log("Moderate:", acornsVault.MODERATE_APY(), "basis points (6%)");
        console.log("Aggressive:", acornsVault.AGGRESSIVE_APY(), "basis points (8%)");
        
        console.log("\n--- Contract Features ---");
        console.log("- Round-up transactions");
        console.log("- Micro-investing spare change");
        console.log("- Automatic portfolio investment");
        console.log("- Transaction monitoring and rounding");
        console.log("- Recurring investments");
        console.log("- Mock Morpho yield generation");
        console.log("- Multi-token support (USDC, USDT, DAI)");
    }
}

/**
 * @title DeployAcornsLocal
 * @notice Local deployment script with additional setup for testing
 */
contract DeployAcornsLocal is Script {
    
    function run() external {
        console.log("Deploying Acorns contracts locally...");
        
        vm.startBroadcast();
        
        // Deploy contracts
        address[] memory tokens = deployMockTokens();
        AcornsVault acornsVault = deployAcornsVault();
        configureSupportedTokens(acornsVault, tokens);
        
        // Setup test data
        setupTestData(acornsVault, tokens);
        
        vm.stopBroadcast();
        
        console.log("\n=== Local Deployment Complete ===");
        console.log("Ready for testing and demonstration!");
    }
    
    function deployMockTokens() internal returns (address[] memory) {
        MockUSDC mockUSDC = new MockUSDC(1_000_000 * 1e6);
        MockUSDT mockUSDT = new MockUSDT(1_000_000 * 1e6);
        MockDAI mockDAI = new MockDAI(1_000_000 * 1e18);
        
        address[] memory tokens = new address[](3);
        tokens[0] = address(mockUSDC);
        tokens[1] = address(mockUSDT);
        tokens[2] = address(mockDAI);
        
        return tokens;
    }
    
    function deployAcornsVault() internal returns (AcornsVault) {
        return new AcornsVault();
    }
    
    function configureSupportedTokens(AcornsVault acornsVault, address[] memory tokens) internal {
        acornsVault.setSupportedToken(tokens[0], true, 1e6, 6);  // USDC
        acornsVault.setSupportedToken(tokens[1], true, 1e6, 6);  // USDT
        acornsVault.setSupportedToken(tokens[2], true, 1e6, 18); // DAI
    }
    
    function setupTestData(AcornsVault acornsVault, address[] memory tokens) internal {
        console.log("\n--- Setting up test data ---");
        
        // Register test user
        acornsVault.registerUser(AcornsVault.PortfolioType.MODERATE);
        console.log("Test user registered with MODERATE portfolio");
        
        // Simulate some purchases
        acornsVault.simulatePurchase(4.25 * 1e6, "Coffee Shop");
        acornsVault.simulatePurchase(12.67 * 1e6, "Grocery Store");
        acornsVault.simulatePurchase(25.99 * 1e6, "Gas Station");
        console.log("Sample purchases simulated");
        
        // Set up recurring investment
        acornsVault.setRecurringInvestment(50 * 1e6, 7); // $50 weekly
        console.log("Recurring investment set: $50 weekly");
        
        console.log("Test data setup complete!");
    }
}
