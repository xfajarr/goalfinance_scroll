import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { Address, parseEther, parseUnits } from 'viem';
import { DEBT_MANAGER_CONTRACT, NATIVE_TOKEN } from '../config/contracts';
import { toast } from '@/components/ui/sonner';

export interface CreateDebtParams {
  creditor: Address;
  debtor: Address;
  token: Address;
  amount: string; // Amount as string (will be parsed based on token)
  description: string;
  category: string;
  billId?: bigint; // Optional reference to bill
}

export interface Debt {
  id: bigint;
  creditor: Address;
  debtor: Address;
  token: Address;
  amount: bigint;
  description: string;
  createdAt: bigint;
  settledAt: bigint;
  isSettled: boolean;
  category: string;
  billId: bigint;
}

export interface DebtSummary {
  token: Address;
  totalOwed: bigint;    // Total amount user owes to others
  totalOwing: bigint;   // Total amount others owe to user
  netBalance: bigint;   // Positive = net creditor, Negative = net debtor
}

export interface UserDebtInfo {
  otherParty: Address;
  token: Address;
  netAmount: bigint; // Positive = they owe you, Negative = you owe them
  lastUpdated: bigint;
}

export function useDebtManager() {
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

  // Create debt function
  const createDebt = async (params: CreateDebtParams) => {
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
        parsedAmount = parseEther(params.amount);
      } else {
        // Assume USDC (6 decimals) for now - could be made configurable
        parsedAmount = parseUnits(params.amount, 6);
      }

      writeContract({
        address: DEBT_MANAGER_CONTRACT.address,
        abi: DEBT_MANAGER_CONTRACT.abi,
        functionName: 'createDebt',
        args: [
          params.creditor,
          params.debtor,
          params.token,
          parsedAmount,
          params.description,
          params.category,
          params.billId || 0n,
        ],
      });

    } catch (err) {
      console.error('Failed to create debt:', err);
      setError(err instanceof Error ? err.message : 'Failed to create debt');
    } finally {
      setIsLoading(false);
    }
  };

  // Settle debt function
  const settleDebt = async (debtId: bigint, amount?: bigint) => {
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
        address: DEBT_MANAGER_CONTRACT.address,
        abi: DEBT_MANAGER_CONTRACT.abi,
        functionName: 'settleDebt',
        args: [debtId],
        value,
      });

    } catch (err) {
      console.error('Failed to settle debt:', err);
      setError(err instanceof Error ? err.message : 'Failed to settle debt');
    } finally {
      setIsLoading(false);
    }
  };

  // Settle net balance function
  const settleNetBalance = async (otherUser: Address, token: Address, amount?: bigint) => {
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
        address: DEBT_MANAGER_CONTRACT.address,
        abi: DEBT_MANAGER_CONTRACT.abi,
        functionName: 'settleNetBalance',
        args: [otherUser, token],
        value,
      });

    } catch (err) {
      console.error('Failed to settle net balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to settle net balance');
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
        description: 'Your debt operation has been completed.',
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
    createDebt,
    settleDebt,
    settleNetBalance,
    reset,

    // State
    isLoading: combinedLoading || isLoading,
    isConfirming,
    isSuccess: isConfirmed,
    error: combinedError,
    txHash,
  };
}

// Hook for reading debt data
export function useDebtData(debtId?: bigint) {
  const { data: debtInfo, isLoading } = useReadContract({
    address: DEBT_MANAGER_CONTRACT.address,
    abi: DEBT_MANAGER_CONTRACT.abi,
    functionName: 'getDebt',
    args: debtId ? [debtId] : undefined,
    query: {
      enabled: !!debtId,
    },
  });

  return {
    debt: debtInfo as Debt | undefined,
    isLoading,
  };
}

// Hook for getting user's debts
export function useUserDebts(userAddress?: Address) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const { data: debtIds, isLoading } = useReadContract({
    address: DEBT_MANAGER_CONTRACT.address,
    abi: DEBT_MANAGER_CONTRACT.abi,
    functionName: 'getUserDebts',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });

  return {
    debtIds: (debtIds as bigint[]) || [],
    isLoading,
  };
}

// Hook for getting debt summary
export function useDebtSummary(tokens: Address[], userAddress?: Address) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const { data: summary, isLoading } = useReadContract({
    address: DEBT_MANAGER_CONTRACT.address,
    abi: DEBT_MANAGER_CONTRACT.abi,
    functionName: 'getDebtSummary',
    args: targetAddress && tokens.length > 0 ? [targetAddress, tokens] : undefined,
    query: {
      enabled: !!targetAddress && tokens.length > 0,
    },
  });

  return {
    summary: (summary as DebtSummary[]) || [],
    isLoading,
  };
}

// Hook for getting net balance between users
export function useNetBalance(user1?: Address, user2?: Address, token?: Address) {
  const { data: netBalance, isLoading } = useReadContract({
    address: DEBT_MANAGER_CONTRACT.address,
    abi: DEBT_MANAGER_CONTRACT.abi,
    functionName: 'getNetBalance',
    args: user1 && user2 && token ? [user1, user2, token] : undefined,
    query: {
      enabled: !!user1 && !!user2 && !!token,
    },
  });

  return {
    netBalance: (netBalance as bigint) || 0n,
    isLoading,
  };
}

// Hook for getting debt relationships
export function useDebtRelationships(token: Address, userAddress?: Address) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const { data: relationships, isLoading } = useReadContract({
    address: DEBT_MANAGER_CONTRACT.address,
    abi: DEBT_MANAGER_CONTRACT.abi,
    functionName: 'getUserDebtRelationships',
    args: targetAddress && token ? [targetAddress, token] : undefined,
    query: {
      enabled: !!targetAddress && !!token,
    },
  });

  return {
    relationships: (relationships as UserDebtInfo[]) || [],
    isLoading,
  };
}

// Utility functions for debt calculations
export const debtUtils = {
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

  // Calculate net balance
  calculateNetBalance: (totalOwing: bigint, totalOwed: bigint): bigint => {
    return totalOwing - totalOwed;
  },

  // Check if user is net creditor
  isNetCreditor: (netBalance: bigint): boolean => {
    return netBalance > 0n;
  },

  // Check if user is net debtor
  isNetDebtor: (netBalance: bigint): boolean => {
    return netBalance < 0n;
  },

  // Get absolute value of net balance
  getAbsoluteNetBalance: (netBalance: bigint): bigint => {
    return netBalance < 0n ? -netBalance : netBalance;
  },
};
