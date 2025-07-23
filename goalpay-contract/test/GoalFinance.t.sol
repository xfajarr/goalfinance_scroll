// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/GoalFinance.sol";
import "../src/MockUSDC.sol";

/**
 * @title GoalFinanceTest
 * @notice Comprehensive test suite for GoalFinance V2 contract
 */
contract GoalFinanceTest is Test {
    GoalFinance public goalFinance;
    MockUSDC public usdc;

    address public owner = address(0x1);
    address public alice = address(0x2);
    address public bob = address(0x3);
    address public charlie = address(0x4);

    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 1e6; // 1M USDC
    uint256 public constant TARGET_AMOUNT = 1000 * 1e6; // 1000 USDC
    uint256 public constant DEPOSIT_AMOUNT = 500 * 1e6; // 500 USDC
    uint256 public constant DEFAULT_PENALTY_RATE = 200; // 2%

    // Updated events for V2
    event VaultCreated(
        uint256 indexed vaultId,
        address indexed creator,
        address indexed token,
        GoalFinance.VaultConfig config,
        bytes32 inviteCode
    );

    event MemberJoined(
        uint256 indexed vaultId,
        address indexed member,
        address indexed token,
        uint256 depositAmount,
        uint256 memberCount
    );

    event FundsDeposited(
        uint256 indexed vaultId,
        address indexed member,
        address indexed token,
        uint256 amount,
        uint256 totalDeposited
    );

    event GoalReached(uint256 indexed vaultId, address indexed token, uint256 totalAmount);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy MockUSDC with initial supply
        usdc = new MockUSDC(INITIAL_SUPPLY);

        // Deploy GoalFinance V2 (native token automatically supported)
        goalFinance = new GoalFinance();

        // Add USDC as supported token
        goalFinance.setSupportedToken(address(usdc), true);

        vm.stopPrank();

        // Distribute USDC to test accounts
        vm.startPrank(owner);
        usdc.transfer(alice, 10000 * 1e6);
        usdc.transfer(bob, 10000 * 1e6);
        usdc.transfer(charlie, 10000 * 1e6);
        vm.stopPrank();

        // Give test accounts some ETH for native token tests
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);

        // Approve GoalFinance to spend USDC for all users
        vm.prank(alice);
        usdc.approve(address(goalFinance), type(uint256).max);

        vm.prank(bob);
        usdc.approve(address(goalFinance), type(uint256).max);

        vm.prank(charlie);
        usdc.approve(address(goalFinance), type(uint256).max);
    }

    function testCreateVault() public {
        vm.startPrank(alice);

        uint256 deadline = block.timestamp + 30 days;

        // Create VaultConfig struct for V2
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Test Vault",
            description: "A test savings vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: deadline,
            penaltyRate: DEFAULT_PENALTY_RATE
        });

        (uint256 vaultId, bytes32 inviteCode) = goalFinance.createVault(config);

        assertEq(vaultId, 1);
        assertNotEq(inviteCode, bytes32(0));

        // Check vault details
        GoalFinance.Vault memory vault = goalFinance.getVault(vaultId);
        assertEq(vault.config.name, "Test Vault");
        assertEq(vault.creator, alice);
        assertEq(vault.config.targetAmount, TARGET_AMOUNT);
        assertEq(vault.memberCount, 1); // Creator auto-enrolled

        // Check creator is a member
        GoalFinance.Member memory member = goalFinance.getMember(vaultId, alice);
        assertEq(member.joinedAt, block.timestamp);

        vm.stopPrank();
    }

    function testJoinVaultWithToken() public {
        // Create ERC20 vault first
        vm.prank(alice);
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Test Vault",
            description: "A test savings vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        // Bob joins and deposits using new V2 function
        vm.startPrank(bob);

        goalFinance.joinVaultWithToken(vaultId, DEPOSIT_AMOUNT, bytes32(0));

        // Check member details
        GoalFinance.Member memory member = goalFinance.getMember(vaultId, bob);
        assertEq(member.depositedAmount, DEPOSIT_AMOUNT);
        assertEq(member.joinedAt, block.timestamp);

        // Check vault updated
        GoalFinance.Vault memory vault = goalFinance.getVault(vaultId);
        assertEq(vault.memberCount, 2);
        assertEq(vault.totalDeposited, DEPOSIT_AMOUNT);

        // Check USDC balance
        assertEq(usdc.balanceOf(address(goalFinance)), DEPOSIT_AMOUNT);

        vm.stopPrank();
    }

    function testAddTokenFunds() public {
        // Create vault and join
        vm.prank(alice);
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Test Vault",
            description: "A test savings vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        vm.prank(bob);
        goalFinance.joinVaultWithToken(vaultId, DEPOSIT_AMOUNT, bytes32(0));

        // Bob adds more funds using new V2 function
        vm.startPrank(bob);

        uint256 additionalAmount = 200 * 1e6;

        goalFinance.addTokenFunds(vaultId, additionalAmount);

        // Check updated amounts
        GoalFinance.Member memory member = goalFinance.getMember(vaultId, bob);
        assertEq(member.depositedAmount, DEPOSIT_AMOUNT + additionalAmount);

        GoalFinance.Vault memory vault = goalFinance.getVault(vaultId);
        assertEq(vault.totalDeposited, DEPOSIT_AMOUNT + additionalAmount);

        vm.stopPrank();
    }

    function testGoalReached() public {
        // Create vault
        vm.prank(alice);
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Test Vault",
            description: "A test savings vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        // Bob joins with enough to reach goal
        vm.startPrank(bob);

        goalFinance.joinVaultWithToken(vaultId, TARGET_AMOUNT, bytes32(0));

        // Check vault status
        GoalFinance.Vault memory vault = goalFinance.getVault(vaultId);
        assertEq(uint256(vault.status), uint256(GoalFinance.VaultStatus.SUCCESS));

        assertTrue(goalFinance.isGoalReached(vaultId));
        assertEq(goalFinance.getVaultProgress(vaultId), 10000); // 100% in basis points

        vm.stopPrank();
    }

    function testWithdrawAfterSuccess() public {
        // Create vault and reach goal
        vm.prank(alice);
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Test Vault",
            description: "A test savings vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        vm.prank(bob);
        goalFinance.joinVaultWithToken(vaultId, TARGET_AMOUNT, bytes32(0));

        // Bob withdraws his contribution
        vm.startPrank(bob);

        uint256 balanceBefore = usdc.balanceOf(bob);
        goalFinance.withdraw(vaultId);
        uint256 balanceAfter = usdc.balanceOf(bob);

        // Should receive exactly what he contributed
        assertEq(balanceAfter - balanceBefore, TARGET_AMOUNT);

        // Check member state
        GoalFinance.Member memory member = goalFinance.getMember(vaultId, bob);
        assertTrue(member.hasWithdrawn);

        vm.stopPrank();
    }

    function testEarlyWithdrawal() public {
        // Create vault
        vm.prank(alice);
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Test Vault",
            description: "A test savings vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        vm.prank(bob);
        goalFinance.joinVaultWithToken(vaultId, DEPOSIT_AMOUNT, bytes32(0));

        // Bob withdraws early
        vm.startPrank(bob);

        uint256 balanceBefore = usdc.balanceOf(bob);
        goalFinance.withdrawEarly(vaultId);
        uint256 balanceAfter = usdc.balanceOf(bob);

        // Should receive deposit minus 2% penalty
        uint256 penalty = (DEPOSIT_AMOUNT * DEFAULT_PENALTY_RATE) / 10000; // 2%
        uint256 expectedAmount = DEPOSIT_AMOUNT - penalty;
        assertEq(balanceAfter - balanceBefore, expectedAmount);

        // Check member state
        GoalFinance.Member memory member = goalFinance.getMember(vaultId, bob);
        assertTrue(member.hasWithdrawn);
        assertEq(member.penaltyAmount, penalty);

        // In V2, penalties are immediately claimable (no lock period)
        assertEq(goalFinance.getClaimablePenaltiesByToken(bob, address(usdc)), penalty);

        vm.stopPrank();
    }

    function testClaimPenaltiesImmediately() public {
        // Create vault and do early withdrawal
        vm.prank(alice);
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Test Vault",
            description: "A test savings vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        vm.prank(bob);
        goalFinance.joinVaultWithToken(vaultId, DEPOSIT_AMOUNT, bytes32(0));

        vm.prank(bob);
        goalFinance.withdrawEarly(vaultId);

        // In V2, penalties are immediately claimable (no lock period)
        uint256 penalty = (DEPOSIT_AMOUNT * DEFAULT_PENALTY_RATE) / 10000;
        assertEq(goalFinance.getClaimablePenaltiesByToken(bob, address(usdc)), penalty);

        // Claim penalties immediately
        vm.startPrank(bob);
        uint256 balanceBefore = usdc.balanceOf(bob);
        goalFinance.claimPenalties(address(usdc));
        uint256 balanceAfter = usdc.balanceOf(bob);

        assertEq(balanceAfter - balanceBefore, penalty);
        assertEq(goalFinance.getClaimablePenaltiesByToken(bob, address(usdc)), 0);

        vm.stopPrank();
    }

    function testPrivateVaultWithInviteCode() public {
        vm.startPrank(alice);

        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Private Vault",
            description: "A private savings vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PRIVATE,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId, bytes32 inviteCode) = goalFinance.createVault(config);

        vm.stopPrank();

        // Bob tries to join without invite code - should fail
        vm.startPrank(bob);
        vm.expectRevert(GoalFinance.GoalFinance__InvalidInviteCode.selector);
        goalFinance.joinVaultWithToken(vaultId, DEPOSIT_AMOUNT, bytes32(0));

        // Bob joins with correct invite code - should succeed
        goalFinance.joinVaultWithToken(vaultId, DEPOSIT_AMOUNT, inviteCode);

        GoalFinance.Member memory member = goalFinance.getMember(vaultId, bob);
        assertEq(member.depositedAmount, DEPOSIT_AMOUNT);

        vm.stopPrank();
    }

    function testVaultFailurePenalties() public {
        // Create vault with short deadline
        vm.prank(alice);
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Test Vault",
            description: "A test savings vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 1 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        // Bob joins but doesn't deposit enough
        vm.prank(bob);
        goalFinance.joinVaultWithToken(vaultId, DEPOSIT_AMOUNT, bytes32(0)); // Only 500, need 1000

        // Fast forward past deadline
        vm.warp(block.timestamp + 2 days);

        // Check vault status
        goalFinance.updateVaultStatus(vaultId);

        GoalFinance.Vault memory vault = goalFinance.getVault(vaultId);
        assertEq(uint256(vault.status), uint256(GoalFinance.VaultStatus.FAILED));

        // In V2, penalties are immediately claimable (no lock period)
        uint256 penalty = (DEPOSIT_AMOUNT * DEFAULT_PENALTY_RATE) / 10000;
        assertEq(goalFinance.getClaimablePenaltiesByToken(bob, address(usdc)), penalty);
    }

    function testPersonalGoalType() public {
        // Create personal goal vault
        vm.prank(alice);
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Personal Vault",
            description: "A personal savings vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.PERSONAL,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        // Bob joins
        vm.prank(bob);
        goalFinance.joinVaultWithToken(vaultId, DEPOSIT_AMOUNT, bytes32(0));

        // Check target shares - each member should have individual target
        GoalFinance.Member memory aliceMember = goalFinance.getMember(vaultId, alice);
        GoalFinance.Member memory bobMember = goalFinance.getMember(vaultId, bob);

        assertEq(aliceMember.targetShare, TARGET_AMOUNT);
        assertEq(bobMember.targetShare, TARGET_AMOUNT);
    }

    function testRevertConditions() public {
        // Test creating vault with invalid parameters
        vm.startPrank(alice);

        // Test invalid amount
        GoalFinance.VaultConfig memory invalidAmountConfig = GoalFinance.VaultConfig({
            name: "Test",
            description: "Test",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: 0, // Invalid amount
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        vm.expectRevert(GoalFinance.GoalFinance__InvalidAmount.selector);
        goalFinance.createVault(invalidAmountConfig);

        // Test invalid deadline
        GoalFinance.VaultConfig memory invalidDeadlineConfig = GoalFinance.VaultConfig({
            name: "Test",
            description: "Test",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp - 1, // Past deadline
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        vm.expectRevert(GoalFinance.GoalFinance__InvalidDeadline.selector);
        goalFinance.createVault(invalidDeadlineConfig);

        // Test unsupported token
        MockUSDC unsupportedToken = new MockUSDC(1000 * 1e6);
        GoalFinance.VaultConfig memory unsupportedTokenConfig = GoalFinance.VaultConfig({
            name: "Test",
            description: "Test",
            token: address(unsupportedToken), // Unsupported token
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        vm.expectRevert(GoalFinance.GoalFinance__TokenNotSupported.selector);
        goalFinance.createVault(unsupportedTokenConfig);

        vm.stopPrank();
    }

    function testGetAllVaults() public {
        // Create multiple vaults
        vm.startPrank(alice);

        GoalFinance.VaultConfig memory config1 = GoalFinance.VaultConfig({
            name: "Vault 1",
            description: "First vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        goalFinance.createVault(config1);

        GoalFinance.VaultConfig memory config2 = GoalFinance.VaultConfig({
            name: "Vault 2",
            description: "Second vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.PERSONAL,
            visibility: GoalFinance.Visibility.PRIVATE,
            targetAmount: TARGET_AMOUNT * 2,
            deadline: block.timestamp + 60 days,
            penaltyRate: 300 // 3%
        });
        goalFinance.createVault(config2);

        vm.stopPrank();

        // Get all vaults
        uint256[] memory allVaults = goalFinance.getAllVaults();
        assertEq(allVaults.length, 2);
        assertEq(allVaults[0], 1);
        assertEq(allVaults[1], 2);

        // Test total count
        assertEq(goalFinance.getTotalVaultCount(), 2);
    }

    function testGetVaultsByCreator() public {
        // Alice creates vaults
        vm.startPrank(alice);
        GoalFinance.VaultConfig memory aliceConfig1 = GoalFinance.VaultConfig({
            name: "Alice Vault 1",
            description: "Alice's first vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        goalFinance.createVault(aliceConfig1);

        GoalFinance.VaultConfig memory aliceConfig2 = GoalFinance.VaultConfig({
            name: "Alice Vault 2",
            description: "Alice's second vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.PERSONAL,
            visibility: GoalFinance.Visibility.PRIVATE,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        goalFinance.createVault(aliceConfig2);
        vm.stopPrank();

        // Bob creates a vault
        vm.startPrank(bob);
        GoalFinance.VaultConfig memory bobConfig = GoalFinance.VaultConfig({
            name: "Bob Vault",
            description: "Bob's vault",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        goalFinance.createVault(bobConfig);
        vm.stopPrank();

        // Check vaults by creator
        uint256[] memory aliceVaults = goalFinance.getVaultsByCreator(alice);
        uint256[] memory bobVaults = goalFinance.getVaultsByCreator(bob);

        assertEq(aliceVaults.length, 2);
        assertEq(bobVaults.length, 1);
        assertEq(aliceVaults[0], 1);
        assertEq(aliceVaults[1], 2);
        assertEq(bobVaults[0], 3);
    }

    function testTokenSupport() public {
        // Check initial token support (USDC was added in setUp)
        assertTrue(goalFinance.isTokenSupported(address(usdc)));

        // Native token should always be supported
        assertTrue(goalFinance.isTokenSupported(goalFinance.NATIVE_TOKEN()));

        // Deploy another mock token
        vm.prank(owner);
        MockUSDC mockDAI = new MockUSDC(INITIAL_SUPPLY);

        // Initially not supported
        assertFalse(goalFinance.isTokenSupported(address(mockDAI)));

        // Add token support using V2 function
        vm.prank(owner);
        goalFinance.setSupportedToken(address(mockDAI), true);

        // Now should be supported
        assertTrue(goalFinance.isTokenSupported(address(mockDAI)));

        // Remove token support using V2 function
        vm.prank(owner);
        goalFinance.setSupportedToken(address(mockDAI), false);

        // Should no longer be supported
        assertFalse(goalFinance.isTokenSupported(address(mockDAI)));
    }

    function testVaultsPagination() public {
        // Create 5 vaults
        vm.startPrank(alice);
        for (uint256 i = 0; i < 5; i++) {
            GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
                name: string(abi.encodePacked("Vault ", i)),
                description: "Test vault",
                token: address(usdc),
                goalType: GoalFinance.GoalType.GROUP,
                visibility: GoalFinance.Visibility.PUBLIC,
                targetAmount: TARGET_AMOUNT,
                deadline: block.timestamp + 30 days,
                penaltyRate: DEFAULT_PENALTY_RATE
            });
            goalFinance.createVault(config);
        }
        vm.stopPrank();

        // Test pagination
        (uint256[] memory page1, bool hasMore1) = goalFinance.getVaultsPaginated(0, 3);
        assertEq(page1.length, 3);
        assertTrue(hasMore1);

        (uint256[] memory page2, bool hasMore2) = goalFinance.getVaultsPaginated(3, 3);
        assertEq(page2.length, 2);
        assertFalse(hasMore2);

        // Test out of bounds
        (uint256[] memory page3, bool hasMore3) = goalFinance.getVaultsPaginated(10, 3);
        assertEq(page3.length, 0);
        assertFalse(hasMore3);
    }

    function testNativeTokenVault() public {
        // Create native token vault
        vm.startPrank(alice);

        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "ETH Savings",
            description: "Saving in native ETH",
            token: goalFinance.NATIVE_TOKEN(),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: 5 ether, // 5 ETH target
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId, bytes32 inviteCode) = goalFinance.createVault(config);

        vm.stopPrank();

        // Check vault uses native token
        assertTrue(goalFinance.isNativeTokenVault(vaultId));

        // Bob joins with native token using V2 function
        vm.startPrank(bob);

        uint256 balanceBefore = bob.balance;
        goalFinance.joinVault{value: 2 ether}(vaultId, bytes32(0));
        uint256 balanceAfter = bob.balance;

        // Check ETH was deducted
        assertEq(balanceBefore - balanceAfter, 2 ether);

        // Check member deposit recorded
        GoalFinance.Member memory member = goalFinance.getMember(vaultId, bob);
        assertEq(member.depositedAmount, 2 ether);

        vm.stopPrank();
    }

    function testNativeTokenWithdrawal() public {
        // Create and fund native token vault to reach goal
        vm.prank(alice);
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "ETH Savings",
            description: "Saving in native ETH",
            token: goalFinance.NATIVE_TOKEN(),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: 2 ether,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        // Bob joins and reaches goal using V2 function
        vm.prank(bob);
        goalFinance.joinVault{value: 2 ether}(vaultId, bytes32(0));

        // Check goal is reached
        assertTrue(goalFinance.isGoalReached(vaultId));

        // Bob withdraws
        vm.startPrank(bob);
        uint256 balanceBefore = bob.balance;
        goalFinance.withdraw(vaultId);
        uint256 balanceAfter = bob.balance;

        // Should receive exactly what he contributed
        assertEq(balanceAfter - balanceBefore, 2 ether);

        vm.stopPrank();
    }

    function testMixedTokenVaults() public {
        vm.startPrank(alice);

        // Create ERC20 vault
        GoalFinance.VaultConfig memory usdcConfig = GoalFinance.VaultConfig({
            name: "USDC Vault",
            description: "USDC savings",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: 1000 * 1e6,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 usdcVaultId,) = goalFinance.createVault(usdcConfig);

        // Create native token vault
        GoalFinance.VaultConfig memory ethConfig = GoalFinance.VaultConfig({
            name: "ETH Vault",
            description: "ETH savings",
            token: goalFinance.NATIVE_TOKEN(),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: 5 ether,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 ethVaultId,) = goalFinance.createVault(ethConfig);

        vm.stopPrank();

        // Check vault types
        assertFalse(goalFinance.isNativeTokenVault(usdcVaultId));
        assertTrue(goalFinance.isNativeTokenVault(ethVaultId));

        // Bob can join both types using V2 functions
        vm.startPrank(bob);

        // Join USDC vault using ERC20 function
        goalFinance.joinVaultWithToken(usdcVaultId, 500 * 1e6, bytes32(0));

        // Join ETH vault using native function
        goalFinance.joinVault{value: 2 ether}(ethVaultId, bytes32(0));

        vm.stopPrank();

        // Verify deposits
        GoalFinance.Member memory usdcMember = goalFinance.getMember(usdcVaultId, bob);
        GoalFinance.Member memory ethMember = goalFinance.getMember(ethVaultId, bob);

        assertEq(usdcMember.depositedAmount, 500 * 1e6);
        assertEq(ethMember.depositedAmount, 2 ether);
    }

    // Test new V2 features
    function testConfigurablePenaltyRates() public {
        vm.startPrank(alice);

        // Create vault with custom penalty rate (5%)
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "High Penalty Vault",
            description: "Vault with 5% penalty",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: 500 // 5%
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        vm.stopPrank();

        // Bob joins and withdraws early
        vm.prank(bob);
        goalFinance.joinVaultWithToken(vaultId, DEPOSIT_AMOUNT, bytes32(0));

        vm.startPrank(bob);
        uint256 balanceBefore = usdc.balanceOf(bob);
        goalFinance.withdrawEarly(vaultId);
        uint256 balanceAfter = usdc.balanceOf(bob);

        // Should receive deposit minus 5% penalty
        uint256 penalty = (DEPOSIT_AMOUNT * 500) / 10000; // 5%
        uint256 expectedAmount = DEPOSIT_AMOUNT - penalty;
        assertEq(balanceAfter - balanceBefore, expectedAmount);

        vm.stopPrank();
    }

    function testAddNativeFunds() public {
        // Create native token vault
        vm.prank(alice);
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "ETH Vault",
            description: "ETH savings",
            token: goalFinance.NATIVE_TOKEN(),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: 5 ether,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        // Bob joins
        vm.prank(bob);
        goalFinance.joinVault{value: 2 ether}(vaultId, bytes32(0));

        // Bob adds more funds using V2 function
        vm.startPrank(bob);
        uint256 balanceBefore = bob.balance;
        goalFinance.addNativeFunds{value: 1 ether}(vaultId);
        uint256 balanceAfter = bob.balance;

        // Check ETH was deducted
        assertEq(balanceBefore - balanceAfter, 1 ether);

        // Check member deposit updated
        GoalFinance.Member memory member = goalFinance.getMember(vaultId, bob);
        assertEq(member.depositedAmount, 3 ether);

        vm.stopPrank();
    }

    function testNewViewFunctions() public {
        // Create vault
        vm.prank(alice);
        GoalFinance.VaultConfig memory config = GoalFinance.VaultConfig({
            name: "Test Vault",
            description: "Testing new view functions",
            token: address(usdc),
            goalType: GoalFinance.GoalType.GROUP,
            visibility: GoalFinance.Visibility.PUBLIC,
            targetAmount: TARGET_AMOUNT,
            deadline: block.timestamp + 30 days,
            penaltyRate: DEFAULT_PENALTY_RATE
        });
        (uint256 vaultId,) = goalFinance.createVault(config);

        // Test new view functions
        assertTrue(goalFinance.isNativeTokenVault(vaultId) == false);
        assertFalse(goalFinance.isGoalReached(vaultId));
        assertEq(uint256(goalFinance.checkVaultStatus(vaultId)), uint256(GoalFinance.VaultStatus.ACTIVE));
        assertFalse(goalFinance.isVaultExpired(vaultId));
        assertTrue(goalFinance.getTimeRemaining(vaultId) > 0);

        // Test getVaultConfig
        GoalFinance.VaultConfig memory retrievedConfig = goalFinance.getVaultConfig(vaultId);
        assertEq(retrievedConfig.name, "Test Vault");
        assertEq(retrievedConfig.penaltyRate, DEFAULT_PENALTY_RATE);
    }
}
