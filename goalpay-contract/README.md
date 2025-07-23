# GoalFinance Smart Contract

A decentralized savings vault platform that enables users to create and participate in collaborative financial goals. Built with enhanced security, multi-token support, and configurable penalty mechanisms.

## 🏗️ Architecture Overview

GoalFinance uses a unified contract architecture with multi-token support:

```
GoalFinance (Main Contract)
├── Vault Management
│   ├── Create savings vaults with configurable parameters
│   ├── Support for both native tokens (MNT, ETH, MATIC) and ERC20 tokens
│   ├── Public/private vaults with invite code system
│   └── Automatic goal tracking and status management
├── Member Management
│   ├── Join vaults with native or ERC20 token deposits
│   ├── Add funds to existing vaults
│   ├── Track individual member contributions and progress
│   └── Handle withdrawals and early withdrawal penalties
├── Security Features
│   ├── Reentrancy protection on all state-changing functions
│   ├── Pausable contract for emergency situations
│   ├── Configurable penalty rates (1-10%)
│   └── Immediate penalty release (no lock period)
└── Multi-Chain Support
    ├── Mantle (MNT), Base (ETH), Ethereum (ETH), Polygon (MATIC)
    ├── Automatic native token detection
    └── Chain-specific token support

MockUSDC (Testing Token)
├── ERC20 token with 6 decimals (like real USDC)
├── Mint/burn functionality for testing
└── Owner-controlled token distribution
```

## 📋 Features

### ✅ Core Features (Implemented)
- **Multi-Token Vaults**: Support for native tokens (MNT, ETH, MATIC) and ERC20 tokens
- **Vault Creation**: Create savings goals with configurable parameters and deadlines
- **Flexible Deposits**: Separate functions for native token and ERC20 deposits
- **Member Management**: Join vaults, track individual contributions, manage memberships
- **Configurable Penalties**: 1-10% penalty rates for early withdrawals
- **Immediate Penalty Release**: No lock period - penalties available immediately
- **Invite System**: Share private vaults via unique invite codes
- **Public/Private Vaults**: Control vault visibility and access
- **Progress Tracking**: Real-time progress monitoring and goal completion
- **Multi-Chain Support**: Deploy on Mantle, Base, Ethereum, Polygon, and more
- **Enhanced Security**: Reentrancy protection, pausable contract, comprehensive error handling

### 🔮 Advanced Features
- **Platform Revenue**: Penalty funds go to GoalFinance platform
- **Auto-Enrollment**: Vault creators automatically become members
- **Status Management**: Automatic vault status updates (ACTIVE, SUCCESS, FAILED)
- **Chain Detection**: Automatic native token symbol detection per chain
- **Gas Optimization**: Custom errors, efficient storage, minimal external calls

