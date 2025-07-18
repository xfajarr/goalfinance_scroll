import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount, useChainId } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ERC20ABI } from '../contracts/abis/ERC20';
import { CONTRACT_ADDRESSES } from '../config/wagmi';

export interface UseUSDCApprovalReturn {
  approve: (amount: bigint, spender: string) => Promise<void>;
  checkAllowance: (spender: string) => Promise<bigint>;
  isLoading: boolean;
  isConfirming: boolean;
  error: Error | null;
  txHash: string | null;
  reset: () => void;
  needsApproval: (amount: bigint, spender: string) => Promise<boolean>;
}

export function useUSDCApproval(): UseUSDCApprovalReturn {
  const { address } = useAccount();
  const chainId = useChainId();
  const [error, setError] = useState<Error | null>(null);

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
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const approve = async (amount: bigint, spender: string) => {
    try {
      setError(null);

      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Get contract addresses for current chain
      const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
      
      if (!contractAddresses) {
        throw new Error(`Unsupported network: ${chainId}`);
      }

      // Call approve function
      await writeContract({
        address: contractAddresses.USDC as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [spender as `0x${string}`, amount],
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve USDC';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  const checkAllowance = async (spender: string): Promise<bigint> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    // Get contract addresses for current chain
    const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

    if (!contractAddresses) {
      throw new Error(`Unsupported network: ${chainId}`);
    }

    // This would need to be implemented with a direct contract call
    // For now, return 0n to indicate no allowance
    return 0n;
  };

  const needsApproval = async (amount: bigint, spender: string): Promise<boolean> => {
    try {
      const allowance = await checkAllowance(spender);
      return allowance < amount;
    } catch {
      return true; // Assume approval is needed if we can't check
    }
  };

  const reset = () => {
    resetWrite();
    setError(null);
  };

  // Set error from write or confirmation
  const combinedError = error || writeError || confirmError;

  return {
    approve,
    checkAllowance,
    isLoading: isWritePending,
    isConfirming,
    error: combinedError,
    txHash: txHash || null,
    reset,
    needsApproval,
  };
}

// Helper hook for approving USDC with amount formatting
export function useUSDCApprovalWithFormatting() {
  const approvalHook = useUSDCApproval();

  const approveUSDC = async (amountUSDC: number, spender: string) => {
    // Convert USDC amount to wei (USDC has 6 decimals)
    const amount = parseUnits(amountUSDC.toString(), 6);
    return approvalHook.approve(amount, spender);
  };

  const needsApprovalUSDC = async (amountUSDC: number, spender: string): Promise<boolean> => {
    const amount = parseUnits(amountUSDC.toString(), 6);
    return approvalHook.needsApproval(amount, spender);
  };

  return {
    ...approvalHook,
    approveUSDC,
    needsApprovalUSDC,
  };
}

// Helper function to format USDC amounts
export function formatUSDCAmount(amount: bigint): string {
  return formatUnits(amount, 6);
}

// Helper function to parse USDC amounts
export function parseUSDCAmount(amount: string): bigint {
  return parseUnits(amount, 6);
}
