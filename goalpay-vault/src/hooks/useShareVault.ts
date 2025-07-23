import { useState } from 'react';
import { ShareVaultData, UseShareVaultReturn } from '@/contracts/types';
import { generateCompleteShareData } from '@/utils/inviteCodeUtils';

export const useShareVault = (): UseShareVaultReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateShareData = async (vaultId: bigint): Promise<ShareVaultData> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate complete share data instantly (no blockchain calls needed)
      const shareData = generateCompleteShareData(vaultId);

      return shareData;

    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateShareData,
    isLoading,
    error,
  };
};
