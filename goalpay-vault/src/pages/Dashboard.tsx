
import { useState, useMemo } from 'react';
import { formatUnits } from 'viem';
import { Link } from 'react-router-dom';
import { useChainId } from 'wagmi';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, AlertTriangle, RefreshCw } from 'lucide-react';

// Import modular components
import { QuickStats } from '@/components/dashboard/quick-stats';
import { VaultCard } from '@/components/vault/vault-card';
import { ActivityItem } from '@/components/activity/activity-item';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { AchievementsPreview } from '@/components/dashboard/achievements-preview';
import { SectionHeader } from '@/components/ui/section-header';
import { JoinVaultSection } from '@/components/dashboard/join-vault-section';

// Import constants
import { MONTHLY_SUMMARY, MOCK_ACTIVITY } from '@/constants/dashboard';
import { useUserVaults } from '@/hooks/useUserVaults';
import { ContractDebug } from '@/components/debug/ContractDebug';
import { VaultDataDebug } from '@/components/debug/VaultDataDebug';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import '../test-contract-connection';

const Dashboard = () => {
  const [recentActivity] = useState(MOCK_ACTIVITY);
  const chainId = useChainId();

  // Check if current chain is supported (only Mantle Sepolia)
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const isChainSupported = !!contractAddresses?.GOAL_FINANCE;

  // Get user's real vaults from smart contract
  const { vaults: userVaults, isLoading: isLoadingVaults, error: vaultsError, refetch } = useUserVaults();

  // Debug logging to understand what's happening with vault data
  console.log('Dashboard Debug:', {
    chainId,
    isChainSupported,
    userVaults: userVaults ? JSON.parse(JSON.stringify(userVaults, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )) : null,
    isLoadingVaults,
    vaultsError: vaultsError?.message,
    vaultCount: userVaults?.length || 0
  });

  // Calculate real statistics from user vault data
  const calculateStats = () => {
    if (!userVaults || userVaults.length === 0) {
      return {
        totalSaved: 0,
        earnedYield: 0,
        activeGoals: 0,
        friends: 0
      };
    }

    const totalSaved = userVaults.reduce((sum, vault) => {
      // Convert from USDC wei (6 decimals) to dollars
      return sum + Number(formatUnits(vault.totalDeposited || 0n, 6));
    }, 0);

    const activeGoals = userVaults.filter(vault =>
      vault.status === 0 // VaultStatus.ACTIVE = 0
    ).length;

    // For now, yield is 0 as it's a future feature
    const earnedYield = 0;

    // Friends count - calculate total members across all vaults
    // This gives an approximation of social connections
    const friends = userVaults.reduce((sum, vault) => {
      return sum + Number(vault.memberCount);
    }, 0);

    return {
      totalSaved,
      earnedYield,
      activeGoals,
      friends
    };
  };

  const stats = calculateStats();

  // Transform VaultData to format expected by VaultCard
  const myVaults = useMemo(() => {
    return userVaults.map((vault) => {
      // Determine if this is a native token vault
      const isNativeToken = vault.token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
      const decimals = isNativeToken ? 18 : 6;

      return {
        id: Number(vault.id),
        name: vault.name,
        goal: Number(formatUnits(vault.targetAmount || 0n, decimals)),
        current: Number(formatUnits(vault.totalDeposited || 0n, decimals)),
        members: Number(vault.memberCount || 0n),
        daysLeft: Math.max(0, Math.floor((Number(vault.deadline || 0n) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))),
        status: vault.status === 0 ? "active" : vault.status === 1 ? "completed" : vault.status === 2 ? "failed" : "cancelled"
      };
    });
  }, [userVaults]);

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <Navigation />

      <main className="container-content py-8">
        {/* Welcome Section */}
        <SectionHeader
          title="Hi, Welcome back 👋"
          subtitle="You're making great progress on your savings goals!"
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-section">
            {/* Quick Stats */}
            <QuickStats
              totalSaved={`$${stats.totalSaved.toLocaleString()}`}
              earnedYield={`$${stats.earnedYield.toLocaleString()}`}
              activeGoals={stats.activeGoals}
              friends={stats.friends}
            />

            {/* My Vaults */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-fredoka font-bold text-goal-text">My Vaults</h2>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      console.log('Manual refresh triggered');
                      refetch();
                    }}
                    variant="outline"
                    className="border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka font-semibold rounded-full px-4 py-3"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Link to="/create-vault">
                    <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-full px-6 py-3 transition-all duration-300 hover:scale-105">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Vault
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoadingVaults ? (
                  <div className="col-span-full text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-goal-primary mx-auto mb-4"></div>
                    <p className="text-goal-text/70">Loading your vaults...</p>
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
                          You haven't created any vaults yet. Start your savings journey by creating your first vault!
                        </p>
                        <Link to="/create-vault">
                          <Button className="bg-goal-primary hover:bg-goal-primary/90 text-white rounded-2xl px-6 py-3">
                            Create Your First Vault
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : myVaults.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="bg-goal-accent/30 rounded-2xl p-8 max-w-md mx-auto">
                      <div className="text-6xl mb-4">🎯</div>
                      <h3 className="text-xl font-fredoka font-bold text-goal-text mb-2">
                        Start Your First Goal
                      </h3>
                      <p className="text-goal-text/70 mb-6">
                        Create a vault to start saving towards your goals with friends or on your own.
                      </p>
                      <Link to="/create-vault">
                        <Button className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-semibold rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                          <Plus className="w-5 h-5 mr-2" />
                          Create Your First Vault
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  myVaults.map((vault) => (
                    <VaultCard key={vault.id} vault={vault} />
                  ))
                )}
              </div>
            </Card>

            {/* Join Vault Section */}
            <JoinVaultSection />

            {/* Recent Activity */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-section rounded-3xl">
              <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-text-primary mb-6">Recent Activity</h2>

              <div className="space-element">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-component">
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
      <ContractDebug />
      <VaultDataDebug />
    </div>
  );
};

export default Dashboard;
