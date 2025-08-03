import { formatUnits } from 'viem';
import { VaultData, VaultStatus } from '@/contracts/types';

/**
 * Interface for the transformed vault data that VaultCard component expects
 */
export interface TransformedVaultData {
  id: number;
  name: string;
  goal: number;
  current: number;
  members: number;
  daysLeft: number;
  status: string;
}

/**
 * Transforms VaultData from smart contract to format expected by VaultCard component
 * @param vault - Raw vault data from smart contract
 * @returns Transformed vault data for UI components
 */
export const transformVaultDataForCard = (vault: VaultData): TransformedVaultData => {
  // Determine if this is a native token vault
  const isNativeToken = vault.token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const decimals = isNativeToken ? 18 : 6;

  // Calculate days left
  const daysLeft = Math.max(0, Math.floor((Number(vault.deadline || 0n) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)));

  // Map status to string
  const getStatusString = (status: VaultStatus): string => {
    switch (status) {
      case VaultStatus.ACTIVE:
        return 'active';
      case VaultStatus.SUCCESS:
        return 'completed';
      case VaultStatus.FAILED:
        return 'failed';
      default:
        return 'active';
    }
  };

  return {
    id: Number(vault.id),
    name: vault.name,
    goal: Number(formatUnits(vault.targetAmount || 0n, decimals)),
    current: Number(formatUnits(vault.totalDeposited || 0n, decimals)),
    members: Number(vault.memberCount || 0n),
    daysLeft,
    status: getStatusString(vault.status)
  };
};

/**
 * Transforms an array of VaultData to format expected by VaultCard component
 * @param vaults - Array of raw vault data from smart contract
 * @returns Array of transformed vault data for UI components
 */
export const transformVaultDataArrayForCard = (vaults: VaultData[]): TransformedVaultData[] => {
  return vaults.map(transformVaultDataForCard);
};
