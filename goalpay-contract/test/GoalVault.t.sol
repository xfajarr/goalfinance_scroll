// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/GoalVault.sol";
import "../src/MockUSDC.sol";
import "../src/interfaces/IGoalVault.sol";

contract GoalVaultTest is Test {
    GoalVault public vault;
    MockUSDC public usdc;
    
    address public factory = address(0x1);
    address public creator = address(0x2);
    address public user1 = address(0x3);
    address public user2 = address(0x4);
    
    uint256 constant TARGET_AMOUNT = 5000 * 1e6; // 5k USDC
    uint256 constant DEADLINE = 90 days;
    string constant VAULT_NAME = "Test Vault";
    string constant VAULT_DESC = "Test Description";
    
    function setUp() public {
        // Deploy USDC
        usdc = new MockUSDC(1000000 * 1e6);
        
        // Deploy vault
        vm.startPrank(factory);
        vault = new GoalVault(
            address(usdc),
            VAULT_NAME,
            VAULT_DESC,
            TARGET_AMOUNT,
            block.timestamp + DEADLINE,
            true,
            creator,
            factory
        );
        vm.stopPrank();
        
        // Give users USDC
        usdc.mint(creator, 10000 * 1e6);
        usdc.mint(user1, 10000 * 1e6);
        usdc.mint(user2, 10000 * 1e6);
    }
    
    function testInitialState() public {
        IGoalVault.VaultDetails memory details = vault.getVaultDetails();
        
        assertEq(details.name, VAULT_NAME);
        assertEq(details.description, VAULT_DESC);
        assertEq(details.creator, creator);
        assertEq(details.targetAmount, TARGET_AMOUNT);
        assertEq(details.currentAmount, 0);
        assertTrue(details.isPublic);
        assertEq(uint256(details.status), uint256(IGoalVault.VaultStatus.ACTIVE));
        assertEq(details.memberCount, 0);
    }
    
    function testAddFunds() public {
        uint256 amount = 1000 * 1e6; // 1k USDC
        
        vm.startPrank(user1);
        usdc.approve(address(vault), amount);
        
        vm.expectEmit(true, false, false, false);
        emit IGoalVault.FundsAdded(user1, amount, amount, amount, 2000, block.timestamp);
        
        vault.addFunds(amount);
        
        // Check vault state
        assertEq(vault.getTotalContributions(), amount);
        assertEq(vault.getMemberCount(), 1);
        
        // Check member info
        IGoalVault.MemberInfo memory memberInfo = vault.getMemberInfo(user1);
        assertEq(memberInfo.member, user1);
        assertEq(memberInfo.contribution, amount);
        assertTrue(memberInfo.isActive);
        
        vm.stopPrank();
    }
    
    function testAddFundsAutoJoin() public {
        uint256 amount = 500 * 1e6;
        
        vm.startPrank(user1);
        usdc.approve(address(vault), amount);
        
        // Should auto-join when adding funds
        vm.expectEmit(true, false, false, false);
        emit IGoalVault.MemberJoined(user1, block.timestamp, 1, address(0));
        
        vault.addFunds(amount);
        
        assertTrue(vault.getMemberInfo(user1).isActive);
        assertEq(vault.getMemberCount(), 1);
        
        vm.stopPrank();
    }
    
    function testAddFundsInvalidAmount() public {
        vm.startPrank(user1);
        
        vm.expectRevert(GoalVault__InvalidAmount.selector);
        vault.addFunds(0);
        
        vm.stopPrank();
    }
    
    function testAddFundsAfterDeadline() public {
        // Fast forward past deadline
        vm.warp(block.timestamp + DEADLINE + 1);
        
        vm.startPrank(user1);
        usdc.approve(address(vault), 1000 * 1e6);
        
        vm.expectRevert(GoalVault__DeadlineReached.selector);
        vault.addFunds(1000 * 1e6);
        
        vm.stopPrank();
    }
    
    function testJoinVault() public {
        vm.startPrank(factory);
        
        vm.expectEmit(true, false, false, false);
        emit IGoalVault.MemberJoined(user1, block.timestamp, 1, address(0));
        
        vault.joinVault(user1);
        
        assertTrue(vault.getMemberInfo(user1).isActive);
        assertEq(vault.getMemberCount(), 1);
        
        vm.stopPrank();
    }
    
    function testJoinVaultAlreadyMember() public {
        vm.startPrank(factory);
        
        vault.joinVault(user1);
        
        vm.expectRevert(GoalVault__AlreadyMember.selector);
        vault.joinVault(user1);
        
        vm.stopPrank();
    }
    
    function testLeaveVault() public {
        vm.startPrank(factory);
        vault.joinVault(user1);
        vm.stopPrank();
        
        vm.startPrank(user1);
        
        vm.expectEmit(true, false, false, false);
        emit IGoalVault.MemberLeft(user1, block.timestamp, 0, 0);
        
        vault.leaveVault();
        
        assertFalse(vault.getMemberInfo(user1).isActive);
        assertEq(vault.getMemberCount(), 0);
        
        vm.stopPrank();
    }
    
    function testLeaveVaultWithContribution() public {
        uint256 amount = 1000 * 1e6;
        
        vm.startPrank(user1);
        usdc.approve(address(vault), amount);
        vault.addFunds(amount);
        
        vm.expectRevert(GoalVault__CannotLeaveWithContribution.selector);
        vault.leaveVault();
        
        vm.stopPrank();
    }
    
    function testCompleteVaultGoalReached() public {
        // Add funds to reach goal
        vm.startPrank(user1);
        usdc.approve(address(vault), TARGET_AMOUNT);
        
        vm.expectEmit(false, false, false, false);
        emit IGoalVault.VaultCompleted(TARGET_AMOUNT, TARGET_AMOUNT, block.timestamp, 1, 0);
        
        vault.addFunds(TARGET_AMOUNT);
        
        assertEq(uint256(vault.checkVaultStatus()), uint256(IGoalVault.VaultStatus.COMPLETED));
        
        vm.stopPrank();
    }
    
    function testCompleteVaultDeadlinePassed() public {
        // Add some funds but not enough
        vm.startPrank(user1);
        usdc.approve(address(vault), 1000 * 1e6);
        vault.addFunds(1000 * 1e6);
        vm.stopPrank();
        
        // Fast forward past deadline
        vm.warp(block.timestamp + DEADLINE + 1);
        
        vm.expectEmit(false, false, false, false);
        emit IGoalVault.VaultFailed(1000 * 1e6, TARGET_AMOUNT, block.timestamp, 1, "DEADLINE_REACHED");
        
        vault.completeVault();
        
        assertEq(uint256(vault.checkVaultStatus()), uint256(IGoalVault.VaultStatus.FAILED));
    }
    
    function testCancelVault() public {
        // Add some funds first
        vm.startPrank(user1);
        usdc.approve(address(vault), 1000 * 1e6);
        vault.addFunds(1000 * 1e6);
        vm.stopPrank();
        
        uint256 balanceBefore = usdc.balanceOf(user1);
        
        vm.startPrank(creator);
        
        vm.expectEmit(false, false, false, false);
        emit IGoalVault.VaultCancelled(block.timestamp, 1000 * 1e6, 1, "CREATOR_CANCELLED");
        
        vault.cancelVault();
        
        assertEq(uint256(vault.checkVaultStatus()), uint256(IGoalVault.VaultStatus.CANCELLED));
        
        // Check funds were returned
        assertEq(usdc.balanceOf(user1), balanceBefore + 1000 * 1e6);
        
        vm.stopPrank();
    }
    
    function testWithdrawFundsAfterFailure() public {
        // Add funds
        vm.startPrank(user1);
        usdc.approve(address(vault), 1000 * 1e6);
        vault.addFunds(1000 * 1e6);
        vm.stopPrank();
        
        // Make vault fail
        vm.warp(block.timestamp + DEADLINE + 1);
        vault.completeVault();
        
        uint256 balanceBefore = usdc.balanceOf(user1);
        
        vm.startPrank(user1);
        
        vm.expectEmit(true, false, false, false);
        emit IGoalVault.FundsWithdrawn(user1, 1000 * 1e6, block.timestamp, "VAULT_FAILED");
        
        vault.withdrawFunds();
        
        assertEq(usdc.balanceOf(user1), balanceBefore + 1000 * 1e6);
        assertEq(vault.getMemberInfo(user1).contribution, 0);
        
        vm.stopPrank();
    }
    
    function testGetVaultProgress() public {
        // Add 50% of target
        uint256 halfTarget = TARGET_AMOUNT / 2;
        
        vm.startPrank(user1);
        usdc.approve(address(vault), halfTarget);
        vault.addFunds(halfTarget);
        
        uint256 progress = vault.getVaultProgress();
        assertEq(progress, 5000); // 50.00% (scaled by 100)
        
        vm.stopPrank();
    }
    
    function testGetDaysRemaining() public {
        uint256 daysRemaining = vault.getDaysRemaining();
        assertEq(daysRemaining, 90);
        
        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days);
        daysRemaining = vault.getDaysRemaining();
        assertEq(daysRemaining, 60);
    }
    
    function testGetAllMembers() public {
        // Add multiple members
        vm.startPrank(factory);
        vault.joinVault(user1);
        vault.joinVault(user2);
        vm.stopPrank();

        IGoalVault.MemberInfo[] memory members = vault.getAllMembers();
        assertEq(members.length, 2);
        assertEq(members[0].member, user1);
        assertEq(members[1].member, user2);
    }

    function testWithdrawFundsAfterCompletion() public {
        // Add funds to complete the vault
        vm.startPrank(user1);
        usdc.approve(address(vault), TARGET_AMOUNT);
        vault.addFunds(TARGET_AMOUNT);
        vm.stopPrank();

        // Verify vault is completed
        assertEq(uint256(vault.checkVaultStatus()), uint256(IGoalVault.VaultStatus.COMPLETED));

        uint256 balanceBefore = usdc.balanceOf(user1);

        // Withdraw funds
        vm.startPrank(user1);

        vm.expectEmit(true, false, false, false);
        emit IGoalVault.FundsWithdrawn(user1, TARGET_AMOUNT, block.timestamp, "VAULT_COMPLETED");

        vault.withdrawFunds();

        // Check funds were returned
        assertEq(usdc.balanceOf(user1), balanceBefore + TARGET_AMOUNT);
        assertEq(vault.getMemberInfo(user1).contribution, 0);

        vm.stopPrank();
    }

    function testGetWithdrawableAmount() public {
        // Test when vault is active (cannot withdraw)
        vm.startPrank(user1);
        usdc.approve(address(vault), 1000 * 1e6);
        vault.addFunds(1000 * 1e6);
        vm.stopPrank();

        (bool canWithdraw, uint256 amount) = vault.getWithdrawableAmount(user1);
        assertFalse(canWithdraw);
        assertEq(amount, 0);

        // Complete the vault
        vm.startPrank(user2);
        usdc.approve(address(vault), TARGET_AMOUNT);
        vault.addFunds(TARGET_AMOUNT);
        vm.stopPrank();

        // Now should be able to withdraw
        (canWithdraw, amount) = vault.getWithdrawableAmount(user1);
        assertTrue(canWithdraw);
        assertEq(amount, 1000 * 1e6);
    }
}
