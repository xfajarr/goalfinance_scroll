
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useChainId } from 'wagmi';

import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Gift, AlertTriangle, RefreshCw, History, Loader2, DollarSign, ChevronRight, Users, PiggyBank, Coins, Target, TrendingUp, Settings } from 'lucide-react';

// Import modular components
import { QuickStats } from '@/components/dashboard/quick-stats';
import { VaultCard } from '@/components/vault/vault-card';
import { ActivityItem } from '@/components/activity/activity-item';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { AchievementsPreview } from '@/components/dashboard/achievements-preview';
import { SectionHeader } from '@/components/ui/section-header';
import { JoinGoalSection } from '@/components/dashboard/join-vault-section';
import { transformVaultDataForCard } from '@/utils/vault-transformers';
import { GoalCirclesSection } from '@/components/dashboard/goal-circles-section';

// Import responsive layout components
import { Container, Grid } from '@/components/layout-components';

// Import constants
import { MONTHLY_SUMMARY, MOCK_ACTIVITY } from '@/constants/dashboard';
import { useUserVaults } from '@/hooks/useUserVaults';
import { useJoinedVaults } from '@/hooks/useJoinedVaults';
import { useFilteredVaultsByStatus } from '@/hooks/useVaultStatusChecker';
import { useUserTotalDeposits } from '@/hooks/useUserTotalDeposits';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { InviteCodeTest } from '@/components/InviteCodeTest';

// Import Acorns components
import { useAcorns } from '@/hooks/useAcorns';
import { PortfolioType } from '@/config/contracts';
import { useTransactionMonitor } from '@/hooks/useTransactionMonitor';
import { RoundableTransactions } from '@/components/acorns/RoundableTransactions';
import { PurchaseTracker } from '@/components/dashboard/PurchaseTracker';
import { AcornsSettings } from '@/components/dashboard/AcornsSettings';

// Mobile Goal Card Component
interface MobileGoalCardProps {
  goal: {
    id: number;
    name: string;
    goal: number;
    current: number;
    members: number;
    daysLeft: number;
    status: string;
  };
  index: number;
}

