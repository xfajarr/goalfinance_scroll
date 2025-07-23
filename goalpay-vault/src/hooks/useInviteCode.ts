import { useState } from 'react';
import { useWriteContract, useReadContract, useAccount, useChainId, usePublicClient } from 'wagmi';
import { parseEther, formatUnits, isAddress, Address, parseUnits } from 'viem';
import { useToast } from '@/hooks/use-toast';
import { GOAL_FINANCE_CONTRACT } from '@/config/contracts';
import GoalFinanceABI from '@/contracts/abis/GoalFinance.json';
import {
  generateFrontendInviteCode,
  extractVaultIdFromInviteCode,
  isValidInviteCodeFormat
} from '@/utils/inviteCodeUtils';
import { useJoinVault } from './useJoinVault';

export interface InviteCodeData {
  vaultId: bigint;
  inviteCode: string;
  shareUrl: string;
  qrCodeData: string;
}

export interface VaultPreview {
  id: bigint;
  name: string;
  description: string;
  targetAmount: bigint;
  currentAmount: bigint;
  deadline: bigint;
  memberCount: bigint;
  creator: string;
  isPublic: boolean;
  status: number;
  tokenSymbol: string;
}

export interface UseInviteCodeReturn {
  // Generate invite code
  generateInviteCode: (vaultId: bigint) => Promise<string>;
  isGenerating: boolean;
  generateError: Error | null;

  // Validate and preview vault from invite code
  validateInviteCode: (inviteCode: string) => Promise<VaultPreview | null>;
  isValidating: boolean;
  validateError: Error | null;

  // Join vault by invite code with deposit
  joinVaultByInvite: (inviteCode: string, amount: string, isNativeToken?: boolean) => Promise<void>;
  isJoining: boolean;
  joinError: Error | null;
  joinTxHash: string | null;

  // Join public vault directly with deposit
  joinPublicVault: (vaultId: bigint, amount: string, isNativeToken?: boolean) => Promise<void>;
}

