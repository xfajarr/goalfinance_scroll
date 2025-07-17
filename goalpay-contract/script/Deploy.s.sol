// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/GoalVaultFactory.sol";
import "../src/MockUSDC.sol";

/**
 * @title Deploy
 * @notice Deployment script for GoalFi contracts
 */
contract Deploy is Script {
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MockUSDC first
        uint256 initialSupply = 1000000 * 1e6; // 1 million USDC
        MockUSDC mockUSDC = new MockUSDC(initialSupply);
        console.log("MockUSDC deployed to:", address(mockUSDC));
        
        // Deploy VaultFactory
        GoalVaultFactory factory = new GoalVaultFactory(address(mockUSDC));
        console.log("GoalVaultFactory deployed to:", address(factory));
        
        vm.stopBroadcast();
        
        // Log deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("MockUSDC:", address(mockUSDC));
        console.log("GoalVaultFactory:", address(factory));
        console.log("Deployer:", deployer);
        console.log("USDC Initial Supply:", initialSupply / 1e6, "USDC");
        
        // Verify deployment
        console.log("\n=== Verification ===");
        console.log("MockUSDC name:", mockUSDC.name());
        console.log("MockUSDC symbol:", mockUSDC.symbol());
        console.log("MockUSDC decimals:", mockUSDC.decimals());
        console.log("MockUSDC total supply:", mockUSDC.totalSupply() / 1e6, "USDC");
        console.log("Factory USDC address:", factory.getUSDCAddress());
        console.log("Factory next vault ID:", factory.nextVaultId());
    }
}

/**
 * @title DeployLocal
 * @notice Local deployment script with additional setup
 */
contract DeployLocal is Script {
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying to local network...");
        console.log("Deployer:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MockUSDC with larger initial supply for testing
        uint256 initialSupply = 10_000_000 * 1e6; // 10 million USDC
        MockUSDC mockUSDC = new MockUSDC(initialSupply);
        
        // Deploy VaultFactory
        GoalVaultFactory factory = new GoalVaultFactory(address(mockUSDC));
        
        vm.stopBroadcast();
        
        console.log("\n=== Local Deployment Complete ===");
        console.log("MockUSDC:", address(mockUSDC));
        console.log("GoalVaultFactory:", address(factory));
        
        // Create some test data
        _setupTestData(mockUSDC, factory, deployer);
    }
    
    function _setupTestData(MockUSDC mockUSDC, GoalVaultFactory factory, address deployer) internal {
        console.log("\n=== Setting up test data ===");
        
        vm.startBroadcast();
        
        // Give some USDC to deployer for testing
        mockUSDC.mint(deployer, 50000 * 1e6); // 50k USDC
        
        // Create a test vault
        uint256 vaultId = factory.createVault(
            "Test Vacation Fund",
            "Saving for a summer vacation to Hawaii",
            5000 * 1e6, // 5000 USDC target
            block.timestamp + 90 days, // 90 days deadline
            true // public vault
        );
        
        console.log("Created test vault with ID:", vaultId);
        
        vm.stopBroadcast();
        
        console.log("Test data setup complete!");
    }
}

/**
 * @title DeployTestnet
 * @notice Testnet deployment script
 */
contract DeployTestnet is Script {
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying to testnet...");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);
        
        require(deployer.balance > 0.1 ether, "Insufficient ETH for deployment");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // For testnet, use smaller initial supply
        uint256 initialSupply = 100000 * 1e6; // 100k USDC
        MockUSDC mockUSDC = new MockUSDC(initialSupply);
        
        // Deploy VaultFactory
        GoalVaultFactory factory = new GoalVaultFactory(address(mockUSDC));
        
        vm.stopBroadcast();
        
        console.log("\n=== Testnet Deployment Complete ===");
        console.log("MockUSDC:", address(mockUSDC));
        console.log("GoalVaultFactory:", address(factory));
        console.log("Network:", block.chainid);
        
        // Save addresses to file for frontend
        _saveAddresses(address(mockUSDC), address(factory));
    }
    
    function _saveAddresses(address mockUSDC, address factory) internal {
        string memory json = string(abi.encodePacked(
            '{\n',
            '  "MockUSDC": "', vm.toString(mockUSDC), '",\n',
            '  "GoalVaultFactory": "', vm.toString(factory), '",\n',
            '  "chainId": ', vm.toString(block.chainid), ',\n',
            '  "deployedAt": ', vm.toString(block.timestamp), '\n',
            '}'
        ));
        
        // vm.writeFile("./deployments/testnet.json", json);
        // console.log("Addresses saved to ./deployments/testnet.json");
    }
}

