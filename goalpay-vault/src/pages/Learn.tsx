
import { useState, useEffect } from 'react';

import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FlashcardSet } from '@/components/Flashcard';
import { useLearnProgress } from '@/hooks/useLearnProgress';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/sonner';
import {
  BookOpen,
  Trophy,
  Star,
  Coins,
  TrendingUp,
  Shield,
  Sparkles,
  Award,
  ChevronRight,
  Clock,
  CheckCircle,
  Flame,
  Target,
  Zap,
  Users,
  Calendar,
  BarChart3,
  Gift,
  Lightbulb
} from 'lucide-react';

const Learn = () => {
  const isMobile = useIsMobile();
  const { progress, awardPoints, completeSet, updateDailyChallenge } = useLearnProgress();
  const [activeFlashcardSet, setActiveFlashcardSet] = useState<number | null>(null);
  const [studyStartTime, setStudyStartTime] = useState<Date | null>(null);

  const flashcardSets = [
    {
      title: "Stablecoin Basics",
      description: "Learn the fundamentals of stablecoins",
      difficulty: "Beginner",
      estimatedTime: "5 min",
      points: 50,
      flashcards: [
        {
          id: "stablecoin-1",
          front: "What is a stablecoin?",
          back: "A cryptocurrency designed to maintain a stable value relative to a reference asset, typically the US Dollar.",
          difficulty: "easy" as const
        },
        {
          id: "stablecoin-2",
          front: "Why use stablecoins for savings?",
          back: "They offer the benefits of crypto (fast transfers, DeFi yields) while maintaining price stability.",
          difficulty: "medium" as const
        },
        {
          id: "stablecoin-3",
          front: "What is USDC?",
          back: "USD Coin - a fully backed dollar stablecoin that's regulated and audited for transparency.",
          difficulty: "medium" as const
        },
        {
          id: "stablecoin-4",
          front: "How are stablecoins backed?",
          back: "Most stablecoins are backed by reserves of fiat currency, government bonds, or other stable assets held by the issuer.",
          difficulty: "hard" as const
        }
      ]
    },
    {
      title: "DeFi & Yield Farming",
      description: "Understanding decentralized finance",
      difficulty: "Intermediate",
      estimatedTime: "8 min",
      points: 75,
      flashcards: [
        {
          id: "defi-1",
          front: "What is APY?",
          back: "Annual Percentage Yield - the real rate of return earned on an investment, taking into account compound interest.",
          difficulty: "easy" as const
        },
        {
          id: "defi-2",
          front: "How does DeFi generate yield?",
          back: "Through lending protocols, liquidity provision, and automated market making strategies.",
          difficulty: "medium" as const
        },
        {
          id: "defi-3",
          front: "What is compound interest?",
          back: "Earning interest on both your principal amount and previously earned interest.",
          difficulty: "easy" as const
        },
        {
          id: "defi-4",
          front: "What is liquidity mining?",
          back: "Providing liquidity to DeFi protocols in exchange for token rewards, often in addition to trading fees.",
          difficulty: "hard" as const
        }
      ]
    },
    {
      title: "Risk Management",
      description: "Smart strategies to protect your investments",
      difficulty: "Advanced",
      estimatedTime: "10 min",
      points: 100,
      flashcards: [
        {
          id: "risk-1",
          front: "What is diversification?",
          back: "Spreading investments across different assets to reduce risk.",
          difficulty: "easy" as const
        },
        {
          id: "risk-2",
          front: "What is impermanent loss?",
          back: "The temporary loss of funds when providing liquidity to automated market makers due to price volatility.",
          difficulty: "hard" as const
        },
        {
          id: "risk-3",
          front: "How to manage risk in DeFi?",
          back: "Start small, understand protocols, diversify, and never invest more than you can afford to lose.",
          difficulty: "medium" as const
        }
      ]
    }
  ];

  // Enhanced completion handler with progress tracking
  const handleSetComplete = (setIndex: number) => {
    if (!studyStartTime) return;

    const timeSpent = Math.floor((Date.now() - studyStartTime.getTime()) / 1000);
    const set = flashcardSets[setIndex];
    const setId = set.title.toLowerCase().replace(/\s+/g, '-');

    // Calculate accuracy (simplified - in real app, track individual card performance)
    const accuracy = Math.floor(Math.random() * 20) + 80; // 80-100% for demo

    // Complete the set
    completeSet(setIndex, setId, accuracy, timeSpent);

    // Award points based on set difficulty
    const points = set.points || 50;
    awardPoints(points, setId.includes('defi') ? 'defi' : setId.includes('risk') ? 'risk' : 'general');

    // Update daily challenges
    updateDailyChallenge('lessons', 1);
    updateDailyChallenge('flashcards', set.flashcards.length);

    // Show success toast
    toast.success(`🎉 Completed ${set.title}!`, {
      description: `Earned ${points} points • ${accuracy}% accuracy`,
    });

    // Reset study timer
    setStudyStartTime(null);
    setActiveFlashcardSet(null);
  };

  // Helper function to start studying a set
  const handleStartSet = (setIndex: number) => {
    setActiveFlashcardSet(setIndex);
    setStudyStartTime(new Date());
    updateDailyChallenge('streak', 1);
  };

  // Get icon component from string
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      star: Star,
      flame: Flame,
      'trending-up': TrendingUp,
      shield: Shield,
      award: Award,
      target: Target,
      zap: Zap,
    };
    return icons[iconName] || Star;
  };

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      
      <main className="container-content py-8">
        <div className="text-center space-component mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-fredoka font-bold text-goal-heading leading-tight">
            Learn & Earn 📚
          </h1>
          <p className="font-inter text-base md:text-lg text-goal-text-secondary max-w-2xl mx-auto leading-relaxed">
            Master DeFi, stablecoins, and smart saving strategies through interactive lessons and earn rewards!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-section">
            {/* Flashcard Learning */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-section rounded-3xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-goal-primary rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-goal-heading" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-heading">Interactive Flashcards</h2>
                  <p className="font-inter text-goal-text-secondary">Learn through spaced repetition</p>
                </div>
              </div>

              {activeFlashcardSet === null ? (
                <div className={`grid gap-4 sm:gap-6 ${
                  isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                }`}>
                  {flashcardSets.map((set, index) => {
                    const isCompleted = progress.completedSets.has(index);
                    const setId = set.title.toLowerCase().replace(/\s+/g, '-');
                    const setProgress = progress.setProgress[setId];

                    return (
                      <Card
                        key={index}
                        className={`p-4 sm:p-6 border-goal-border/30 rounded-2xl cursor-pointer transition-all duration-200 ${
                          isMobile ? 'active:scale-95' : 'hover:scale-[1.02]'
                        } ${
                          isCompleted
                            ? 'bg-green-50/60 border-green-200'
                            : 'bg-goal-accent/30 hover:bg-goal-accent/40'
                        }`}
                        onClick={() => handleStartSet(index)}
                      >
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                          <div className={`px-2 sm:px-3 py-1 rounded-full font-fredoka font-semibold ${
                            isMobile ? 'text-xs' : 'text-xs sm:text-sm'
                          } ${
                            set.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                            set.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {set.difficulty}
                          </div>
                          {isCompleted && (
                            <div className="flex items-center space-x-1">
                              {setProgress?.accuracy && (
                                <span className={`text-green-600 font-fredoka font-semibold ${
                                  isMobile ? 'text-xs' : 'text-sm'
                                }`}>
                                  {setProgress.accuracy}%
                                </span>
                              )}
                              <CheckCircle className={`text-green-600 ${
                                isMobile ? 'w-5 h-5' : 'w-6 h-6'
                              }`} />
                            </div>
                          )}
                        </div>

                        <h3 className={`font-fredoka font-semibold text-goal-text mb-2 ${
                          isMobile ? 'text-base' : 'text-base sm:text-lg'
                        }`}>
                          {set.title}
                        </h3>
                        <p className={`font-inter text-goal-text/70 mb-3 sm:mb-4 ${
                          isMobile ? 'text-sm' : 'text-sm'
                        }`}>
                          {set.description}
                        </p>

                        <div className={`flex items-center justify-between text-goal-text/60 mb-3 sm:mb-4 ${
                          isMobile ? 'text-xs' : 'text-xs sm:text-sm'
                        }`}>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Clock className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                            <span>{set.estimatedTime}</span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Coins className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                            <span>{set.points} points</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`font-inter text-goal-text/70 ${
                            isMobile ? 'text-sm' : 'text-sm'
                          }`}>
                            {set.flashcards.length} cards
                          </span>
                          <div className="flex items-center text-goal-text/60">
                            <span className={`font-inter ${
                              isMobile ? 'text-sm' : 'text-sm'
                            }`}>
                              {isCompleted ? 'Review' : 'Start Learning'}
                            </span>
                            <ChevronRight className={`ml-1 sm:ml-2 ${
                              isMobile ? 'w-4 h-4' : 'w-4 h-4'
                            }`} />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <Button
                    onClick={() => setActiveFlashcardSet(null)}
                    variant="outline"
                    size="sm"
                    className="mb-6 border-goal-border text-goal-text hover:bg-goal-accent rounded-full"
                  >
                    ← Back to Sets
                  </Button>
                  <FlashcardSet
                    title={flashcardSets[activeFlashcardSet].title}
                    flashcards={flashcardSets[activeFlashcardSet].flashcards}
                    onComplete={() => handleSetComplete(activeFlashcardSet)}
                    enableAdvancedFeatures={true}
                    autoSave={true}
                  />
                </div>
              )}
            </Card>

            {/* Achievements */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl">
              <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-6">Achievements</h2>
              
              <div className={`grid gap-3 sm:gap-4 ${
                isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
              }`}>
                {progress.achievements.map((achievement, index) => {
                  const IconComponent = getIconComponent(achievement.icon);
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-2xl transition-all duration-200 ${
                        achievement.unlocked
                          ? 'bg-goal-primary/20 border border-goal-border/50'
                          : 'bg-goal-accent/10 border border-goal-border/20'
                      }`}
                    >
                      <div className={`rounded-2xl flex items-center justify-center ${
                        isMobile ? 'w-10 h-10' : 'w-12 h-12'
                      } ${
                        achievement.unlocked ? 'bg-goal-primary' : 'bg-goal-border/50'
                      }`}>
                        <IconComponent className={`${
                          isMobile ? 'w-5 h-5' : 'w-6 h-6'
                        } ${
                          achievement.unlocked ? 'text-goal-text' : 'text-goal-text/40'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-fredoka font-semibold truncate ${
                            isMobile ? 'text-sm' : 'text-base'
                          } ${
                            achievement.unlocked ? 'text-goal-text' : 'text-goal-text/60'
                          }`}>
                            {achievement.name}
                          </h3>
                          {achievement.unlocked && (
                            <Badge className={`bg-goal-primary/20 text-goal-text border-goal-border/30 ${
                              isMobile ? 'text-xs px-2 py-0.5' : 'text-xs'
                            }`}>
                              +{achievement.points}
                            </Badge>
                          )}
                        </div>
                        <p className={`font-inter ${
                          isMobile ? 'text-xs' : 'text-sm'
                        } ${
                          achievement.unlocked ? 'text-goal-text/70' : 'text-goal-text/50'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats - Compact */}
            <Card className={`bg-white/60 backdrop-blur-sm border-goal-border/30 rounded-3xl ${
              isMobile ? 'p-4' : 'p-6'
            }`}>
              <div className={`text-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
                <div className={`bg-goal-primary rounded-3xl flex items-center justify-center mx-auto mb-3 ${
                  isMobile ? 'w-12 h-12' : 'w-16 h-16'
                }`}>
                  <Trophy className={`text-goal-text ${
                    isMobile ? 'w-6 h-6' : 'w-8 h-8'
                  }`} />
                </div>
                <h3 className={`font-fredoka font-bold text-goal-text ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}>
                  Level {progress.userStats.level}
                </h3>
                <p className={`font-inter text-goal-text/70 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  {progress.userStats.totalPoints.toLocaleString()} points
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Flame className={`text-orange-500 ${
                      isMobile ? 'w-3 h-3' : 'w-4 h-4'
                    }`} />
                    <span className={`font-fredoka font-bold text-goal-text ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      {progress.userStats.streak}
                    </span>
                  </div>
                  <p className={`font-inter text-goal-text/70 ${
                    isMobile ? 'text-xs' : 'text-xs'
                  }`}>
                    Day Streak
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <BookOpen className={`text-goal-text/60 ${
                      isMobile ? 'w-3 h-3' : 'w-4 h-4'
                    }`} />
                    <span className={`font-fredoka font-bold text-goal-text ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      {progress.userStats.completedLessons}
                    </span>
                  </div>
                  <p className={`font-inter text-goal-text/70 ${
                    isMobile ? 'text-xs' : 'text-xs'
                  }`}>
                    Lessons
                  </p>
                </div>
              </div>
            </Card>

            {/* Weekly Goal */}
            <Card className={`bg-white/60 backdrop-blur-sm border-goal-border/30 rounded-3xl ${
              isMobile ? 'p-4' : 'p-6'
            }`}>
              <h3 className={`font-fredoka font-semibold text-goal-text mb-3 sm:mb-4 ${
                isMobile ? 'text-base' : 'text-lg'
              }`}>
                Weekly Goal
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`font-inter text-goal-text/70 ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    Progress
                  </span>
                  <span className={`font-fredoka font-semibold text-goal-text ${
                    isMobile ? 'text-sm' : 'text-base'
                  }`}>
                    {progress.userStats.weeklyProgress}/{progress.userStats.weeklyGoal}
                  </span>
                </div>
                <Progress
                  value={(progress.userStats.weeklyProgress / progress.userStats.weeklyGoal) * 100}
                  className={`bg-goal-accent/30 ${isMobile ? 'h-2' : 'h-2'}`}
                />
                <p className={`font-inter text-goal-text/60 ${
                  isMobile ? 'text-xs' : 'text-xs'
                }`}>
                  {progress.userStats.weeklyGoal - progress.userStats.weeklyProgress} points to go!
                </p>
              </div>
            </Card>

            {/* Daily Challenges */}
            <Card className={`bg-white/60 backdrop-blur-sm border-goal-border/30 rounded-3xl ${
              isMobile ? 'p-4' : 'p-6'
            }`}>
              <h3 className={`font-fredoka font-semibold text-goal-text mb-3 sm:mb-4 ${
                isMobile ? 'text-base' : 'text-lg'
              }`}>
                Daily Challenges
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {progress.dailyChallenges.map((challenge) => (
                  <div key={challenge.id} className={`flex items-center justify-between rounded-xl bg-goal-accent/20 ${
                    isMobile ? 'p-2.5' : 'p-3'
                  }`}>
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className={`rounded-full flex items-center justify-center ${
                        isMobile ? 'w-5 h-5' : 'w-6 h-6'
                      } ${
                        challenge.completed ? 'bg-green-100' : 'bg-goal-border/30'
                      }`}>
                        {challenge.completed ? (
                          <CheckCircle className={`text-green-600 ${
                            isMobile ? 'w-3 h-3' : 'w-4 h-4'
                          }`} />
                        ) : (
                          <div className={`bg-goal-text/40 rounded-full ${
                            isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-inter text-goal-text truncate ${
                          isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                          {challenge.task}
                        </p>
                        <p className={`font-inter text-goal-text/60 ${
                          isMobile ? 'text-xs' : 'text-xs'
                        }`}>
                          {challenge.progress}/{challenge.target}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${
                      challenge.completed
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-goal-primary/20 text-goal-text border-goal-border/30'
                    } ${
                      isMobile ? 'text-xs px-2 py-0.5' : 'text-xs'
                    }`}>
                      +{challenge.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Learn;
