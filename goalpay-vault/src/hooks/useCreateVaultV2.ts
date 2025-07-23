import React, { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseUnits, Address } from 'viem';
import { GOAL_FINANCE_CONTRACT, CONTRACT_ADDRESSES, GoalType, Visibility, CONTRACT_ERRORS } from '../config/contracts';
import { useIsTokenSupported } from './useTokenSupport';

export interface CreateVaultParams {
  vaultName: string;
  description: string;
  targetAmount: string; // In token units (e.g., "100" for 100 USDC)
  deadline: Date;
  isPublic: boolean;
  token?: Address; // Optional, defaults to USDC
}

export interface CreateVaultResult {
  vaultId: bigint;
  inviteCode: string;
  transactionHash: string;
}

/**
 * Enhanced vault creation hook with comprehensive error handling
 */
export function useCreateVaultV2() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateVaultResult | null>(null);

  const chainId = useChainId();
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: txError } = useWaitForTransactionReceipt({
    hash,
  });

  // Helper function to decode contract errors
  const decodeError = (error: any): string => {
    const errorString = error?.message || error?.toString() || '';
    
    // Check for specific contract errors
    for (const [errorName, errorSig] of Object.entries(CONTRACT_ERRORS)) {
      if (errorString.includes(errorSig) || errorString.includes(errorName)) {
        switch (errorName) {
          case 'TokenNotSupported':
            return 'The selected token is not supported by the contract. Please contact the contract owner to add USDC support.';
          case 'ZeroAddress':
            return 'Invalid token address provided.';
          case 'InvalidAmount':
            return 'Invalid target amount. Please enter a valid amount greater than 0.';
          case 'InvalidDeadline':
            return 'Invalid deadline. Please select a future date.';
          default:
            return `Contract error: ${errorName}`;
        }
      }
    }

    // Check for common error patterns
    if (errorString.includes('execution reverted')) {
      return 'Transaction failed. This might be due to insufficient gas, invalid parameters, or contract restrictions.';
    }
    if (errorString.includes('insufficient funds')) {
      return 'Insufficient funds to complete the transaction.';
    }
    if (errorString.includes('user rejected')) {
      return 'Transaction was rejected by the user.';
    }

    return errorString || 'An unknown error occurred';
  };

  const createVault = async (params: CreateVaultParams): Promise<CreateVaultResult> => {
    try {
      setIsCreating(true);
      setError(null);
      setResult(null);

      console.log('🚀 Starting vault creation with params:', params);

      // Validate parameters
      if (!params.vaultName.trim()) {
        throw new Error('Vault name is required');
      }
      if (!params.description.trim()) {
        throw new Error('Description is required');
      }
      if (!params.targetAmount || parseFloat(params.targetAmount) <= 0) {
        throw new Error('Target amount must be greater than 0');
      }
      if (params.deadline <= new Date()) {
        throw new Error('Deadline must be in the future');
      }

      // Determine token address (default to USDC)
      const token = params.token || contractAddresses?.USDC;
      if (!token) {
        throw new Error('No token address available for current chain');
      }

      console.log('📍 Chain ID:', chainId, 'Contract addresses:', contractAddresses);
      console.log('💰 Using token:', token);

      // Convert target amount to proper decimals (USDC uses 6 decimals)
      const decimals = 6; // USDC decimals
      const targetAmountWei = parseUnits(params.targetAmount, decimals);
      
      // Convert deadline to timestamp
      const deadlineTimestamp = BigInt(Math.floor(params.deadline.getTime() / 1000));

      // Prepare contract arguments
      const args = [
        params.vaultName,
        params.description,
        token,
        GoalType.INDIVIDUAL, // Default to individual goal
        params.isPublic ? Visibility.PUBLIC : Visibility.PRIVATE,
        targetAmountWei,
        deadlineTimestamp,
      ] as const;

      console.log('📝 Contract call parameters:', {
        address: GOAL_FINANCE_CONTRACT.address,
        functionName: 'createVault',
        args,
        formattedArgs: {
          name: params.vaultName,
          description: params.description,
          token,
          goalType: GoalType.INDIVIDUAL,
          visibility: params.isPublic ? Visibility.PUBLIC : Visibility.PRIVATE,
          targetAmount: targetAmountWei.toString(),
          deadline: deadlineTimestamp.toString(),
        },
      });

      // Call the contract
      console.log('📞 Calling writeContract...');
      await writeContract({
        ...GOAL_FINANCE_CONTRACT,
        functionName: 'createVault',
        args,
        gas: 500000n, // Set a reasonable gas limit
      });

      console.log('✅ Contract call initiated successfully');

      // Note: The actual result will be set when the transaction is confirmed
      // This is handled by the useEffect that watches for transaction success
      return {} as CreateVaultResult; // Temporary return

    } catch (err: any) {
      const errorMessage = decodeError(err);
      console.error('❌ Vault creation error:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Watch for transaction success and extract result
  useEffect(() => {
    if (isSuccess && hash) {
      // In a real implementation, you would parse the transaction receipt
      // to extract the vault ID and invite code from the VaultCreated event
      console.log('✅ Transaction confirmed:', hash);

      // For now, we'll set a placeholder result
      // TODO: Parse transaction receipt to get actual vault ID and invite code
      setResult({
        vaultId: BigInt(Date.now()), // Placeholder
        inviteCode: '0x' + Math.random().toString(16).slice(2), // Placeholder
        transactionHash: hash,
      });
    }
  }, [isSuccess, hash]);

  // Watch for transaction errors
  useEffect(() => {
    if (txError) {
      const errorMessage = decodeError(txError);
      console.error('❌ Transaction error:', txError);
      setError(errorMessage);
    }
  }, [txError]);

  return {
    createVault,
    isCreating: isCreating || isPending || isConfirming,
    isPending,
    isConfirming,
    isSuccess,
    error,
    result,
    hash,
  };
}


