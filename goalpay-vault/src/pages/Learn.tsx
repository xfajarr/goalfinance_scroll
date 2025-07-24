
import { useState } from 'react';

import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FlashcardSet } from '@/components/Flashcard';
import { 
  BookOpen, 
  Trophy, 
  Zap, 
  Target, 
  Star,
  Coins,
  TrendingUp,
  Shield,
  Sparkles,
  Award,
  ChevronRight,
  Clock,
  Users,
  CheckCircle,
  Flame
} from 'lucide-react';

const Learn = () => {
  const [userStats] = useState({
    level: 3,
    totalPoints: 1250,
    streak: 7,
    completedLessons: 12,
    achievements: 5,
    weeklyGoal: 50,
    weeklyProgress: 35
  });

  const flashcardSets = [
    {
      title: "Stablecoin Basics",
      description: "Learn the fundamentals of stablecoins",
      difficulty: "Beginner",
      estimatedTime: "5 min",
      points: 50,
      flashcards: [
        {
          front: "What is a stablecoin?",
          back: "A cryptocurrency designed to maintain a stable value relative to a reference asset, typically the US Dollar.",
          difficulty: "easy" as const
        },
        {
          front: "Why use stablecoins for savings?",
          back: "They offer the benefits of crypto (fast transfers, DeFi yields) while maintaining price stability.",
          difficulty: "medium" as const
        },
        {
          front: "What is USDC?",
          back: "USD Coin - a fully backed dollar stablecoin that's regulated and audited for transparency.",
          difficulty: "medium" as const
        },
        {
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
          front: "What is APY?",
          back: "Annual Percentage Yield - the real rate of return earned on an investment, taking into account compound interest.",
          difficulty: "easy" as const
        },
        {
          front: "How does DeFi generate yield?",
          back: "Through lending protocols, liquidity provision, and automated market making strategies.",
          difficulty: "medium" as const
        },
        {
          front: "What is compound interest?",
          back: "Earning interest on both your principal amount and previously earned interest.",
          difficulty: "easy" as const
        },
        {
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
          front: "What is diversification?",
          back: "Spreading investments across different assets to reduce risk.",
          difficulty: "easy" as const
        },
        {
          front: "What is impermanent loss?",
          back: "The temporary loss of funds when providing liquidity to automated market makers due to price volatility.",
          difficulty: "hard" as const
        },
        {
          front: "How to manage risk in DeFi?",
          back: "Start small, understand protocols, diversify, and never invest more than you can afford to lose.",
          difficulty: "medium" as const
        }
      ]
    }
  ];

  const [activeFlashcardSet, setActiveFlashcardSet] = useState<number | null>(null);
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());

  const handleSetComplete = (setIndex: number) => {
    setCompletedSets(prev => new Set([...prev, setIndex]));
    // Award points and update stats here
  };

  const achievements = [
    { name: "First Steps", icon: Star, description: "Complete your first lesson", unlocked: true, points: 25 },
    { name: "Streak Master", icon: Flame, description: "7-day learning streak", unlocked: true, points: 50 },
    { name: "DeFi Explorer", icon: TrendingUp, description: "Learn about yield farming", unlocked: true, points: 75 },
    { name: "Risk Aware", icon: Shield, description: "Complete risk management course", unlocked: false, points: 100 },
    { name: "Crypto Guru", icon: Award, description: "Reach level 10", unlocked: false, points: 200 }
  ];

  const dailyChallenges = [
    { task: "Study 3 flashcards", progress: 3, target: 3, points: 20, completed: true },
    { task: "Complete a lesson", progress: 0, target: 1, points: 50, completed: false },
    { task: "Maintain streak", progress: 7, target: 1, points: 15, completed: true }
  ];

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {flashcardSets.map((set, index) => (
                    <Card 
                      key={index}
                      className={`p-6 border-goal-border/30 rounded-2xl cursor-pointer hover:scale-[1.02] transition-all duration-200 ${
                        completedSets.has(index) 
                          ? 'bg-green-50/60 border-green-200' 
                          : 'bg-goal-accent/30 hover:bg-goal-accent/40'
                      }`}
                      onClick={() => setActiveFlashcardSet(index)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-fredoka font-semibold ${
                          set.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                          set.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {set.difficulty}
                        </div>
                        {completedSets.has(index) && (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      
                      <h3 className="font-fredoka font-semibold text-goal-text mb-2">{set.title}</h3>
                      <p className="font-inter text-sm text-goal-text/70 mb-4">{set.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-goal-text/60 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{set.estimatedTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Coins className="w-4 h-4" />
                          <span>{set.points} points</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-inter text-sm text-goal-text/70">
                          {set.flashcards.length} cards
                        </span>
                        <div className="flex items-center text-goal-text/60">
                          <span className="font-inter text-sm">
                            {completedSets.has(index) ? 'Review' : 'Start Learning'}
                          </span>
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </div>
                      </div>
                    </Card>
                  ))}
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
                  />
                </div>
              )}
            </Card>

            {/* Achievements */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl">
              <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-6">Achievements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-2xl ${
                      achievement.unlocked 
                        ? 'bg-goal-primary/20 border border-goal-border/50' 
                        : 'bg-goal-accent/10 border border-goal-border/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      achievement.unlocked ? 'bg-goal-primary' : 'bg-goal-border/50'
                    }`}>
                      <achievement.icon className={`w-6 h-6 ${
                        achievement.unlocked ? 'text-goal-text' : 'text-goal-text/40'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-fredoka font-semibold ${
                          achievement.unlocked ? 'text-goal-text' : 'text-goal-text/60'
                        }`}>
                          {achievement.name}
                        </h3>
                        {achievement.unlocked && (
                          <Badge className="bg-goal-primary/20 text-goal-text border-goal-border/30">
                            +{achievement.points}
                          </Badge>
                        )}
                      </div>
                      <p className={`font-inter text-sm ${
                        achievement.unlocked ? 'text-goal-text/70' : 'text-goal-text/50'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats - Compact */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-goal-primary rounded-3xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-8 h-8 text-goal-text" />
                </div>
                <h3 className="font-fredoka font-bold text-goal-text">Level {userStats.level}</h3>
                <p className="font-inter text-sm text-goal-text/70">{userStats.totalPoints.toLocaleString()} points</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-fredoka font-bold text-goal-text">{userStats.streak}</span>
                  </div>
                  <p className="font-inter text-xs text-goal-text/70">Day Streak</p>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <BookOpen className="w-4 h-4 text-goal-text/60" />
                    <span className="font-fredoka font-bold text-goal-text">{userStats.completedLessons}</span>
                  </div>
                  <p className="font-inter text-xs text-goal-text/70">Lessons</p>
                </div>
              </div>
            </Card>

            {/* Weekly Goal */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
              <h3 className="font-fredoka font-semibold text-goal-text mb-4">Weekly Goal</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-inter text-sm text-goal-text/70">Progress</span>
                  <span className="font-fredoka font-semibold text-goal-text">
                    {userStats.weeklyProgress}/{userStats.weeklyGoal}
                  </span>
                </div>
                <Progress 
                  value={(userStats.weeklyProgress / userStats.weeklyGoal) * 100} 
                  className="h-2 bg-goal-accent/30"
                />
                <p className="font-inter text-xs text-goal-text/60">
                  {userStats.weeklyGoal - userStats.weeklyProgress} points to go!
                </p>
              </div>
            </Card>

            {/* Daily Challenges */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
              <h3 className="font-fredoka font-semibold text-goal-text mb-4">Daily Challenges</h3>
              <div className="space-y-3">
                {dailyChallenges.map((challenge, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-goal-accent/20 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        challenge.completed ? 'bg-green-100' : 'bg-goal-border/30'
                      }`}>
                        {challenge.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-2 h-2 bg-goal-text/40 rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-inter text-sm text-goal-text">{challenge.task}</p>
                        <p className="font-inter text-xs text-goal-text/60">
                          {challenge.progress}/{challenge.target}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${
                      challenge.completed 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-goal-primary/20 text-goal-text border-goal-border/30'
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
