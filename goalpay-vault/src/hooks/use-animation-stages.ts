import { useState, useEffect } from 'react';

interface UseAnimationStagesOptions {
  enabled: boolean;
  stages: number;
  timings: number[];
}

export function useAnimationStages({ enabled, stages, timings }: UseAnimationStagesOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const timeouts: NodeJS.Timeout[] = [];

    // First timeout for initial load
    timeouts.push(setTimeout(() => setIsLoaded(true), timings[0]));

    // Subsequent timeouts for each animation stage
    for (let i = 1; i < timings.length && i <= stages; i++) {
      timeouts.push(
        setTimeout(() => setCurrentStage(i), timings[i])
      );
    }

    // Cleanup function
    return () => timeouts.forEach(clearTimeout);
  }, [enabled, stages, timings]);

  return { isLoaded, currentStage };
}
