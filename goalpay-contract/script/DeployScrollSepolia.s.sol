// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/GoalFinance.sol";
import "../src/AcornsVault.sol";
import "../src/MockUSDC.sol";
import "../src/MockUSDT.sol";
import "../src/MockDAI.sol";
import "../src/MockMorpho.sol";

/**
 * @title DeployScrollSepolia
 * @notice Deployment script for GoalFinance + Acorns contracts on Scroll Sepolia
 */
contract DeployScrollSepolia is Script {
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Deploying GoalFinance + Acorns Contracts to Scroll Sepolia ===");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Balance:", deployer.balance / 1e18, "ETH");
        
        require(deployer.balance > 0.01 ether, "Insufficient ETH balance for deployment");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy mock tokens
        console.log("\n--- Step 1: Deploying Mock Tokens ---");
        address[] memory tokens = deployMockTokens();
        
        // 2. Deploy GoalFinance
        console.log("\n--- Step 2: Deploying GoalFinance ---");
        GoalFinance goalFinance = deployGoalFinance();

        // 3. Deploy MockMorpho
        console.log("\n--- Step 3: Deploying MockMorpho ---");
        MockMorpho mockMorpho = deployMockMorpho(tokens);

        // 4. Deploy AcornsVault
        console.log("\n--- Step 4: Deploying AcornsVault ---");
        AcornsVault acornsVault = deployAcornsVault();

        // 5. Configure integrations
        console.log("\n--- Step 5: Configuring Integrations ---");
        configureIntegrations(goalFinance, acornsVault, mockMorpho, tokens);

        // 6. Setup initial data
        console.log("\n--- Step 6: Setting up Initial Data ---");
        setupInitialData(goalFinance, acornsVault, tokens);
        
        vm.stopBroadcast();
        
        // 7. Log deployment summary
        logDeploymentSummary(goalFinance, acornsVault, mockMorpho, tokens);
        
        console.log("\n=== Deployment Complete! ===");
        console.log("Save these addresses for frontend integration:");
        console.log("GoalFinance:", address(goalFinance));
        console.log("AcornsVault:", address(acornsVault));
        console.log("MockMorpho:", address(mockMorpho));
        console.log("MockUSDC:", tokens[0]);
        console.log("MockUSDT:", tokens[1]);
        console.log("MockDAI:", tokens[2]);
    }
    
    function deployMockTokens() internal returns (address[] memory) {
        // Deploy MockUSDC (1M supply)
        MockUSDC mockUSDC = new MockUSDC(1_000_000 * 1e6);
        console.log("MockUSDC deployed:", address(mockUSDC));
        
        // Deploy MockUSDT (1M supply)
        MockUSDT mockUSDT = new MockUSDT(1_000_000 * 1e6);
        console.log("MockUSDT deployed:", address(mockUSDT));
        
        // Deploy MockDAI (1M supply)
        MockDAI mockDAI = new MockDAI(1_000_000 * 1e18);
        console.log("MockDAI deployed:", address(mockDAI));
        
        address[] memory tokens = new address[](3);
        tokens[0] = address(mockUSDC);
        tokens[1] = address(mockUSDT);
        tokens[2] = address(mockDAI);
        
        return tokens;
    }

    function deployGoalFinance() internal returns (GoalFinance) {
        GoalFinance goalFinance = new GoalFinance();
        console.log("GoalFinance deployed:", address(goalFinance));

        return goalFinance;
    }

    function deployMockMorpho(address[] memory tokens) internal returns (MockMorpho) {
        MockMorpho mockMorpho = new MockMorpho();
        console.log("MockMorpho deployed:", address(mockMorpho));
        
        // Create markets for each token
        mockMorpho.createMarket(tokens[0], 500);  // USDC: 5% APY
        mockMorpho.createMarket(tokens[1], 500);  // USDT: 5% APY
        mockMorpho.createMarket(tokens[2], 500);  // DAI: 5% APY
        
        console.log("Created markets for USDC, USDT, and DAI");
        
        return mockMorpho;
    }
    
    function deployAcornsVault() internal returns (AcornsVault) {
        AcornsVault acornsVault = new AcornsVault();
        console.log("AcornsVault deployed:", address(acornsVault));
        
        return acornsVault;
    }
    
    function configureIntegrations(
        GoalFinance goalFinance,
        AcornsVault acornsVault,
        MockMorpho mockMorpho,
        address[] memory tokens
    ) internal {
        // Configure supported tokens in GoalFinance
        goalFinance.setSupportedToken(tokens[0], true); // USDC
        goalFinance.setSupportedToken(tokens[1], true); // USDT
        goalFinance.setSupportedToken(tokens[2], true); // DAI
        console.log("Configured supported tokens in GoalFinance");

        // Configure supported tokens in AcornsVault
        acornsVault.setSupportedToken(tokens[0], true, 1e6, 6);   // USDC
        acornsVault.setSupportedToken(tokens[1], true, 1e6, 6);   // USDT
        acornsVault.setSupportedToken(tokens[2], true, 1e6, 18);  // DAI
        console.log("Configured supported tokens in AcornsVault");

        // Authorize AcornsVault to interact with MockMorpho
        mockMorpho.authorizeContract(address(acornsVault), true);
        console.log("Authorized AcornsVault in MockMorpho");
    }
    
    function setupInitialData(GoalFinance goalFinance, AcornsVault acornsVault, address[] memory tokens) internal {
        // Create a sample goal vault for testing
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Emergency Fund",
            description: "Build a 6-month emergency fund",
            token: tokens[0], // USDC
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: 10000 * 1e6, // $10,000 target
            deadline: block.timestamp + 180 days, // 6 months deadline
            penaltyRate: 200 // 2% penalty rate in basis points
        });

        (uint256 vaultId, bytes32 inviteCode) = goalFinance.createVault(config);
        console.log("Created sample goal vault: Emergency Fund");
        console.log("Vault ID:", vaultId);
        console.log("Invite Code:", vm.toString(inviteCode));

        // Register deployer as test user with moderate portfolio
        acornsVault.registerUser(AcornsVault.PortfolioType.MODERATE);
        console.log("Registered deployer as Acorns test user");

        // Simulate some test purchases
        acornsVault.simulatePurchase(4.25 * 1e6, "Coffee Shop");
        acornsVault.simulatePurchase(12.67 * 1e6, "Grocery Store");
        acornsVault.simulatePurchase(25.99 * 1e6, "Gas Station");
        console.log("Added sample Acorns purchases");

        // Set up recurring investment
        acornsVault.setRecurringInvestment(50 * 1e6, 7); // $50 weekly
        console.log("Set up recurring investment: $50 weekly");
    }
    
    function logDeploymentSummary(
        GoalFinance goalFinance,
        AcornsVault acornsVault,
        MockMorpho mockMorpho,
        address[] memory tokens
    ) internal view {
        console.log("\n--- Deployment Summary ---");
        console.log("Network: Scroll Sepolia");
        console.log("Chain ID:", block.chainid);
        console.log("Block Number:", block.number);
        console.log("Timestamp:", block.timestamp);
        
        console.log("\n--- Contract Addresses ---");
        console.log("GoalFinance:", address(goalFinance));
        console.log("AcornsVault:", address(acornsVault));
        console.log("MockMorpho:", address(mockMorpho));
        console.log("MockUSDC:", tokens[0]);
        console.log("MockUSDT:", tokens[1]);
        console.log("MockDAI:", tokens[2]);
        
        console.log("\n--- Portfolio Configuration ---");
        console.log("Conservative APY:", acornsVault.CONSERVATIVE_APY(), "basis points (4%)");
        console.log("Moderate APY:", acornsVault.MODERATE_APY(), "basis points (6%)");
        console.log("Aggressive APY:", acornsVault.AGGRESSIVE_APY(), "basis points (8%)");
        
        console.log("\n--- Features Available ---");
        console.log("Goal-based collaborative savings");
        console.log("Vault creation and management");
        console.log("Member invitations and penalties");
        console.log("Round-up transactions");
        console.log("Micro-investing spare change");
        console.log("Portfolio management (Conservative/Moderate/Aggressive)");
        console.log("Recurring investments");
        console.log("Yield generation via MockMorpho");
        console.log("Multi-token support (USDC, USDT, DAI)");
        console.log("Faucet functionality for testing");
        
        console.log("\n--- Next Steps ---");
        console.log("1. Update frontend contract addresses");
        console.log("2. Test faucet functionality: mockUSDC.claimFromFaucet()");
        console.log("3. Test Acorns features in the frontend");
        console.log("4. Verify contracts on Scrollscan (optional)");
    }
}

