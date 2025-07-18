import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { parseUnits, decodeEventLog } from 'viem';
import { GoalVaultFactoryABI } from '../contracts/abis/GoalVaultFactory';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import { GoalType } from '../contracts/types';

export interface CreateVaultParams {
  vaultName: string;
  description: string;
  targetAmount: string; // String to handle decimal input
  deadline: Date;
  isPublic: boolean;
  goalType: GoalType;
}

export interface UseCreateVaultReturn {
  createVault: (params: CreateVaultParams) => Promise<void>;
  isLoading: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash: string | null;
  vaultId: bigint | null;
  reset: () => void;
}

export function useCreateVault(): UseCreateVaultReturn {
  const { address } = useAccount();
  const chainId = useChainId();
  const [error, setError] = useState<Error | null>(null);
  const [vaultId, setVaultId] = useState<bigint | null>(null);

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
    data: receipt
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Extract vault ID from transaction logs when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && receipt && receipt.logs) {
      try {
        // Look for VaultCreated event in the logs
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: GoalVaultFactoryABI,
              data: log.data,
              topics: log.topics,
            });

            if (decoded.eventName === 'VaultCreated') {
              const vaultId = decoded.args.vaultId as bigint;
              setVaultId(vaultId);
              break;
            }
          } catch (decodeError) {
            // Continue to next log if this one can't be decoded
            continue;
          }
        }
      } catch (error) {
        console.error('Error extracting vault ID from transaction logs:', error);
      }
    }
  }, [isConfirmed, receipt]);

  const createVault = async (params: CreateVaultParams) => {
    try {
      setError(null);
      setVaultId(null);

      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Validate parameters
      if (!params.vaultName.trim()) {
        throw new Error('Vault name is required');
      }

      if (!params.description.trim()) {
        throw new Error('Vault description is required');
      }

      // For GROUP type, target amount must be > 0. For PERSONAL type, it can be 0
      if (params.goalType === GoalType.GROUP && (!params.targetAmount || parseFloat(params.targetAmount) <= 0)) {
        throw new Error('Target amount is required for group goals');
      }

      if (params.deadline <= new Date()) {
        throw new Error('Deadline must be in the future');
      }

      // Get contract addresses for current chain
      const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

      if (!contractAddresses) {
        throw new Error(`Unsupported network: ${chainId}`);
      }

      // Convert target amount to wei (USDC has 6 decimals)
      const targetAmountWei = parseUnits(params.targetAmount || '0', 6);

      // Convert deadline to Unix timestamp
      const deadlineTimestamp = BigInt(Math.floor(params.deadline.getTime() / 1000));

      // Call createVault function
      await writeContract({
        address: contractAddresses.VAULT_FACTORY as `0x${string}`,
        abi: GoalVaultFactoryABI,
        functionName: 'createVault',
        args: [
          params.vaultName,
          params.description,
          targetAmountWei,
          deadlineTimestamp,
          params.isPublic,
          params.goalType,
          contractAddresses.USDC as `0x${string}`
        ],
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vault';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  const reset = () => {
    resetWrite();
    setError(null);
    setVaultId(null);
  };

  // Set error from write or confirmation
  const combinedError = error || writeError || confirmError;

  return {
    createVault,
    isLoading: isWritePending,
    isConfirming,
    isSuccess: isConfirmed,
    error: combinedError,
    txHash: txHash || null,
    vaultId,
    reset,
  };
}

// Helper hook for creating vault with USDC amount formatting
export function useCreateVaultWithUSDC() {
  const createVaultHook = useCreateVault();

  const createVaultWithUSDC = async (
    params: Omit<CreateVaultParams, 'targetAmount'> & { 
      targetAmountUSDC: number; // Amount in USDC (e.g., 1000 for $1000)
    }
  ) => {
    // Convert USDC amount to wei (USDC has 6 decimals)
    const targetAmount = parseUnits(params.targetAmountUSDC.toString(), 6);
    
    return createVaultHook.createVault({
      ...params,
      targetAmount,
    });
  };

  return {
    ...createVaultHook,
    createVaultWithUSDC,
  };
}

// Helper function to get goal type from string
export function getGoalTypeFromString(goalType: string): GoalType {
  switch (goalType.toLowerCase()) {
    case 'group':
      return GoalType.GROUP;
    case 'personal':
      return GoalType.PERSONAL;
    default:
      return GoalType.GROUP;
  }
}

// Helper function to format deadline
export function formatDeadlineForContract(deadline: Date): bigint {
  return BigInt(Math.floor(deadline.getTime() / 1000));
}
