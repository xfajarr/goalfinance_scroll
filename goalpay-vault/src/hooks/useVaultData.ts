import { Vault, Member, UseVaultDataReturn } from '@/contracts/types';
import { useGetVault, useGetVaultMembers, useGetMemberInfo } from './useVaultReads';
import { useAccount } from 'wagmi';
import { Address } from 'viem';

export const useVaultData = (vaultId: bigint): UseVaultDataReturn => {
  const { address } = useAccount();

  // Get vault info from the new GoalFinance contract
  const {
    data: vaultInfo,
    isLoading: isLoadingVaultInfo,
    error: vaultInfoError,
    refetch: refetchVaultInfo
  } = useGetVault(vaultId > 0n ? vaultId : undefined);

  // Get vault members using vault ID
  const {
    data: vaultMembers,
    isLoading: isLoadingMembers,
    error: membersError,
    refetch: refetchMembers
  } = useGetVaultMembers(vaultId > 0n ? vaultId : undefined);

  // Get current user's member info if they're connected
  const {
    data: userMemberInfo,
    isLoading: isLoadingUserMember,
    error: userMemberError,
    refetch: refetchUserMember
  } = useGetMemberInfo(
    vaultId > 0n ? vaultId : undefined,
    address
  );

  // Combine loading states
  const isLoading = isLoadingVaultInfo || isLoadingMembers;

  // Only treat vault info errors as critical
  const error = vaultInfoError || null;

  // Log member errors but don't fail the entire component
  if (membersError) {
    console.warn('Failed to load vault members:', membersError.message);
  }
  if (userMemberError) {
    console.warn('Failed to load user member info:', userMemberError.message);
  }

  // Transform vault data to match expected format
  const vault: Vault | null = vaultInfo ? (vaultInfo as Vault) : null;

  // Transform members data - create a map of member addresses to their data
  const members: Address[] = vaultMembers && Array.isArray(vaultMembers)
    ? (vaultMembers as Address[])
    : [];

  // Only include current user's data in memberData
  const memberData: Record<Address, Member> = {};
  if (address && userMemberInfo) {
    memberData[address] = userMemberInfo as Member;
  }

  const refetch = () => {
    refetchVaultInfo();
    refetchMembers();
    refetchUserMember();
  };

  return {
    vault,
    members,
    memberData,
    isLoading,
    error,
    refetch,
  };
};
