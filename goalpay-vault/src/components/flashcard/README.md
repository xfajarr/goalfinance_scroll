# Enhanced Flashcard Learning System

## Overview

The GoalFi flashcard learning system provides a comprehensive, interactive learning experience that works seamlessly on both mobile and desktop devices. The system includes advanced features like spaced repetition, touch gestures, keyboard navigation, and progress persistence.

## Features

### Core Functionality
- **3D Card Flip Animation**: Smooth CSS-based 3D flip animations
- **Progress Tracking**: Real-time progress indicators and completion tracking
- **Difficulty Rating**: Easy/Medium/Hard rating system for spaced repetition
- **Navigation Controls**: Previous/Next buttons with keyboard shortcuts
- **Completion Celebration**: Visual feedback when sets are completed

### Mobile-Specific Features
- **Touch Gestures**: 
  - Tap to flip cards
  - Swipe left/right to navigate between cards
  - Touch-friendly button sizes (minimum 44px)
- **Responsive Design**: Adapts to various screen sizes
- **Optimized Text**: Appropriate font sizes for mobile readability
- **Prevent Zoom**: Prevents accidental zoom on double-tap

### Desktop-Specific Features
- **Keyboard Shortcuts**:
  - `Space`: Flip current card
  - `←/→`: Navigate between cards
  - `1/2/3`: Rate difficulty (Easy/Medium/Hard)
  - `S`: Shuffle cards
  - `R`: Restart set
- **Hover Effects**: Interactive hover states
- **Keyboard Shortcut Display**: Toggle-able shortcut reference

### Advanced Features
- **Spaced Repetition**: Algorithm-based review scheduling
- **Progress Persistence**: LocalStorage-based progress saving
- **Shuffle & Restart**: Randomize card order and reset progress
- **Auto-Save**: Automatic progress saving
- **Loading States**: Smooth loading and error handling

## Components

### FlashcardSet
Main container component that orchestrates the entire flashcard experience.

```typescript
interface FlashcardSetProps {
  flashcards: Array<{ front: string; back: string; difficulty?: 'easy' | 'medium' | 'hard'; id?: string }>;
  title: string;
  onComplete?: () => void;
  enableAdvancedFeatures?: boolean;
  autoSave?: boolean;
}
```

### FlashcardContent
Individual flashcard component with flip animations and rating system.

```typescript
interface FlashcardContentProps {
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  onStudied?: () => void;
  onRated?: (rating: 'easy' | 'medium' | 'hard') => void;
  onFlip?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  cardId?: string | number;
  isStudiedFromParent?: boolean;
  isFlipped?: boolean;
  userRating?: 'easy' | 'medium' | 'hard';
}
```

### FlashcardNavigation
Navigation controls with keyboard shortcuts and secondary actions.

```typescript
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
```

### FlashcardProgress
Progress indicator showing current position and completion status.

```typescript
interface FlashcardProgressProps {
  currentIndex: number;
  totalCards: number;
  studiedCount: number;
}
```

## Custom Hooks

### useSwipeGestures
Handles touch gestures for mobile devices.

```typescript
const useSwipeGestures = (options: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}) => HTMLElement | null
```

### useKeyboardNavigation
Manages keyboard shortcuts for desktop users.

```typescript
const useKeyboardNavigation = (options: {
  onFlip?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onRateEasy?: () => void;
  onRateMedium?: () => void;
  onRateHard?: () => void;
  onShuffle?: () => void;
  onRestart?: () => void;
  enabled?: boolean;
}) => { shortcuts: Record<string, string> }
```

### useFlashcardProgress
Comprehensive state management with persistence and spaced repetition.

```typescript
const useFlashcardProgress = (options: {
  setId: string;
  flashcards: FlashcardData[];
  autoSave?: boolean;
}) => {
  currentIndex: number;
  currentCard: FlashcardData;
  currentCardProgress: FlashcardProgress;
  isFlipped: boolean;
  isComplete: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  flipCard: () => void;
  markCardStudied: (rating?: 'easy' | 'medium' | 'hard') => void;
  shuffleCards: () => void;
  restartSet: () => void;
  studiedCount: number;
  totalCards: number;
  completionPercentage: number;
}
```

## Usage Examples

### Basic Usage
```tsx
<FlashcardSet
  title="Basic Math"
  flashcards={[
    { id: "1", front: "2 + 2", back: "4", difficulty: "easy" },
    { id: "2", front: "5 × 7", back: "35", difficulty: "medium" }
  ]}
  onComplete={() => console.log("Set completed!")}
/>
```

### Advanced Usage with All Features
```tsx
<FlashcardSet
  title="Advanced Chemistry"
  flashcards={chemistryCards}
  onComplete={handleSetComplete}
  enableAdvancedFeatures={true}
  autoSave={true}
/>
```

### Simple Mode (No Advanced Features)
```tsx
<FlashcardSet
  title="Quick Review"
  flashcards={reviewCards}
  enableAdvancedFeatures={false}
  autoSave={false}
/>
```

## Spaced Repetition Algorithm

The system implements a spaced repetition algorithm based on user ratings:

- **Easy**: Next review in 2.5^reviewCount days (max 30 days)
- **Medium**: Next review in 2^reviewCount days (max 14 days)  
- **Hard**: Next review in 1.3^reviewCount days (min 1 day)

## Data Persistence

Progress is automatically saved to localStorage with the key pattern:
`flashcard-progress-{setId}`

The saved data includes:
- Individual card progress and ratings
- Review counts and scheduling
- Set completion status
- Total study time
- Shuffle state

## Accessibility

- **Keyboard Navigation**: Full keyboard support for desktop users
- **Touch Targets**: Minimum 44px touch targets for mobile
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Logical tab order and focus indicators
- **High Contrast**: Supports system color preferences

## Performance Optimizations

- **Lazy Loading**: Components load only when needed
- **Memoization**: Expensive calculations are memoized
- **Efficient Re-renders**: Optimized state updates
- **Touch Optimization**: Passive event listeners where appropriate
- **CSS Animations**: Hardware-accelerated 3D transforms

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **Touch Events**: Full support for touch and pointer events
- **CSS Features**: 3D transforms, backdrop-filter, CSS Grid

## Customization

The system is highly customizable through:
- **CSS Custom Properties**: Easy theming
- **Component Props**: Flexible configuration
- **Hook Options**: Customizable behavior
- **TypeScript Interfaces**: Type-safe extensions
