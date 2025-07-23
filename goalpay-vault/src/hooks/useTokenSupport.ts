import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { GOAL_FINANCE_CONTRACT, CONTRACT_ADDRESSES } from '../config/contracts';
import { useChainId } from 'wagmi';

/**
 * Hook to check if a token is supported by the GoalFinance contract
 */
export function useIsTokenSupported(tokenAddress?: Address) {
  const { data: isSupported, isLoading, error, refetch } = useReadContract({
    ...GOAL_FINANCE_CONTRACT,
    functionName: 'isTokenSupported',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
    },
  });

  return {
    isSupported: isSupported as boolean,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get the contract owner
 */
export function useContractOwner() {
  const { data: owner, isLoading, error } = useReadContract({
    ...GOAL_FINANCE_CONTRACT,
    functionName: 'owner',
  });

  return {
    owner: owner as Address,
    isLoading,
    error,
  };
}

/**
 * Hook to add a supported token (owner only)
 */
export function useAddSupportedToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const addToken = async (tokenAddress: Address) => {
    try {
      await writeContract({
        ...GOAL_FINANCE_CONTRACT,
        functionName: 'addSupportedToken',
        args: [tokenAddress],
      });
    } catch (err) {
      console.error('Failed to add supported token:', err);
      throw err;
    }
  };

  return {
    addToken,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to check USDC support status and provide utilities
 */
export function useUSDCSupport() {
  const chainId = useChainId();
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const usdcAddress = contractAddresses?.USDC;

  const { isSupported, isLoading, error, refetch } = useIsTokenSupported(usdcAddress);
  const { owner } = useContractOwner();
  const { addToken, isPending: isAdding, isSuccess: isAdded } = useAddSupportedToken();

  const addUSDCSupport = async () => {
    if (!usdcAddress) {
      throw new Error('USDC address not found for current chain');
    }
    await addToken(usdcAddress);
  };

  return {
    usdcAddress,
    isSupported,
    isLoading,
    error,
    owner,
    addUSDCSupport,
    isAdding,
    isAdded,
    refetch,
  };
}
