import { useMemo } from 'react';
import { useCheckVaultStatus } from './useVaultReads';
import { VaultData } from '@/contracts/types';

/**
 * Hook to get real-time status for a single vault
 */
export function useVaultRealTimeStatus(vaultId: bigint | undefined) {
  const { data: realTimeStatus } = useCheckVaultStatus(vaultId);
  
  // Map contract status enum to display status
  // Contract: 0 = ACTIVE, 1 = SUCCESS, 2 = FAILED
  const getDisplayStatus = (status: number | undefined): 'active' | 'completed' | 'failed' | 'pending' => {
    switch (status) {
      case 0:
        return 'active';
      case 1:
        return 'completed';
      case 2:
        return 'failed';
      default:
        return 'pending';
    }
  };

  return {
    realTimeStatus,
    displayStatus: getDisplayStatus(realTimeStatus as number | undefined),
    isActive: realTimeStatus === 0,
    isCompleted: realTimeStatus === 1,
    isFailed: realTimeStatus === 2,
  };
}

/**
 * Hook to filter vaults by their real-time status
 * This ensures that vaults are properly categorized based on current blockchain state
 */
export function useFilteredVaultsByStatus(vaults: VaultData[]) {
  // Get real-time status for each vault (up to 25 vaults)
  // TODO: Implement a more scalable solution for users with many vaults
  const vault1Status = useVaultRealTimeStatus(vaults[0]?.id);
  const vault2Status = useVaultRealTimeStatus(vaults[1]?.id);
  const vault3Status = useVaultRealTimeStatus(vaults[2]?.id);
  const vault4Status = useVaultRealTimeStatus(vaults[3]?.id);
  const vault5Status = useVaultRealTimeStatus(vaults[4]?.id);
  const vault6Status = useVaultRealTimeStatus(vaults[5]?.id);
  const vault7Status = useVaultRealTimeStatus(vaults[6]?.id);
  const vault8Status = useVaultRealTimeStatus(vaults[7]?.id);
  const vault9Status = useVaultRealTimeStatus(vaults[8]?.id);
  const vault10Status = useVaultRealTimeStatus(vaults[9]?.id);
  const vault11Status = useVaultRealTimeStatus(vaults[10]?.id);
  const vault12Status = useVaultRealTimeStatus(vaults[11]?.id);
  const vault13Status = useVaultRealTimeStatus(vaults[12]?.id);
  const vault14Status = useVaultRealTimeStatus(vaults[13]?.id);
  const vault15Status = useVaultRealTimeStatus(vaults[14]?.id);
  const vault16Status = useVaultRealTimeStatus(vaults[15]?.id);
  const vault17Status = useVaultRealTimeStatus(vaults[16]?.id);
  const vault18Status = useVaultRealTimeStatus(vaults[17]?.id);
  const vault19Status = useVaultRealTimeStatus(vaults[18]?.id);
  const vault20Status = useVaultRealTimeStatus(vaults[19]?.id);
  const vault21Status = useVaultRealTimeStatus(vaults[20]?.id);
  const vault22Status = useVaultRealTimeStatus(vaults[21]?.id);
  const vault23Status = useVaultRealTimeStatus(vaults[22]?.id);
  const vault24Status = useVaultRealTimeStatus(vaults[23]?.id);
  const vault25Status = useVaultRealTimeStatus(vaults[24]?.id);

  const statusCheckers = [
    vault1Status, vault2Status, vault3Status, vault4Status, vault5Status,
    vault6Status, vault7Status, vault8Status, vault9Status, vault10Status,
    vault11Status, vault12Status, vault13Status, vault14Status, vault15Status,
    vault16Status, vault17Status, vault18Status, vault19Status, vault20Status,
    vault21Status, vault22Status, vault23Status, vault24Status, vault25Status
  ];

  const filteredVaults = useMemo(() => {
    const activeVaults: VaultData[] = [];
    const completedVaults: VaultData[] = [];
    const failedVaults: VaultData[] = [];
    const cancelledVaults: VaultData[] = [];

    vaults.forEach((vault, index) => {
      if (index >= 25) return; // Only process first 25 vaults

      const statusChecker = statusCheckers[index];
      const realTimeStatus = statusChecker.realTimeStatus;

      // Use real-time status if available, otherwise fall back to stored status
      const currentStatus = realTimeStatus !== undefined ? realTimeStatus : vault.status;

      // console.log(`🔍 Vault ${vault.id} status check:`, {
      //   vaultId: vault.id,
      //   storedStatus: vault.status,
      //   realTimeStatus,
      //   finalStatus: currentStatus,
      //   displayStatus: statusChecker.displayStatus
      // });

      // Categorize based on real-time status
      switch (currentStatus) {
        case 0: // ACTIVE
          activeVaults.push(vault);
          break;
        case 1: // SUCCESS/COMPLETED
          completedVaults.push(vault);
          break;
        case 2: // FAILED
          failedVaults.push(vault);
          break;
        default: // CANCELLED or other
          cancelledVaults.push(vault);
          break;
      }
    });

    return {
      activeVaults,
      completedVaults,
      failedVaults,
      cancelledVaults,
    };
  }, [vaults, statusCheckers]);

  return filteredVaults;
}

