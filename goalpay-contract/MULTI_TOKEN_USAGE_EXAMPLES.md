# Multi-Token Support Usage Examples

## Overview

This document provides practical examples of how to use the new multi-token support in GoalFi contracts.

## 1. Deployment and Setup

### Deploy Factory and Add Tokens

```solidity
// Deploy the factory
GoalVaultFactory factory = new GoalVaultFactory();

// Add supported tokens
factory.addSupportedToken(
    0xA0b86a33E6441b8435b662f0E2d0B8A0E6E6E6E6, // USDC
    "USDC",
    "USD Coin",
    6
);

factory.addSupportedToken(
    0x6B175474E89094C44Da98b954EedeAC495271d0F, // DAI
    "DAI", 
    "Dai Stablecoin",
    18
);

factory.addSupportedToken(
    0xdAC17F958D2ee523a2206206994597C13D831ec7, // USDT
    "USDT",
    "Tether USD", 
    6
);
```

### Check Token Support

```solidity
// Check if token is supported
bool isSupported = factory.isTokenSupported(daiAddress);

// Get token information
GoalVaultFactory.TokenInfo memory tokenInfo = factory.getTokenInfo(daiAddress);
console.log("Token:", tokenInfo.name, tokenInfo.symbol, tokenInfo.decimals);

// Get all supported tokens
address[] memory supportedTokens = factory.getSupportedTokens();
```

## 2. Creating Vaults with Different Tokens

### USDC Vault (6 decimals)

```solidity
uint256 vaultId = factory.createVault(
    "Emergency Fund",
    "Building a 6-month emergency fund",
    10000 * 1e6, // 10,000 USDC (6 decimals)
    block.timestamp + 365 days,
    true, // public
    usdcAddress
);
```

### DAI Vault (18 decimals)

```solidity
uint256 vaultId = factory.createVault(
    "Vacation Savings",
    "Saving for a European vacation",
    5000 * 1e18, // 5,000 DAI (18 decimals)
    block.timestamp + 180 days,
    false, // private
    daiAddress
);
```

### USDT Vault (6 decimals)

```solidity
uint256 vaultId = factory.createVault(
    "Car Down Payment",
    "Saving for a new car down payment",
    15000 * 1e6, // 15,000 USDT (6 decimals)
    block.timestamp + 270 days,
    true, // public
    usdtAddress
);
```

## 3. Interacting with Multi-Token Vaults

### Contributing to Different Token Vaults

```solidity
// Get vault details to check token
IGoalVault.VaultDetails memory details = vault.getVaultDetails();
address vaultToken = details.token;

// Approve and contribute based on token
if (vaultToken == daiAddress) {
    // DAI has 18 decimals
    IERC20(daiAddress).approve(address(vault), 1000 * 1e18);
    vault.addFunds(1000 * 1e18); // 1,000 DAI
} else if (vaultToken == usdcAddress) {
    // USDC has 6 decimals
    IERC20(usdcAddress).approve(address(vault), 1000 * 1e6);
    vault.addFunds(1000 * 1e6); // 1,000 USDC
}
```

### Withdrawing from Different Token Vaults

```solidity
// Withdrawal works the same regardless of token
vault.withdrawFunds(); // Automatically uses the vault's token
```

## 4. Frontend Integration Examples

### React/TypeScript Integration

```typescript
interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isActive: boolean;
}

// Get supported tokens
const getSupportedTokens = async (): Promise<TokenInfo[]> => {
  const tokenAddresses = await factory.getSupportedTokens();
  const tokens: TokenInfo[] = [];
  
  for (const address of tokenAddresses) {
    const tokenInfo = await factory.getTokenInfo(address);
    if (tokenInfo.isActive) {
      tokens.push({
        address,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        decimals: tokenInfo.decimals,
        isActive: tokenInfo.isActive
      });
    }
  }
  
  return tokens;
};

// Create vault with selected token
const createVault = async (
  name: string,
  description: string,
  targetAmount: string,
  deadline: number,
  isPublic: boolean,
  selectedToken: TokenInfo
) => {
  // Convert amount to proper decimals
  const amount = parseUnits(targetAmount, selectedToken.decimals);
  
  const tx = await factory.createVault(
    name,
    description,
    amount,
    deadline,
    isPublic,
    selectedToken.address
  );
  
  return tx;
};

// Contribute to vault
const contributeToVault = async (
  vaultAddress: string,
  amount: string
) => {
  const vault = new Contract(vaultAddress, GoalVaultABI, signer);
  const vaultDetails = await vault.getVaultDetails();
  const tokenAddress = vaultDetails.token;
  
  // Get token contract
  const token = new Contract(tokenAddress, ERC20ABI, signer);
  const decimals = await token.decimals();
  
  // Convert amount and approve
  const amountWei = parseUnits(amount, decimals);
  await token.approve(vaultAddress, amountWei);
  
  // Contribute to vault
  await vault.addFunds(amountWei);
};
```

