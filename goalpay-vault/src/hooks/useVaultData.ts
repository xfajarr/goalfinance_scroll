import { VaultData, MemberData, UseVaultDataReturn, MemberInfo } from '@/contracts/types';
import { useGetVault, useGetVaultDetails, useGetVaultMembers } from './useVaultReads';

export const useVaultData = (vaultId: bigint): UseVaultDataReturn => {
  // Get vault info from factory
  const {
    data: vaultInfo,
    isLoading: isLoadingVaultInfo,
    error: vaultInfoError,
    refetch: refetchVaultInfo
  } = useGetVault(vaultId > 0n ? vaultId : undefined);

  // Get detailed vault data from vault contract
  const {
    data: vaultDetails,
    isLoading: isLoadingVaultDetails,
    error: vaultDetailsError,
    refetch: refetchVaultDetails
  } = useGetVaultDetails(vaultInfo?.vaultAddress);

  // Get vault members
  const {
    data: vaultMembers,
    isLoading: isLoadingMembers,
    error: membersError,
    refetch: refetchMembers
  } = useGetVaultMembers(vaultInfo?.vaultAddress);

  // Combine loading states
  const isLoading = isLoadingVaultInfo || isLoadingVaultDetails || isLoadingMembers;

  // Combine errors
  const error = vaultInfoError || vaultDetailsError || membersError || null;

  // Transform data to match expected format
  const vault: VaultData | null = vaultInfo && vaultDetails ? {
    id: vaultId,
    name: vaultDetails.name,
    description: vaultDetails.description,
    creator: vaultDetails.creator,
    goalAmount: vaultDetails.targetAmount,
    currentAmount: vaultDetails.currentAmount,
    deadline: vaultDetails.deadline,
    status: vaultDetails.status,
    isPublic: vaultDetails.isPublic,
    memberCount: vaultDetails.memberCount,
    yieldRate: 0n, // MVP doesn't have yield yet
    createdAt: vaultDetails.createdAt,
  } : null;

  // Transform members data
  const members: MemberData[] = vaultMembers ? vaultMembers.map((member: MemberInfo) => ({
    member: member.member,
    contribution: member.contribution,
    joinedAt: member.joinedAt,
    isActive: member.isActive,
  })) : [];

  const refetch = () => {
    refetchVaultInfo();
    refetchVaultDetails();
    refetchMembers();
  };

  return {
    vault,
    members,
    isLoading,
    error,
    refetch,
  };
};
