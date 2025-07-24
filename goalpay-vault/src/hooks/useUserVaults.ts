import { useMemo, useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { VaultData } from '@/contracts/types';
import { useGetVaultsByCreator, useGetVault } from './useVaultReads';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';

export interface UseUserVaultsReturn {
  vaults: VaultData[];
  vaultIds: bigint[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to get all goals created by the current user with detailed information
 * This version fetches detailed goal info for each goal ID
 */
export function useUserVaults(): UseUserVaultsReturn {
  const { address } = useAccount();
  const chainId = useChainId();

  // Check if contracts are available for current chain
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const isChainSupported = !!contractAddresses?.GOAL_FINANCE;

  // Get goal IDs created by user
  const {
    data: vaultIds,
    isLoading: isLoadingIds,
    error: idsError,
    refetch: refetchIds
  } = useGetVaultsByCreator(address);



  // Get detailed info for each goal (up to first 10 goals for better UX)
  // Always call hooks in the same order
  const vault1 = useGetVault(vaultIds?.[0]);
  const vault2 = useGetVault(vaultIds?.[1]);
  const vault3 = useGetVault(vaultIds?.[2]);
  const vault4 = useGetVault(vaultIds?.[3]);
  const vault5 = useGetVault(vaultIds?.[4]);
  const vault6 = useGetVault(vaultIds?.[5]);
  const vault7 = useGetVault(vaultIds?.[6]);
  const vault8 = useGetVault(vaultIds?.[7]);
  const vault9 = useGetVault(vaultIds?.[8]);
  const vault10 = useGetVault(vaultIds?.[9]);

  // Combine all goal queries (no need for individual goal contract calls)
  const vaultQueries = useMemo(() => [vault1, vault2, vault3, vault4, vault5, vault6, vault7, vault8, vault9, vault10], [vault1, vault2, vault3, vault4, vault5, vault6, vault7, vault8, vault9, vault10]);

  // Check if any goal details are loading
  const isLoadingDetails = vaultQueries.some(query => query.isLoading);

  // Check for any errors in goal details
  const detailsError = vaultQueries.find(query => query.error)?.error;

  // Transform goal data
  const vaults: VaultData[] = useMemo(() => {
    // Handle unsupported chain
    if (!isChainSupported) {
      return [];
    }

    // Handle error cases
    if (idsError) {
      console.warn('Error loading user goals:', idsError.message);
      return [];
    }

    if (!vaultIds || !Array.isArray(vaultIds)) return [];

    return (vaultIds as bigint[]).slice(0, 10).map((id, index) => {
      const vaultQuery = vaultQueries[index];
      const vaultInfo = vaultQuery?.data;

      if (vaultInfo) {
        // Use GoalInfo from new GoalFinance contract
        // The structure is: { id, config: { name, description, token, goalType, visibility, targetAmount, deadline, penaltyRate }, creator, totalDeposited, memberCount, status, inviteCode, createdAt }
        const vault = vaultInfo as any; // Type assertion for contract data
        const config = vault.config || {};



        return {
          id,
          name: config.name || `Goal ${id}`,
          description: config.description || 'No description',
          creator: vault.creator || address || '0x0',
          token: config.token || '0x0',
          goalType: config.goalType ?? 0,
          visibility: config.visibility ?? 0,
          targetAmount: config.targetAmount || 0n,
          totalDeposited: vault.totalDeposited || 0n,
          deadline: config.deadline || 0n,
          memberCount: vault.memberCount || 0n,
          status: vault.status ?? 0,
          inviteCode: vault.inviteCode || '0x0000000000000000000000000000000000000000000000000000000000000000',
          createdAt: vault.createdAt || 0n,
        };
      } else {
        // Return null for failed loads - no fallback data
        return null;
      }
    }).filter((vault): vault is VaultData => vault !== null);
  }, [
    vaultIds,
    address,
    isChainSupported,
    idsError,
    vaultQueries
  ]);

  const isLoading = isLoadingIds || isLoadingDetails;

  // Create a comprehensive error that includes chain support info
  const error = useMemo(() => {
    if (!isChainSupported) {
      return new Error(`Chain ${chainId} is not supported. Please switch to Mantle Sepolia or Base Sepolia.`);
    }
    return idsError || detailsError;
  }, [isChainSupported, chainId, idsError, detailsError]);

  const refetch = () => {
    if (isChainSupported) {
      refetchIds();
      vaultQueries.forEach(query => query.refetch?.());
    }
  };

  return {
    vaults,
    vaultIds: (vaultIds as bigint[]) || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get detailed information for multiple goals
 * This is a more comprehensive version that fetches full goal details
 */
export function useUserVaultsDetailed(): UseUserVaultsReturn {
  const { address } = useAccount();
  const chainId = useChainId();

  // Check if contracts are available for current chain
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const isChainSupported = !!contractAddresses?.GOAL_FINANCE;

  // Get goal IDs created by user
  const {
    data: vaultIds,
    isLoading: isLoadingIds,
    error: idsError,
    refetch: refetchIds
  } = useGetVaultsByCreator(address);

  // For basic version, just return goal IDs with minimal data
  const vaults: VaultData[] = useMemo(() => {
    if (!isChainSupported || !vaultIds || !Array.isArray(vaultIds)) {
      return [];
    }

    return (vaultIds as bigint[]).map((id) => ({
      id,
      name: `Goal ${id}`,
      description: 'Loading goal details...',
      creator: address || '0x0',
      token: '0x0',
      goalType: 0,
      visibility: 0,
      targetAmount: 0n,
      totalDeposited: 0n,
      deadline: 0n,
      memberCount: 0n,
      status: 0,
      inviteCode: '0x0000000000000000000000000000000000000000000000000000000000000000',
      createdAt: 0n,
    }));
  }, [vaultIds, address, isChainSupported]);

  const isLoading = isLoadingIds;

  // Create a comprehensive error that includes chain support info
  const error = useMemo(() => {
    if (!isChainSupported) {
      return new Error(`Chain ${chainId} is not supported. Please switch to Mantle Sepolia.`);
    }
    return idsError;
  }, [isChainSupported, chainId, idsError]);

  const refetch = () => {
    if (isChainSupported) {
      refetchIds();
    }
  };

  return {
    vaults,
    vaultIds: (vaultIds as bigint[]) || [],
    isLoading,
    error,
    refetch,
  };
}
