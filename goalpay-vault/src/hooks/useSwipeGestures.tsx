import { useRef, useEffect, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export const useSwipeGestures = (options: SwipeGestureOptions): React.RefObject<HTMLDivElement> => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    threshold = 50,
    preventDefault = true,
  } = options;

  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchEndRef = useRef<TouchPosition | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchEndRef.current = null;
  }, [preventDefault]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }
  }, [preventDefault]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.changedTouches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    if (!touchStartRef.current || !touchEndRef.current) return;

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Check for tap (small movement, quick time)
    if (absX < 10 && absY < 10 && deltaTime < 300) {
      onTap?.();
      return;
    }

    // Check for swipe gestures
    if (Math.max(absX, absY) > threshold) {
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, threshold, preventDefault]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return elementRef;
};
