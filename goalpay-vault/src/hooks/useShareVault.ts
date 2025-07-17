import { useState } from 'react';
import { ShareVaultData, UseShareVaultReturn } from '@/contracts/types';

export const useShareVault = (): UseShareVaultReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateShareData = async (vaultId: bigint): Promise<ShareVaultData> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock invite code
      const inviteCode = `GOAL${vaultId}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Generate share URL
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/join/${vaultId}?invite=${inviteCode}`;

      // Generate QR code data (URL for QR code generation)
      const qrCodeData = shareUrl;

      const shareData: ShareVaultData = {
        vaultId,
        inviteCode,
        shareUrl,
        qrCodeData,
      };

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
