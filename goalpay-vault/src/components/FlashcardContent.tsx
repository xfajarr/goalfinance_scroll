
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Trophy, Star } from 'lucide-react';
import { useState } from 'react';

interface FlashcardContentProps {
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  onStudied?: () => void;
  cardId?: string | number; // Add unique identifier for each card
  isStudiedFromParent?: boolean; // To show if this card was studied in the set
}

export const FlashcardContent = ({ front, back, difficulty = 'medium', onStudied, cardId, isStudiedFromParent = false }: FlashcardContentProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudied, setIsStudied] = useState(false);

  // Use either local studied state or parent studied state
  const cardIsStudied = isStudied || isStudiedFromParent;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
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

  // Only use manual flip state (no hover)
  const shouldShowBack = isFlipped;

  return (
    <div className="w-full h-72 perspective-1000">
      <div
        className={`relative w-full h-full cursor-pointer transition-all duration-700 transform-style-preserve-3d hover:scale-105 ${
          shouldShowBack ? 'rotate-y-180' : ''
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
          <div className="p-8 h-full flex flex-col justify-center items-center text-center">
            <p className="font-inter text-goal-text-primary leading-relaxed text-lg mb-6">
              {back || "Set clear goals, create a budget, automate savings, and track your progress regularly. Start small and build consistent habits."}
            </p>

            {!cardIsStudied && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStudied();
                }}
                variant="goal"
                className="rounded-full px-6 py-2 mb-4"
              >
                <Star className="w-4 h-4 mr-2" />
                Got it!
              </Button>
            )}

            {cardIsStudied && (
              <div className="flex items-center text-green-600 font-fredoka font-semibold">
                <Trophy className="w-5 h-5 mr-2" />
                Studied!
              </div>
            )}

            <div className="flex items-center justify-center space-x-2 text-goal-text-secondary mt-2">
              <RotateCcw className="w-4 h-4" />
              <span className="font-inter text-xs">Click to flip back</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
