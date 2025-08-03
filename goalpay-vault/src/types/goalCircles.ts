import { Address } from 'viem';

/**
 * Goal Circle Member interface
 */
export interface GoalCircleMember {
  address: Address;
  name: string;
  avatar: string;
  joinedAt: Date;
  contributionAmount: number;
  isActive: boolean;
  role: 'creator' | 'member' | 'admin';
}

/**
 * Goal Circle interface
 */
export interface GoalCircle {
  id: string;
  name: string;
  description: string;
  category: GoalCircleCategory;
  creator: Address;
  createdAt: Date;
  targetAmount: number;
  currentAmount: number;
  memberCount: number;
  maxMembers: number;
  deadline: Date;
  isPublic: boolean;
  status: GoalCircleStatus;
  members: GoalCircleMember[];
  tags: string[];
  image?: string;
  inviteCode?: string;
}

/**
 * Goal Circle Categories
 */
export type GoalCircleCategory = 
  | 'travel'
  | 'emergency-fund'
  | 'education'
  | 'home'
  | 'tech'
  | 'health'
  | 'investment'
  | 'vacation'
  | 'wedding'
  | 'car'
  | 'other';

/**
 * Goal Circle Status
 */
export type GoalCircleStatus = 
  | 'active'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

/**
 * Goal Circle Discovery filters
 */
export interface GoalCircleFilters {
  category?: GoalCircleCategory;
  minAmount?: number;
  maxAmount?: number;
  maxMembers?: number;
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  isPublic?: boolean;
  status?: GoalCircleStatus;
}

/**
 * Goal Circle creation parameters
 */
export interface CreateGoalCircleParams {
  name: string;
  description: string;
  category: GoalCircleCategory;
  targetAmount: number;
  maxMembers: number;
  deadline: Date;
  isPublic: boolean;
  tags: string[];
  image?: string;
}

/**
 * Goal Circle join parameters
 */
export interface JoinGoalCircleParams {
  circleId: string;
  contributionAmount: number;
  inviteCode?: string;
}

/**
 * Goal Circle statistics
 */
export interface GoalCircleStats {
  totalCircles: number;
  activeCircles: number;
  completedCircles: number;
  totalMembers: number;
  totalSaved: number;
  averageCompletion: number;
}

/**
 * User's goal circle profile
 */
export interface UserGoalCircleProfile {
  joinedCircles: GoalCircle[];
  createdCircles: GoalCircle[];
  stats: GoalCircleStats;
  achievements: GoalCircleAchievement[];
}

/**
 * Goal Circle achievements
 */
export interface GoalCircleAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'participation' | 'completion' | 'leadership' | 'milestone';
}

/**
 * Goal Circle activity/feed item
 */
export interface GoalCircleActivity {
  id: string;
  circleId: string;
  type: 'member_joined' | 'contribution_made' | 'goal_reached' | 'milestone_reached' | 'circle_created';
  actor: GoalCircleMember;
  amount?: number;
  message: string;
  timestamp: Date;
}

/**
 * Goal Circle invitation
 */
export interface GoalCircleInvitation {
  id: string;
  circleId: string;
  circle: GoalCircle;
  inviter: GoalCircleMember;
  invitee: Address;
  inviteCode: string;
  message?: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

/**
 * Hook return types for goal circles
 */
export interface UseGoalCirclesReturn {
  circles: GoalCircle[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseUserGoalCirclesReturn {
  joinedCircles: GoalCircle[];
  createdCircles: GoalCircle[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseCreateGoalCircleReturn {
  createCircle: (params: CreateGoalCircleParams) => Promise<GoalCircle>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseJoinGoalCircleReturn {
  joinCircle: (params: JoinGoalCircleParams) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}