/**
 * @title DeployMainnet
 * @notice Mainnet deployment script (uses real USDC)
 */
contract DeployMainnet is Script {
    // Real USDC address on Ethereum mainnet
    address constant MAINNET_USDC = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying to MAINNET...");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);
        
        require(deployer.balance > 0.5 ether, "Insufficient ETH for mainnet deployment");
        require(block.chainid == 1, "Not on Ethereum mainnet");
        
        // Additional safety check
        console.log("WARNING: Deploying to MAINNET!");
        console.log("Press any key to continue or Ctrl+C to cancel...");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy VaultFactory with real USDC
        GoalVaultFactory factory = new GoalVaultFactory(MAINNET_USDC);
        
        vm.stopBroadcast();
        
        console.log("\n=== MAINNET Deployment Complete ===");
        console.log("GoalVaultFactory:", address(factory));
        console.log("Using USDC at:", MAINNET_USDC);
        
        // Save mainnet addresses
        _saveMainnetAddresses(address(factory));
    }
    
    function _saveMainnetAddresses(address factory) internal {
        string memory json = string(abi.encodePacked(
            '{\n',
            '  "USDC": "', vm.toString(MAINNET_USDC), '",\n',
            '  "GoalVaultFactory": "', vm.toString(factory), '",\n',
            '  "chainId": 1,\n',
            '  "deployedAt": ', vm.toString(block.timestamp), '\n',
            '}'
        ));
        
        vm.writeFile("./deployments/mainnet.json", json);
        console.log("Addresses saved to ./deployments/mainnet.json");
    }
}

/**
 * @title VerifyContracts
 * @notice Script to verify deployed contracts on block explorers
 */
