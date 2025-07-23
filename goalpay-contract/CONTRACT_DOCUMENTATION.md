# GoalFinance V2 - Complete Contract Documentation

## 📋 Overview

GoalFinance V2 is a refactored decentralized savings vault platform with improved architecture, better security, and enhanced user experience. The contract supports both native tokens (MNT, ETH, MATIC) and ERC20 tokens with configurable penalty mechanisms.

## 🏗️ Contract Architecture

### Main Contract: `GoalFinance.sol`
- **Inheritance**: `ReentrancyGuard`, `Ownable`, `Pausable`
- **Solidity Version**: `^0.8.24`
- **Key Improvements**: Separate functions for native vs ERC20, configurable penalties, immediate penalty release

## 📊 Core Data Structures

### VaultConfig Struct
```solidity
struct VaultConfig {
    string name;                // Vault display name
    string description;         // Vault description
    address token;              // Token address (NATIVE_TOKEN for native)
    GoalType goalType;          // PERSONAL (0) or GROUP (1)
    Visibility visibility;      // PUBLIC (0) or PRIVATE (1)
    uint256 targetAmount;       // Goal amount in token's smallest unit
    uint256 deadline;           // Unix timestamp deadline
    uint256 penaltyRate;        // Penalty rate in basis points (100-1000)
}
```

### Vault Struct
```solidity
struct Vault {
    uint256 id;                 // Unique vault identifier
    VaultConfig config;         // Vault configuration
    address creator;            // Address that created the vault
    uint256 totalDeposited;     // Current total deposited
    uint256 memberCount;        // Number of members
    VaultStatus status;         // ACTIVE (0), SUCCESS (1), FAILED (2)
    bytes32 inviteCode;         // Unique invite code
    uint256 createdAt;          // Creation timestamp
}
```

### Member Struct
```solidity
struct Member {
    uint256 depositedAmount;    // Total amount deposited by member
    uint256 targetShare;        // Target share for this member
    uint256 joinedAt;           // When member joined (timestamp)
    bool hasWithdrawn;          // Whether member has withdrawn
    uint256 penaltyAmount;      // Penalty amount if withdrawn early
}
```

## 🎯 Constants

```solidity
uint256 public constant BASIS_POINTS = 10000;          // 100% = 10000 basis points
uint256 public constant MIN_PENALTY_RATE = 100;        // 1% minimum penalty
uint256 public constant MAX_PENALTY_RATE = 1000;       // 10% maximum penalty
uint256 public constant DEFAULT_PENALTY_RATE = 200;    // 2% default penalty
address public constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
```

## 🔧 Core Functions

### 1. Vault Creation

#### `createVault(VaultConfig memory _config)`
```solidity
function createVault(VaultConfig memory _config) 
    external returns (uint256 vaultId, bytes32 inviteCode)
```

**Parameters:**
- `_config`: VaultConfig struct with all vault settings

**Returns:**
- `vaultId`: Unique ID of created vault
- `inviteCode`: Bytes32 invite code for sharing

**Frontend Usage:**
```javascript
// Create native token vault
const vaultConfig = {
    name: "MNT Emergency Fund",
    description: "Building emergency savings in MNT",
    token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // NATIVE_TOKEN
    goalType: 1, // GROUP
    visibility: 0, // PUBLIC
    targetAmount: ethers.parseEther("1000"), // 1000 MNT
    deadline: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
    penaltyRate: 200 // 2%
};

const result = await goalFinance.createVault(vaultConfig);
```

**Explorer Testing:**
```
Function: createVault
_config: [
    "Emergency Fund",
    "Building emergency savings",
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    1,
    0,
    "1000000000000000000000",
    1735689600,
    200
]
```

### 2. Joining Vaults

#### `joinVault(uint256 _vaultId, bytes32 _inviteCode)` - Native Token
```solidity
function joinVault(uint256 _vaultId, bytes32 _inviteCode) external payable
```

