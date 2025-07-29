import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWalletGuard } from '@/hooks/use-wallet-guard';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  redirectWhenConnected?: boolean; // If true, redirects connected users to app
}

/**
 * Component for public routes that can optionally redirect authenticated users
 * Used for landing page and other public pages
 */
export function PublicRoute({ 
  children, 
  redirectTo = "/app/dashboard", 
  redirectWhenConnected = true 
}: PublicRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, isLoading } = useWalletGuard();

  useEffect(() => {
    // If user is connected and we should redirect them to the app
    if (!isLoading && isConnected && redirectWhenConnected) {
      // Check if there's a stored "from" location to redirect back to
      const state = location.state as { from?: string } | null;
      const destination = state?.from || redirectTo;
      
      navigate(destination, { replace: true });
    }
  }, [isLoading, isConnected, redirectWhenConnected, navigate, redirectTo, location]);

  // Don't render anything while loading or if we're about to redirect
  if (isLoading || (isConnected && redirectWhenConnected)) {
    return null;
  }

  // Render the public content
  return <>{children}</>;
}

export default PublicRoute;
