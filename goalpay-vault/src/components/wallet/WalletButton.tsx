import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const { login, logout, user } = usePrivy();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { isConnected, isAuthenticated, isLoading } = useWalletGuard();

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
        onClick={login}
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
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="text-sm font-medium">Connected Wallet</p>
          <p className="text-xs text-muted-foreground">{truncatedAddress}</p>
          {userEmail && (
            <p className="text-xs text-muted-foreground mt-1">{userEmail}</p>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleViewExplorer}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDisconnect}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