**Parameters:**
- `_vaultId`: ID of vault to join
- `_inviteCode`: Required for private vaults (use `0x00...00` for public)

**Requirements:**
- Vault must use native token
- Must send native token as `msg.value`
- Cannot be existing member

**Frontend Usage:**
```javascript
// Join native token vault
await goalFinance.joinVault(
    vaultId,
    "0x0000000000000000000000000000000000000000000000000000000000000000", // Public vault
    { value: ethers.parseEther("100") } // Send 100 native tokens
);
```

**Explorer Testing:**
```
Function: joinVault
_vaultId: 1
_inviteCode: 0x0000000000000000000000000000000000000000000000000000000000000000
Value: 100000000000000000000 (100 tokens in wei)
```

#### `joinVaultWithToken(uint256 _vaultId, uint256 _amount, bytes32 _inviteCode)` - ERC20
```solidity
function joinVaultWithToken(uint256 _vaultId, uint256 _amount, bytes32 _inviteCode) external
```

**Parameters:**
- `_vaultId`: ID of vault to join
- `_amount`: Amount of ERC20 tokens to deposit
- `_inviteCode`: Required for private vaults

**Requirements:**
- Vault must use ERC20 token
- Must approve tokens first
- Cannot send native token (`msg.value` must be 0)

**Frontend Usage:**
```javascript
// Join ERC20 vault
await token.approve(goalFinanceAddress, amount);
await goalFinance.joinVaultWithToken(vaultId, amount, inviteCode);
```

### 3. Adding Funds

#### `addNativeFunds(uint256 _vaultId)` - Native Token
```solidity
function addNativeFunds(uint256 _vaultId) external payable
```

**Parameters:**
- `_vaultId`: ID of vault to add funds to

**Requirements:**
- Must be vault member
- Vault must use native token
- Must send native token as `msg.value`

**Frontend Usage:**
```javascript
// Add more native tokens
await goalFinance.addNativeFunds(vaultId, {
    value: ethers.parseEther("50") // Add 50 tokens
});
```

**Explorer Testing:**
```
Function: addNativeFunds
_vaultId: 1
Value: 50000000000000000000 (50 tokens in wei)
```

#### `addTokenFunds(uint256 _vaultId, uint256 _amount)` - ERC20
```solidity
function addTokenFunds(uint256 _vaultId, uint256 _amount) external
```

**Parameters:**
- `_vaultId`: ID of vault to add funds to
- `_amount`: Amount of ERC20 tokens to add

**Requirements:**
- Must be vault member
- Vault must use ERC20 token
- Must approve tokens first

**Frontend Usage:**
```javascript
// Add more ERC20 tokens
await token.approve(goalFinanceAddress, amount);
await goalFinance.addTokenFunds(vaultId, amount);
```

### 4. Withdrawals

#### `withdraw(uint256 _vaultId)` - Normal Withdrawal
```solidity
function withdraw(uint256 _vaultId) external
```

**Purpose:** Withdraw funds after goal is successfully reached
**Requirements:** 
- Must be vault member
- Vault status must be SUCCESS
- Member must not have already withdrawn

#### `withdrawEarly(uint256 _vaultId)` - Early Withdrawal
```solidity
function withdrawEarly(uint256 _vaultId) external
```

**Purpose:** Withdraw funds early with penalty
**Penalty:** Configurable rate (1-10%, default 2%)
**Important:** Penalty funds go to GoalFinance platform, NOT claimable by user

### 5. Penalty Management

#### `claimPenalties(address _token)` - Claim Platform Penalties
```solidity
function claimPenalties(address _token) external
```

**Important Note:** In the new contract, penalty funds are collected by the GoalFinance platform. Users cannot claim back their own penalties. This function is for platform penalty collection only.

### 6. Status Management

#### `updateVaultStatus(uint256 _vaultId)`
```solidity
function updateVaultStatus(uint256 _vaultId) external
```

