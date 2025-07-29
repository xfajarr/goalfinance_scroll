import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
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
}

/**
 * Consolidated hook to guard actions that require wallet connection and authentication
 * Combines functionality from both previous wallet guard hooks
 */
export function useWalletGuard(): WalletGuardResult {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const { authenticated, ready, login } = usePrivy();
  const { address, isConnected } = useAccount();

  const isLoading = !ready;
  const isAuthenticated = authenticated && ready;
  const isWalletConnected = isConnected && !!address && authenticated;

  // Function to require wallet connection before proceeding
  const requireConnection = (): boolean => {
    if (!ready) {
      toast.warning('Please wait while we initialize your wallet...');
      return false;
    }

    if (!authenticated) {
      toast.error('Please connect your wallet first');
      login();
      return false;
    }

    if (!isWalletConnected) {
      toast.error('Please connect your wallet to continue');
      return false;
    }

    return true;
  };

  // Function to require authentication before proceeding
  const requireAuth = (): boolean => {
    if (!ready) {
      toast.warning('Please wait while we initialize...');
      return false;
    }

    if (!authenticated) {
      toast.error('Please sign in to continue');
      login();
      return false;
    }

    return true;
  };

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
  };
}
