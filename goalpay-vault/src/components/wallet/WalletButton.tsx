import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { useChainManagement } from '@/hooks/useChainManagement';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Loader2, Check, Network } from 'lucide-react';
import { toast } from 'sonner';
import { SUPPORTED_CHAINS } from '@/utils/chainHelpers';

interface WalletButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showBalance?: boolean;
}

export function WalletButton({
  variant = 'default',
  size = 'default',
  className,
  showBalance = false
}: WalletButtonProps) {
  const { logout, user } = usePrivy();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { isConnected, isAuthenticated, isLoading, triggerLogin } = useWalletGuard();
  const { currentChain, switchToChain, isSwitching } = useChainManagement();

  // Get native token balance
  const { data: balance } = useBalance({
    address: address,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const handleViewExplorer = () => {
    if (address) {
      window.open(`https://sepolia.mantlescan.xyz/address/${address}`, '_blank');
    }
  };

  const handleNetworkSwitch = async (chainId: number) => {
    try {
      await switchToChain(chainId);
    } catch (error) {
      toast.error('Failed to switch network');
    }
  };

  const handleDisconnect = async () => {
    try {
      // First disconnect from wagmi
      disconnect();

      // Then try to logout from Privy
      try {
        await logout();
      } catch (logoutError) {
        console.warn('Privy logout failed, but wallet disconnected:', logoutError);
        // Continue even if Privy logout fails
      }

      toast.success('Wallet disconnected');

      // Force navigation to landing page
      setTimeout(() => {
        window.location.href = '/';
      }, 500);

    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Not connected - show connect button
  if (!isAuthenticated || !isConnected) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={triggerLogin}
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  // Connected - show wallet dropdown
  const truncatedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  const userEmail = user?.email?.address;
  const displayName = userEmail || truncatedAddress;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`${className} gap-2`}
        >
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-xs">
              {displayName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block">
            {displayName}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 text-gray-900 shadow-lg">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900">{truncatedAddress}</p>
          <p className="text-xs text-gray-500">
            {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 MNT'}
          </p>
        </div>

        <DropdownMenuSeparator className="bg-gray-200" />

        <DropdownMenuItem onClick={handleCopyAddress} className="text-gray-900 hover:bg-gray-50">
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleViewExplorer} className="text-gray-900 hover:bg-gray-50">
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200" />

        <DropdownMenuLabel className="text-gray-900 flex items-center">
          <Network className="mr-2 h-4 w-4" />
          Network
        </DropdownMenuLabel>

        {SUPPORTED_CHAINS.map((chain) => {
          const isCurrentChain = currentChain?.id === chain.id;

          return (
            <DropdownMenuItem
              key={chain.id}
              onClick={() => handleNetworkSwitch(chain.id)}
              className="text-gray-900 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
              disabled={isSwitching}
            >
              <div className="flex items-center">
                <span>{chain.displayName}</span>
              </div>
              {isCurrentChain && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="bg-gray-200" />

        <DropdownMenuItem
          onClick={handleDisconnect}
          className="text-red-600 hover:bg-red-50 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
