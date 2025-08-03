import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Address } from 'viem';
import { BILL_SPLITTER_CONTRACT } from '@/config/contracts';
import { queryUserBills, graphqlCache, handleGraphQLError } from '@/lib/graphql';

// Enhanced bill data combining contract and GraphQL data
export interface EnhancedBillData {
  // Contract data
  id: bigint;
  creator: Address;
  title: string;
  description: string;
  totalAmount: bigint;
  token: Address;
  splitMode: number;
  category: string;
  participants: Address[];
  settled: boolean;
  createdAt: bigint;
  
  // Enhanced GraphQL data
  transactions?: any[];
  settlements?: any[];
  participantShares?: Record<Address, bigint>;
  progress?: {
    totalPaid: bigint;
    remainingAmount: bigint;
    percentagePaid: number;
    participantsPaid: number;
    totalParticipants: number;
  };
}

// Hook for enhanced bill data with GraphQL integration
export function useEnhancedBillData(billId?: bigint) {
  const [graphqlData, setGraphqlData] = useState<any>(null);
  const [isLoadingGraphQL, setIsLoadingGraphQL] = useState(false);
  const [graphqlError, setGraphqlError] = useState<string | null>(null);

  // Get contract data
  const { data: contractBill, isLoading: isLoadingContract, error: contractError, refetch } = useReadContract({
    ...BILL_SPLITTER_CONTRACT,
    functionName: 'getBill',
    args: billId ? [billId] : undefined,
    query: {
      enabled: !!billId,
    },
  });

  // Get participants from contract
  const { data: participants } = useReadContract({
    ...BILL_SPLITTER_CONTRACT,
    functionName: 'getBillParticipants',
    args: billId ? [billId] : undefined,
    query: {
      enabled: !!billId,
    },
  });

  // Fetch GraphQL data
  const fetchGraphQLData = useCallback(async () => {
    if (!billId) return;

    const cacheKey = `bill-${billId.toString()}`;
    const cached = graphqlCache.get(cacheKey);
    if (cached) {
      setGraphqlData(cached);
      return;
    }

    setIsLoadingGraphQL(true);
    setGraphqlError(null);

    try {
      // This would need a specific GraphQL query for bill details
      // For now, we'll use a placeholder
      const data = { bill: null }; // await queryBillById(billId.toString());
      setGraphqlData(data);
      graphqlCache.set(cacheKey, data, 30000); // Cache for 30 seconds
    } catch (error) {
      setGraphqlError(handleGraphQLError(error));
    } finally {
      setIsLoadingGraphQL(false);
    }
  }, [billId]);

  useEffect(() => {
    fetchGraphQLData();
  }, [fetchGraphQLData]);

  // Combine contract and GraphQL data
  const enhancedBill: EnhancedBillData | null = contractBill ? {
    ...(contractBill as any),
    participants: participants as Address[],
    transactions: graphqlData?.bill?.transactions || [],
    settlements: graphqlData?.bill?.settlements || [],
    participantShares: {}, // Would be populated from contract calls
    progress: {
      totalPaid: 0n, // Would be calculated from settlements
      remainingAmount: (contractBill as any).totalAmount,
      percentagePaid: 0,
      participantsPaid: 0,
      totalParticipants: (participants as Address[])?.length || 0,
    },
  } : null;

  return {
    bill: enhancedBill,
    isLoading: isLoadingContract || isLoadingGraphQL,
    error: contractError || graphqlError,
    refetch: () => {
      refetch();
      fetchGraphQLData();
    },
  };
}

