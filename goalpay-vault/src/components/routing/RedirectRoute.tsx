import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface RedirectRouteProps {
  to: string;
  preserveParams?: boolean;
}

/**
 * Component that redirects to a new route, optionally preserving URL parameters
 */
export function RedirectRoute({ to, preserveParams = true }: RedirectRouteProps) {
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    let destination = to;
    
    if (preserveParams && params) {
      // Replace parameter placeholders with actual values
      Object.entries(params).forEach(([key, value]) => {
        destination = destination.replace(`:${key}`, value || '');
      });
    }
    
    navigate(destination, { replace: true });
  }, [navigate, to, params, preserveParams]);

  return null; // This component doesn't render anything
}

export default RedirectRoute;
