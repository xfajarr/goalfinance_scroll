
import { useIsMobile } from '@/hooks/use-mobile';

interface FlashcardProgressProps {
  currentIndex: number;
  totalCards: number;
  studiedCount: number;
}

export const FlashcardProgress = ({ currentIndex, totalCards, studiedCount }: FlashcardProgressProps) => {
  const progressPercentage = (studiedCount / totalCards) * 100;
  const isMobile = useIsMobile();

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className={`flex justify-between items-center font-inter text-goal-text-secondary ${
        isMobile ? 'text-xs sm:text-sm' : 'text-sm'
      }`}>
        <span>Card {currentIndex + 1} of {totalCards}</span>
        <span>{studiedCount} studied</span>
      </div>

      <div className={`w-full bg-goal-accent/30 rounded-full ${
        isMobile ? 'h-2 sm:h-3' : 'h-3'
      }`}>
        <div
          className={`bg-gradient-to-r from-goal-primary to-goal-primary/80 rounded-full transition-all duration-300 ${
            isMobile ? 'h-2 sm:h-3' : 'h-3'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Additional progress info for larger screens */}
      {!isMobile && progressPercentage > 0 && (
        <div className="text-center">
          <span className="text-xs text-goal-text-secondary">
            {Math.round(progressPercentage)}% complete
          </span>
        </div>
      )}
    </div>
  );
};
