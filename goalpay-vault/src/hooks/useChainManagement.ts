import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { useCallback, useMemo } from 'react';
import { mantleSepolia } from '@/config/wagmi';
import { 
  isChainSupported, 
  getChainDisplayInfo, 
  getDefaultChain,
  type ChainDisplayInfo 
} from '@/utils/chainHelpers';

export interface UseChainManagementReturn {
  /** Current chain ID from wagmi */
  currentChainId: number;
  /** Current chain display information */
  currentChain: ChainDisplayInfo | undefined;
  /** Whether the current chain is supported */
  isSupported: boolean;
  /** Whether the user is connected to a wallet */
  isConnected: boolean;
  /** Switch to a specific chain */
  switchToChain: (chainId: number) => Promise<void>;
  /** Switch to the default supported chain */
  switchToDefaultChain: () => Promise<void>;
  /** Whether a chain switch is in progress */
  isSwitching: boolean;
  /** Error from chain switching */
  switchError: Error | null;
}

/**
 * Custom hook for managing chain switching and chain state
 * Provides a clean interface for chain-related operations
 */
export function useChainManagement(): UseChainManagementReturn {
  const currentChainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain, isPending: isSwitching, error: switchError } = useSwitchChain();

  // Memoized chain information
  const currentChain = useMemo(() => 
    getChainDisplayInfo(currentChainId), 
    [currentChainId]
  );

  const isSupported = useMemo(() => 
    isChainSupported(currentChainId), 
    [currentChainId]
  );

  // Chain switching functions
  const switchToChain = useCallback(async (chainId: number) => {
    if (!isChainSupported(chainId)) {
      throw new Error(`Chain ${chainId} is not supported`);
    }
    
    try {
      await switchChain({ chainId });
    } catch (error) {
      console.error('Failed to switch chain:', error);
      throw error;
    }
  }, [switchChain]);

  const switchToDefaultChain = useCallback(async () => {
    const defaultChain = getDefaultChain();
    await switchToChain(defaultChain.id);
  }, [switchToChain]);

  return {
    currentChainId,
    currentChain,
    isSupported,
    isConnected,
    switchToChain,
    switchToDefaultChain,
    isSwitching,
    switchError,
  };
}

/**
 * Hook specifically for checking if the current chain is the required Mantle Sepolia
 * Useful for components that need to enforce Mantle Sepolia usage
 */
export function useRequiredChain() {
  const { currentChainId, isConnected, switchToChain, isSwitching } = useChainManagement();
  
  const isCorrectChain = useMemo(() => 
    currentChainId === mantleSepolia.id, 
    [currentChainId]
  );

  const switchToRequiredChain = useCallback(() => 
    switchToChain(mantleSepolia.id), 
    [switchToChain]
  );

  return {
    isCorrectChain,
    isConnected,
    switchToRequiredChain,
    isSwitching,
    requiredChainId: mantleSepolia.id,
  };
}
