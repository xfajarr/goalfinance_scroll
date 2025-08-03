import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { Address, formatUnits } from 'viem';
import { USDCFaucetABI } from '@/contracts/abis/USDCFaucet';
import { MockUSDCABI } from '@/contracts/abis/MockUSDC';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { useToast } from '@/hooks/use-toast';

export interface UseMockUSDCFaucetReturn {
  // Faucet actions
  claimFaucet: () => Promise<void>;
  
  // State
  isLoading: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash: string | null;
  
  // Faucet info
  canUseFaucet: boolean;
  timeUntilNextFaucet: number;
  faucetAmount: string;
  userBalance: string;
  
  // Loading states
  isLoadingFaucetInfo: boolean;
  isLoadingBalance: boolean;
  
  // Utils
  reset: () => void;
  refetch: () => void;
}

export function useMockUSDCFaucet(): UseMockUSDCFaucetReturn {
  const { address } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  
  const [error, setError] = useState<Error | null>(null);
  
  // Get contract addresses for current chain
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const usdcAddress = contractAddresses?.USDC as Address;
  const faucetAddress = contractAddresses?.USDC_FAUCET as Address;
  
  // Write contract hook for faucet claim
  const {
    writeContract,
    data: txHash,
    isPending: isLoading,
    error: writeError,
    reset: resetWrite
  } = useWriteContract();
  
  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  
  // Read faucet eligibility
  const {
    data: canUseFaucetData,
    isLoading: isLoadingCanUse,
    refetch: refetchCanUse
  } = useReadContract({
    address: faucetAddress,
    abi: USDCFaucetABI,
    functionName: 'canUseFaucet',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!faucetAddress,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  });
  
  // Read time until next faucet
  const {
    data: timeUntilNextFaucetData,
    isLoading: isLoadingTime,
    refetch: refetchTime
  } = useReadContract({
    address: faucetAddress,
    abi: USDCFaucetABI,
    functionName: 'timeUntilNextFaucet',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!faucetAddress,
      refetchInterval: 30000,
    }
  });
  
  // Read faucet amount
  const {
    data: faucetAmountData,
    isLoading: isLoadingAmount
  } = useReadContract({
    address: faucetAddress,
    abi: USDCFaucetABI,
    functionName: 'faucetAmount',
    query: {
      enabled: !!faucetAddress,
    }
  });
  
  // Read user balance
  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance
  } = useReadContract({
    address: usdcAddress,
    abi: MockUSDCABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!usdcAddress,
      refetchInterval: 30000,
    }
  });
  
  // Claim faucet function
  const claimFaucet = async () => {
    if (!address) {
      const error = new Error('Wallet not connected');
      setError(error);
      throw error;
    }
    
    if (!faucetAddress) {
      const error = new Error('USDC Faucet contract not found for current chain');
      setError(error);
      throw error;
    }
    
    if (!canUseFaucetData) {
      const error = new Error('Faucet not available yet. Please wait for cooldown to expire.');
      setError(error);
      toast({
        title: "Faucet Unavailable",
        description: "Please wait for the cooldown period to expire before claiming again.",
        variant: "destructive",
      });
      throw error;
    }
    
    try {
      setError(null);
      
      await writeContract({
        address: faucetAddress,
        abi: USDCFaucetABI,
        functionName: 'claimFaucet',
        args: [],
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim faucet';
      const error = new Error(errorMessage);
      setError(error);
      
      toast({
        title: "Faucet Claim Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };
  
  // Refetch all data
  const refetch = useCallback(() => {
    refetchCanUse();
    refetchTime();
    refetchBalance();
  }, [refetchCanUse, refetchTime, refetchBalance]);
  
  // Reset all states
  const reset = () => {
    setError(null);
    resetWrite();
  };
  
  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isSuccess && faucetAmountData) {
      const amount = formatUnits(faucetAmountData, 6);
      toast({
        title: "Faucet Claimed Successfully! 🎉",
        description: `You received ${amount} USDC`,
        variant: "default",
      });
      
      // Refetch data after successful claim
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  }, [isSuccess, faucetAmountData, toast, refetch]);
  
  // Handle errors
  useEffect(() => {
    if (writeError || confirmError) {
      const error = writeError || confirmError;
      setError(error as Error);
    }
  }, [writeError, confirmError]);
  
  return {
    // Actions
    claimFaucet,
    
    // State
    isLoading,
    isConfirming,
    isSuccess,
    error,
    txHash: txHash || null,
    
    // Faucet info
    canUseFaucet: canUseFaucetData || false,
    timeUntilNextFaucet: Number(timeUntilNextFaucetData || 0),
    faucetAmount: faucetAmountData ? formatUnits(faucetAmountData, 6) : '0',
    userBalance: balanceData ? formatUnits(balanceData, 6) : '0',
    
    // Loading states
    isLoadingFaucetInfo: isLoadingCanUse || isLoadingTime || isLoadingAmount,
    isLoadingBalance,
    
    // Utils
    reset,
    refetch,
  };
}