/**
 * Enhanced vault data with real-time status
 */
export function useEnhancedVaultData(vaults: VaultData[]) {
  // Get real-time status for each vault (up to 25 vaults)
  const vault1Status = useVaultRealTimeStatus(vaults[0]?.id);
  const vault2Status = useVaultRealTimeStatus(vaults[1]?.id);
  const vault3Status = useVaultRealTimeStatus(vaults[2]?.id);
  const vault4Status = useVaultRealTimeStatus(vaults[3]?.id);
  const vault5Status = useVaultRealTimeStatus(vaults[4]?.id);
  const vault6Status = useVaultRealTimeStatus(vaults[5]?.id);
  const vault7Status = useVaultRealTimeStatus(vaults[6]?.id);
  const vault8Status = useVaultRealTimeStatus(vaults[7]?.id);
  const vault9Status = useVaultRealTimeStatus(vaults[8]?.id);
  const vault10Status = useVaultRealTimeStatus(vaults[9]?.id);
  const vault11Status = useVaultRealTimeStatus(vaults[10]?.id);
  const vault12Status = useVaultRealTimeStatus(vaults[11]?.id);
  const vault13Status = useVaultRealTimeStatus(vaults[12]?.id);
  const vault14Status = useVaultRealTimeStatus(vaults[13]?.id);
  const vault15Status = useVaultRealTimeStatus(vaults[14]?.id);
  const vault16Status = useVaultRealTimeStatus(vaults[15]?.id);
  const vault17Status = useVaultRealTimeStatus(vaults[16]?.id);
  const vault18Status = useVaultRealTimeStatus(vaults[17]?.id);
  const vault19Status = useVaultRealTimeStatus(vaults[18]?.id);
  const vault20Status = useVaultRealTimeStatus(vaults[19]?.id);
  const vault21Status = useVaultRealTimeStatus(vaults[20]?.id);
  const vault22Status = useVaultRealTimeStatus(vaults[21]?.id);
  const vault23Status = useVaultRealTimeStatus(vaults[22]?.id);
  const vault24Status = useVaultRealTimeStatus(vaults[23]?.id);
  const vault25Status = useVaultRealTimeStatus(vaults[24]?.id);

  const statusCheckers = [
    vault1Status, vault2Status, vault3Status, vault4Status, vault5Status,
    vault6Status, vault7Status, vault8Status, vault9Status, vault10Status,
    vault11Status, vault12Status, vault13Status, vault14Status, vault15Status,
    vault16Status, vault17Status, vault18Status, vault19Status, vault20Status,
    vault21Status, vault22Status, vault23Status, vault24Status, vault25Status
  ];

  const enhancedVaults = useMemo(() => {
    return vaults.map((vault, index) => {
      if (index >= 25) {
        // For vaults beyond the first 25, use stored status
        return {
          ...vault,
          realTimeStatus: vault.status,
          displayStatus: vault.status === 0 ? 'active' : vault.status === 1 ? 'completed' : vault.status === 2 ? 'failed' : 'cancelled'
        };
      }

      const statusChecker = statusCheckers[index];
      const realTimeStatus = statusChecker.realTimeStatus;
      const displayStatus = statusChecker.displayStatus;

      return {
        ...vault,
        realTimeStatus: realTimeStatus !== undefined ? realTimeStatus : vault.status,
        displayStatus,
        isActive: statusChecker.isActive,
        isCompleted: statusChecker.isCompleted,
        isFailed: statusChecker.isFailed,
      };
    });
  }, [vaults, statusCheckers]);

  return enhancedVaults;
}
