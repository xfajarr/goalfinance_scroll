// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";

/**
 * @title MockUSDCTest
 * @notice Test suite for simple MockUSDC functionality
 */
contract MockUSDCTest is Test {
    MockUSDC public usdc;
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public owner = address(this);
    
    uint256 public constant INITIAL_SUPPLY = 1000000 * 1e6; // 1M USDC
    
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    
    function setUp() public {
        usdc = new MockUSDC(INITIAL_SUPPLY);
    }
    
    function testInitialState() public view {
        assertEq(usdc.name(), "Mock USD Coin");
        assertEq(usdc.symbol(), "USDC");
        assertEq(usdc.decimals(), 6);
        assertEq(usdc.totalSupply(), INITIAL_SUPPLY);
        assertEq(usdc.balanceOf(owner), INITIAL_SUPPLY);
        assertEq(usdc.owner(), owner);
    }
    
    function testMintFunction() public {
        uint256 mintAmount = 50000 * 1e6; // 50k USDC
        
        // Owner can mint
        vm.expectEmit(true, false, false, true);
        emit Mint(user1, mintAmount);
        
        usdc.mint(user1, mintAmount);
        assertEq(usdc.balanceOf(user1), mintAmount);
        assertEq(usdc.totalSupply(), INITIAL_SUPPLY + mintAmount);
        
        // Non-owner cannot mint
        vm.prank(user1);
        vm.expectRevert();
        usdc.mint(user2, mintAmount);
    }
    
    function testMintZeroAddress() public {
        vm.expectRevert(MockUSDC.ZeroAddress.selector);
        usdc.mint(address(0), 1000 * 1e6);
    }
    
    function testBurnFunction() public {
        // Give user1 some tokens first
        uint256 mintAmount = 10000 * 1e6; // 10k USDC
        usdc.mint(user1, mintAmount);
        assertEq(usdc.balanceOf(user1), mintAmount);
        
        // User can burn their own tokens
        uint256 burnAmount = 3000 * 1e6; // 3k USDC
        
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit Burn(user1, burnAmount);
        
        usdc.burn(burnAmount);
        assertEq(usdc.balanceOf(user1), mintAmount - burnAmount);
        assertEq(usdc.totalSupply(), INITIAL_SUPPLY + mintAmount - burnAmount);
    }
    
    function testBurnInsufficientBalance() public {
        // User1 has no tokens
        assertEq(usdc.balanceOf(user1), 0);

        vm.prank(user1);
        vm.expectRevert(MockUSDC.InsufficientBalance.selector);
        usdc.burn(1000 * 1e6);
    }
    
    function testBurnFromFunction() public {
        // Give user1 some tokens
        uint256 mintAmount = 10000 * 1e6; // 10k USDC
        usdc.mint(user1, mintAmount);
        
        // User1 approves user2 to burn some tokens
        uint256 burnAmount = 2000 * 1e6; // 2k USDC
        vm.prank(user1);
        usdc.approve(user2, burnAmount);
        
        // User2 burns tokens from user1
        vm.prank(user2);
        vm.expectEmit(true, false, false, true);
        emit Burn(user1, burnAmount);
        
        usdc.burnFrom(user1, burnAmount);
        
        assertEq(usdc.balanceOf(user1), mintAmount - burnAmount);
        assertEq(usdc.allowance(user1, user2), 0); // Allowance should be reduced
        assertEq(usdc.totalSupply(), INITIAL_SUPPLY + mintAmount - burnAmount);
    }
    
    function testBurnFromInsufficientBalance() public {
        // User1 has no tokens but approves user2
        vm.prank(user1);
        usdc.approve(user2, 1000 * 1e6);

        vm.prank(user2);
        vm.expectRevert(MockUSDC.InsufficientBalance.selector);
        usdc.burnFrom(user1, 1000 * 1e6);
    }
    
    function testBurnFromInsufficientAllowance() public {
        // Give user1 tokens but no allowance
        usdc.mint(user1, 10000 * 1e6);

        vm.prank(user2);
        vm.expectRevert(MockUSDC.InsufficientAllowance.selector);
        usdc.burnFrom(user1, 1000 * 1e6);
    }
    
    function testStandardERC20Functions() public {
        // Test transfer
        usdc.mint(user1, 5000 * 1e6);
        
        vm.prank(user1);
        usdc.transfer(user2, 1000 * 1e6);
        
        assertEq(usdc.balanceOf(user1), 4000 * 1e6);
        assertEq(usdc.balanceOf(user2), 1000 * 1e6);
        
        // Test approve and transferFrom
        vm.prank(user1);
        usdc.approve(user2, 2000 * 1e6);
        
        vm.prank(user2);
        usdc.transferFrom(user1, user2, 1500 * 1e6);
        
        assertEq(usdc.balanceOf(user1), 2500 * 1e6);
        assertEq(usdc.balanceOf(user2), 2500 * 1e6);
        assertEq(usdc.allowance(user1, user2), 500 * 1e6);
    }
    
    function testLargeMintAmounts() public {
        // Test minting very large amounts (no supply limit)
        uint256 largeAmount = 1e18; // 1 trillion USDC
        
        usdc.mint(user1, largeAmount);
        assertEq(usdc.balanceOf(user1), largeAmount);
        assertEq(usdc.totalSupply(), INITIAL_SUPPLY + largeAmount);
    }
    
    function testMultipleMintAndBurn() public {
        // Multiple mint operations
        usdc.mint(user1, 1000 * 1e6);
        usdc.mint(user1, 2000 * 1e6);
        usdc.mint(user2, 3000 * 1e6);
        
        assertEq(usdc.balanceOf(user1), 3000 * 1e6);
        assertEq(usdc.balanceOf(user2), 3000 * 1e6);
        assertEq(usdc.totalSupply(), INITIAL_SUPPLY + 6000 * 1e6);
        
        // Multiple burn operations
        vm.prank(user1);
        usdc.burn(1000 * 1e6);
        
        vm.prank(user2);
        usdc.burn(500 * 1e6);
        
        assertEq(usdc.balanceOf(user1), 2000 * 1e6);
        assertEq(usdc.balanceOf(user2), 2500 * 1e6);
        assertEq(usdc.totalSupply(), INITIAL_SUPPLY + 4500 * 1e6);
    }
    
    function testFuzzMint(uint256 amount) public {
        // Bound amount to reasonable range
        amount = bound(amount, 1, 1e12 * 1e6); // Up to 1 trillion USDC
        
        usdc.mint(user1, amount);
        assertEq(usdc.balanceOf(user1), amount);
        assertEq(usdc.totalSupply(), INITIAL_SUPPLY + amount);
    }
    
    function testFuzzBurn(uint256 mintAmount, uint256 burnAmount) public {
        // Bound amounts
        mintAmount = bound(mintAmount, 1, 1e12 * 1e6);
        burnAmount = bound(burnAmount, 1, mintAmount);
        
        // Mint first
        usdc.mint(user1, mintAmount);
        
        // Then burn
        vm.prank(user1);
        usdc.burn(burnAmount);
        
        assertEq(usdc.balanceOf(user1), mintAmount - burnAmount);
        assertEq(usdc.totalSupply(), INITIAL_SUPPLY + mintAmount - burnAmount);
    }
}
