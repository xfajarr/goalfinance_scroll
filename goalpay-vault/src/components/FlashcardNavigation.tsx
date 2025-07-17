
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FlashcardNavigationProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  isComplete: boolean;
}

export const FlashcardNavigation = ({ 
  currentIndex, 
  totalCards, 
  onPrevious, 
  onNext, 
  isComplete 
}: FlashcardNavigationProps) => {
  return (
    <div className="flex justify-center space-x-4">
      <Button
        onClick={onPrevious}
        variant="outline"
        size="sm"
        className="rounded-full px-6"
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <Button
        onClick={onNext}
        variant={currentIndex === totalCards - 1 ? "goal" : "outline"}
        size="sm"
        className="rounded-full px-6"
        disabled={currentIndex === totalCards - 1 && !isComplete}
      >
        {currentIndex === totalCards - 1 ? 'Complete' : 'Next'}
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};
