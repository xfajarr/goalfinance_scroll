/**
 * Optimized wallet guard hook using Privy's built-in functions
 *
 * This hook leverages Privy's native authentication and wallet management
 * instead of implementing redundant validation logic. Key improvements:
 *
 * - Uses usePrivy() for authentication state (authenticated, ready, login)
 * - Uses useWallets() for connected wallet state (wallets, ready)
 * - Combines Privy and wagmi states for maximum compatibility
 * - Eliminates redundant state management and validation logic
 * - Follows Privy's recommended patterns for wallet connection validation
 */

import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

export interface WalletGuardResult {
  isConnected: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  address: string | undefined;
  requireConnection: () => boolean;
  requireAuth: () => boolean;
  requireWalletConnection: (action: () => void | Promise<void>) => void;
  showConnectDialog: boolean;
  setShowConnectDialog: (show: boolean) => void;
  triggerLogin: () => void;
}

/**
 * Optimized hook using Privy's built-in functions for wallet connection validation
 * Uses Privy's native authentication and wallet management instead of redundant code
 */
export function useWalletGuard(): WalletGuardResult {
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  // Use Privy's built-in hooks for authentication and wallet state
  const { authenticated, ready, login } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { address, isConnected } = useAccount();

  // Privy's ready state indicates when authentication is fully initialized
  const isLoading = !ready || !walletsReady;

  // Use Privy's authenticated state directly - it handles all the complexity
  const isAuthenticated = authenticated && ready;

  // Check if user has connected wallets using Privy's wallet management
  const hasConnectedWallets = wallets.length > 0;

  // Combined connection state using both Privy and wagmi for compatibility
  const isWalletConnected = isAuthenticated && (hasConnectedWallets || (isConnected && !!address));

  // Simplified validation using Privy's built-in state management
  const requireConnection = useCallback((): boolean => {
    // Use Privy's ready state to check initialization
    if (isLoading) {
      toast.warning('Please wait while we initialize...');
      return false;
    }

    // Use Privy's authenticated state for validation
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first');
      return false;
    }

    // Check wallet connection using Privy's wallet state
    if (!isWalletConnected) {
      toast.error('Please connect your wallet to continue');
      return false;
    }

    return true;
  }, [isLoading, isAuthenticated, isWalletConnected]);

  // Simplified authentication check using Privy's state
  const requireAuth = useCallback((): boolean => {
    // Use Privy's loading state
    if (isLoading) {
      toast.warning('Please wait while we initialize...');
      return false;
    }

    // Use Privy's authenticated state directly
    if (!isAuthenticated) {
      toast.error('Please sign in to continue');
      return false;
    }

    return true;
  }, [isLoading, isAuthenticated]);

  // Function to guard actions with dialog fallback
  const requireWalletConnection = (action: () => void | Promise<void>) => {
    if (isWalletConnected) {
      // Wallet is connected, execute the action
      action();
    } else {
      // Wallet not connected, show connect dialog
      setShowConnectDialog(true);
    }
  };

  // Safe login trigger using Privy's built-in login function
  const triggerLogin = useCallback(() => {
    // Only trigger login if Privy is ready and user is not authenticated
    if (ready && !authenticated) {
      login();
    }
  }, [ready, authenticated, login]);

  return {
    isConnected: isWalletConnected,
    isAuthenticated,
    isLoading,
    address,
    requireConnection,
    requireAuth,
    requireWalletConnection,
    showConnectDialog,
    setShowConnectDialog,
    triggerLogin,
  };
}
