import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { Address, parseEther, parseUnits } from 'viem';
import { BILL_SPLITTER_CONTRACT, NATIVE_TOKEN, SplitMode, BillStatus } from '../config/contracts';
import { toast } from '@/components/ui/sonner';

export interface ParticipantShare {
  participant: Address;
  share: bigint; // Amount in wei for EXACT mode, basis points for PERCENTAGE mode
}

export interface CreateBillParams {
  title: string;
  description: string;
  token: Address;
  totalAmount: string; // Amount as string (will be parsed based on token)
  splitMode: SplitMode;
  category: string;
  participants: Address[];
  shares?: ParticipantShare[]; // Only needed for PERCENTAGE and EXACT modes
}

export interface BillInfo {
  id: bigint;
  creator: Address;
  title: string;
  description: string;
  token: Address;
  totalAmount: bigint;
  splitMode: SplitMode;
  status: BillStatus;
  createdAt: bigint;
  settledAt: bigint;
  category: string;
  participants: Address[];
  participantCount: bigint;
  settledCount: bigint;
}

export function useBillSplitter() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Write contract hook
  const { 
    writeContract, 
    data: txHash, 
    isPending: isWritePending,
    error: writeError 
  } = useWriteContract();

  // Transaction receipt hook
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Combined loading state
  const combinedLoading = isWritePending || isConfirming;

  // Combined error
  const combinedError = writeError || receiptError || error;

  // Create bill function
  const createBill = async (params: CreateBillParams) => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Parse amount based on token type
      let parsedAmount: bigint;
      if (params.token === NATIVE_TOKEN) {
        parsedAmount = parseEther(params.totalAmount);
      } else {
        // Assume USDC (6 decimals) for now - could be made configurable
        parsedAmount = parseUnits(params.totalAmount, 6);
      }

      // Prepare shares array
      const shares = params.shares || [];

      writeContract({
        address: BILL_SPLITTER_CONTRACT.address,
        abi: BILL_SPLITTER_CONTRACT.abi,
        functionName: 'createBill',
        args: [
          params.title,
          params.description,
          params.token,
          parsedAmount,
          params.splitMode,
          params.category,
          params.participants,
          shares,
        ],
      });

    } catch (err) {
      console.error('Failed to create bill:', err);
      setError(err instanceof Error ? err.message : 'Failed to create bill');
    } finally {
      setIsLoading(false);
    }
  };

  // Settle bill function
  const settleBill = async (billId: bigint, amount?: bigint) => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // If amount is provided, it's for native token payment
      const value = amount || 0n;

      writeContract({
        address: BILL_SPLITTER_CONTRACT.address,
        abi: BILL_SPLITTER_CONTRACT.abi,
        functionName: 'settleBill',
        args: [billId],
        value,
      });

    } catch (err) {
      console.error('Failed to settle bill:', err);
      setError(err instanceof Error ? err.message : 'Failed to settle bill');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel bill function
  const cancelBill = async (billId: bigint) => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      writeContract({
        address: BILL_SPLITTER_CONTRACT.address,
        abi: BILL_SPLITTER_CONTRACT.abi,
        functionName: 'cancelBill',
        args: [billId],
      });

    } catch (err) {
      console.error('Failed to cancel bill:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel bill');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset function
  const reset = () => {
    setError(null);
    setIsLoading(false);
  };

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success('Transaction confirmed!', {
        description: 'Your bill operation has been completed.',
      });
    }
  }, [isConfirmed, txHash]);

  // Show error toast when there's an error
  useEffect(() => {
    if (combinedError) {
      toast.error('Transaction failed', {
        description: combinedError instanceof Error ? combinedError.message : 'Please try again.',
      });
    }
  }, [combinedError]);

  return {
    // Actions
    createBill,
    settleBill,
    cancelBill,
    reset,

    // State
    isLoading: combinedLoading || isLoading,
    isConfirming,
    isSuccess: isConfirmed,
    error: combinedError,
    txHash,
  };
}

// Hook for reading bill data
export function useBillData(billId?: bigint) {
  const { data: billInfo, isLoading } = useReadContract({
    address: BILL_SPLITTER_CONTRACT.address,
    abi: BILL_SPLITTER_CONTRACT.abi,
    functionName: 'getBill',
    args: billId ? [billId] : undefined,
    query: {
      enabled: !!billId,
    },
  });

  return {
    bill: billInfo as BillInfo | undefined,
    isLoading,
  };
}

// Hook for getting user's bills
export function useUserBills(userAddress?: Address) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const { data: billIds, isLoading } = useReadContract({
    address: BILL_SPLITTER_CONTRACT.address,
    abi: BILL_SPLITTER_CONTRACT.abi,
    functionName: 'getUserBills',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });

  return {
    billIds: (billIds as bigint[]) || [],
    isLoading,
  };
}

// Hook for getting all bills
export function useAllBills() {
  const { data: billIds, isLoading } = useReadContract({
    address: BILL_SPLITTER_CONTRACT.address,
    abi: BILL_SPLITTER_CONTRACT.abi,
    functionName: 'getAllBills',
  });

  return {
    billIds: (billIds as bigint[]) || [],
    isLoading,
  };
}

// Hook for getting participant share
export function useParticipantShare(billId?: bigint, participant?: Address) {
  const { data: share, isLoading } = useReadContract({
    address: BILL_SPLITTER_CONTRACT.address,
    abi: BILL_SPLITTER_CONTRACT.abi,
    functionName: 'getParticipantShare',
    args: billId && participant ? [billId, participant] : undefined,
    query: {
      enabled: !!billId && !!participant,
    },
  });

  return {
    share: share as bigint | undefined,
    isLoading,
  };
}

// Utility functions for bill calculations
export const billUtils = {
  // Calculate equal split
  calculateEqualSplit: (totalAmount: bigint, participantCount: number): bigint => {
    return totalAmount / BigInt(participantCount);
  },

  // Validate percentage shares (should add up to 10000 basis points)
  validatePercentageShares: (shares: ParticipantShare[]): boolean => {
    const total = shares.reduce((sum, share) => sum + share.share, 0n);
    return total === 10000n; // 100% in basis points
  },

  // Validate exact amount shares (should add up to total amount)
  validateExactShares: (shares: ParticipantShare[], totalAmount: bigint): boolean => {
    const total = shares.reduce((sum, share) => sum + share.share, 0n);
    return total === totalAmount;
  },

  // Convert percentage to basis points
  percentageToBasisPoints: (percentage: number): bigint => {
    return BigInt(Math.round(percentage * 100));
  },

  // Convert basis points to percentage
  basisPointsToPercentage: (basisPoints: bigint): number => {
    return Number(basisPoints) / 100;
  },

  // Format amount for display
  formatAmount: (amount: bigint, decimals: number = 6): string => {
    const divisor = BigInt(10 ** decimals);
    const whole = amount / divisor;
    const fraction = amount % divisor;
    
    if (fraction === 0n) {
      return whole.toString();
    }
    
    const fractionStr = fraction.toString().padStart(decimals, '0');
    const trimmedFraction = fractionStr.replace(/0+$/, '');
    
    return `${whole}.${trimmedFraction}`;
  },

  // Parse amount from string
  parseAmount: (amountStr: string, decimals: number = 6): bigint => {
    return parseUnits(amountStr, decimals);
  },
};
