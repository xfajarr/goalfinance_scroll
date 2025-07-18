# Multi-Token Support Implementation

## Overview

The GoalFi contracts have been refactored to support multiple ERC20 tokens instead of being limited to USDC only. This enhancement provides greater flexibility for users to create savings vaults with their preferred tokens.

## Key Changes

### 1. GoalVaultFactory Updates

#### Token Registry System
```solidity
struct TokenInfo {
    string symbol;
    string name;
    uint8 decimals;
    bool isActive;
    uint256 addedAt;
}

mapping(address => TokenInfo) public supportedTokens;
address[] public tokenList;
```

#### Updated VaultInfo Structure
```solidity
struct VaultInfo {
    // ... existing fields
    address token; // Token contract address
    string tokenSymbol; // Token symbol for display
}
```

#### New Token Management Functions
- `addSupportedToken()` - Add new supported tokens (owner only)
- `removeSupportedToken()` - Remove tokens from support (owner only)
- `updateTokenStatus()` - Enable/disable tokens (owner only)
- `getSupportedTokens()` - Get list of all supported tokens
- `getTokenInfo()` - Get detailed token information
- `isTokenSupported()` - Check if token is supported and active

#### Updated createVault Function
```solidity
function createVault(
    string memory _vaultName,
    string memory _description,
    uint256 _targetAmount,
    uint256 _deadline,
    bool _isPublic,
    address _token  // New parameter
) external returns (uint256)
```

### 2. GoalVault Updates

#### Generic Token Support
- Changed from `IERC20 public immutable usdc` to `IERC20 public immutable token`
- Updated all token transfers to use the generic `token` interface
- Added `getTokenAddress()` function to retrieve vault's token

#### Updated Constructor
```solidity
constructor(
    address _token,  // Changed from _usdc
    // ... other parameters
)
```

#### Enhanced VaultDetails
```solidity
struct VaultDetails {
    // ... existing fields
    address token; // Token contract address
}
```

### 3. Interface Updates

#### IGoalVault Interface
- Added `token` field to `VaultDetails` struct
- Updated documentation to reflect generic token support

## Benefits

### 1. **Flexibility**
- Users can create vaults with any supported ERC20 token
- Support for tokens with different decimals (not just 6 like USDC)
- Easy addition of new tokens without contract redeployment

### 2. **Scalability**
- Centralized token management through the factory
- Ability to disable problematic tokens without affecting existing vaults
- Support for future token standards

### 3. **User Experience**
- Users can save in their preferred tokens
- Better integration with DeFi ecosystem
- Support for stablecoins, governance tokens, etc.

### 4. **Security**
- Token whitelist prevents malicious token usage
- Owner-controlled token addition ensures quality control
- Individual vaults remain isolated per token

## Migration Guide

### For Existing Deployments

1. **Deploy New Factory**: Deploy updated factory without initial tokens
2. **Add Supported Tokens**: Use `addSupportedToken()` to add desired tokens
3. **Update Frontend**: Modify UI to show token selection during vault creation
4. **Update Indexers**: Update event listeners for new VaultCreated event structure

### For New Deployments

1. **Deploy Factory**: `new GoalVaultFactory()`
2. **Add Initial Tokens**: 
   ```solidity
   factory.addSupportedToken(usdcAddress, "USDC", "USD Coin", 6);
   factory.addSupportedToken(daiAddress, "DAI", "Dai Stablecoin", 18);
   ```
3. **Create Vaults**: Users can now specify token in `createVault()`

## Usage Examples

### Adding a New Token
```solidity
// Owner adds USDT support
factory.addSupportedToken(
    0xdAC17F958D2ee523a2206206994597C13D831ec7, // USDT address
    "USDT",
    "Tether USD",
    6
);
```

### Creating a Vault with Specific Token
```solidity
// User creates a DAI vault
uint256 vaultId = factory.createVault(
    "Emergency Fund",
    "Building emergency savings",
    10000 * 1e18, // 10,000 DAI (18 decimals)
    block.timestamp + 365 days,
    true,
    daiAddress
);
```

### Frontend Integration
```typescript
// Get supported tokens
const supportedTokens = await factory.getSupportedTokens();

// Get token details
const tokenInfo = await factory.getTokenInfo(tokenAddress);

// Create vault with selected token
const tx = await factory.createVault(
    name,
    description,
    targetAmount,
    deadline,
    isPublic,
    selectedTokenAddress
);
```

## Security Considerations

### 1. **Token Validation**
- Only whitelisted tokens can be used
- Token contracts are validated before addition
- Malicious tokens are prevented through owner control

### 2. **Decimal Handling**
- Target amounts must account for token decimals
- Frontend should handle decimal conversion properly
- No assumptions about 6-decimal tokens

### 3. **Token Compatibility**
- Only standard ERC20 tokens should be supported
- Tokens with transfer fees may cause issues
- Rebasing tokens are not recommended

## Testing

### Unit Tests Required
- Token addition/removal functionality
- Vault creation with different tokens
- Token transfer operations
- Decimal handling across different tokens

### Integration Tests
- Multi-token vault operations
- Token switching scenarios
- Error handling for unsupported tokens

## Future Enhancements

### 1. **Token Categories**
- Categorize tokens (stablecoins, governance, etc.)
- Different rules per category
- Enhanced filtering and discovery

### 2. **Dynamic Token Discovery**
- Integration with token registries
- Automatic token metadata fetching
- Community-driven token additions

### 3. **Cross-Token Features**
- Token swapping within vaults
- Multi-token vaults
- Yield farming integration

## Conclusion

The multi-token support enhancement significantly improves GoalFi's flexibility and user experience while maintaining security and simplicity. The modular design allows for easy expansion and maintenance of supported tokens.
