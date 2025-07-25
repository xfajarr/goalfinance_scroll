
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useIsMobile } from '@/hooks/use-mobile';

interface FlashcardContentProps {
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  onStudied?: () => void;
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

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'border-green-300 bg-green-50/50';
      case 'hard': return 'border-red-300 bg-red-50/50';
      default: return 'border-goal-border/30 bg-white/60';
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
    <div className={`w-full perspective-1000 ${
      isMobile ? 'h-80 sm:h-96' : 'h-96 lg:h-[28rem] xl:h-[32rem]'
    }`} ref={swipeRef}>
      <div
        className={`relative w-full h-full cursor-pointer transition-all duration-700 transform-style-preserve-3d ${
          isMobile ? 'active:scale-95 touch-manipulation' : 'hover:scale-[1.02]'
        } ${
          isFlipped ? 'rotate-y-180' : ''
        } ${cardIsStudied ? 'opacity-75 scale-95' : ''}`}
        onClick={handleFlip}
        style={{
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Front */}
        <Card className={`absolute inset-0 backface-hidden rounded-2xl sm:rounded-3xl ${getDifficultyColor()} ${
          cardIsStudied ? 'ring-2 ring-green-300' : ''
        }`}>
          <div className={`${
            isMobile ? 'p-4 sm:p-6' : 'p-6 lg:p-8'
          } h-full flex flex-col justify-center items-center text-center`}>
            <div className="mb-3 sm:mb-4">
              <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full ${
                isMobile ? 'text-xs' : 'text-xs sm:text-sm'
              } font-fredoka font-semibold ${
                difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                'bg-goal-primary/20 text-goal-text-primary'
              }`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </div>
            </div>

            <p className={`font-fredoka font-semibold text-goal-heading mb-4 sm:mb-6 leading-relaxed ${
              isMobile ? 'text-base sm:text-lg' : 'text-lg lg:text-xl xl:text-2xl'
            }`}>
              {front || "What is the best way to save money?"}
            </p>

            <div className="flex items-center justify-center space-x-2 text-goal-text-secondary">
              <RotateCcw className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <span className={`font-inter ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile ? 'Tap to reveal' : 'Click to reveal answer'}
              </span>
            </div>
          </div>
        </Card>

        {/* Back */}
        <Card className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-goal-primary/10 to-goal-accent/20 border-goal-border/30">
          <div className={`${
            isMobile ? 'p-6 sm:p-8' : 'p-8 lg:p-10'
          } h-full flex flex-col justify-between items-center text-center`}>

            {/* Answer Content */}
            <div className="flex-1 flex items-center justify-center">
              <p className={`font-inter text-goal-text-primary leading-relaxed ${
                isMobile ? 'text-base sm:text-lg' : 'text-lg lg:text-xl xl:text-2xl'
              }`}>
                {back || "Set clear goals, create a budget, automate savings, and track your progress regularly. Start small and build consistent habits."}
              </p>
            </div>

            {/* Rating Buttons Section */}
            <div className="w-full">


              {/* Simple "Got it" button for basic studying */}
              {!cardIsStudied && !showRatingButtons && (
                <div className="space-y-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStudied();
                    }}
                    variant="default"
                    size="lg"
                    className={`rounded-full font-fredoka font-medium transition-all duration-200 ${
                      isMobile
                        ? 'px-8 py-4 text-base min-h-[56px]'
                        : 'px-8 py-3 text-base min-h-[48px]'
                    }`}
                  >
                    <Star className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
                    Got it!
                  </Button>
                </div>
              )}

              {/* Show completion status */}
              {cardIsStudied && (
                <div className="space-y-4">
                  <div className={`flex items-center justify-center text-green-600 font-fredoka font-semibold ${
                    isMobile ? 'text-base' : 'text-lg'
                  }`}>
                    <Trophy className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                    <span>Studied!</span>
                    {userRating && (
                      <span className={`ml-2 opacity-75 ${isMobile ? 'text-sm' : 'text-base'}`}>
                        ({userRating})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Flip instruction */}
              <div className="flex items-center justify-center space-x-2 text-goal-text-secondary">
                <RotateCcw className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                <span className={`font-inter ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  {isMobile ? 'Tap to flip back' : 'Click to flip back'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
