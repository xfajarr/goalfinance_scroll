// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./GoalVault.sol";

// Custom errors for gas efficiency
error GoalVaultFactory__InvalidAmount();
error GoalVaultFactory__InvalidDeadline();
error GoalVaultFactory__VaultNotFound();
error GoalVaultFactory__InviteCodeInvalid();
error GoalVaultFactory__EmptyName();
error GoalVaultFactory__NotAuthorized();
error GoalVaultFactory__VaultNotActive();

contract GoalVaultFactory is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    uint256 public nextVaultId;

    enum VaultStatus {
        ACTIVE,
        COMPLETED,
        FAILED,
        CANCELLED
    }

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

    struct MemberInfo {
        address member;
        uint256 contribution;
        uint256 joinedAt;
        bool isActive;
    }

    mapping(uint256 => VaultInfo) public vaults;
    mapping(address => uint256[]) public vaultsByCreator;
    mapping(bytes32 => uint256) public inviteCodes;

    // Core Events
    event VaultCreated(
        uint256 indexed vaultId,
        address indexed vaultAddress,
        address indexed creator,
        string vaultName,
        string description,
        uint256 targetAmount,
        uint256 deadline,
        bool isPublic,
        uint256 timestamp
    );

    event InviteCodeGenerated(
        uint256 indexed vaultId,
        bytes32 indexed inviteCode,
        address indexed generator,
        uint256 timestamp
    );

    event VaultJoined(
        uint256 indexed vaultId,
        address indexed member,
        address indexed inviter,
        uint256 timestamp
    );

    // Analytics Events for Indexers
    event VaultStatusChanged(
        uint256 indexed vaultId,
        VaultStatus indexed oldStatus,
        VaultStatus indexed newStatus,
        uint256 timestamp,
        string reason
    );

    event VaultMetricsUpdated(
        uint256 indexed vaultId,
        uint256 memberCount,
        uint256 currentAmount,
        uint256 targetAmount,
        uint256 progressPercentage,
        uint256 timestamp
    );

    event FactoryMetrics(
        uint256 totalVaults,
        uint256 activeVaults,
        uint256 completedVaults,
        uint256 totalValueLocked,
        uint256 timestamp
    );

    // Administrative Events
    event FactoryPaused(address indexed admin, uint256 timestamp, string reason);
    event FactoryUnpaused(address indexed admin, uint256 timestamp);
    event USDCAddressUpdated(address indexed oldUSDC, address indexed newUSDC, uint256 timestamp);
    
    /**
     * @notice Constructor sets the USDC token address
     * @param _usdc Address of the USDC token contract
     */
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        nextVaultId = 1; // Start vault IDs from 1
    }

    /**
     * @notice Creates a new savings vault
     * @param _vaultName Name of the vault
     * @param _description Description of the savings goal
     * @param _targetAmount Target amount to save (in USDC, 6 decimals)
     * @param _deadline Deadline timestamp for the goal
     * @param _isPublic Whether the vault is publicly visible
     * @return vaultId The ID of the created vault
     */
    function createVault(
        string memory _vaultName,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline,
        bool _isPublic
    ) external whenNotPaused nonReentrant returns (uint256) {
        // Input validation
        if (bytes(_vaultName).length == 0) {
            revert GoalVaultFactory__EmptyName();
        }
        if (_targetAmount == 0) {
            revert GoalVaultFactory__InvalidAmount();
        }
        if (_deadline <= block.timestamp) {
            revert GoalVaultFactory__InvalidDeadline();
        }

        // Get unique vault ID
        uint256 vaultId = nextVaultId++;

        // Create new vault contract
        GoalVault newVault = new GoalVault(
            address(usdc),
            _vaultName,
            _description,
            _targetAmount,
            _deadline,
            _isPublic,
            msg.sender,
            address(this)
        );

        // Store vault information
        vaults[vaultId] = VaultInfo({
            vaultAddress: address(newVault),
            creator: msg.sender,
            vaultName: _vaultName,
            description: _description,
            targetAmount: _targetAmount,
            deadline: _deadline,
            createdAt: block.timestamp,
            isPublic: _isPublic,
            isActive: true,
            status: VaultStatus.ACTIVE,
            memberCount: 0
        });

        // Add to creator's vault list
        vaultsByCreator[msg.sender].push(vaultId);

        // Emit enhanced event for indexers
        emit VaultCreated(
            vaultId,
            address(newVault),
            msg.sender,
            _vaultName,
            _description,
            _targetAmount,
            _deadline,
            _isPublic,
            block.timestamp
        );

        // Emit factory metrics for analytics
        _emitFactoryMetrics();

        return vaultId;
    }

    /**
     * @notice Generate an invite code for a vault
     * @param _vaultId ID of the vault to generate invite for
     * @return inviteCode The generated invite code
     */
    function generateInviteCode(uint256 _vaultId) external returns (bytes32) {
        VaultInfo storage vault = vaults[_vaultId];

        // Check vault exists
        if (vault.vaultAddress == address(0)) {
            revert GoalVaultFactory__VaultNotFound();
        }

        // Check authorization (creator or public vault)
        if (vault.creator != msg.sender && !vault.isPublic) {
            revert GoalVaultFactory__NotAuthorized();
        }

        // Generate unique invite code
        bytes32 inviteCode = keccak256(
            abi.encodePacked(_vaultId, block.timestamp, msg.sender, block.prevrandao)
        );

        // Store invite code mapping
        inviteCodes[inviteCode] = _vaultId;

        emit InviteCodeGenerated(_vaultId, inviteCode, msg.sender, block.timestamp);
        return inviteCode;
    }

    /**
     * @notice Join a vault using an invite code
     * @param _inviteCode The invite code for the vault
     */
    function joinVaultByInvite(bytes32 _inviteCode) external whenNotPaused {
        uint256 vaultId = inviteCodes[_inviteCode];

        if (vaultId == 0) {
            revert GoalVaultFactory__InviteCodeInvalid();
        }

        VaultInfo storage vault = vaults[vaultId];

        // Additional security check: ensure vault is still active
        if (!vault.isActive) {
            revert GoalVaultFactory__VaultNotActive();
        }

        // Call the vault's join function
        GoalVault(vault.vaultAddress).joinVault(msg.sender);

        emit VaultJoined(vaultId, msg.sender, address(0), block.timestamp);
    }

    /**
     * @notice Get vault information by ID
     * @param _vaultId ID of the vault
     * @return VaultInfo struct with vault details
     */
    function getVault(uint256 _vaultId) external view returns (VaultInfo memory) {
        if (vaults[_vaultId].vaultAddress == address(0)) {
            revert GoalVaultFactory__VaultNotFound();
        }
        return vaults[_vaultId];
    }

    /**
     * @notice Get all vault IDs created by a specific address
     * @param _creator Address of the vault creator
     * @return Array of vault IDs
     */
    function getVaultsByCreator(address _creator) external view returns (uint256[] memory) {
        return vaultsByCreator[_creator];
    }

    /**
     * @notice Get all public and active vaults
     * @return Array of vault IDs that are public and active
     */
    function getPublicVaults() external view returns (uint256[] memory) {
        // Count public vaults first
        uint256 publicCount = 0;
        for (uint256 i = 1; i < nextVaultId; i++) {
            if (vaults[i].isPublic && vaults[i].isActive) {
                publicCount++;
            }
        }

        // Create result array
        uint256[] memory publicVaults = new uint256[](publicCount);
        uint256 index = 0;

        for (uint256 i = 1; i < nextVaultId; i++) {
            if (vaults[i].isPublic && vaults[i].isActive) {
                publicVaults[index] = i;
                index++;
            }
        }

        return publicVaults;
    }

    /**
     * @notice Get all active vaults (for admin use)
     * @return Array of all active vault IDs
     */
    function getAllActiveVaults() external view returns (uint256[] memory) {
        // Count active vaults first
        uint256 activeCount = 0;
        for (uint256 i = 1; i < nextVaultId; i++) {
            if (vaults[i].isActive) {
                activeCount++;
            }
        }

        // Create result array
        uint256[] memory activeVaults = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 1; i < nextVaultId; i++) {
            if (vaults[i].isActive) {
                activeVaults[index] = i;
                index++;
            }
        }

        return activeVaults;
    }

    /**
     * @notice Get vault ID from invite code
     * @param _inviteCode The invite code to look up
     * @return vaultId The vault ID associated with the invite code
     */
    function getVaultByInviteCode(bytes32 _inviteCode) external view returns (uint256) {
        uint256 vaultId = inviteCodes[_inviteCode];
        if (vaultId == 0) {
            revert GoalVaultFactory__InviteCodeInvalid();
        }
        return vaultId;
    }

    /**
     * @notice Emergency function to pause the contract
     * @dev Only owner can call this
     * @param reason Reason for pausing
     */
    function pause(string calldata reason) external onlyOwner {
        _pause();
        emit FactoryPaused(msg.sender, block.timestamp, reason);
    }

    /**
     * @notice Emergency function to unpause the contract
     * @dev Only owner can call this
     */
    function unpause() external onlyOwner {
        _unpause();
        emit FactoryUnpaused(msg.sender, block.timestamp);
    }

    /**
     * @notice Get the current USDC token address
     * @return Address of the USDC token contract
     */
    function getUSDCAddress() external view returns (address) {
        return address(usdc);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @notice Emit factory metrics for indexers
     * @dev Called after significant state changes
     */
    function _emitFactoryMetrics() internal {
        uint256 totalVaults = nextVaultId - 1;
        uint256 activeVaults = 0;
        uint256 completedVaults = 0;
        uint256 totalValueLocked = 0;

        for (uint256 i = 1; i < nextVaultId; i++) {
            VaultInfo storage vault = vaults[i];
            if (vault.isActive) {
                activeVaults++;
            }
            if (vault.status == VaultStatus.COMPLETED) {
                completedVaults++;
            }
            // Get current amount from vault contract
            if (vault.vaultAddress != address(0)) {
                totalValueLocked += GoalVault(vault.vaultAddress).getTotalContributions();
            }
        }

        emit FactoryMetrics(
            totalVaults,
            activeVaults,
            completedVaults,
            totalValueLocked,
            block.timestamp
        );
    }

    /**
     * @notice Update vault status and emit event
     * @param vaultId ID of the vault
     * @param newStatus New status of the vault
     * @param reason Reason for status change
     */
    function _updateVaultStatus(uint256 vaultId, VaultStatus newStatus, string memory reason) internal {
        VaultInfo storage vault = vaults[vaultId];
        VaultStatus oldStatus = vault.status;

        vault.status = newStatus;
        if (newStatus != VaultStatus.ACTIVE) {
            vault.isActive = false;
        }

        emit VaultStatusChanged(vaultId, oldStatus, newStatus, block.timestamp, reason);
        _emitFactoryMetrics();
    }

    /**
     * @notice Update vault status from vault contract (for synchronization)
     * @param vaultAddress Address of the vault contract
     * @param newStatus New status of the vault
     * @param reason Reason for status change
     */
    function updateVaultStatus(address vaultAddress, VaultStatus newStatus, string memory reason) external {
        // Find vault ID by address
        uint256 vaultId = 0;
        for (uint256 i = 1; i < nextVaultId; i++) {
            if (vaults[i].vaultAddress == vaultAddress) {
                vaultId = i;
                break;
            }
        }

        if (vaultId == 0) {
            return; // Vault not found, ignore
        }

        // Only allow the vault contract itself to update its status
        if (msg.sender != vaultAddress) {
            return; // Unauthorized, ignore
        }

        _updateVaultStatus(vaultId, newStatus, reason);
    }
}