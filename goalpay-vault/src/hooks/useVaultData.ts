import { useState, useEffect } from 'react';
import { VaultData, MemberData, UseVaultDataReturn, VaultStatus } from '@/contracts/types';

export const useVaultData = (vaultId: bigint): UseVaultDataReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [vault, setVault] = useState<VaultData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);

  useEffect(() => {
    const loadVaultData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock vault data
        const mockVault: VaultData = {
          id: vaultId,
          name: "Summer Vacation Fund 🏖️",
          description: "Let's save together for our amazing summer vacation to Bali! 🌴",
          creator: "0x742d35Cc6663C82C0532e4F2b7d848" as `0x${string}`,
          goalAmount: 5000000000n, // $5000 in USDC (6 decimals)
          currentAmount: 3250000000n, // $3250 in USDC
          deadline: BigInt(Math.floor(Date.now() / 1000) + (45 * 24 * 60 * 60)), // 45 days from now
          status: VaultStatus.ACTIVE,
          isPublic: true,
          memberCount: 4n,
          yieldRate: 850n, // 8.5% in basis points
          createdAt: BigInt(Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)), // 30 days ago
        };

        const mockMembers: MemberData[] = [
          {
            member: "0x742d35Cc6663C82C0532e4F2b7d848" as `0x${string}`,
            contribution: 850000000n, // $850
            joinedAt: BigInt(Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)),
            isActive: true,
          },
          {
            member: "0x8ba1f109551bD432803012645Hac136c" as `0x${string}`,
            contribution: 1200000000n, // $1200
            joinedAt: BigInt(Math.floor(Date.now() / 1000) - (25 * 24 * 60 * 60)),
            isActive: true,
          },
          {
            member: "0x9ca2f209661cE543904023756Iac247d" as `0x${string}`,
            contribution: 650000000n, // $650
            joinedAt: BigInt(Math.floor(Date.now() / 1000) - (20 * 24 * 60 * 60)),
            isActive: true,
          },
          {
            member: "0xAdb3f319771dF654905034867Jac358e" as `0x${string}`,
            contribution: 550000000n, // $550
            joinedAt: BigInt(Math.floor(Date.now() / 1000) - (15 * 24 * 60 * 60)),
            isActive: true,
          },
        ];

        setVault(mockVault);
        setMembers(mockMembers);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (vaultId > 0n) {
      loadVaultData();
    }
  }, [vaultId]);

  const refetch = () => {
    // Simulate refetch
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return {
    vault,
    members,
    isLoading,
    error,
    refetch,
  };
};
