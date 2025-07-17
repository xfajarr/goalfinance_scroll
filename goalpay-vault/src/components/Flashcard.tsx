
import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { FlashcardContent } from './FlashcardContent';
import { FlashcardNavigation } from './FlashcardNavigation';
import { FlashcardProgress } from './FlashcardProgress';

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
  flashcards: Array<{ front: string; back: string; difficulty?: 'easy' | 'medium' | 'hard' }>;
  title: string;
  onComplete?: () => void;
}

export const FlashcardSet = ({ flashcards, title, onComplete }: FlashcardSetProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());

  // Default flashcards with actual content
  const defaultFlashcards = [
    {
      front: "What is the best way to start saving money?",
      back: "Start by setting clear goals, creating a budget, and automating your savings. Even small amounts add up over time!",
      difficulty: 'easy' as const
    },
    {
      front: "How much should I save from each paycheck?",
      back: "Financial experts recommend saving at least 20% of your income, but start with what you can afford and gradually increase.",
      difficulty: 'medium' as const
    },
    {
      front: "What's the difference between saving and investing?",
      back: "Saving is putting money aside for short-term goals with low risk. Investing involves putting money into assets that can grow over time but with higher risk.",
      difficulty: 'hard' as const
    }
  ];

  const cardsToUse = flashcards.length > 0 ? flashcards : defaultFlashcards;

  const nextCard = () => {
    if (currentIndex < cardsToUse.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (studiedCards.size === cardsToUse.length) {
      onComplete?.();
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleCardStudied = () => {
    setStudiedCards(prev => new Set([...prev, currentIndex]));
  };

  const isComplete = studiedCards.size === cardsToUse.length;

  return (
    <div className="space-component">
      <div className="text-center space-element">
        <h3 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-heading">{title}</h3>

        <FlashcardProgress
          currentIndex={currentIndex}
          totalCards={cardsToUse.length}
          studiedCount={studiedCards.size}
        />
      </div>

      <FlashcardContent
        front={cardsToUse[currentIndex].front}
        back={cardsToUse[currentIndex].back}
        difficulty={cardsToUse[currentIndex].difficulty}
        onStudied={handleCardStudied}
        cardId={`${title}-${currentIndex}`}
        isStudiedFromParent={studiedCards.has(currentIndex)}
      />

      <FlashcardNavigation
        currentIndex={currentIndex}
        totalCards={cardsToUse.length}
        onPrevious={prevCard}
        onNext={nextCard}
        isComplete={isComplete}
      />

      {isComplete && (
        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border border-green-200">
          <Trophy className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h4 className="text-xl font-fredoka font-bold text-green-700 mb-2">
            Congratulations! 🎉
          </h4>
          <p className="font-inter text-green-600">
            You've completed all {cardsToUse.length} flashcards in this set!
          </p>
        </div>
      )}
    </div>
  );
};
