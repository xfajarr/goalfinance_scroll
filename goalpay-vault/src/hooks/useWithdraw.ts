import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { GOAL_FINANCE_CONTRACT } from '../config/contracts';
import { WithdrawParams, UseWithdrawReturn } from '../contracts/types';
import { useToast } from '@/hooks/use-toast';
import GoalFinanceABI from '../contracts/abis/GoalFinance.json';

export const useWithdraw = (): UseWithdrawReturn => {
  const [error, setError] = useState<Error | null>(null);
  const { address } = useAccount();
  const { toast } = useToast();

  // Write contract hook
  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite
  } = useWriteContract();

  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Combine errors
  const combinedError = error || writeError || confirmError;

  // Reset function
  const reset = () => {
    setError(null);
    resetWrite();
  };

  // Update success state
  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: '✅ Withdrawal Successful!',
        description: 'Your funds have been withdrawn successfully',
      });
    }
  }, [isConfirmed, toast]);

  // Regular withdrawal (after goal reached or deadline passed)
  const withdraw = async (params: WithdrawParams): Promise<void> => {
    try {
      setError(null);

      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Validate inputs
      if (!params.vaultId || params.vaultId <= 0n) {
        throw new Error('Invalid vault ID');
      }

      console.log('💰 Withdrawing from vault:', {
        vaultId: params.vaultId.toString()
      });

      // Call withdraw function
      writeContract({
        address: GOAL_FINANCE_CONTRACT.address,
        abi: GoalFinanceABI,
        functionName: 'withdraw',
        args: [params.vaultId],
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw';
      setError(new Error(errorMessage));
      toast({
        title: 'Withdrawal Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Early withdrawal (with penalty)
  const withdrawEarly = async (params: WithdrawParams): Promise<void> => {
    try {
      setError(null);

      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Validate inputs
      if (!params.vaultId || params.vaultId <= 0n) {
        throw new Error('Invalid vault ID');
      }

      console.log('⚠️ Early withdrawal from vault:', {
        vaultId: params.vaultId.toString()
      });

      // Call withdrawEarly function
      writeContract({
        address: GOAL_FINANCE_CONTRACT.address,
        abi: GoalFinanceABI,
        functionName: 'withdrawEarly',
        args: [params.vaultId],
      });

      toast({
        title: '⚠️ Early Withdrawal Initiated',
        description: 'Note: Penalty fees may apply for early withdrawal',
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw early';
      setError(new Error(errorMessage));
      toast({
        title: 'Early Withdrawal Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    withdraw,
    withdrawEarly,
    isLoading: isWritePending,
    isConfirming,
    isSuccess: isConfirmed,
    error: combinedError,
    txHash: txHash || null,
    reset,
  };
};
