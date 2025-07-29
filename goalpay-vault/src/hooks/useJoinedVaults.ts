import { useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { VaultData } from '@/contracts/types';
import { useGetVaultsPaginated, useGetVault, useGetMemberInfo } from './useVaultReads';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';

export interface UseJoinedVaultsReturn {
  vaults: VaultData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Configuration constants
const MAX_VAULTS_TO_CHECK = 25;
const VAULT_PAGINATION_LIMIT = 50;

/**
 * Hook to get goals that the current user has joined (but not created)
 * This checks membership across all goals and filters out user-created goals
 */
export function useJoinedVaults(): UseJoinedVaultsReturn {
  const { address } = useAccount();
  const chainId = useChainId();

  // Check if contracts are available for current chain
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const isChainSupported = !!contractAddresses?.GOAL_FINANCE;

  // Get paginated goals
  const {
    data: paginatedResult,
    isLoading: isLoadingPaginated,
    error: paginatedError,
    refetch: refetchPaginated
  } = useGetVaultsPaginated(0, VAULT_PAGINATION_LIMIT);

  // Memoize vault IDs to prevent unnecessary re-renders
  const vaultIds = useMemo(() => 
    (paginatedResult?.[0] || []).slice(0, MAX_VAULTS_TO_CHECK),
    [paginatedResult]
  );

  // Create arrays for hook calls (must be called the same number of times)
  // We need to call hooks unconditionally, so we use a fixed number
  const vault1 = useGetVault(vaultIds[0]);
  const vault2 = useGetVault(vaultIds[1]);
  const vault3 = useGetVault(vaultIds[2]);
  const vault4 = useGetVault(vaultIds[3]);
  const vault5 = useGetVault(vaultIds[4]);
  const vault6 = useGetVault(vaultIds[5]);
  const vault7 = useGetVault(vaultIds[6]);
  const vault8 = useGetVault(vaultIds[7]);
  const vault9 = useGetVault(vaultIds[8]);
  const vault10 = useGetVault(vaultIds[9]);
  const vault11 = useGetVault(vaultIds[10]);
  const vault12 = useGetVault(vaultIds[11]);
  const vault13 = useGetVault(vaultIds[12]);
  const vault14 = useGetVault(vaultIds[13]);
  const vault15 = useGetVault(vaultIds[14]);
  const vault16 = useGetVault(vaultIds[15]);
  const vault17 = useGetVault(vaultIds[16]);
  const vault18 = useGetVault(vaultIds[17]);
  const vault19 = useGetVault(vaultIds[18]);
  const vault20 = useGetVault(vaultIds[19]);
  const vault21 = useGetVault(vaultIds[20]);
  const vault22 = useGetVault(vaultIds[21]);
  const vault23 = useGetVault(vaultIds[22]);
  const vault24 = useGetVault(vaultIds[23]);
  const vault25 = useGetVault(vaultIds[24]);

  const member1 = useGetMemberInfo(vaultIds[0], address as `0x${string}`);
  const member2 = useGetMemberInfo(vaultIds[1], address as `0x${string}`);
  const member3 = useGetMemberInfo(vaultIds[2], address as `0x${string}`);
  const member4 = useGetMemberInfo(vaultIds[3], address as `0x${string}`);
  const member5 = useGetMemberInfo(vaultIds[4], address as `0x${string}`);
  const member6 = useGetMemberInfo(vaultIds[5], address as `0x${string}`);
  const member7 = useGetMemberInfo(vaultIds[6], address as `0x${string}`);
  const member8 = useGetMemberInfo(vaultIds[7], address as `0x${string}`);
  const member9 = useGetMemberInfo(vaultIds[8], address as `0x${string}`);
  const member10 = useGetMemberInfo(vaultIds[9], address as `0x${string}`);
  const member11 = useGetMemberInfo(vaultIds[10], address as `0x${string}`);
  const member12 = useGetMemberInfo(vaultIds[11], address as `0x${string}`);
  const member13 = useGetMemberInfo(vaultIds[12], address as `0x${string}`);
  const member14 = useGetMemberInfo(vaultIds[13], address as `0x${string}`);
  const member15 = useGetMemberInfo(vaultIds[14], address as `0x${string}`);
  const member16 = useGetMemberInfo(vaultIds[15], address as `0x${string}`);
  const member17 = useGetMemberInfo(vaultIds[16], address as `0x${string}`);
  const member18 = useGetMemberInfo(vaultIds[17], address as `0x${string}`);
  const member19 = useGetMemberInfo(vaultIds[18], address as `0x${string}`);
  const member20 = useGetMemberInfo(vaultIds[19], address as `0x${string}`);
  const member21 = useGetMemberInfo(vaultIds[20], address as `0x${string}`);
  const member22 = useGetMemberInfo(vaultIds[21], address as `0x${string}`);
  const member23 = useGetMemberInfo(vaultIds[22], address as `0x${string}`);
  const member24 = useGetMemberInfo(vaultIds[23], address as `0x${string}`);
  const member25 = useGetMemberInfo(vaultIds[24], address as `0x${string}`);

  // Combine hooks into arrays for easier processing
  const vaultHooks = useMemo(() => [
    vault1, vault2, vault3, vault4, vault5, vault6, vault7, vault8, vault9, vault10,
    vault11, vault12, vault13, vault14, vault15, vault16, vault17, vault18, vault19, vault20,
    vault21, vault22, vault23, vault24, vault25
  ], [
    vault1, vault2, vault3, vault4, vault5, vault6, vault7, vault8, vault9, vault10,
    vault11, vault12, vault13, vault14, vault15, vault16, vault17, vault18, vault19, vault20,
    vault21, vault22, vault23, vault24, vault25
  ]);

  const memberHooks = useMemo(() => [
    member1, member2, member3, member4, member5, member6, member7, member8, member9, member10,
    member11, member12, member13, member14, member15, member16, member17, member18, member19, member20,
    member21, member22, member23, member24, member25
  ], [
    member1, member2, member3, member4, member5, member6, member7, member8, member9, member10,
    member11, member12, member13, member14, member15, member16, member17, member18, member19, member20,
    member21, member22, member23, member24, member25
  ]);

  // Check loading states
  const isLoadingDetails = vaultHooks.some(hook => hook.isLoading) || 
                          memberHooks.some(hook => hook.isLoading);

  // Check for errors
  const detailsError = vaultHooks.find(hook => hook.error)?.error ||
                      memberHooks.find(hook => hook.error)?.error;

  // Transform and filter vault data
  const joinedVaults: VaultData[] = useMemo(() => {
    // Handle unsupported chain or no address
    if (!isChainSupported || !address) {
      return [];
    }

    // Handle error cases
    if (paginatedError) {
      console.warn('Error loading vaults:', paginatedError.message);
      return [];
    }

    const processedVaults: VaultData[] = [];

    for (let i = 0; i < vaultIds.length; i++) {
      const vaultId = vaultIds[i];
      const vaultQuery = vaultHooks[i];
      const memberQuery = memberHooks[i];
      
      const vaultInfo = vaultQuery?.data;
      const memberInfo = memberQuery?.data;

      // Skip if data not loaded or user is not a member
      if (!vaultInfo || !memberInfo) continue;

      // Type guard to ensure we have the expected structure
      if (typeof vaultInfo !== 'object' || typeof memberInfo !== 'object') continue;

      const vault = vaultInfo as {
        creator?: string;
        config?: {
          name?: string;
          description?: string;
          token?: string;
          goalType?: number;
          visibility?: number;
          targetAmount?: bigint;
          deadline?: bigint;
        };
        totalDeposited?: bigint;
        memberCount?: bigint;
        status?: number;
        inviteCode?: string;
        createdAt?: bigint;
      };

      const member = memberInfo as {
        depositedAmount?: bigint;
      };

      // Skip if user is the creator (these show in "My Goals" section)
      if (vault.creator?.toLowerCase() === address.toLowerCase()) continue;

      // Skip if user has no deposits (not really a member)
      if (!member.depositedAmount || member.depositedAmount === 0n) continue;

      processedVaults.push({
        id: vaultId,
        name: vault.config?.name || `Goal ${vaultId}`,
        description: vault.config?.description || '',
        creator: (vault.creator || '0x0') as `0x${string}`,
        token: (vault.config?.token || '0x0') as `0x${string}`,
        goalType: vault.config?.goalType || 0,
        visibility: vault.config?.visibility || 0,
        targetAmount: vault.config?.targetAmount || 0n,
        totalDeposited: vault.totalDeposited || 0n,
        deadline: vault.config?.deadline || 0n,
        memberCount: vault.memberCount || 0n,
        status: vault.status || 0,
        inviteCode: (vault.inviteCode || '0x0000000000000000000000000000000000000000000000000000000000000000') as `0x${string}`,
        createdAt: vault.createdAt || 0n,
      });
    }

    return processedVaults;
  }, [
    vaultIds,
    address,
    isChainSupported,
    paginatedError,
    vaultHooks,
    memberHooks
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
      vaultHooks.forEach(hook => hook.refetch?.());
      memberHooks.forEach(hook => hook.refetch?.());
    }
  };

  return {
    vaults: joinedVaults,
    isLoading,
    error,
    refetch,
  };
}
