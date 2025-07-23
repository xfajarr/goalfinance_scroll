# GoalFinance - Quick Reference Guide

## 🚀 Essential Functions for Frontend & Explorer Testing

### 📋 Contract Constants
```
Native Token Address: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
Min Penalty Rate: 100 (1%)
Max Penalty Rate: 1000 (10%)
Default Penalty Rate: 200 (2%)
```

### 🏗️ Create Vault
```solidity
createVault(VaultConfig memory _config)
```
**VaultConfig Parameters:**
- `name`: "My Savings Goal"
- `description`: "Building emergency fund"
- `token`: `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` (native) or ERC20 address
- `goalType`: `0` (PERSONAL) or `1` (GROUP)
- `visibility`: `0` (PUBLIC) or `1` (PRIVATE)
- `targetAmount`: Amount in wei (e.g., `1000000000000000000000` = 1000 tokens)
- `deadline`: Unix timestamp
- `penaltyRate`: 100-1000 (1%-10%)

**Returns:** `(vaultId, inviteCode)`

### 💰 Join & Deposit

#### Native Token (MNT/ETH/MATIC)
```solidity
joinVault(vaultId, inviteCode) payable
```
**Value:** Amount in wei (e.g., `100000000000000000000` = 100 tokens)

#### ERC20 Token
```solidity
// First: token.approve(goalFinanceAddress, amount)
// Then: joinVaultWithToken(vaultId, amount, inviteCode)
```

### 💸 Add More Funds

#### Native Token
```solidity
addNativeFunds(vaultId) payable
```
**Value:** Amount in wei

#### ERC20 Token
```solidity
// First: token.approve(goalFinanceAddress, amount)
// Then: addTokenFunds(vaultId, amount)
```

### 🏦 Withdrawals
```solidity
withdraw(vaultId)           // Normal withdrawal (goal reached)
withdrawEarly(vaultId)      // Early withdrawal (configurable penalty)
```
**Important:** Penalty funds go to GoalFinance platform, NOT claimable by users!

### 📊 Essential View Functions
```solidity
getVault(vaultId)                    // Get complete vault info
getVaultConfig(vaultId)              // Get vault configuration
isNativeTokenVault(vaultId)          // Check if native token
isGoalReached(vaultId)               // Check if goal completed
checkVaultStatus(vaultId)            // Get current status
isVaultExpired(vaultId)              // Check if deadline passed
getTimeRemaining(vaultId)            // Seconds until deadline
getVaultProgress(vaultId)            // Progress in basis points
getNativeTokenSymbol()               // Get "MNT", "ETH", or "MATIC"
getAllVaults()                       // Get all vault IDs
getVaultsByCreator(address)          // Get vaults by creator
getMember(vaultId, address)          // Get member info
getVaultMembers(vaultId)             // Get all members
```

## 🎯 Quick Test Scenarios

### Scenario 1: Native Token Vault (MNT/ETH)
```javascript
// 1. Create MNT vault with 3% penalty
const config = {
    name: "MNT Fund",
    description: "Saving MNT",
    token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    goalType: 1, // GROUP
    visibility: 0, // PUBLIC
    targetAmount: "1000000000000000000000", // 1000 MNT
    deadline: 1735689600, // Future timestamp
    penaltyRate: 300 // 3%
};
createVault(config)

// 2. Join with MNT (send 100 MNT)
joinVault(1, "0x00...00", {value: "100000000000000000000"})

// 3. Add more MNT (send 50 MNT)
addNativeFunds(1, {value: "50000000000000000000"})

// 4. Check progress
getVaultProgress(1) // Returns basis points (15000 = 15%)
```

### Scenario 2: ERC20 Token Vault
```javascript
// 1. Create USDC vault with 1.5% penalty
const config = {
    name: "USDC Fund",
    description: "Stable savings",
    token: usdcAddress,
    goalType: 0, // PERSONAL
    visibility: 0, // PUBLIC
    targetAmount: "10000000000", // 10000 USDC (6 decimals)
    deadline: 1735689600,
    penaltyRate: 150 // 1.5%
};
createVault(config)

// 2. Approve and join with USDC
token.approve(goalFinanceAddress, "1000000000") // 1000 USDC
joinVaultWithToken(2, "1000000000", "0x00...00")

// 3. Approve and add more USDC
token.approve(goalFinanceAddress, "500000000") // 500 USDC
addTokenFunds(2, "500000000")
```

## 🔍 Explorer Testing Values