/**
 * @title VerifyScrollSepolia
 * @notice Script to verify contracts on Scrollscan
 */
contract VerifyScrollSepolia is Script {
    function run() external {
        // Contract addresses from deployment
        address goalFinance = vm.envAddress("GOAL_FINANCE_ADDRESS");
        address acornsVault = vm.envAddress("ACORNS_VAULT_ADDRESS");
        address mockMorpho = vm.envAddress("MOCK_MORPHO_ADDRESS");
        address mockUSDC = vm.envAddress("MOCK_USDC_ADDRESS");
        address mockUSDT = vm.envAddress("MOCK_USDT_ADDRESS");
        address mockDAI = vm.envAddress("MOCK_DAI_ADDRESS");

        console.log("=== Verifying Contracts on Scrollscan ===");

        // Note: Verification commands would be run manually:
        console.log("Run these commands to verify:");
        console.log("forge verify-contract", goalFinance, "src/GoalFinance.sol:GoalFinance --chain scroll_sepolia");
        console.log("forge verify-contract", acornsVault, "src/AcornsVault.sol:AcornsVault --chain scroll_sepolia");
        console.log("forge verify-contract", mockMorpho, "src/MockMorpho.sol:MockMorpho --chain scroll_sepolia");
        console.log("forge verify-contract", mockUSDC, "src/MockUSDC.sol:MockUSDC --chain scroll_sepolia --constructor-args $(cast abi-encode 'constructor(uint256)' 1000000000000)");
        console.log("forge verify-contract", mockUSDT, "src/MockUSDT.sol:MockUSDT --chain scroll_sepolia --constructor-args $(cast abi-encode 'constructor(uint256)' 1000000000000)");
        console.log("forge verify-contract", mockDAI, "src/MockDAI.sol:MockDAI --chain scroll_sepolia --constructor-args $(cast abi-encode 'constructor(uint256)' 1000000000000000000000000)");
    }
}
