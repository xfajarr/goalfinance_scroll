# 🚀 Deploy GoalFinance + Acorns Contracts to Scroll Sepolia

Complete guide to deploy the full GoalFinance platform (collaborative savings + micro-investing) to Scroll Sepolia testnet.

## 📋 Prerequisites

### 1. **Setup Environment**

Create a `.env` file in the `goalpay-contract` directory:

```bash
# Copy from example
cp .env.example .env
```

### 2. **Configure Environment Variables**

Edit `.env` file with your details:

```env
# Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Scroll Sepolia RPC URL
SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io

# Optional: Scrollscan API key for verification
SCROLLSCAN_API_KEY=your_scrollscan_api_key
```

### 3. **Get Scroll Sepolia ETH**

You need ETH on Scroll Sepolia for gas fees:

- **Scroll Sepolia Faucet**: https://sepolia.scroll.io/faucet
- **Bridge from Sepolia**: https://sepolia.scroll.io/bridge
- **Alternative Faucets**: 
  - https://faucet.quicknode.com/scroll/sepolia
  - https://www.alchemy.com/faucets/scroll-sepolia

**Minimum Required**: ~0.01 ETH for deployment

### 4. **Verify Setup**

Check your wallet balance:

```bash
cast balance YOUR_ADDRESS --rpc-url https://sepolia-rpc.scroll.io
```

## 🛠️ Deployment Steps

### Step 1: **Install Dependencies**

```bash
cd goalpay-contract

# Install Foundry dependencies
forge install

# Build contracts
forge build
```

### Step 2: **Run Tests (Optional)**

```bash
# Run all tests
forge test

# Run Acorns-specific tests
forge test --match-contract AcornsVaultTest -vvv
```

### Step 3: **Deploy to Scroll Sepolia**

```bash
# Deploy all GoalFinance + Acorns contracts
forge script script/DeployScrollSepolia.s.sol:DeployScrollSepolia \
  --rpc-url scroll_sepolia \
  --broadcast \
  --verify \
  -vvvv
```

**Expected Output:**
```
=== Deploying GoalFinance + Acorns Contracts to Scroll Sepolia ===
Deployer: 0x...
Chain ID: 534351
Balance: 0.05 ETH

--- Step 1: Deploying Mock Tokens ---
MockUSDC deployed: 0x...
MockUSDT deployed: 0x...
MockDAI deployed: 0x...

--- Step 2: Deploying GoalFinance ---
GoalFinance deployed: 0x...

--- Step 3: Deploying MockMorpho ---
MockMorpho deployed: 0x...
Created markets for USDC, USDT, and DAI

--- Step 4: Deploying AcornsVault ---
AcornsVault deployed: 0x...

--- Step 5: Configuring Integrations ---
Configured supported tokens in AcornsVault
Authorized AcornsVault in MockMorpho

--- Step 6: Setting up Initial Data ---
Created sample goal vault: Emergency Fund
Registered deployer as Acorns test user
Added sample Acorns purchases
Set up recurring investment: $50 weekly

=== Deployment Complete! ===
Save these addresses for frontend integration:
GoalFinance: 0x...
AcornsVault: 0x...
MockMorpho: 0x...
MockUSDC: 0x...
MockUSDT: 0x...
MockDAI: 0x...
```

### Step 4: **Save Contract Addresses**

Copy the deployed contract addresses and save them. You'll need these for frontend integration.

## 🔍 Verification (Optional)

If verification didn't work during deployment, verify manually:

```bash
# Verify AcornsVault
forge verify-contract 0xYOUR_ACORNS_VAULT_ADDRESS \
  src/AcornsVault.sol:AcornsVault \
  --chain scroll_sepolia

# Verify MockMorpho
forge verify-contract 0xYOUR_MOCK_MORPHO_ADDRESS \
  src/MockMorpho.sol:MockMorpho \
  --chain scroll_sepolia

# Verify MockUSDC
forge verify-contract 0xYOUR_MOCK_USDC_ADDRESS \
  src/MockUSDC.sol:MockUSDC \
  --chain scroll_sepolia \
  --constructor-args $(cast abi-encode "constructor(uint256)" 1000000000000)
```

## 🧪 Testing Deployment

### 1. **Test Faucet Functionality**

