import { useReadContract, useAccount } from 'wagmi';
import { Address } from 'viem';

import { GOAL_FINANCE_CONTRACT } from '@/config/contracts';
import GoalFinanceABI from '@/contracts/abis/GoalFinance.json';

/**
 * Hook to get vault information by ID from the new GoalFinance contract
 */
export function useGetVault(vaultId: bigint | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'getVault',
    args: vaultId !== undefined ? [vaultId] : undefined,
    query: {
      enabled: !!vaultId && vaultId > 0n,
    },
  });
}

/**
 * Hook to get all vaults created by a specific user
 */
export function useGetVaultsByCreator(creator: Address | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'getVaultsByCreator',
    args: creator ? [creator] : undefined,
    query: {
      enabled: !!creator,
    },
  });
}

/**
 * Hook to get vaults with pagination
 */
export function useGetVaultsPaginated(offset: number = 0, limit: number = 10) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'getVaultsPaginated',
    args: [BigInt(offset), BigInt(limit)],
    query: {
      enabled: true,
    },
  });
}

/**
 * Hook to get all vaults
 */
export function useGetAllVaults() {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'getAllVaults',
    args: [],
    query: {
      enabled: true,
    },
  });
}

/**
 * Hook to get total vault count
 */
export function useGetTotalVaultCount() {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'getTotalVaultCount',
    args: [],
    query: {
      enabled: true,
    },
  });
}

/**
 * Hook to get all members of a vault
 */
export function useGetVaultMembers(vaultId: bigint | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'getVaultMembers',
    args: vaultId !== undefined ? [vaultId] : undefined,
    query: {
      enabled: !!vaultId && vaultId > 0n,
    },
  });
}

/**
 * Hook to get specific member information from a vault
 */
export function useGetMemberInfo(vaultId: bigint | undefined, memberAddress: Address | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'getMember',
    args: vaultId !== undefined && memberAddress ? [vaultId, memberAddress] : undefined,
    query: {
      enabled: !!vaultId && vaultId > 0n && !!memberAddress,
    },
  });
}

/**
 * Hook to get user's own vaults (convenience hook)
 */
export function useUserVaults() {
  const { address } = useAccount();
  return useGetVaultsByCreator(address);
}

/**
 * Hook to get vault information by invite code
 */
export function useGetVaultByInvite(inviteCode: string | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'getVaultByInviteCode',
    args: inviteCode ? [inviteCode as `0x${string}`] : undefined,
    query: {
      enabled: !!inviteCode,
    },
  });
}

/**
 * Hook to check if vault uses native token
 */
export function useIsNativeTokenVault(vaultId: bigint | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'isNativeTokenVault',
    args: vaultId !== undefined ? [vaultId] : undefined,
    query: {
      enabled: !!vaultId && vaultId > 0n,
    },
  });
}

/**
 * Hook to check if goal is reached
 */
export function useIsGoalReached(vaultId: bigint | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'isGoalReached',
    args: vaultId !== undefined ? [vaultId] : undefined,
    query: {
      enabled: !!vaultId && vaultId > 0n,
    },
  });
}

/**
 * Hook to check vault status
 */
export function useCheckVaultStatus(vaultId: bigint | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'checkVaultStatus',
    args: vaultId !== undefined ? [vaultId] : undefined,
    query: {
      enabled: !!vaultId && vaultId > 0n,
    },
  });
}

/**
 * Hook to get vault progress in basis points
 */
export function useGetVaultProgress(vaultId: bigint | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'getVaultProgress',
    args: vaultId !== undefined ? [vaultId] : undefined,
    query: {
      enabled: !!vaultId && vaultId > 0n,
    },
  });
}

/**
 * Hook to get time remaining until deadline
 */
export function useGetTimeRemaining(vaultId: bigint | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'getTimeRemaining',
    args: vaultId !== undefined ? [vaultId] : undefined,
    query: {
      enabled: !!vaultId && vaultId > 0n,
    },
  });
}

/**
 * Hook to check if vault is expired
 */
export function useIsVaultExpired(vaultId: bigint | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'isVaultExpired',
    args: vaultId !== undefined ? [vaultId] : undefined,
    query: {
      enabled: !!vaultId && vaultId > 0n,
    },
  });
}

/**
 * Hook to get native token symbol for current chain
 */
export function useGetNativeTokenSymbol() {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'getNativeTokenSymbol',
    args: [],
    query: {
      enabled: true,
    },
  });
}

/**
 * Hook to check if token is supported
 */
export function useIsTokenSupported(tokenAddress: Address | undefined) {
  return useReadContract({
    address: GOAL_FINANCE_CONTRACT.address,
    abi: GoalFinanceABI,
    functionName: 'isTokenSupported',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
    },
  });
}
