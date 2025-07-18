# GoalFi MVP Features Implementation

## Overview
This document outlines the implementation of the GoalFi MVP features in the smart contracts, including goal types, penalty systems, and fairness logic.

## Core MVP Features Implemented

### 1. 🏦 Vault Creation with Goal Types

#### Group Goals
- **Purpose**: Multiple users contribute toward a shared target amount
- **Target Amount**: Set during vault creation (e.g., 5000 USDC for Bali trip)
- **Completion**: Vault completes when total contributions reach the target
- **Usage**: `createVault(..., targetAmount, ..., GoalType.GROUP, ...)`

#### Personal Goals in Shared Vaults
- **Purpose**: Each user has individual goal amounts within the same vault
- **Target Amount**: Set to 0 during vault creation (no shared target)
- **Individual Goals**: Each member sets their personal goal when joining
- **Completion**: Vault completes when ALL members reach their personal goals
- **Usage**: `createVault(..., 0, ..., GoalType.PERSONAL, ...)`

### 2. 👥 Vault Participation

#### Joining Vaults
- **Group Vaults**: `joinVault(member, 0)` - no personal goal needed
- **Personal Vaults**: `joinVault(member, personalGoalAmount)` - must set personal goal
- **Factory Methods**: 
  - `joinVaultByInvite(inviteCode)` - for group vaults
  - `joinVaultByInviteWithGoal(inviteCode, personalGoalAmount)` - for personal vaults

#### Member Tracking
- **Group**: Track total contributions toward shared target
- **Personal**: Track individual progress toward personal goals
- **Events**: Enhanced events include personal goal amounts and progress

### 3. 💸 Deposit & Progress Tracking

#### Enhanced Member Info
```solidity
struct MemberInfo {
    address member;
    uint256 contribution;
    uint256 personalGoalAmount; // Only used for PERSONAL type
    uint256 joinedAt;
    bool isActive;
    bool hasReachedPersonalGoal; // Only used for PERSONAL type
}
```

#### Progress Tracking
- **Group Progress**: `getVaultProgress()` - percentage of shared target reached
- **Personal Progress**: `getPersonalGoalProgress(member)` - individual progress
- **Goal Completion**: Automatic detection and event emission

### 4. ⏳ Fairness Logic at Deadline

#### Goal Met Scenarios (100% completion)
- **Group**: Total contributions >= target amount
- **Personal**: All active members reached their personal goals
- **Action**: Users can claim their funds (exact contribution in MVP)
- **Status**: Vault marked as COMPLETED

#### Goal Not Met Scenarios
- **Deadline Passed**: Vault automatically marked as FAILED
- **Options Available**:
  1. **Withdraw with Penalty**: 2% penalty held for 1 month
  2. **Regular Withdrawal**: Full contribution returned (no penalty for failed vaults)

#### Early Withdrawal (Before Deadline)
- **Penalty**: 2% of contribution held for 1 month
- **Immediate**: 98% of contribution returned immediately
- **Refund**: Penalty refunded after 1 month via `claimPenaltyRefund()`

## Smart Contract Architecture

### Core Contracts
1. **GoalVault.sol**: Individual vault logic with MVP features
2. **GoalVaultFactory.sol**: Vault creation and management
3. **IGoalVault.sol**: Enhanced interface with new structures and events

### Key Enums and Structs
```solidity
enum GoalType { GROUP, PERSONAL }
enum VaultStatus { ACTIVE, COMPLETED, FAILED, CANCELLED }

struct PenaltyInfo {
    uint256 amount;
    uint256 releaseTime;
    bool claimed;
}
```

### New Functions Added
- `withdrawEarly()`: Early withdrawal with 2% penalty
- `claimPenaltyRefund()`: Claim penalty after 1 month
- `getPersonalGoalProgress(member)`: Get individual progress
- `getPenaltyInfo(member)`: Get penalty details
- `canClaimPenaltyRefund(member)`: Check if penalty can be claimed

## Events for Frontend Integration

### Enhanced Events
- `MemberJoined`: Now includes personal goal amount
- `FundsWithdrawn`: Now includes penalty amount
- `PersonalGoalReached`: New event for individual goal completion
- `EarlyWithdrawal`: New event for penalty withdrawals
- `PenaltyRefunded`: New event for penalty refunds

## Testing Coverage

### Test Categories
1. **Goal Type Tests**: Group vs Personal vault behavior
2. **Penalty System Tests**: Early withdrawal and refund mechanics
3. **Fairness Logic Tests**: Deadline scenarios and completion logic
4. **Integration Tests**: Factory and vault interaction

### Key Test Cases
- `testPersonalGoalVault()`: Personal goal tracking and completion
- `testEarlyWithdrawalPenalty()`: 2% penalty system
- `testPenaltyRefundAfterOneMonth()`: Penalty refund mechanism
- `testGroupGoalCompletion()`: Shared target completion
- `testVaultFailureScenarioAfterDeadline()`: Failed vault handling

## Deployment Considerations

### Configuration
- **Compiler**: Solidity 0.8.24 with via_ir enabled (for stack depth)
- **Optimization**: Enabled with 200 runs
- **Networks**: Base, Arbitrum, Mantle (EVM compatible)

### Factory Setup
1. Deploy GoalVaultFactory
2. Add supported tokens (USDC, USDT, etc.)
3. Set up proper access controls

## Frontend Integration Points

### Vault Creation
- Choose goal type (Group/Personal)
- Set appropriate target amounts
- Handle different join flows

### Member Management
- Display personal vs group progress
- Handle personal goal setting
- Show penalty information

### Withdrawal Flows
- Regular withdrawal (completed/failed vaults)
- Early withdrawal with penalty warning
- Penalty refund claiming

## Security Features

### Access Controls
- Factory-controlled vault creation
- Creator and factory authorization for member management
- Reentrancy protection on all fund operations

### Penalty System Security
- Time-locked penalty refunds (1 month)
- Claimed status tracking to prevent double refunds
- Automatic penalty calculation (2% of contribution)

## Future Enhancements (Post-MVP)

### Yield Integration
- Yield generation during savings period
- Proportional yield distribution on completion
- Enhanced reward mechanisms

### Advanced Features
- Retry mechanisms for failed vaults
- Flexible penalty structures
- Multi-token support per vault
- Governance features

## Gas Optimization

### Efficient Storage
- Packed structs for member information
- Minimal storage updates
- Batch operations for multiple members

### Event Optimization
- Comprehensive events for off-chain indexing
- Reduced on-chain computation through events
- Frontend-friendly event structure
