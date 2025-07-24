
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Trophy, Star, Zap, Brain, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useIsMobile } from '@/hooks/use-mobile';

interface FlashcardContentProps {
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  onStudied?: () => void;
  onRated?: (rating: 'easy' | 'medium' | 'hard') => void;
  onFlip?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  cardId?: string | number;
  isStudiedFromParent?: boolean;
  isFlipped?: boolean;
  userRating?: 'easy' | 'medium' | 'hard';
}

export const FlashcardContent = ({
  front,
  back,
  difficulty = 'medium',
  onStudied,
  onRated,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
  cardId,
  isStudiedFromParent = false,
  isFlipped: isFlippedFromParent,
  userRating
}: FlashcardContentProps) => {
  const [localIsFlipped, setLocalIsFlipped] = useState(false);
  const [isStudied, setIsStudied] = useState(false);
  const [showRatingButtons, setShowRatingButtons] = useState(false);
  const isMobile = useIsMobile();

  // Use either local flipped state or parent flipped state
  const isFlipped = isFlippedFromParent !== undefined ? isFlippedFromParent : localIsFlipped;

  // Use either local studied state or parent studied state
  const cardIsStudied = isStudied || isStudiedFromParent;

  const handleFlip = () => {
    if (onFlip) {
      onFlip();
    } else {
      setLocalIsFlipped(!localIsFlipped);
    }

    // Show rating buttons when flipping to back
    if (!isFlipped) {
      setShowRatingButtons(true);
    }
  };

  const handleStudied = () => {
    setIsStudied(true);
    onStudied?.();
  };

  const handleRating = (rating: 'easy' | 'medium' | 'hard') => {
    onRated?.(rating);
    handleStudied();
    setShowRatingButtons(false);
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'border-green-300 bg-green-50/50';
      case 'hard': return 'border-red-300 bg-red-50/50';
      default: return 'border-goal-border/30 bg-white/60';
    }
  };

  const getRatingIcon = (rating: 'easy' | 'medium' | 'hard') => {
    switch (rating) {
      case 'easy': return Zap;
      case 'medium': return Brain;
      case 'hard': return Target;
    }
  };

  const getRatingColor = (rating: 'easy' | 'medium' | 'hard') => {
    switch (rating) {
      case 'easy': return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300';
    }
  };

  // Setup swipe gestures for mobile
  const swipeRef = useSwipeGestures({
    onTap: handleFlip,
    onSwipeLeft: onSwipeLeft,
    onSwipeRight: onSwipeRight,
    threshold: 50,
    preventDefault: true,
  });

  // Reset rating buttons when card changes
  useEffect(() => {
    setShowRatingButtons(false);
  }, [cardId]);

  return (
    <div className="w-full h-72 perspective-1000" ref={swipeRef}>
      <div
        className={`relative w-full h-full cursor-pointer transition-all duration-700 transform-style-preserve-3d ${
          isMobile ? 'active:scale-95' : 'hover:scale-[1.02]'
        } ${
          isFlipped ? 'rotate-y-180' : ''
        } ${cardIsStudied ? 'opacity-75 scale-95' : ''}`}
        onClick={handleFlip}
      >
        {/* Front */}
        <Card className={`absolute inset-0 backface-hidden rounded-3xl ${getDifficultyColor()} ${
          cardIsStudied ? 'ring-2 ring-green-300' : ''
        }`}>
          <div className="p-8 h-full flex flex-col justify-center items-center text-center">
            <div className="mb-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-fredoka font-semibold ${
                difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                'bg-goal-primary/20 text-goal-text-primary'
              }`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </div>
            </div>

            <p className="font-fredoka text-xl font-semibold text-goal-heading mb-6 leading-relaxed">
              {front || "What is the best way to save money?"}
            </p>

            <div className="flex items-center justify-center space-x-2 text-goal-text-secondary">
              <RotateCcw className="w-5 h-5" />
              <span className="font-inter text-sm">Click to reveal answer</span>
            </div>
          </div>
        </Card>

        {/* Back */}
        <Card className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-goal-primary/10 to-goal-accent/20 border-goal-border/30">
          <div className="p-6 md:p-8 h-full flex flex-col justify-center items-center text-center">
            <p className="font-inter text-goal-text-primary leading-relaxed text-base md:text-lg mb-6">
              {back || "Set clear goals, create a budget, automate savings, and track your progress regularly. Start small and build consistent habits."}
            </p>

            {/* Rating Buttons */}
            {!cardIsStudied && showRatingButtons && (
              <div className="space-y-4 mb-6">
                <p className="font-inter text-sm text-goal-text-secondary mb-3">
                  How well did you know this?
                </p>
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-3'}`}>
                  {(['easy', 'medium', 'hard'] as const).map((rating) => {
                    const Icon = getRatingIcon(rating);
                    return (
                      <Button
                        key={rating}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRating(rating);
                        }}
                        variant="outline"
                        size={isMobile ? "default" : "sm"}
                        className={`${getRatingColor(rating)} rounded-full ${
                          isMobile ? 'py-3 px-6 text-base' : 'px-4 py-2 text-sm'
                        } font-fredoka font-medium border-2 transition-all duration-200`}
                      >
                        <Icon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
                        {rating.charAt(0).toUpperCase() + rating.slice(1)}
                        {!isMobile && <span className="ml-2 text-xs opacity-70">({rating === 'easy' ? '1' : rating === 'medium' ? '2' : '3'})</span>}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Simple "Got it" button for basic studying */}
            {!cardIsStudied && !showRatingButtons && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStudied();
                }}
                variant="goal"
                className={`rounded-full ${isMobile ? 'px-8 py-3 text-base' : 'px-6 py-2'} mb-4`}
              >
                <Star className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
                Got it!
              </Button>
            )}

            {/* Show completion status */}
            {cardIsStudied && (
              <div className="flex items-center text-green-600 font-fredoka font-semibold mb-4">
                <Trophy className="w-5 h-5 mr-2" />
                <span>Studied!</span>
                {userRating && (
                  <span className="ml-2 text-sm opacity-75">
                    ({userRating})
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-center space-x-2 text-goal-text-secondary mt-2">
              <RotateCcw className="w-4 h-4" />
              <span className="font-inter text-xs">
                {isMobile ? 'Tap to flip back' : 'Click to flip back'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
