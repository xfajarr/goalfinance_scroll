import React, { useState, useEffect, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { Address } from 'viem';
import { FRIENDS_REGISTRY_CONTRACT, CONTRACT_ADDRESSES } from '../config/contracts';
import { toast } from '@/components/ui/sonner';

export interface Friend {
  friendAddress: Address;
  displayName: string;
  addedAt: number | bigint;
  isActive: boolean;
  notes: string;
  isMutual: boolean;
}

export interface AddFriendParams {
  friendAddress: Address;
  displayName: string;
  notes?: string;
}

export interface UpdateFriendParams {
  friendAddress: Address;
  newDisplayName: string;
  newNotes?: string;
}

export function useFriendsRegistry() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Write contract hook
  const { 
    writeContract, 
    data: txHash, 
    isPending: isWritePending,
    error: writeError 
  } = useWriteContract();

  // Transaction receipt hook
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Combined loading state
  const combinedLoading = isWritePending || isConfirming;

  // Combined error
  const combinedError = writeError || receiptError || error;

  // Add friend function
  const addFriend = async (params: AddFriendParams) => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      writeContract({
        address: FRIENDS_REGISTRY_CONTRACT.address,
        abi: FRIENDS_REGISTRY_CONTRACT.abi,
        functionName: 'addFriend',
        args: [params.friendAddress, params.displayName, params.notes || ''],
      });

    } catch (err) {
      console.error('Failed to add friend:', err);
      setError(err instanceof Error ? err.message : 'Failed to add friend');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove friend function
  const removeFriend = async (friendAddress: Address) => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      writeContract({
        address: FRIENDS_REGISTRY_CONTRACT.address,
        abi: FRIENDS_REGISTRY_CONTRACT.abi,
        functionName: 'removeFriend',
        args: [friendAddress],
      });

    } catch (err) {
      console.error('Failed to remove friend:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove friend');
    } finally {
      setIsLoading(false);
    }
  };

  // Update friend function
  const updateFriend = async (params: UpdateFriendParams) => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      writeContract({
        address: FRIENDS_REGISTRY_CONTRACT.address,
        abi: FRIENDS_REGISTRY_CONTRACT.abi,
        functionName: 'updateFriend',
        args: [params.friendAddress, params.newDisplayName, params.newNotes || ''],
      });

    } catch (err) {
      console.error('Failed to update friend:', err);
      setError(err instanceof Error ? err.message : 'Failed to update friend');
    } finally {
      setIsLoading(false);
    }
  };

  // Batch add friends function
  const batchAddFriends = async (friends: AddFriendParams[]) => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      const addresses = friends.map(f => f.friendAddress);
      const displayNames = friends.map(f => f.displayName);
      const notes = friends.map(f => f.notes || '');

      writeContract({
        address: FRIENDS_REGISTRY_CONTRACT.address,
        abi: FRIENDS_REGISTRY_CONTRACT.abi,
        functionName: 'batchAddFriends',
        args: [addresses, displayNames, notes],
      });

    } catch (err) {
      console.error('Failed to batch add friends:', err);
      setError(err instanceof Error ? err.message : 'Failed to add friends');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset function
  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success('Transaction confirmed!', {
        description: 'Your friend list has been updated.',
      });
    }
  }, [isConfirmed, txHash]);

  // Show error toast when there's an error
  useEffect(() => {
    if (combinedError) {
      toast.error('Transaction failed', {
        description: combinedError instanceof Error ? combinedError.message : 'Please try again.',
      });
    }
  }, [combinedError]);

  return {
    // Actions
    addFriend,
    removeFriend,
    updateFriend,
    batchAddFriends,
    reset,

    // State
    isLoading: combinedLoading || isLoading,
    isConfirming,
    isSuccess: isConfirmed,
    error: combinedError,
    txHash,
  };
}

// Hook for reading friends data
export function useFriendsData(userAddress?: Address) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  // Get user's friends list
  const { data: friendAddresses, isLoading: isLoadingAddresses, error: errorAddresses } = useReadContract({
    address: FRIENDS_REGISTRY_CONTRACT.address,
    abi: FRIENDS_REGISTRY_CONTRACT.abi,
    functionName: 'getUserFriends',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });

  // Get detailed friends information
  const { data: friendsDetailed, isLoading: isLoadingDetailed, error: errorDetailed } = useReadContract({
    address: FRIENDS_REGISTRY_CONTRACT.address,
    abi: FRIENDS_REGISTRY_CONTRACT.abi,
    functionName: 'getUserFriendsDetailed',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });

  // Get friend count
  const { data: friendCount, isLoading: isLoadingCount, error: errorCount } = useReadContract({
    address: FRIENDS_REGISTRY_CONTRACT.address,
    abi: FRIENDS_REGISTRY_CONTRACT.abi,
    functionName: 'getFriendCount',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
    },
  });

  // Debug logging for development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useFriendsData - Target address:', targetAddress);
      console.log('useFriendsData - Friend addresses length:', friendAddresses?.length || 0);
      console.log('useFriendsData - Friends detailed length:', friendsDetailed?.length || 0);
      console.log('useFriendsData - Friend count:', friendCount);
      if (errorAddresses || errorDetailed || errorCount) {
        console.log('useFriendsData - Errors:', { errorAddresses, errorDetailed, errorCount });
      }
    }
  }, [targetAddress, friendAddresses?.length, friendsDetailed?.length, friendCount, !!errorAddresses, !!errorDetailed, !!errorCount]);

  return {
    friendAddresses: (friendAddresses as Address[]) || [],
    friends: (friendsDetailed as Friend[]) || [],
    friendCount: (friendCount as number) || 0,
    isLoading: isLoadingAddresses || isLoadingDetailed || isLoadingCount,
    error: errorAddresses || errorDetailed || errorCount,
  };
}

// Hook for searching friends
export function useSearchFriends(searchTerm: string, userAddress?: Address) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const { data: searchResults, isLoading } = useReadContract({
    address: FRIENDS_REGISTRY_CONTRACT.address,
    abi: FRIENDS_REGISTRY_CONTRACT.abi,
    functionName: 'searchFriendsByName',
    args: targetAddress && searchTerm ? [targetAddress, searchTerm] : undefined,
    query: {
      enabled: !!targetAddress && searchTerm.length > 0,
    },
  });

  return {
    searchResults: (searchResults as Address[]) || [],
    isLoading,
  };
}

// Hook for checking friendship status
export function useFriendshipStatus(user1?: Address, user2?: Address) {
  const { data: friendshipData, isLoading } = useReadContract({
    address: FRIENDS_REGISTRY_CONTRACT.address,
    abi: FRIENDS_REGISTRY_CONTRACT.abi,
    functionName: 'areFriends',
    args: user1 && user2 ? [user1, user2] : undefined,
    query: {
      enabled: !!user1 && !!user2,
    },
  });

  const [isFriend, isMutual] = (friendshipData as [boolean, boolean]) || [false, false];

  return {
    isFriend,
    isMutual,
    isLoading,
  };
}

// Hook for getting friend display name
export function useFriendDisplayName(userAddress?: Address, friendAddress?: Address) {
  const { data: displayName, isLoading } = useReadContract({
    address: FRIENDS_REGISTRY_CONTRACT.address,
    abi: FRIENDS_REGISTRY_CONTRACT.abi,
    functionName: 'getFriendDisplayName',
    args: userAddress && friendAddress ? [userAddress, friendAddress] : undefined,
    query: {
      enabled: !!userAddress && !!friendAddress,
    },
  });

  return {
    displayName: (displayName as string) || '',
    isLoading,
  };
}