### Create Native Vault
```
Function: createVault
_config: [
    "Test Vault",
    "Testing native token deposits",
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    1,
    0,
    "1000000000000000000000",
    1735689600,
    200
]
```

### Join Native Vault
```
Function: joinVault
_vaultId: 1
_inviteCode: 0x0000000000000000000000000000000000000000000000000000000000000000
Value: 100000000000000000000
```

### Add Native Funds
```
Function: addNativeFunds
_vaultId: 1
Value: 50000000000000000000
```

### Check Status
```
Function: checkVaultStatus
_vaultId: 1
Returns: 0 (ACTIVE), 1 (SUCCESS), 2 (FAILED)
```

### Get Progress
```
Function: getVaultProgress
_vaultId: 1
Returns: Progress in basis points (1500 = 15%)
```

## 📡 Key Events to Monitor

```solidity
VaultCreated(vaultId, creator, token, config, inviteCode)
MemberJoined(vaultId, member, token, depositAmount, memberCount)
FundsDeposited(vaultId, member, token, amount, totalDeposited)
GoalReached(vaultId, token, totalAmount)
VaultStatusUpdated(vaultId, newStatus, totalDeposited)
EarlyWithdrawal(vaultId, member, token, amount, penalty)
VaultFailed(vaultId, token, totalAmount)
VaultExpired(vaultId, token, totalDeposited)
```

## 🚨 Common Errors

```solidity
GoalFinance__ZeroAddress()          // Using address(0)
GoalFinance__InvalidAmount()        // Amount is 0
GoalFinance__InvalidPenaltyRate()   // Penalty rate not 1-10%
GoalFinance__TokenNotSupported()    // Token not supported
GoalFinance__VaultNotFound()        // Invalid vault ID
GoalFinance__VaultNotActive()       // Vault not active
GoalFinance__VaultExpired()         // Past deadline
GoalFinance__AlreadyMember()        // Already joined vault
GoalFinance__NotMember()            // Not a vault member
GoalFinance__InvalidInviteCode()    // Wrong invite code
GoalFinance__GoalNotReached()       // Goal not achieved yet
GoalFinance__WithdrawalNotAllowed() // Already withdrawn
GoalFinance__InsufficientBalance()  // Not enough funds
GoalFinance__TransferFailed()       // Native token transfer failed
```

## 🔧 Admin Functions (Owner Only)

```solidity
setSupportedToken(tokenAddress, true/false)  // Add/remove supported token
pause()                                       // Pause contract
unpause()                                     // Unpause contract
emergencyWithdraw(token, amount)              // Emergency withdrawal
```

## 💡 Key Changes from V1

### ✅ New Features
- **Separate Functions**: `joinVault()` vs `joinVaultWithToken()`
- **Configurable Penalties**: 1-10% instead of fixed 2%
- **VaultConfig Struct**: Cleaner vault creation
- **Immediate Penalty Release**: No 30-day lock
- **Platform Revenue**: Penalties go to GoalFinance
- **Enhanced Security**: Pausable contract

### ⚠️ Breaking Changes
- Function names changed
- VaultConfig struct required for creation
- Users cannot claim back penalties
- Penalty rates are configurable

## 🌐 Chain-Specific Info

| Chain | ID | Native | Symbol |
|-------|----|---------| -------|
| Mantle | 5000, 5003 | MNT | "MNT" |
| Base | 8453, 84532 | ETH | "ETH" |
| Ethereum | 1, 11155111 | ETH | "ETH" |
| Polygon | 137, 80001 | MATIC | "MATIC" |

## 🎯 Frontend Integration Tips

### 1. Vault Creation
```javascript
// Always use VaultConfig struct
const config = {
    name: vaultName,
    description: vaultDescription,
    token: isNative ? NATIVE_TOKEN : tokenAddress,
    goalType: isGroup ? 1 : 0,
    visibility: isPrivate ? 1 : 0,
    targetAmount: targetAmount,
    deadline: deadline,
    penaltyRate: penaltyRate // 100-1000
};
```

### 2. Token Detection
```javascript
// Check vault token type
const isNative = await goalFinance.isNativeTokenVault(vaultId);
if (isNative) {
    // Use joinVault() and addNativeFunds()
} else {
    // Use joinVaultWithToken() and addTokenFunds()
}
```

### 3. Progress Monitoring
```javascript
// Get real-time status
const status = await goalFinance.checkVaultStatus(vaultId);
const progress = await goalFinance.getVaultProgress(vaultId);
const timeLeft = await goalFinance.getTimeRemaining(vaultId);
```

---

**Enhanced GoalFinance with better UX and platform revenue! 🎯💰**
