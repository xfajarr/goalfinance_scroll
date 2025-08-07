# 🌰 Acorns Frontend Implementation

A complete frontend implementation for Acorns-like micro-investing features, built with React, TypeScript, and Tailwind CSS.

## 🎯 Features Implemented

### ✅ Core Components

1. **UnifiedDashboardMock** - Main dashboard combining goal savings + Acorns portfolio
2. **PurchaseTrackerMock** - Purchase tracking with real-time round-up calculation
3. **AcornsSettingsMock** - Portfolio management and settings
4. **useAcornsMock** - React hook with complete mock data and functionality

### ✅ User Experience

- **Unified Portfolio View** - See both goal savings and Acorns investments
- **Real-time Round-ups** - Instant calculation: $4.25 → $0.75 round-up
- **Portfolio Management** - Switch between Conservative (4%), Moderate (6%), Aggressive (8%)
- **Purchase History** - Complete transaction tracking with categories
- **Recurring Investments** - Set up automatic weekly/monthly investments
- **Yield Tracking** - Watch investments grow with compound interest

## 🚀 Quick Start

### 1. View the Demo

```bash
# Start the development server
npm run dev

# Navigate to the Acorns demo
http://localhost:5173/acorns-demo
```

### 2. View the Showcase

```bash
# See the marketing page comparing Goals vs Acorns
http://localhost:5173/showcase
```

## 📁 File Structure

```
src/
├── hooks/
│   ├── useAcornsMock.ts          # Mock data and functionality
│   └── useAcorns.ts              # Real smart contract integration
├── components/
│   └── dashboard/
│       ├── UnifiedDashboardMock.tsx    # Main dashboard with mock data
│       ├── PurchaseTrackerMock.tsx     # Purchase tracking modal
│       ├── AcornsSettingsMock.tsx      # Settings and portfolio management
│       ├── UnifiedDashboard.tsx        # Real smart contract version
│       ├── PurchaseTracker.tsx         # Real smart contract version
│       └── AcornsSettings.tsx          # Real smart contract version
├── pages/
│   ├── AcornsDemo.tsx            # Demo page with instructions
│   └── Showcase.tsx              # Marketing showcase page
└── components/
    └── AcornsShowcase.tsx        # Marketing component
```

## 🎮 Demo Features

### Purchase Tracking
```typescript
// Simulate a purchase
await simulatePurchase(4.25, "Starbucks Coffee");
// Result: $0.75 round-up automatically calculated
```

### Portfolio Management
```typescript
// Change portfolio type
await changePortfolio(PortfolioType.AGGRESSIVE); // 8% APY
```

### Recurring Investments
```typescript
// Set up weekly $50 investment
await setRecurringInvestment(50, 7); // $50 every 7 days
```

### Round-up Investment
```typescript
// Invest accumulated round-ups
await investRoundUps(); // Invests all pending round-ups
```

## 🔧 Integration Guide

### Switch from Mock to Real Data

1. **Replace the hook import:**
```typescript
// Change this:
import { useAcornsMock } from '@/hooks/useAcornsMock';

// To this:
import { useAcorns } from '@/hooks/useAcorns';
```

2. **Update component imports:**
```typescript
// Change this:
import { UnifiedDashboardMock } from '@/components/dashboard/UnifiedDashboardMock';

// To this:
import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard';
```

3. **Configure contract addresses:**
```typescript
// In useAcorns.ts
const ACORNS_VAULT_ADDRESS = '0x...'; // Your deployed contract address
const MOCK_MORPHO_ADDRESS = '0x...';  // Your MockMorpho address
```

### Add to Existing App

1. **Add route to your router:**
```typescript
<Route path="/acorns" element={<UnifiedDashboard />} />
```

2. **Add navigation link:**
```typescript
<Link to="/acorns" className="nav-link">
  <PiggyBank className="w-4 h-4" />
  Acorns
</Link>
```

## 🎨 UI Components Used

- **shadcn/ui** - Complete UI component library
- **Lucide React** - Icons
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Sonner** - Toast notifications

## 📊 Mock Data Structure

### User Account
```typescript
interface UserAccount {
  totalInvested: number;      // $247.83
  totalRoundUps: number;      // $89.45
  pendingRoundUps: number;    // $3.67
  accumulatedYield: number;   // $12.34
  portfolio: PortfolioType;   // MODERATE
  recurringEnabled: boolean;  // true
  recurringAmount: number;    // $50
  isRegistered: boolean;      // true
}
```