## 🚀 Quick Start

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js](https://nodejs.org/) (for frontend integration)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd goalpay-contract

# Install dependencies
make install

# Setup environment variables
cp .env.example .env
# Edit .env file with your private key and RPC URLs

# Build contracts
make build

# Run tests
make test
```

### Local Development

```bash
# Start local blockchain
anvil

# Deploy to local network (in another terminal)
make deploy-local

# Run all tests (21 tests)
make test

# Run tests with verbose output
make test-verbose

# Check gas usage
make test-gas
```

## 📁 Project Structure

```
goalpay-contract/
├── 📄 README.md                          # This file
├── 📄 Makefile                          # Build and deployment commands
├── 📄 foundry.toml                      # Foundry configuration
├── 📄 networks.json                     # Network configurations
├── 📄 remappings.txt                    # Import remappings
│
├── 📁 src/                              # Smart contracts
│   ├── GoalFinance.sol                  # Main GoalFinance contract
│   └── MockUSDC.sol                     # Mock USDC for testing
│
├── 📁 script/                           # Deployment scripts
│   └── Deploy.s.sol                    # Universal deployment script
│
├── 📁 test/                             # Test files
│   ├── GoalFinance.t.sol               # GoalFinance tests (21 tests)
│   └── MockUSDC.t.sol                  # MockUSDC tests
│
├── 📁 examples/                         # Usage examples
│   ├── GoalFinanceExample.js           # Basic usage examples
│   ├── AutoInviteCodeExample.js        # Invite code examples
│   └── OffchainInviteCodeExample.js    # Off-chain examples
│
├── 📁 deployments/                      # Deployment records
│   └── mantle-sepolia.json             # Mantle Sepolia deployment
│
├── 📁 Documentation/                    # Current documentation
│   ├── NEW_CONTRACT_DOCUMENTATION.md   # Complete contract reference
│   ├── NEW_QUICK_REFERENCE.md         # Quick reference guide
│   ├── DEPLOYMENT_GUIDE_V2.md         # Universal deployment guide
│   └── TEST_UPDATES_SUMMARY.md        # Test updates summary
│
└── 📁 archive/                          # Legacy files (preserved)
    ├── scripts/                        # Old deployment scripts
    ├── docs/                          # Legacy documentation
    └── deployment-files/              # Legacy deployment files
```

## 🔧 Contract Details

### GoalFinance.sol
Main contract that manages all vaults and member interactions.

**Core Functions:**
- `createVault(VaultConfig)` - Create new savings vault with configurable parameters
- `joinVault(vaultId, inviteCode)` - Join vault with native token (payable)
- `joinVaultWithToken(vaultId, amount, inviteCode)` - Join vault with ERC20 token
- `addNativeFunds(vaultId)` - Add native token funds to existing vault (payable)
- `addTokenFunds(vaultId, amount)` - Add ERC20 token funds to existing vault
- `withdraw(vaultId)` - Withdraw funds after goal completion
- `withdrawEarly(vaultId)` - Withdraw funds early with penalty

**View Functions:**
- `getVault(vaultId)` - Get complete vault information
- `getMember(vaultId, member)` - Get member details
- `isNativeTokenVault(vaultId)` - Check if vault uses native token
- `isGoalReached(vaultId)` - Check if vault reached its goal
- `getVaultProgress(vaultId)` - Get progress in basis points
- `getNativeTokenSymbol()` - Get native token symbol for current chain

**Admin Functions:**
- `setSupportedToken(token, supported)` - Add/remove supported ERC20 tokens
- `pause()` / `unpause()` - Emergency pause functionality
- `emergencyWithdraw(token, amount)` - Emergency fund recovery

### MockUSDC.sol
Test USDC token with 6 decimals (like real USDC).

**Key Functions:**
- `mint(address, amount)` - Mint tokens (owner only)
- `burn(amount)` - Burn caller's tokens
- `burnFrom(address, amount)` - Burn tokens with allowance
- Standard ERC20 functions with 6 decimals

## 🧪 Testing

```bash
# Run all tests (21 tests)
make test

# Run with verbose output
make test-verbose

# Run specific test contract
forge test --match-contract GoalFinanceTest

# Check gas usage
make test-gas

# Generate coverage report
forge coverage
```

### Test Coverage (21 Tests Passing)
- ✅ **Vault Creation**: VaultConfig struct, parameter validation, auto-enrollment
- ✅ **Multi-Token Support**: Native token and ERC20 vault operations
- ✅ **Member Management**: Join vaults, add funds, member tracking
- ✅ **Configurable Penalties**: 1-10% penalty rates, immediate release
- ✅ **Withdrawals**: Normal withdrawals, early withdrawals with penalties
- ✅ **Invite System**: Public/private vaults, invite code validation
- ✅ **Progress Tracking**: Goal completion, status updates, time remaining
- ✅ **View Functions**: All getter functions and helper utilities
- ✅ **Access Control**: Owner functions, pausable contract
- ✅ **Error Handling**: Custom errors, edge cases, validation
- ✅ **Security**: Reentrancy protection, input validation

## 🚀 Deployment

### Universal Deployment (Auto-detects Network)
```bash
# Deploy to any supported network
make deploy

# Deploy with contract verification
make deploy-verify
```

### Specific Networks

#### Testnets (Auto-deploys Mock Tokens)
```bash
make deploy-sepolia           # Ethereum Sepolia
make deploy-base-sepolia      # Base Sepolia
make deploy-mantle-sepolia    # Mantle Sepolia
make deploy-arbitrum-sepolia  # Arbitrum Sepolia
make deploy-optimism-sepolia  # Optimism Sepolia
```

#### Mainnets (Uses Real Tokens)
```bash
make deploy-ethereum    # Ethereum Mainnet
make deploy-base        # Base Mainnet
make deploy-arbitrum    # Arbitrum One
make deploy-optimism    # Optimism Mainnet
make deploy-polygon     # Polygon Mainnet
```

#### Local Development
```bash
# Start local blockchain
anvil

# Deploy to local network
make deploy-local
```

### Supported Networks
- **Testnets**: Ethereum Sepolia, Base Sepolia, Mantle Sepolia, Arbitrum Sepolia, Optimism Sepolia
- **Mainnets**: Ethereum, Base, Arbitrum One, Optimism, Polygon
- **Native Tokens**: ETH, MNT, MATIC (auto-detected per chain)

## 🔐 Security Features

1. **Reentrancy Protection**: All state-changing functions use `nonReentrant` modifier
2. **Access Control**: Owner-only functions with OpenZeppelin `Ownable`
3. **Pausable Contract**: Emergency pause functionality for critical situations
4. **Input Validation**: Comprehensive parameter checking with custom errors
5. **Custom Errors**: Gas-efficient error handling with descriptive names
6. **Safe Math**: Solidity 0.8+ automatic overflow/underflow protection
7. **Token Safety**: SafeERC20 for all token transfers
8. **Penalty Security**: Penalties go to platform, not claimable by users

## 📊 Gas Optimization

- **Custom Errors**: Gas-efficient error messages instead of require strings
- **Efficient Storage**: Optimized struct packing and storage layout
- **Minimal External Calls**: Reduced external contract interactions
- **Immutable Constants**: Gas-efficient constant declarations
- **Optimized Loops**: Efficient iteration patterns
- **Batch Operations**: Multiple operations in single transaction where possible

## 🔗 Frontend Integration

### Contract Addresses
Update these in your frontend configuration:

```typescript
// src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  [chainId]: {
    GOAL_FINANCE: "0x...",     // Deployed GoalFinance address
    MOCK_USDC: "0x...",        // Mock USDC address (testnets only)
    NATIVE_TOKEN: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native token constant
  }
};
```

### Key Functions for Frontend
```typescript
// Create vault with VaultConfig struct
const config = {
  name: "My Savings Goal",
  description: "Emergency fund savings",
  token: isNative ? NATIVE_TOKEN : tokenAddress,
  goalType: 1, // GROUP
  visibility: 0, // PUBLIC
  targetAmount: ethers.parseEther("1000"),
  deadline: Math.floor(Date.now() / 1000) + 86400 * 30,
  penaltyRate: 200 // 2%
};

