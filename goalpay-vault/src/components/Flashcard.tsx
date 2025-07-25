
import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { FlashcardContent } from './FlashcardContent';
import { FlashcardNavigation } from './FlashcardNavigation';
import { FlashcardProgress } from './FlashcardProgress';
import { useFlashcardProgress } from '@/hooks/useFlashcardProgress';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

// Enhanced TypeScript interfaces for flashcard system
export interface FlashcardData {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
}

export interface FlashcardProgress {
  cardId: string;
  isStudied: boolean;
  userRating?: 'easy' | 'medium' | 'hard';
  reviewCount: number;
  lastReviewed: Date;
  nextReview: Date;
}

export interface FlashcardSetProgress {
  setId: string;
  cards: FlashcardProgress[];
  isCompleted: boolean;
  completedAt?: Date;
  totalStudyTime: number;
  shuffled: boolean;
}

export interface FlashcardInteraction {
  type: 'flip' | 'navigate' | 'rate' | 'shuffle' | 'restart';
  cardIndex?: number;
  rating?: 'easy' | 'medium' | 'hard';
  timestamp: Date;
}

interface FlashcardProps {
  front: string;
  back: string;
  className?: string;
  onStudied?: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const Flashcard = ({ front, back, className = '', onStudied, difficulty = 'medium' }: FlashcardProps) => {
  return (
    <div className={className}>
      <FlashcardContent
        front={front}
        back={back}
        difficulty={difficulty}
        onStudied={onStudied}
        cardId={`single-${Math.random()}`}
      />
    </div>
  );
};

interface FlashcardSetProps {
  flashcards: Array<{ front: string; back: string; difficulty?: 'easy' | 'medium' | 'hard'; id?: string }>;
  title: string;
  onComplete?: () => void;
  enableAdvancedFeatures?: boolean;
  autoSave?: boolean;
}

export const FlashcardSet = ({
  flashcards,
  title,
  onComplete,
  enableAdvancedFeatures = true,
  autoSave = true
}: FlashcardSetProps) => {
  // Default flashcards with actual content
  const defaultFlashcards = [
    {
      id: 'default-1',
      front: "What is the best way to start saving money?",
      back: "Start by setting clear goals, creating a budget, and automating your savings. Even small amounts add up over time!",
      difficulty: 'easy' as const
    },
    {
      id: 'default-2',
      front: "How much should I save from each paycheck?",
      back: "Financial experts recommend saving at least 20% of your income, but start with what you can afford and gradually increase.",
      difficulty: 'medium' as const
    },
    {
      id: 'default-3',
      front: "What's the difference between saving and investing?",
      back: "Saving is putting money aside for short-term goals with low risk. Investing involves putting money into assets that can grow over time but with higher risk.",
      difficulty: 'hard' as const
    }
  ];

  // Ensure all cards have IDs
  const cardsToUse = (flashcards.length > 0 ? flashcards : defaultFlashcards).map((card, index) => ({
    ...card,
    id: card.id || `${title}-${index}`,
  }));

  const isMobile = useIsMobile();

  // Use the enhanced progress hook if advanced features are enabled
  const progressHook = useFlashcardProgress({
    setId: title.toLowerCase().replace(/\s+/g, '-'),
    flashcards: cardsToUse,
    autoSave,
  });

  // Fallback to simple state management if advanced features are disabled
  const [simpleCurrentIndex, setSimpleCurrentIndex] = useState(0);
  const [simpleStudiedCards, setSimpleStudiedCards] = useState<Set<number>>(new Set());

  // Choose which state management to use
  const {
    currentIndex,
    currentCard,
    currentCardProgress,
    isFlipped,
    isComplete,
    goToNext,
    goToPrevious,
    flipCard,
    markCardStudied,
    shuffleCards,
    restartSet,
    studiedCount,
    totalCards,
  } = enableAdvancedFeatures ? progressHook : {
    currentIndex: simpleCurrentIndex,
    currentCard: cardsToUse[simpleCurrentIndex],
    currentCardProgress: undefined,
    isFlipped: false,
    isComplete: simpleStudiedCards.size === cardsToUse.length,
    goToNext: () => {
      if (simpleCurrentIndex < cardsToUse.length - 1) {
        setSimpleCurrentIndex(prev => prev + 1);
      } else if (simpleStudiedCards.size === cardsToUse.length) {
        onComplete?.();
      }
    },
    goToPrevious: () => {
      if (simpleCurrentIndex > 0) {
        setSimpleCurrentIndex(prev => prev - 1);
      }
    },
    flipCard: () => {},
    markCardStudied: (rating?: 'easy' | 'medium' | 'hard') => {
      setSimpleStudiedCards(prev => new Set([...prev, simpleCurrentIndex]));
    },
    shuffleCards: () => {},
    restartSet: () => {
      setSimpleCurrentIndex(0);
      setSimpleStudiedCards(new Set());
    },
    studiedCount: simpleStudiedCards.size,
    totalCards: cardsToUse.length,
  };

  // Setup keyboard navigation
  useKeyboardNavigation({
    onFlip: enableAdvancedFeatures ? flipCard : undefined,
    onPrevious: goToPrevious,
    onNext: goToNext,
    onRateEasy: enableAdvancedFeatures ? () => markCardStudied('easy') : undefined,
    onRateMedium: enableAdvancedFeatures ? () => markCardStudied('medium') : undefined,
    onRateHard: enableAdvancedFeatures ? () => markCardStudied('hard') : undefined,
    onShuffle: enableAdvancedFeatures ? shuffleCards : undefined,
    onRestart: restartSet,
    enabled: !isMobile, // Only enable keyboard navigation on desktop
  });

  // Handle completion
  if (isComplete && onComplete) {
    onComplete();
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-6">
        <h3 className={`font-fredoka font-bold text-goal-heading ${
          isMobile ? 'text-xl sm:text-2xl' : 'text-2xl md:text-3xl'
        }`}>
          {title}
        </h3>

        <FlashcardProgress
          currentIndex={currentIndex}
          totalCards={totalCards}
          studiedCount={studiedCount}
        />
      </div>

      <FlashcardContent
        front={currentCard?.front || ''}
        back={currentCard?.back || ''}
        difficulty={currentCard?.difficulty}
        onStudied={() => markCardStudied()}
        onRated={enableAdvancedFeatures ? markCardStudied : undefined}
        onFlip={enableAdvancedFeatures ? flipCard : undefined}
        onSwipeLeft={goToNext}
        onSwipeRight={goToPrevious}
        cardId={currentCard?.id}
        isStudiedFromParent={currentCardProgress?.isStudied}
        isFlipped={enableAdvancedFeatures ? isFlipped : undefined}
        userRating={currentCardProgress?.userRating}
      />

      <FlashcardNavigation
        currentIndex={currentIndex}
        totalCards={totalCards}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onShuffle={enableAdvancedFeatures ? shuffleCards : undefined}
        onRestart={restartSet}
        isComplete={isComplete}
        showKeyboardShortcuts={enableAdvancedFeatures && !isMobile}
      />

      {isComplete && (
        <div className={`text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border border-green-200 ${
          isMobile ? 'p-6' : 'p-8'
        }`}>
          <Trophy className={`text-green-600 mx-auto mb-4 ${
            isMobile ? 'w-10 h-10' : 'w-12 h-12'
          }`} />
          <h4 className={`font-fredoka font-bold text-green-700 mb-3 ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>
            Congratulations! 🎉
          </h4>
          <p className={`font-inter text-green-600 mb-4 ${
            isMobile ? 'text-sm' : 'text-base'
          }`}>
            You've completed all {totalCards} flashcards in this set!
          </p>
          {enableAdvancedFeatures && (
            <div className={`flex justify-center gap-4 ${
              isMobile ? 'flex-col' : 'flex-row'
            }`}>
              <Button
                onClick={restartSet}
                variant="outline"
                size={isMobile ? "default" : "sm"}
                className="text-green-600 border-green-300 hover:bg-green-50 rounded-full"
              >
                Study again
              </Button>
              <Button
                onClick={shuffleCards}
                variant="outline"
                size={isMobile ? "default" : "sm"}
                className="text-green-600 border-green-300 hover:bg-green-50 rounded-full"
              >
                Shuffle & restart
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
