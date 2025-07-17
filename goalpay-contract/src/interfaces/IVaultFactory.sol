// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IVaultFactory
 * @notice Interface for the vault factory contract
 */
interface IVaultFactory {
    // Enums
    enum VaultStatus { ACTIVE, COMPLETED, FAILED, CANCELLED }

    // Structs
    struct VaultInfo {
        address vaultAddress;
        address creator;
        string vaultName;
        string description;
        uint256 targetAmount;
        uint256 deadline;
        uint256 createdAt;
        bool isPublic;
        bool isActive;
        VaultStatus status;
        uint256 memberCount;
    }

    // Events
    event VaultCreated(
        uint256 indexed vaultId, 
        address indexed vaultAddress, 
        address indexed creator, 
        string vaultName, 
        uint256 targetAmount, 
        uint256 deadline
    );
    event InviteCodeGenerated(uint256 indexed vaultId, bytes32 inviteCode);
    event VaultJoined(uint256 indexed vaultId, address indexed member);

    // Core Functions
    function createVault(
        string memory name,
        string memory description,
        uint256 targetAmount,
        uint256 deadline,
        bool isPublic
    ) external returns (uint256 vaultId);

    function generateInviteCode(uint256 vaultId) external returns (bytes32);
    function joinVaultByInvite(bytes32 inviteCode) external;

    // View Functions
    function getVault(uint256 vaultId) external view returns (VaultInfo memory);
    function getVaultsByCreator(address creator) external view returns (uint256[] memory);
    function getPublicVaults() external view returns (uint256[] memory);
    function getAllActiveVaults() external view returns (uint256[] memory);
    function getVaultByInviteCode(bytes32 inviteCode) external view returns (uint256);
    function getUSDCAddress() external view returns (address);

    // Admin Functions
    function pause() external;
    function unpause() external;
}
