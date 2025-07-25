import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Start transition
    setIsTransitioning(true);

    // End transition after animation completes
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return {
    isTransitioning,
    transitionClass: isTransitioning ? 'page-transition' : '',
  };
};

// Hook for adding entrance animations to page components
export const usePageEntrance = () => {
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasEntered(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return {
    hasEntered,
    entranceClass: hasEntered ? 'page-transition' : 'opacity-0 translate-y-4',
  };
};
