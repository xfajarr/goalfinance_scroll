// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/GoalVaultFactory.sol";
import "../src/GoalVault.sol";
import "../src/MockUSDC.sol";

contract MultiTokenSupportTest is Test {
    GoalVaultFactory public factory;
    MockUSDC public usdc;
    MockUSDC public dai; // Using MockUSDC as DAI for testing (18 decimals)
    MockUSDC public usdt;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    
    uint256 constant DEADLINE = 90 days;
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy factory
        factory = new GoalVaultFactory();
        
        // Deploy test tokens
        usdc = new MockUSDC(1000000 * 1e6); // 1M USDC (6 decimals)
        dai = new MockUSDC(1000000 * 1e18);  // 1M DAI (18 decimals) 
        usdt = new MockUSDC(1000000 * 1e6);  // 1M USDT (6 decimals)
        
        // Add supported tokens
        factory.addSupportedToken(address(usdc), "USDC", "USD Coin", 6);
        factory.addSupportedToken(address(dai), "DAI", "Dai Stablecoin", 18);
        factory.addSupportedToken(address(usdt), "USDT", "Tether USD", 6);
        
        // Give users tokens
        usdc.mint(user1, 10000 * 1e6);
        dai.mint(user1, 10000 * 1e18);
        usdt.mint(user1, 10000 * 1e6);
        
        usdc.mint(user2, 10000 * 1e6);
        dai.mint(user2, 10000 * 1e18);
        usdt.mint(user2, 10000 * 1e6);
        
        vm.stopPrank();
    }
    
    function testAddSupportedToken() public {
        vm.startPrank(owner);
        
        // Check token was added
        assertTrue(factory.isTokenSupported(address(usdc)));
        assertTrue(factory.isTokenSupported(address(dai)));
        assertTrue(factory.isTokenSupported(address(usdt)));
        
        // Check token info
        GoalVaultFactory.TokenInfo memory usdcInfo = factory.getTokenInfo(address(usdc));
        assertEq(usdcInfo.symbol, "USDC");
        assertEq(usdcInfo.name, "USD Coin");
        assertEq(usdcInfo.decimals, 6);
        assertTrue(usdcInfo.isActive);
        
        GoalVaultFactory.TokenInfo memory daiInfo = factory.getTokenInfo(address(dai));
        assertEq(daiInfo.decimals, 18);
        
        vm.stopPrank();
    }
    
    function testGetSupportedTokens() public {
        address[] memory tokens = factory.getSupportedTokens();
        assertEq(tokens.length, 3);
        assertEq(tokens[0], address(usdc));
        assertEq(tokens[1], address(dai));
        assertEq(tokens[2], address(usdt));
    }
    
    function testCreateVaultWithDifferentTokens() public {
        vm.startPrank(user1);
        
        // Create USDC vault (6 decimals)
        uint256 usdcVaultId = factory.createVault(
            "USDC Emergency Fund",
            "Emergency savings in USDC",
            5000 * 1e6, // 5,000 USDC
            block.timestamp + DEADLINE,
            true,
            IGoalVault.GoalType.GROUP,
            address(usdc)
        );

        // Create DAI vault (18 decimals)
        uint256 daiVaultId = factory.createVault(
            "DAI Vacation Fund",
            "Vacation savings in DAI",
            3000 * 1e18, // 3,000 DAI
            block.timestamp + DEADLINE,
            true,
            IGoalVault.GoalType.GROUP,
            address(dai)
        );
        
        // Verify vault info
        GoalVaultFactory.VaultInfo memory usdcVaultInfo = factory.getVault(usdcVaultId);
        assertEq(usdcVaultInfo.token, address(usdc));
        assertEq(usdcVaultInfo.tokenSymbol, "USDC");
        
        GoalVaultFactory.VaultInfo memory daiVaultInfo = factory.getVault(daiVaultId);
        assertEq(daiVaultInfo.token, address(dai));
        assertEq(daiVaultInfo.tokenSymbol, "DAI");
        
        vm.stopPrank();
    }
    
    function testContributeToMultiTokenVaults() public {
        vm.startPrank(user1);
        
        // Create vaults
        uint256 usdcVaultId = factory.createVault(
            "USDC Vault",
            "USDC savings",
            1000 * 1e6,
            block.timestamp + DEADLINE,
            true,
            IGoalVault.GoalType.GROUP,
            address(usdc)
        );

        uint256 daiVaultId = factory.createVault(
            "DAI Vault",
            "DAI savings",
            1000 * 1e18,
            block.timestamp + DEADLINE,
            true,
            IGoalVault.GoalType.GROUP,
            address(dai)
        );
        
        // Get vault contracts
        GoalVault usdcVault = GoalVault(factory.getVault(usdcVaultId).vaultAddress);
        GoalVault daiVault = GoalVault(factory.getVault(daiVaultId).vaultAddress);
        
        // Contribute to USDC vault
        usdc.approve(address(usdcVault), 500 * 1e6);
        usdcVault.addFunds(500 * 1e6);
        
        // Contribute to DAI vault
        dai.approve(address(daiVault), 500 * 1e18);
        daiVault.addFunds(500 * 1e18);
        
        // Verify contributions
        assertEq(usdcVault.getTotalContributions(), 500 * 1e6);
        assertEq(daiVault.getTotalContributions(), 500 * 1e18);
        
        // Verify token addresses
        assertEq(usdcVault.getTokenAddress(), address(usdc));
        assertEq(daiVault.getTokenAddress(), address(dai));
        
        vm.stopPrank();
    }
    
    function testTokenManagement() public {
        vm.startPrank(owner);
        
        // Disable USDT
        factory.updateTokenStatus(address(usdt), false);
        assertFalse(factory.isTokenSupported(address(usdt)));
        
        // Try to create vault with disabled token (should fail)
        vm.stopPrank();
        vm.startPrank(user1);
        
        vm.expectRevert(GoalVaultFactory__TokenNotSupported.selector);
        factory.createVault(
            "USDT Vault",
            "Should fail",
            1000 * 1e6,
            block.timestamp + DEADLINE,
            true,
            IGoalVault.GoalType.GROUP,
            address(usdt)
        );
        
        vm.stopPrank();
        vm.startPrank(owner);
        
        // Re-enable USDT
        factory.updateTokenStatus(address(usdt), true);
        assertTrue(factory.isTokenSupported(address(usdt)));
        
        vm.stopPrank();
    }
    
    function testUnsupportedToken() public {
        MockUSDC unsupportedToken = new MockUSDC(1000000 * 1e18);
        
        vm.startPrank(user1);
        
        vm.expectRevert(GoalVaultFactory__TokenNotSupported.selector);
        factory.createVault(
            "Unsupported Vault",
            "Should fail",
            1000 * 1e18,
            block.timestamp + DEADLINE,
            true,
            IGoalVault.GoalType.GROUP,
            address(unsupportedToken)
        );
        
        vm.stopPrank();
    }
    
    function testVaultDetailsIncludeToken() public {
        vm.startPrank(user1);
        
        uint256 vaultId = factory.createVault(
            "Test Vault",
            "Test Description",
            1000 * 1e6,
            block.timestamp + DEADLINE,
            true,
            IGoalVault.GoalType.GROUP,
            address(usdc)
        );
        
        GoalVault vault = GoalVault(factory.getVault(vaultId).vaultAddress);
        IGoalVault.VaultDetails memory details = vault.getVaultDetails();
        
        assertEq(details.token, address(usdc));
        assertEq(details.name, "Test Vault");
        assertEq(details.targetAmount, 1000 * 1e6);
        
        vm.stopPrank();
    }
    
    function testOnlyOwnerCanManageTokens() public {
        MockUSDC newToken = new MockUSDC(1000000 * 1e18);
        
        vm.startPrank(user1);
        
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        factory.addSupportedToken(address(newToken), "NEW", "New Token", 18);
        
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        factory.updateTokenStatus(address(usdc), false);
        
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        factory.removeSupportedToken(address(usdc));
        
        vm.stopPrank();
    }
}
