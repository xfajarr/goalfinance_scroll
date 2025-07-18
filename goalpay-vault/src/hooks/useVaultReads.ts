import { useReadContract, useChainId, useAccount } from 'wagmi';
import { Address } from 'viem';
import { VaultInfo, MemberInfo } from '@/contracts/types';
import { GoalVaultFactoryABI } from '@/contracts/abis/GoalVaultFactory';
import { GoalVaultABI } from '@/contracts/abis/GoalVault';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';

/**
 * Hook to get vault information by ID from the factory contract
 */
export function useGetVault(vaultId: bigint | undefined) {
  const chainId = useChainId();
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  return useReadContract({
    address: contractAddresses?.VAULT_FACTORY as Address,
    abi: GoalVaultFactoryABI,
    functionName: 'getVault',
    args: vaultId !== undefined ? [vaultId] : undefined,
    query: {
      enabled: !!vaultId && vaultId > 0n && !!contractAddresses?.VAULT_FACTORY,
    },
  });
}

/**
 * Hook to get all vaults created by a specific user
 */
export function useGetVaultsByCreator(creator: Address | undefined) {
  const chainId = useChainId();
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  return useReadContract({
    address: contractAddresses?.VAULT_FACTORY as Address,
    abi: GoalVaultFactoryABI,
    functionName: 'getVaultsByCreator',
    args: creator ? [creator] : undefined,
    query: {
      enabled: !!creator && !!contractAddresses?.VAULT_FACTORY,
    },
  });
}

/**
 * Hook to get all public vaults
 */
export function useGetPublicVaults() {
  const chainId = useChainId();
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  return useReadContract({
    address: contractAddresses?.VAULT_FACTORY as Address,
    abi: GoalVaultFactoryABI,
    functionName: 'getPublicVaults',
    args: [],
    query: {
      enabled: !!contractAddresses?.VAULT_FACTORY,
    },
  });
}

/**
 * Hook to get detailed vault information from the vault contract itself
 */
export function useGetVaultDetails(vaultAddress: Address | undefined) {
  return useReadContract({
    address: vaultAddress,
    abi: GoalVaultABI,
    functionName: 'getVaultDetails',
    args: [],
    query: {
      enabled: !!vaultAddress,
    },
  });
}

/**
 * Hook to get all members of a vault
 */
export function useGetVaultMembers(vaultAddress: Address | undefined) {
  return useReadContract({
    address: vaultAddress,
    abi: GoalVaultABI,
    functionName: 'getAllMembers',
    args: [],
    query: {
      enabled: !!vaultAddress,
    },
  });
}

/**
 * Hook to get specific member information from a vault
 */
export function useGetMemberInfo(vaultAddress: Address | undefined, memberAddress: Address | undefined) {
  return useReadContract({
    address: vaultAddress,
    abi: GoalVaultABI,
    functionName: 'getMemberInfo',
    args: memberAddress ? [memberAddress] : undefined,
    query: {
      enabled: !!vaultAddress && !!memberAddress,
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
