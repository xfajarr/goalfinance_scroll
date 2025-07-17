// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VaultLibrary
 * @notice Library with shared utility functions for vault operations
 */
library VaultLibrary {
    
    /**
     * @notice Calculate percentage with precision
     * @param amount The amount to calculate percentage of
     * @param total The total amount
     * @param precision The precision factor (e.g., 10000 for 2 decimal places)
     * @return The percentage scaled by precision
     */
    function calculatePercentage(
        uint256 amount, 
        uint256 total, 
        uint256 precision
    ) internal pure returns (uint256) {
        if (total == 0) return 0;
        if (amount >= total) return precision;
        return (amount * precision) / total;
    }

    /**
     * @notice Calculate days between two timestamps
     * @param startTime Start timestamp
     * @param endTime End timestamp
     * @return Number of days between timestamps
     */
    function daysBetween(uint256 startTime, uint256 endTime) internal pure returns (uint256) {
        if (endTime <= startTime) return 0;
        return (endTime - startTime) / 1 days;
    }

    /**
     * @notice Check if deadline has passed
     * @param deadline The deadline timestamp
     * @return True if deadline has passed
     */
    function isDeadlinePassed(uint256 deadline) internal view returns (bool) {
        return block.timestamp > deadline;
    }

    /**
     * @notice Validate vault creation parameters
     * @param targetAmount Target amount for the vault
     * @param deadline Deadline timestamp
     * @param name Vault name
     * @return True if all parameters are valid
     */
    function validateVaultParams(
        uint256 targetAmount,
        uint256 deadline,
        string memory name
    ) internal view returns (bool) {
        return targetAmount > 0 && 
               deadline > block.timestamp && 
               bytes(name).length > 0 && 
               bytes(name).length <= 100;
    }

    /**
     * @notice Generate a pseudo-random number for invite codes
     * @param seed Additional seed for randomness
     * @return Random bytes32 value
     */
    function generateRandomBytes(uint256 seed) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                msg.sender,
                seed
            )
        );
    }

    /**
     * @notice Safely convert uint256 to string
     * @param value The value to convert
     * @return String representation of the value
     */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @notice Format USDC amount for display (6 decimals to 2 decimals)
     * @param amount Amount in USDC (6 decimals)
     * @return Formatted string with 2 decimal places
     */
    function formatUSDC(uint256 amount) internal pure returns (string memory) {
        uint256 wholePart = amount / 1e6;
        uint256 fractionalPart = (amount % 1e6) / 1e4; // Convert to 2 decimals
        
        return string(abi.encodePacked(
            toString(wholePart),
            ".",
            fractionalPart < 10 ? "0" : "",
            toString(fractionalPart)
        ));
    }

    /**
     * @notice Check if an address is a valid Ethereum address
     * @param addr Address to validate
     * @return True if address is valid (not zero address)
     */
    function isValidAddress(address addr) internal pure returns (bool) {
        return addr != address(0);
    }

    /**
     * @notice Calculate time remaining until deadline
     * @param deadline The deadline timestamp
     * @return seconds remaining (0 if deadline passed)
     */
    function timeRemaining(uint256 deadline) internal view returns (uint256) {
        if (block.timestamp >= deadline) {
            return 0;
        }
        return deadline - block.timestamp;
    }

    /**
     * @notice Check if amount is within reasonable bounds for USDC
     * @param amount Amount to check (in 6 decimals)
     * @return True if amount is reasonable
     */
    function isReasonableAmount(uint256 amount) internal pure returns (bool) {
        // Minimum: 0.01 USDC (10000 in 6 decimals)
        // Maximum: 1 billion USDC (1e15 in 6 decimals)
        return amount >= 10000 && amount <= 1e15;
    }

    /**
     * @notice Calculate proportional distribution
     * @param totalAmount Total amount to distribute
     * @param userContribution User's contribution
     * @param totalContributions Total contributions from all users
     * @return User's proportional share
     */
    function calculateProportionalShare(
        uint256 totalAmount,
        uint256 userContribution,
        uint256 totalContributions
    ) internal pure returns (uint256) {
        if (totalContributions == 0 || userContribution == 0) {
            return 0;
        }
        return (totalAmount * userContribution) / totalContributions;
    }
}