```bash
# Claim USDC from faucet
cast send 0xYOUR_MOCK_USDC_ADDRESS \
  "claimFromFaucet()" \
  --rpc-url scroll_sepolia \
  --private-key $PRIVATE_KEY

# Check balance
cast call 0xYOUR_MOCK_USDC_ADDRESS \
  "balanceOf(address)(uint256)" \
  YOUR_ADDRESS \
  --rpc-url scroll_sepolia
```

### 2. **Test Acorns Registration**

```bash
# Register with moderate portfolio (portfolio type 1)
cast send 0xYOUR_ACORNS_VAULT_ADDRESS \
  "registerUser(uint8)" \
  1 \
  --rpc-url scroll_sepolia \
  --private-key $PRIVATE_KEY
```

### 3. **Test Purchase Simulation**

```bash
# Simulate a $4.25 purchase (4.25 * 1e6 = 4250000)
cast send 0xYOUR_ACORNS_VAULT_ADDRESS \
  "simulatePurchase(uint256,string)" \
  4250000 \
  "Coffee Shop" \
  --rpc-url scroll_sepolia \
  --private-key $PRIVATE_KEY
```

## 🔗 Frontend Integration

### Update Contract Addresses

Update your frontend configuration with the deployed addresses:

```typescript
// In your frontend config
export const CONTRACT_ADDRESSES = {
  534351: { // Scroll Sepolia Chain ID
    ACORNS_VAULT: "0xYOUR_ACORNS_VAULT_ADDRESS",
    MOCK_MORPHO: "0xYOUR_MOCK_MORPHO_ADDRESS",
    MOCK_USDC: "0xYOUR_MOCK_USDC_ADDRESS",
    MOCK_USDT: "0xYOUR_MOCK_USDT_ADDRESS",
    MOCK_DAI: "0xYOUR_MOCK_DAI_ADDRESS",
  }
};
```

### Switch from Mock to Real Data

In your frontend hooks, change from mock to real:

```typescript
// Change from:
import { useAcornsMock } from '@/hooks/useAcornsMock';

// To:
import { useAcorns } from '@/hooks/useAcorns';
```

## 📊 Contract Features

### **AcornsVault Contract**
- ✅ User registration with portfolio selection
- ✅ Purchase simulation and round-up calculation
- ✅ Round-up investment functionality
- ✅ Recurring investment setup
- ✅ Portfolio management (Conservative/Moderate/Aggressive)
- ✅ Yield calculation and claiming
- ✅ Multi-token support (USDC, USDT, DAI)

### **MockMorpho Contract**
- ✅ Yield generation for deposits
- ✅ Market creation for different tokens
- ✅ Interest calculation and compounding
- ✅ Supply and withdrawal functionality

### **Mock Token Contracts**
- ✅ ERC20 functionality
- ✅ Faucet for testing (1000 tokens per day)
- ✅ Mint and burn capabilities
- ✅ Standard decimals (6 for USDC/USDT, 18 for DAI)

## 🎯 Next Steps

1. **Test in Frontend**: Use the deployed contracts with your frontend
2. **Get Test Tokens**: Use faucets to get test tokens
3. **Test User Flow**: Register → Track Purchases → Invest Round-ups
4. **Monitor Transactions**: Check on Scrollscan: https://sepolia.scrollscan.com/

## 🔧 Troubleshooting

### **Common Issues:**

**1. Insufficient Gas**
```bash
# Check balance
cast balance YOUR_ADDRESS --rpc-url scroll_sepolia

# Get more ETH from faucet
```

**2. RPC Issues**
```bash
# Try alternative RPC
SCROLL_SEPOLIA_RPC_URL=https://scroll-sepolia.drpc.org
```

**3. Verification Failed**
```bash
# Verify manually after deployment
forge verify-contract ADDRESS CONTRACT_PATH --chain scroll_sepolia
```

**4. Transaction Failed**
```bash
# Check transaction on Scrollscan
https://sepolia.scrollscan.com/tx/YOUR_TX_HASH
```

## 📝 Deployment Checklist

- [ ] Environment variables configured
- [ ] Sufficient ETH balance (>0.01 ETH)
- [ ] Contracts compiled successfully
- [ ] Tests passing
- [ ] Deployment script executed
- [ ] Contract addresses saved
- [ ] Verification completed (optional)
- [ ] Faucet functionality tested
- [ ] Frontend addresses updated
- [ ] End-to-end testing completed

---

**🎉 Congratulations!** Your Acorns contracts are now deployed on Scroll Sepolia and ready for testing!
