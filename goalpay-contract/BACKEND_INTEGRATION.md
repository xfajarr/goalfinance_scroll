# MockUSDC Backend Integration Guide

This guide shows how to integrate the simple MockUSDC contract with your Hono backend for faucet functionality.

## 🎯 Contract Overview

The MockUSDC contract is a simple ERC20 token with only essential functions:

- **Owner-controlled minting** - Only contract owner can mint tokens
- **Public burning** - Anyone can burn their own tokens
- **Standard ERC20** - Full ERC20 compatibility with 6 decimals
- **No built-in faucet** - Faucet logic handled by your backend

## 📋 Contract Functions

```solidity
// Owner only - mint tokens to any address
function mint(address to, uint256 amount) external onlyOwner

// Anyone - burn their own tokens
function burn(uint256 amount) external

// Anyone - burn tokens with allowance
function burnFrom(address from, uint256 amount) external

// Standard ERC20 functions
function transfer(address to, uint256 amount) external returns (bool)
function balanceOf(address account) external view returns (uint256)
// ... other ERC20 functions
```

## 🚀 Backend Integration (Hono)

### 1. Setup Contract Connection

```typescript
// backend/src/contracts/mockUSDC.ts
import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains'; // or your target chain

const MOCK_USDC_ABI = [
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const MOCK_USDC_ADDRESS = '0x...'; // Your deployed contract address
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY!; // Contract owner's private key

// Create clients
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

const account = privateKeyToAccount(OWNER_PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http()
});

export class MockUSDCService {
  
  // Mint tokens to a user (faucet functionality)
  async mintTokens(userAddress: string, amount: string): Promise<string> {
    const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals
    
    const { request } = await publicClient.simulateContract({
      address: MOCK_USDC_ADDRESS,
      abi: MOCK_USDC_ABI,
      functionName: 'mint',
      args: [userAddress as `0x${string}`, amountInWei],
      account
    });
    
    const hash = await walletClient.writeContract(request);
    return hash;
  }
  
  // Get user's USDC balance
  async getBalance(userAddress: string): Promise<string> {
    const balance = await publicClient.readContract({
      address: MOCK_USDC_ADDRESS,
      abi: MOCK_USDC_ABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`]
    });
    
    // Convert from wei to human readable (6 decimals)
    return (Number(balance) / 1e6).toString();
  }
}
```

### 2. Faucet API Endpoints

```typescript
// backend/src/routes/faucet.ts
import { Hono } from 'hono';
import { MockUSDCService } from '../contracts/mockUSDC';

const faucet = new Hono();
const usdcService = new MockUSDCService();

// Faucet endpoint - give users test USDC
faucet.post('/claim', async (c) => {
  try {
    const { userAddress, amount = '1000' } = await c.req.json();
    
    // Validate address format
    if (!userAddress || !userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return c.json({ error: 'Invalid address format' }, 400);
    }
    
    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > 10000) {
      return c.json({ error: 'Invalid amount (max 10,000 USDC)' }, 400);
    }
    
    // Optional: Add rate limiting here
    // await checkRateLimit(userAddress);
    
    // Mint tokens
    const txHash = await usdcService.mintTokens(userAddress, amount);
    
    return c.json({
      success: true,
      txHash,
      amount,
      userAddress,
      message: `Successfully minted ${amount} USDC`
    });
    
  } catch (error) {
    console.error('Faucet error:', error);
    return c.json({ error: 'Failed to mint tokens' }, 500);
  }
});

// Check balance endpoint
faucet.get('/balance/:address', async (c) => {
  try {
    const userAddress = c.req.param('address');
    
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return c.json({ error: 'Invalid address format' }, 400);
    }
    
    const balance = await usdcService.getBalance(userAddress);
    
    return c.json({
      address: userAddress,
      balance,
      symbol: 'USDC'
    });
    
  } catch (error) {
    console.error('Balance check error:', error);
    return c.json({ error: 'Failed to get balance' }, 500);
  }
});

export default faucet;
```

### 3. Rate Limiting (Optional)

```typescript
// backend/src/middleware/rateLimit.ts
import { Context, Next } from 'hono';

interface RateLimitStore {
  [address: string]: {
    lastClaim: number;
    dailyClaims: number;
    dailyReset: number;
  }
}

const rateLimitStore: RateLimitStore = {};
const COOLDOWN_HOURS = 1; // 1 hour cooldown
const DAILY_LIMIT = 5; // 5 claims per day

export async function checkRateLimit(userAddress: string): Promise<void> {
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  
  const userLimit = rateLimitStore[userAddress];
  
  if (!userLimit) {
    rateLimitStore[userAddress] = {
      lastClaim: now,
      dailyClaims: 1,
      dailyReset: today
    };
    return;
  }
  
  // Reset daily counter if new day
  if (userLimit.dailyReset < today) {
    userLimit.dailyClaims = 0;
    userLimit.dailyReset = today;
  }
  
  // Check cooldown
  const timeSinceLastClaim = now - userLimit.lastClaim;
  const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
  
  if (timeSinceLastClaim < cooldownMs) {
    const remainingTime = Math.ceil((cooldownMs - timeSinceLastClaim) / 1000 / 60);
    throw new Error(`Cooldown active. Try again in ${remainingTime} minutes.`);
  }
  
  // Check daily limit
  if (userLimit.dailyClaims >= DAILY_LIMIT) {
    throw new Error(`Daily limit reached. Try again tomorrow.`);
  }
  
  // Update counters
  userLimit.lastClaim = now;
  userLimit.dailyClaims++;
}
```

### 4. Main App Integration

```typescript
// backend/src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import faucet from './routes/faucet';

const app = new Hono();

app.use('*', cors());

// Mount faucet routes
app.route('/api/faucet', faucet);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
```

## 🌐 Frontend Integration

```typescript
// frontend/src/services/faucet.ts
const API_BASE_URL = 'https://your-backend.com/api';

export class FaucetService {
  
  static async claimFaucet(userAddress: string, amount: string = '1000'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/faucet/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress,
        amount
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to claim faucet');
    }
    
    return response.json();
  }
  
  static async getBalance(userAddress: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/faucet/balance/${userAddress}`);
    
    if (!response.ok) {
      throw new Error('Failed to get balance');
    }
    
    return response.json();
  }
}

// Usage in React component
import { FaucetService } from '../services/faucet';

function FaucetButton({ userAddress }: { userAddress: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleClaim = async () => {
    setLoading(true);
    try {
      const result = await FaucetService.claimFaucet(userAddress, '1000');
      setMessage(`Success! TX: ${result.txHash}`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={handleClaim} disabled={loading}>
        {loading ? 'Claiming...' : 'Claim 1000 USDC'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
```

## 🔒 Security Considerations

1. **Private Key Security**: Store the owner's private key securely (environment variables, key management service)
2. **Rate Limiting**: Implement proper rate limiting to prevent abuse
3. **Input Validation**: Always validate user addresses and amounts
4. **Error Handling**: Don't expose sensitive error details to users
5. **Monitoring**: Log all faucet claims for monitoring and debugging

## 📊 Environment Variables

```bash
# .env
OWNER_PRIVATE_KEY=0x... # Contract owner's private key
RPC_URL=https://sepolia.base.org # Your RPC endpoint
MOCK_USDC_ADDRESS=0x... # Deployed contract address
```

This setup gives you full control over the faucet through your Hono backend while keeping the smart contract simple and secure!
