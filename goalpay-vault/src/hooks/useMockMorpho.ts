import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, Address } from 'viem';
import { toast } from 'sonner';
import { scrollSepolia } from 'wagmi/chains';
import { MOCK_MORPHO_CONTRACT, ACORNS_VAULT_CONTRACT } from '@/config/contracts';

// Contract addresses from configuration
const MOCK_MORPHO_ADDRESS = MOCK_MORPHO_CONTRACT.address;
const ACORNS_VAULT_ADDRESS = ACORNS_VAULT_CONTRACT.address;

// Import ABIs from configuration
const MockMorphoABI = MOCK_MORPHO_CONTRACT.abi;

export interface MarketInfo {
  id: string;
  name: string;
  asset: Address;
  apy: bigint;
  totalSupply: bigint;
  totalBorrow: bigint;
  isActive: boolean;
}

export interface UserPosition {
  marketId: string;
  supplied: bigint;
  borrowed: bigint;
  collateral: bigint;
  healthFactor: bigint;
}

export interface YieldInfo {
  totalEarned: bigint;
  currentRate: bigint;
  projectedDaily: bigint;
  projectedMonthly: bigint;
  projectedYearly: bigint;
}

/**
 * Hook for interacting with MockMorpho yield protocol
 * Provides functionality for supplying assets, earning yield, and managing positions
 */
