
interface FlashcardProgressProps {
  currentIndex: number;
  totalCards: number;
  studiedCount: number;
}

export const FlashcardProgress = ({ currentIndex, totalCards, studiedCount }: FlashcardProgressProps) => {
  const progressPercentage = (studiedCount / totalCards) * 100;

  return (
    <div className="space-tight">
      <div className="flex justify-between items-center text-sm font-inter text-goal-text-secondary">
        <span>Card {currentIndex + 1} of {totalCards}</span>
        <span>{studiedCount} studied</span>
      </div>

      <div className="w-full bg-goal-accent/30 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-goal-primary to-goal-primary/80 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};