// Join vault (different functions for native vs ERC20)
if (isNative) {
  await goalFinance.joinVault(vaultId, inviteCode, { value: amount });
} else {
  await token.approve(goalFinanceAddress, amount);
  await goalFinance.joinVaultWithToken(vaultId, amount, inviteCode);
}
```

### Key Events to Listen For
```typescript
// Vault creation
event VaultCreated(uint256 indexed vaultId, address indexed creator, address indexed token, VaultConfig config, bytes32 inviteCode);

// Member joins
event MemberJoined(uint256 indexed vaultId, address indexed member, address indexed token, uint256 depositAmount, uint256 memberCount);

// Fund deposits
event FundsDeposited(uint256 indexed vaultId, address indexed member, address indexed token, uint256 amount, uint256 totalDeposited);

// Goal completion
event GoalReached(uint256 indexed vaultId, address indexed token, uint256 totalAmount);

// Early withdrawals
event EarlyWithdrawal(uint256 indexed vaultId, address indexed member, address indexed token, uint256 amount, uint256 penalty);
```

## 🛠️ Development Commands

```bash
# Code formatting
make format              # Format all Solidity files
make format-check        # Check formatting without changes

# Building and testing
make build              # Build all contracts
make test               # Run all tests (21 tests)
make test-verbose       # Run tests with detailed output
make clean              # Clean build artifacts

# Gas analysis
make test-gas           # Run tests with gas reporting
forge snapshot          # Generate gas snapshots

# Documentation
make help               # Show all available commands

# Security analysis (requires additional tools)
slither .               # Static analysis with Slither
mythril analyze src/    # Security analysis with Mythril
```

## 📚 Documentation

### Complete Documentation
- **[Contract Documentation](NEW_CONTRACT_DOCUMENTATION.md)** - Complete technical reference
- **[Quick Reference](NEW_QUICK_REFERENCE.md)** - Essential functions and examples
- **[Deployment Guide](DEPLOYMENT_GUIDE_V2.md)** - Universal deployment instructions
- **[Test Summary](TEST_UPDATES_SUMMARY.md)** - Test suite documentation

### Examples
- **[Basic Usage](examples/GoalFinanceExample.js)** - Core functionality examples
- **[Invite Codes](examples/AutoInviteCodeExample.js)** - Invite system usage
- **[Off-chain](examples/OffchainInviteCodeExample.js)** - Off-chain integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `make test`
5. Format code: `make format`
6. Submit a pull request

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation for API changes
- Use custom errors for gas efficiency

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Complete docs in `NEW_CONTRACT_DOCUMENTATION.md`
- **Quick Help**: Essential functions in `NEW_QUICK_REFERENCE.md`
- **Issues**: Create GitHub issues for bugs or feature requests
- **Testing**: 21 comprehensive tests covering all functionality

## 🎯 Roadmap

### ✅ Current (V2)
- Multi-token vault support (native + ERC20)
- Configurable penalty system (1-10%)
- Multi-chain deployment support
- Enhanced security and gas optimization

### 🔮 Future
- **Yield Integration**: Compound/Aave yield strategies
- **Governance**: DAO features for platform decisions
- **Advanced Features**: Recurring deposits, vault templates
- **Mobile SDK**: React Native integration
- **Analytics**: Advanced progress tracking and insights

---

**Built with ❤️ for decentralized collaborative savings! 🎯💰**
