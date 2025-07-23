import { useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { VaultData } from '@/contracts/types';
import { useGetVaultsPaginated, useGetVault, useGetMemberInfo } from './useVaultReads';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { formatUnits } from 'viem';

export interface UseJoinedVaultsReturn {
  vaults: VaultData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to get vaults that the current user has joined (but not created)
 * This checks membership across all vaults and filters out user-created vaults
 */
export function useJoinedVaults(): UseJoinedVaultsReturn {
  const { address } = useAccount();
  const chainId = useChainId();

  // Check if contracts are available for current chain
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const isChainSupported = !!contractAddresses?.GOAL_FINANCE;

  // Get paginated vaults (first 50 vaults to check)
  const {
    data: paginatedResult,
    isLoading: isLoadingPaginated,
    error: paginatedError,
    refetch: refetchPaginated
  } = useGetVaultsPaginated(0, 50);

  const vaultIds = paginatedResult?.[0] || [];

  // Get detailed info for each vault (up to first 10 for performance)
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

  // Get membership info for each vault
  const member1 = useGetMemberInfo(vaultIds?.[0], address);
  const member2 = useGetMemberInfo(vaultIds?.[1], address);
  const member3 = useGetMemberInfo(vaultIds?.[2], address);
  const member4 = useGetMemberInfo(vaultIds?.[3], address);
  const member5 = useGetMemberInfo(vaultIds?.[4], address);
  const member6 = useGetMemberInfo(vaultIds?.[5], address);
  const member7 = useGetMemberInfo(vaultIds?.[6], address);
  const member8 = useGetMemberInfo(vaultIds?.[7], address);
  const member9 = useGetMemberInfo(vaultIds?.[8], address);
  const member10 = useGetMemberInfo(vaultIds?.[9], address);

  // Combine all vault and member queries
  const vaultQueries = useMemo(() => [
    vault1, vault2, vault3, vault4, vault5,
    vault6, vault7, vault8, vault9, vault10
  ], [vault1, vault2, vault3, vault4, vault5, vault6, vault7, vault8, vault9, vault10]);

  const memberQueries = useMemo(() => [
    member1, member2, member3, member4, member5,
    member6, member7, member8, member9, member10
  ], [member1, member2, member3, member4, member5, member6, member7, member8, member9, member10]);

  // Check if any queries are loading
  const isLoadingDetails = vaultQueries.some(query => query.isLoading) || 
                          memberQueries.some(query => query.isLoading);

  // Check for any errors
  const detailsError = vaultQueries.find(query => query.error)?.error ||
                      memberQueries.find(query => query.error)?.error;

  // Transform and filter vault data
  const joinedVaults: VaultData[] = useMemo(() => {
    // Handle unsupported chain
    if (!isChainSupported || !address) {
      return [];
    }

    // Handle error cases
    if (paginatedError) {
      console.warn('Error loading vaults:', paginatedError.message);
      return [];
    }

    if (!vaultIds || !Array.isArray(vaultIds)) return [];

    return (vaultIds as bigint[]).slice(0, 10).map((id, index) => {
      const vaultQuery = vaultQueries[index];
      const memberQuery = memberQueries[index];
      
      const vaultInfo = vaultQuery?.data;
      const memberInfo = memberQuery?.data;

      // Skip if vault data not loaded or user is not a member
      if (!vaultInfo || !memberInfo) return null;

      // Skip if user is the creator (these show in "My Vaults" section)
      if (vaultInfo.creator?.toLowerCase() === address.toLowerCase()) return null;

      // Skip if user has no deposits (not really a member)
      if (!memberInfo.depositedAmount || memberInfo.depositedAmount === 0n) return null;

      return {
        id,
        name: vaultInfo.config?.name || `Vault ${id}`,
        description: vaultInfo.config?.description || '',
        creator: vaultInfo.creator || '0x0',
        token: vaultInfo.config?.token || '0x0',
        goalType: vaultInfo.config?.goalType || 0,
        visibility: vaultInfo.config?.visibility || 0,
        targetAmount: vaultInfo.config?.targetAmount || 0n,
        totalDeposited: vaultInfo.totalDeposited || 0n,
        deadline: vaultInfo.config?.deadline || 0n,
        memberCount: vaultInfo.memberCount || 0n,
        status: vaultInfo.status || 0,
        inviteCode: vaultInfo.inviteCode || '0x0000000000000000000000000000000000000000000000000000000000000000',
        createdAt: vaultInfo.createdAt || 0n,
      };
    }).filter((vault): vault is VaultData => vault !== null);
  }, [
    vaultIds,
    address,
    isChainSupported,
    paginatedError,
    vaultQueries,
    memberQueries
  ]);

  const isLoading = isLoadingPaginated || isLoadingDetails;

  // Create a comprehensive error
  const error = useMemo(() => {
    if (!isChainSupported) {
      return new Error(`Chain ${chainId} is not supported. Please switch to Mantle Sepolia or Base Sepolia.`);
    }
    return paginatedError || detailsError;
  }, [isChainSupported, chainId, paginatedError, detailsError]);

  const refetch = () => {
    if (isChainSupported) {
      refetchPaginated();
      vaultQueries.forEach(query => query.refetch?.());
      memberQueries.forEach(query => query.refetch?.());
    }
  };

  return {
    vaults: joinedVaults,
    isLoading,
    error,
    refetch,
  };
}
