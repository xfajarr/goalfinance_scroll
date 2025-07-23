import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { Address, parseUnits } from 'viem';
import { useToast } from '@/hooks/use-toast';
import { GOAL_FINANCE_CONTRACT, NATIVE_TOKEN } from '@/config/contracts';
import { JoinVaultParams, JoinVaultWithTokenParams, EMPTY_INVITE_CODE } from '@/contracts/types';
import { useUSDCApproval } from './useUSDCApproval';
import GoalFinanceABI from '@/contracts/abis/GoalFinance.json';

export interface UseJoinVaultReturn {
  // Join vault with native token (MNT/ETH)
  joinVault: (vaultId: bigint, amount: string, inviteCode?: string) => Promise<void>;
  // Join vault with ERC20 token (USDC)
  joinVaultWithToken: (vaultId: bigint, amount: string, inviteCode?: string) => Promise<void>;
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
  currentStep: 'idle' | 'checking' | 'approving' | 'joining' | 'success' | 'error';
}

export const useJoinVault = (): UseJoinVaultReturn => {
  const [error, setError] = useState<Error | null>(null);
  const [currentStep, setCurrentStep] = useState<'idle' | 'checking' | 'approving' | 'joining' | 'success' | 'error'>('idle');
  const [needsApproval, setNeedsApproval] = useState(false);
  const { address } = useAccount();
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

  // Check if vault uses native token
  const { data: isNativeTokenVault } = useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'isNativeTokenVault',
    args: [],
  });

  // Reset current step when approval is successful
  useEffect(() => {
    if (isApprovalSuccess && currentStep === 'approving') {
      setCurrentStep('idle');
      toast({
        title: '✅ Approval Successful',
        description: 'You can now join the vault',
      });
    }
  }, [isApprovalSuccess, currentStep, toast]);

  // Helper function to convert invite code
  const formatInviteCode = (inviteCode?: string): `0x${string}` => {
    if (!inviteCode || inviteCode.trim() === '') {
      return EMPTY_INVITE_CODE as `0x${string}`;
    }

    if (inviteCode.startsWith('0x')) {
      return inviteCode as `0x${string}`;
    }

    // Convert string to bytes32
    const encoder = new TextEncoder();
    const data = encoder.encode(inviteCode);
    const bytes32 = new Uint8Array(32);
    bytes32.set(data.slice(0, 32));
    return `0x${Array.from(bytes32).map(b => b.toString(16).padStart(2, '0')).join('')}`;
  };

  // Join vault with native token (MNT/ETH)
  const joinVault = async (vaultId: bigint, amount: string, inviteCode?: string): Promise<void> => {
    try {
      setError(null);
      setCurrentStep('joining');

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
      const inviteCodeBytes = formatInviteCode(inviteCode);

      console.log('🚀 Joining vault with native token:', {
        vaultId: vaultId.toString(),
        amount,
        value: value.toString(),
        inviteCode: inviteCodeBytes
      });

      // Call joinVault function for native tokens
      writeContract({
        address: GOAL_FINANCE_CONTRACT.address,
        abi: GoalFinanceABI,
        functionName: 'joinVault',
        args: [vaultId, inviteCodeBytes],
        value: value,
      });

      toast({
        title: '🎉 Successfully Joined Vault!',
        description: `Welcome to the savings squad! Deposited ${amount} native tokens`,
      });

    } catch (err) {
      setCurrentStep('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to join vault';
      setError(new Error(errorMessage));
      toast({
        title: 'Failed to Join Vault',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Join vault with ERC20 token (USDC)
  const joinVaultWithToken = async (vaultId: bigint, amount: string, inviteCode?: string): Promise<void> => {
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
      const inviteCodeBytes = formatInviteCode(inviteCode);

      // Check if approval is needed
      const needsApprovalCheck = await checkNeedsApproval(amountWei, GOAL_FINANCE_CONTRACT.address);
      setNeedsApproval(needsApprovalCheck);

      if (needsApprovalCheck) {
        setCurrentStep('approving');

        toast({
          title: 'Approval Required',
          description: 'Please approve USDC spending first, then try joining again',
        });

        // Request approval
        await approve(amountWei, GOAL_FINANCE_CONTRACT.address);

        // Exit here - user needs to call joinVaultWithToken again after approval
        return;
      }

      setCurrentStep('joining');

      console.log('🚀 Joining vault with ERC20 token:', {
        vaultId: vaultId.toString(),
        amount,
        amountWei: amountWei.toString(),
        inviteCode: inviteCodeBytes
      });

      // Call joinVaultWithToken function for ERC20 tokens
      writeContract({
        address: GOAL_FINANCE_CONTRACT.address,
        abi: GoalFinanceABI,
        functionName: 'joinVaultWithToken',
        args: [vaultId, amountWei, inviteCodeBytes],
      });

      toast({
        title: '🎉 Successfully Joined Vault!',
        description: `Welcome to the savings squad! Deposited ${amount} USDC`,
      });

    } catch (err) {
      setCurrentStep('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to join vault';
      setError(new Error(errorMessage));
      toast({
        title: 'Failed to Join Vault',
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
    joinVault,
    joinVaultWithToken,
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