// Hook for user's bills with GraphQL enhancement
export function useEnhancedUserBills() {
  const { address } = useAccount();
  const [graphqlBills, setGraphqlBills] = useState<any[]>([]);
  const [isLoadingGraphQL, setIsLoadingGraphQL] = useState(false);
  const [graphqlError, setGraphqlError] = useState<string | null>(null);

  // Get bill IDs from contract
  const { data: billIds, isLoading: isLoadingContract, error: contractError, refetch } = useReadContract({
    ...BILL_SPLITTER_CONTRACT,
    functionName: 'getUserBills',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Fetch GraphQL data for user bills
  const fetchGraphQLBills = useCallback(async () => {
    if (!address) return;

    const cacheKey = `user-bills-${address}`;
    const cached = graphqlCache.get(cacheKey);
    if (cached) {
      setGraphqlBills(cached.bills || []);
      return;
    }

    setIsLoadingGraphQL(true);
    setGraphqlError(null);

    try {
      const data = await queryUserBills(address);
      setGraphqlBills(data.bills || []);
      graphqlCache.set(cacheKey, data, 60000); // Cache for 1 minute
    } catch (error) {
      setGraphqlError(handleGraphQLError(error));
    } finally {
      setIsLoadingGraphQL(false);
    }
  }, [address]);

  useEffect(() => {
    fetchGraphQLBills();
  }, [fetchGraphQLBills]);

  return {
    billIds: (billIds as bigint[]) || [],
    graphqlBills,
    isLoading: isLoadingContract || isLoadingGraphQL,
    error: contractError || graphqlError,
    refetch: () => {
      refetch();
      fetchGraphQLBills();
    },
  };
}

// Hook for bill statistics
export function useBillStatistics() {
  const { address } = useAccount();
  const [stats, setStats] = useState({
    totalBills: 0,
    activeBills: 0,
    settledBills: 0,
    totalOwed: '0',
    totalOwing: '0',
    netBalance: '0',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would combine contract calls and GraphQL data
      // For now, we'll use placeholder values
      setStats({
        totalBills: 0,
        activeBills: 0,
        settledBills: 0,
        totalOwed: '0',
        totalOwing: '0',
        netBalance: '0',
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

// Hook for bill participant management
export function useBillParticipants(billId?: bigint) {
  const [participants, setParticipants] = useState<Address[]>([]);
  const [participantShares, setParticipantShares] = useState<Record<Address, bigint>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get participants from contract
  const { data: contractParticipants, refetch } = useReadContract({
    ...BILL_SPLITTER_CONTRACT,
    functionName: 'getBillParticipants',
    args: billId ? [billId] : undefined,
    query: {
      enabled: !!billId,
    },
  });

  const fetchParticipantShares = useCallback(async () => {
    if (!billId || !contractParticipants) return;

    setIsLoading(true);
    setError(null);

    try {
      const shares: Record<Address, bigint> = {};
      
      // Fetch share for each participant
      for (const participant of contractParticipants as Address[]) {
        // This would need a contract call to get participant share
        // shares[participant] = await getParticipantShare(billId, participant);
        shares[participant] = 0n; // Placeholder
      }
      
      setParticipantShares(shares);
    } catch (error) {
      setError(handleGraphQLError(error));
    } finally {
      setIsLoading(false);
    }
  }, [billId, contractParticipants]);

  useEffect(() => {
    setParticipants((contractParticipants as Address[]) || []);
    fetchParticipantShares();
  }, [contractParticipants, fetchParticipantShares]);

  return {
    participants,
    participantShares,
    isLoading,
    error,
    refetch: () => {
      refetch();
      fetchParticipantShares();
    },
  };
}

// Hook for bill settlement tracking
export function useBillSettlement(billId?: bigint) {
  const { address } = useAccount();
  const [settlementStatus, setSettlementStatus] = useState({
    isSettled: false,
    userPaid: false,
    userAmount: 0n,
    totalPaid: 0n,
    remainingAmount: 0n,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettlementStatus = useCallback(async () => {
    if (!billId || !address) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would combine multiple contract calls
      // For now, we'll use placeholder values
      setSettlementStatus({
        isSettled: false,
        userPaid: false,
        userAmount: 0n,
        totalPaid: 0n,
        remainingAmount: 0n,
      });
    } catch (error) {
      setError(handleGraphQLError(error));
    } finally {
      setIsLoading(false);
    }
  }, [billId, address]);

  useEffect(() => {
    fetchSettlementStatus();
  }, [fetchSettlementStatus]);

  return {
    settlementStatus,
    isLoading,
    error,
    refetch: fetchSettlementStatus,
  };
}
