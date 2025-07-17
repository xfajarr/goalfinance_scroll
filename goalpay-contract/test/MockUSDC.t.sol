// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";

/**
 * @title MockUSDCTest
 * @notice Test suite for MockUSDC faucet functionality
 */
contract MockUSDCTest is Test {
    MockUSDC public usdc;
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public owner = address(this);
    
    uint256 public constant INITIAL_SUPPLY = 1000000 * 1e6; // 1M USDC
    uint256 public constant FAUCET_AMOUNT = 1000 * 1e6; // 1000 USDC
    uint256 public constant FAUCET_COOLDOWN = 1 days;
    
    event Faucet(address indexed to, uint256 amount);
    
    function setUp() public {
        usdc = new MockUSDC(INITIAL_SUPPLY);
    }
    
    function testInitialState() public view {
        assertEq(usdc.name(), "Mock USD Coin");
        assertEq(usdc.symbol(), "USDC");
        assertEq(usdc.decimals(), 6);
        assertEq(usdc.totalSupply(), INITIAL_SUPPLY);
        assertEq(usdc.balanceOf(owner), INITIAL_SUPPLY);
        assertEq(usdc.FAUCET_AMOUNT(), FAUCET_AMOUNT);
        assertEq(usdc.FAUCET_COOLDOWN(), FAUCET_COOLDOWN);
    }
    
    function testFaucetFirstClaim() public {
        vm.startPrank(user1);
        
        // Check initial state
        assertEq(usdc.balanceOf(user1), 0);
        assertTrue(usdc.canUseFaucet(user1));
        assertEq(usdc.getFaucetCooldown(user1), 0);
        
        // Expect faucet event
        vm.expectEmit(true, false, false, true);
        emit Faucet(user1, FAUCET_AMOUNT);
        
        // Claim faucet
        usdc.faucet();
        
        // Check state after claim
        assertEq(usdc.balanceOf(user1), FAUCET_AMOUNT);
        assertFalse(usdc.canUseFaucet(user1));
        assertEq(usdc.getFaucetCooldown(user1), FAUCET_COOLDOWN);
        assertEq(usdc.lastFaucetTime(user1), block.timestamp);
        
        vm.stopPrank();
    }
    
    function testFaucetCooldownPreventsImmediateClaim() public {
        vm.startPrank(user1);
        
        // First claim
        usdc.faucet();
        assertEq(usdc.balanceOf(user1), FAUCET_AMOUNT);
        
        // Try to claim again immediately - should fail
        vm.expectRevert("Faucet cooldown not met");
        usdc.faucet();
        
        // Balance should remain the same
        assertEq(usdc.balanceOf(user1), FAUCET_AMOUNT);
        
        vm.stopPrank();
    }
    
    function testFaucetAfterCooldownPeriod() public {
        vm.startPrank(user1);
        
        // First claim
        usdc.faucet();
        assertEq(usdc.balanceOf(user1), FAUCET_AMOUNT);
        
        // Fast forward time by 1 day
        vm.warp(block.timestamp + FAUCET_COOLDOWN);
        
        // Should be able to claim again
        assertTrue(usdc.canUseFaucet(user1));
        assertEq(usdc.getFaucetCooldown(user1), 0);
        
        // Second claim
        usdc.faucet();
        assertEq(usdc.balanceOf(user1), FAUCET_AMOUNT * 2);
        
        vm.stopPrank();
    }
    
    function testFaucetPartialCooldown() public {
        vm.startPrank(user1);
        
        // First claim
        usdc.faucet();
        
        // Fast forward time by 12 hours (half a day)
        uint256 halfDay = FAUCET_COOLDOWN / 2;
        vm.warp(block.timestamp + halfDay);
        
        // Should still be in cooldown
        assertFalse(usdc.canUseFaucet(user1));
        assertEq(usdc.getFaucetCooldown(user1), halfDay);
        
        // Try to claim - should fail
        vm.expectRevert("Faucet cooldown not met");
        usdc.faucet();
        
        vm.stopPrank();
    }
    
    function testMultipleUsersFaucet() public {
        // User1 claims
        vm.prank(user1);
        usdc.faucet();
        assertEq(usdc.balanceOf(user1), FAUCET_AMOUNT);
        
        // User2 can claim immediately (different user)
        vm.prank(user2);
        usdc.faucet();
        assertEq(usdc.balanceOf(user2), FAUCET_AMOUNT);
        
        // Both users should be in cooldown now
        assertFalse(usdc.canUseFaucet(user1));
        assertFalse(usdc.canUseFaucet(user2));
    }
    
    function testFaucetMaxSupplyLimit() public {
        // Deploy USDC with very small max supply
        MockUSDC smallUsdc = new MockUSDC(0);
        
        vm.startPrank(user1);
        
        // Should fail because it would exceed max supply
        vm.expectRevert("Would exceed max supply");
        smallUsdc.faucet();
        
        vm.stopPrank();
    }
    
    function testEmergencyFaucetOwnerOnly() public {
        // Owner can use emergency faucet
        usdc.emergencyFaucet(user1, FAUCET_AMOUNT);
        assertEq(usdc.balanceOf(user1), FAUCET_AMOUNT);
        
        // Non-owner cannot use emergency faucet
        vm.prank(user1);
        vm.expectRevert();
        usdc.emergencyFaucet(user2, FAUCET_AMOUNT);
    }
    
    function testEmergencyFaucetNoLimits() public {
        // Emergency faucet should work even if user is in cooldown
        vm.prank(user1);
        usdc.faucet();
        
        // User1 is now in cooldown
        assertFalse(usdc.canUseFaucet(user1));
        
        // But owner can still give them more via emergency faucet
        usdc.emergencyFaucet(user1, FAUCET_AMOUNT);
        assertEq(usdc.balanceOf(user1), FAUCET_AMOUNT * 2);
    }
    
    function testFaucetHelperFunctions() public {
        // Test canUseFaucet and getFaucetCooldown for new user
        assertTrue(usdc.canUseFaucet(user1));
        assertEq(usdc.getFaucetCooldown(user1), 0);
        
        // Claim faucet
        vm.prank(user1);
        usdc.faucet();
        
        // Test helper functions after claim
        assertFalse(usdc.canUseFaucet(user1));
        assertEq(usdc.getFaucetCooldown(user1), FAUCET_COOLDOWN);
        
        // Fast forward halfway through cooldown
        vm.warp(block.timestamp + FAUCET_COOLDOWN / 2);
        assertFalse(usdc.canUseFaucet(user1));
        assertEq(usdc.getFaucetCooldown(user1), FAUCET_COOLDOWN / 2);
        
        // Fast forward past cooldown
        vm.warp(block.timestamp + FAUCET_COOLDOWN / 2 + 1);
        assertTrue(usdc.canUseFaucet(user1));
        assertEq(usdc.getFaucetCooldown(user1), 0);
    }
    
    function testMintAndBurnFunctions() public {
        // Test mint (owner only)
        usdc.mint(user1, 5000 * 1e6);
        assertEq(usdc.balanceOf(user1), 5000 * 1e6);
        
        // Test burn
        vm.prank(user1);
        usdc.burn(2000 * 1e6);
        assertEq(usdc.balanceOf(user1), 3000 * 1e6);
        
        // Non-owner cannot mint
        vm.prank(user1);
        vm.expectRevert();
        usdc.mint(user2, 1000 * 1e6);
    }
    
    function testFuzzFaucetCooldown(uint256 timeElapsed) public {
        // Bound time elapsed to reasonable range (0 to 2 days)
        timeElapsed = bound(timeElapsed, 0, 2 days);
        
        vm.prank(user1);
        usdc.faucet();
        
        vm.warp(block.timestamp + timeElapsed);
        
        bool shouldBeAbleToUse = timeElapsed >= FAUCET_COOLDOWN;
        assertEq(usdc.canUseFaucet(user1), shouldBeAbleToUse);
        
        if (shouldBeAbleToUse) {
            assertEq(usdc.getFaucetCooldown(user1), 0);
        } else {
            assertEq(usdc.getFaucetCooldown(user1), FAUCET_COOLDOWN - timeElapsed);
        }
    }
}
