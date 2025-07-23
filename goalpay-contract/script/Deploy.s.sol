// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/GoalFinance.sol";
import "../src/MockUSDC.sol";

/**
 * @title Deploy
 * @notice Universal deployment script for GoalFinance contract on any chain
 * @dev Automatically detects network and deploys appropriate contracts
 */
contract Deploy is Script {
    // Network configuration
    struct NetworkConfig {
        string name;
        string nativeSymbol;
        bool isTestnet;
        bool deployMockTokens;
        address[] existingTokens;
    }

    // Known token addresses for different networks
    mapping(uint256 => address[]) public knownTokens;
    
    function setUp() public {
        // Mantle Sepolia (5003)
        knownTokens[5003] = [
            0x77B2693ea846571259FA89CBe4DD8e18f3F61787 // Mock USDC
        ];
        
        // Base Sepolia (84532)
        knownTokens[84532] = [
            0x036CbD53842c5426634e7929541eC2318f3dCF7e // USDC
        ];
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== GoalFinance Universal Deployment ===");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);
        console.log("Chain ID:", block.chainid);
        
        // Get network configuration
        NetworkConfig memory config = getNetworkConfig();
        console.log("Network:", config.name);
        console.log("Native Token:", config.nativeSymbol);
        console.log("Is Testnet:", config.isTestnet);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy GoalFinance (native token automatically supported)
        GoalFinance goalFinance = new GoalFinance();
        console.log("GoalFinance deployed to:", address(goalFinance));
        
        // Deploy mock tokens for testnets
        address[] memory supportedTokens = new address[](0);
        if (config.deployMockTokens) {
            supportedTokens = deployMockTokens(goalFinance);
        }
        
        // Add existing tokens for mainnets
        if (config.existingTokens.length > 0) {
            supportedTokens = addExistingTokens(goalFinance, config.existingTokens);
        }
        
        vm.stopBroadcast();
        
        // Generate deployment summary
        generateDeploymentSummary(goalFinance, config, supportedTokens);
        
        // Save deployment info to file
        saveDeploymentInfo(goalFinance, config, supportedTokens);
    }
    
    function getNetworkConfig() internal view returns (NetworkConfig memory) {
        uint256 chainId = block.chainid;
        
        if (chainId == 1) {
            return NetworkConfig({
                name: "Ethereum Mainnet",
                nativeSymbol: "ETH",
                isTestnet: false,
                deployMockTokens: false,
                existingTokens: knownTokens[1]
            });
        } else if (chainId == 8453) {
            return NetworkConfig({
                name: "Base Mainnet",
                nativeSymbol: "ETH",
                isTestnet: false,
                deployMockTokens: false,
                existingTokens: knownTokens[8453]
            });
        } else if (chainId == 42161) {
            return NetworkConfig({
                name: "Arbitrum One",
                nativeSymbol: "ETH",
                isTestnet: false,
                deployMockTokens: false,
                existingTokens: knownTokens[42161]
            });
        } else if (chainId == 10) {
            return NetworkConfig({
                name: "Optimism Mainnet",
                nativeSymbol: "ETH",
                isTestnet: false,
                deployMockTokens: false,
                existingTokens: knownTokens[10]
            });
        } else if (chainId == 137) {
            return NetworkConfig({
                name: "Polygon Mainnet",
                nativeSymbol: "MATIC",
                isTestnet: false,
                deployMockTokens: false,
                existingTokens: knownTokens[137]
            });
        } else if (chainId == 11155111) {
            return NetworkConfig({
                name: "Ethereum Sepolia",
                nativeSymbol: "ETH",
                isTestnet: true,
                deployMockTokens: true,
                existingTokens: new address[](0)
            });
        } else if (chainId == 84532) {
            return NetworkConfig({
                name: "Base Sepolia",
                nativeSymbol: "ETH",
                isTestnet: true,
                deployMockTokens: true,
                existingTokens: new address[](0)
            });
        } else if (chainId == 421614) {
            return NetworkConfig({
                name: "Arbitrum Sepolia",
                nativeSymbol: "ETH",
                isTestnet: true,
                deployMockTokens: true,
                existingTokens: new address[](0)
            });
        } else if (chainId == 5003) {
            return NetworkConfig({
                name: "Mantle Sepolia",
                nativeSymbol: "MNT",
                isTestnet: true,
                deployMockTokens: true,
                existingTokens: new address[](0)
            });
        } else if (chainId == 11155420) {
            return NetworkConfig({
                name: "Optimism Sepolia",
                nativeSymbol: "ETH",
                isTestnet: true,
                deployMockTokens: true,
                existingTokens: new address[](0)
            });
        } else if (chainId == 80001) {
            return NetworkConfig({
                name: "Polygon Mumbai",
                nativeSymbol: "MATIC",
                isTestnet: true,
                deployMockTokens: true,
                existingTokens: new address[](0)
            });
        } else {
            // Unknown network - default to testnet behavior
            return NetworkConfig({
                name: string(abi.encodePacked("Unknown Network (", vm.toString(chainId), ")")),
                nativeSymbol: "NATIVE",
                isTestnet: true,
                deployMockTokens: true,
                existingTokens: new address[](0)
            });
        }
    }
    
    function deployMockTokens(GoalFinance goalFinance) internal returns (address[] memory) {
        console.log("\n--- Deploying Mock Tokens ---");
        
        // Deploy MockUSDC
        MockUSDC mockUSDC = new MockUSDC(1_000_000 * 1e6); // 1M USDC
        console.log("MockUSDC deployed to:", address(mockUSDC));
        
        // Deploy MockUSDT (using MockUSDC contract)
        MockUSDC mockUSDT = new MockUSDC(1_000_000 * 1e6); // 1M USDT
        console.log("MockUSDT deployed to:", address(mockUSDT));
        
        // Add tokens to GoalFinance
        goalFinance.setSupportedToken(address(mockUSDC), true);
        goalFinance.setSupportedToken(address(mockUSDT), true);
        
        console.log("Mock tokens added to GoalFinance");
        
        address[] memory tokens = new address[](2);
        tokens[0] = address(mockUSDC);
        tokens[1] = address(mockUSDT);
        
        return tokens;
    }
    
    function addExistingTokens(GoalFinance goalFinance, address[] memory tokens) internal returns (address[] memory) {
        console.log("\n--- Adding Existing Tokens ---");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] != address(0)) {
                goalFinance.setSupportedToken(tokens[i], true);
                console.log("Added token:", tokens[i]);
            }
        }
        
        return tokens;
    }
    
    function generateDeploymentSummary(
        GoalFinance goalFinance,
        NetworkConfig memory config,
        address[] memory supportedTokens
    ) internal view {
        console.log("\n=== Deployment Summary ===");
        console.log("Network:", config.name);
        console.log("Chain ID:", block.chainid);
        console.log("GoalFinance:", address(goalFinance));
        console.log("Native Token:", config.nativeSymbol, "- Supported:", goalFinance.isTokenSupported(goalFinance.NATIVE_TOKEN()));
        
        console.log("\nSupported ERC20 Tokens:");
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            console.log("-", supportedTokens[i]);
        }
        
        console.log("\nContract Features:");
        console.log("- Native token support: YES");
        console.log("- Configurable penalties: 1-10%");
        console.log("- Immediate penalty release: YES");
        console.log("- Multi-token support: YES");
        console.log("- Pausable: YES");
    }
    
    function saveDeploymentInfo(
        GoalFinance goalFinance,
        NetworkConfig memory config,
        address[] memory supportedTokens
    ) internal {
        string memory deploymentFile = string(abi.encodePacked("deployments/", vm.toString(block.chainid), ".json"));
        
        // Create deployment JSON (simplified for console output)
        console.log("\n=== Save to:", deploymentFile, "===");
        console.log("{");
        console.log('  "network":', '"', config.name, '",');
        console.log('  "chainId":', vm.toString(block.chainid), ",");
        console.log('  "goalFinance":', '"', vm.toString(address(goalFinance)), '",');
        console.log('  "nativeToken":', '"', config.nativeSymbol, '",');
        console.log('  "isTestnet":', config.isTestnet ? "true" : "false", ",");
        console.log('  "supportedTokens": [');
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            console.log('    "', vm.toString(supportedTokens[i]), '"', i < supportedTokens.length - 1 ? "," : "");
        }
        console.log("  ],");
        console.log('  "deployedAt":', vm.toString(block.timestamp));
        console.log("}");
    }
}
