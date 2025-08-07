import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export enum PortfolioType {
  CONSERVATIVE = 0,
  MODERATE = 1,
  AGGRESSIVE = 2,
}

export interface UserAccount {
  totalInvested: number;
  totalRoundUps: number;
  pendingRoundUps: number;
  lastYieldClaim: Date;
  accumulatedYield: number;
  portfolio: PortfolioType;
  recurringEnabled: boolean;
  recurringAmount: number;
  recurringInterval: number;
  nextRecurringDate: Date;
  isRegistered: boolean;
}

export interface Purchase {
  id: string;
  amount: number;
  roundUpAmount: number;
  timestamp: Date;
  invested: boolean;
  merchant: string;
  category: string;
}

export interface AcornsStats {
  portfolioValue: number;
  totalInvested: number;
  totalRoundUps: number;
  pendingRoundUps: number;
  currentYield: number;
  portfolioType: string;
  recurringEnabled: boolean;
  recurringAmount: number;
  purchaseCount: number;
}

// Mock data
const MOCK_USER_ACCOUNT: UserAccount = {
  totalInvested: 247.83,
  totalRoundUps: 89.45,
  pendingRoundUps: 3.67,
  lastYieldClaim: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  accumulatedYield: 12.34,
  portfolio: PortfolioType.MODERATE,
  recurringEnabled: true,
  recurringAmount: 50,
  recurringInterval: 7, // days
  nextRecurringDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  isRegistered: true,
};

const MOCK_PURCHASES: Purchase[] = [
  {
    id: '1',
    amount: 4.25,
    roundUpAmount: 0.75,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    invested: false,
    merchant: 'Starbucks Coffee',
    category: 'Food & Drink',
  },
  {
    id: '2',
    amount: 12.67,
    roundUpAmount: 0.33,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    invested: false,
    merchant: 'Whole Foods Market',
    category: 'Groceries',
  },
  {
    id: '3',
    amount: 25.99,
    roundUpAmount: 0.01,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    invested: false,
    merchant: 'Shell Gas Station',
    category: 'Transportation',
  },
  {
    id: '4',
    amount: 8.50,
    roundUpAmount: 0.50,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    invested: true,
    merchant: 'Chipotle Mexican Grill',
    category: 'Food & Drink',
  },
  {
    id: '5',
    amount: 15.30,
    roundUpAmount: 0.70,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    invested: true,
    merchant: 'CVS Pharmacy',
    category: 'Health',
  },
  {
    id: '6',
    amount: 45.00,
    roundUpAmount: 0.00,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    invested: true,
    merchant: 'Electric Bill Payment',
    category: 'Utilities',
  },
];

