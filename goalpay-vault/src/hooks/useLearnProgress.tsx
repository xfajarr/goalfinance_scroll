import { useState, useEffect, useCallback } from 'react';

export interface UserStats {
  level: number;
  totalPoints: number;
  streak: number;
  completedLessons: number;
  achievements: number;
  weeklyGoal: number;
  weeklyProgress: number;
  lastStudyDate: string;
  totalStudyTime: number;
  averageAccuracy: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  icon: string;
  category: 'learning' | 'streak' | 'completion' | 'mastery';
}

export interface DailyChallenge {
  id: string;
  task: string;
  progress: number;
  target: number;
  points: number;
  completed: boolean;
  type: 'flashcards' | 'lessons' | 'streak' | 'accuracy';
}

export interface LearnProgress {
  completedSets: Set<number>;
  setProgress: Record<string, {
    completedAt: Date;
    accuracy: number;
    timeSpent: number;
    reviewCount: number;
  }>;
  userStats: UserStats;
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
}

const STORAGE_KEY = 'goalfi-learn-progress';

export const useLearnProgress = () => {
  const [progress, setProgress] = useState<LearnProgress>(() => {
    // Load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert Set and Date objects
        parsed.completedSets = new Set(parsed.completedSets || []);
        Object.keys(parsed.setProgress || {}).forEach(key => {
          if (parsed.setProgress[key].completedAt) {
            parsed.setProgress[key].completedAt = new Date(parsed.setProgress[key].completedAt);
          }
        });
        parsed.achievements?.forEach((achievement: any) => {
          if (achievement.unlockedAt) {
            achievement.unlockedAt = new Date(achievement.unlockedAt);
          }
        });
        return parsed;
      } catch (error) {
        console.warn('Failed to parse learn progress:', error);
      }
    }

    // Default state
    return {
      completedSets: new Set<number>(),
      setProgress: {},
      userStats: {
        level: 1,
        totalPoints: 0,
        streak: 0,
        completedLessons: 0,
        achievements: 0,
        weeklyGoal: 50,
        weeklyProgress: 0,
        lastStudyDate: '',
        totalStudyTime: 0,
        averageAccuracy: 0,
      },
      achievements: [
        { id: 'first-steps', name: 'First Steps', description: 'Complete your first lesson', points: 25, unlocked: false, icon: 'star', category: 'learning' },
        { id: 'streak-master', name: 'Streak Master', description: '7-day learning streak', points: 50, unlocked: false, icon: 'flame', category: 'streak' },
        { id: 'defi-explorer', name: 'DeFi Explorer', description: 'Learn about yield farming', points: 75, unlocked: false, icon: 'trending-up', category: 'learning' },
        { id: 'risk-aware', name: 'Risk Aware', description: 'Complete risk management course', points: 100, unlocked: false, icon: 'shield', category: 'completion' },
        { id: 'crypto-guru', name: 'Crypto Guru', description: 'Reach level 10', points: 200, unlocked: false, icon: 'award', category: 'mastery' },
        { id: 'perfect-score', name: 'Perfect Score', description: 'Get 100% accuracy on a set', points: 150, unlocked: false, icon: 'target', category: 'mastery' },
        { id: 'speed-learner', name: 'Speed Learner', description: 'Complete a set in under 2 minutes', points: 100, unlocked: false, icon: 'zap', category: 'mastery' },
      ],
      dailyChallenges: [
        { id: 'daily-flashcards', task: 'Study 3 flashcards', progress: 0, target: 3, points: 20, completed: false, type: 'flashcards' },
        { id: 'daily-lesson', task: 'Complete a lesson', progress: 0, target: 1, points: 50, completed: false, type: 'lessons' },
        { id: 'daily-streak', task: 'Maintain streak', progress: 0, target: 1, points: 15, completed: false, type: 'streak' },
      ],
    };
  });

  // Save to localStorage whenever progress changes
  useEffect(() => {
    const toSave = {
      ...progress,
      completedSets: Array.from(progress.completedSets),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [progress]);

  // Calculate level based on total points
  const calculateLevel = useCallback((points: number) => {
    return Math.floor(points / 100) + 1;
  }, []);

  // Award points and check for achievements
  const awardPoints = useCallback((points: number, category?: string) => {
    setProgress(prev => {
      const newTotalPoints = prev.userStats.totalPoints + points;
      const newLevel = calculateLevel(newTotalPoints);
      const leveledUp = newLevel > prev.userStats.level;

      let newAchievements = [...prev.achievements];
      let newUnlockedCount = prev.userStats.achievements;

      // Check for new achievements
      newAchievements = newAchievements.map(achievement => {
        if (!achievement.unlocked) {
          let shouldUnlock = false;

          switch (achievement.id) {
            case 'first-steps':
              shouldUnlock = prev.userStats.completedLessons >= 1;
              break;
            case 'streak-master':
              shouldUnlock = prev.userStats.streak >= 7;
              break;
            case 'defi-explorer':
              shouldUnlock = category === 'defi';
              break;
            case 'risk-aware':
              shouldUnlock = category === 'risk';
              break;
            case 'crypto-guru':
              shouldUnlock = newLevel >= 10;
              break;
          }

          if (shouldUnlock) {
            newUnlockedCount++;
            return { ...achievement, unlocked: true, unlockedAt: new Date() };
          }
        }
        return achievement;
      });

      return {
        ...prev,
        userStats: {
          ...prev.userStats,
          totalPoints: newTotalPoints,
          level: newLevel,
          achievements: newUnlockedCount,
          weeklyProgress: Math.min(prev.userStats.weeklyProgress + points, prev.userStats.weeklyGoal),
        },
        achievements: newAchievements,
      };
    });
  }, [calculateLevel]);

  // Complete a flashcard set
  const completeSet = useCallback((setIndex: number, setId: string, accuracy: number, timeSpent: number) => {
    setProgress(prev => {
      const newCompletedSets = new Set([...prev.completedSets, setIndex]);
      const isFirstCompletion = !prev.completedSets.has(setIndex);
      
      let newAchievements = [...prev.achievements];
      if (accuracy === 100 && !prev.achievements.find(a => a.id === 'perfect-score')?.unlocked) {
        newAchievements = newAchievements.map(a => 
          a.id === 'perfect-score' ? { ...a, unlocked: true, unlockedAt: new Date() } : a
        );
      }

      if (timeSpent < 120 && !prev.achievements.find(a => a.id === 'speed-learner')?.unlocked) {
        newAchievements = newAchievements.map(a => 
          a.id === 'speed-learner' ? { ...a, unlocked: true, unlockedAt: new Date() } : a
        );
      }

      return {
        ...prev,
        completedSets: newCompletedSets,
        setProgress: {
          ...prev.setProgress,
          [setId]: {
            completedAt: new Date(),
            accuracy,
            timeSpent,
            reviewCount: (prev.setProgress[setId]?.reviewCount || 0) + 1,
          },
        },
        userStats: {
          ...prev.userStats,
          completedLessons: isFirstCompletion ? prev.userStats.completedLessons + 1 : prev.userStats.completedLessons,
          totalStudyTime: prev.userStats.totalStudyTime + timeSpent,
          lastStudyDate: new Date().toISOString(),
          streak: calculateStreak(prev.userStats.lastStudyDate),
        },
        achievements: newAchievements,
      };
    });
  }, []);

  // Update daily challenge progress
  const updateDailyChallenge = useCallback((type: DailyChallenge['type'], increment: number = 1) => {
    setProgress(prev => ({
      ...prev,
      dailyChallenges: prev.dailyChallenges.map(challenge => {
        if (challenge.type === type && !challenge.completed) {
          const newProgress = Math.min(challenge.progress + increment, challenge.target);
          const completed = newProgress >= challenge.target;
          
          if (completed && !challenge.completed) {
            // Award challenge points
            setTimeout(() => awardPoints(challenge.points), 100);
          }
          
          return { ...challenge, progress: newProgress, completed };
        }
        return challenge;
      }),
    }));
  }, [awardPoints]);

  // Calculate streak
  const calculateStreak = (lastStudyDate: string): number => {
    if (!lastStudyDate) return 1;
    
    const last = new Date(lastStudyDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return progress.userStats.streak + 1;
    } else if (diffDays === 0) {
      return progress.userStats.streak;
    } else {
      return 1; // Reset streak
    }
  };

  // Reset daily challenges (call this daily)
  const resetDailyChallenges = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      dailyChallenges: prev.dailyChallenges.map(challenge => ({
        ...challenge,
        progress: 0,
        completed: false,
      })),
    }));
  }, []);

  return {
    progress,
    awardPoints,
    completeSet,
    updateDailyChallenge,
    resetDailyChallenges,
    calculateLevel,
  };
};
