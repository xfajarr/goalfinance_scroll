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

/**
 * @title GoalVault
 * @notice Individual vault contract for collaborative savings goals
 * @dev Implements IGoalVault interface with full functionality
 */
contract GoalVault is IGoalVault, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // State variables
    IERC20 public immutable usdc;
    address public immutable factory;

    string public name;
    string public description;
    address public creator;
    uint256 public targetAmount;
    uint256 public currentAmount;
    uint256 public deadline;
    uint256 public createdAt;
    bool public isPublic;
    VaultStatus public status;

    // Member management
    mapping(address => MemberInfo) public members;
    address[] public memberList;
    uint256 public memberCount;

    // Milestone tracking to prevent spam
    mapping(uint256 => bool) public milestonesReached;

    // Modifiers
    modifier onlyActive() {
        if (status != VaultStatus.ACTIVE) {
            revert GoalVault__VaultNotActive();
        }
        _;
    }

    modifier onlyCreator() {
        if (msg.sender != creator) {
            revert GoalVault__NotAuthorized();
        }
        _;
    }

    modifier onlyFactoryOrCreator() {
        if (msg.sender != factory && msg.sender != creator) {
            revert GoalVault__NotAuthorized();
        }
        _;
    }

    /**
     * @notice Constructor initializes the vault with parameters
     * @param _usdc USDC token contract address
     * @param _name Name of the savings goal
     * @param _description Description of the goal
     * @param _targetAmount Target amount to save
     * @param _deadline Deadline for the goal
     * @param _isPublic Whether vault is publicly visible
     * @param _creator Address of the vault creator
     * @param _factory Address of the factory contract
     */
    constructor(
        address _usdc,
        string memory _name,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline,
        bool _isPublic,
        address _creator,
        address _factory
    ) Ownable(_creator) {
        usdc = IERC20(_usdc);
        factory = _factory;
        name = _name;
        description = _description;
        creator = _creator;
        targetAmount = _targetAmount;
        deadline = _deadline;
        isPublic = _isPublic;
        createdAt = block.timestamp;
        status = VaultStatus.ACTIVE;
        currentAmount = 0;
        memberCount = 0;
    }

    /**
     * @notice Add funds to the vault
     * @param amount Amount of USDC to contribute (6 decimals)
     */
    function addFunds(uint256 amount) external override onlyActive nonReentrant {
        if (amount == 0) {
            revert GoalVault__InvalidAmount();
        }
        if (block.timestamp > deadline) {
            revert GoalVault__DeadlineReached();
        }

        // Auto-join if not already a member
        if (!members[msg.sender].isActive) {
            _joinVault(msg.sender);
        }

        // Transfer USDC from user to vault
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Update member contribution
        members[msg.sender].contribution += amount;
        currentAmount += amount;

        // Calculate progress percentage with overflow protection
        uint256 progressPercentage;
        if (currentAmount >= targetAmount) {
            progressPercentage = 10000; // 100%
        } else {
            // Check for overflow before multiplication
            if (currentAmount > type(uint256).max / 10000) {
                progressPercentage = 10000; // Treat as 100% if overflow would occur
            } else {
                progressPercentage = (currentAmount * 10000) / targetAmount;
            }
        }

        // Emit enhanced events for indexers
        emit FundsAdded(
            msg.sender,
            amount,
            currentAmount,
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
            currentAmount,
            targetAmount,
            progressPercentage,
            memberCount,
            this.getDaysRemaining(),
            block.timestamp
        );

        // Check for milestones
        _checkMilestones(progressPercentage);

        // Check if goal is reached
        if (currentAmount >= targetAmount) {
            _completeVault();
        }
    }

    /**
     * @notice Join the vault (called by factory or directly)
     * @param member Address of the member to add
     */
    function joinVault(address member) external override onlyFactoryOrCreator {
        _joinVault(member);
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
        emit MemberLeft(msg.sender, block.timestamp, memberCount, 0);
    }

    /**
     * @notice Complete the vault (can be called by anyone when conditions are met)
     */
    function completeVault() external override {
        if (status != VaultStatus.ACTIVE) {
            revert GoalVault__VaultNotActive();
        }

        // Check if goal reached or deadline passed
        if (currentAmount >= targetAmount || block.timestamp > deadline) {
            if (currentAmount >= targetAmount) {
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
        if (status != VaultStatus.ACTIVE) {
            revert GoalVault__VaultNotActive();
        }

        status = VaultStatus.CANCELLED;
        emit VaultCancelled(block.timestamp, currentAmount, memberCount, "CREATOR_CANCELLED");

        // Return funds to members
        _returnFundsToMembers();
    }

    /**
     * @notice Withdraw funds (when vault failed, cancelled, or completed)
     */
    function withdrawFunds() external override nonReentrant {
        if (status == VaultStatus.ACTIVE) {
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

        if (status == VaultStatus.COMPLETED) {
            // For completed vaults, return proportional share
            withdrawAmount = _calculateCompletedVaultShare(msg.sender);
            reason = "VAULT_COMPLETED";
        } else {
            // For failed/cancelled vaults, return exact contribution
            withdrawAmount = contribution;
            reason = status == VaultStatus.FAILED ? "VAULT_FAILED" : "VAULT_CANCELLED";
        }

        // Reset member contribution
        members[msg.sender].contribution = 0;

        // Transfer funds
        usdc.safeTransfer(msg.sender, withdrawAmount);
        emit FundsWithdrawn(msg.sender, withdrawAmount, block.timestamp, reason);
    }

    /**
     * @notice Distribute funds to specific members (paginated for gas safety)
     * @dev Can be called by anyone to distribute funds to specific members
     * @param members_ Array of member addresses to distribute to (max 10)
     */
    function distributeToMembers(address[] calldata members_) external nonReentrant {
        if (status != VaultStatus.COMPLETED) {
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
                usdc.safeTransfer(member, withdrawAmount);

                emit FundsWithdrawn(member, withdrawAmount, block.timestamp, "BATCH_DISTRIBUTION");

                distributedCount++;
                totalDistributed += withdrawAmount;
            }
        }

        if (distributedCount > 0) {
            emit VaultFundsDistributed(distributedCount, totalDistributed, block.timestamp);
        }
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get complete vault details
     * @return VaultDetails struct with all vault information
     */
    function getVaultDetails() external view override returns (VaultDetails memory) {
        return VaultDetails({
            name: name,
            description: description,
            creator: creator,
            targetAmount: targetAmount,
            currentAmount: currentAmount,
            deadline: deadline,
            createdAt: createdAt,
            status: status,
            isPublic: isPublic,
            memberCount: memberCount
        });
    }

    /**
     * @notice Get member information
     * @param member Address of the member
     * @return MemberInfo struct with member details
     */
    function getMemberInfo(address member) external view override returns (MemberInfo memory) {
        return members[member];
    }

    /**
     * @notice Get all members and their contributions
     * @return Array of MemberInfo structs
     */
    function getAllMembers() external view override returns (MemberInfo[] memory) {
        MemberInfo[] memory allMembers = new MemberInfo[](memberCount);
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
        return memberCount;
    }

    /**
     * @notice Get total contributions
     * @return Current amount contributed
     */
    function getTotalContributions() external view override returns (uint256) {
        return currentAmount;
    }

    /**
     * @notice Get remaining amount to reach goal
     * @return Amount still needed to reach target
     */
    function getRemainingAmount() external view override returns (uint256) {
        if (currentAmount >= targetAmount) {
            return 0;
        }
        return targetAmount - currentAmount;
    }

    /**
     * @notice Get vault progress as percentage
     * @return Progress percentage (0-100, scaled by 100)
     */
    function getVaultProgress() external view override returns (uint256) {
        if (targetAmount == 0) return 0;
        if (currentAmount >= targetAmount) return 10000; // 100.00%
        return (currentAmount * 10000) / targetAmount;
    }

    /**
     * @notice Get days remaining until deadline
     * @return Days remaining (0 if deadline passed)
     */
    function getDaysRemaining() external view override returns (uint256) {
        if (block.timestamp >= deadline) {
            return 0;
        }
        return (deadline - block.timestamp) / 1 days;
    }

    /**
     * @notice Check current vault status
     * @return Current VaultStatus
     */
    function checkVaultStatus() external view override returns (VaultStatus) {
        if (status != VaultStatus.ACTIVE) {
            return status;
        }

        // Check if conditions changed
        if (currentAmount >= targetAmount) {
            return VaultStatus.COMPLETED;
        }
        if (block.timestamp > deadline) {
            return VaultStatus.FAILED;
        }

        return VaultStatus.ACTIVE;
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

        if (status == VaultStatus.ACTIVE) {
            return (false, 0);
        }

        if (status == VaultStatus.COMPLETED) {
            return (true, _calculateCompletedVaultShare(member));
        } else {
            // FAILED or CANCELLED
            return (true, members[member].contribution);
        }
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @notice Internal function to add a member to the vault
     * @param member Address of the member to add
     */
    function _joinVault(address member) internal {
        if (members[member].isActive) {
            revert GoalVault__AlreadyMember();
        }

        members[member] = MemberInfo({
            member: member,
            contribution: 0,
            joinedAt: block.timestamp,
            isActive: true
        });

        memberList.push(member);
        memberCount++;

        emit MemberJoined(member, block.timestamp, memberCount, address(0));
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
        memberCount--;

        emit MemberLeft(member, block.timestamp, memberCount, 0);

        // Note: We don't remove from memberList to preserve history
        // The getAllMembers() function filters out inactive members
    }

    /**
     * @notice Internal function to complete the vault successfully
     */
    function _completeVault() internal {
        status = VaultStatus.COMPLETED;

        uint256 daysToComplete = (block.timestamp - createdAt) / 1 days;

        emit VaultCompleted(
            currentAmount,
            targetAmount,
            block.timestamp,
            memberCount,
            daysToComplete
        );

        emit VaultMilestone(
            "GOAL_COMPLETED",
            currentAmount,
            10000, // 100%
            block.timestamp
        );

        // Notify factory of status change for synchronization
        _notifyFactoryStatusChange(VaultStatus.COMPLETED, "GOAL_REACHED");

        // In MVP, funds stay in contract (no yield distribution)
        // Future: Implement yield distribution logic here
    }

    /**
     * @notice Internal function to mark vault as failed
     */
    function _failVault() internal {
        status = VaultStatus.FAILED;

        emit VaultFailed(
            currentAmount,
            targetAmount,
            block.timestamp,
            memberCount,
            "DEADLINE_REACHED"
        );

        // Notify factory of status change for synchronization
        _notifyFactoryStatusChange(VaultStatus.FAILED, "DEADLINE_REACHED");

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
                usdc.safeTransfer(member, contribution);
                emit FundsWithdrawn(member, contribution, block.timestamp, "VAULT_CANCELLED");
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
                    currentAmount,
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
     * @notice Notify factory of status changes for synchronization
     * @param newStatus New vault status
     * @param reason Reason for status change
     */
    function _notifyFactoryStatusChange(VaultStatus newStatus, string memory reason) internal {
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