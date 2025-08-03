import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNavigation from '@/components/BottomNavigation';
import { WalletGuard } from '@/components/wallet/WalletGuard';
import { ArrowLeft, AlertTriangle, Loader2, RefreshCw, Target, Users } from 'lucide-react';

import { VaultCard } from '@/components/vault/vault-card';
import { SectionHeader } from '@/components/ui/section-header';
import { useUserVaults } from '@/hooks/useUserVaults';
import { useJoinedVaults } from '@/hooks/useJoinedVaults';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { transformVaultDataForCard } from '@/utils/vault-transformers';
import { useFilteredVaultsByStatus } from '@/hooks/useVaultStatusChecker';

const AllGoals = () => {
  const chainId = useChainId();
  const { isConnected } = useAccount();

  // Check if current chain is supported
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const isChainSupported = !!contractAddresses?.GOAL_FINANCE;

  // Get user's goals from smart contract
  const { vaults: userVaults, isLoading: isLoadingVaults, error: vaultsError, refetch } = useUserVaults();

  // Get goals that user has joined
  const { vaults: joinedVaults, isLoading: isLoadingJoined, error: joinedError, refetch: refetchJoined } = useJoinedVaults();

  // Filter vaults by real-time status to ensure only active goals are shown
  const userVaultsByStatus = useFilteredVaultsByStatus(userVaults || []);
  const joinedVaultsByStatus = useFilteredVaultsByStatus(joinedVaults || []);

  // Combine and categorize goals with transformation (ONLY ACTIVE GOALS)
  const { createdGoals, joinedGoalsOnly, allGoals } = useMemo(() => {
    // Only use active vaults to ensure failed/completed goals don't appear
    const created = userVaultsByStatus.activeVaults.map(transformVaultDataForCard);
    const joined = joinedVaultsByStatus.activeVaults.map(transformVaultDataForCard);

    // Combine and remove duplicates (in case user created and joined the same goal)
    const all = [...created, ...joined];
    const uniqueGoals = all.filter((goal, index, self) =>
      index === self.findIndex(g => g.id === goal.id)
    );

    return {
      createdGoals: created,
      joinedGoalsOnly: joined,
      allGoals: uniqueGoals,
    };
  }, [userVaultsByStatus.activeVaults, joinedVaultsByStatus.activeVaults]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalGoals = allGoals.length;
    const activeGoals = allGoals.filter(goal => goal.status === 'active').length;
    const completedGoals = allGoals.filter(goal => goal.status === 'completed').length;

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      createdCount: createdGoals.length,
      joinedCount: joinedGoalsOnly.length,
    };
  }, [allGoals, createdGoals, joinedGoalsOnly]);

  const isLoading = isLoadingVaults || isLoadingJoined;
  const hasError = vaultsError || joinedError;

  const handleRefresh = () => {
    refetch();
    refetchJoined();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
        <main className="container-content py-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-fredoka font-bold text-goal-text mb-2">Wallet Not Connected</h2>
            <p className="text-goal-text/70 mb-6">Please connect your wallet to view your goals.</p>
            <Link to="/app/dashboard">
              <Button className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-semibold">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <WalletGuard requireAuth={false}>
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
        <main className="container-content py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/app/dashboard">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <SectionHeader
                title="All Goals"
                subtitle={`Manage all ${stats.totalGoals} of your goals`}
                className="mb-0"
              />
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka font-semibold rounded-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-goal-primary/20 rounded-lg">
                  <Target className="w-5 h-5 text-goal-text" />
                </div>
                <div>
                  <p className="text-2xl font-fredoka font-bold text-goal-text">{stats.totalGoals}</p>
                  <p className="text-xs text-goal-text/70 font-inter">Total Goals</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-fredoka font-bold text-goal-text">{stats.activeGoals}</p>
                  <p className="text-xs text-goal-text/70 font-inter">Active</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-goal-accent/50 rounded-lg">
                  <Target className="w-5 h-5 text-goal-text" />
                </div>
                <div>
                  <p className="text-2xl font-fredoka font-bold text-goal-text">{stats.createdCount}</p>
                  <p className="text-xs text-goal-text/70 font-inter">Created</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-fredoka font-bold text-goal-text">{stats.joinedCount}</p>
                  <p className="text-xs text-goal-text/70 font-inter">Joined</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Goals Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-goal-accent/30 rounded-2xl p-1">
              <TabsTrigger 
                value="all" 
                className="rounded-xl font-fredoka font-semibold data-[state=active]:bg-white data-[state=active]:text-goal-text"
              >
                All Goals ({stats.totalGoals})
              </TabsTrigger>
              <TabsTrigger 
                value="created" 
                className="rounded-xl font-fredoka font-semibold data-[state=active]:bg-white data-[state=active]:text-goal-text"
              >
                Created ({stats.createdCount})
              </TabsTrigger>
              <TabsTrigger 
                value="joined" 
                className="rounded-xl font-fredoka font-semibold data-[state=active]:bg-white data-[state=active]:text-goal-text"
              >
                Joined ({stats.joinedCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
                <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-6">All Your Goals</h2>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-goal-primary mr-3" />
                    <p className="text-goal-text font-inter">Loading your goals...</p>
                  </div>
                ) : hasError ? (
                  <div className="text-center py-12">
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
                        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                        <p className="text-goal-heading font-medium mb-2">Error Loading Goals</p>
                        <p className="text-goal-text-secondary text-sm mb-4">
                          There was an error loading your goals. Please try refreshing.
                        </p>
                        <Button onClick={handleRefresh} className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-semibold">
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>
                ) : allGoals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-lg font-fredoka font-bold text-goal-heading mb-2">
                      No Goals Yet
                    </h3>
                    <p className="text-goal-text/70 mb-6">Create your first goal to start saving towards your dreams!</p>
                    <Link to="/app/create-goal">
                      <Button className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-semibold">
                        Create New Goal
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {allGoals.map((goal) => (
                      <VaultCard key={`all-${goal.id}`} vault={goal} />
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="created" className="mt-6">
              <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
                <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-6">Goals You Created</h2>

                {createdGoals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-lg font-fredoka font-bold text-goal-heading mb-2">
                      No Created Goals
                    </h3>
                    <p className="text-goal-text/70 mb-6">Start your savings journey by creating your first goal!</p>
                    <Link to="/app/create-goal">
                      <Button className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-semibold">
                        Create New Goal
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {createdGoals.map((goal) => (
                      <VaultCard key={`created-${goal.id}`} vault={goal} />
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="joined" className="mt-6">
              <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
                <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-6">Goals You Joined</h2>

                {joinedGoalsOnly.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-lg font-fredoka font-bold text-goal-heading mb-2">
                      No Joined Goals
                    </h3>
                    <p className="text-goal-text/70 mb-6">Join a friend's goal or discover public goals to save together!</p>
                    <Link to="/app/discover-circles">
                      <Button className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-semibold">
                        Discover Goals
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {joinedGoalsOnly.map((goal) => (
                      <VaultCard key={`joined-${goal.id}`} vault={goal} />
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <BottomNavigation />
      </div>
    </WalletGuard>
  );
};

export default AllGoals;
