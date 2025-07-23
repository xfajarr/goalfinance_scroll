// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GoalVaultV2.sol";

/**
 * @title GoalVaultFactoryV2
 * @dev Enhanced factory contract with combined join+deposit functionality
 */
contract GoalVaultFactoryV2 is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Structs
    struct VaultInfo {
        address vaultAddress;
        string vaultName;
        string description;
        address creator;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 deadline;
        uint256 createdAt;
        GoalVaultV2.VaultStatus status;
        bool isPublic;
        uint256 memberCount;
        GoalVaultV2.GoalType goalType;
    }

    // State variables
    IERC20 public immutable usdcToken;
    uint256 public vaultCounter;
    uint256 public totalVaultsCreated;
    uint256 public totalValueLocked;

    mapping(uint256 => VaultInfo) public vaults;
    mapping(bytes32 => uint256) public inviteCodeToVaultId;
    mapping(uint256 => bytes32) public vaultIdToInviteCode;
    mapping(address => uint256[]) public userVaults;
    mapping(address => uint256[]) public createdVaults;

    // Events
    event VaultCreated(
        uint256 indexed vaultId,
        address indexed vaultAddress,
        address indexed creator,
        string name,
        uint256 targetAmount,
        uint256 deadline,
        bytes32 inviteCode,
        bool isPublic,
        GoalVaultV2.GoalType goalType
    );

    event MemberJoinedWithDeposit(
        uint256 indexed vaultId,
        address indexed member,
        uint256 depositAmount,
        uint256 personalGoalAmount,
        bytes32 inviteCode,
        address indexed inviter
    );

    event VaultMetricsUpdated(
        uint256 indexed vaultId,
        uint256 newCurrentAmount,
        uint256 newMemberCount,
        uint256 progressPercentage
    );

    // Custom errors
    error InvalidVaultId();
    error InvalidInviteCode();
    error VaultNotFound();
    error AlreadyMember();
    error InsufficientAmount();
    error DeadlineExpired();
    error TransferFailed();

    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
    }

    /**
     * @dev Create a new vault
     */
    function createVault(
        string memory _name,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline,
        bool _isPublic,
        GoalVaultV2.GoalType _goalType
    ) external returns (uint256 vaultId, bytes32 inviteCode) {
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_name).length > 0, "Name cannot be empty");

        vaultCounter++;
        vaultId = vaultCounter;
        totalVaultsCreated++;

        // Generate invite code
        inviteCode = keccak256(abi.encodePacked(vaultId, block.timestamp, msg.sender));

        // Deploy new vault contract
        GoalVaultV2 vault = new GoalVaultV2(
            address(usdcToken),
            _name,
            _description,
            _targetAmount,
            _deadline,
            _isPublic,
            _goalType,
            msg.sender,
            address(this)
        );

        // Store vault info
        vaults[vaultId] = VaultInfo({
            vaultAddress: address(vault),
            vaultName: _name,
            description: _description,
            creator: msg.sender,
            targetAmount: _targetAmount,
            currentAmount: 0,
            deadline: _deadline,
            createdAt: block.timestamp,
            status: GoalVaultV2.VaultStatus.ACTIVE,
            isPublic: _isPublic,
            memberCount: 1, // Creator is automatically a member
            goalType: _goalType
        });

        // Map invite code to vault
        inviteCodeToVaultId[inviteCode] = vaultId;
        vaultIdToInviteCode[vaultId] = inviteCode;

        // Track user's vaults
        userVaults[msg.sender].push(vaultId);
        createdVaults[msg.sender].push(vaultId);

        emit VaultCreated(
            vaultId,
            address(vault),
            msg.sender,
            _name,
            _targetAmount,
            _deadline,
            inviteCode,
            _isPublic,
            _goalType
        );
    }

    /**
     * @dev Join vault by invite code with initial deposit
     */
    function joinVaultByInviteWithDeposit(
        bytes32 _inviteCode,
        uint256 _depositAmount,
        uint256 _personalGoalAmount
    ) external nonReentrant {
        uint256 vaultId = inviteCodeToVaultId[_inviteCode];
        if (vaultId == 0) revert InvalidInviteCode();

        _joinVaultWithDeposit(vaultId, _depositAmount, _personalGoalAmount, _inviteCode);
    }

    /**
     * @dev Join vault by ID with initial deposit
     */
    function joinVaultByIdWithDeposit(
        uint256 _vaultId,
        uint256 _depositAmount,
        uint256 _personalGoalAmount
    ) external nonReentrant {
        if (_vaultId == 0 || _vaultId > vaultCounter) revert InvalidVaultId();
        
        VaultInfo storage vault = vaults[_vaultId];
        if (!vault.isPublic) revert VaultNotFound(); // Only public vaults can be joined by ID

        bytes32 inviteCode = vaultIdToInviteCode[_vaultId];
        _joinVaultWithDeposit(_vaultId, _depositAmount, _personalGoalAmount, inviteCode);
    }

    /**
     * @dev Internal function to handle vault joining with deposit
     */
    function _joinVaultWithDeposit(
        uint256 _vaultId,
        uint256 _depositAmount,
        uint256 _personalGoalAmount,
        bytes32 _inviteCode
    ) internal {
        if (_depositAmount == 0) revert InsufficientAmount();

        VaultInfo storage vault = vaults[_vaultId];
        if (vault.vaultAddress == address(0)) revert VaultNotFound();
        if (block.timestamp > vault.deadline) revert DeadlineExpired();

        GoalVaultV2 vaultContract = GoalVaultV2(vault.vaultAddress);

        // Check if already a member
        GoalVaultV2.MemberInfo memory memberInfo = vaultContract.getMemberInfo(msg.sender);
        if (memberInfo.isActive) revert AlreadyMember();

        // Approve and join with deposit
        usdcToken.safeTransferFrom(msg.sender, address(this), _depositAmount);
        usdcToken.safeApprove(vault.vaultAddress, _depositAmount);

        // Call vault's joinWithDeposit function
        vaultContract.joinWithDeposit(
            msg.sender,
            _depositAmount,
            _personalGoalAmount,
            vault.creator // inviter is the creator for tracking
        );

        // Update vault metrics
        vault.currentAmount += _depositAmount;
        vault.memberCount++;
        totalValueLocked += _depositAmount;

        // Track user's vault membership
        userVaults[msg.sender].push(_vaultId);

        uint256 progressPercentage = (vault.currentAmount * 100) / vault.targetAmount;

        emit MemberJoinedWithDeposit(
            _vaultId,
            msg.sender,
            _depositAmount,
            _personalGoalAmount,
            _inviteCode,
            vault.creator
        );

        emit VaultMetricsUpdated(
            _vaultId,
            vault.currentAmount,
            vault.memberCount,
            progressPercentage
        );
    }

    /**
     * @dev Get vault information
     */
    function getVault(uint256 _vaultId) external view returns (VaultInfo memory) {
        if (_vaultId == 0 || _vaultId > vaultCounter) revert InvalidVaultId();
        return vaults[_vaultId];
    }

    /**
     * @dev Get vault by invite code
     */
    function getVaultByInviteCode(bytes32 _inviteCode) external view returns (VaultInfo memory) {
        uint256 vaultId = inviteCodeToVaultId[_inviteCode];
        if (vaultId == 0) revert InvalidInviteCode();
        return vaults[vaultId];
    }

    /**
     * @dev Get all public vaults
     */
    function getPublicVaults() external view returns (VaultInfo[] memory) {
        uint256 publicCount = 0;
        
        // Count public vaults
        for (uint256 i = 1; i <= vaultCounter; i++) {
            if (vaults[i].isPublic) {
                publicCount++;
            }
        }

        // Create array of public vaults
        VaultInfo[] memory publicVaults = new VaultInfo[](publicCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= vaultCounter; i++) {
            if (vaults[i].isPublic) {
                publicVaults[index] = vaults[i];
                index++;
            }
        }

        return publicVaults;
    }

    /**
     * @dev Get user's vaults
     */
    function getUserVaults(address _user) external view returns (VaultInfo[] memory) {
        uint256[] memory userVaultIds = userVaults[_user];
        VaultInfo[] memory userVaultInfos = new VaultInfo[](userVaultIds.length);

        for (uint256 i = 0; i < userVaultIds.length; i++) {
            userVaultInfos[i] = vaults[userVaultIds[i]];
        }

        return userVaultInfos;
    }

    /**
     * @dev Get vaults created by user
     */
    function getCreatedVaults(address _user) external view returns (VaultInfo[] memory) {
        uint256[] memory createdVaultIds = createdVaults[_user];
        VaultInfo[] memory createdVaultInfos = new VaultInfo[](createdVaultIds.length);

        for (uint256 i = 0; i < createdVaultIds.length; i++) {
            createdVaultInfos[i] = vaults[createdVaultIds[i]];
        }

        return createdVaultInfos;
    }

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 totalVaults,
        uint256 totalValueLockedAmount,
        uint256 activeVaults
    ) {
        uint256 active = 0;
        for (uint256 i = 1; i <= vaultCounter; i++) {
            if (vaults[i].status == GoalVaultV2.VaultStatus.ACTIVE) {
                active++;
            }
        }

        return (totalVaultsCreated, totalValueLocked, active);
    }
}
