import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

export interface WalletGuardResult {
  isConnected: boolean;
  isAuthenticated: boolean;
  address: string | undefined;
  requireWalletConnection: (action: () => void | Promise<void>) => void;
  showConnectDialog: boolean;
  setShowConnectDialog: (show: boolean) => void;
}

/**
 * Hook to guard actions that require wallet connection
 * Shows connect wallet dialog when user tries to perform actions without wallet
 */
export const useWalletGuard = (): WalletGuardResult => {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const { authenticated } = usePrivy();
  const { address, isConnected } = useAccount();

  const isWalletConnected = authenticated && isConnected && !!address;

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
    isAuthenticated: authenticated,
    address,
    requireWalletConnection,
    showConnectDialog,
    setShowConnectDialog,
  };
};
