import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { formatUnits } from 'viem';
import { useUserVaults } from './useUserVaults';
import { useJoinedVaults } from './useJoinedVaults';

export interface UserProfileStats {
  vaultsCreated: number;
  vaultsJoined: number;
  goalsCompleted: number;
  totalSaved: number;
  yieldEarned: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  walletAddress: string;
  joinedDate: string;
  stats: UserProfileStats;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to get real user profile data including statistics from vaults
 */
export const useUserProfile = (): UserProfile => {
  const { address } = useAccount();
  const { authenticated, user } = usePrivy();
  
  // Get user's created vaults
  const {
    vaults: userVaults,
    isLoading: isLoadingUserVaults,
    error: userVaultsError
  } = useUserVaults();

  // Get user's joined vaults
  const {
    vaults: joinedVaults,
    isLoading: isLoadingJoinedVaults,
    error: joinedVaultsError
  } = useJoinedVaults();

  // Calculate user statistics
  const stats = useMemo((): UserProfileStats => {
    const allVaults = [...(userVaults || []), ...(joinedVaults || [])];
    
    if (allVaults.length === 0) {
      return {
        vaultsCreated: 0,
        vaultsJoined: 0,
        goalsCompleted: 0,
        totalSaved: 0,
        yieldEarned: 0
      };
    }

    // Count vaults created by user
    const vaultsCreated = userVaults?.length || 0;
    
    // Count vaults joined (not created by user)
    const vaultsJoined = joinedVaults?.length || 0;

    // Count completed goals (status 2 = COMPLETED)
    const goalsCompleted = allVaults.filter(vault => vault.status === 2).length;

    // Calculate total saved across all vaults
    const totalSaved = allVaults.reduce((sum, vault) => {
      // Determine if this is a native token vault
      const isNativeToken = vault.token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
      const decimals = isNativeToken ? 18 : 6; // 18 for native tokens, 6 for USDC
      return sum + Number(formatUnits(vault.totalDeposited || 0n, decimals));
    }, 0);

    // Yield earned is 0 for now (future feature)
    const yieldEarned = 0;

    return {
      vaultsCreated,
      vaultsJoined,
      goalsCompleted,
      totalSaved,
      yieldEarned
    };
  }, [userVaults, joinedVaults]);

  // Generate user display name and avatar
  const userDisplayData = useMemo(() => {
    let name = 'Anonymous User';
    let avatar = 'AU';

    if (user?.email?.address) {
      // Use email username as name
      name = user.email.address.split('@')[0];
      avatar = name.slice(0, 2).toUpperCase();
    } else if (user?.google?.name) {
      // Use Google name if available
      name = user.google.name;
      avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    } else if (user?.farcaster?.displayName) {
      // Use Farcaster display name if available
      name = user.farcaster.displayName;
      avatar = name.slice(0, 2).toUpperCase();
    } else if (address) {
      // Fallback to wallet address
      name = `${address.slice(0, 6)}...${address.slice(-4)}`;
      avatar = address.slice(2, 4).toUpperCase();
    }

    return { name, avatar };
  }, [user, address]);

  // Calculate join date based on user creation or wallet connection
  const joinedDate = useMemo(() => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    // Fallback to current month if no creation date
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }, [user]);

  const isLoading = isLoadingUserVaults || isLoadingJoinedVaults;
  const error = userVaultsError || joinedVaultsError;

  return {
    name: userDisplayData.name,
    avatar: userDisplayData.avatar,
    walletAddress: address || '',
    joinedDate,
    stats,
    isLoading,
    error
  };
};
