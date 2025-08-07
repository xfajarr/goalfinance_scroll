# 🌰 Acorns Vault - Micro-Investing Platform

A comprehensive Acorns-like smart contract system that enables micro-investing through round-up transactions, automatic portfolio investment, and yield generation.

## 🎯 Features

### ✅ Core Acorns Features Implemented

- **🔄 Round-up Transactions**: Automatically round purchases to the nearest dollar
- **💰 Micro-investing Spare Change**: Invest accumulated round-ups with one click
- **📈 Automatic Portfolio Investment**: Three portfolio types with different risk/reward profiles
- **📊 Transaction Monitoring**: Track all purchases and round-up calculations
- **🔁 Recurring Investments**: Set up automatic weekly/monthly investments
- **🎁 Mock Morpho Yield Generation**: Earn yields based on portfolio allocation
- **🪙 Multi-token Support**: USDC, USDT, and DAI support with automatic conversion

### 📊 Portfolio Types

| Portfolio | APY | Risk Level | Description |
|-----------|-----|------------|-------------|
| Conservative | 4% | Low | Stable, low-risk investments |
| Moderate | 6% | Medium | Balanced risk/reward ratio |
| Aggressive | 8% | High | Higher risk, higher potential returns |

## 🏗️ Contract Architecture

### Main Contracts

1. **AcornsVault.sol** - Core micro-investing platform
2. **MockUSDT.sol** - Mock USDT token with faucet
3. **MockDAI.sol** - Mock DAI token with faucet

### Key Data Structures

```solidity
struct UserAccount {
    uint256 totalInvested;        // Total amount invested
    uint256 totalRoundUps;        // Total round-ups invested
    uint256 pendingRoundUps;      // Round-ups waiting to be invested
    uint256 lastYieldClaim;       // Last yield claim timestamp
    uint256 accumulatedYield;     // Accumulated yield amount
    PortfolioType portfolio;      // Portfolio type (Conservative/Moderate/Aggressive)
    bool recurringEnabled;        // Recurring investment enabled
    uint256 recurringAmount;      // Recurring investment amount
    uint256 recurringInterval;    // Recurring investment interval
    uint256 nextRecurringDate;    // Next recurring investment date
    bool isRegistered;           // User registration status
}

struct Purchase {
    uint256 amount;              // Purchase amount
    uint256 roundUpAmount;       // Calculated round-up
    uint256 timestamp;           // Purchase timestamp
    bool invested;              // Whether round-up was invested
    string merchant;            // Merchant name
}
```

## 🚀 Quick Start

### 1. Deploy Contracts

```bash
# Deploy to local network
forge script script/DeployAcorns.s.sol:DeployAcornsLocal --rpc-url http://localhost:8545 --broadcast

# Deploy to testnet
forge script script/DeployAcorns.s.sol:DeployAcorns --rpc-url $RPC_URL --broadcast --verify
```

### 2. Register User

```solidity
// Register with moderate portfolio (6% APY)
acornsVault.registerUser(AcornsVault.PortfolioType.MODERATE);
```

### 3. Simulate Purchases

```solidity
// Simulate a $4.25 coffee purchase (generates $0.75 round-up)
acornsVault.simulatePurchase(4.25 * 1e6, "Coffee Shop");

// Simulate a $12.67 grocery purchase (generates $0.33 round-up)
acornsVault.simulatePurchase(12.67 * 1e6, "Grocery Store");
```

### 4. Invest Round-ups

```solidity
// Invest all accumulated round-ups
acornsVault.investRoundUps();
```

### 5. Set Up Recurring Investment

```solidity
// Set up $50 weekly recurring investment
acornsVault.setRecurringInvestment(50 * 1e6, 7); // 7 days
```

## 📱 Usage Examples

### JavaScript SDK Usage

```javascript
const { AcornsVaultSDK } = require('./examples/AcornsExample.js');

// Initialize SDK
const acorns = new AcornsVaultSDK(provider, signer, contractAddress);

// Register user
await acorns.registerUser(1); // Moderate portfolio

// Simulate purchases
await acorns.simulatePurchase(4.25, "Coffee Shop");
await acorns.simulatePurchase(12.67, "Grocery Store");

// Invest round-ups
await acorns.investRoundUps();

// Check portfolio value
const info = await acorns.getUserInfo();
console.log(`Portfolio Value: $${info.portfolioValue}`);
```

### Round-up Calculation Examples

```javascript
// $4.25 purchase → $0.75 round-up (rounds to $5.00)
calculateRoundUp(4.25 * 1e6) // Returns 0.75 * 1e6

// $12.67 purchase → $0.33 round-up (rounds to $13.00)
calculateRoundUp(12.67 * 1e6) // Returns 0.33 * 1e6

// $25.00 purchase → $0.00 round-up (already whole dollar)
calculateRoundUp(25.00 * 1e6) // Returns 0
```

## 🧪 Testing

