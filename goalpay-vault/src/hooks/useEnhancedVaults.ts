import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Address } from 'viem';
import { GOAL_FINANCE_CONTRACT } from '@/config/contracts';
import { queryUserVaults, queryVaultById, graphqlCache, handleGraphQLError } from '@/lib/graphql';

// Enhanced vault data combining contract and GraphQL data
export interface EnhancedVaultData {
  // Contract data
  id: bigint;
  config: {
    name: string;
    description: string;
    token: Address;
    goalType: number;
    visibility: number;
    targetAmount: bigint;
    deadline: bigint;
    penaltyRate: bigint;
  };
  creator: Address;
  totalDeposited: bigint;
  memberCount: bigint;
  status: number;
  inviteCode: string;
  createdAt: bigint;
  
  // Enhanced GraphQL data
  members?: Address[];
  memberDetails?: any[];
  transactions?: any[];
  progress?: {
    percentage: number;
    isGoalReached: boolean;
    timeRemaining: bigint;
    isExpired: boolean;
  };
}

// Hook for enhanced vault data with GraphQL integration
export function useEnhancedVaultData(vaultId?: bigint) {
  const [graphqlData, setGraphqlData] = useState<any>(null);
  const [isLoadingGraphQL, setIsLoadingGraphQL] = useState(false);
  const [graphqlError, setGraphqlError] = useState<string | null>(null);

  // Get contract data
  const { data: contractVault, isLoading: isLoadingContract, error: contractError, refetch } = useReadContract({
    ...GOAL_FINANCE_CONTRACT,
    functionName: 'getVault',
    args: vaultId ? [vaultId] : undefined,
    query: {
      enabled: !!vaultId,
    },
  });

  // Get members from contract
  const { data: members } = useReadContract({
    ...GOAL_FINANCE_CONTRACT,
    functionName: 'getVaultMembers',
    args: vaultId ? [vaultId] : undefined,
    query: {
      enabled: !!vaultId,
    },
  });

  // Fetch GraphQL data
  const fetchGraphQLData = useCallback(async () => {
    if (!vaultId) return;

    const cacheKey = `vault-${vaultId.toString()}`;
    const cached = graphqlCache.get(cacheKey);
    if (cached) {
      setGraphqlData(cached);
      return;
    }

    setIsLoadingGraphQL(true);
    setGraphqlError(null);

    try {
      const data = await queryVaultById(vaultId.toString());
      setGraphqlData(data);
      graphqlCache.set(cacheKey, data, 30000); // Cache for 30 seconds
    } catch (error) {
      setGraphqlError(handleGraphQLError(error));
    } finally {
      setIsLoadingGraphQL(false);
    }
  }, [vaultId]);

  useEffect(() => {
    fetchGraphQLData();
  }, [fetchGraphQLData]);

  // Combine contract and GraphQL data
  const enhancedVault: EnhancedVaultData | null = contractVault ? {
    ...(contractVault as any),
    members: members as Address[],
    memberDetails: graphqlData?.vault?.members || [],
    transactions: graphqlData?.vault?.transactions || [],
    progress: contractVault ? {
      percentage: Number((contractVault as any).totalDeposited * 100n / (contractVault as any).config.targetAmount),
      isGoalReached: (contractVault as any).totalDeposited >= (contractVault as any).config.targetAmount,
      timeRemaining: (contractVault as any).config.deadline - BigInt(Math.floor(Date.now() / 1000)),
      isExpired: (contractVault as any).config.deadline < BigInt(Math.floor(Date.now() / 1000)),
    } : undefined,
  } : null;

  return {
    vault: enhancedVault,
    isLoading: isLoadingContract || isLoadingGraphQL,
    error: contractError || graphqlError,
    refetch: () => {
      refetch();
      fetchGraphQLData();
    },
  };
}

// Hook for user's vaults with GraphQL enhancement
export function useEnhancedUserVaults() {
  const { address } = useAccount();
  const [graphqlVaults, setGraphqlVaults] = useState<any[]>([]);
  const [isLoadingGraphQL, setIsLoadingGraphQL] = useState(false);
  const [graphqlError, setGraphqlError] = useState<string | null>(null);

  // Get vault IDs from contract
  const { data: vaultIds, isLoading: isLoadingContract, error: contractError, refetch } = useReadContract({
    ...GOAL_FINANCE_CONTRACT,
    functionName: 'getVaultsByCreator',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Fetch GraphQL data for user vaults
  const fetchGraphQLVaults = useCallback(async () => {
    if (!address) return;

    const cacheKey = `user-vaults-${address}`;
    const cached = graphqlCache.get(cacheKey);
    if (cached) {
      setGraphqlVaults(cached.vaults || []);
      return;
    }

    setIsLoadingGraphQL(true);
    setGraphqlError(null);

    try {
      const data = await queryUserVaults(address);
      setGraphqlVaults(data.vaults || []);
      graphqlCache.set(cacheKey, data, 60000); // Cache for 1 minute
    } catch (error) {
      setGraphqlError(handleGraphQLError(error));
    } finally {
      setIsLoadingGraphQL(false);
    }
  }, [address]);

  useEffect(() => {
    fetchGraphQLVaults();
  }, [fetchGraphQLVaults]);

  return {
    vaultIds: (vaultIds as bigint[]) || [],
    graphqlVaults,
    isLoading: isLoadingContract || isLoadingGraphQL,
    error: contractError || graphqlError,
    refetch: () => {
      refetch();
      fetchGraphQLVaults();
    },
  };
}

// Hook for vault discovery with GraphQL
export function useVaultDiscovery(filters?: {
  goalType?: number;
  token?: Address;
  minAmount?: bigint;
  maxAmount?: bigint;
}) {
  const [vaults, setVaults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchVaults = useCallback(async (skip = 0, first = 20) => {
    setIsLoading(true);
    setError(null);

    try {
      const where: any = { visibility: 0 }; // Public vaults only
      
      if (filters?.goalType !== undefined) {
        where.goalType = filters.goalType;
      }
      
      if (filters?.token) {
        where.token = filters.token.toLowerCase();
      }
      
      if (filters?.minAmount) {
        where.targetAmount_gte = filters.minAmount.toString();
      }
      
      if (filters?.maxAmount) {
        where.targetAmount_lte = filters.maxAmount.toString();
      }

      const data = await queryUserVaults(''); // This needs to be updated for discovery
      
      if (skip === 0) {
        setVaults(data.vaults || []);
      } else {
        setVaults(prev => [...prev, ...(data.vaults || [])]);
      }
      
      setHasMore((data.vaults || []).length === first);
    } catch (error) {
      setError(handleGraphQLError(error));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchVaults(vaults.length);
    }
  }, [fetchVaults, vaults.length, isLoading, hasMore]);

  useEffect(() => {
    fetchVaults(0);
  }, [fetchVaults]);

  return {
    vaults,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchVaults(0),
  };
}

// Hook for vault statistics
export function useVaultStatistics() {
  const [stats, setStats] = useState({
    totalVaults: 0,
    totalValueLocked: '0',
    activeVaults: 0,
    completedVaults: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // This would need a specific GraphQL query for statistics
      // For now, we'll use contract calls
      const totalVaults = await GOAL_FINANCE_CONTRACT.abi;
      // Implementation would depend on available contract functions
      
      setStats({
        totalVaults: 0, // Placeholder
        totalValueLocked: '0',
        activeVaults: 0,
        completedVaults: 0,
      });
    } catch (error) {
      setError(handleGraphQLError(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
