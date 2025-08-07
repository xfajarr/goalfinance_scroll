import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';
import { scrollSepolia } from 'wagmi/chains';
import { ACORNS_VAULT_CONTRACT, MOCK_MORPHO_CONTRACT, PortfolioType } from '@/config/contracts';

// Re-export PortfolioType for convenience
export { PortfolioType };
import { queryUserRegistration, queryUserPurchases, queryUserInvestments, queryPortfolioActivity } from '@/lib/graphql';

// Contract addresses from configuration
const ACORNS_VAULT_ADDRESS = ACORNS_VAULT_CONTRACT.address;
const MOCK_MORPHO_ADDRESS = MOCK_MORPHO_CONTRACT.address;

// Import ABIs from configuration
const AcornsVaultABI = ACORNS_VAULT_CONTRACT.abi;
const MockMorphoABI = MOCK_MORPHO_CONTRACT.abi;

// PortfolioType is imported from contracts configuration

export interface UserAccount {
  totalInvested: bigint;
  totalRoundUps: bigint;
  pendingRoundUps: bigint;
  lastYieldClaim: bigint;
  accumulatedYield: bigint;
  portfolio: PortfolioType;
  recurringEnabled: boolean;
  recurringAmount: bigint;
  recurringInterval: bigint;
  nextRecurringDate: bigint;
  isRegistered: boolean;
}

export interface Purchase {
  amount: bigint;
  roundUpAmount: bigint;
  timestamp: bigint;
  invested: boolean;
  merchant: string;
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

export const useAcorns = () => {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read user account data
  const { data: userAccount, refetch: refetchAccount } = useReadContract({
    address: ACORNS_VAULT_ADDRESS,
    abi: AcornsVaultABI,
    functionName: 'getUserAccount',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read portfolio value
  const { data: portfolioValue, refetch: refetchPortfolio } = useReadContract({
    address: ACORNS_VAULT_ADDRESS,
    abi: AcornsVaultABI,
    functionName: 'getPortfolioValue',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read pending round-ups
  const { data: pendingRoundUps, refetch: refetchPending } = useReadContract({
    address: ACORNS_VAULT_ADDRESS,
    abi: AcornsVaultABI,
    functionName: 'getPendingRoundUps',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read current yield
  const { data: currentYield, refetch: refetchYield } = useReadContract({
    address: ACORNS_VAULT_ADDRESS,
    abi: AcornsVaultABI,
    functionName: 'calculateYield',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read user purchases
  const { data: userPurchases, refetch: refetchPurchases } = useReadContract({
    address: ACORNS_VAULT_ADDRESS,
    abi: AcornsVaultABI,
    functionName: 'getUserPurchases',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Register user with portfolio type
  const registerUser = useCallback(async (portfolioType: PortfolioType) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: AcornsVaultABI,
        functionName: 'registerUser',
        args: [portfolioType],
        chain: scrollSepolia,
        account: address,
      });

      toast.success('🎯 Acorns account registered successfully!');
      await refetchAccount();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
      toast.error('Failed to register Acorns account');
    } finally {
      setIsLoading(false);
    }
  }, [address, writeContract, refetchAccount]);

  // Simulate a purchase and calculate round-up
  const simulatePurchase = useCallback(async (amount: number, merchant: string) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const amountWei = parseUnits(amount.toString(), 6); // USDC decimals

      writeContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: AcornsVaultABI,
        functionName: 'simulatePurchase',
        args: [amountWei, merchant],
        chain: scrollSepolia,
        account: address,
      });

      toast.success(`🛒 Purchase recorded: $${amount} at ${merchant}`);
      await Promise.all([refetchPending(), refetchPurchases()]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record purchase';
      setError(errorMessage);
      toast.error('Failed to record purchase');
    } finally {
      setIsLoading(false);
    }
  }, [address, writeContract, refetchPending, refetchPurchases]);

  // Invest accumulated round-ups
  const investRoundUps = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: AcornsVaultABI,
        functionName: 'investRoundUps',
        chain: scrollSepolia,
        account: address,
      });

      toast.success('💰 Round-ups invested successfully!');
      await Promise.all([refetchAccount(), refetchPortfolio(), refetchPending()]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invest round-ups';
      setError(errorMessage);
      toast.error('Failed to invest round-ups');
    } finally {
      setIsLoading(false);
    }
  }, [address, writeContract, refetchAccount, refetchPortfolio, refetchPending]);

