import { useState, useEffect, useCallback } from 'react';
import { FlashcardData, FlashcardProgress, FlashcardSetProgress } from '@/components/Flashcard';

interface UseFlashcardProgressOptions {
  setId: string;
  flashcards: FlashcardData[];
  autoSave?: boolean;
}

export const useFlashcardProgress = (options: UseFlashcardProgressOptions) => {
  const { setId, flashcards, autoSave = true } = options;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState<FlashcardSetProgress>(() => {
    // Initialize progress from localStorage or create new
    const saved = localStorage.getItem(`flashcard-progress-${setId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        parsed.cards = parsed.cards.map((card: any) => ({
          ...card,
          lastReviewed: new Date(card.lastReviewed),
          nextReview: new Date(card.nextReview),
        }));
        if (parsed.completedAt) {
          parsed.completedAt = new Date(parsed.completedAt);
        }
        return parsed;
      } catch (error) {
        console.warn('Failed to parse saved flashcard progress:', error);
      }
    }
    
    // Create initial progress
    return {
      setId,
      cards: flashcards.map(card => ({
        cardId: card.id,
        isStudied: false,
        reviewCount: 0,
        lastReviewed: new Date(),
        nextReview: new Date(),
      })),
      isCompleted: false,
      totalStudyTime: 0,
      shuffled: false,
    };
  });

  const [shuffledIndices, setShuffledIndices] = useState<number[]>(() => 
    Array.from({ length: flashcards.length }, (_, i) => i)
  );

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: FlashcardSetProgress) => {
    if (autoSave) {
      try {
        localStorage.setItem(`flashcard-progress-${setId}`, JSON.stringify(newProgress));
      } catch (error) {
        console.warn('Failed to save flashcard progress:', error);
      }
    }
  }, [setId, autoSave]);

  // Update progress and save
  const updateProgress = useCallback((updater: (prev: FlashcardSetProgress) => FlashcardSetProgress) => {
    setProgress(prev => {
      const newProgress = updater(prev);
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  // Mark current card as studied
  const markCardStudied = useCallback((rating?: 'easy' | 'medium' | 'hard') => {
    const actualIndex = shuffledIndices[currentIndex];
    const cardId = flashcards[actualIndex]?.id;
    if (!cardId) return;

    updateProgress(prev => ({
      ...prev,
      cards: prev.cards.map(card => 
        card.cardId === cardId
          ? {
              ...card,
              isStudied: true,
              userRating: rating,
              reviewCount: card.reviewCount + 1,
              lastReviewed: new Date(),
              nextReview: calculateNextReview(rating || 'medium', card.reviewCount + 1),
            }
          : card
      ),
    }));
  }, [currentIndex, shuffledIndices, flashcards, updateProgress]);

  // Calculate next review date based on spaced repetition
  const calculateNextReview = (rating: 'easy' | 'medium' | 'hard', reviewCount: number): Date => {
    const now = new Date();
    let daysToAdd = 1;

    // Spaced repetition algorithm
    switch (rating) {
      case 'easy':
        daysToAdd = Math.min(30, Math.pow(2.5, reviewCount));
        break;
      case 'medium':
        daysToAdd = Math.min(14, Math.pow(2, reviewCount));
        break;
      case 'hard':
        daysToAdd = Math.max(1, Math.pow(1.3, reviewCount));
        break;
    }

    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + Math.floor(daysToAdd));
    return nextReview;
  };

  // Navigation functions
  const goToNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, flashcards.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Shuffle cards
  const shuffleCards = useCallback(() => {
    const newIndices = [...shuffledIndices];
    for (let i = newIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newIndices[i], newIndices[j]] = [newIndices[j], newIndices[i]];
    }
    setShuffledIndices(newIndices);
    setCurrentIndex(0);
    setIsFlipped(false);
    
    updateProgress(prev => ({ ...prev, shuffled: true }));
  }, [shuffledIndices, updateProgress]);

  // Restart set
  const restartSet = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffledIndices(Array.from({ length: flashcards.length }, (_, i) => i));
    
    updateProgress(prev => ({
      ...prev,
      cards: prev.cards.map(card => ({
        ...card,
        isStudied: false,
        userRating: undefined,
      })),
      isCompleted: false,
      completedAt: undefined,
      shuffled: false,
    }));
  }, [flashcards.length, updateProgress]);

  // Check if set is complete
  const isComplete = progress.cards.every(card => card.isStudied);

  // Update completion status
  useEffect(() => {
    if (isComplete && !progress.isCompleted) {
      updateProgress(prev => ({
        ...prev,
        isCompleted: true,
        completedAt: new Date(),
      }));
    }
  }, [isComplete, progress.isCompleted, updateProgress]);

  // Get current card data
  const currentCard = flashcards[shuffledIndices[currentIndex]];
  const currentCardProgress = currentCard ? progress.cards.find(p => p.cardId === currentCard.id) : undefined;

  return {
    // State
    currentIndex,
    currentCard,
    currentCardProgress,
    isFlipped,
    isComplete,
    progress,
    shuffledIndices,
    
    // Actions
    goToNext,
    goToPrevious,
    flipCard,
    markCardStudied,
    shuffleCards,
    restartSet,
    
    // Computed values
    studiedCount: progress.cards.filter(card => card.isStudied).length,
    totalCards: flashcards.length,
    completionPercentage: (progress.cards.filter(card => card.isStudied).length / flashcards.length) * 100,
  };
};
