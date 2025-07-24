
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw, Keyboard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

interface FlashcardNavigationProps {
  currentIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
  onShuffle?: () => void;
  onRestart?: () => void;
  isComplete: boolean;
  showKeyboardShortcuts?: boolean;
}

export const FlashcardNavigation = ({
  currentIndex,
  totalCards,
  onPrevious,
  onNext,
  onShuffle,
  onRestart,
  isComplete,
  showKeyboardShortcuts = true
}: FlashcardNavigationProps) => {
  const isMobile = useIsMobile();
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Navigation */}
      <div className={`flex justify-center items-center ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
        <Button
          onClick={onPrevious}
          variant="outline"
          size={isMobile ? "default" : "sm"}
          className={`rounded-full ${isMobile ? 'px-4 py-2' : 'px-6'}`}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
          {!isMobile && 'Previous'}
          {isMobile && 'Prev'}
        </Button>

        <Button
          onClick={onNext}
          variant={currentIndex === totalCards - 1 ? "goal" : "outline"}
          size={isMobile ? "default" : "sm"}
          className={`rounded-full ${isMobile ? 'px-4 py-2' : 'px-6'}`}
          disabled={currentIndex === totalCards - 1 && !isComplete}
        >
          {currentIndex === totalCards - 1 ? 'Complete' : 'Next'}
          <ChevronRight className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} ml-2`} />
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className={`flex justify-center items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
        {onShuffle && (
          <Button
            onClick={onShuffle}
            variant="outline"
            size="sm"
            className="rounded-full px-4 py-2 text-xs"
          >
            <Shuffle className="w-3 h-3 mr-1" />
            {!isMobile && 'Shuffle'}
            {isMobile && 'Mix'}
          </Button>
        )}

        {onRestart && (
          <Button
            onClick={onRestart}
            variant="outline"
            size="sm"
            className="rounded-full px-4 py-2 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Restart
          </Button>
        )}

        {!isMobile && showKeyboardShortcuts && (
          <Button
            onClick={() => setShowShortcuts(!showShortcuts)}
            variant="ghost"
            size="sm"
            className="rounded-full px-3 py-2 text-xs text-goal-text-secondary"
          >
            <Keyboard className="w-3 h-3 mr-1" />
            Shortcuts
          </Button>
        )}
      </div>

      {/* Keyboard Shortcuts Display */}
      {!isMobile && showShortcuts && showKeyboardShortcuts && (
        <div className="bg-goal-accent/20 rounded-2xl p-4 text-center">
          <h4 className="font-fredoka font-semibold text-goal-text mb-3 text-sm">Keyboard Shortcuts</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-goal-text-secondary">
            <div className="flex justify-between">
              <span>Flip card:</span>
              <kbd className="bg-goal-accent/40 px-2 py-1 rounded">Space</kbd>
            </div>
            <div className="flex justify-between">
              <span>Previous:</span>
              <kbd className="bg-goal-accent/40 px-2 py-1 rounded">←</kbd>
            </div>
            <div className="flex justify-between">
              <span>Next:</span>
              <kbd className="bg-goal-accent/40 px-2 py-1 rounded">→</kbd>
            </div>
            <div className="flex justify-between">
              <span>Easy:</span>
              <kbd className="bg-goal-accent/40 px-2 py-1 rounded">1</kbd>
            </div>
            <div className="flex justify-between">
              <span>Medium:</span>
              <kbd className="bg-goal-accent/40 px-2 py-1 rounded">2</kbd>
            </div>
            <div className="flex justify-between">
              <span>Hard:</span>
              <kbd className="bg-goal-accent/40 px-2 py-1 rounded">3</kbd>
            </div>
            <div className="flex justify-between">
              <span>Shuffle:</span>
              <kbd className="bg-goal-accent/40 px-2 py-1 rounded">S</kbd>
            </div>
            <div className="flex justify-between">
              <span>Restart:</span>
              <kbd className="bg-goal-accent/40 px-2 py-1 rounded">R</kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
