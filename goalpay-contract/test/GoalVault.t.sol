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
        
        // Deploy vault (GROUP type)
        vm.startPrank(factory);
        vault = new GoalVault(
            address(usdc),
            VAULT_NAME,
            VAULT_DESC,
            TARGET_AMOUNT,
            block.timestamp + DEADLINE,
            true,
            IGoalVault.GoalType.GROUP,
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
        emit IGoalVault.MemberJoined(user1, 0, block.timestamp, 1, address(0));
        
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
        emit IGoalVault.MemberJoined(user1, 0, block.timestamp, 1, address(0));

        vault.joinVault(user1, 0);
        
        assertTrue(vault.getMemberInfo(user1).isActive);
        assertEq(vault.getMemberCount(), 1);
        
        vm.stopPrank();
    }
    
    function testJoinVaultAlreadyMember() public {
        vm.startPrank(factory);
        
        vault.joinVault(user1, 0);

        vm.expectRevert(GoalVault__AlreadyMember.selector);
        vault.joinVault(user1, 0);
        
        vm.stopPrank();
    }
    
    function testLeaveVault() public {
        vm.startPrank(factory);
        vault.joinVault(user1, 0);
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
        emit IGoalVault.FundsWithdrawn(user1, 1000 * 1e6, 0, block.timestamp, "VAULT_FAILED");
        
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
        vault.joinVault(user1, 0);
        vault.joinVault(user2, 0);
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
        emit IGoalVault.FundsWithdrawn(user1, TARGET_AMOUNT, 0, block.timestamp, "VAULT_COMPLETED");

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

    // ============ NEW MVP TESTS ============

    function testPersonalGoalVault() public {
        // Deploy PERSONAL type vault
        vm.startPrank(factory);
        GoalVault personalVault = new GoalVault(
            address(usdc),
            "Personal Goals Vault",
            "Individual savings goals",
            0, // No shared target for PERSONAL type
            block.timestamp + DEADLINE,
            true,
            IGoalVault.GoalType.PERSONAL,
            creator,
            factory
        );
        vm.stopPrank();

        uint256 user1Goal = 2000 * 1e6; // 2k USDC
        uint256 user2Goal = 3000 * 1e6; // 3k USDC

        // User1 joins with personal goal (via factory)
        vm.startPrank(factory);
        personalVault.joinVault(user1, user1Goal);
        vm.stopPrank();

        vm.startPrank(user1);
        usdc.approve(address(personalVault), user1Goal);

        // Add funds towards personal goal
        personalVault.addFunds(1500 * 1e6); // 1.5k USDC

        IGoalVault.MemberInfo memory user1Info = personalVault.getMemberInfo(user1);
        assertEq(user1Info.personalGoalAmount, user1Goal);
        assertEq(user1Info.contribution, 1500 * 1e6);
        assertFalse(user1Info.hasReachedPersonalGoal);
        vm.stopPrank();

        // User2 joins with different personal goal (via factory)
        vm.startPrank(factory);
        personalVault.joinVault(user2, user2Goal);
        vm.stopPrank();

        vm.startPrank(user2);
        usdc.approve(address(personalVault), user2Goal);
        personalVault.addFunds(user2Goal); // Reach personal goal immediately

        IGoalVault.MemberInfo memory user2Info = personalVault.getMemberInfo(user2);
        assertTrue(user2Info.hasReachedPersonalGoal);
        vm.stopPrank();

        // Check personal goal progress
        assertEq(personalVault.getPersonalGoalProgress(user1), 7500); // 75%
        assertEq(personalVault.getPersonalGoalProgress(user2), 10000); // 100%
    }

    function testEarlyWithdrawalPenalty() public {
        uint256 contribution = 1000 * 1e6; // 1k USDC

        // User adds funds
        vm.startPrank(user1);
        usdc.approve(address(vault), contribution);
        vault.addFunds(contribution);

        // Early withdrawal
        uint256 expectedPenalty = (contribution * 200) / 10000; // 2%
        uint256 expectedWithdraw = contribution - expectedPenalty;

        vm.expectEmit(true, false, false, false);
        emit IGoalVault.EarlyWithdrawal(
            user1,
            expectedWithdraw,
            expectedPenalty,
            block.timestamp + 30 days,
            block.timestamp
        );

        vault.withdrawEarly();

        // Check penalty info
        IGoalVault.PenaltyInfo memory penaltyInfo = vault.getPenaltyInfo(user1);
        assertEq(penaltyInfo.amount, expectedPenalty);
        assertEq(penaltyInfo.releaseTime, block.timestamp + 30 days);
        assertFalse(penaltyInfo.claimed);

        // Check user received withdrawal amount
        assertEq(usdc.balanceOf(user1), 10000 * 1e6 - contribution + expectedWithdraw);

        // Cannot claim penalty refund yet
        assertFalse(vault.canClaimPenaltyRefund(user1));
        vm.stopPrank();
    }

    function testPenaltyRefundAfterOneMonth() public {
        uint256 contribution = 1000 * 1e6;

        // User adds funds and withdraws early
        vm.startPrank(user1);
        usdc.approve(address(vault), contribution);
        vault.addFunds(contribution);
        vault.withdrawEarly();

        uint256 expectedPenalty = (contribution * 200) / 10000; // 2%

        // Fast forward 1 month
        vm.warp(block.timestamp + 30 days + 1);

        // Now can claim penalty refund
        assertTrue(vault.canClaimPenaltyRefund(user1));

        vm.expectEmit(true, false, false, false);
        emit IGoalVault.PenaltyRefunded(user1, expectedPenalty, block.timestamp);

        vault.claimPenaltyRefund();

        // Check penalty is marked as claimed
        IGoalVault.PenaltyInfo memory penaltyInfo = vault.getPenaltyInfo(user1);
        assertTrue(penaltyInfo.claimed);
        vm.stopPrank();
    }

    function testGroupGoalCompletion() public {
        // Multiple users contribute to reach group goal
        vm.startPrank(user1);
        usdc.approve(address(vault), 3000 * 1e6);
        vault.addFunds(3000 * 1e6);
        vm.stopPrank();

        vm.startPrank(user2);
        usdc.approve(address(vault), 2000 * 1e6);
        vault.addFunds(2000 * 1e6); // Total: 5000 USDC = TARGET_AMOUNT
        vm.stopPrank();

        // Vault should be completed
        assertEq(uint256(vault.checkVaultStatus()), uint256(IGoalVault.VaultStatus.COMPLETED));

        // Both users can withdraw their contributions (no yield in MVP)
        vm.startPrank(user1);
        vault.withdrawFunds();
        assertEq(usdc.balanceOf(user1), 10000 * 1e6); // Got back original contribution
        vm.stopPrank();

        vm.startPrank(user2);
        vault.withdrawFunds();
        assertEq(usdc.balanceOf(user2), 10000 * 1e6); // Got back original contribution
        vm.stopPrank();
    }

    function testPersonalGoalVaultCompletion() public {
        // Deploy PERSONAL type vault
        vm.startPrank(factory);
        GoalVault personalVault = new GoalVault(
            address(usdc),
            "Personal Goals Vault",
            "Individual savings goals",
            0,
            block.timestamp + DEADLINE,
            true,
            IGoalVault.GoalType.PERSONAL,
            creator,
            factory
        );
        vm.stopPrank();

        uint256 user1Goal = 1000 * 1e6;
        uint256 user2Goal = 2000 * 1e6;

        // Both users join and reach their personal goals
        vm.startPrank(factory);
        personalVault.joinVault(user1, user1Goal);
        personalVault.joinVault(user2, user2Goal);
        vm.stopPrank();

        vm.startPrank(user1);
        usdc.approve(address(personalVault), user1Goal);
        personalVault.addFunds(user1Goal);
        vm.stopPrank();

        vm.startPrank(user2);
        usdc.approve(address(personalVault), user2Goal);
        personalVault.addFunds(user2Goal);
        vm.stopPrank();

        // Vault should be completed (all members reached personal goals)
        assertEq(uint256(personalVault.checkVaultStatus()), uint256(IGoalVault.VaultStatus.COMPLETED));
    }

    function testVaultFailureScenarioAfterDeadline() public {
        uint256 contribution = 1000 * 1e6; // Less than target

        // User adds funds but doesn't reach target
        vm.startPrank(user1);
        usdc.approve(address(vault), contribution);
        vault.addFunds(contribution);
        vm.stopPrank();

        // Fast forward past deadline
        vm.warp(block.timestamp + DEADLINE + 1);

        // Complete vault (should fail due to deadline)
        vault.completeVault();

        // Vault should be failed
        assertEq(uint256(vault.checkVaultStatus()), uint256(IGoalVault.VaultStatus.FAILED));

        // User can withdraw full contribution (no penalty for failed vault)
        vm.startPrank(user1);
        vault.withdrawFunds();
        assertEq(usdc.balanceOf(user1), 10000 * 1e6); // Got back original contribution
        vm.stopPrank();
    }
}
