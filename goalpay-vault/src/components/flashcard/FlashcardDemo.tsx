import React, { useState } from 'react';
import { FlashcardSet } from '../Flashcard';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const FlashcardDemo = () => {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const demoSets = [
    {
      id: 'basic-demo',
      title: 'Basic Demo',
      description: 'Simple flashcard functionality without advanced features',
      enableAdvanced: false,
      flashcards: [
        {
          id: 'basic-1',
          front: 'What is React?',
          back: 'A JavaScript library for building user interfaces, particularly web applications.',
          difficulty: 'easy' as const
        },
        {
          id: 'basic-2',
          front: 'What is TypeScript?',
          back: 'A typed superset of JavaScript that compiles to plain JavaScript.',
          difficulty: 'medium' as const
        },
        {
          id: 'basic-3',
          front: 'What is a Hook in React?',
          back: 'Functions that let you use state and other React features in functional components.',
          difficulty: 'hard' as const
        }
      ]
    },
    {
      id: 'advanced-demo',
      title: 'Advanced Demo',
      description: 'Full-featured flashcards with spaced repetition, gestures, and keyboard shortcuts',
      enableAdvanced: true,
      flashcards: [
        {
          id: 'advanced-1',
          front: 'What is spaced repetition?',
          back: 'A learning technique that involves reviewing information at increasing intervals to improve long-term retention.',
          difficulty: 'medium' as const
        },
        {
          id: 'advanced-2',
          front: 'How do touch gestures work?',
          back: 'Touch events are captured and processed to detect swipes, taps, and other gestures for intuitive mobile interaction.',
          difficulty: 'hard' as const
        },
        {
          id: 'advanced-3',
          front: 'What are keyboard shortcuts?',
          back: 'Key combinations that provide quick access to functions, improving efficiency for desktop users.',
          difficulty: 'easy' as const
        },
        {
          id: 'advanced-4',
          front: 'How does progress persistence work?',
          back: 'User progress is saved to localStorage, allowing users to resume their learning sessions across browser sessions.',
          difficulty: 'medium' as const
        },
        {
          id: 'advanced-5',
          front: 'What is the benefit of difficulty rating?',
          back: 'It enables spaced repetition algorithms to schedule reviews based on how well you know each card.',
          difficulty: 'hard' as const
        }
      ]
    },
    {
      id: 'mobile-demo',
      title: 'Mobile-Optimized Demo',
      description: 'Demonstrates mobile-specific features like touch gestures and responsive design',
      enableAdvanced: true,
      flashcards: [
        {
          id: 'mobile-1',
          front: 'How to flip a card on mobile?',
          back: 'Simply tap anywhere on the card to flip it and reveal the answer.',
          difficulty: 'easy' as const
        },
        {
          id: 'mobile-2',
          front: 'How to navigate between cards?',
          back: 'Swipe left to go to the next card, or swipe right to go to the previous card.',
          difficulty: 'easy' as const
        },
        {
          id: 'mobile-3',
          front: 'What about button sizes?',
          back: 'All interactive elements are sized appropriately for touch input (minimum 44px).',
          difficulty: 'medium' as const
        }
      ]
    }
  ];

  const handleDemoComplete = (demoId: string) => {
    console.log(`Demo ${demoId} completed!`);
    // You could show a completion message or redirect here
  };

  if (selectedDemo) {
    const demo = demoSets.find(d => d.id === selectedDemo);
    if (!demo) return null;

    return (
      <div className="min-h-screen bg-goal-bg p-4">
        <div className="container-content py-8">
          <Button
            onClick={() => setSelectedDemo(null)}
            variant="outline"
            size="sm"
            className="mb-6 border-goal-border text-goal-text hover:bg-goal-accent rounded-full"
          >
            ← Back to Demos
          </Button>

          <FlashcardSet
            title={demo.title}
            flashcards={demo.flashcards}
            onComplete={() => handleDemoComplete(demo.id)}
            enableAdvancedFeatures={demo.enableAdvanced}
            autoSave={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-goal-bg p-4">
      <div className="container-content py-8">
        <div className="text-center space-component mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-fredoka font-bold text-goal-heading leading-tight">
            Flashcard System Demo 🎓
          </h1>
          <p className="font-inter text-base md:text-lg text-goal-text-secondary max-w-2xl mx-auto leading-relaxed">
            Experience the enhanced flashcard learning system with different feature sets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoSets.map((demo) => (
            <Card 
              key={demo.id}
              className="p-6 border-goal-border/30 rounded-2xl cursor-pointer hover:scale-[1.02] transition-all duration-200 bg-goal-accent/30 hover:bg-goal-accent/40"
              onClick={() => setSelectedDemo(demo.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <Badge className={`${
                  demo.enableAdvanced 
                    ? 'bg-goal-primary/20 text-goal-text border-goal-border/30' 
                    : 'bg-green-100 text-green-700 border-green-200'
                }`}>
                  {demo.enableAdvanced ? 'Advanced' : 'Basic'}
                </Badge>
              </div>
              
              <h3 className="font-fredoka font-semibold text-goal-text mb-2">{demo.title}</h3>
              <p className="font-inter text-sm text-goal-text/70 mb-4">{demo.description}</p>
              
              <div className="flex items-center justify-between text-xs text-goal-text/60 mb-4">
                <span>{demo.flashcards.length} cards</span>
                <span>~{demo.flashcards.length * 2} min</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-inter text-sm text-goal-text/70">
                  Try it out
                </span>
                <div className="flex items-center text-goal-text/60">
                  <span className="font-inter text-sm">Start Demo</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl">
          <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-4">Features Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-fredoka font-semibold text-goal-text mb-3">Mobile Features</h3>
              <ul className="space-y-2 text-sm text-goal-text/70">
                <li>• Touch gestures (tap to flip, swipe to navigate)</li>
                <li>• Responsive design for all screen sizes</li>
                <li>• Touch-friendly button sizes</li>
                <li>• Optimized text and spacing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-fredoka font-semibold text-goal-text mb-3">Desktop Features</h3>
              <ul className="space-y-2 text-sm text-goal-text/70">
                <li>• Keyboard shortcuts (Space, arrows, 1-3, S, R)</li>
                <li>• Hover effects and interactions</li>
                <li>• Keyboard shortcut reference</li>
                <li>• Efficient navigation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-fredoka font-semibold text-goal-text mb-3">Advanced Features</h3>
              <ul className="space-y-2 text-sm text-goal-text/70">
                <li>• Spaced repetition algorithm</li>
                <li>• Progress persistence (localStorage)</li>
                <li>• Difficulty rating system</li>
                <li>• Shuffle and restart functionality</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-fredoka font-semibold text-goal-text mb-3">Core Features</h3>
              <ul className="space-y-2 text-sm text-goal-text/70">
                <li>• 3D flip animations</li>
                <li>• Progress tracking</li>
                <li>• Completion celebrations</li>
                <li>• Loading states and error handling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDemo;
