// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/GoalVaultFactory.sol";
import "../src/GoalVault.sol";
import "../src/MockUSDC.sol";
import "../src/interfaces/IVaultFactory.sol";

contract GoalVaultFactoryTest is Test {
    GoalVaultFactory public factory;
    MockUSDC public usdc;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    
    uint256 constant INITIAL_SUPPLY = 1000000 * 1e6; // 1M USDC
    uint256 constant TARGET_AMOUNT = 5000 * 1e6; // 5k USDC
    uint256 constant DEADLINE = 90 days;
    
    // Enhanced Events for Indexers
    event VaultCreated(
        uint256 indexed vaultId,
        address indexed vaultAddress,
        address indexed creator,
        string vaultName,
        string description,
        uint256 targetAmount,
        uint256 deadline,
        bool isPublic,
        uint256 timestamp
    );

    event InviteCodeGenerated(
        uint256 indexed vaultId,
        bytes32 indexed inviteCode,
        address indexed generator,
        uint256 timestamp
    );

    event VaultJoined(
        uint256 indexed vaultId,
        address indexed member,
        address indexed inviter,
        uint256 timestamp
    );
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy contracts
        usdc = new MockUSDC(INITIAL_SUPPLY);
        factory = new GoalVaultFactory(address(usdc));
        
        // Give users some USDC
        usdc.mint(user1, 10000 * 1e6);
        usdc.mint(user2, 10000 * 1e6);
        
        vm.stopPrank();
    }
    
    function testCreateVault() public {
        vm.startPrank(user1);
        
        string memory name = "Test Vault";
        string memory description = "Test Description";
        uint256 deadline = block.timestamp + DEADLINE;
        
        vm.expectEmit(true, false, true, false);
        emit VaultCreated(1, address(0), user1, name, description, TARGET_AMOUNT, deadline, true, block.timestamp);
        
        uint256 vaultId = factory.createVault(
            name,
            description,
            TARGET_AMOUNT,
            deadline,
            true
        );
        
        assertEq(vaultId, 1);
        assertEq(factory.nextVaultId(), 2);
        
        // Check vault info
        GoalVaultFactory.VaultInfo memory vaultInfo = factory.getVault(vaultId);
        assertEq(vaultInfo.creator, user1);
        assertEq(vaultInfo.vaultName, name);
        assertEq(vaultInfo.description, description);
        assertEq(vaultInfo.targetAmount, TARGET_AMOUNT);
        assertEq(vaultInfo.deadline, deadline);
        assertTrue(vaultInfo.isPublic);
        assertTrue(vaultInfo.isActive);
        
        vm.stopPrank();
    }
    
    function testCreateVaultInvalidAmount() public {
        vm.startPrank(user1);
        
        vm.expectRevert(GoalVaultFactory__InvalidAmount.selector);
        factory.createVault(
            "Test",
            "Test",
            0, // Invalid amount
            block.timestamp + DEADLINE,
            true
        );
        
        vm.stopPrank();
    }
    
    function testCreateVaultInvalidDeadline() public {
        vm.startPrank(user1);
        
        vm.expectRevert(GoalVaultFactory__InvalidDeadline.selector);
        factory.createVault(
            "Test",
            "Test",
            TARGET_AMOUNT,
            block.timestamp - 1, // Past deadline
            true
        );
        
        vm.stopPrank();
    }
    
    function testCreateVaultEmptyName() public {
        vm.startPrank(user1);
        
        vm.expectRevert(GoalVaultFactory__EmptyName.selector);
        factory.createVault(
            "", // Empty name
            "Test",
            TARGET_AMOUNT,
            block.timestamp + DEADLINE,
            true
        );
        
        vm.stopPrank();
    }
    
    function testGenerateInviteCode() public {
        vm.startPrank(user1);
        
        // Create vault first
        uint256 vaultId = factory.createVault(
            "Test Vault",
            "Test Description",
            TARGET_AMOUNT,
            block.timestamp + DEADLINE,
            true
        );
        
        // Generate invite code
        vm.expectEmit(true, false, false, false);
        emit InviteCodeGenerated(vaultId, bytes32(0), user1, block.timestamp);
        
        bytes32 inviteCode = factory.generateInviteCode(vaultId);
        
        assertNotEq(inviteCode, bytes32(0));
        assertEq(factory.getVaultByInviteCode(inviteCode), vaultId);
        
        vm.stopPrank();
    }
    
    function testGenerateInviteCodeUnauthorized() public {
        vm.startPrank(user1);
        
        // Create private vault
        uint256 vaultId = factory.createVault(
            "Private Vault",
            "Private Description",
            TARGET_AMOUNT,
            block.timestamp + DEADLINE,
            false // Private vault
        );
        
        vm.stopPrank();
        
        // User2 tries to generate invite code for user1's private vault
        vm.startPrank(user2);
        
        vm.expectRevert(GoalVaultFactory__NotAuthorized.selector);
        factory.generateInviteCode(vaultId);
        
        vm.stopPrank();
    }
    
    function testJoinVaultByInvite() public {
        vm.startPrank(user1);
        
        // Create vault and generate invite
        uint256 vaultId = factory.createVault(
            "Test Vault",
            "Test Description",
            TARGET_AMOUNT,
            block.timestamp + DEADLINE,
            true
        );
        
        bytes32 inviteCode = factory.generateInviteCode(vaultId);
        
        vm.stopPrank();
        
        // User2 joins using invite code
        vm.startPrank(user2);
        
        vm.expectEmit(true, true, false, false);
        emit VaultJoined(vaultId, user2, address(0), block.timestamp);
        
        factory.joinVaultByInvite(inviteCode);
        
        vm.stopPrank();
    }
    
    function testGetVaultsByCreator() public {
        vm.startPrank(user1);
        
        // Create multiple vaults
        factory.createVault("Vault 1", "Desc 1", TARGET_AMOUNT, block.timestamp + DEADLINE, true);
        factory.createVault("Vault 2", "Desc 2", TARGET_AMOUNT, block.timestamp + DEADLINE, false);
        factory.createVault("Vault 3", "Desc 3", TARGET_AMOUNT, block.timestamp + DEADLINE, true);
        
        uint256[] memory vaults = factory.getVaultsByCreator(user1);
        
        assertEq(vaults.length, 3);
        assertEq(vaults[0], 1);
        assertEq(vaults[1], 2);
        assertEq(vaults[2], 3);
        
        vm.stopPrank();
    }
    
    function testGetPublicVaults() public {
        vm.startPrank(user1);
        
        // Create mix of public and private vaults
        factory.createVault("Public 1", "Desc 1", TARGET_AMOUNT, block.timestamp + DEADLINE, true);
        factory.createVault("Private 1", "Desc 2", TARGET_AMOUNT, block.timestamp + DEADLINE, false);
        factory.createVault("Public 2", "Desc 3", TARGET_AMOUNT, block.timestamp + DEADLINE, true);
        
        uint256[] memory publicVaults = factory.getPublicVaults();
        
        assertEq(publicVaults.length, 2);
        assertEq(publicVaults[0], 1);
        assertEq(publicVaults[1], 3);
        
        vm.stopPrank();
    }
    
    function testPauseUnpause() public {
        vm.startPrank(owner);
        
        // Pause contract
        factory.pause("Testing pause functionality");
        
        vm.stopPrank();
        
        // Try to create vault while paused
        vm.startPrank(user1);
        
        vm.expectRevert(abi.encodeWithSignature("EnforcedPause()"));
        factory.createVault(
            "Test",
            "Test",
            TARGET_AMOUNT,
            block.timestamp + DEADLINE,
            true
        );
        
        vm.stopPrank();
        
        // Unpause
        vm.startPrank(owner);
        factory.unpause();
        vm.stopPrank();
        
        // Should work now
        vm.startPrank(user1);
        uint256 vaultId = factory.createVault(
            "Test",
            "Test",
            TARGET_AMOUNT,
            block.timestamp + DEADLINE,
            true
        );
        assertEq(vaultId, 1);
        vm.stopPrank();
    }
    
    function testOnlyOwnerCanPause() public {
        vm.startPrank(user1);
        
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        factory.pause("Unauthorized pause attempt");
        
        vm.stopPrank();
    }
}
