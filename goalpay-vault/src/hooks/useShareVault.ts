import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { ShareVaultData, UseShareVaultReturn } from '@/contracts/types';
import { generateShareUrl, generateQRCodeData } from '@/utils/inviteCodeUtils';
import { GOAL_FINANCE_CONTRACT } from '@/config/contracts';
import GoalFinanceABI from '@/contracts/abis/GoalFinance.json';

export const useShareVault = (): UseShareVaultReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  const generateShareData = async (vaultId: bigint): Promise<ShareVaultData> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      // Helper function to retry contract calls with exponential backoff
      const retryContractCall = async <T>(
        contractCall: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
      ): Promise<T> => {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            return await contractCall();
          } catch (error: any) {
            const isRateLimited = error?.message?.includes('429') ||
                                error?.message?.includes('Too Many Requests') ||
                                error?.details?.includes('429');

            if (isRateLimited && attempt < maxRetries) {
              const delayMs = baseDelay * Math.pow(2, attempt);
              console.log(`Rate limited in share vault, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
              continue;
            }
            throw error;
          }
        }
        throw new Error('Max retries exceeded');
      };

      // Get vault info from blockchain to retrieve the actual invite code
      const vaultInfo = await retryContractCall(() =>
        publicClient.readContract({
          address: GOAL_FINANCE_CONTRACT.address,
          abi: GoalFinanceABI,
          functionName: 'getVault',
          args: [vaultId],
        })
      ) as any;

      if (!vaultInfo || vaultInfo.creator === '0x0000000000000000000000000000000000000000') {
        throw new Error('Vault not found');
      }

      // Use the actual on-chain invite code
      const inviteCode = vaultInfo.inviteCode as string;

      if (!inviteCode || inviteCode === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        throw new Error('Vault does not have an invite code');
      }

      // Generate share URL and QR code data using the real invite code
      const shareUrl = generateShareUrl(vaultId, inviteCode);
      const qrCodeData = generateQRCodeData(shareUrl);

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
