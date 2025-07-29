import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onFlip?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onRateEasy?: () => void;
  onRateMedium?: () => void;
  onRateHard?: () => void;
  onShuffle?: () => void;
  onRestart?: () => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
  const {
    onFlip,
    onPrevious,
    onNext,
    onRateEasy,
    onRateMedium,
    onRateHard,
    onShuffle,
    onRestart,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Prevent default behavior for our handled keys
    const handledKeys = [
      ' ', // Spacebar
      'ArrowLeft',
      'ArrowRight',
      '1',
      '2', 
      '3',
      'r',
      'R',
      's',
      'S'
    ];

    if (handledKeys.includes(event.key)) {
      event.preventDefault();
    }

    // Don't handle keyboard events if user is typing in an input
    const activeElement = document.activeElement;
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).contentEditable === 'true')
    ) {
      return;
    }

    switch (event.key) {
      case ' ': // Spacebar - flip card
        onFlip?.();
        break;
      case 'ArrowLeft': // Left arrow - previous card
        onPrevious?.();
        break;
      case 'ArrowRight': // Right arrow - next card
        onNext?.();
        break;
      case '1': // Number 1 - rate easy
        onRateEasy?.();
        break;
      case '2': // Number 2 - rate medium
        onRateMedium?.();
        break;
      case '3': // Number 3 - rate hard
        onRateHard?.();
        break;
      case 'r':
      case 'R': // R - restart
        onRestart?.();
        break;
      case 's':
      case 'S': // S - shuffle
        onShuffle?.();
        break;
    }
  }, [
    enabled,
    onFlip,
    onPrevious,
    onNext,
    onRateEasy,
    onRateMedium,
    onRateHard,
    onShuffle,
    onRestart,
  ]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  // Return keyboard shortcuts for display
  return {
    shortcuts: {
      flip: 'Space',
      previous: '←',
      next: '→',
      rateEasy: '1',
      rateMedium: '2',
      rateHard: '3',
      shuffle: 'S',
      restart: 'R',
    },
  };
};