export const useAcornsMock = () => {
  const [userAccount, setUserAccount] = useState<UserAccount>(MOCK_USER_ACCOUNT);
  const [purchases, setPurchases] = useState<Purchase[]>(MOCK_PURCHASES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register user with portfolio type
  const registerUser = useCallback(async (portfolioType: PortfolioType) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUserAccount(prev => ({
        ...prev,
        portfolio: portfolioType,
        isRegistered: true,
      }));

      const portfolioNames = ['Conservative', 'Moderate', 'Aggressive'];
      toast.success(`🎯 Acorns account registered with ${portfolioNames[portfolioType]} portfolio!`);
    } catch (err) {
      const errorMessage = 'Failed to register Acorns account';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Simulate a purchase and calculate round-up
  const simulatePurchase = useCallback(async (amount: number, merchant: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const roundUpAmount = calculateRoundUp(amount);
      const newPurchase: Purchase = {
        id: Date.now().toString(),
        amount,
        roundUpAmount,
        timestamp: new Date(),
        invested: false,
        merchant,
        category: getCategoryFromMerchant(merchant),
      };

      setPurchases(prev => [newPurchase, ...prev]);
      setUserAccount(prev => ({
        ...prev,
        pendingRoundUps: prev.pendingRoundUps + roundUpAmount,
      }));

      toast.success(`🛒 Purchase recorded: $${amount.toFixed(2)} at ${merchant}`);
    } catch (err) {
      const errorMessage = 'Failed to record purchase';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Invest accumulated round-ups
  const investRoundUps = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pendingAmount = userAccount.pendingRoundUps;
      
      setUserAccount(prev => ({
        ...prev,
        pendingRoundUps: 0,
        totalRoundUps: prev.totalRoundUps + pendingAmount,
        totalInvested: prev.totalInvested + pendingAmount,
      }));

      // Mark pending purchases as invested
      setPurchases(prev => prev.map(purchase => 
        !purchase.invested && purchase.roundUpAmount > 0
          ? { ...purchase, invested: true }
          : purchase
      ));

      toast.success(`💰 Invested $${pendingAmount.toFixed(2)} in round-ups!`);
    } catch (err) {
      const errorMessage = 'Failed to invest round-ups';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userAccount.pendingRoundUps]);

  // Set up recurring investment
  const setRecurringInvestment = useCallback(async (amount: number, intervalDays: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setUserAccount(prev => ({
        ...prev,
        recurringEnabled: true,
        recurringAmount: amount,
        recurringInterval: intervalDays,
        nextRecurringDate: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000),
      }));

      toast.success(`🔄 Recurring investment set: $${amount} every ${intervalDays} days`);
    } catch (err) {
      const errorMessage = 'Failed to set recurring investment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Claim accumulated yield
  const claimYield = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const yieldAmount = calculateCurrentYield();
      
      setUserAccount(prev => ({
        ...prev,
        accumulatedYield: prev.accumulatedYield + yieldAmount,
        lastYieldClaim: new Date(),
      }));

      toast.success(`🎁 Claimed $${yieldAmount.toFixed(4)} in yield!`);
    } catch (err) {
      const errorMessage = 'Failed to claim yield';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Change portfolio type
  const changePortfolio = useCallback(async (newPortfolioType: PortfolioType) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setUserAccount(prev => ({
        ...prev,
        portfolio: newPortfolioType,
      }));

      const portfolioNames = ['Conservative', 'Moderate', 'Aggressive'];
      toast.success(`📊 Portfolio changed to ${portfolioNames[newPortfolioType]}!`);
    } catch (err) {
      const errorMessage = 'Failed to change portfolio';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate round-up for a given amount
  const calculateRoundUp = useCallback((amount: number): number => {
    const dollars = Math.floor(amount);
    const cents = amount - dollars;
    
    if (cents === 0) return 0;
    return 1 - cents;
  }, []);

  // Calculate current yield based on time elapsed
  const calculateCurrentYield = useCallback((): number => {
    const daysSinceLastClaim = Math.floor(
      (Date.now() - userAccount.lastYieldClaim.getTime()) / (24 * 60 * 60 * 1000)
    );
    
    const apyRates = [0.04, 0.06, 0.08]; // 4%, 6%, 8%
    const apy = apyRates[userAccount.portfolio];
    const dailyRate = apy / 365;
    
    return userAccount.totalInvested * dailyRate * daysSinceLastClaim;
  }, [userAccount]);

  // Get category from merchant name
  const getCategoryFromMerchant = (merchant: string): string => {
    const merchantLower = merchant.toLowerCase();
    
    if (merchantLower.includes('coffee') || merchantLower.includes('starbucks') || 
        merchantLower.includes('restaurant') || merchantLower.includes('chipotle')) {
      return 'Food & Drink';
    }
    if (merchantLower.includes('grocery') || merchantLower.includes('market') || 
        merchantLower.includes('whole foods')) {
      return 'Groceries';
    }
    if (merchantLower.includes('gas') || merchantLower.includes('shell') || 
        merchantLower.includes('exxon')) {
      return 'Transportation';
    }
    if (merchantLower.includes('pharmacy') || merchantLower.includes('cvs') || 
        merchantLower.includes('walgreens')) {
      return 'Health';
    }
    if (merchantLower.includes('bill') || merchantLower.includes('electric') || 
        merchantLower.includes('utility')) {
      return 'Utilities';
    }
    
    return 'Shopping';
  };

  // Get formatted stats
  const getStats = useCallback((): AcornsStats => {
    const portfolioNames = ['Conservative (4% APY)', 'Moderate (6% APY)', 'Aggressive (8% APY)'];
    const currentYield = calculateCurrentYield();
    const portfolioValue = userAccount.totalInvested + userAccount.accumulatedYield + currentYield;

    return {
      portfolioValue,
      totalInvested: userAccount.totalInvested,
      totalRoundUps: userAccount.totalRoundUps,
      pendingRoundUps: userAccount.pendingRoundUps,
      currentYield,
      portfolioType: portfolioNames[userAccount.portfolio],
      recurringEnabled: userAccount.recurringEnabled,
      recurringAmount: userAccount.recurringAmount,
      purchaseCount: purchases.length,
    };
  }, [userAccount, purchases.length, calculateCurrentYield]);

  // Refresh all data (mock - just recalculate)
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  }, []);

  return {
    // Data
    userAccount,
    stats: getStats(),
    purchases,
    
    // State
    isLoading,
    error,
    
    // Actions
    registerUser,
    simulatePurchase,
    investRoundUps,
    setRecurringInvestment,
    claimYield,
    changePortfolio,
    calculateRoundUp,
    refreshData,
  };
};