### Token Selection Component

```tsx
interface TokenSelectorProps {
  selectedToken: TokenInfo | null;
  onTokenSelect: (token: TokenInfo) => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ 
  selectedToken, 
  onTokenSelect 
}) => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  
  useEffect(() => {
    getSupportedTokens().then(setTokens);
  }, []);
  
  return (
    <select 
      value={selectedToken?.address || ''} 
      onChange={(e) => {
        const token = tokens.find(t => t.address === e.target.value);
        if (token) onTokenSelect(token);
      }}
    >
      <option value="">Select Token</option>
      {tokens.map(token => (
        <option key={token.address} value={token.address}>
          {token.symbol} - {token.name}
        </option>
      ))}
    </select>
  );
};
```

## 5. Token Management (Owner Only)

### Adding New Tokens

```solidity
// Add a new governance token
factory.addSupportedToken(
    0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984, // UNI
    "UNI",
    "Uniswap",
    18
);
```

### Disabling Problematic Tokens

```solidity
// Temporarily disable a token
factory.updateTokenStatus(problematicTokenAddress, false);

// Re-enable when fixed
factory.updateTokenStatus(problematicTokenAddress, true);
```

### Removing Tokens

```solidity
// Permanently remove token support
factory.removeSupportedToken(oldTokenAddress);
```

## 6. Error Handling

### Common Errors and Solutions

```solidity
// Error: Token not supported
try {
    factory.createVault(name, desc, amount, deadline, true, unknownToken);
} catch {
    // Handle: Token not in supported list
    revert("Please select a supported token");
}

// Error: Token not active
try {
    factory.createVault(name, desc, amount, deadline, true, disabledToken);
} catch {
    // Handle: Token temporarily disabled
    revert("This token is temporarily unavailable");
}
```

### Frontend Error Handling

```typescript
const handleCreateVault = async () => {
  try {
    await createVault(formData);
  } catch (error: any) {
    if (error.message.includes('TokenNotSupported')) {
      setError('Selected token is not supported');
    } else if (error.message.includes('TokenNotActive')) {
      setError('Selected token is temporarily unavailable');
    } else {
      setError('Failed to create vault');
    }
  }
};
```

## 7. Migration from USDC-Only

### For Existing Users

```solidity
// Old way (USDC only)
factory.createVault(name, desc, amount, deadline, isPublic);

// New way (specify token)
factory.createVault(name, desc, amount, deadline, isPublic, usdcAddress);
```

### For Existing Vaults

```solidity
// Check what token a vault uses
address vaultToken = vault.getTokenAddress();
IGoalVault.VaultDetails memory details = vault.getVaultDetails();
address tokenFromDetails = details.token;
```

## 8. Best Practices

### Token Decimal Handling

```solidity
// Always account for token decimals
uint256 amount;
if (tokenDecimals == 6) {
    amount = targetAmount * 1e6;  // USDC, USDT
} else if (tokenDecimals == 18) {
    amount = targetAmount * 1e18; // DAI, ETH, most tokens
}
```

### Token Validation

```solidity
// Always validate token before creating vault
require(factory.isTokenSupported(tokenAddress), "Token not supported");

// Check token is active
GoalVaultFactory.TokenInfo memory info = factory.getTokenInfo(tokenAddress);
require(info.isActive, "Token not active");
```

### Gas Optimization

```solidity
// Cache token info to avoid repeated calls
GoalVaultFactory.TokenInfo memory tokenInfo = factory.getTokenInfo(tokenAddress);
// Use tokenInfo.decimals, tokenInfo.symbol, etc.
```

This multi-token support makes GoalFi much more flexible and user-friendly, allowing users to save in their preferred tokens while maintaining security and ease of use.