**Purpose:** Manually check and update vault status
**Automatic Updates:**
- Sets status to SUCCESS if target amount reached
- Sets status to FAILED if deadline passed without reaching goal

## 📖 View Functions

### Essential View Functions for Frontend

#### `getVault(uint256 _vaultId)`
Returns complete vault information including config

#### `getVaultConfig(uint256 _vaultId)`
Returns only the vault configuration struct

#### `isNativeTokenVault(uint256 _vaultId)`
Returns true if vault uses native token

#### `isGoalReached(uint256 _vaultId)`
Returns true if vault has reached its target amount

#### `checkVaultStatus(uint256 _vaultId)`
Returns current vault status (may differ from stored status)

#### `isVaultExpired(uint256 _vaultId)`
Returns true if vault deadline has passed

#### `getTimeRemaining(uint256 _vaultId)`
Returns seconds remaining until deadline (0 if expired)

#### `getVaultProgress(uint256 _vaultId)`
Returns progress in basis points (10000 = 100%)

#### `getNativeTokenSymbol()`
Returns native token symbol for current chain:
- Mantle (5000, 5003): "MNT"
- Base (8453, 84532): "ETH"
- Ethereum (1, 11155111): "ETH"
- Polygon (137, 80001): "MATIC"

### Discovery Functions

#### `getAllVaults()`
Returns array of all vault IDs

#### `getVaultsByCreator(address _creator)`
Returns vault IDs created by specific address

#### `getVaultsPaginated(uint256 _offset, uint256 _limit)`
Returns paginated vault IDs with hasMore flag

#### `getTotalVaultCount()`
Returns total number of vaults created

### Member Functions

#### `getMember(uint256 _vaultId, address _member)`
Returns member information for specific vault

#### `getVaultMembers(uint256 _vaultId)`
Returns array of all member addresses in vault

### Token Functions

#### `isTokenSupported(address _token)`
Returns true if token is supported for vault creation

#### `getClaimablePenaltiesByToken(address _user, address _token)`
Returns claimable penalty amount (for platform use)

## 🚨 Error Handling

### Custom Errors
```solidity
error GoalFinance__ZeroAddress();           // When address(0) provided
error GoalFinance__InvalidAmount();         // When amount is 0 or invalid
error GoalFinance__InvalidPenaltyRate();    // When penalty rate outside 1-10%
error GoalFinance__InvalidDeadline();       // When deadline is in past
error GoalFinance__TokenNotSupported();     // When token not supported
error GoalFinance__VaultNotFound();         // When vault ID doesn't exist
error GoalFinance__VaultNotActive();        // When vault not in ACTIVE status
error GoalFinance__VaultExpired();          // When vault deadline passed
error GoalFinance__GoalNotReached();        // When trying to withdraw before goal
error GoalFinance__AlreadyMember();         // When user tries to join twice
error GoalFinance__NotMember();             // When non-member tries member functions
error GoalFinance__InvalidInviteCode();     // When wrong invite code provided
error GoalFinance__WithdrawalNotAllowed();  // When member already withdrew
error GoalFinance__InsufficientBalance();   // When insufficient funds
error GoalFinance__TransferFailed();        // When native token transfer fails
error GoalFinance__ExcessiveNativeValue();  // When sending native to ERC20 vault
```

## 🔐 Access Control & Admin Functions

### Owner Functions
```solidity
function setSupportedToken(address _token, bool _supported) external onlyOwner;
function pause() external onlyOwner;
function unpause() external onlyOwner;
function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner;
```

### Public Functions
- All vault creation, joining, and management functions
- All view functions for querying data

## 📡 Events

