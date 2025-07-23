import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, decodeEventLog, Address } from 'viem';
import { GOAL_FINANCE_CONTRACT, NATIVE_TOKEN, CONTRACT_CONSTANTS } from '../config/contracts';
import { GoalType, Visibility, VaultConfig, CreateVaultResult } from '../contracts/types';
import GoalFinanceABI from '../contracts/abis/GoalFinance.json';

// Local interface for UI parameters (different from contract types)
export interface CreateVaultUIParams {
  vaultName: string;
  description: string;
  targetAmount: string; // String to handle decimal input
  deadline: Date;
  isPublic: boolean;
  goalType: GoalType;
  token?: Address; // Optional token address, defaults to native token
  penaltyRate?: number; // Penalty rate in percentage (1-10), defaults to 2%
}

export function useCreateVault() {
  const { address } = useAccount();
  const [error, setError] = useState<Error | null>(null);
  const [vaultId, setVaultId] = useState<bigint | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

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

  // Log transaction hash when available
  useEffect(() => {
    if (txHash) {
      console.log('📝 Transaction Hash:', txHash);
      console.log('🔗 Explorer Link:', `https://sepolia.mantlescan.xyz/tx/${txHash}`);
    }
  }, [txHash]);

  // Extract vault ID and invite code from transaction logs when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && receipt && receipt.logs) {
      try {
        // Look for VaultCreated event in the logs
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: GoalFinanceABI,
              data: log.data,
              topics: log.topics,
            });

            if (decoded.eventName === 'VaultCreated') {
              // decoded.args is an array, so access by index
              const vaultId = decoded.args[0] as bigint;
              const inviteCodeBytes = decoded.args[1] as `0x${string}`;
              setVaultId(vaultId);
              setInviteCode(inviteCodeBytes);

              console.log('🎉 Vault created successfully with GoalFinance!');
              break;
            }
          } catch (decodeError) {
            // Continue to next log if this one can't be decoded
            continue;
          }
        }
      } catch (error) {
        console.error('Error extracting vault data from transaction logs:', error);
      }
    }
  }, [isConfirmed, receipt]);



  const createVault = async (params: CreateVaultUIParams): Promise<CreateVaultResult> => {
    try {
      console.log('🚀 Starting vault creation with params:', params);
      setError(null);
      setVaultId(null);
      setInviteCode(null);

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

      if (!params.targetAmount || parseFloat(params.targetAmount) <= 0) {
        throw new Error('Target amount must be greater than 0');
      }

      if (params.deadline <= new Date()) {
        throw new Error('Deadline must be in the future');
      }

      // Determine token - use NATIVE_TOKEN for native tokens or provided token address
      const token = params.token || NATIVE_TOKEN;
      const isNativeToken = token === NATIVE_TOKEN;

      // Determine decimals based on token type
      const decimals = isNativeToken ? 18 : 6; // Native tokens use 18 decimals, USDC uses 6

      // Convert target amount to wei
      const targetAmountWei = parseUnits(params.targetAmount, decimals);

      // Convert deadline to Unix timestamp
      const deadlineTimestamp = BigInt(Math.floor(params.deadline.getTime() / 1000));

      // Convert visibility from isPublic boolean to enum
      // Based on new contract: enum Visibility { PUBLIC, PRIVATE }
      // So: PUBLIC = 0, PRIVATE = 1
      const visibility = params.isPublic ? Visibility.PUBLIC : Visibility.PRIVATE;

      // Convert penalty rate from percentage to basis points
      const penaltyRateBasisPoints = BigInt((params.penaltyRate || 2) * 100); // Default 2% = 200 basis points

      // Validate penalty rate
      if (penaltyRateBasisPoints < BigInt(CONTRACT_CONSTANTS.MIN_PENALTY_RATE) ||
          penaltyRateBasisPoints > BigInt(CONTRACT_CONSTANTS.MAX_PENALTY_RATE)) {
        throw new Error(`Penalty rate must be between ${CONTRACT_CONSTANTS.MIN_PENALTY_RATE / 100}% and ${CONTRACT_CONSTANTS.MAX_PENALTY_RATE / 100}%`);
      }

      // Create VaultConfig struct
      const vaultConfig: VaultConfig = {
        name: params.vaultName,
        description: params.description,
        token: token as Address,
        goalType: params.goalType,
        visibility,
        targetAmount: targetAmountWei,
        deadline: deadlineTimestamp,
        penaltyRate: penaltyRateBasisPoints
      };

      console.log('📝 Vault config:', vaultConfig);

      // Call createVault function with new contract signature
      writeContract({
        address: GOAL_FINANCE_CONTRACT.address,
        abi: GoalFinanceABI,
        functionName: 'createVault',
        args: [vaultConfig],
      });

      console.log('📝 Transaction initiated, waiting for confirmation...');

      // Return a promise that resolves when the transaction is confirmed
      return new Promise((resolve, reject) => {
        const checkResult = () => {
          if (isConfirmed && vaultId !== null && inviteCode !== null) {
            resolve({ vaultId, inviteCode });
          } else if (combinedError) {
            reject(combinedError);
          } else {
            // Keep checking
            setTimeout(checkResult, 100);
          }
        };
        checkResult();
      });

    } catch (err) {
      console.error('❌ Error in createVault:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vault';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  const reset = () => {
    resetWrite();
    setError(null);
    setVaultId(null);
    setInviteCode(null);
  };

  // Set error from write or confirmation with better error messages
  const combinedError = error || writeError || confirmError;

  // Log errors for debugging
  useEffect(() => {
    if (writeError) {
      console.error('❌ Write error:', writeError);
    }
    if (confirmError) {
      console.error('❌ Confirmation error:', confirmError);
    }
    if (error) {
      console.error('❌ Hook error:', error);
    }
  }, [writeError, confirmError, error]);

  return {
    createVault,
    isLoading: isWritePending,
    isConfirming,
    isSuccess: isConfirmed,
    error: combinedError,
    txHash: txHash || null,
    vaultId,
    inviteCode,
    reset,
  };
}

// Helper hook for creating vault with USDC amount formatting
export function useCreateVaultWithUSDC() {
  const createVaultHook = useCreateVault();

  const createVaultWithUSDC = async (
    params: Omit<CreateVaultUIParams, 'targetAmount'> & {
      targetAmountUSDC: number; // Amount in USDC (e.g., 1000 for $1000)
    }
  ) => {
    // Convert USDC amount to string for the UI params
    return createVaultHook.createVault({
      ...params,
      targetAmount: params.targetAmountUSDC.toString(),
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
