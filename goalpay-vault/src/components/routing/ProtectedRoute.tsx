import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean; // If true, only requires authentication; if false, requires full wallet connection
}

/**
 * Component that protects routes behind wallet connection/authentication
 * Redirects unauthenticated users to the landing page
 */
export function ProtectedRoute({ 
  children, 
  redirectTo = "/", 
  requireAuth = false 
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, isAuthenticated, isLoading } = useWalletGuard();

  // Determine if user has required access
  const hasRequiredAccess = requireAuth ? isAuthenticated : isConnected;

  useEffect(() => {
    // Only redirect if we're done loading and user doesn't have access
    if (!isLoading && !hasRequiredAccess) {
      // Store the attempted location for potential redirect after login
      const from = location.pathname + location.search;
      navigate(redirectTo, { 
        replace: true,
        state: { from } 
      });
    }
  }, [isLoading, hasRequiredAccess, navigate, redirectTo, location]);

  // Show loading state while checking wallet connection
  if (isLoading) {
    return (
      <div className="min-h-screen bg-goal-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-goal-text">
          <Loader2 className="h-8 w-8 animate-spin text-goal-primary" />
          <div className="text-center">
            <p className="font-fredoka font-semibold text-lg">Initializing GoalFi</p>
            <p className="text-sm text-goal-text/70 mt-1">Checking wallet connection...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user doesn't have required access, don't render anything (redirect will happen)
  if (!hasRequiredAccess) {
    return null;
  }

  // User has required access, render the protected content
  return <>{children}</>;
}

export default ProtectedRoute;
