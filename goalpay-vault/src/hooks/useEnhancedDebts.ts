import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Address } from 'viem';
import { DEBT_MANAGER_CONTRACT } from '@/config/contracts';
import { queryUserDebts, graphqlCache, handleGraphQLError } from '@/lib/graphql';

// Enhanced debt data combining contract and GraphQL data
export interface EnhancedDebtData {
  // Contract data
  id: bigint;
  creditor: Address;
  debtor: Address;
  token: Address;
  amount: bigint;
  description: string;
  category: string;
  billId?: bigint;
  settled: boolean;
  createdAt: bigint;
  settledAt?: bigint;
  
  // Enhanced GraphQL data
  transactions?: any[];
  relatedBill?: any;
  creditorInfo?: {
    displayName?: string;
    address: Address;
  };
  debtorInfo?: {
    displayName?: string;
    address: Address;
  };
}

// Hook for enhanced debt data with GraphQL integration
export function useEnhancedUserDebts() {
  const { address } = useAccount();
  const [graphqlDebts, setGraphqlDebts] = useState<any[]>([]);
  const [isLoadingGraphQL, setIsLoadingGraphQL] = useState(false);
  const [graphqlError, setGraphqlError] = useState<string | null>(null);

  // Get debt IDs from contract
  const { data: debtIds, isLoading: isLoadingContract, error: contractError, refetch } = useReadContract({
    ...DEBT_MANAGER_CONTRACT,
    functionName: 'getUserDebts',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Fetch GraphQL data for user debts
  const fetchGraphQLDebts = useCallback(async () => {
    if (!address) return;

    const cacheKey = `user-debts-${address}`;
    const cached = graphqlCache.get(cacheKey);
    if (cached) {
      setGraphqlDebts(cached.debts || []);
      return;
    }

    setIsLoadingGraphQL(true);
    setGraphqlError(null);

    try {
      const data = await queryUserDebts(address);
      setGraphqlDebts(data.debts || []);
      graphqlCache.set(cacheKey, data, 60000); // Cache for 1 minute
    } catch (error) {
      setGraphqlError(handleGraphQLError(error));
    } finally {
      setIsLoadingGraphQL(false);
    }
  }, [address]);

  useEffect(() => {
    fetchGraphQLDebts();
  }, [fetchGraphQLDebts]);

  return {
    debtIds: (debtIds as bigint[]) || [],
    graphqlDebts,
    isLoading: isLoadingContract || isLoadingGraphQL,
    error: contractError || graphqlError,
    refetch: () => {
      refetch();
      fetchGraphQLDebts();
    },
  };
}

// Hook for debt statistics and summaries
export function useDebtStatistics() {
  const { address } = useAccount();
  const [stats, setStats] = useState({
    totalOwed: Record<Address, bigint>,
    totalOwing: Record<Address, bigint>,
    netBalances: Record<Address, bigint>,
    activeDebts: 0,
    settledDebts: 0,
    totalDebts: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get debt summaries from contract
      const owedSummary = await DEBT_MANAGER_CONTRACT.abi; // This would be a contract call
      const owingSummary = await DEBT_MANAGER_CONTRACT.abi; // This would be a contract call
      
      // Combine with GraphQL data for enhanced statistics
      const graphqlData = await queryUserDebts(address);
      
      setStats({
        totalOwed: {}, // Would be populated from contract calls
        totalOwing: {},
        netBalances: {},
        activeDebts: graphqlData.debts?.filter((d: any) => !d.settled).length || 0,
        settledDebts: graphqlData.debts?.filter((d: any) => d.settled).length || 0,
        totalDebts: graphqlData.debts?.length || 0,
      });
    } catch (error) {
      setError(handleGraphQLError(error));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

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

// Hook for debt relationships between users
export function useDebtRelationships(otherUser?: Address) {
  const { address } = useAccount();
  const [relationships, setRelationships] = useState<{
    owedToOther: bigint;
    owedFromOther: bigint;
    netBalance: bigint;
    debts: EnhancedDebtData[];
  }>({
    owedToOther: 0n,
    owedFromOther: 0n,
    netBalance: 0n,
    debts: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationships = useCallback(async () => {
    if (!address || !otherUser) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would combine contract calls and GraphQL data
      // For now, we'll use placeholder values
      setRelationships({
        owedToOther: 0n,
        owedFromOther: 0n,
        netBalance: 0n,
        debts: [],
      });
    } catch (error) {
      setError(handleGraphQLError(error));
    } finally {
      setIsLoading(false);
    }
  }, [address, otherUser]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  return {
    relationships,
    isLoading,
    error,
    refetch: fetchRelationships,
  };
}

// Hook for debt settlement tracking
export function useDebtSettlement(debtId?: bigint) {
  const [settlementData, setSettlementData] = useState({
    canSettle: false,
    settlementAmount: 0n,
    partialPayments: [] as any[],
    totalPaid: 0n,
    remainingAmount: 0n,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettlementData = useCallback(async () => {
    if (!debtId) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would combine contract calls for settlement data
      setSettlementData({
        canSettle: false,
        settlementAmount: 0n,
        partialPayments: [],
        totalPaid: 0n,
        remainingAmount: 0n,
      });
    } catch (error) {
      setError(handleGraphQLError(error));
    } finally {
      setIsLoading(false);
    }
  }, [debtId]);

  useEffect(() => {
    fetchSettlementData();
  }, [fetchSettlementData]);

  return {
    settlementData,
    isLoading,
    error,
    refetch: fetchSettlementData,
  };
}

// Hook for debt categories and analytics
export function useDebtAnalytics() {
  const { address } = useAccount();
  const [analytics, setAnalytics] = useState({
    byCategory: {} as Record<string, { count: number; totalAmount: bigint }>,
    byToken: {} as Record<Address, { count: number; totalAmount: bigint }>,
    byTimeframe: {
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0,
    },
    trends: {
      increasing: false,
      averageAmount: 0n,
      mostCommonCategory: '',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would use GraphQL data for analytics
      const data = await queryUserDebts(address);
      
      // Process data for analytics
      const byCategory: Record<string, { count: number; totalAmount: bigint }> = {};
      const byToken: Record<Address, { count: number; totalAmount: bigint }> = {};
      
      data.debts?.forEach((debt: any) => {
        // Process by category
        if (!byCategory[debt.category]) {
          byCategory[debt.category] = { count: 0, totalAmount: 0n };
        }
        byCategory[debt.category].count++;
        byCategory[debt.category].totalAmount += BigInt(debt.amount);
        
        // Process by token
        if (!byToken[debt.token]) {
          byToken[debt.token] = { count: 0, totalAmount: 0n };
        }
        byToken[debt.token].count++;
        byToken[debt.token].totalAmount += BigInt(debt.amount);
      });
      
      setAnalytics({
        byCategory,
        byToken,
        byTimeframe: {
          thisWeek: 0, // Would be calculated from timestamps
          thisMonth: 0,
          thisYear: 0,
        },
        trends: {
          increasing: false,
          averageAmount: 0n,
          mostCommonCategory: Object.keys(byCategory)[0] || '',
        },
      });
    } catch (error) {
      setError(handleGraphQLError(error));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
