// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/AcornsVault.sol";
import "../src/MockUSDC.sol";
import "../src/MockUSDT.sol";
import "../src/MockDAI.sol";

contract AcornsVaultTest is Test {
    AcornsVault public acornsVault;
    MockUSDC public mockUSDC;
    MockUSDT public mockUSDT;
    MockDAI public mockDAI;
    
    address public owner;
    address public user1;
    address public user2;
    
    uint256 public constant INITIAL_SUPPLY = 1_000_000;
    uint256 public constant TEST_AMOUNT = 1000;
    
    event UserRegistered(address indexed user, AcornsVault.PortfolioType portfolio);
    event PurchaseRecorded(address indexed user, uint256 amount, uint256 roundUp, string merchant);
    event RoundUpsInvested(address indexed user, uint256 amount);
    event FundsDeposited(address indexed user, address token, uint256 amount);
    event YieldClaimed(address indexed user, uint256 amount);
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy contracts
        acornsVault = new AcornsVault();
        mockUSDC = new MockUSDC(INITIAL_SUPPLY * 1e6);
        mockUSDT = new MockUSDT(INITIAL_SUPPLY * 1e6);
        mockDAI = new MockDAI(INITIAL_SUPPLY * 1e18);
        
        // Configure supported tokens
        acornsVault.setSupportedToken(address(mockUSDC), true, 1e6, 6);
        acornsVault.setSupportedToken(address(mockUSDT), true, 1e6, 6);
        acornsVault.setSupportedToken(address(mockDAI), true, 1e6, 18);
        
        // Give users some tokens
        mockUSDC.transfer(user1, TEST_AMOUNT * 1e6);
        mockUSDC.transfer(user2, TEST_AMOUNT * 1e6);
        mockUSDT.transfer(user1, TEST_AMOUNT * 1e6);
        mockDAI.transfer(user1, TEST_AMOUNT * 1e18);
    }
    
    function testUserRegistration() public {
        vm.startPrank(user1);
        
        vm.expectEmit(true, false, false, true);
        emit UserRegistered(user1, AcornsVault.PortfolioType.MODERATE);
        
        acornsVault.registerUser(AcornsVault.PortfolioType.MODERATE);
        
        AcornsVault.UserAccount memory account = acornsVault.getUserAccount(user1);
        assertEq(uint256(account.portfolio), uint256(AcornsVault.PortfolioType.MODERATE));
        assertTrue(account.isRegistered);
        assertEq(account.totalInvested, 0);
        
        vm.stopPrank();
    }
    
    function testCannotRegisterTwice() public {
        vm.startPrank(user1);
        
        acornsVault.registerUser(AcornsVault.PortfolioType.CONSERVATIVE);
        
        vm.expectRevert(AcornsVault.AcornsVault__UserAlreadyRegistered.selector);
        acornsVault.registerUser(AcornsVault.PortfolioType.MODERATE);
        
        vm.stopPrank();
    }
    
    function testRoundUpCalculation() public {
        // Test various amounts
        assertEq(acornsVault.calculateRoundUp(4.25 * 1e6), 0.75 * 1e6); // $4.25 -> $0.75
        assertEq(acornsVault.calculateRoundUp(12.67 * 1e6), 0.33 * 1e6); // $12.67 -> $0.33
        assertEq(acornsVault.calculateRoundUp(25.00 * 1e6), 0); // $25.00 -> $0.00
        assertEq(acornsVault.calculateRoundUp(0.01 * 1e6), 0.99 * 1e6); // $0.01 -> $0.99
    }
    
    function testPurchaseSimulation() public {
        vm.startPrank(user1);
        
        acornsVault.registerUser(AcornsVault.PortfolioType.MODERATE);
        
        vm.expectEmit(true, false, false, true);
        emit PurchaseRecorded(user1, 4.25 * 1e6, 0.75 * 1e6, "Coffee Shop");
        
        acornsVault.simulatePurchase(4.25 * 1e6, "Coffee Shop");
        
        AcornsVault.Purchase[] memory purchases = acornsVault.getUserPurchases(user1);
        assertEq(purchases.length, 1);
        assertEq(purchases[0].amount, 4.25 * 1e6);
        assertEq(purchases[0].roundUpAmount, 0.75 * 1e6);
        assertFalse(purchases[0].invested);
        
        uint256 pendingRoundUps = acornsVault.getPendingRoundUps(user1);
        assertEq(pendingRoundUps, 0.75 * 1e6);
        
        vm.stopPrank();
    }
    
    function testMultiplePurchasesAndRoundUps() public {
        vm.startPrank(user1);
        
        acornsVault.registerUser(AcornsVault.PortfolioType.AGGRESSIVE);
        
        // Simulate multiple purchases
        acornsVault.simulatePurchase(4.25 * 1e6, "Coffee Shop");    // $0.75 round-up
        acornsVault.simulatePurchase(12.67 * 1e6, "Grocery Store"); // $0.33 round-up
        acornsVault.simulatePurchase(25.99 * 1e6, "Gas Station");   // $0.01 round-up
        
        uint256 expectedRoundUps = 0.75 * 1e6 + 0.33 * 1e6 + 0.01 * 1e6;
        uint256 pendingRoundUps = acornsVault.getPendingRoundUps(user1);
        assertEq(pendingRoundUps, expectedRoundUps);
        
        AcornsVault.Purchase[] memory purchases = acornsVault.getUserPurchases(user1);
        assertEq(purchases.length, 3);
        
        vm.stopPrank();
    }
    
    function testInvestRoundUps() public {
        vm.startPrank(user1);
        
        acornsVault.registerUser(AcornsVault.PortfolioType.MODERATE);
        acornsVault.simulatePurchase(4.25 * 1e6, "Coffee Shop");
        acornsVault.simulatePurchase(12.67 * 1e6, "Grocery Store");
        
        uint256 expectedRoundUps = 0.75 * 1e6 + 0.33 * 1e6;
        
        vm.expectEmit(true, false, false, true);
        emit RoundUpsInvested(user1, expectedRoundUps);
        
        acornsVault.investRoundUps();
        
        AcornsVault.UserAccount memory account = acornsVault.getUserAccount(user1);
        assertEq(account.totalInvested, expectedRoundUps);
        assertEq(account.totalRoundUps, expectedRoundUps);
        assertEq(account.pendingRoundUps, 0);
        
        // Check that purchases are marked as invested
        AcornsVault.Purchase[] memory purchases = acornsVault.getUserPurchases(user1);
        assertTrue(purchases[0].invested);
        assertTrue(purchases[1].invested);
        
        vm.stopPrank();
    }
    
    function testRecurringInvestment() public {
        vm.startPrank(user1);
        
        acornsVault.registerUser(AcornsVault.PortfolioType.CONSERVATIVE);
        
        // Set up weekly $50 recurring investment
        acornsVault.setRecurringInvestment(50 * 1e6, 7);
        
        AcornsVault.UserAccount memory account = acornsVault.getUserAccount(user1);
        assertTrue(account.recurringEnabled);
        assertEq(account.recurringAmount, 50 * 1e6);
        assertEq(account.recurringInterval, 7 * 86400); // 7 days in seconds
        
        // Should not be able to execute immediately
        vm.expectRevert(AcornsVault.AcornsVault__RecurringNotDue.selector);
        acornsVault.executeRecurringInvestment();
        
        // Fast forward 7 days
        vm.warp(block.timestamp + 7 days);
        
        // Now should be able to execute
        assertTrue(acornsVault.isRecurringDue(user1));
        acornsVault.executeRecurringInvestment();
        
        account = acornsVault.getUserAccount(user1);
        assertEq(account.totalInvested, 50 * 1e6);
        
        vm.stopPrank();
    }
    
    function testMultiTokenDeposit() public {
        vm.startPrank(user1);
        
        acornsVault.registerUser(AcornsVault.PortfolioType.MODERATE);
        
        // Approve tokens
        mockUSDC.approve(address(acornsVault), 100 * 1e6);
        mockUSDT.approve(address(acornsVault), 100 * 1e6);
        mockDAI.approve(address(acornsVault), 100 * 1e18);
        
        // Deposit USDC
        vm.expectEmit(true, true, false, true);
        emit FundsDeposited(user1, address(mockUSDC), 100 * 1e6);
        acornsVault.depositFunds(address(mockUSDC), 100 * 1e6);
        
        // Deposit USDT
        acornsVault.depositFunds(address(mockUSDT), 100 * 1e6);
        
        // Deposit DAI
        acornsVault.depositFunds(address(mockDAI), 100 * 1e18);
        
        AcornsVault.UserAccount memory account = acornsVault.getUserAccount(user1);
        assertEq(account.totalInvested, 300 * 1e6); // All converted to USDC equivalent
        
        vm.stopPrank();
    }
    
    function testYieldCalculation() public {
        vm.startPrank(user1);

        acornsVault.registerUser(AcornsVault.PortfolioType.AGGRESSIVE); // 8% APY

        // Invest some amount with round-up
        acornsVault.simulatePurchase(99.25 * 1e6, "Test Purchase"); // Generates $0.75 round-up
        acornsVault.investRoundUps();

        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days);

        uint256 yield = acornsVault.calculateYield(user1);

        // Should have some yield (approximately 8% APY for 30 days)
        assertGt(yield, 0);

        // Claim yield
        if (yield > 0) {
            vm.expectEmit(true, false, false, true);
            emit YieldClaimed(user1, yield);
            acornsVault.claimYield();
        }

        vm.stopPrank();
    }
    
    function testPortfolioAPYRates() public {
        assertEq(acornsVault.getPortfolioAPY(AcornsVault.PortfolioType.CONSERVATIVE), 400); // 4%
        assertEq(acornsVault.getPortfolioAPY(AcornsVault.PortfolioType.MODERATE), 600); // 6%
        assertEq(acornsVault.getPortfolioAPY(AcornsVault.PortfolioType.AGGRESSIVE), 800); // 8%
    }
    
    function testChangePortfolio() public {
        vm.startPrank(user1);
        
        acornsVault.registerUser(AcornsVault.PortfolioType.CONSERVATIVE);
        
        acornsVault.changePortfolio(AcornsVault.PortfolioType.AGGRESSIVE);
        
        AcornsVault.UserAccount memory account = acornsVault.getUserAccount(user1);
        assertEq(uint256(account.portfolio), uint256(AcornsVault.PortfolioType.AGGRESSIVE));
        
        vm.stopPrank();
    }
    
    function testWithdrawFunds() public {
        vm.startPrank(user1);

        acornsVault.registerUser(AcornsVault.PortfolioType.MODERATE);

        // Invest some round-ups
        acornsVault.simulatePurchase(9.25 * 1e6, "Test"); // Generates $0.75 round-up
        acornsVault.investRoundUps();

        uint256 initialInvestment = acornsVault.getUserAccount(user1).totalInvested;

        // Withdraw half
        uint256 withdrawAmount = initialInvestment / 2;
        acornsVault.withdrawFunds(withdrawAmount);

        AcornsVault.UserAccount memory account = acornsVault.getUserAccount(user1);
        assertEq(account.totalInvested, initialInvestment - withdrawAmount);

        vm.stopPrank();
    }
    
    function testCannotUseWithoutRegistration() public {
        vm.startPrank(user1);
        
        vm.expectRevert(AcornsVault.AcornsVault__UserNotRegistered.selector);
        acornsVault.simulatePurchase(10 * 1e6, "Test");
        
        vm.expectRevert(AcornsVault.AcornsVault__UserNotRegistered.selector);
        acornsVault.investRoundUps();
        
        vm.stopPrank();
    }
    
    function testGetPortfolioValue() public {
        vm.startPrank(user1);

        acornsVault.registerUser(AcornsVault.PortfolioType.MODERATE);
        acornsVault.simulatePurchase(99.50 * 1e6, "Test"); // Generates $0.50 round-up
        acornsVault.investRoundUps();

        uint256 portfolioValue = acornsVault.getPortfolioValue(user1);
        assertGt(portfolioValue, 0);

        // Fast forward and check yield is included
        vm.warp(block.timestamp + 30 days);
        uint256 newPortfolioValue = acornsVault.getPortfolioValue(user1);
        assertGt(newPortfolioValue, portfolioValue);

        vm.stopPrank();
    }
}