export function useMockMorpho() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<string | null>(null);
  const [pendingOperationData, setPendingOperationData] = useState<any>(null);

  // Read available markets
  const { data: marketsData, refetch: refetchMarkets } = useReadContract({
    address: MOCK_MORPHO_ADDRESS,
    abi: MockMorphoABI,
    functionName: 'getActiveMarkets',
    query: {
      enabled: !!address,
    },
  });

  // Read user position
  const { data: userPositionData, refetch: refetchPosition } = useReadContract({
    address: MOCK_MORPHO_ADDRESS,
    abi: MockMorphoABI,
    functionName: 'getUserPosition',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read total yield earned
  const { data: totalYieldData, refetch: refetchYield } = useReadContract({
    address: MOCK_MORPHO_ADDRESS,
    abi: MockMorphoABI,
    functionName: 'getTotalYieldEarned',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read current APY for a market
  const { data: currentAPY } = useReadContract({
    address: MOCK_MORPHO_ADDRESS,
    abi: MockMorphoABI,
    functionName: 'getCurrentAPY',
    args: ['0'], // Default market ID
    query: {
      enabled: true,
    },
  });

  // Handle transaction confirmation success
  useEffect(() => {
    if (isConfirmed && pendingOperation) {
      try {
        const operation = pendingOperation;
        const operationData = pendingOperationData;
        setPendingOperation(null);
        setPendingOperationData(null);
        setIsLoading(false);

        switch (operation) {
          case 'supplyAssets':
            toast.success(`🏦 Supplied ${operationData?.amount} tokens to MockMorpho!`);
            Promise.all([
              refetchPosition?.() || Promise.resolve(),
              refetchYield?.() || Promise.resolve(),
              refetchMarkets?.() || Promise.resolve()
            ]).catch(console.error);
            break;
          case 'withdrawAssets':
            toast.success(`💰 Withdrew ${operationData?.amount} tokens from MockMorpho!`);
            Promise.all([
              refetchPosition?.() || Promise.resolve(),
              refetchYield?.() || Promise.resolve(),
              refetchMarkets?.() || Promise.resolve()
            ]).catch(console.error);
            break;
          case 'claimYield':
            toast.success('🎁 Yield claimed successfully!');
            Promise.all([
              refetchPosition?.() || Promise.resolve(),
              refetchYield?.() || Promise.resolve()
            ]).catch(console.error);
            break;
          case 'updateYieldRates':
            toast.success(`📈 Updated yield rate to ${operationData?.newRate}%`);
            if (refetchMarkets) refetchMarkets().catch(console.error);
            break;
        }
      } catch (error) {
        console.error('Error in MockMorpho transaction confirmation handler:', error);
      }
    }
  }, [isConfirmed, pendingOperation, pendingOperationData]);

  // Handle transaction errors
  useEffect(() => {
    try {
      const combinedError = writeError || confirmError;
      if (combinedError) {
        setIsLoading(false);
        setPendingOperation(null);
        setPendingOperationData(null);

        if (pendingOperation) {
          switch (pendingOperation) {
            case 'supplyAssets':
              toast.error('Failed to supply assets');
              break;
            case 'withdrawAssets':
              toast.error('Failed to withdraw assets');
              break;
            case 'claimYield':
              toast.error('Failed to claim yield');
              break;
            case 'updateYieldRates':
              toast.error('Failed to update yield rates');
              break;
          }
        }
      }
    } catch (error) {
      console.error('Error in MockMorpho transaction error handler:', error);
    }
  }, [writeError, confirmError, pendingOperation]);

  /**
   * Supply assets to MockMorpho for yield generation
   */
  const supplyAssets = useCallback(async (amount: string, token: Address) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsLoading(true);
      setPendingOperation('supplyAssets');
      setPendingOperationData({ amount });
      const amountWei = parseUnits(amount, 18);

      writeContract({
        address: MOCK_MORPHO_ADDRESS,
        abi: MockMorphoABI,
        functionName: 'supply',
        args: [token, amountWei],
        chain: scrollSepolia,
        account: address,
      });
    } catch (error) {
      console.error('Supply failed:', error);
      toast.error('Failed to supply assets');
      setIsLoading(false);
      setPendingOperation(null);
      setPendingOperationData(null);
    }
  }, [address, isConnected, writeContract]);

  /**
   * Withdraw supplied assets from MockMorpho
   */
  const withdrawAssets = useCallback(async (amount: string, token: Address) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsLoading(true);
      setPendingOperation('withdrawAssets');
      setPendingOperationData({ amount });
      const amountWei = parseUnits(amount, 18);

      writeContract({
        address: MOCK_MORPHO_ADDRESS,
        abi: MockMorphoABI,
        functionName: 'withdraw',
        args: [token, amountWei],
        chain: scrollSepolia,
        account: address,
      });
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast.error('Failed to withdraw assets');
      setIsLoading(false);
      setPendingOperation(null);
      setPendingOperationData(null);
    }
  }, [address, isConnected, writeContract]);

  /**
   * Claim accumulated yield
   */
  const claimYield = useCallback(async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsLoading(true);
      setPendingOperation('claimYield');

      writeContract({
        address: MOCK_MORPHO_ADDRESS,
        abi: MockMorphoABI,
        functionName: 'claimYield',
        args: [address],
        chain: scrollSepolia,
        account: address,
      });
    } catch (error) {
      console.error('Claim yield failed:', error);
      toast.error('Failed to claim yield');
      setIsLoading(false);
      setPendingOperation(null);
    }
  }, [address, isConnected, writeContract]);

  /**
   * Update yield rates (admin function for testing)
   */
  const updateYieldRates = useCallback(async (newRate: string) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsLoading(true);
      setPendingOperation('updateYieldRates');
      setPendingOperationData({ newRate });
      const rateWei = parseUnits(newRate, 18);

      writeContract({
        address: MOCK_MORPHO_ADDRESS,
        abi: MockMorphoABI,
        functionName: 'updateAPY',
        args: ['0', rateWei], // Market ID 0, new APY
        chain: scrollSepolia,
        account: address,
      });
    } catch (error) {
      console.error('Update yield rates failed:', error);
      toast.error('Failed to update yield rates');
      setIsLoading(false);
      setPendingOperation(null);
      setPendingOperationData(null);
    }
  }, [address, isConnected, writeContract]);

  // Format data for UI consumption
  const markets: MarketInfo[] = marketsData ? (marketsData as any[]).map((market, index) => ({
    id: index.toString(),
    name: `Market ${index}`,
    asset: market.asset,
    apy: market.apy,
    totalSupply: market.totalSupply,
    totalBorrow: market.totalBorrow,
    isActive: market.isActive,
  })) : [];

  const userPosition: UserPosition | null = userPositionData ? {
    marketId: '0',
    supplied: (userPositionData as any).supplied || 0n,
    borrowed: (userPositionData as any).borrowed || 0n,
    collateral: (userPositionData as any).collateral || 0n,
    healthFactor: (userPositionData as any).healthFactor || 0n,
  } : null;

  const yieldInfo: YieldInfo = {
    totalEarned: totalYieldData || 0n,
    currentRate: currentAPY || 0n,
    projectedDaily: currentAPY ? (userPosition?.supplied || 0n) * currentAPY / 365n / 10000n : 0n,
    projectedMonthly: currentAPY ? (userPosition?.supplied || 0n) * currentAPY / 12n / 10000n : 0n,
    projectedYearly: currentAPY ? (userPosition?.supplied || 0n) * currentAPY / 10000n : 0n,
  };

  return {
    // State
    isLoading: isLoading || isPending || isConfirming,
    isConnected,
    address,
    
    // Data
    markets,
    userPosition,
    yieldInfo,
    
    // Actions
    supplyAssets,
    withdrawAssets,
    claimYield,
    updateYieldRates,
    
    // Refetch functions
    refetchMarkets,
    refetchPosition,
    refetchYield,
    
    // Transaction state
    hash,
    isConfirmed,
    error: writeError || confirmError,
  };
}

export default useMockMorpho;
