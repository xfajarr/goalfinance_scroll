
import { useState, useMemo } from 'react';
import { formatUnits } from 'viem';
import { Link } from 'react-router-dom';
import { useChainId } from 'wagmi';

import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, AlertTriangle, RefreshCw, History } from 'lucide-react';

// Import modular components
import { QuickStats } from '@/components/dashboard/quick-stats';
import { VaultCard } from '@/components/vault/vault-card';
import { ActivityItem } from '@/components/activity/activity-item';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { AchievementsPreview } from '@/components/dashboard/achievements-preview';
import { SectionHeader } from '@/components/ui/section-header';
import { JoinGoalSection } from '@/components/dashboard/join-vault-section';

// Import constants
import { MONTHLY_SUMMARY, MOCK_ACTIVITY } from '@/constants/dashboard';
import { useUserVaults } from '@/hooks/useUserVaults';
import { useJoinedVaults } from '@/hooks/useJoinedVaults';
import { useFilteredVaultsByStatus } from '@/hooks/useVaultStatusChecker';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { InviteCodeTest } from '@/components/InviteCodeTest';

const Dashboard = () => {
  const [recentActivity] = useState(MOCK_ACTIVITY);
  const chainId = useChainId();

  // Check if current chain is supported (only Mantle Sepolia)
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const isChainSupported = !!contractAddresses?.GOAL_FINANCE;

  // Get user's real goals from smart contract
  const { vaults: userVaults, isLoading: isLoadingVaults, error: vaultsError, refetch } = useUserVaults();

  // Get goals that user has joined (but not created)
  const { vaults: joinedVaults, isLoading: isLoadingJoined, error: joinedError, refetch: refetchJoined } = useJoinedVaults();

  // Filter vaults by real-time status to ensure accurate categorization
  const userVaultsByStatus = useFilteredVaultsByStatus(userVaults || []);
  const joinedVaultsByStatus = useFilteredVaultsByStatus(joinedVaults || []);

  // Debug logging for status filtering
  console.log('🔍 Dashboard Status Filtering Debug:', {
    totalUserVaults: userVaults?.length || 0,
    activeUserVaults: userVaultsByStatus.activeVaults.length,
    completedUserVaults: userVaultsByStatus.completedVaults.length,
    failedUserVaults: userVaultsByStatus.failedVaults.length,
    totalJoinedVaults: joinedVaults?.length || 0,
    activeJoinedVaults: joinedVaultsByStatus.activeVaults.length,
    completedJoinedVaults: joinedVaultsByStatus.completedVaults.length,
    failedJoinedVaults: joinedVaultsByStatus.failedVaults.length,
  });



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

    const totalSaved = allGoals.reduce((sum, goal) => {
      // Determine if this is a native token goal
      const isNativeToken = goal.token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
      const decimals = isNativeToken ? 18 : 6;
      return sum + Number(formatUnits(goal.totalDeposited || 0n, decimals));
    }, 0);

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
  const myGoals = useMemo(() => {
    return userVaultsByStatus.activeVaults.map((goal) => {
      // Determine if this is a native token goal
      const isNativeToken = goal.token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
      const decimals = isNativeToken ? 18 : 6;

      return {
        id: Number(goal.id),
        name: goal.name,
        goal: Number(formatUnits(goal.targetAmount || 0n, decimals)),
        current: Number(formatUnits(goal.totalDeposited || 0n, decimals)),
        members: Number(goal.memberCount || 0n),
        daysLeft: Math.max(0, Math.floor((Number(goal.deadline || 0n) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))),
        status: "active"
      };
    });
  }, [userVaultsByStatus.activeVaults]);

  // Transform joined circles data (only active circles with real-time status)
  const myJoinedCircles = useMemo(() => {
    return joinedVaultsByStatus.activeVaults.map((circle) => {
      // Determine if this is a native token circle
      const isNativeToken = circle.token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
      const decimals = isNativeToken ? 18 : 6;

      return {
        id: Number(circle.id),
        name: circle.name,
        goal: Number(formatUnits(circle.targetAmount || 0n, decimals)),
        current: Number(formatUnits(circle.totalDeposited || 0n, decimals)),
        members: Number(circle.memberCount || 0n),
        daysLeft: Math.max(0, Math.floor((Number(circle.deadline || 0n) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))),
        status: "active"
      };
    });
  }, [joinedVaultsByStatus.activeVaults]);

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">

      <main className="container-content py-8">
        {/* Welcome Section */}
        <SectionHeader
          title="Ready to crush your goals?"
          subtitle="Your financial dreams are getting closer every day!"
          className="mb-8"
        />

        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="2xl:col-span-3 space-y-6 lg:space-y-8">
            {/* Quick Stats */}
            <QuickStats
              activeGoals={stats.activeGoals}
              totalSaved={`$${stats.totalSaved.toLocaleString()}`}
              // earnedYield={`$${stats.earnedYield.toLocaleString()}`}
              earnedYield="Coming Soon"
              friends={stats.friends}
            />

            {/* My Goals */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-fredoka font-bold text-goal-text">My Active Goals</h2>
                  <p className="text-sm text-goal-text/70 font-inter">Goals currently in progress</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Link to="/goals-history">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka font-semibold rounded-full"
                    >
                      <History className="w-4 h-4 mr-2" />
                      View History
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      refetch();
                      refetchJoined();
                    }}
                    variant="outline"
                    size="sm"
                    className="border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka font-semibold rounded-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Link to="/create-goal">
                    <Button
                      size="sm"
                      className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-full transition-all duration-300 hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Goal
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {isLoadingVaults ? (
                  <div className="col-span-full text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-goal-primary mx-auto mb-4"></div>
                    <p className="text-goal-text/70">Loading your goals...</p>
                  </div>
                ) : vaultsError ? (
                  <div className="col-span-full text-center py-8">
                    {!isChainSupported ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 max-w-md mx-auto">
                        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                        <p className="text-orange-600 font-medium mb-2">Unsupported Network</p>
                        <p className="text-orange-500 text-sm mb-4">
                          Please switch to Mantle Sepolia to use Goal Finance.
                        </p>
                        <p className="text-orange-400 text-xs">
                          Current chain ID: {chainId}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-md mx-auto">
                        <p className="text-blue-600 font-medium mb-2">Welcome to Goal Finance! 🎯</p>
                        <p className="text-blue-500 text-sm mb-4">
                          You haven't created any goals yet. Start your savings journey by creating your first goal!
                        </p>
                        <Link to="/create-goal">
                          <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text rounded-2xl px-6 py-3">
                            Create Your First Goal
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : myGoals.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="bg-goal-accent/30 rounded-2xl p-8 max-w-md mx-auto">
                      <div className="text-6xl mb-4">🎯</div>
                      <h3 className="text-xl font-fredoka font-bold text-goal-text mb-2">
                        Start Your First Goal
                      </h3>
                      <p className="text-goal-text/70 mb-6">
                        Create a goal to start saving towards your dreams with friends or on your own.
                      </p>
                      <Link to="/create-goal">
                        <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                          <Plus className="w-5 h-5 mr-2" />
                          Create Your First Goal
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  myGoals.map((goal) => (
                    <VaultCard key={goal.id} vault={goal} />
                  ))
                )}
              </div>
            </Card>

            {/* Joined Circles */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-fredoka font-bold text-goal-text">Active Circles I've Joined</h2>
                  <p className="text-sm text-goal-text/70 font-inter">
                    {myJoinedCircles.length} active circle{myJoinedCircles.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => refetchJoined()}
                    variant="outline"
                    size="sm"
                    className="border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka font-semibold rounded-full px-3 py-2"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {isLoadingJoined ? (
                  <div className="col-span-full flex justify-center py-8 md:py-12">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-goal-primary"></div>
                      <span className="text-goal-text font-fredoka text-sm md:text-base">Loading joined circles...</span>
                    </div>
                  </div>
                ) : joinedError ? (
                  <div className="col-span-full text-center py-8 md:py-12">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 md:p-6 max-w-sm md:max-w-md mx-auto">
                      <div className="text-3xl md:text-4xl mb-3">⚠️</div>
                      <h3 className="text-base md:text-lg font-fredoka font-bold text-red-800 mb-2">
                        Error Loading Joined Circles
                      </h3>
                      <p className="text-red-600 text-xs md:text-sm mb-4">
                        {joinedError.message}
                      </p>
                      <Button
                        onClick={() => refetchJoined()}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50 text-xs md:text-sm"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : myJoinedCircles.length === 0 ? (
                  <div className="col-span-full text-center py-8 md:py-12">
                    <div className="bg-goal-accent/30 rounded-2xl p-6 md:p-8 max-w-sm md:max-w-md mx-auto">
                      <div className="text-4xl md:text-6xl mb-4">🤝</div>
                      <h3 className="text-lg md:text-xl font-fredoka font-bold text-goal-text mb-2">
                        No Joined Circles Yet
                      </h3>
                      <p className="text-goal-text/70 text-sm md:text-base mb-4 md:mb-6">
                        Join a circle using an invite code to start saving with friends towards shared goals.
                      </p>
                      <div className="text-xs md:text-sm text-goal-text/50 font-inter">
                        Use the "Join Circle" section below to get started
                      </div>
                    </div>
                  </div>
                ) : (
                  myJoinedCircles.map((circle) => (
                    <VaultCard key={circle.id} vault={circle} />
                  ))
                )}
              </div>
            </Card>

            {/* Join Circle Section */}
            <JoinGoalSection />

            {/* Recent Activity */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
              <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-text-primary mb-6">Recent Activity</h2>

              <div className="space-element">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Monthly Summary */}
            <MonthlySummary
              saved={MONTHLY_SUMMARY.saved}
              yieldEarned={MONTHLY_SUMMARY.yieldEarned}
              goalsReached={MONTHLY_SUMMARY.goalsReached}
            />

            {/* Quick Actions */}
            <QuickActions />

            {/* Achievements Preview */}
            <AchievementsPreview />
          </div>

        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
