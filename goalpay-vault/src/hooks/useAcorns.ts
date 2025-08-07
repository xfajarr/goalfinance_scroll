import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
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
  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingOperation, setPendingOperation] = useState<string | null>(null);



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



  // Handle transaction confirmation success
  // Temporarily disabled to debug error
  /*
  useEffect(() => {
    if (isConfirmed && pendingOperation) {
      try {
        const operation = pendingOperation;
        setPendingOperation(null);
        setIsLoading(false);

        switch (operation) {
          case 'registerUser':
            toast.success('🎯 Acorns account registered successfully!');
            if (refetchAccount) refetchAccount().catch(console.error);
            break;
          case 'simulatePurchase':
            toast.success('🛒 Purchase recorded successfully!');
            Promise.all([
              refetchPending?.() || Promise.resolve(),
              refetchPurchases?.() || Promise.resolve()
            ]).catch(console.error);
            break;
          case 'investRoundUps':
            toast.success('💰 Round-ups invested successfully!');
            Promise.all([
              refetchAccount?.() || Promise.resolve(),
              refetchPortfolio?.() || Promise.resolve(),
              refetchPending?.() || Promise.resolve()
            ]).catch(console.error);
            break;
          case 'setRecurringInvestment':
            toast.success('🔄 Recurring investment set successfully!');
            if (refetchAccount) refetchAccount().catch(console.error);
            break;
          case 'claimYield':
            toast.success('🎁 Yield claimed successfully!');
            Promise.all([
              refetchAccount?.() || Promise.resolve(),
              refetchPortfolio?.() || Promise.resolve(),
              refetchYield?.() || Promise.resolve()
            ]).catch(console.error);
            break;
          case 'changePortfolio':
            toast.success('📊 Portfolio changed successfully!');
            if (refetchAccount) refetchAccount().catch(console.error);
            break;
        }
      } catch (error) {
        console.error('Error in transaction confirmation handler:', error);
      }
    }
  }, [isConfirmed, pendingOperation]);
  */

  // Handle transaction errors
  // Temporarily disabled to debug error
  /*
  useEffect(() => {
    try {
      const combinedError = writeError || confirmError;
      if (combinedError) {
        setError(combinedError.message || 'Transaction failed');
        setIsLoading(false);
        setPendingOperation(null);

        if (pendingOperation) {
          switch (pendingOperation) {
            case 'registerUser':
              toast.error('Failed to register Acorns account');
              break;
            case 'simulatePurchase':
              toast.error('Failed to record purchase');
              break;
            case 'investRoundUps':
              toast.error('Failed to invest round-ups');
              break;
            case 'setRecurringInvestment':
              toast.error('Failed to set recurring investment');
              break;
            case 'claimYield':
              toast.error('Failed to claim yield');
              break;
            case 'changePortfolio':
              toast.error('Failed to change portfolio');
              break;
          }
        }
      }
    } catch (error) {
      console.error('Error in transaction error handler:', error);
    }
  }, [writeError, confirmError, pendingOperation]);
  */

  // Register user with portfolio type
  const registerUser = useCallback(async (portfolioType: PortfolioType) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setPendingOperation('registerUser');

    try {
      writeContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: AcornsVaultABI,
        functionName: 'registerUser',
        args: [portfolioType],
        chain: scrollSepolia,
        account: address,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
      toast.error('Failed to register Acorns account');
      setIsLoading(false);
      setPendingOperation(null);
    }
  }, [address, writeContract]);

  // Simulate a purchase and calculate round-up
  const simulatePurchase = useCallback(async (amount: number, merchant: string) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setPendingOperation('simulatePurchase');

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record purchase';
      setError(errorMessage);
      toast.error('Failed to record purchase');
      setIsLoading(false);
      setPendingOperation(null);
    }
  }, [address, writeContract]);

  // Invest accumulated round-ups
  const investRoundUps = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setPendingOperation('investRoundUps');

    try {
      writeContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: AcornsVaultABI,
        functionName: 'investRoundUps',
        chain: scrollSepolia,
        account: address,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invest round-ups';
      setError(errorMessage);
      toast.error('Failed to invest round-ups');
      setIsLoading(false);
      setPendingOperation(null);
    }
  }, [address, writeContract]);

  // Set up recurring investment
  const setRecurringInvestment = useCallback(async (amount: number, intervalDays: number) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setPendingOperation('setRecurringInvestment');

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set recurring investment';
      setError(errorMessage);
      toast.error('Failed to set recurring investment');
      setIsLoading(false);
      setPendingOperation(null);
    }
  }, [address, writeContract]);

  // Claim accumulated yield
  const claimYield = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setPendingOperation('claimYield');

    try {
      writeContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: AcornsVaultABI,
        functionName: 'claimYield',
        chain: scrollSepolia,
        account: address,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim yield';
      setError(errorMessage);
      toast.error('Failed to claim yield');
      setIsLoading(false);
      setPendingOperation(null);
    }
  }, [address, writeContract]);

  // Change portfolio type
  const changePortfolio = useCallback(async (newPortfolioType: PortfolioType) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setPendingOperation('changePortfolio');

    try {
      writeContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: AcornsVaultABI,
        functionName: 'changePortfolio',
        args: [newPortfolioType],
        chain: scrollSepolia,
        account: address,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change portfolio';
      setError(errorMessage);
      toast.error('Failed to change portfolio');
      setIsLoading(false);
      setPendingOperation(null);
    }
  }, [address, writeContract]);

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
      portfolioValue: Number(portfolioValue) / 1e6,
      totalInvested: Number(account.totalInvested) / 1e6,
      totalRoundUps: Number(account.totalRoundUps) / 1e6,
      pendingRoundUps: Number(pendingRoundUps || 0n) / 1e6,
      currentYield: Number(currentYield || 0n) / 1e6,
      portfolioType: portfolioNames[account.portfolio],
      recurringEnabled: account.recurringEnabled,
      recurringAmount: Number(account.recurringAmount) / 1e6,
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

  // Handle transaction confirmation success
  useEffect(() => {
    if (isConfirmed && pendingOperation) {
      const operation = pendingOperation;
      setPendingOperation(null);
      setIsLoading(false);

      // Show success toast based on operation
      switch (operation) {
        case 'registerUser':
          toast.success('🎯 Acorns account registered successfully!');
          break;
        case 'simulatePurchase':
          toast.success('🛒 Purchase recorded successfully!');
          break;
        case 'investRoundUps':
          toast.success('💰 Round-ups invested successfully!');
          break;
        case 'setRecurringInvestment':
          toast.success('🔄 Recurring investment set successfully!');
          break;
        case 'claimYield':
          toast.success('🎁 Yield claimed successfully!');
          break;
        case 'changePortfolio':
          toast.success('📊 Portfolio changed successfully!');
          break;
      }

      // Refresh data after successful transaction
      refreshData().catch(console.error);
    }
  }, [isConfirmed, pendingOperation, refreshData]);

  // Handle transaction errors
  useEffect(() => {
    const combinedError = writeError || confirmError;
    if (combinedError && pendingOperation) {
      setError(combinedError.message || 'Transaction failed');
      setIsLoading(false);
      setPendingOperation(null);

      // Show error toast based on operation
      switch (pendingOperation) {
        case 'registerUser':
          toast.error('Failed to register Acorns account');
          break;
        case 'simulatePurchase':
          toast.error('Failed to record purchase');
          break;
        case 'investRoundUps':
          toast.error('Failed to invest round-ups');
          break;
        case 'setRecurringInvestment':
          toast.error('Failed to set recurring investment');
          break;
        case 'claimYield':
          toast.error('Failed to claim yield');
          break;
        case 'changePortfolio':
          toast.error('Failed to change portfolio');
          break;
      }
    }
  }, [writeError, confirmError, pendingOperation]);

  return {
    // Data
    userAccount: userAccount as UserAccount | undefined,
    stats: getStats(),
    purchases: userPurchases as Purchase[] | undefined,
    
    // State
    isLoading: isLoading || isWritePending || isConfirming,
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