contract VerifyContracts is Script {
    function run() external {
        uint256 chainId = block.chainid;

        // Try to read deployment addresses from environment
        address usdcAddress = vm.envOr("USDC_ADDRESS", address(0));
        address factoryAddress = vm.envOr("FACTORY_ADDRESS", address(0));

        console.log("=== Contract Verification Helper ===");
        console.log("Chain ID:", chainId);
        console.log("");

        if (usdcAddress == address(0) || factoryAddress == address(0)) {
            console.log("Set environment variables first:");
            console.log("export USDC_ADDRESS=0x...");
            console.log("export FACTORY_ADDRESS=0x...");
            console.log("");
        } else {
            console.log("MockUSDC:", usdcAddress);
            console.log("GoalVaultFactory:", factoryAddress);
            console.log("");
        }

        _printVerificationCommands(chainId, usdcAddress, factoryAddress);
    }

    function _printVerificationCommands(uint256 chainId, address usdcAddr, address factoryAddr) internal view {
        string memory usdcAddrStr = usdcAddr == address(0) ? "<USDC_ADDRESS>" : vm.toString(usdcAddr);
        string memory factoryAddrStr = factoryAddr == address(0) ? "<FACTORY_ADDRESS>" : vm.toString(factoryAddr);

        console.log("=== Verification Commands ===");
        console.log("");

        // MockUSDC verification
        console.log("# Verify MockUSDC:");
        console.log(string(abi.encodePacked(
            "forge verify-contract --chain-id ", vm.toString(chainId),
            " ", usdcAddrStr,
            " src/MockUSDC.sol:MockUSDC",
            " --constructor-args $(cast abi-encode 'constructor(uint256)' 1000000000000)"
        )));

        // Add API key if needed
        string memory apiKeyFlag = _getApiKeyFlag(chainId);
        if (bytes(apiKeyFlag).length > 0) {
            console.log(apiKeyFlag);
        }
        console.log("");

        // GoalVaultFactory verification
        console.log("# Verify GoalVaultFactory:");
        console.log(string(abi.encodePacked(
            "forge verify-contract --chain-id ", vm.toString(chainId),
            " ", factoryAddrStr,
            " src/GoalVaultFactory.sol:GoalVaultFactory",
            " --constructor-args $(cast abi-encode 'constructor(address)' ", usdcAddrStr, ")"
        )));

        if (bytes(apiKeyFlag).length > 0) {
            console.log(apiKeyFlag);
        }
        console.log("");

        // Network-specific instructions
        _printNetworkInstructions(chainId);
    }

    function _getApiKeyFlag(uint256 chainId) internal pure returns (string memory) {
        if (chainId == 421614) { // Arbitrum Sepolia
            return " --etherscan-api-key $ARBISCAN_API_KEY";
        } else if (chainId == 84532) { // Base Sepolia
            return " --etherscan-api-key $BASESCAN_API_KEY";
        } else if (chainId == 11155420) { // Optimism Sepolia
            return " --etherscan-api-key $OPTIMISTIC_ETHERSCAN_API_KEY";
        } else if (chainId == 80001) { // Polygon Mumbai
            return " --etherscan-api-key $POLYGONSCAN_API_KEY";
        } else if (chainId == 5003) { // Mantle Sepolia
            return " --verifier-url https://api-sepolia.mantlescan.xyz/api --etherscan-api-key $MANTLESCAN_API_KEY --compiler-version 0.8.24+commit.e11b9ed9 --watch";
        } else if (chainId == 11155111 || chainId == 5) { // Ethereum testnets
            return " --etherscan-api-key $ETHERSCAN_API_KEY";
        }
        return "";
    }

    function _printNetworkInstructions(uint256 chainId) internal view {
        console.log("=== Network Information ===");

        string memory networkName = getNetworkName(chainId);
        string memory explorerUrl = getExplorerUrl(chainId);

        if (bytes(networkName).length > 0) {
            console.log("Network:", networkName);
        }

        if (bytes(explorerUrl).length > 0) {
            console.log("Explorer:", explorerUrl);
        }

        console.log("");
        console.log("=== API Key Setup ===");
        console.log("Get API keys from the respective block explorer:");

        if (chainId == 421614) {
            console.log("Arbitrum: https://arbiscan.io/apis");
        } else if (chainId == 84532) {
            console.log("Base: https://basescan.org/apis");
        } else if (chainId == 11155420) {
            console.log("Optimism: https://optimistic.etherscan.io/apis");
        } else if (chainId == 80001) {
            console.log("Polygon: https://polygonscan.com/apis");
        } else if (chainId == 5003) {
            console.log("Mantle: https://mantlescan.xyz/apis");
        } else if (chainId == 11155111 || chainId == 5) {
            console.log("Ethereum: https://etherscan.io/apis");
        }
    }

    function getNetworkName(uint256 chainId) internal pure returns (string memory) {
        if (chainId == 421614) return "Arbitrum Sepolia";
        if (chainId == 84532) return "Base Sepolia";
        if (chainId == 11155420) return "Optimism Sepolia";
        if (chainId == 80001) return "Polygon Mumbai";
        if (chainId == 5003) return "Mantle Sepolia";
        if (chainId == 11155111) return "Ethereum Sepolia";
        if (chainId == 5) return "Ethereum Goerli";
        if (chainId == 43113) return "Avalanche Fuji";
        if (chainId == 4002) return "Fantom Testnet";
        if (chainId == 97) return "BSC Testnet";
        if (chainId == 1287) return "Moonbeam Alpha";
        if (chainId == 44787) return "Celo Alfajores";
        return "";
    }

    function getExplorerUrl(uint256 chainId) internal pure returns (string memory) {
        if (chainId == 421614) return "https://sepolia.arbiscan.io";
        if (chainId == 84532) return "https://sepolia.basescan.org";
        if (chainId == 11155420) return "https://sepolia-optimism.etherscan.io";
        if (chainId == 80001) return "https://mumbai.polygonscan.com";
        if (chainId == 5003) return "https://sepolia.mantlescan.xyz";
        if (chainId == 11155111) return "https://sepolia.etherscan.io";
        if (chainId == 5) return "https://goerli.etherscan.io";
        if (chainId == 43113) return "https://testnet.snowtrace.io";
        if (chainId == 4002) return "https://testnet.ftmscan.com";
        if (chainId == 97) return "https://testnet.bscscan.com";
        if (chainId == 1287) return "https://moonbase.moonscan.io";
        if (chainId == 44787) return "https://alfajores.celoscan.io";
        return "";
    }
}
