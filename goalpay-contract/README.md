# GoalFi Smart Contracts

A complete modular smart contract system for collaborative savings goals built on Ethereum.

## 🏗️ Architecture Overview

GoalFi uses a factory pattern with modular, secure smart contracts:

```
GoalVaultFactory (Main Factory)
├── Creates individual GoalVault contracts
├── Manages vault discovery and invites
└── Handles access control and security

GoalVault (Individual Vaults)
├── Manages member contributions
├── Tracks savings progress
├── Handles fund distribution
└── Implements goal completion logic

MockUSDC (Testing Token)
├── ERC20 token with 6 decimals
├── Faucet functionality for testing
└── Mint/burn capabilities
```

## 📋 Features

### ✅ MVP Features (Implemented)
- **Vault Creation**: Create savings goals with targets and deadlines
- **Member Management**: Join/leave vaults, track contributions
- **Fund Management**: Add USDC, automatic goal completion
- **Invite System**: Share vaults via unique invite codes
- **Public/Private Vaults**: Control vault visibility
- **Progress Tracking**: Real-time progress and member stats
- **Security**: Reentrancy protection, access controls, pausable

### 🔮 Future Features (Post-MVP)
- Yield generation and distribution
- Multiple token support (DAI, USDT)
- Recurring contributions
- Vault templates and categories
- Governance and DAO features

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

# Setup environment
make setup-env
# Edit .env file with your values

# Build contracts
make build

# Run tests
make test
```

### Local Development

```bash
# Start local blockchain
make anvil

# Deploy to local network (in another terminal)
make deploy-local

# Run specific tests
make test-factory  # Test factory contract
make test-vault    # Test vault contract

# Check gas usage
make test-gas
```

## 📁 Project Structure

```
goalpay-contract/
├── src/
│   ├── GoalVaultFactory.sol      # Main factory contract
│   ├── GoalVault.sol             # Individual vault contract
│   ├── MockUSDC.sol              # Test USDC token
│   ├── interfaces/
│   │   ├── IVaultFactory.sol     # Factory interface
│   │   └── IGoalVault.sol        # Vault interface
│   └── libraries/
│       └── VaultLibrary.sol      # Shared utilities
├── test/
│   ├── GoalVaultFactory.t.sol    # Factory tests
│   └── GoalVault.t.sol           # Vault tests
├── script/
│   └── Deploy.s.sol              # Deployment scripts
├── foundry.toml                  # Foundry configuration
├── Makefile                      # Development commands
└── README.md                     # This file
```

## 🔧 Contract Details

### GoalVaultFactory.sol
Main factory contract that creates and manages all vaults.

**Key Functions:**
- `createVault()` - Create new savings vault
- `generateInviteCode()` - Create shareable invite codes
- `joinVaultByInvite()` - Join vault via invite
- `getPublicVaults()` - Discover public vaults
- `getVaultsByCreator()` - Get user's vaults

### GoalVault.sol
Individual vault contract for each savings goal.

**Key Functions:**
- `addFunds()` - Contribute USDC to vault
- `joinVault()` / `leaveVault()` - Member management
- `completeVault()` - Trigger completion when goal reached
- `withdrawFunds()` - Withdraw funds if vault fails
- `getVaultDetails()` - Get complete vault information

### MockUSDC.sol
Test USDC token with faucet functionality.

**Key Functions:**
- `mint(address, amount)` - Mint tokens (owner only)
- `burn(amount)` - Burn caller's tokens
- `burnFrom(address, amount)` - Burn tokens with allowance
- Standard ERC20 functions with 6 decimals

## 🧪 Testing

```bash
# Run all tests
make test

# Run with verbose output
make test-verbose

# Generate coverage report
make test-coverage

# Run specific test files
make test-factory
make test-vault

# Check gas usage
make test-gas
```

### Test Coverage
- ✅ Vault creation and validation
- ✅ Member management (join/leave)
- ✅ Fund contributions and withdrawals
- ✅ Invite code system
- ✅ Vault completion logic
- ✅ Access control and security
- ✅ Edge cases and error handling

## 🚀 Deployment

### Local Network
```bash
# Start Anvil
make anvil

# Deploy contracts
make deploy-local
```

### Testnet (Sepolia)
```bash
# Deploy to Sepolia
make deploy-sepolia

# Verify contracts
make verify-sepolia
```

### Mainnet
```bash
# Deploy to mainnet (with confirmation)
make deploy-mainnet
```

## 🔐 Security Features

1. **Reentrancy Protection**: All state-changing functions protected
2. **Access Control**: Role-based permissions with OpenZeppelin
3. **Input Validation**: Comprehensive parameter checking
4. **Pausable**: Emergency stop functionality
5. **Custom Errors**: Gas-efficient error handling
6. **Safe Math**: Solidity 0.8+ overflow protection

## 📊 Gas Optimization

- Custom errors instead of require strings
- Efficient storage layout and packing
- Minimal external calls
- Optimized loops and conditionals
- Immutable variables where possible

## 🔗 Frontend Integration

### Contract Addresses
Update these in your frontend configuration:

```typescript
// src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  [chainId]: {
    VAULT_FACTORY: "0x...", // Deployed factory address
    USDC: "0x...",          // USDC token address
  }
};
```

### Key Events to Listen For
```typescript
// Vault creation
event VaultCreated(uint256 indexed vaultId, address indexed vaultAddress, ...);

// Fund contributions
event FundsAdded(address indexed member, uint256 amount, uint256 newTotal);

// Vault completion
event VaultCompleted(uint256 finalAmount, uint256 timestamp);
```

## 🛠️ Development Commands

```bash
# Code formatting
make format
make format-check

# Contract size analysis
make size

# Gas snapshots
make gas-snapshot

# Documentation
make docs
make docs-serve

# Security analysis (requires tools)
make slither
make mythril
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make full-test`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Run `make docs-serve` for detailed contract docs
- **Issues**: Create GitHub issues for bugs or feature requests
- **Testing**: All functions have comprehensive test coverage

## 🎯 Next Steps

1. **Deploy to testnet** and test with frontend
2. **Security audit** before mainnet deployment
3. **Implement yield strategies** for post-MVP
4. **Add governance features** for community control
5. **Multi-chain deployment** for broader access

---

**Built with ❤️ for collaborative savings and financial goals!**