### Vault Events
```solidity
event VaultCreated(uint256 indexed vaultId, address indexed creator, address indexed token, VaultConfig config, bytes32 inviteCode);
event VaultStatusUpdated(uint256 indexed vaultId, VaultStatus indexed newStatus, uint256 totalDeposited);
event GoalReached(uint256 indexed vaultId, address indexed token, uint256 totalAmount);
event VaultFailed(uint256 indexed vaultId, address indexed token, uint256 totalAmount);
event VaultExpired(uint256 indexed vaultId, address indexed token, uint256 totalDeposited);
```

### Member Events
```solidity
event MemberJoined(uint256 indexed vaultId, address indexed member, address indexed token, uint256 depositAmount, uint256 memberCount);
event FundsDeposited(uint256 indexed vaultId, address indexed member, address indexed token, uint256 amount, uint256 totalDeposited);
event Withdrawal(uint256 indexed vaultId, address indexed member, address indexed token, uint256 amount);
event EarlyWithdrawal(uint256 indexed vaultId, address indexed member, address indexed token, uint256 amount, uint256 penalty);
```

### System Events
```solidity
event TokenSupported(address indexed token, bool supported);
event PenaltyReleased(address indexed user, address indexed token, uint256 amount);
```

## 🎮 Frontend Integration Guide

### 1. Detecting Vault Token Type
```javascript
// Method 1: Check vault config
const vault = await goalFinance.getVault(vaultId);
const isNative = vault.config.token === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// Method 2: Use helper function
const isNative = await goalFinance.isNativeTokenVault(vaultId);

// Get native token symbol for display
const symbol = await goalFinance.getNativeTokenSymbol();
```

### 2. Creating Vaults
```javascript
// Native token vault
const createNativeVault = async () => {
    const config = {
        name: "MNT Community Fund",
        description: "Saving MNT for community projects",
        token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        goalType: 1, // GROUP
        visibility: 0, // PUBLIC
        targetAmount: ethers.parseEther("1000"),
        deadline: Math.floor(Date.now() / 1000) + 86400 * 30,
        penaltyRate: 300 // 3%
    };

    const tx = await goalFinance.createVault(config);
    const receipt = await tx.wait();
    // Parse VaultCreated event for vaultId and inviteCode
};

// ERC20 token vault
const createTokenVault = async (tokenAddress) => {
    const config = {
        name: "USDC Emergency Fund",
        description: "Building stable emergency savings",
        token: tokenAddress,
        goalType: 0, // PERSONAL
        visibility: 1, // PRIVATE
        targetAmount: ethers.parseUnits("5000", 6), // 5000 USDC
        deadline: Math.floor(Date.now() / 1000) + 86400 * 60,
        penaltyRate: 150 // 1.5%
    };

    const tx = await goalFinance.createVault(config);
};
```

### 3. Joining Vaults
```javascript
// Join native token vault
const joinNativeVault = async (vaultId, amount, inviteCode) => {
    const tx = await goalFinance.joinVault(
        vaultId,
        inviteCode || "0x0000000000000000000000000000000000000000000000000000000000000000",
        { value: amount }
    );
};

// Join ERC20 vault
const joinTokenVault = async (vaultId, amount, inviteCode, tokenContract) => {
    // First approve
    await tokenContract.approve(goalFinanceAddress, amount);

    // Then join
    const tx = await goalFinance.joinVaultWithToken(
        vaultId,
        amount,
        inviteCode || "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
};
```

### 4. Adding Funds
```javascript
// Add native token funds
const addNativeFunds = async (vaultId, amount) => {
    const tx = await goalFinance.addNativeFunds(vaultId, { value: amount });
};

// Add ERC20 funds
const addTokenFunds = async (vaultId, amount, tokenContract) => {
    await tokenContract.approve(goalFinanceAddress, amount);
    const tx = await goalFinance.addTokenFunds(vaultId, amount);
};
```

