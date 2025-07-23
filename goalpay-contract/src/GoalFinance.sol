// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title GoalFinance
 * @notice A cross-chain decentralized savings vault platform for group and personal financial goals
 * @dev Implements vault creation, joining, deposits, withdrawals with customizable penalty mechanisms
 */
contract GoalFinance is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Constants
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_PENALTY_RATE = 100; // 1%
    uint256 public constant MAX_PENALTY_RATE = 1000; // 10%
    uint256 public constant DEFAULT_PENALTY_RATE = 200; // 2%
    
    // Special address for native token
    address public constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    // Custom errors
    error GoalFinance__ZeroAddress();
    error GoalFinance__InvalidAmount();
    error GoalFinance__InvalidPenaltyRate();
    error GoalFinance__InvalidDeadline();
    error GoalFinance__InvalidDuration();
    error GoalFinance__TokenNotSupported();
    error GoalFinance__VaultNotFound();
    error GoalFinance__VaultNotActive();
    error GoalFinance__VaultExpired();
    error GoalFinance__GoalNotReached();
    error GoalFinance__GoalAlreadyReached();
    error GoalFinance__AlreadyMember();
    error GoalFinance__NotMember();
    error GoalFinance__InvalidInviteCode();
    error GoalFinance__WithdrawalNotAllowed();
    error GoalFinance__InsufficientBalance();
    error GoalFinance__TransferFailed();
    error GoalFinance__DuplicateToken();
    error GoalFinance__NoClaimablePenalties();
    error GoalFinance__ExcessiveNativeValue();

    // Enums
    enum GoalType { PERSONAL, GROUP }
    enum Visibility { PUBLIC, PRIVATE }
    enum VaultStatus { ACTIVE, SUCCESS, FAILED }

    // Structs
    struct VaultConfig {
        string name;
        string description;
        address token; // The token used for deposits/withdrawals (NATIVE_TOKEN for native, ERC20 address for tokens)
        GoalType goalType;
        Visibility visibility;
        uint256 targetAmount;
        uint256 deadline;
        uint256 penaltyRate; // in basis points
    }

    struct Vault {
        uint256 id;
        VaultConfig config;
        address creator;
        uint256 totalDeposited;
        uint256 memberCount;
        VaultStatus status;
        bytes32 inviteCode;
        uint256 createdAt;
    }

    struct Member {
        uint256 depositedAmount;
        uint256 targetShare;
        uint256 joinedAt;
        bool hasWithdrawn;
        uint256 penaltyAmount;
    }

    struct PenaltyInfo {
        address token;
        uint256 amount;
        uint256 unlockTime;
        bool claimed;
    }

    // State variables
    uint256 private _nextVaultId = 1;
    mapping(uint256 => Vault) private _vaults;
    mapping(uint256 => mapping(address => Member)) private _vaultMembers;
    mapping(uint256 => address[]) private _vaultMembersList;
    mapping(bytes32 => uint256) private _inviteCodeToVaultId;
    mapping(address => PenaltyInfo[]) private _userPenalties;
    mapping(address => bool) private _supportedTokens;
    mapping(address => uint256[]) private _vaultsByCreator;
    uint256[] private _allVaultIds;

    // Events
    event VaultCreated(
        uint256 indexed vaultId,
        address indexed creator,
        address indexed token,
        VaultConfig config,
        bytes32 inviteCode
    );

    event MemberJoined(
        uint256 indexed vaultId,
        address indexed member,
        address indexed token,
        uint256 depositAmount,
        uint256 memberCount
    );

    event FundsDeposited(
        uint256 indexed vaultId,
        address indexed member,
        address indexed token,
        uint256 amount,
        uint256 totalDeposited
    );

    event EarlyWithdrawal(
        uint256 indexed vaultId,
        address indexed member,
        address indexed token,
        uint256 amount,
        uint256 penalty
    );

    event Withdrawal(
        uint256 indexed vaultId,
        address indexed member,
        address indexed token,
        uint256 amount
    );

    event GoalReached(
        uint256 indexed vaultId,
        address indexed token,
        uint256 totalAmount
    );

    event VaultFailed(
        uint256 indexed vaultId,
        address indexed token,
        uint256 totalAmount
    );

    event VaultStatusUpdated(
        uint256 indexed vaultId,
        VaultStatus indexed newStatus,
        uint256 totalDeposited
    );

    event PenaltyReleased(
        address indexed user,
        address indexed token,
        uint256 amount
    );

    event TokenSupported(
        address indexed token,
        bool supported
    );

    event VaultExpired(
        uint256 indexed vaultId,
        address indexed token,
        uint256 totalDeposited
    );

    // Modifiers
    modifier validAddress(address _addr) {
        if (_addr == address(0)) revert GoalFinance__ZeroAddress();
        _;
    }

    modifier validAmount(uint256 _amount) {
        if (_amount == 0) revert GoalFinance__InvalidAmount();
        _;
    }

    modifier vaultExists(uint256 _vaultId) {
        if (_vaults[_vaultId].id == 0) revert GoalFinance__VaultNotFound();
        _;
    }

    modifier vaultActive(uint256 _vaultId) {
        if (_vaults[_vaultId].status != VaultStatus.ACTIVE) revert GoalFinance__VaultNotActive();
        if (block.timestamp >= _vaults[_vaultId].config.deadline) revert GoalFinance__VaultExpired();
        _;
    }

    modifier onlyMember(uint256 _vaultId) {
        if (_vaultMembers[_vaultId][msg.sender].joinedAt == 0) revert GoalFinance__NotMember();
        _;
    }

    modifier notMember(uint256 _vaultId) {
        if (_vaultMembers[_vaultId][msg.sender].joinedAt != 0) revert GoalFinance__AlreadyMember();
        _;
    }

    constructor() Ownable(msg.sender) {
        // Native token is supported by default for all chains
        _supportedTokens[NATIVE_TOKEN] = true;
        emit TokenSupported(NATIVE_TOKEN, true);
    }

    // Admin functions
    function setSupportedToken(address _token, bool _supported) 
        external 
        onlyOwner 
        validAddress(_token) 
    {
        if (_supportedTokens[_token] == _supported) revert GoalFinance__DuplicateToken();
        
        _supportedTokens[_token] = _supported;
        emit TokenSupported(_token, _supported);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Core vault functions
    function createVault(
        VaultConfig memory _config
    ) external whenNotPaused returns (uint256 vaultId, bytes32 inviteCode) {
        _validateVaultConfig(_config);
        
        vaultId = _nextVaultId++;
        inviteCode = _generateInviteCode(vaultId, msg.sender);

        _vaults[vaultId] = Vault({
            id: vaultId,
            config: _config,
            creator: msg.sender,
            totalDeposited: 0,
            memberCount: 0,
            status: VaultStatus.ACTIVE,
            inviteCode: inviteCode,
            createdAt: block.timestamp
        });

        _inviteCodeToVaultId[inviteCode] = vaultId;
        _vaultsByCreator[msg.sender].push(vaultId);
        _allVaultIds.push(vaultId);

        // Auto-enroll creator
        _addMember(vaultId, msg.sender);

        emit VaultCreated(vaultId, msg.sender, _config.token, _config, inviteCode);
    }

    // Join vault with native token (ETH, BNB, MATIC, etc.)
    function joinVault(uint256 _vaultId, bytes32 _inviteCode) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
        vaultExists(_vaultId) 
        vaultActive(_vaultId) 
        notMember(_vaultId) 
        validAmount(msg.value)
    {
        Vault storage vault = _vaults[_vaultId];
        
        // Only accept native token for this function
        if (vault.config.token != NATIVE_TOKEN) revert GoalFinance__InvalidAmount();
        
        // Validate invite code for private vaults
        if (vault.config.visibility == Visibility.PRIVATE) {
            if (vault.inviteCode != _inviteCode) revert GoalFinance__InvalidInviteCode();
        }
        
        _addMember(_vaultId, msg.sender);
        _processDeposit(_vaultId, msg.sender, msg.value);

        emit MemberJoined(_vaultId, msg.sender, vault.config.token, msg.value, vault.memberCount);
    }

    // Join vault with ERC20 token
    function joinVaultWithToken(uint256 _vaultId, uint256 _amount, bytes32 _inviteCode) 
        external
        whenNotPaused 
        nonReentrant 
        vaultExists(_vaultId) 
        vaultActive(_vaultId) 
        notMember(_vaultId) 
        validAmount(_amount)
    {
        Vault storage vault = _vaults[_vaultId];
        
        // Only accept ERC20 tokens for this function
        if (vault.config.token == NATIVE_TOKEN) revert GoalFinance__InvalidAmount();
        // if (msg.value > 0) revert GoalFinance__ExcessiveNativeValue();
        
        // Validate invite code for private vaults
        if (vault.config.visibility == Visibility.PRIVATE) {
            if (vault.inviteCode != _inviteCode) revert GoalFinance__InvalidInviteCode();
        }
        
        _addMember(_vaultId, msg.sender);
        _processDeposit(_vaultId, msg.sender, _amount);

        emit MemberJoined(_vaultId, msg.sender, vault.config.token, _amount, vault.memberCount);
    }

    // Add native token funds
    function addNativeFunds(uint256 _vaultId) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
        vaultExists(_vaultId) 
        vaultActive(_vaultId) 
        onlyMember(_vaultId) 
        validAmount(msg.value)
    {
        Vault storage vault = _vaults[_vaultId];
        
        // Only accept native token for this function
        if (vault.config.token != NATIVE_TOKEN) revert GoalFinance__InvalidAmount();
        
        _processDeposit(_vaultId, msg.sender, msg.value);

        emit FundsDeposited(_vaultId, msg.sender, vault.config.token, msg.value, vault.totalDeposited);
    }

    // Add ERC20 token funds
    function addTokenFunds(uint256 _vaultId, uint256 _amount) 
        external 
        whenNotPaused 
        nonReentrant 
        vaultExists(_vaultId) 
        vaultActive(_vaultId) 
        onlyMember(_vaultId) 
        validAmount(_amount)
    {
        Vault storage vault = _vaults[_vaultId];
        
        // Only accept ERC20 tokens for this function
        if (vault.config.token == NATIVE_TOKEN) revert GoalFinance__InvalidAmount();
        // if (msg.value > 0) revert GoalFinance__ExcessiveNativeValue();
        
        _processDeposit(_vaultId, msg.sender, _amount);

        emit FundsDeposited(_vaultId, msg.sender, vault.config.token, _amount, vault.totalDeposited);
    }

    function withdrawEarly(uint256 _vaultId) 
        external 
        whenNotPaused 
        nonReentrant 
        vaultExists(_vaultId) 
        onlyMember(_vaultId) 
    {
        Member storage member = _vaultMembers[_vaultId][msg.sender];
        Vault storage vault = _vaults[_vaultId];
        
        if (member.hasWithdrawn) revert GoalFinance__WithdrawalNotAllowed();
        if (member.depositedAmount == 0) revert GoalFinance__InsufficientBalance();
        if (vault.status != VaultStatus.ACTIVE) revert GoalFinance__VaultNotActive();

        uint256 depositAmount = member.depositedAmount;
        uint256 penalty = (depositAmount * vault.config.penaltyRate) / BASIS_POINTS;
        uint256 withdrawAmount = depositAmount - penalty;

        // Update state
        member.hasWithdrawn = true;
        member.penaltyAmount = penalty;
        vault.totalDeposited -= depositAmount;

        // Store penalty for immediate release (no lock period)
        _addPenalty(msg.sender, vault.config.token, penalty);

        // Transfer funds
        _transferToken(vault.config.token, msg.sender, withdrawAmount);

        emit EarlyWithdrawal(_vaultId, msg.sender, vault.config.token, withdrawAmount, penalty);
    }

    function withdraw(uint256 _vaultId) 
        external 
        whenNotPaused 
        nonReentrant 
        vaultExists(_vaultId) 
        onlyMember(_vaultId) 
    {
        Member storage member = _vaultMembers[_vaultId][msg.sender];
        Vault storage vault = _vaults[_vaultId];
        
        if (member.hasWithdrawn) revert GoalFinance__WithdrawalNotAllowed();
        if (vault.status != VaultStatus.SUCCESS) revert GoalFinance__GoalNotReached();

        uint256 withdrawAmount = member.depositedAmount;
        if (withdrawAmount == 0) revert GoalFinance__InsufficientBalance();

        member.hasWithdrawn = true;

        _transferToken(vault.config.token, msg.sender, withdrawAmount);

        emit Withdrawal(_vaultId, msg.sender, vault.config.token, withdrawAmount);
    }

    function claimPenalties(address _token) 
        external 
        whenNotPaused 
        nonReentrant 
        validAddress(_token) 
    {
        uint256 claimableAmount = _calculateClaimablePenalties(msg.sender, _token);
        if (claimableAmount == 0) revert GoalFinance__NoClaimablePenalties();

        // Mark penalties as claimed
        PenaltyInfo[] storage penalties = _userPenalties[msg.sender];
        for (uint256 i = 0; i < penalties.length; i++) {
            if (!penalties[i].claimed &&
                penalties[i].token == _token &&
                block.timestamp >= penalties[i].unlockTime) {
                penalties[i].claimed = true;
            }
        }

        _transferToken(_token, msg.sender, claimableAmount);

        emit PenaltyReleased(msg.sender, _token, claimableAmount);
    }

    function updateVaultStatus(uint256 _vaultId) 
        external 
        vaultExists(_vaultId) 
    {
        Vault storage vault = _vaults[_vaultId];
        if (vault.status != VaultStatus.ACTIVE) return;

        VaultStatus newStatus;
        
        if (vault.totalDeposited >= vault.config.targetAmount) {
            newStatus = VaultStatus.SUCCESS;
            emit GoalReached(_vaultId, vault.config.token, vault.totalDeposited);
        } else if (block.timestamp >= vault.config.deadline) {
            newStatus = VaultStatus.FAILED;
            _handleFailedVault(_vaultId);
            emit VaultFailed(_vaultId, vault.config.token, vault.totalDeposited);
            emit VaultExpired(_vaultId, vault.config.token, vault.totalDeposited);
        } else {
            return;
        }

        vault.status = newStatus;
        emit VaultStatusUpdated(_vaultId, newStatus, vault.totalDeposited);
    }

    // Internal functions
    function _validateVaultConfig(VaultConfig memory _config) internal view {
        if (bytes(_config.name).length == 0) revert GoalFinance__InvalidAmount();
        if (!_supportedTokens[_config.token]) revert GoalFinance__TokenNotSupported();
        if (_config.targetAmount == 0) revert GoalFinance__InvalidAmount();
        if (_config.deadline <= block.timestamp) revert GoalFinance__InvalidDeadline();
        if (_config.penaltyRate < MIN_PENALTY_RATE || _config.penaltyRate > MAX_PENALTY_RATE) {
            revert GoalFinance__InvalidPenaltyRate();
        }
    }

    function _generateInviteCode(uint256 _vaultId, address _creator) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(_vaultId, _creator, block.timestamp, block.prevrandao));
    }

    function _addMember(uint256 _vaultId, address _member) internal {
        Vault storage vault = _vaults[_vaultId];

        _vaultMembers[_vaultId][_member] = Member({
            depositedAmount: 0,
            targetShare: _calculateTargetShare(vault.config.goalType, vault.config.targetAmount, vault.memberCount + 1),
            joinedAt: block.timestamp,
            hasWithdrawn: false,
            penaltyAmount: 0
        });

        _vaultMembersList[_vaultId].push(_member);
        vault.memberCount++;

        _updateAllTargetShares(_vaultId);
    }

    function _calculateTargetShare(GoalType _goalType, uint256 _targetAmount, uint256 _memberCount) 
        internal 
        pure 
        returns (uint256) 
    {
        if (_goalType == GoalType.GROUP) {
            return _targetAmount / _memberCount;
        } else {
            return _targetAmount;
        }
    }

    function _updateAllTargetShares(uint256 _vaultId) internal {
        Vault storage vault = _vaults[_vaultId];
        address[] storage members = _vaultMembersList[_vaultId];

        for (uint256 i = 0; i < members.length; i++) {
            _vaultMembers[_vaultId][members[i]].targetShare = 
                _calculateTargetShare(vault.config.goalType, vault.config.targetAmount, vault.memberCount);
        }
    }

    function _processDeposit(uint256 _vaultId, address _member, uint256 _amount) internal {
        Vault storage vault = _vaults[_vaultId];

        // Transfer tokens (skip for native as already received)
        if (vault.config.token != NATIVE_TOKEN) {
            IERC20(vault.config.token).safeTransferFrom(_member, address(this), _amount);
        }

        // Update balances
        _vaultMembers[_vaultId][_member].depositedAmount += _amount;
        vault.totalDeposited += _amount;

        // Auto-check goal achievement
        if (vault.totalDeposited >= vault.config.targetAmount && vault.status == VaultStatus.ACTIVE) {
            vault.status = VaultStatus.SUCCESS;
            emit VaultStatusUpdated(_vaultId, VaultStatus.SUCCESS, vault.totalDeposited);
            emit GoalReached(_vaultId, vault.config.token, vault.totalDeposited);
        }
    }

    function _addPenalty(address _user, address _token, uint256 _amount) internal {
        _userPenalties[_user].push(PenaltyInfo({
            token: _token,
            amount: _amount,
            unlockTime: block.timestamp, // Immediate release, no lock period
            claimed: false
        }));
    }

    function _transferToken(address _token, address _to, uint256 _amount) internal {
        if (_token == NATIVE_TOKEN) {
            (bool success, ) = _to.call{value: _amount}("");
            if (!success) revert GoalFinance__TransferFailed();
        } else {
            IERC20(_token).safeTransfer(_to, _amount);
        }
    }

    function _handleFailedVault(uint256 _vaultId) internal {
        Vault storage vault = _vaults[_vaultId];
        address[] storage members = _vaultMembersList[_vaultId];

        for (uint256 i = 0; i < members.length; i++) {
            address member = members[i];
            Member storage memberData = _vaultMembers[_vaultId][member];

            if (memberData.depositedAmount > 0 && !memberData.hasWithdrawn) {
                uint256 penalty = (memberData.depositedAmount * vault.config.penaltyRate) / BASIS_POINTS;
                memberData.penaltyAmount = penalty;
                _addPenalty(member, vault.config.token, penalty);
            }
        }
    }

    function _calculateClaimablePenalties(address _user, address _token) internal view returns (uint256) {
        PenaltyInfo[] storage penalties = _userPenalties[_user];
        uint256 claimable = 0;

        for (uint256 i = 0; i < penalties.length; i++) {
            if (!penalties[i].claimed &&
                penalties[i].token == _token &&
                block.timestamp >= penalties[i].unlockTime) {
                claimable += penalties[i].amount;
            }
        }

        return claimable;
    }

    // View functions
    function getVault(uint256 _vaultId) external view returns (Vault memory) {
        return _vaults[_vaultId];
    }

    function getMember(uint256 _vaultId, address _member) external view returns (Member memory) {
        return _vaultMembers[_vaultId][_member];
    }

    function getVaultMembers(uint256 _vaultId) external view returns (address[] memory) {
        return _vaultMembersList[_vaultId];
    }

    function getVaultByInviteCode(bytes32 _inviteCode) external view returns (uint256) {
        return _inviteCodeToVaultId[_inviteCode];
    }

    function getClaimablePenaltiesByToken(address _user, address _token) external view returns (uint256) {
        return _calculateClaimablePenalties(_user, _token);
    }

    function getUserPenalties(address _user) external view returns (PenaltyInfo[] memory) {
        return _userPenalties[_user];
    }

    function isTokenSupported(address _token) external view returns (bool) {
        return _supportedTokens[_token];
    }

    function getVaultProgress(uint256 _vaultId) external view returns (uint256) {
        Vault storage vault = _vaults[_vaultId];
        if (vault.config.targetAmount == 0) return 0;
        return (vault.totalDeposited * BASIS_POINTS) / vault.config.targetAmount;
    }

    function getAllVaults() external view returns (uint256[] memory) {
        return _allVaultIds;
    }

    function getVaultsByCreator(address _creator) external view returns (uint256[] memory) {
        return _vaultsByCreator[_creator];
    }

    function getTotalVaultCount() external view returns (uint256) {
        return _allVaultIds.length;
    }

    function getVaultsPaginated(uint256 _offset, uint256 _limit)
        external
        view
        returns (uint256[] memory vaultIds, bool hasMore)
    {
        uint256 totalVaults = _allVaultIds.length;
        
        if (_offset >= totalVaults) {
            return (new uint256[](0), false);
        }

        uint256 end = _offset + _limit;
        if (end > totalVaults) {
            end = totalVaults;
        }

        uint256 length = end - _offset;
        vaultIds = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            vaultIds[i] = _allVaultIds[_offset + i];
        }

        hasMore = end < totalVaults;
    }

    function getNativeTokenSymbol() external view returns (string memory) {
        uint256 chainId = block.chainid;

        if (chainId == 5000 || chainId == 5003) return "MNT"; // Mantle
        if (chainId == 8453 || chainId == 84532) return "ETH"; // Base
        if (chainId == 1 || chainId == 11155111) return "ETH"; // Ethereum
        if (chainId == 137 || chainId == 80001) return "MATIC"; // Polygon

        return "NATIVE";
    }

    function isNativeTokenVault(uint256 _vaultId) external view vaultExists(_vaultId) returns (bool) {
        return _vaults[_vaultId].config.token == NATIVE_TOKEN;
    }

    function isGoalReached(uint256 _vaultId) external view vaultExists(_vaultId) returns (bool) {
        Vault storage vault = _vaults[_vaultId];
        return vault.totalDeposited >= vault.config.targetAmount;
    }

    function checkVaultStatus(uint256 _vaultId) external view vaultExists(_vaultId) returns (VaultStatus) {
        Vault storage vault = _vaults[_vaultId];

        if (vault.status != VaultStatus.ACTIVE) {
            return vault.status;
        }

        if (vault.totalDeposited >= vault.config.targetAmount) {
            return VaultStatus.SUCCESS;
        } else if (block.timestamp >= vault.config.deadline) {
            return VaultStatus.FAILED;
        } else {
            return VaultStatus.ACTIVE;
        }
    }

    function getVaultConfig(uint256 _vaultId) external view vaultExists(_vaultId) returns (VaultConfig memory) {
        return _vaults[_vaultId].config;
    }

    function isVaultExpired(uint256 _vaultId) external view vaultExists(_vaultId) returns (bool) {
        return block.timestamp >= _vaults[_vaultId].config.deadline;
    }

    function getTimeRemaining(uint256 _vaultId) external view vaultExists(_vaultId) returns (uint256) {
        uint256 deadline = _vaults[_vaultId].config.deadline;
        if (block.timestamp >= deadline) {
            return 0;
        }
        return deadline - block.timestamp;
    }

    receive() external payable {
        // Allow contract to receive native tokens
    }

    // Emergency functions
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        _transferToken(_token, owner(), _amount);
    }
}