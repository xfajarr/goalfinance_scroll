import { useMemo, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { VaultData } from '@/contracts/types';
import { useGetVaultsByCreator, useGetVault, useGetVaultDetails } from './useVaultReads';

export interface UseUserVaultsReturn {
  vaults: VaultData[];
  vaultIds: bigint[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to get all vaults created by the current user with detailed information
 * This version fetches detailed vault info for each vault ID
 */
export function useUserVaults(): UseUserVaultsReturn {
  const { address } = useAccount();

  // Get vault IDs created by user
  const {
    data: vaultIds,
    isLoading: isLoadingIds,
    error: idsError,
    refetch: refetchIds
  } = useGetVaultsByCreator(address);

  // Get detailed info for each vault (up to first 5 vaults for performance)
  const vault1 = useGetVault(vaultIds?.[0]);
  const vault2 = useGetVault(vaultIds?.[1]);
  const vault3 = useGetVault(vaultIds?.[2]);
  const vault4 = useGetVault(vaultIds?.[3]);
  const vault5 = useGetVault(vaultIds?.[4]);

  // Get detailed vault data from individual vault contracts
  const vaultDetails1 = useGetVaultDetails(vault1.data?.vaultAddress);
  const vaultDetails2 = useGetVaultDetails(vault2.data?.vaultAddress);
  const vaultDetails3 = useGetVaultDetails(vault3.data?.vaultAddress);
  const vaultDetails4 = useGetVaultDetails(vault4.data?.vaultAddress);
  const vaultDetails5 = useGetVaultDetails(vault5.data?.vaultAddress);

  // Combine all vault queries
  const vaultQueries = [vault1, vault2, vault3, vault4, vault5];
  const vaultDetailsQueries = [vaultDetails1, vaultDetails2, vaultDetails3, vaultDetails4, vaultDetails5];

  // Check if any vault details are loading
  const isLoadingDetails = vaultQueries.some(query => query.isLoading) ||
                          vaultDetailsQueries.some(query => query.isLoading);

  // Check for any errors in vault details
  const detailsError = vaultQueries.find(query => query.error)?.error ||
                      vaultDetailsQueries.find(query => query.error)?.error;

  // Transform vault data
  const vaults: VaultData[] = useMemo(() => {
    if (!vaultIds) return [];

    return vaultIds.slice(0, 5).map((id, index) => {
      const vaultQuery = vaultQueries[index];
      const vaultDetailsQuery = vaultDetailsQueries[index];
      const vaultInfo = vaultQuery?.data;
      const vaultDetails = vaultDetailsQuery?.data;

      if (vaultInfo && vaultDetails) {
        // Transform VaultInfo + VaultDetails to VaultData format
        return {
          id,
          name: vaultDetails.name,
          description: vaultDetails.description,
          creator: vaultDetails.creator,
          goalAmount: vaultDetails.targetAmount,
          currentAmount: vaultDetails.currentAmount, // Now we have the real current amount!
          deadline: vaultDetails.deadline,
          status: vaultDetails.status,
          isPublic: vaultDetails.isPublic,
          memberCount: vaultDetails.memberCount,
          yieldRate: 0n,
          createdAt: vaultDetails.createdAt,
        };
      } else if (vaultInfo) {
        // Partial data from factory only
        return {
          id,
          name: vaultInfo.vaultName,
          description: vaultInfo.description,
          creator: vaultInfo.creator,
          goalAmount: vaultInfo.targetAmount,
          currentAmount: 0n, // Don't have vault details yet
          deadline: vaultInfo.deadline,
          status: vaultInfo.status,
          isPublic: vaultInfo.isPublic,
          memberCount: vaultInfo.memberCount,
          yieldRate: 0n,
          createdAt: vaultInfo.createdAt,
        };
      } else {
        // Fallback data while loading
        return {
          id,
          name: `Vault ${id}`,
          description: 'Loading...',
          creator: address || '0x0',
          goalAmount: 0n,
          currentAmount: 0n,
          deadline: 0n,
          status: 0,
          isPublic: false,
          memberCount: 0n,
          yieldRate: 0n,
          createdAt: 0n,
        };
      }
    });
  }, [
    vaultIds,
    vault1.data, vault2.data, vault3.data, vault4.data, vault5.data,
    vaultDetails1.data, vaultDetails2.data, vaultDetails3.data, vaultDetails4.data, vaultDetails5.data,
    address
  ]);

  const isLoading = isLoadingIds || isLoadingDetails;
  const error = idsError || detailsError;

  const refetch = () => {
    refetchIds();
    vaultQueries.forEach(query => query.refetch?.());
    vaultDetailsQueries.forEach(query => query.refetch?.());
  };

  return {
    vaults,
    vaultIds: vaultIds || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get detailed information for multiple vaults
 * This is a more comprehensive version that fetches full vault details
 */
export function useUserVaultsDetailed(): UseUserVaultsReturn {
  const { address } = useAccount();
  
  // Get vault IDs created by user
  const { 
    data: vaultIds, 
    isLoading: isLoadingIds, 
    error: idsError,
    refetch: refetchIds
  } = useGetVaultsByCreator(address);

  // For the detailed version, we'll need to implement a pattern
  // that can handle dynamic vault fetching. For now, let's use
  // the basic version and enhance it later.
  
  const isLoading = isLoadingIds;
  const error = idsError;

  const vaults: VaultData[] = useMemo(() => {
    if (!vaultIds || !address) return [];
    
    return vaultIds.map((id) => ({
      id,
      name: `My Vault ${id}`,
      description: 'User created vault',
      creator: address,
      goalAmount: 1000000000n, // $1000 default
      currentAmount: 0n,
      deadline: BigInt(Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)), // 30 days
      status: 0, // ACTIVE
      isPublic: false,
      memberCount: 1n,
      yieldRate: 0n,
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
    }));
  }, [vaultIds, address]);

  const refetch = () => {
    refetchIds();
  };

  return {
    vaults,
    vaultIds: vaultIds || [],
    isLoading,
    error,
    refetch,
  };
}
