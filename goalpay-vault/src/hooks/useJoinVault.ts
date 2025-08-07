import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { Address, parseUnits } from 'viem';
import { useToast } from '@/hooks/use-toast';
import { GOAL_FINANCE_CONTRACT, NATIVE_TOKEN } from '@/config/contracts';
import { JoinVaultParams, JoinVaultWithTokenParams, EMPTY_INVITE_CODE } from '@/contracts/types';
import { useUSDCApproval } from './useUSDCApproval';
import { scrollSepolia } from '@/config/wagmi';
import GoalFinanceABI from '@/contracts/abis/GoalFinance.json';

export interface UseJoinVaultReturn {
  // Join vault with native token (MNT/ETH)
  joinVault: (vaultId: bigint, amount: string, inviteCode?: string) => Promise<void>;
  // Join vault with ERC20 token (USDC)
  joinVaultWithToken: (vaultId: bigint, amount: string, inviteCode?: string) => Promise<void>;
  // Complete join process (handles approval + join automatically)
  joinVaultComplete: (vaultId: bigint, amount: string, inviteCode?: string, isNativeToken?: boolean) => Promise<void>;
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

  // Reset current step when approval is successful and automatically proceed to join
  useEffect(() => {
    if (isApprovalSuccess && currentStep === 'approving') {
      setCurrentStep('success');
      toast({
        title: '✅ Approval Successful',
        description: 'Now proceeding to join the vault...',
      });
    }
  }, [isApprovalSuccess, currentStep, toast]);

  // Set success when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && currentStep === 'joining') {
      setCurrentStep('success');
    }
  }, [isConfirmed, currentStep]);

  // Helper function to format invite code for contract calls
  const formatInviteCode = (inviteCode?: string): `0x${string}` => {
    if (!inviteCode || inviteCode.trim() === '') {
      return EMPTY_INVITE_CODE as `0x${string}`;
    }

    // If it's already a valid hex string (bytes32 from blockchain), use it directly
    if (inviteCode.startsWith('0x') && inviteCode.length === 66) {
      return inviteCode as `0x${string}`;
    }

    // If it's a legacy frontend-generated invite code (like GOAL123ABC4XYZ9),
    // we need to look up the actual on-chain invite code for this vault
    // For now, return empty invite code for legacy codes - they should be handled differently
    console.warn('Legacy invite code format detected:', inviteCode);
    return EMPTY_INVITE_CODE as `0x${string}`;
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
        chain: mantleSepolia,
        account: address,
      });

      // Success will be handled by the calling component when transaction is confirmed

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

        // Request approval and wait for it to complete
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
        chain: mantleSepolia,
        account: address,
      });

      // Success will be handled by the calling component when transaction is confirmed

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

  // Comprehensive join function that handles approval and joining in sequence
  const joinVaultComplete = async (vaultId: bigint, amount: string, inviteCode?: string, isNativeToken: boolean = false): Promise<void> => {
    try {
      setError(null);

      if (isNativeToken) {
        await joinVault(vaultId, amount, inviteCode);
      } else {
        // For ERC20 tokens, handle approval first if needed
        setCurrentStep('checking');

        const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
        const needsApprovalCheck = await checkNeedsApproval(amountWei, GOAL_FINANCE_CONTRACT.address);
        setNeedsApproval(needsApprovalCheck);

        if (needsApprovalCheck) {
          setCurrentStep('approving');
          toast({
            title: 'Approval Required',
            description: 'Please approve USDC spending to continue...',
          });

          // Wait for approval to complete
          await approve(amountWei, GOAL_FINANCE_CONTRACT.address);

          // Wait a bit for the approval to be processed
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Now proceed with joining
        await joinVaultWithToken(vaultId, amount, inviteCode);
      }
    } catch (err) {
      setCurrentStep('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to join vault';
      setError(new Error(errorMessage));
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
    joinVaultComplete,
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