  // Set up recurring investment
  const setRecurringInvestment = useCallback(async (amount: number, intervalDays: number) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const amountWei = parseUnits(amount.toString(), 6);

      writeContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: AcornsVaultABI,
        functionName: 'setRecurringInvestment',
        args: [amountWei, intervalDays],
        chain: scrollSepolia,
        account: address,
      });

      toast.success(`🔄 Recurring investment set: $${amount} every ${intervalDays} days`);
      await refetchAccount();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set recurring investment';
      setError(errorMessage);
      toast.error('Failed to set recurring investment');
    } finally {
      setIsLoading(false);
    }
  }, [address, writeContract, refetchAccount]);

  // Claim accumulated yield
  const claimYield = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: AcornsVaultABI,
        functionName: 'claimYield',
        chain: scrollSepolia,
        account: address,
      });

      toast.success('🎁 Yield claimed successfully!');
      await Promise.all([refetchAccount(), refetchPortfolio(), refetchYield()]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim yield';
      setError(errorMessage);
      toast.error('Failed to claim yield');
    } finally {
      setIsLoading(false);
    }
  }, [address, writeContract, refetchAccount, refetchPortfolio, refetchYield]);

  // Change portfolio type
  const changePortfolio = useCallback(async (newPortfolioType: PortfolioType) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: AcornsVaultABI,
        functionName: 'changePortfolio',
        args: [newPortfolioType],
        chain: scrollSepolia,
        account: address,
      });

      toast.success('📊 Portfolio changed successfully!');
      await refetchAccount();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change portfolio';
      setError(errorMessage);
      toast.error('Failed to change portfolio');
    } finally {
      setIsLoading(false);
    }
  }, [address, writeContract, refetchAccount]);

  // Calculate round-up for a given amount
  const calculateRoundUp = useCallback((amount: number): number => {
    const dollars = Math.floor(amount);
    const cents = amount - dollars;
    
    if (cents === 0) return 0;
    return 1 - cents;
  }, []);

  // Get formatted stats
  const getStats = useCallback((): AcornsStats | null => {
    if (!userAccount || !portfolioValue) return null;

    const account = userAccount as UserAccount;
    const purchases = (userPurchases as Purchase[]) || [];

    const portfolioNames = ['Conservative (4% APY)', 'Moderate (6% APY)', 'Aggressive (8% APY)'];

    return {
      portfolioValue: parseFloat(formatUnits(portfolioValue as bigint, 6)),
      totalInvested: parseFloat(formatUnits(account.totalInvested, 6)),
      totalRoundUps: parseFloat(formatUnits(account.totalRoundUps, 6)),
      pendingRoundUps: parseFloat(formatUnits(pendingRoundUps as bigint || 0n, 6)),
      currentYield: parseFloat(formatUnits(currentYield as bigint || 0n, 6)),
      portfolioType: portfolioNames[account.portfolio],
      recurringEnabled: account.recurringEnabled,
      recurringAmount: parseFloat(formatUnits(account.recurringAmount, 6)),
      purchaseCount: purchases.length,
    };
  }, [userAccount, portfolioValue, pendingRoundUps, currentYield, userPurchases]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      refetchAccount(),
      refetchPortfolio(),
      refetchPending(),
      refetchYield(),
      refetchPurchases(),
    ]);
  }, [refetchAccount, refetchPortfolio, refetchPending, refetchYield, refetchPurchases]);

  return {
    // Data
    userAccount: userAccount as UserAccount | undefined,
    stats: getStats(),
    purchases: userPurchases as Purchase[] | undefined,
    
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
