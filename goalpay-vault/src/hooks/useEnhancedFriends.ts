import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Address } from 'viem';
import { FRIENDS_REGISTRY_CONTRACT } from '@/config/contracts';
import { queryUserFriends, searchFriends, graphqlCache, handleGraphQLError } from '@/lib/graphql';

// Enhanced friend data combining contract and GraphQL data
export interface EnhancedFriendData {
  // Contract data
  id: bigint;
  user: Address;
  friend: Address;
  displayName: string;
  addedAt: bigint;
  isActive: boolean;
  
  // Enhanced data
  mutualFriends?: Address[];
  sharedBills?: bigint[];
  totalDebts?: bigint;
  lastInteraction?: bigint;
  relationshipScore?: number;
}

// Hook for enhanced friends data with GraphQL integration
export function useEnhancedFriends() {
  const { address } = useAccount();
  const [graphqlFriends, setGraphqlFriends] = useState<any[]>([]);
  const [isLoadingGraphQL, setIsLoadingGraphQL] = useState(false);
  const [graphqlError, setGraphqlError] = useState<string | null>(null);

  // Get friend addresses from contract
  const { data: friendAddresses, isLoading: isLoadingContract, error: contractError, refetch } = useReadContract({
    ...FRIENDS_REGISTRY_CONTRACT,
    functionName: 'getFriends',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Fetch GraphQL data for friends
  const fetchGraphQLFriends = useCallback(async () => {
    if (!address) return;

    const cacheKey = `user-friends-${address}`;
    const cached = graphqlCache.get(cacheKey);
    if (cached) {
      setGraphqlFriends(cached.friends || []);
      return;
    }

    setIsLoadingGraphQL(true);
    setGraphqlError(null);

    try {
      const data = await queryUserFriends(address);
      setGraphqlFriends(data.friends || []);
      graphqlCache.set(cacheKey, data, 60000); // Cache for 1 minute
    } catch (error) {
      setGraphqlError(handleGraphQLError(error));
    } finally {
      setIsLoadingGraphQL(false);
    }
  }, [address]);

  useEffect(() => {
    fetchGraphQLFriends();
  }, [fetchGraphQLFriends]);

  // Combine contract and GraphQL data
  const enhancedFriends: EnhancedFriendData[] = (friendAddresses as Address[] || []).map((friendAddress, index) => {
    const graphqlFriend = graphqlFriends.find(f => f.friend.toLowerCase() === friendAddress.toLowerCase());
    
    return {
      id: BigInt(index), // This would come from contract
      user: address!,
      friend: friendAddress,
      displayName: graphqlFriend?.displayName || friendAddress,
      addedAt: BigInt(graphqlFriend?.addedAt || Date.now() / 1000),
      isActive: graphqlFriend?.isActive ?? true,
      mutualFriends: [], // Would be calculated
      sharedBills: [], // Would be fetched from bills
      totalDebts: 0n, // Would be calculated from debts
      lastInteraction: BigInt(Date.now() / 1000),
      relationshipScore: 0, // Would be calculated based on interactions
    };
  });

  return {
    friends: enhancedFriends,
    friendAddresses: (friendAddresses as Address[]) || [],
    graphqlFriends,
    isLoading: isLoadingContract || isLoadingGraphQL,
    error: contractError || graphqlError,
    refetch: () => {
      refetch();
      fetchGraphQLFriends();
    },
  };
}

// Hook for friend search with GraphQL enhancement
export function useFriendSearch() {
  const { address } = useAccount();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFriendsByName = useCallback(async (searchTerm: string) => {
    if (!address || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await searchFriends(address, searchTerm);
      setSearchResults(data.friends || []);
    } catch (error) {
      setError(handleGraphQLError(error));
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    isLoading,
    error,
    searchFriendsByName,
    clearSearch,
  };
}

// Hook for friend statistics and analytics
export function useFriendStatistics() {
  const { address } = useAccount();
  const [stats, setStats] = useState({
    totalFriends: 0,
    activeFriends: 0,
    mutualConnections: 0,
    averageRelationshipScore: 0,
    topFriends: [] as EnhancedFriendData[],
    recentlyAdded: [] as EnhancedFriendData[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would combine contract calls and GraphQL data
      const data = await queryUserFriends(address);
      
      setStats({
        totalFriends: data.friends?.length || 0,
        activeFriends: data.friends?.filter((f: any) => f.isActive).length || 0,
        mutualConnections: 0, // Would be calculated
        averageRelationshipScore: 0, // Would be calculated
        topFriends: [], // Would be sorted by relationship score
        recentlyAdded: data.friends?.slice(-5) || [], // Last 5 added
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

// Hook for friend relationship details
export function useFriendRelationship(friendAddress?: Address) {
  const { address } = useAccount();
  const [relationship, setRelationship] = useState({
    displayName: '',
    addedAt: 0n,
    isActive: false,
    mutualFriends: [] as Address[],
    sharedBills: [] as bigint[],
    debtSummary: {
      owedToFriend: 0n,
      owedFromFriend: 0n,
      netBalance: 0n,
    },
    interactionHistory: [] as any[],
    relationshipScore: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationship = useCallback(async () => {
    if (!address || !friendAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get friend details from contract
      const friendDetails = await FRIENDS_REGISTRY_CONTRACT.abi; // This would be a contract call
      
      // Get GraphQL data for enhanced details
      const graphqlData = await queryUserFriends(address);
      const friendData = graphqlData.friends?.find((f: any) => 
        f.friend.toLowerCase() === friendAddress.toLowerCase()
      );
      
      setRelationship({
        displayName: friendData?.displayName || friendAddress,
        addedAt: BigInt(friendData?.addedAt || 0),
        isActive: friendData?.isActive ?? false,
        mutualFriends: [], // Would be calculated
        sharedBills: [], // Would be fetched from bills
        debtSummary: {
          owedToFriend: 0n,
          owedFromFriend: 0n,
          netBalance: 0n,
        },
        interactionHistory: [],
        relationshipScore: 0,
      });
    } catch (error) {
      setError(handleGraphQLError(error));
    } finally {
      setIsLoading(false);
    }
  }, [address, friendAddress]);

  useEffect(() => {
    fetchRelationship();
  }, [fetchRelationship]);

  return {
    relationship,
    isLoading,
    error,
    refetch: fetchRelationship,
  };
}

// Hook for friend recommendations
export function useFriendRecommendations() {
  const { address } = useAccount();
  const [recommendations, setRecommendations] = useState<{
    mutualConnections: Address[];
    frequentInteractions: Address[];
    similarInterests: Address[];
  }>({
    mutualConnections: [],
    frequentInteractions: [],
    similarInterests: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would use GraphQL data to find recommendations
      // Based on mutual friends, shared bills, etc.
      setRecommendations({
        mutualConnections: [],
        frequentInteractions: [],
        similarInterests: [],
      });
    } catch (error) {
      setError(handleGraphQLError(error));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refetch: fetchRecommendations,
  };
}

// Hook for friend activity feed
export function useFriendActivity() {
  const { address } = useAccount();
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would combine data from all contracts to show friend activity
      // New bills, debt settlements, friend additions, etc.
      setActivities([]);
    } catch (error) {
      setError(handleGraphQLError(error));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivity,
  };
}