### 5. Monitoring Progress
```javascript
// Get vault progress
const getProgress = async (vaultId) => {
    const progress = await goalFinance.getVaultProgress(vaultId);
    const percentage = progress / 100; // Convert from basis points
    return percentage;
};

// Check if goal reached
const isComplete = await goalFinance.isGoalReached(vaultId);

// Get time remaining
const timeRemaining = await goalFinance.getTimeRemaining(vaultId);
const daysRemaining = timeRemaining / 86400; // Convert to days

// Check vault status
const status = await goalFinance.checkVaultStatus(vaultId);
// 0 = ACTIVE, 1 = SUCCESS, 2 = FAILED
```

### 6. Event Listening
```javascript
// Listen for vault creation
goalFinance.on("VaultCreated", (vaultId, creator, token, config, inviteCode) => {
    console.log(`New vault created: ${config.name} (ID: ${vaultId})`);
});

// Listen for member joins
goalFinance.on("MemberJoined", (vaultId, member, token, depositAmount, memberCount) => {
    console.log(`${member} joined vault ${vaultId} with ${depositAmount}`);
});

// Listen for goal completion
goalFinance.on("GoalReached", (vaultId, token, totalAmount) => {
    console.log(`Vault ${vaultId} reached its goal! Total: ${totalAmount}`);
});

// Listen for funds deposited
goalFinance.on("FundsDeposited", (vaultId, member, token, amount, totalDeposited) => {
    console.log(`${member} added ${amount} to vault ${vaultId}`);
});
```

## 🔍 Explorer Testing Guide

### 1. Create Native Token Vault
```
Function: createVault
_config: [
    "Test MNT Vault",
    "Testing native token deposits",
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    1,
    0,
    "1000000000000000000000",
    1735689600,
    200
]
```

### 2. Join Native Token Vault
```
Function: joinVault
_vaultId: 1
_inviteCode: 0x0000000000000000000000000000000000000000000000000000000000000000
Value: 100000000000000000000
```

### 3. Add Native Token Funds
```
Function: addNativeFunds
_vaultId: 1
Value: 50000000000000000000
```

### 4. Check Vault Status
```
Function: checkVaultStatus
_vaultId: 1
Returns: 0 (ACTIVE), 1 (SUCCESS), or 2 (FAILED)
```

### 5. Get Vault Progress
```
Function: getVaultProgress
_vaultId: 1
Returns: Progress in basis points (e.g., 1500 = 15%)
```

## 💡 Key Differences from V1

### ✅ Improvements
1. **Separate Functions**: Clear distinction between native and ERC20 operations
2. **Configurable Penalties**: 1-10% penalty rates instead of fixed 2%
3. **Immediate Penalty Release**: No 30-day lock period
4. **Better Security**: Added Pausable, better modifiers
5. **Enhanced Events**: More detailed event data
6. **Platform Revenue**: Penalties go to platform, not claimable by users

### ⚠️ Breaking Changes
1. **Function Names Changed**:
   - `joinVaultAndDeposit()` → `joinVault()` / `joinVaultWithToken()`
   - `addFunds()` → `addNativeFunds()` / `addTokenFunds()`
2. **Penalty System**: Users cannot claim back penalties
3. **VaultConfig Struct**: New parameter structure for vault creation

## 🚀 Quick Start Checklist

### For Frontend Developers
- [ ] Update function calls to new names
- [ ] Handle VaultConfig struct for vault creation
- [ ] Implement separate flows for native vs ERC20 tokens
- [ ] Update event listeners for new event structure
- [ ] Remove penalty claiming UI (penalties go to platform)
- [ ] Add penalty rate configuration in vault creation

### For Contract Interaction
- [ ] Test vault creation with VaultConfig struct
- [ ] Test separate join functions for native/ERC20
- [ ] Test configurable penalty rates (1-10%)
- [ ] Verify penalty funds go to platform
- [ ] Test new view functions

### For Testing
- [ ] Test both native and ERC20 vault flows
- [ ] Test penalty mechanisms with different rates
- [ ] Test edge cases and error conditions
- [ ] Verify platform penalty collection