export const useInviteCode = (): UseInviteCodeReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<Error | null>(null);
  
  const [isValidating, setIsValidating] = useState(false);
  const [validateError, setValidateError] = useState<Error | null>(null);
  
  // Join state is now managed by useJoinVault hook

  const { address } = useAccount();
  const { toast } = useToast();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();

  // Use the dedicated join vault hook
  const {
    joinVault: joinVaultNative,
    joinVaultWithToken: joinVaultWithTokenHook,
    isLoading: isJoiningHook,
    error: joinErrorHook,
    txHash: joinTxHashHook,
    reset: resetJoin
  } = useJoinVault();

  // Use the new contract configuration
  const contractAddress = GOAL_FINANCE_CONTRACT.address;





  // Generate invite code using on-chain system
  const generateInviteCode = async (vaultId: bigint): Promise<string> => {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!contractAddress) {
        throw new Error('GoalFinance contract not configured');
      }

      // Verify vault exists and user has permission
      const vaultInfo = await publicClient?.readContract({
        address: contractAddress,
        abi: GoalFinanceABI,
        functionName: 'getVault',
        args: [vaultId],
      });

      if (!vaultInfo || vaultInfo.vaultAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Vault not found');
      }

      // Check if user is authorized (creator)
      if (vaultInfo.creator !== address) {
        throw new Error('Only vault creator can generate invite codes');
      }

      try {
        // For GoalFinance, invite codes are generated during vault creation
        // We'll use the vault's existing invite code from the vault info
        const inviteCodeBytes = vaultInfo.inviteCode as `0x${string}`;

        if (!inviteCodeBytes || inviteCodeBytes === '0x0000000000000000000000000000000000000000000000000000000000000000') {
          throw new Error('Vault does not have an invite code');
        }

        toast({
          title: '✅ Invite Code Generated!',
          description: 'Your vault invite code is ready to share.',
        });

        return inviteCodeBytes as string;
      } catch (onChainError) {
        console.log('On-chain invite generation failed, using frontend fallback...', onChainError);

        // Fallback to frontend-generated invite code for backward compatibility
        const readableCode = generateFrontendInviteCode(vaultId);

        toast({
          title: '✅ Invite Code Generated!',
          description: 'Your vault invite code is ready to share (fallback mode).',
        });

        return readableCode;
      }

    } catch (error) {
      const err = error as Error;
      setGenerateError(err);
      toast({
        title: 'Failed to Generate Invite Code',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };



  const validateInviteCode = async (inviteCode: string): Promise<VaultPreview | null> => {
    setIsValidating(true);
    setValidateError(null);

    try {
      if (!contractAddress) {
        throw new Error('Contract not configured');
      }

      if (!publicClient) {
        throw new Error('Public client not available');
      }

      // Check if this is a bytes32 invite code (on-chain) or legacy frontend code
      const isOnChainInviteCode = inviteCode.startsWith('0x') && inviteCode.length === 66;

      if (isOnChainInviteCode) {
        // Try to use the getVaultByInviteCode function for on-chain invite codes
        try {
          const vaultId = await publicClient.readContract({
            address: contractAddress,
            abi: GoalFinanceABI,
            functionName: 'getVaultByInviteCode',
            args: [inviteCode as `0x${string}`],
          }) as bigint;

          // Get full vault info using the vault ID
          const vaultInfo = await publicClient.readContract({
            address: contractAddress,
            abi: GoalFinanceABI,
            functionName: 'getVault',
            args: [vaultId],
          }) as any;

          // vaultInfo structure: { id, config: { name, description, token, goalType, visibility, targetAmount, deadline, penaltyRate }, creator, totalDeposited, memberCount, status, inviteCode, createdAt }
          const config = vaultInfo.config || {};

          if (vaultInfo && vaultInfo.creator !== '0x0000000000000000000000000000000000000000') {
            const vaultPreview: VaultPreview = {
              id: vaultId,
              name: config.name || 'Unknown Vault',
              description: config.description || 'No description',
              targetAmount: config.targetAmount || 0n,
              currentAmount: vaultInfo.totalDeposited || 0n,
              deadline: config.deadline || 0n,
              memberCount: vaultInfo.memberCount || 0n,
              creator: vaultInfo.creator,
              isPublic: config.visibility === 1, // 1 = PUBLIC, 0 = PRIVATE
              status: vaultInfo.status || 0,
              tokenSymbol: 'MNT', // Default to native token, could be enhanced
            };

            return vaultPreview;
          }
        } catch (onChainError) {
          console.log('On-chain invite code lookup failed:', onChainError);
          throw new Error('Invalid invite code - not found on blockchain');
        }
      } else {
        // Handle legacy frontend-generated invite code format for backward compatibility
        const vaultId = extractVaultIdFromInviteCode(inviteCode);

        if (!vaultId) {
          throw new Error('Invalid invite code format');
        }

        // Get vault info from GoalFinance using vault ID
        const vaultInfo = await publicClient.readContract({
          address: contractAddress,
          abi: GoalFinanceABI,
          functionName: 'getVault',
          args: [vaultId],
        }) as any;

        if (!vaultInfo || vaultInfo.creator === '0x0000000000000000000000000000000000000000') {
          throw new Error('Vault not found');
        }

        // vaultInfo structure: { id, config: { name, description, token, goalType, visibility, targetAmount, deadline, penaltyRate }, creator, totalDeposited, memberCount, status, inviteCode, createdAt }
        const config = vaultInfo.config || {};

        const vaultPreview: VaultPreview = {
          id: vaultId,
          name: config.name || 'Unknown Vault',
          description: config.description || 'No description',
          targetAmount: config.targetAmount || 0n,
          currentAmount: vaultInfo.totalDeposited || 0n,
          deadline: config.deadline || 0n,
          memberCount: vaultInfo.memberCount || 0n,
          creator: vaultInfo.creator,
          isPublic: config.visibility === 1, // 1 = PUBLIC, 0 = PRIVATE
          status: vaultInfo.status || 0,
          tokenSymbol: 'MNT', // Default to native token
        };

        return vaultPreview;
      }

    } catch (error) {
      console.error('Error validating invite code:', error);
      const err = error as Error;
      setValidateError(err);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const joinVaultByInvite = async (inviteCode: string, amount: string, isNativeToken: boolean = false): Promise<void> => {

    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!contractAddress) {
        throw new Error('GoalFinance contract not configured');
      }

      // Validate amount
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Get vault ID from invite code
      let vaultId: bigint;
      let actualInviteCode = inviteCode;

      // Check if this is a bytes32 invite code (on-chain) or legacy frontend code
      const isOnChainInviteCode = inviteCode.startsWith('0x') && inviteCode.length === 66;

      if (isOnChainInviteCode) {
        // Use on-chain invite code lookup
        try {
          vaultId = await publicClient?.readContract({
            address: contractAddress,
            abi: GoalFinanceABI,
            functionName: 'getVaultByInviteCode',
            args: [inviteCode as `0x${string}`],
          }) as bigint;
        } catch (error) {
          throw new Error('Invalid invite code - not found on blockchain');
        }
      } else {
        // Handle legacy frontend-generated invite code
        const extractedVaultId = extractVaultIdFromInviteCode(inviteCode);
        if (!extractedVaultId) {
          throw new Error('Invalid invite code format');
        }

        vaultId = extractedVaultId;

        // Get the actual on-chain invite code for this vault
        try {
          const vaultInfo = await publicClient?.readContract({
            address: contractAddress,
            abi: GoalFinanceABI,
            functionName: 'getVault',
            args: [vaultId],
          }) as any;

          if (vaultInfo && vaultInfo.inviteCode) {
            actualInviteCode = vaultInfo.inviteCode;
          } else {
            throw new Error('Vault not found or no invite code available');
          }
        } catch (error) {
          throw new Error('Could not retrieve vault information');
        }
      }

      let value: bigint = 0n;
      let amountParam: bigint = 0n;

      if (isNativeToken) {
        // For native tokens (ETH/MNT), send value and set amount to 0
        value = parseUnits(amount, 18);
        amountParam = 0n;
      } else {
        // For ERC20 tokens (USDC), set amount parameter and value to 0
        value = 0n;
        amountParam = parseUnits(amount, 6); // USDC has 6 decimals
      }

      // Use the appropriate join function based on token type with the actual invite code
      if (isNativeToken) {
        await joinVaultNative(vaultId, amount, actualInviteCode);
      } else {
        await joinVaultWithTokenHook(vaultId, amount, actualInviteCode);
      }

      toast({
        title: '🎉 Successfully Joined Vault!',
        description: `Welcome to the savings squad! Deposited ${amount} ${isNativeToken ? 'MNT' : 'USDC'}`,
      });



    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Failed to Join Vault',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const joinPublicVault = async (vaultId: bigint, amount: string, isNativeToken: boolean = false): Promise<void> => {
    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!contractAddress) {
        throw new Error('GoalFinance contract not configured');
      }

      // Validate vault ID
      if (!vaultId || vaultId <= 0n) {
        throw new Error('Invalid vault ID');
      }

      // Validate amount
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Get vault info to get the invite code
      const vaultInfo = await publicClient?.readContract({
        address: contractAddress,
        abi: GoalFinanceABI,
        functionName: 'getVault',
        args: [vaultId],
      }) as any;

      if (!vaultInfo || !vaultInfo.inviteCode) {
        throw new Error('Vault not found or no invite code available');
      }

      // Use the appropriate join function based on token type
      if (isNativeToken) {
        await joinVaultNative(vaultId, amount, vaultInfo.inviteCode);
      } else {
        await joinVaultWithTokenHook(vaultId, amount, vaultInfo.inviteCode);
      }

    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Failed to Join Vault',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    generateInviteCode,
    isGenerating,
    generateError,
    
    validateInviteCode,
    isValidating,
    validateError,
    
    joinVaultByInvite,
    isJoining: isJoiningHook,
    joinError: joinErrorHook,
    joinTxHash: joinTxHashHook,

    joinPublicVault,
  };
};