### Purchase History
```typescript
interface Purchase {
  id: string;
  amount: number;           // $4.25
  roundUpAmount: number;    // $0.75
  timestamp: Date;
  invested: boolean;        // false (pending)
  merchant: string;         // "Starbucks Coffee"
  category: string;         // "Food & Drink"
}
```

### Portfolio Stats
```typescript
interface AcornsStats {
  portfolioValue: number;     // $260.17 (invested + yield)
  totalInvested: number;      // $247.83
  totalRoundUps: number;      // $89.45
  pendingRoundUps: number;    // $3.67
  currentYield: number;       // $12.34
  portfolioType: string;      // "Moderate (6% APY)"
  purchaseCount: number;      // 6
}
```

## 🎯 User Flow

### 1. Registration
```typescript
// User selects portfolio type
await registerUser(PortfolioType.MODERATE); // 6% APY
```

### 2. Purchase Tracking
```typescript
// User tracks daily purchases
await simulatePurchase(4.25, "Coffee Shop");    // $0.75 round-up
await simulatePurchase(12.67, "Grocery Store"); // $0.33 round-up
await simulatePurchase(25.99, "Gas Station");   // $0.01 round-up
// Total pending: $1.09
```

### 3. Investment
```typescript
// User invests accumulated round-ups
await investRoundUps(); // $1.09 → Portfolio
```

### 4. Portfolio Growth
```typescript
// Automatic yield calculation
const yield = calculateYield(); // Based on portfolio APY
await claimYield(); // Add to accumulated yield
```

## 🔄 State Management

The mock implementation uses React's `useState` and `useCallback` for state management:

```typescript
const [userAccount, setUserAccount] = useState<UserAccount>(MOCK_USER_ACCOUNT);
const [purchases, setPurchases] = useState<Purchase[]>(MOCK_PURCHASES);
const [isLoading, setIsLoading] = useState(false);
```

## 🎨 Styling

### Color Scheme
- **Primary**: Purple to Pink gradient (`from-purple-600 to-pink-600`)
- **Secondary**: Blue (`blue-600`)
- **Success**: Green (`green-600`)
- **Warning**: Orange (`orange-600`)

### Responsive Design
- **Mobile-first** approach
- **Grid layouts** for cards
- **Responsive navigation**
- **Touch-friendly** buttons

## 🧪 Testing

### Manual Testing Checklist

- [ ] Register with different portfolio types
- [ ] Track purchases with various amounts
- [ ] Verify round-up calculations
- [ ] Invest round-ups and see portfolio update
- [ ] Set up recurring investments
- [ ] Change portfolio types
- [ ] Claim yields
- [ ] View purchase history
- [ ] Test responsive design

### Example Test Scenarios

1. **Round-up Calculation**
   - $4.25 → $0.75 round-up ✅
   - $12.67 → $0.33 round-up ✅
   - $25.00 → $0.00 round-up ✅

2. **Portfolio Performance**
   - Conservative: 4% APY ✅
   - Moderate: 6% APY ✅
   - Aggressive: 8% APY ✅

3. **User Experience**
   - Smooth animations ✅
   - Loading states ✅
   - Error handling ✅
   - Toast notifications ✅

## 🚀 Deployment

### Production Checklist

1. **Replace mock data** with real smart contract integration
2. **Configure contract addresses** for your network
3. **Test wallet connections** (MetaMask, WalletConnect, etc.)
4. **Verify transaction flows** end-to-end
5. **Test on mobile devices**
6. **Performance optimization**

### Environment Variables

```env
VITE_ACORNS_VAULT_ADDRESS=0x...
VITE_MOCK_MORPHO_ADDRESS=0x...
VITE_CHAIN_ID=5003
```

## 📈 Next Steps

1. **Real Smart Contract Integration** - Connect to deployed contracts
2. **Advanced Charts** - Add portfolio performance visualization
3. **Push Notifications** - Notify users of round-ups and yields
4. **Social Features** - Share achievements and milestones
5. **Advanced Analytics** - Spending insights and recommendations

---

**Ready to launch! 🚀** The Acorns frontend is fully implemented with mock data and ready for smart contract integration.
