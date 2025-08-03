import { GoalCircle, GoalCircleMember, GoalCircleCategory } from '@/types/goalCircles';

/**
 * Mock goal circle members for development
 */
export const MOCK_MEMBERS: GoalCircleMember[] = [
  {
    address: '0x1234567890123456789012345678901234567890' as const,
    name: 'Alice Johnson',
    avatar: '👩‍💼',
    joinedAt: new Date('2024-01-15'),
    contributionAmount: 500,
    isActive: true,
    role: 'creator',
  },
  {
    address: '0x2345678901234567890123456789012345678901' as const,
    name: 'Bob Smith',
    avatar: '👨‍💻',
    joinedAt: new Date('2024-01-20'),
    contributionAmount: 300,
    isActive: true,
    role: 'member',
  },
  {
    address: '0x3456789012345678901234567890123456789012' as const,
    name: 'Carol Davis',
    avatar: '👩‍🎨',
    joinedAt: new Date('2024-01-25'),
    contributionAmount: 450,
    isActive: true,
    role: 'member',
  },
  {
    address: '0x4567890123456789012345678901234567890123' as const,
    name: 'David Wilson',
    avatar: '👨‍🔬',
    joinedAt: new Date('2024-02-01'),
    contributionAmount: 200,
    isActive: true,
    role: 'member',
  },
];

/**
 * Mock goal circles for development
 */
export const MOCK_GOAL_CIRCLES: GoalCircle[] = [
  {
    id: 'circle-1',
    name: 'Europe Adventure 2024',
    description: 'Saving together for an epic European backpacking trip this summer!',
    category: 'travel',
    creator: '0x1234567890123456789012345678901234567890' as const,
    createdAt: new Date('2024-01-15'),
    targetAmount: 5000,
    currentAmount: 1450,
    memberCount: 4,
    maxMembers: 6,
    deadline: new Date('2024-06-01'),
    isPublic: true,
    status: 'active',
    members: MOCK_MEMBERS,
    tags: ['travel', 'europe', 'backpacking', 'summer'],
    image: '🌍',
  },
  {
    id: 'circle-2',
    name: 'Emergency Fund Squad',
    description: 'Building our safety nets together - 6 months of expenses each!',
    category: 'emergency-fund',
    creator: '0x2345678901234567890123456789012345678901' as const,
    createdAt: new Date('2024-01-10'),
    targetAmount: 12000,
    currentAmount: 3200,
    memberCount: 3,
    maxMembers: 5,
    deadline: new Date('2024-12-31'),
    isPublic: true,
    status: 'active',
    members: MOCK_MEMBERS.slice(0, 3),
    tags: ['emergency', 'safety', 'financial-security'],
    image: '🛡️',
  },
  {
    id: 'circle-3',
    name: 'Tech Upgrade Circle',
    description: 'Saving for the latest MacBook Pro and other tech gear!',
    category: 'tech',
    creator: '0x3456789012345678901234567890123456789012' as const,
    createdAt: new Date('2024-02-01'),
    targetAmount: 3000,
    currentAmount: 800,
    memberCount: 2,
    maxMembers: 4,
    deadline: new Date('2024-05-01'),
    isPublic: false,
    status: 'active',
    members: MOCK_MEMBERS.slice(1, 3),
    tags: ['technology', 'macbook', 'upgrade'],
    image: '💻',
  },
  {
    id: 'circle-4',
    name: 'Dream Home Down Payment',
    description: 'Saving for our first home down payments - the American dream!',
    category: 'home',
    creator: '0x4567890123456789012345678901234567890123' as const,
    createdAt: new Date('2024-01-05'),
    targetAmount: 50000,
    currentAmount: 12500,
    memberCount: 4,
    maxMembers: 4,
    deadline: new Date('2025-01-01'),
    isPublic: true,
    status: 'active',
    members: MOCK_MEMBERS,
    tags: ['home', 'down-payment', 'real-estate'],
    image: '🏠',
  },
  {
    id: 'circle-5',
    name: 'Wedding Bells 💒',
    description: 'Saving for our dream weddings together!',
    category: 'wedding',
    creator: '0x1234567890123456789012345678901234567890' as const,
    createdAt: new Date('2024-01-20'),
    targetAmount: 15000,
    currentAmount: 4500,
    memberCount: 3,
    maxMembers: 6,
    deadline: new Date('2024-09-01'),
    isPublic: true,
    status: 'active',
    members: MOCK_MEMBERS.slice(0, 3),
    tags: ['wedding', 'celebration', 'love'],
    image: '💒',
  },
];

/**
 * Goal circle categories with metadata
 */
export const GOAL_CIRCLE_CATEGORIES: Record<GoalCircleCategory, {
  name: string;
  emoji: string;
  description: string;
  popular: boolean;
}> = {
  travel: {
    name: 'Travel Dreams',
    emoji: '✈️',
    description: 'Save for your next adventure',
    popular: true,
  },
  'emergency-fund': {
    name: 'Emergency Fund',
    emoji: '🛡️',
    description: 'Build your financial safety net',
    popular: true,
  },
  education: {
    name: 'Education',
    emoji: '📚',
    description: 'Invest in learning and growth',
    popular: false,
  },
  home: {
    name: 'Home Goals',
    emoji: '🏠',
    description: 'Save for your dream home',
    popular: true,
  },
  tech: {
    name: 'Tech & Gadgets',
    emoji: '📱',
    description: 'Latest technology and gadgets',
    popular: false,
  },
  health: {
    name: 'Health & Fitness',
    emoji: '💪',
    description: 'Invest in your wellbeing',
    popular: false,
  },
  investment: {
    name: 'Investment Goals',
    emoji: '📈',
    description: 'Build wealth for the future',
    popular: true,
  },
  vacation: {
    name: 'Vacation Fund',
    emoji: '🏖️',
    description: 'Save for relaxation and fun',
    popular: true,
  },
  wedding: {
    name: 'Wedding Dreams',
    emoji: '💒',
    description: 'Save for your special day',
    popular: false,
  },
  car: {
    name: 'Car Purchase',
    emoji: '🚗',
    description: 'Save for your next vehicle',
    popular: false,
  },
  other: {
    name: 'Other Goals',
    emoji: '🎯',
    description: 'Custom savings goals',
    popular: false,
  },
};

/**
 * Popular goal circle categories for quick access
 */
export const POPULAR_CATEGORIES = Object.entries(GOAL_CIRCLE_CATEGORIES)
  .filter(([_, meta]) => meta.popular)
  .map(([key, meta]) => ({
    key: key as GoalCircleCategory,
    ...meta,
  }));

/**
 * Mock user's joined circles (subset of all circles)
 */
export const MOCK_USER_JOINED_CIRCLES = MOCK_GOAL_CIRCLES.slice(0, 2);

/**
 * Mock user's created circles (subset of all circles)
 */
export const MOCK_USER_CREATED_CIRCLES = MOCK_GOAL_CIRCLES.slice(2, 3);
