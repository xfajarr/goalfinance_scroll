// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IGoalVault.sol";

interface IGoalVaultFactory {
    function updateVaultStatus(address vaultAddress, IGoalVault.VaultStatus newStatus, string memory reason) external;
}

error GoalVault__InvalidAmount();
error GoalVault__VaultNotActive();
error GoalVault__DeadlineReached();
error GoalVault__NotAuthorized();
error GoalVault__AlreadyMember();
error GoalVault__NotMember();
error GoalVault__CannotLeaveWithContribution();
error GoalVault__VaultNotCompleted();
error GoalVault__VaultNotFailed();
error GoalVault__NoContribution();
error GoalVault__TransferFailed();
error GoalVault__InvalidGoalType();
error GoalVault__PersonalGoalRequired();
error GoalVault__NoPenaltyToRefund();
error GoalVault__PenaltyNotReady();
error GoalVault__PenaltyAlreadyClaimed();

/**
 * @title GoalVault
 * @notice Individual vault contract for collaborative savings goals
 * @dev Implements IGoalVault interface with full functionality
 */
contract GoalVault is IGoalVault, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Immutable contracts
    IERC20 public immutable token;
    address public immutable factory;

    // Vault configuration and state (grouped in struct)
    struct VaultConfig {
        string name;
        string description;
        address creator;
        uint256 targetAmount; // For GROUP: shared target, For PERSONAL: not used
        uint256 deadline;
        uint256 createdAt;
        bool isPublic;
        IGoalVault.GoalType goalType; // GROUP or PERSONAL
    }

    struct VaultState {
        uint256 currentAmount;
        IGoalVault.VaultStatus status;
        uint256 memberCount;
    }

    VaultConfig public vaultConfig;
    VaultState public vaultState;

    // Member management
    mapping(address => IGoalVault.MemberInfo) public members;
    address[] public memberList;

    // Penalty management for early withdrawals
    mapping(address => IGoalVault.PenaltyInfo) public penalties;

    // Milestone tracking to prevent spam
    mapping(uint256 => bool) public milestonesReached;

    // Modifiers
    modifier onlyActive() {
        if (vaultState.status != IGoalVault.VaultStatus.ACTIVE) {
            revert GoalVault__VaultNotActive();
        }
        _;
    }

    modifier onlyCreator() {
        if (msg.sender != vaultConfig.creator) {
            revert GoalVault__NotAuthorized();
        }
        _;
    }

    modifier onlyFactoryOrCreator() {
        if (msg.sender != factory && msg.sender != vaultConfig.creator) {
            revert GoalVault__NotAuthorized();
        }
        _;
    }

    /**
     * @notice Constructor initializes the vault with parameters
     * @param _token ERC20 token contract address
     * @param _name Name of the savings goal
     * @param _description Description of the goal
     * @param _targetAmount Target amount to save (in token decimals) - only for GROUP type
     * @param _deadline Deadline for the goal
     * @param _isPublic Whether vault is publicly visible
     * @param _goalType Type of goal (GROUP or PERSONAL)
     * @param _creator Address of the vault creator
     * @param _factory Address of the factory contract
     */
    constructor(
        address _token,
        string memory _name,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline,
        bool _isPublic,
        IGoalVault.GoalType _goalType,
        address _creator,
        address _factory
    ) Ownable(_creator) {
        token = IERC20(_token);
        factory = _factory;

        // Initialize vault configuration
        vaultConfig = VaultConfig({
            name: _name,
            description: _description,
            creator: _creator,
            targetAmount: _targetAmount,
            deadline: _deadline,
            createdAt: block.timestamp,
            isPublic: _isPublic,
            goalType: _goalType
        });

        // Initialize vault state
        vaultState = VaultState({
            currentAmount: 0,
            status: IGoalVault.VaultStatus.ACTIVE,
            memberCount: 0
        });
    }

    /**
     * @notice Add funds to the vault
     * @param amount Amount of tokens to contribute (in token decimals)
     */
    function addFunds(uint256 amount) external override onlyActive nonReentrant {
        if (amount == 0) {
            revert GoalVault__InvalidAmount();
        }
        if (block.timestamp > vaultConfig.deadline) {
            revert GoalVault__DeadlineReached();
        }

        // Auto-join if not already a member
        if (!members[msg.sender].isActive) {
            _joinVault(msg.sender, 0); // Default to 0 for auto-join, can be updated later
        }

        // Transfer tokens from user to vault
        token.safeTransferFrom(msg.sender, address(this), amount);

        // Update member contribution
        members[msg.sender].contribution += amount;
        vaultState.currentAmount += amount;

        // Calculate progress percentage with overflow protection
        uint256 progressPercentage;
        if (vaultState.currentAmount >= vaultConfig.targetAmount) {
            progressPercentage = 10000; // 100%
        } else {
            // Check for overflow before multiplication
            if (vaultState.currentAmount > type(uint256).max / 10000) {
                progressPercentage = 10000; // Treat as 100% if overflow would occur
            } else {
                progressPercentage = (vaultState.currentAmount * 10000) / vaultConfig.targetAmount;
            }
        }

        // Emit enhanced events for indexers
        emit FundsAdded(
            msg.sender,
            amount,
            vaultState.currentAmount,
            members[msg.sender].contribution,
            progressPercentage,
            block.timestamp
        );

        emit MemberContributionUpdate(
            msg.sender,
            members[msg.sender].contribution,
            1, // contribution count (simplified for MVP)
            amount,
            block.timestamp
        );

        emit VaultProgressUpdate(
            vaultState.currentAmount,
            vaultConfig.targetAmount,
            progressPercentage,
            vaultState.memberCount,
            this.getDaysRemaining(),
            block.timestamp
        );

        // Check for milestones
        _checkMilestones(progressPercentage);

        // Check if personal goal is reached (for PERSONAL type)
        if (vaultConfig.goalType == IGoalVault.GoalType.PERSONAL) {
            if (members[msg.sender].contribution >= members[msg.sender].personalGoalAmount &&
                !members[msg.sender].hasReachedPersonalGoal) {
                members[msg.sender].hasReachedPersonalGoal = true;
                emit PersonalGoalReached(
                    msg.sender,
                    members[msg.sender].personalGoalAmount,
                    members[msg.sender].contribution,
                    block.timestamp
                );
            }
        }

        // Check if vault goal is reached
        if (_isGoalReached()) {
            _completeVault();
        }
    }

    /**
     * @notice Join the vault (called by factory or directly)
     * @param member Address of the member to add
     * @param personalGoalAmount Personal goal amount (0 for GROUP type)
     */
    function joinVault(address member, uint256 personalGoalAmount) external override onlyFactoryOrCreator {
        _joinVault(member, personalGoalAmount);
    }

    /**
     * @notice Leave the vault (only if no contribution made)
     */
    function leaveVault() external override onlyActive {
        if (!members[msg.sender].isActive) {
            revert GoalVault__NotMember();
        }
        if (members[msg.sender].contribution > 0) {
            revert GoalVault__CannotLeaveWithContribution();
        }

        _removeMember(msg.sender);
        emit MemberLeft(msg.sender, block.timestamp, vaultState.memberCount, 0);
    }

    /**
     * @notice Complete the vault (can be called by anyone when conditions are met)
     */
    function completeVault() external override {
        if (vaultState.status != VaultStatus.ACTIVE) {
            revert GoalVault__VaultNotActive();
        }

        // Check if goal reached or deadline passed
        if (_isGoalReached() || block.timestamp > vaultConfig.deadline) {
            if (_isGoalReached()) {
                _completeVault();
            } else {
                _failVault();
            }
        }
    }

    /**
     * @notice Cancel the vault (only creator can call)
     */
    function cancelVault() external override onlyCreator {
        if (vaultState.status != VaultStatus.ACTIVE) {
            revert GoalVault__VaultNotActive();
        }

        vaultState.status = IGoalVault.VaultStatus.CANCELLED;
        emit VaultCancelled(block.timestamp, vaultState.currentAmount, vaultState.memberCount, "CREATOR_CANCELLED");

        // Return funds to members
        _returnFundsToMembers();
    }

    /**
     * @notice Withdraw funds (when vault failed, cancelled, or completed)
     */
    function withdrawFunds() external override nonReentrant {
        if (vaultState.status == VaultStatus.ACTIVE) {
            revert GoalVault__VaultNotCompleted();
        }
        if (!members[msg.sender].isActive) {
            revert GoalVault__NotMember();
        }

        uint256 contribution = members[msg.sender].contribution;
        if (contribution == 0) {
            revert GoalVault__NoContribution();
        }

        // Calculate withdrawal amount based on vault status
        uint256 withdrawAmount;
        string memory reason;

        if (vaultState.status == VaultStatus.COMPLETED) {
            // For completed vaults, return proportional share
            withdrawAmount = _calculateCompletedVaultShare(msg.sender);
            reason = "VAULT_COMPLETED";
        } else {
            // For failed/cancelled vaults, return exact contribution
            withdrawAmount = contribution;
            reason = vaultState.status == VaultStatus.FAILED ? "VAULT_FAILED" : "VAULT_CANCELLED";
        }

        // Reset member contribution
        members[msg.sender].contribution = 0;

        // Transfer funds
        token.safeTransfer(msg.sender, withdrawAmount);
        emit FundsWithdrawn(msg.sender, withdrawAmount, 0, block.timestamp, reason);
    }

    /**
     * @notice Distribute funds to specific members (paginated for gas safety)
     * @dev Can be called by anyone to distribute funds to specific members
     * @param members_ Array of member addresses to distribute to (max 10)
     */
    function distributeToMembers(address[] calldata members_) external nonReentrant {
        if (vaultState.status != VaultStatus.COMPLETED) {
            revert GoalVault__VaultNotCompleted();
        }
        if (members_.length == 0 || members_.length > 10) {
            revert GoalVault__InvalidAmount(); // Reuse error for array length
        }

        uint256 distributedCount = 0;
        uint256 totalDistributed = 0;

        for (uint256 i = 0; i < members_.length; i++) {
            address member = members_[i];

            if (members[member].isActive && members[member].contribution > 0) {
                uint256 withdrawAmount = _calculateCompletedVaultShare(member);

                // Reset member contribution
                members[member].contribution = 0;

                // Transfer funds
                token.safeTransfer(member, withdrawAmount);

                emit FundsWithdrawn(member, withdrawAmount, 0, block.timestamp, "BATCH_DISTRIBUTION");

                distributedCount++;
                totalDistributed += withdrawAmount;
            }
        }

        if (distributedCount > 0) {
            emit VaultFundsDistributed(distributedCount, totalDistributed, block.timestamp);
        }
    }

    /**
     * @notice Early withdrawal with 2% penalty
     * @dev Can be called anytime during active vault, penalty held for 1 month
     */
    function withdrawEarly() external override nonReentrant {
        if (vaultState.status != IGoalVault.VaultStatus.ACTIVE) {
            revert GoalVault__VaultNotActive();
        }
        if (!members[msg.sender].isActive) {
            revert GoalVault__NotMember();
        }

        uint256 contribution = members[msg.sender].contribution;
        if (contribution == 0) {
            revert GoalVault__NoContribution();
        }

        // Calculate 2% penalty
        uint256 penalty = (contribution * 200) / 10000; // 2%
        uint256 withdrawAmount = contribution - penalty;

        // Reset member contribution
        members[msg.sender].contribution = 0;
        vaultState.currentAmount -= contribution;

        // Store penalty info (1 month lock)
        penalties[msg.sender] = IGoalVault.PenaltyInfo({
            amount: penalty,
            releaseTime: block.timestamp + 30 days,
            claimed: false
        });

        // Transfer withdrawal amount to user
        token.safeTransfer(msg.sender, withdrawAmount);

        emit EarlyWithdrawal(
            msg.sender,
            withdrawAmount,
            penalty,
            block.timestamp + 30 days,
            block.timestamp
        );

        emit FundsWithdrawn(msg.sender, withdrawAmount, penalty, block.timestamp, "EARLY_WITHDRAWAL");
    }

    /**
     * @notice Claim penalty refund after 1 month
     */
    function claimPenaltyRefund() external override nonReentrant {
        IGoalVault.PenaltyInfo storage penaltyInfo = penalties[msg.sender];

        if (penaltyInfo.amount == 0) {
            revert GoalVault__NoPenaltyToRefund();
        }
        if (block.timestamp < penaltyInfo.releaseTime) {
            revert GoalVault__PenaltyNotReady();
        }
        if (penaltyInfo.claimed) {
            revert GoalVault__PenaltyAlreadyClaimed();
        }

        uint256 refundAmount = penaltyInfo.amount;
        penaltyInfo.claimed = true;

        // Transfer penalty refund
        token.safeTransfer(msg.sender, refundAmount);

        emit PenaltyRefunded(msg.sender, refundAmount, block.timestamp);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get complete vault details
     * @return VaultDetails struct with all vault information
     */
    function getVaultDetails() external view override returns (IGoalVault.VaultDetails memory) {
        return IGoalVault.VaultDetails({
            name: vaultConfig.name,
            description: vaultConfig.description,
            creator: vaultConfig.creator,
            targetAmount: vaultConfig.targetAmount,
            currentAmount: vaultState.currentAmount,
            deadline: vaultConfig.deadline,
            createdAt: vaultConfig.createdAt,
            status: vaultState.status,
            isPublic: vaultConfig.isPublic,
            memberCount: vaultState.memberCount,
            token: address(token),
            goalType: vaultConfig.goalType
        });
    }

    /**
     * @notice Get member information
     * @param member Address of the member
     * @return MemberInfo struct with member details
     */
    function getMemberInfo(address member) external view override returns (IGoalVault.MemberInfo memory) {
        return members[member];
    }

    /**
     * @notice Get all members and their contributions
     * @return Array of MemberInfo structs
     */
    function getAllMembers() external view override returns (IGoalVault.MemberInfo[] memory) {
        IGoalVault.MemberInfo[] memory allMembers = new IGoalVault.MemberInfo[](vaultState.memberCount);
        uint256 index = 0;

        for (uint256 i = 0; i < memberList.length; i++) {
            if (members[memberList[i]].isActive) {
                allMembers[index] = members[memberList[i]];
                index++;
            }
        }

        return allMembers;
    }

    /**
     * @notice Get current member count
     * @return Number of active members
     */
    function getMemberCount() external view override returns (uint256) {
        return vaultState.memberCount;
    }

    /**
     * @notice Get total contributions
     * @return Current amount contributed
     */
    function getTotalContributions() external view override returns (uint256) {
        return vaultState.currentAmount;
    }

    /**
     * @notice Get remaining amount to reach goal
     * @return Amount still needed to reach target
     */
    function getRemainingAmount() external view override returns (uint256) {
        if (vaultState.currentAmount >= vaultConfig.targetAmount) {
            return 0;
        }
        return vaultConfig.targetAmount - vaultState.currentAmount;
    }

    /**
     * @notice Get vault progress as percentage
     * @return Progress percentage (0-100, scaled by 100)
     */
    function getVaultProgress() external view override returns (uint256) {
        if (vaultConfig.targetAmount == 0) return 0;
        if (vaultState.currentAmount >= vaultConfig.targetAmount) return 10000; // 100.00%
        return (vaultState.currentAmount * 10000) / vaultConfig.targetAmount;
    }

    /**
     * @notice Get days remaining until deadline
     * @return Days remaining (0 if deadline passed)
     */
    function getDaysRemaining() external view override returns (uint256) {
        if (block.timestamp >= vaultConfig.deadline) {
            return 0;
        }
        return (vaultConfig.deadline - block.timestamp) / 1 days;
    }

    /**
     * @notice Check current vault status
     * @return Current VaultStatus
     */
    function checkVaultStatus() external view override returns (IGoalVault.VaultStatus) {
        if (vaultState.status != IGoalVault.VaultStatus.ACTIVE) {
            return vaultState.status;
        }

        // Check if conditions changed
        if (_isGoalReached()) {
            return IGoalVault.VaultStatus.COMPLETED;
        }
        if (block.timestamp > vaultConfig.deadline) {
            return IGoalVault.VaultStatus.FAILED;
        }

        return IGoalVault.VaultStatus.ACTIVE;
    }

    /**
     * @notice Get the vault's token address
     * @return Address of the ERC20 token used by this vault
     */
    function getTokenAddress() external view returns (address) {
        return address(token);
    }

    /**
     * @notice Check if member can withdraw funds
     * @param member Address to check
     * @return canWithdraw Whether member can withdraw
     * @return withdrawableAmount Amount member can withdraw
     */
    function getWithdrawableAmount(address member) external view returns (bool canWithdraw, uint256 withdrawableAmount) {
        if (!members[member].isActive || members[member].contribution == 0) {
            return (false, 0);
        }

        if (vaultState.status == IGoalVault.VaultStatus.ACTIVE) {
            return (false, 0);
        }

        if (vaultState.status == IGoalVault.VaultStatus.COMPLETED) {
            return (true, _calculateCompletedVaultShare(member));
        } else {
            // FAILED or CANCELLED
            return (true, members[member].contribution);
        }
    }

    /**
     * @notice Get penalty information for a member
     * @param member Address of the member
     * @return PenaltyInfo struct with penalty details
     */
    function getPenaltyInfo(address member) external view override returns (IGoalVault.PenaltyInfo memory) {
        return penalties[member];
    }

    /**
     * @notice Get personal goal progress for a member (PERSONAL type only)
     * @param member Address of the member
     * @return Progress percentage (0-10000, scaled by 100)
     */
    function getPersonalGoalProgress(address member) external view override returns (uint256) {
        if (vaultConfig.goalType != IGoalVault.GoalType.PERSONAL) {
            return 0;
        }

        IGoalVault.MemberInfo memory memberInfo = members[member];
        if (memberInfo.personalGoalAmount == 0) {
            return 0;
        }

        if (memberInfo.contribution >= memberInfo.personalGoalAmount) {
            return 10000; // 100%
        }

        return (memberInfo.contribution * 10000) / memberInfo.personalGoalAmount;
    }

    /**
     * @notice Check if member can claim penalty refund
     * @param member Address of the member
     * @return True if penalty can be claimed
     */
    function canClaimPenaltyRefund(address member) external view override returns (bool) {
        IGoalVault.PenaltyInfo memory penaltyInfo = penalties[member];
        return penaltyInfo.amount > 0 &&
               block.timestamp >= penaltyInfo.releaseTime &&
               !penaltyInfo.claimed;
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @notice Internal function to add a member to the vault
     * @param member Address of the member to add
     * @param personalGoalAmount Personal goal amount (0 for GROUP type)
     */
    function _joinVault(address member, uint256 personalGoalAmount) internal {
        if (members[member].isActive) {
            revert GoalVault__AlreadyMember();
        }

        // For PERSONAL type, personalGoalAmount must be > 0
        if (vaultConfig.goalType == IGoalVault.GoalType.PERSONAL && personalGoalAmount == 0) {
            revert GoalVault__PersonalGoalRequired();
        }

        members[member] = IGoalVault.MemberInfo({
            member: member,
            contribution: 0,
            personalGoalAmount: personalGoalAmount,
            joinedAt: block.timestamp,
            isActive: true,
            hasReachedPersonalGoal: false
        });

        memberList.push(member);
        vaultState.memberCount++;

        emit MemberJoined(member, personalGoalAmount, block.timestamp, vaultState.memberCount, address(0));
    }

    /**
     * @notice Internal function to remove a member from the vault
     * @param member Address of the member to remove
     */
    function _removeMember(address member) internal {
        if (!members[member].isActive) {
            revert GoalVault__NotMember();
        }

        members[member].isActive = false;
        vaultState.memberCount--;

        emit MemberLeft(member, block.timestamp, vaultState.memberCount, 0);

        // Note: We don't remove from memberList to preserve history
        // The getAllMembers() function filters out inactive members
    }

    /**
     * @notice Internal function to complete the vault successfully
     */
    function _completeVault() internal {
        vaultState.status = IGoalVault.VaultStatus.COMPLETED;

        uint256 daysToComplete = (block.timestamp - vaultConfig.createdAt) / 1 days;

        emit VaultCompleted(
            vaultState.currentAmount,
            vaultConfig.targetAmount,
            block.timestamp,
            vaultState.memberCount,
            daysToComplete
        );

        emit VaultMilestone(
            "GOAL_COMPLETED",
            vaultState.currentAmount,
            10000, // 100%
            block.timestamp
        );

        // Notify factory of status change for synchronization
        _notifyFactoryStatusChange(IGoalVault.VaultStatus.COMPLETED, "GOAL_REACHED");

        // In MVP, funds stay in contract (no yield distribution)
        // Future: Implement yield distribution logic here
    }

    /**
     * @notice Internal function to mark vault as failed
     */
    function _failVault() internal {
        vaultState.status = IGoalVault.VaultStatus.FAILED;

        emit VaultFailed(
            vaultState.currentAmount,
            vaultConfig.targetAmount,
            block.timestamp,
            vaultState.memberCount,
            "DEADLINE_REACHED"
        );

        // Notify factory of status change for synchronization
        _notifyFactoryStatusChange(IGoalVault.VaultStatus.FAILED, "DEADLINE_REACHED");

        // Funds can be withdrawn by members individually
    }

    /**
     * @notice Internal function to return funds to all members
     * @dev Used when vault is cancelled
     */
    function _returnFundsToMembers() internal {
        for (uint256 i = 0; i < memberList.length; i++) {
            address member = memberList[i];
            uint256 contribution = members[member].contribution;

            if (contribution > 0 && members[member].isActive) {
                members[member].contribution = 0;
                token.safeTransfer(member, contribution);
                emit FundsWithdrawn(member, contribution, 0, block.timestamp, "VAULT_CANCELLED");
            }
        }
    }

    /**
     * @notice Check and emit milestone events
     * @param progressPercentage Current progress percentage (scaled by 100)
     */
    function _checkMilestones(uint256 progressPercentage) internal {
        // Define milestone thresholds (25%, 50%, 75%, 90%)
        uint256[] memory milestones = new uint256[](4);
        milestones[0] = 2500;  // 25%
        milestones[1] = 5000;  // 50%
        milestones[2] = 7500;  // 75%
        milestones[3] = 9000;  // 90%

        string[] memory milestoneNames = new string[](4);
        milestoneNames[0] = "QUARTER_COMPLETE";
        milestoneNames[1] = "HALF_COMPLETE";
        milestoneNames[2] = "THREE_QUARTERS_COMPLETE";
        milestoneNames[3] = "NEARLY_COMPLETE";

        for (uint256 i = 0; i < milestones.length; i++) {
            if (progressPercentage >= milestones[i] && !milestonesReached[milestones[i]]) {
                // Mark milestone as reached to prevent duplicate emissions
                milestonesReached[milestones[i]] = true;

                emit VaultMilestone(
                    milestoneNames[i],
                    vaultState.currentAmount,
                    milestones[i],
                    block.timestamp
                );
            }
        }
    }

    /**
     * @notice Calculate member's share when vault is completed
     * @param member Address of the member
     * @return Amount the member can withdraw
     */
    function _calculateCompletedVaultShare(address member) internal view returns (uint256) {
        uint256 memberContribution = members[member].contribution;

        // In MVP: Return exact contribution (no yield)
        // Future: Add yield distribution logic here
        // Example: return memberContribution + (yield * memberContribution / totalContributions)

        return memberContribution;
    }

    /**
     * @notice Check if vault goal is reached based on goal type
     * @return True if goal is reached
     */
    function _isGoalReached() internal view returns (bool) {
        if (vaultConfig.goalType == IGoalVault.GoalType.GROUP) {
            // For GROUP: check if total amount reaches target
            return vaultState.currentAmount >= vaultConfig.targetAmount;
        } else {
            // For PERSONAL: check if all active members reached their personal goals
            if (vaultState.memberCount == 0) return false;

            for (uint256 i = 0; i < memberList.length; i++) {
                address member = memberList[i];
                if (members[member].isActive && !members[member].hasReachedPersonalGoal) {
                    return false;
                }
            }
            return true;
        }
    }

    /**
     * @notice Notify factory of status changes for synchronization
     * @param newStatus New vault status
     * @param reason Reason for status change
     */
    function _notifyFactoryStatusChange(IGoalVault.VaultStatus newStatus, string memory reason) internal {
        // Only notify if factory supports the interface
        if (factory.code.length > 0) {
            try IGoalVaultFactory(factory).updateVaultStatus(
                address(this),
                newStatus,
                reason
            ) {
                // Success - factory updated
            } catch {
                // Factory update failed, but vault status change should still proceed
                // This prevents factory issues from blocking vault operations
            }
        }
    }
}