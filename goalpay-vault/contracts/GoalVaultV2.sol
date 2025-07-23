// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GoalVaultV2
 * @dev Enhanced vault contract with combined join+deposit functionality
 */
contract GoalVaultV2 is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Enums
    enum VaultStatus { ACTIVE, COMPLETED, CANCELLED, EXPIRED }
    enum GoalType { SAVINGS, INVESTMENT, EMERGENCY_FUND, VACATION, OTHER }

    // Structs
    struct MemberInfo {
        address member;
        uint256 contribution;
        uint256 personalGoalAmount;
        uint256 joinedAt;
        bool isActive;
        bool hasReachedPersonalGoal;
    }

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
        address token;
        GoalType goalType;
    }

    // State variables
    IERC20 public immutable token;
    address public immutable factory;
    
    string public vaultName;
    string public description;
    address public creator;
    uint256 public targetAmount;
    uint256 public currentAmount;
    uint256 public deadline;
    uint256 public createdAt;
    VaultStatus public status;
    bool public isPublic;
    GoalType public goalType;
    
    uint256 public memberCount;
    address[] public memberList;
    mapping(address => MemberInfo) public members;
    mapping(address => bool) public isMember;

    // Events
    event MemberJoinedWithDeposit(
        address indexed member,
        uint256 depositAmount,
        uint256 personalGoalAmount,
        uint256 timestamp,
        uint256 memberCount,
        address indexed inviter
    );
    
    event FundsAdded(
        address indexed member,
        uint256 amount,
        uint256 newTotal,
        uint256 memberContribution,
        uint256 progressPercentage,
        uint256 timestamp
    );
    
    event VaultCompleted(
        uint256 finalAmount,
        uint256 targetAmount,
        uint256 timestamp,
        uint256 memberCount,
        uint256 daysToComplete
    );

    // Custom errors
    error VaultNotActive();
    error NotAMember();
    error AlreadyAMember();
    error InsufficientAmount();
    error DeadlineExpired();
    error OnlyFactory();
    error OnlyCreator();
    error TransferFailed();

    // Modifiers
    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactory();
        _;
    }

    modifier onlyActiveMember() {
        if (!isMember[msg.sender] || !members[msg.sender].isActive) revert NotAMember();
        _;
    }

    modifier onlyActiveVault() {
        if (status != VaultStatus.ACTIVE) revert VaultNotActive();
        _;
    }

    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }

    constructor(
        address _token,
        string memory _name,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline,
        bool _isPublic,
        GoalType _goalType,
        address _creator,
        address _factory
    ) Ownable(_creator) {
        token = IERC20(_token);
        factory = _factory;
        vaultName = _name;
        description = _description;
        targetAmount = _targetAmount;
        deadline = _deadline;
        isPublic = _isPublic;
        goalType = _goalType;
        creator = _creator;
        createdAt = block.timestamp;
        status = VaultStatus.ACTIVE;

        // Creator automatically becomes a member
        _addMember(_creator, 0, address(0));
    }

    /**
     * @dev Join vault with initial deposit in one transaction
     * @param _member Address of the member joining
     * @param _depositAmount Initial deposit amount
     * @param _personalGoalAmount Personal goal amount for the member
     * @param _inviter Address of the inviter (for tracking)
     */
    function joinWithDeposit(
        address _member,
        uint256 _depositAmount,
        uint256 _personalGoalAmount,
        address _inviter
    ) external onlyFactory onlyActiveVault nonReentrant {
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (isMember[_member]) revert AlreadyAMember();
        if (_depositAmount == 0) revert InsufficientAmount();

        // Transfer tokens from member to vault
        token.safeTransferFrom(_member, address(this), _depositAmount);

        // Add member and record deposit
        _addMember(_member, _personalGoalAmount, _inviter);
        _recordContribution(_member, _depositAmount);

        emit MemberJoinedWithDeposit(
            _member,
            _depositAmount,
            _personalGoalAmount,
            block.timestamp,
            memberCount,
            _inviter
        );

        _checkVaultCompletion();
    }

    /**
     * @dev Add funds to vault (for existing members)
     * @param _amount Amount to add
     */
    function addFunds(uint256 _amount) external onlyActiveMember onlyActiveVault nonReentrant {
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (_amount == 0) revert InsufficientAmount();

        // Transfer tokens from member to vault
        token.safeTransferFrom(msg.sender, address(this), _amount);

        // Record contribution
        _recordContribution(msg.sender, _amount);

        _checkVaultCompletion();
    }

    /**
     * @dev Internal function to add a member
     */
    function _addMember(address _member, uint256 _personalGoalAmount, address _inviter) internal {
        members[_member] = MemberInfo({
            member: _member,
            contribution: 0,
            personalGoalAmount: _personalGoalAmount,
            joinedAt: block.timestamp,
            isActive: true,
            hasReachedPersonalGoal: false
        });

        isMember[_member] = true;
        memberList.push(_member);
        memberCount++;
    }

    /**
     * @dev Internal function to record contribution
     */
    function _recordContribution(address _member, uint256 _amount) internal {
        members[_member].contribution += _amount;
        currentAmount += _amount;

        // Check if member reached personal goal
        if (members[_member].personalGoalAmount > 0 && 
            members[_member].contribution >= members[_member].personalGoalAmount) {
            members[_member].hasReachedPersonalGoal = true;
        }

        uint256 progressPercentage = (currentAmount * 100) / targetAmount;

        emit FundsAdded(
            _member,
            _amount,
            currentAmount,
            members[_member].contribution,
            progressPercentage,
            block.timestamp
        );
    }

    /**
     * @dev Check if vault has reached its target
     */
    function _checkVaultCompletion() internal {
        if (currentAmount >= targetAmount) {
            status = VaultStatus.COMPLETED;
            uint256 daysToComplete = (block.timestamp - createdAt) / 1 days;
            
            emit VaultCompleted(
                currentAmount,
                targetAmount,
                block.timestamp,
                memberCount,
                daysToComplete
            );
        }
    }

    /**
     * @dev Get vault details
     */
    function getVaultDetails() external view returns (VaultDetails memory) {
        return VaultDetails({
            name: vaultName,
            description: description,
            creator: creator,
            targetAmount: targetAmount,
            currentAmount: currentAmount,
            deadline: deadline,
            createdAt: createdAt,
            status: status,
            isPublic: isPublic,
            memberCount: memberCount,
            token: address(token),
            goalType: goalType
        });
    }

    /**
     * @dev Get member information
     */
    function getMemberInfo(address _member) external view returns (MemberInfo memory) {
        return members[_member];
    }

    /**
     * @dev Get all members
     */
    function getAllMembers() external view returns (MemberInfo[] memory) {
        MemberInfo[] memory allMembers = new MemberInfo[](memberCount);
        for (uint256 i = 0; i < memberCount; i++) {
            allMembers[i] = members[memberList[i]];
        }
        return allMembers;
    }

    /**
     * @dev Withdraw funds (only creator, only when vault is completed or cancelled)
     */
    function withdrawFunds() external onlyCreator nonReentrant {
        require(
            status == VaultStatus.COMPLETED || status == VaultStatus.CANCELLED,
            "Vault must be completed or cancelled"
        );

        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            token.safeTransfer(creator, balance);
        }
    }

    /**
     * @dev Emergency function to cancel vault (only creator)
     */
    function cancelVault() external onlyCreator {
        status = VaultStatus.CANCELLED;
    }
}
