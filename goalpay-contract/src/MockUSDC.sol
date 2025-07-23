// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Mock USDC token for testing purposes
 * @dev Simple ERC20 with 6 decimals like real USDC, mint/burn controlled by owner
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;

    // Custom errors for gas optimization
    error ZeroAddress();
    error InsufficientBalance();
    error InsufficientAllowance();
    error InvalidAmount();

    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    /**
     * @notice Constructor creates MockUSDC with initial supply
     * @param initialSupply Initial supply to mint to deployer
     */
    constructor(uint256 initialSupply) ERC20("Mock USD Coin", "USDC") Ownable(msg.sender) {
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    /**
     * @notice Returns the number of decimals (6 like real USDC)
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @notice Mint tokens to a specific address (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount to mint (in 6 decimal format)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        _mint(to, amount);
        emit Mint(to, amount);
    }

    /**
     * @notice Burn tokens from caller's balance
     * @param amount Amount to burn (in 6 decimal format)
     */
    function burn(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();
        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }

    /**
     * @notice Burn tokens from a specific address (requires allowance)
     * @param from Address to burn tokens from
     * @param amount Amount to burn (in 6 decimal format)
     */
    function burnFrom(address from, uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        if (balanceOf(from) < amount) revert InsufficientBalance();

        uint256 currentAllowance = allowance(from, msg.sender);
        if (currentAllowance < amount) revert InsufficientAllowance();

        unchecked {
            _approve(from, msg.sender, currentAllowance - amount);
        }
        _burn(from, amount);
        emit Burn(from, amount);
    }
}
