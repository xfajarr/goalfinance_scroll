import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, AlertCircle, Loader2 } from 'lucide-react';

interface WalletGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, only requires authentication; if false, requires full wallet connection
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Component that guards children behind wallet connection/authentication
 */
export function WalletGuard({
  children,
  requireAuth = false,
  fallback,
  className
}: WalletGuardProps) {
  const { isConnected, isAuthenticated, isLoading, requireConnection, requireAuth: checkAuth, triggerLogin } = useWalletGuard();

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Initializing wallet...</span>
        </div>
      </div>
    );
  }

  // Check requirements
  const hasRequiredAccess = requireAuth ? isAuthenticated : isConnected;

  // If requirements are met, render children
  if (hasRequiredAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback UI
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
            {requireAuth ? (
              <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            ) : (
              <Wallet className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <CardTitle>
            {requireAuth ? 'Authentication Required' : 'Wallet Connection Required'}
          </CardTitle>
          <CardDescription>
            {requireAuth 
              ? 'Please sign in to access this feature'
              : 'Please connect your wallet to view your data and perform transactions'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={triggerLogin}
            className="w-full"
            size="lg"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {requireAuth ? 'Sign In' : 'Connect Wallet'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


