import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { parseUnits, Address } from 'viem';
import { GOAL_FINANCE_CONTRACT } from '../config/contracts';
import { AddNativeFundsParams, AddTokenFundsParams } from '../contracts/types';
import { useToast } from '@/hooks/use-toast';
import { useUSDCApproval } from './useUSDCApproval';
import { mantleSepolia } from '../config/wagmi';
import GoalFinanceABI from '../contracts/abis/GoalFinance.json';

export interface UseAddFundsReturn {
  // Add native token funds (MNT/ETH)
  addNativeFunds: (vaultId: bigint, amount: string) => Promise<void>;
  // Add ERC20 token funds (USDC)
  addTokenFunds: (vaultId: bigint, amount: string) => Promise<void>;
  isLoading: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash: string | null;
  reset: () => void;
  // Approval states for ERC20 tokens
  isApproving: boolean;
  isApprovingConfirming: boolean;
  approvalTxHash: string | null;
  needsApproval: boolean;
  currentStep: 'idle' | 'checking' | 'approving' | 'adding' | 'success' | 'error';
}

export const useAddFunds = (): UseAddFundsReturn => {
  const [error, setError] = useState<Error | null>(null);
  const [currentStep, setCurrentStep] = useState<'idle' | 'checking' | 'approving' | 'adding' | 'success' | 'error'>('idle');
  const [needsApproval, setNeedsApproval] = useState(false);
  const { address } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // USDC Approval hook
  const {
    approve,
    needsApproval: checkNeedsApproval,
    isLoading: isApproving,
    isConfirming: isApprovingConfirming,
    isSuccess: isApprovalSuccess,
    error: approvalError,
    txHash: approvalTxHash,
    reset: resetApproval
  } = useUSDCApproval();

  // Reset current step when approval is successful
  useEffect(() => {
    if (isApprovalSuccess && currentStep === 'approving') {
      setCurrentStep('idle');
      toast({
        title: '✅ Approval Successful',
        description: 'You can now add funds to the vault',
      });
    }
  }, [isApprovalSuccess, currentStep, toast]);

  // Add native token funds (MNT/ETH)
  const addNativeFunds = async (vaultId: bigint, amount: string): Promise<void> => {
    try {
      setError(null);
      setCurrentStep('adding');

      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Validate inputs
      if (!vaultId || vaultId <= 0n) {
        throw new Error('Invalid vault ID');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const value = parseUnits(amount, 18); // Native tokens use 18 decimals

      console.log('💰 Adding native funds:', {
        vaultId: vaultId.toString(),
        amount,
        value: value.toString()
      });

      // Call addNativeFunds function
      writeContract({
        address: GOAL_FINANCE_CONTRACT.address,
        abi: GoalFinanceABI,
        functionName: 'addNativeFunds',
        args: [vaultId],
        value: value,
        chain: mantleSepolia,
        account: address,
      });

      toast({
        title: '💰 Funds Added Successfully!',
        description: `Added ${amount} native tokens to your vault`,
      });

    } catch (err) {
      setCurrentStep('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to add native funds';
      setError(new Error(errorMessage));
      toast({
        title: 'Failed to Add Funds',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Add ERC20 token funds (USDC)
  const addTokenFunds = async (vaultId: bigint, amount: string): Promise<void> => {
    try {
      setError(null);
      setCurrentStep('checking');

      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Validate inputs
      if (!vaultId || vaultId <= 0n) {
        throw new Error('Invalid vault ID');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals

      // Check if approval is needed
      const needsApprovalCheck = await checkNeedsApproval(amountWei, GOAL_FINANCE_CONTRACT.address);
      setNeedsApproval(needsApprovalCheck);

      if (needsApprovalCheck) {
        setCurrentStep('approving');

        toast({
          title: 'Approval Required',
          description: 'Please approve USDC spending first, then try adding funds again',
        });

        // Request approval
        await approve(amountWei, GOAL_FINANCE_CONTRACT.address);

        // Exit here - user needs to call addTokenFunds again after approval
        return;
      }

      setCurrentStep('adding');

      console.log('💰 Adding token funds:', {
        vaultId: vaultId.toString(),
        amount,
        amountWei: amountWei.toString()
      });

      // Call addTokenFunds function
      writeContract({
        address: GOAL_FINANCE_CONTRACT.address,
        abi: GoalFinanceABI,
        functionName: 'addTokenFunds',
        args: [vaultId, amountWei],
        chain: mantleSepolia,
        account: address,
      });

      toast({
        title: '💰 Funds Added Successfully!',
        description: `Added ${amount} USDC to your vault`,
      });

    } catch (err) {
      setCurrentStep('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to add token funds';
      setError(new Error(errorMessage));
      toast({
        title: 'Failed to Add Funds',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const reset = () => {
    resetWrite();
    resetApproval();
    setError(null);
    setCurrentStep('idle');
    setNeedsApproval(false);
  };

  // Set error from write, confirmation, or approval
  const combinedError = error || writeError || confirmError || approvalError;

  return {
    addNativeFunds,
    addTokenFunds,
    isLoading: isWritePending,
    isConfirming,
    isSuccess: isConfirmed,
    error: combinedError,
    txHash: txHash || null,
    reset,
    // Approval states
    isApproving,
    isApprovingConfirming,
    approvalTxHash: approvalTxHash || null,
    needsApproval,
    currentStep,
  };
};
