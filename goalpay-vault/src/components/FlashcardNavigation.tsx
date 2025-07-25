
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
    <div className="space-y-4 sm:space-y-6">
      {/* Main Navigation */}
      <div className={`flex justify-center items-center gap-4 sm:gap-6`}>
        <Button
          onClick={onPrevious}
          variant="outline"
          size="lg"
          className={`rounded-full font-fredoka font-medium transition-all duration-200 ${
            isMobile
              ? 'px-6 py-3 text-base min-h-[48px] min-w-[100px]'
              : 'px-8 py-3 text-base min-h-[48px] min-w-[120px]'
          }`}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} mr-2`} />
          <span>
            {isMobile ? 'Prev' : 'Previous'}
          </span>
        </Button>

        <Button
          onClick={onNext}
          variant={currentIndex === totalCards - 1 ? "goal" : "outline"}
          size="lg"
          className={`rounded-full font-fredoka font-medium transition-all duration-200 ${
            isMobile
              ? 'px-6 py-3 text-base min-h-[48px] min-w-[100px]'
              : 'px-8 py-3 text-base min-h-[48px] min-w-[120px]'
          }`}
          disabled={currentIndex === totalCards - 1 && !isComplete}
        >
          <span>
            {currentIndex === totalCards - 1 ? 'Complete' : 'Next'}
          </span>
          <ChevronRight className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} ml-2`} />
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className={`flex justify-center items-center flex-wrap gap-3 sm:gap-4`}>
        {onShuffle && (
          <Button
            onClick={onShuffle}
            variant="outline"
            size="default"
            className={`rounded-full font-fredoka font-medium transition-all duration-200 ${
              isMobile
                ? 'px-4 py-2 text-sm min-h-[40px]'
                : 'px-5 py-2 text-sm min-h-[40px]'
            }`}
          >
            <Shuffle className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} mr-2`} />
            <span>{isMobile ? 'Mix' : 'Shuffle'}</span>
          </Button>
        )}

        {onRestart && (
          <Button
            onClick={onRestart}
            variant="outline"
            size="default"
            className={`rounded-full font-fredoka font-medium transition-all duration-200 ${
              isMobile
                ? 'px-4 py-2 text-sm min-h-[40px]'
                : 'px-5 py-2 text-sm min-h-[40px]'
            }`}
          >
            <RotateCcw className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} mr-2`} />
            <span>Restart</span>
          </Button>
        )}

        {!isMobile && showKeyboardShortcuts && (
          <Button
            onClick={() => setShowShortcuts(!showShortcuts)}
            variant="ghost"
            size="default"
            className="rounded-full px-4 py-2 text-sm text-goal-text-secondary hover:text-goal-text hover:bg-goal-accent/20 min-h-[40px]"
          >
            <Keyboard className="w-4 h-4 mr-2" />
            <span>Shortcuts</span>
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
