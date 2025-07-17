// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IGoalVault
 * @notice Interface for individual goal vault contracts
 */
interface IGoalVault {
    // Enums
    enum VaultStatus { ACTIVE, COMPLETED, FAILED, CANCELLED }

    // Structs
    struct VaultDetails {
        string name;
        string description;
        address creator;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 deadline;
        uint256 createdAt;
        VaultStatus status;
        bool isPublic;
        uint256 memberCount;
    }

    struct MemberInfo {
        address member;
        uint256 contribution;
        uint256 joinedAt;
        bool isActive;
    }

    // Core Events
    event FundsAdded(
        address indexed member,
        uint256 amount,
        uint256 newTotal,
        uint256 memberContribution,
        uint256 progressPercentage,
        uint256 timestamp
    );

    event MemberJoined(
        address indexed member,
        uint256 timestamp,
        uint256 memberCount,
        address indexed inviter
    );

    event MemberLeft(
        address indexed member,
        uint256 timestamp,
        uint256 memberCount,
        uint256 contributionReturned
    );

    event VaultCompleted(
        uint256 finalAmount,
        uint256 targetAmount,
        uint256 timestamp,
        uint256 memberCount,
        uint256 daysToComplete
    );

    event VaultFailed(
        uint256 finalAmount,
        uint256 targetAmount,
        uint256 timestamp,
        uint256 memberCount,
        string reason
    );

    event VaultCancelled(
        uint256 timestamp,
        uint256 amountReturned,
        uint256 memberCount,
        string reason
    );

    event FundsWithdrawn(
        address indexed member,
        uint256 amount,
        uint256 timestamp,
        string reason
    );

    // Analytics Events for Indexers
    event VaultProgressUpdate(
        uint256 currentAmount,
        uint256 targetAmount,
        uint256 progressPercentage,
        uint256 memberCount,
        uint256 daysRemaining,
        uint256 timestamp
    );

    event MemberContributionUpdate(
        address indexed member,
        uint256 totalContribution,
        uint256 contributionCount,
        uint256 lastContributionAmount,
        uint256 timestamp
    );

    event VaultMilestone(
        string milestone,
        uint256 amount,
        uint256 percentage,
        uint256 timestamp
    );

    // Security Events
    event EmergencyAction(
        string action,
        address indexed actor,
        uint256 timestamp,
        string reason
    );

    // Distribution Events
    event VaultFundsDistributed(
        uint256 memberCount,
        uint256 totalAmount,
        uint256 timestamp
    );

    // Core Functions
    function addFunds(uint256 amount) external;
    function joinVault(address member) external;
    function leaveVault() external;
    function completeVault() external;
    function cancelVault() external;
    function withdrawFunds() external;

    // View Functions
    function getVaultDetails() external view returns (VaultDetails memory);
    function getMemberInfo(address member) external view returns (MemberInfo memory);
    function getAllMembers() external view returns (MemberInfo[] memory);
    function getMemberCount() external view returns (uint256);
    function getTotalContributions() external view returns (uint256);
    function getRemainingAmount() external view returns (uint256);
    function getVaultProgress() external view returns (uint256);
    function getDaysRemaining() external view returns (uint256);
    function checkVaultStatus() external view returns (VaultStatus);
}