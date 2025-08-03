import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserVaults } from './useUserVaults';
import { useJoinedVaults } from './useJoinedVaults';
import { useGetMemberInfo } from './useVaultReads';

/**
 * Hook to calculate the user's total personal deposits across all vaults
 * This returns only the amount the current user has deposited, not the total vault amounts
 */
export function useUserTotalDeposits() {
  const { address } = useAccount();
  const { vaults: userVaults, isLoading: isLoadingUserVaults } = useUserVaults();
  const { vaults: joinedVaults, isLoading: isLoadingJoinedVaults } = useJoinedVaults();

  // Get all vaults the user is involved in
  const allVaults = useMemo(() => {
    return [...(userVaults || []), ...(joinedVaults || [])];
  }, [userVaults, joinedVaults]);

  // Since we can't call hooks dynamically, we'll use a fixed number of hooks
  // and only use the ones we need based on the actual vault count
  const vault1 = allVaults?.[0];
  const vault2 = allVaults?.[1];
  const vault3 = allVaults?.[2];
  const vault4 = allVaults?.[3];
  const vault5 = allVaults?.[4];
  const vault6 = allVaults?.[5];
  const vault7 = allVaults?.[6];
  const vault8 = allVaults?.[7];
  const vault9 = allVaults?.[8];
  const vault10 = allVaults?.[9];

  // Get member info for each vault (up to 10 vaults)
  const member1 = useGetMemberInfo(vault1?.id, address);
  const member2 = useGetMemberInfo(vault2?.id, address);
  const member3 = useGetMemberInfo(vault3?.id, address);
  const member4 = useGetMemberInfo(vault4?.id, address);
  const member5 = useGetMemberInfo(vault5?.id, address);
  const member6 = useGetMemberInfo(vault6?.id, address);
  const member7 = useGetMemberInfo(vault7?.id, address);
  const member8 = useGetMemberInfo(vault8?.id, address);
  const member9 = useGetMemberInfo(vault9?.id, address);
  const member10 = useGetMemberInfo(vault10?.id, address);

  const memberInfoQueries = [
    member1, member2, member3, member4, member5,
    member6, member7, member8, member9, member10
  ].slice(0, allVaults?.length || 0);

  // Calculate total deposits from member info
  const totalDeposits = useMemo(() => {
    if (!address || !allVaults || memberInfoQueries.some(query => query?.isLoading)) {
      return {
        totalSaved: 0,
        isLoading: true,
        error: null
      };
    }

    let totalSaved = 0;

    for (let i = 0; i < allVaults.length; i++) {
      const vault = allVaults[i];
      const memberQuery = memberInfoQueries[i];

      if (!memberQuery || memberQuery.error) {
        // If user is not a member of this vault, skip it (this is normal for created vaults where user hasn't deposited)
        continue;
      }

      if (memberQuery.data) {
        const memberInfo = memberQuery.data as { depositedAmount: bigint };

        // Determine if this is a native token vault
        const isNativeToken = vault.token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
        const decimals = isNativeToken ? 18 : 6;

        // Add user's individual deposit amount
        const userDeposit = Number(formatUnits(memberInfo.depositedAmount || 0n, decimals));
        totalSaved += userDeposit;
      }
    }

    return {
      totalSaved,
      isLoading: false,
      error: null
    };
  }, [allVaults, memberInfoQueries, address]);

  return {
    ...totalDeposits,
    isLoading: isLoadingUserVaults || isLoadingJoinedVaults || totalDeposits.isLoading
  };
}