### Run Tests

```bash
# Run all Acorns tests
forge test --match-contract AcornsVaultTest -vvv

# Run specific test
forge test --match-test testRoundUpCalculation -vvv
```

### Test Coverage

- ✅ User registration and portfolio selection
- ✅ Purchase simulation and round-up calculation
- ✅ Round-up investment functionality
- ✅ Recurring investment setup and execution
- ✅ Multi-token deposits (USDC, USDT, DAI)
- ✅ Yield calculation and claiming
- ✅ Portfolio type changes
- ✅ Fund withdrawals
- ✅ Error handling and edge cases

## 🎮 Demo Features

### 1. Purchase Simulation

Simulate real-world purchases to generate round-ups:

```solidity
// Daily purchases simulation
simulatePurchase(4.25 * 1e6, "Coffee Shop");      // $0.75 round-up
simulatePurchase(12.67 * 1e6, "Grocery Store");   // $0.33 round-up
simulatePurchase(25.99 * 1e6, "Gas Station");     // $0.01 round-up
simulatePurchase(8.50 * 1e6, "Lunch");            // $0.50 round-up
```

### 2. Automatic Investment

Round-ups are automatically calculated and can be invested with one transaction:

```solidity
// Check pending round-ups
uint256 pending = getPendingRoundUps(user);

// Invest all at once
investRoundUps();
```

### 3. Yield Generation

Mock Morpho-style yield generation based on portfolio type:

```solidity
// Calculate current yield
uint256 yield = calculateYield(user);

// Claim accumulated yield
claimYield();
```

### 4. Multi-token Support

Support for multiple stablecoins with automatic conversion:

```solidity
// Deposit USDC
depositFunds(usdcAddress, 100 * 1e6);

// Deposit USDT
depositFunds(usdtAddress, 100 * 1e6);

// Deposit DAI
depositFunds(daiAddress, 100 * 1e18);
```

## 📊 Key Functions

### User Management
- `registerUser(PortfolioType)` - Register with portfolio selection
- `changePortfolio(PortfolioType)` - Change portfolio type
- `getUserAccount(address)` - Get user account details

### Purchase & Round-ups
- `simulatePurchase(amount, merchant)` - Simulate purchase
- `calculateRoundUp(amount)` - Calculate round-up amount
- `investRoundUps()` - Invest accumulated round-ups
- `getPendingRoundUps(address)` - Get pending round-ups

### Recurring Investments
- `setRecurringInvestment(amount, days)` - Set up recurring
- `executeRecurringInvestment()` - Execute if due
- `isRecurringDue(address)` - Check if due

### Yield & Withdrawals
- `calculateYield(address)` - Calculate current yield
- `claimYield()` - Claim accumulated yield
- `withdrawFunds(amount)` - Withdraw funds
- `getPortfolioValue(address)` - Get total portfolio value

### Multi-token
- `depositFunds(token, amount)` - Deposit any supported token
- `setSupportedToken(token, rate, decimals)` - Admin: Add token support

## 🔧 Configuration

### Supported Tokens

| Token | Decimals | Exchange Rate | Faucet Available |
|-------|----------|---------------|------------------|
| USDC | 6 | 1:1 | ✅ (existing) |
| USDT | 6 | 1:1 | ✅ (new) |
| DAI | 18 | 1:1 | ✅ (new) |

### Portfolio APY Rates

```solidity
uint256 public constant CONSERVATIVE_APY = 400; // 4%
uint256 public constant MODERATE_APY = 600;     // 6%
uint256 public constant AGGRESSIVE_APY = 800;   // 8%
```

## 🚀 Deployment Addresses

### Testnet Deployments

```
# Mantle Sepolia
AcornsVault: 0x...
MockUSDT: 0x...
MockDAI: 0x...

# Scroll Sepolia  
AcornsVault: 0x...
MockUSDT: 0x...
MockDAI: 0x...

# Etherlink Testnet
AcornsVault: 0x...
MockUSDT: 0x...
MockDAI: 0x...
```

## 🎯 Integration with GoalFinance

The Acorns functionality is designed to complement the existing GoalFinance platform:

1. **Shared Token Support**: Uses same mock tokens (USDC, USDT, DAI)
2. **Compatible Architecture**: Similar security patterns and best practices
3. **Cross-platform Features**: Users can use both goal-based savings and micro-investing
4. **Unified Experience**: Same wallet connection and user experience

## 🔮 Future Enhancements

- **Real Transaction Monitoring**: Integration with payment processors
- **Advanced Portfolio Rebalancing**: Automatic portfolio optimization
- **Social Features**: Share investment milestones and achievements
- **DeFi Integration**: Real yield farming with protocols like Morpho
- **Mobile App**: Native mobile experience for purchase tracking
- **AI-powered Insights**: Spending analysis and investment recommendations

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to start micro-investing? Deploy the contracts and begin your Acorns journey! 🌰💰**