const MobileGoalCard = ({ goal, index }: MobileGoalCardProps) => {
  // Different emoji avatars for variety
  const avatars = ['😊', '😎', '🤔', '😴', '🙂'];
  const avatar = avatars[index % avatars.length];

  // Different background colors for cards using GoalFi colors
  const cardColors = [
    'bg-goal-primary/60',
    'bg-goal-accent/80',
    'bg-goal-soft/80',
    'bg-goal-primary/40',
    'bg-goal-accent/60'
  ];
  const cardColor = cardColors[index % cardColors.length];

  const progress = (goal.current / goal.goal) * 100;
  const isOnTrack = progress >= 50; // Simple logic for "On track"

  return (
    <Link to={`/goal/${goal.id}`}>
      <Card className={`${cardColor} backdrop-blur-sm border-goal-border/30 p-4 lg:p-6 rounded-2xl hover:scale-[1.02] transition-all duration-200 mb-3 md:mb-0 h-full`}>
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/70 rounded-full flex items-center justify-center">
              <span className="text-2xl lg:text-3xl">{avatar}</span>
            </div>
            <div>
              <h3 className="font-fredoka font-bold text-goal-heading text-lg lg:text-xl">{goal.name}</h3>
              <p className="text-goal-text-secondary text-sm lg:text-base font-inter">
                {goal.daysLeft} days left
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-3 h-3 lg:w-4 lg:h-4 text-goal-text-secondary" />
                <span className="text-goal-text-secondary text-xs lg:text-sm font-inter">
                  {goal.members} members
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-goal-text-secondary text-sm lg:text-base font-inter mb-1">
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-goal-text-secondary text-xs lg:text-sm font-inter">Progress</span>
            <span className="text-goal-text-secondary text-xs lg:text-sm font-inter">
              ${goal.current.toLocaleString()} / ${goal.goal.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2 lg:h-3">
            <div
              className={`h-2 lg:h-3 rounded-full transition-all duration-300 bg-goal-text`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

const Dashboard = () => {
  const chainId = useChainId();

  // State for Acorns modals
  const [showPurchaseTracker, setShowPurchaseTracker] = useState(false);
  const [showAcornsSettings, setShowAcornsSettings] = useState(false);

  // Check if current chain is supported (only Mantle Sepolia)
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const isChainSupported = !!contractAddresses?.GOAL_FINANCE;

  // Acorns hooks
  const { stats: acornsStats, userAccount, isLoading: acornsLoading, registerUser } = useAcorns();
  const { stats: transactionStats } = useTransactionMonitor();

  // Get user's real goals from smart contract
  const { vaults: userVaults, isLoading: isLoadingVaults, error: vaultsError } = useUserVaults();

  // Get goals that user has joined (but not created)
  const { vaults: joinedVaults } = useJoinedVaults();

  // Get user's total personal deposits across all vaults
  const { totalSaved: userTotalSaved } = useUserTotalDeposits();

  // Filter vaults by real-time status to ensure accurate categorization
  const userVaultsByStatus = useFilteredVaultsByStatus(userVaults || []);
  const joinedVaultsByStatus = useFilteredVaultsByStatus(joinedVaults || []);

  // Calculate total goals for "View All" button
  const totalGoalsCount = (userVaults?.length || 0) + (joinedVaults?.length || 0);
  const showViewAllButton = totalGoalsCount > 3;

  // Debug logging for status filtering
  // console.log('🔍 Dashboard Status Filtering Debug:', {
  //   totalUserVaults: userVaults?.length || 0,
  //   activeUserVaults: userVaultsByStatus.activeVaults.length,
  //   completedUserVaults: userVaultsByStatus.completedVaults.length,
  //   failedUserVaults: userVaultsByStatus.failedVaults.length,
  //   totalJoinedVaults: joinedVaults?.length || 0,
  //   activeJoinedVaults: joinedVaultsByStatus.activeVaults.length,
  //   completedJoinedVaults: joinedVaultsByStatus.completedVaults.length,
  //   failedJoinedVaults: joinedVaultsByStatus.failedVaults.length,
  // });



  // Calculate real statistics from user goal data (including joined goals)
  const calculateStats = () => {
    const allActiveGoals = [...userVaultsByStatus.activeVaults, ...joinedVaultsByStatus.activeVaults];
    const allGoals = [...(userVaults || []), ...(joinedVaults || [])];

    if (allGoals.length === 0) {
      return {
        totalSaved: 0,
        earnedYield: 0,
        activeGoals: 0,
        friends: 0
      };
    }

    // Use the user's actual total deposits instead of vault totals
    const totalSaved = userTotalSaved;

    // Use real-time filtered active goals count
    const activeGoals = allActiveGoals.length;

    // For now, yield is 0 as it's a future feature
    const earnedYield = 0;

    // Friends count - calculate total members across all goals
    // This gives an approximation of social connections
    const friends = allGoals.reduce((sum, goal) => {
      return sum + Number(goal.memberCount);
    }, 0);

    return {
      activeGoals,
      totalSaved,
      earnedYield,
      friends
    };
  };

  const stats = calculateStats();

  // Transform GoalData to format expected by VaultCard (only active goals with real-time status)
  // Combine created and joined goals for My Goals section
  const myGoals = useMemo(() => {
    const createdGoals = userVaultsByStatus.activeVaults.map(transformVaultDataForCard);
    const joinedGoals = joinedVaultsByStatus.activeVaults.map(transformVaultDataForCard);

    // Combine and remove duplicates (in case user created and joined the same goal)
    const allGoals = [...createdGoals, ...joinedGoals];
    const uniqueGoals = allGoals.filter((goal, index, self) =>
      index === self.findIndex(g => g.id === goal.id)
    );

    // Limit to maximum 3 goals for dashboard display
    return uniqueGoals.slice(0, 3);
  }, [userVaultsByStatus.activeVaults, joinedVaultsByStatus.activeVaults]);



  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      {/* Total Amount Section */}
      <Container size="xl" className="pt-10 pb-6 lg:pt-16 lg:pb-8">
        <div className="text-center">
          <div className="text-goal-text-secondary text-lg md:text-xl font-inter mb-2">I have</div>
          <div className="text-goal-heading text-5xl md:text-6xl lg:text-7xl font-fredoka font-bold mb-2">
            ${stats.totalSaved.toLocaleString()}
          </div>
          <div className="text-goal-text-secondary text-sm md:text-base font-inter">in my total goals</div>
        </div>
      </Container>

      <Container size="xl" className="space-y-6 lg:space-y-8">
        {/* Win Exciting Rewards Section */}
        <Card className="bg-goal-primary/60 backdrop-blur-sm border-goal-border/30 p-4 lg:p-6 rounded-2xl">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-goal-accent rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6 lg:w-8 lg:h-8 text-goal-text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-goal-heading font-fredoka font-bold text-lg lg:text-xl">Win Exciting Rewards</h3>
              <p className="text-goal-text-secondary text-sm lg:text-base font-inter">Complete your goal to unlock your earning yield</p>
            </div>
          </div>
        </Card>

        {/* My Goals Section */}
        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-goal-heading font-fredoka font-bold text-xl lg:text-2xl">My Goals</h2>
            <div className="flex items-center gap-3">

              {showViewAllButton && (
                <Link to="/app/all-goals">
                  <Button variant="ghost" size="sm" className="text-goal-text/90 hover:text-goal-text font-fredoka font-semibold">
                    View All ({totalGoalsCount})
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Add New Goal Button */}
          <Link to="/app/create-goal">
            <Card className="bg-goal-accent/60 backdrop-blur-sm border-goal-border/30 p-4 lg:p-6 rounded-2xl hover:bg-goal-accent/80 transition-all duration-200">
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 lg:w-6 lg:h-6 text-goal-text-primary" />
                <span className="text-goal-text-primary font-fredoka font-semibold text-sm lg:text-base">Add new goal</span>
              </div>
            </Card>
          </Link>

          {/* Goal Cards */}
          <div className="space-y-3 md:space-y-0">
            {isLoadingVaults ? (
              <Card className="bg-goal-accent/60 backdrop-blur-sm border-goal-border/30 p-4 lg:p-6 rounded-2xl">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-goal-text-primary mx-auto mr-3"></div>
                  <p className="text-goal-text-secondary font-inter">Loading your goals...</p>
                </div>
              </Card>
            ) : vaultsError ? (
              <Card className="bg-goal-accent/60 backdrop-blur-sm border-goal-border/30 p-4 lg:p-6 rounded-2xl">
                <div className="text-center py-8">
                  {!isChainSupported ? (
                    <div>
                      <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                      <p className="text-goal-heading font-medium mb-2">Unsupported Network</p>
                      <p className="text-goal-text-secondary text-sm mb-4">
                        Please switch to Mantle Sepolia to use Goal Finance.
                      </p>
                      <p className="text-goal-text-muted text-xs">
                        Current chain ID: {chainId}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-goal-heading font-medium mb-2">Welcome to Goal Finance! 🎯</p>
                      <p className="text-goal-text-secondary text-sm mb-4">
                        You haven't created any goals yet. Start your savings journey by creating your first goal!
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ) : myGoals.length === 0 ? (
              <Card className="bg-goal-accent/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-lg font-fredoka font-bold text-goal-heading mb-2">
                    Start Your First Goal
                  </h3>
                  <p className="text-goal-text-secondary text-sm mb-4">
                    Create a goal to start saving towards your dreams with friends or on your own.
                  </p>
                </div>
              </Card>
            ) : (
              <Grid cols={3} gap="md" className="md:gap-6">
                {myGoals.map((goal, index) => (
                  <MobileGoalCard key={goal.id} goal={goal} index={index} />
                ))}
              </Grid>
            )}
          </div>
        </div>

        {/* Acorns Micro-Investing Section */}
        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-goal-heading font-fredoka font-bold text-xl lg:text-2xl">Acorns Portfolio</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPurchaseTracker(true)}
                className="text-goal-text/90 hover:text-goal-text font-fredoka font-semibold"
              >
                <Plus className="w-4 h-4 mr-1" />
                Track Purchase
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAcornsSettings(true)}
                className="text-goal-text/90 hover:text-goal-text font-fredoka font-semibold"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>

          {/* Acorns Registration or Stats */}
          {!userAccount?.isRegistered ? (
            <Card className="bg-gradient-to-r from-purple-500/60 to-pink-500/60 backdrop-blur-sm border-purple-300/30 p-4 lg:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-fredoka font-bold text-lg lg:text-xl mb-2">
                    Start Micro-Investing with Acorns
                  </h3>
                  <p className="text-purple-100 text-sm lg:text-base font-inter mb-4">
                    Automatically invest your spare change from everyday purchases
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => registerUser(PortfolioType.CONSERVATIVE)}
                      disabled={acornsLoading}
                      className="bg-white text-purple-600 hover:bg-gray-100"
                    >
                      Conservative (4%)
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => registerUser(PortfolioType.MODERATE)}
                      disabled={acornsLoading}
                      className="bg-white text-purple-600 hover:bg-gray-100"
                    >
                      Moderate (6%)
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => registerUser(PortfolioType.AGGRESSIVE)}
                      disabled={acornsLoading}
                      className="bg-white text-purple-600 hover:bg-gray-100"
                    >
                      Aggressive (8%)
                    </Button>
                  </div>
                </div>
                <PiggyBank className="w-12 h-12 lg:w-16 lg:h-16 text-white/80" />
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Portfolio Value */}
              <Card className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 backdrop-blur-sm border-blue-200/30 p-4 lg:p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Portfolio Value</p>
                    <p className="text-blue-900 text-2xl font-bold">
                      ${(acornsStats?.portfolioValue || 0).toFixed(2)}
                    </p>
                    <p className="text-blue-600 text-xs mt-1">
                      {acornsStats?.portfolioType || 'Portfolio'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              {/* Pending Round-ups */}
              <Card className="bg-gradient-to-br from-orange-50/80 to-orange-100/80 backdrop-blur-sm border-orange-200/30 p-4 lg:p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Pending Round-ups</p>
                    <p className="text-orange-900 text-2xl font-bold">
                      ${(acornsStats?.pendingRoundUps || 0).toFixed(2)}
                    </p>
                    <Link
                      to="/app/roundups"
                      className="text-orange-600 text-xs mt-1 hover:underline"
                    >
                      {transactionStats?.roundableTransactions || 0} transactions →
                    </Link>
                  </div>
                  <Coins className="w-8 h-8 text-orange-600" />
                </div>
              </Card>

              {/* Total Invested */}
              <Card className="bg-gradient-to-br from-green-50/80 to-green-100/80 backdrop-blur-sm border-green-200/30 p-4 lg:p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Total Invested</p>
                    <p className="text-green-900 text-2xl font-bold">
                      ${(acornsStats?.totalInvested || 0).toFixed(2)}
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                      ${(acornsStats?.totalRoundUps || 0).toFixed(2)} from round-ups
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Goal Circles Section */}
        <GoalCirclesSection />

      </Container>

      <BottomNavigation />

      {/* Acorns Modals */}
      {showPurchaseTracker && (
        <PurchaseTracker onClose={() => setShowPurchaseTracker(false)} />
      )}

      {showAcornsSettings && (
        <AcornsSettings onClose={() => setShowAcornsSettings(false)} />
      )}
    </div>
  );
};

export default Dashboard;