import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useUSDCSupport, useContractOwner } from './useTokenSupport';

/**
 * Hook to handle token setup and provide user guidance
 */
export function useTokenSetup() {
  const { address: userAddress } = useAccount();
  const { 
    usdcAddress, 
    isSupported: isUSDCSupported, 
    isLoading: isCheckingSupport,
    owner: contractOwner,
    addUSDCSupport,
    isAdding: isAddingUSDC,
    isAdded: isUSDCAdded,
    refetch: refetchSupport,
  } = useUSDCSupport();

  const [setupStatus, setSetupStatus] = useState<'checking' | 'ready' | 'needs-setup' | 'adding' | 'error'>('checking');
  const [setupMessage, setSetupMessage] = useState<string>('');

  // Check if user is contract owner
  const isOwner = userAddress && contractOwner && userAddress.toLowerCase() === contractOwner.toLowerCase();

  useEffect(() => {
    if (isCheckingSupport) {
      setSetupStatus('checking');
      setSetupMessage('Checking token support...');
      return;
    }

    if (isAddingUSDC) {
      setSetupStatus('adding');
      setSetupMessage('Adding USDC support to contract...');
      return;
    }

    if (isUSDCSupported) {
      setSetupStatus('ready');
      setSetupMessage('USDC is supported and ready to use.');
      return;
    }

    // USDC is not supported
    if (isOwner) {
      setSetupStatus('needs-setup');
      setSetupMessage('USDC is not supported. As the contract owner, you can add USDC support.');
    } else {
      setSetupStatus('error');
      setSetupMessage(`USDC (${usdcAddress}) is not supported by the contract. Please contact the contract owner (${contractOwner}) to add USDC support.`);
    }
  }, [isCheckingSupport, isUSDCSupported, isAddingUSDC, isOwner, usdcAddress, contractOwner]);

  // Separate effect to handle refetching after USDC is added
  useEffect(() => {
    if (isUSDCAdded) {
      setSetupStatus('ready');
      setSetupMessage('USDC support added successfully!');
      // Refetch support status after adding (with a small delay to ensure transaction is processed)
      const timer = setTimeout(() => {
        refetchSupport();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isUSDCAdded, refetchSupport]);

  const handleAddUSDCSupport = async () => {
    if (!isOwner) {
      throw new Error('Only the contract owner can add token support');
    }
    
    try {
      await addUSDCSupport();
    } catch (error) {
      setSetupStatus('error');
      setSetupMessage(`Failed to add USDC support: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  return {
    // Status
    setupStatus,
    setupMessage,
    isReady: setupStatus === 'ready',
    needsSetup: setupStatus === 'needs-setup',
    hasError: setupStatus === 'error',
    
    // Token info
    usdcAddress,
    isUSDCSupported,
    
    // User permissions
    isOwner,
    contractOwner,
    
    // Actions
    addUSDCSupport: handleAddUSDCSupport,
    isAddingUSDC,
    
    // Utils
    refetchSupport,
  };
}
