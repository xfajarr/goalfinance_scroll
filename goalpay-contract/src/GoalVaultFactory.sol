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
error GoalVaultFactory__InvalidToken();
error GoalVaultFactory__TokenNotSupported();
error GoalVaultFactory__TokenAlreadySupported();
error GoalVaultFactory__TokenNotActive();

contract GoalVaultFactory is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public nextVaultId;

    // Supported tokens registry
    mapping(address => TokenInfo) public supportedTokens;
    address[] public tokenList;

    struct TokenInfo {
        string symbol;
        string name;
        uint8 decimals;
        bool isActive;
        uint256 addedAt;
    }

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
        uint256 targetAmount; // For GROUP: shared target, For PERSONAL: not used
        uint256 deadline;
        uint256 createdAt;
        bool isPublic;
        bool isActive;
        VaultStatus status;
        uint256 memberCount;
        address token; // Token contract address
        string tokenSymbol; // Token symbol for display
        IGoalVault.GoalType goalType; // GROUP or PERSONAL
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
        address token,
        string tokenSymbol,
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

    // Token Management Events
    event TokenAdded(address indexed token, string symbol, string name, uint8 decimals, uint256 timestamp);
    event TokenRemoved(address indexed token, string symbol, uint256 timestamp);
    event TokenStatusUpdated(address indexed token, bool isActive, uint256 timestamp);
    
    /**
     * @notice Constructor initializes the factory
     */
    constructor() Ownable(msg.sender) {
        nextVaultId = 1; // Start vault IDs from 1
    }

    /**
     * @notice Add a supported token to the registry
     * @param token Address of the ERC20 token
     * @param symbol Token symbol
     * @param name Token name
     * @param decimals Token decimals
     */
    function addSupportedToken(
        address token,
        string memory symbol,
        string memory name,
        uint8 decimals
    ) external onlyOwner {
        if (token == address(0)) {
            revert GoalVaultFactory__InvalidToken();
        }
        if (supportedTokens[token].addedAt != 0) {
            revert GoalVaultFactory__TokenAlreadySupported();
        }

        supportedTokens[token] = TokenInfo({
            symbol: symbol,
            name: name,
            decimals: decimals,
            isActive: true,
            addedAt: block.timestamp
        });

        tokenList.push(token);

        emit TokenAdded(token, symbol, name, decimals, block.timestamp);
    }

    /**
     * @notice Remove a token from supported list
     * @param token Address of the token to remove
     */
    function removeSupportedToken(address token) external onlyOwner {
        if (supportedTokens[token].addedAt == 0) {
            revert GoalVaultFactory__TokenNotSupported();
        }

        string memory symbol = supportedTokens[token].symbol;
        supportedTokens[token].isActive = false;

        emit TokenRemoved(token, symbol, block.timestamp);
    }

    /**
     * @notice Update token active status
     * @param token Address of the token
     * @param isActive New active status
     */
    function updateTokenStatus(address token, bool isActive) external onlyOwner {
        if (supportedTokens[token].addedAt == 0) {
            revert GoalVaultFactory__TokenNotSupported();
        }

        supportedTokens[token].isActive = isActive;
        emit TokenStatusUpdated(token, isActive, block.timestamp);
    }

    /**
     * @notice Creates a new savings vault
     * @param _vaultName Name of the vault
     * @param _description Description of the savings goal
     * @param _targetAmount Target amount to save (in token decimals) - only for GROUP type
     * @param _deadline Deadline timestamp for the goal
     * @param _isPublic Whether the vault is publicly visible
     * @param _goalType Type of goal (GROUP or PERSONAL)
     * @param _token Address of the ERC20 token to use
     * @return vaultId The ID of the created vault
     */
    function createVault(
        string memory _vaultName,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline,
        bool _isPublic,
        IGoalVault.GoalType _goalType,
        address _token
    ) external whenNotPaused nonReentrant returns (uint256) {
        // Input validation
        if (bytes(_vaultName).length == 0) {
            revert GoalVaultFactory__EmptyName();
        }
        // For GROUP type, target amount must be > 0. For PERSONAL type, it can be 0
        if (_goalType == IGoalVault.GoalType.GROUP && _targetAmount == 0) {
            revert GoalVaultFactory__InvalidAmount();
        }
        if (_deadline <= block.timestamp) {
            revert GoalVaultFactory__InvalidDeadline();
        }
        if (_token == address(0)) {
            revert GoalVaultFactory__InvalidToken();
        }
        if (supportedTokens[_token].addedAt == 0 || !supportedTokens[_token].isActive) {
            revert GoalVaultFactory__TokenNotSupported();
        }

        // Get unique vault ID
        uint256 vaultId = nextVaultId++;

        // Create new vault contract
        GoalVault newVault = new GoalVault(
            _token,
            _vaultName,
            _description,
            _targetAmount,
            _deadline,
            _isPublic,
            _goalType,
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
            memberCount: 0,
            token: _token,
            tokenSymbol: supportedTokens[_token].symbol,
            goalType: _goalType
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
            _token,
            supportedTokens[_token].symbol,
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

        // Call the vault's join function (0 for personal goal amount, can be updated later)
        GoalVault(vault.vaultAddress).joinVault(msg.sender, 0);

        emit VaultJoined(vaultId, msg.sender, address(0), block.timestamp);
    }

    /**
     * @notice Join a vault using an invite code with personal goal amount (for PERSONAL type)
     * @param _inviteCode The invite code for the vault
     * @param _personalGoalAmount Personal goal amount (required for PERSONAL type vaults)
     */
    function joinVaultByInviteWithGoal(bytes32 _inviteCode, uint256 _personalGoalAmount) external whenNotPaused {
        uint256 vaultId = inviteCodes[_inviteCode];

        if (vaultId == 0) {
            revert GoalVaultFactory__InviteCodeInvalid();
        }

        VaultInfo storage vault = vaults[vaultId];

        // Additional security check: ensure vault is still active
        if (!vault.isActive) {
            revert GoalVaultFactory__VaultNotActive();
        }

        // Call the vault's join function with personal goal amount
        GoalVault(vault.vaultAddress).joinVault(msg.sender, _personalGoalAmount);

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
     * @notice Get supported tokens list
     * @return Array of supported token addresses
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }

    /**
     * @notice Get token information
     * @param token Address of the token
     * @return TokenInfo struct with token details
     */
    function getTokenInfo(address token) external view returns (TokenInfo memory) {
        return supportedTokens[token];
    }

    /**
     * @notice Check if token is supported and active
     * @param token Address of the token
     * @return True if token is supported and active
     */
    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token].addedAt != 0 && supportedTokens[token].isActive;
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