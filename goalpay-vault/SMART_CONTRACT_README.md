# GoalPay Smart Contracts

This directory contains the smart contracts for the GoalPay savings platform MVP.

## Core Features

The `GoalPayVault.sol` contract implements:

### ✅ Essential MVP Features
- **Create Vault**: Users can create savings goals with name, description, target amount, and deadline
- **Add Funds**: Members can contribute USDC to vaults
- **Member Management**: Track vault members and their contributions
- **Goal Completion**: Automatic completion when target is reached or deadline passes
- **Yield Distribution**: Simple yield calculation and distribution to members
- **Share Functionality**: Generate invite codes for sharing vaults
- **Public/Private Vaults**: Control vault visibility

### 🔧 Technical Features
- **USDC Integration**: Uses USDC as the savings token (6 decimals)
- **Reentrancy Protection**: Secure against reentrancy attacks
- **Access Control**: Owner functions for emergency management
- **Pausable**: Can pause contract in emergencies
- **Event Logging**: Comprehensive event emission for frontend integration

## Contract Structure

```
contracts/
├── GoalPayVault.sol      # Main vault contract
└── MockUSDC.sol          # Mock USDC for testing
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Copy the package.json content to a new package.json file
cp contracts-package.json package.json

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values:
# - PRIVATE_KEY: Your wallet private key (without 0x)
# - SEPOLIA_RPC_URL: Infura/Alchemy Sepolia endpoint
# - ETHERSCAN_API_KEY: For contract verification
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Deploy Contracts

#### Local Development
```bash
# Start local Hardhat node
npm run node

# Deploy to local network (in another terminal)
npm run deploy:local
```

#### Testnet Deployment
```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia
```

#### Mainnet Deployment
```bash
# Deploy to Ethereum mainnet
npm run deploy:mainnet
```

## Contract Addresses

After deployment, update the contract addresses in the frontend:

1. Copy the deployed contract address from the deployment output
2. Update `src/config/wagmi.ts` in the frontend with the new addresses
3. Update the `CONTRACT_ADDRESSES` object with your deployed addresses

## Key Functions

### For Users
- `createVault()`: Create a new savings vault
- `addFunds()`: Contribute to an existing vault
- `completeVault()`: Trigger vault completion (anyone can call)

### For Queries
- `getVault()`: Get vault details
- `getVaultMembers()`: Get all vault members and contributions
- `generateInviteCode()`: Get invite code for sharing

### For Admin
- `pause()/unpause()`: Emergency controls
- `emergencyWithdraw()`: Emergency fund recovery

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Custom Errors**: Gas-efficient error handling
- **Input Validation**: Comprehensive input checks
- **Access Control**: Owner-only emergency functions
- **Pausable**: Can halt operations if needed

## Integration with Frontend

The contracts are designed to work seamlessly with the existing frontend:

1. **Vault Creation**: Maps to the "Create Vault" page
2. **Add Funds**: Integrates with the AddFundsDialog component
3. **Share Vault**: Works with ShareVaultDialog for invite codes
4. **Member Display**: Provides data for vault member lists
5. **Progress Tracking**: Real-time vault progress updates

## Testing

```bash
# Run tests (when test files are created)
npm run test

# Check contract sizes
npm run size

# Generate coverage report
npm run coverage
```

## Gas Optimization

The contracts are optimized for gas efficiency:
- Uses custom errors instead of require strings
- Efficient storage layout
- Minimal external calls
- Batch operations where possible

## Yield Integration

The current implementation includes a simplified yield mechanism. For production, integrate with:
- **Compound**: Lending protocol for USDC yield
- **Aave**: Alternative lending protocol
- **Yearn**: Yield aggregation protocol
- **Custom Strategy**: Your own yield generation logic

## Next Steps for Production

1. **Comprehensive Testing**: Add full test suite
2. **Audit**: Professional security audit
3. **Yield Integration**: Connect to real yield protocols
4. **Governance**: Add DAO governance for parameters
5. **Multi-token Support**: Support for other stablecoins
6. **Advanced Features**: Recurring contributions, vault templates, etc.

## Support

For questions or issues with the smart contracts, please refer to:
- Hardhat documentation: https://hardhat.org/
- OpenZeppelin contracts: https://docs.openzeppelin.com/
- Solidity documentation: https://docs.soliditylang.org/
