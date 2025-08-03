import { useState, useMemo } from 'react';
import { useChainId, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { Link } from 'react-router-dom';

import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Trophy, TrendingDown, Calendar, Users, AlertTriangle, Loader2 } from 'lucide-react';

import { VaultCard } from '@/components/vault/vault-card';
import { SectionHeader } from '@/components/ui/section-header';
import { useUserVaults } from '@/hooks/useUserVaults';
import { useJoinedVaults } from '@/hooks/useJoinedVaults';
import { useFilteredVaultsByStatus } from '@/hooks/useVaultStatusChecker';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';

const GoalsHistory = () => {
  const chainId = useChainId();
  const { isConnected } = useAccount();

  // Check if current chain is supported
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const isChainSupported = !!contractAddresses?.GOAL_FINANCE;

  // Get user's goals from smart contract
  const { vaults: userVaults, isLoading: isLoadingVaults, error: vaultsError, refetch } = useUserVaults();

  // Get goals that user has joined
  const { vaults: joinedVaults, isLoading: isLoadingJoined, error: joinedError, refetch: refetchJoined } = useJoinedVaults();

  // Filter vaults by real-time status to ensure accurate categorization
  const userVaultsByStatus = useFilteredVaultsByStatus(userVaults || []);
  const joinedVaultsByStatus = useFilteredVaultsByStatus(joinedVaults || []);

  // Transform goals with real-time status
  const { completedGoals, failedGoals, cancelledGoals } = useMemo(() => {
    const transformGoal = (goal: any) => {
      const isNativeToken = goal.token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
      const decimals = isNativeToken ? 18 : 6;

      return {
        id: Number(goal.id),
        name: goal.name,
        goal: Number(formatUnits(goal.targetAmount || 0n, decimals)),
        current: Number(formatUnits(goal.totalDeposited || 0n, decimals)),
        members: Number(goal.memberCount || 0n),
        daysLeft: Math.max(0, Math.floor((Number(goal.deadline || 0n) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))),
        status: "completed", // Will be overridden based on the filtered category
        isCreator: userVaults?.some(v => v.id === goal.id) || false, // Check if user created this goal
        completedAt: new Date(Number(goal.deadline || 0n) * 1000),
        failedAt: new Date(Number(goal.deadline || 0n) * 1000),
      };
    };

    // Use real-time filtered vaults
    const completed = [...userVaultsByStatus.completedVaults, ...joinedVaultsByStatus.completedVaults]
      .map(goal => ({ ...transformGoal(goal), status: "completed" }));

    const failed = [...userVaultsByStatus.failedVaults, ...joinedVaultsByStatus.failedVaults]
      .map(goal => ({ ...transformGoal(goal), status: "failed" }));

    const cancelled = [...userVaultsByStatus.cancelledVaults, ...joinedVaultsByStatus.cancelledVaults]
      .map(goal => ({ ...transformGoal(goal), status: "cancelled" }));

    return {
      completedGoals: completed,
      failedGoals: failed,
      cancelledGoals: cancelled,
    };
  }, [userVaultsByStatus, joinedVaultsByStatus, userVaults]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCompleted = completedGoals.length;
    const totalFailed = failedGoals.length;
    const totalCancelled = cancelledGoals.length;
    
    const totalCompletedValue = completedGoals.reduce((sum, goal) => sum + goal.current, 0);
    const successRate = totalCompleted + totalFailed > 0 ? (totalCompleted / (totalCompleted + totalFailed)) * 100 : 0;

    return {
      totalCompleted,
      totalFailed,
      totalCancelled,
      totalCompletedValue,
      successRate: Math.round(successRate),
    };
  }, [completedGoals, failedGoals, cancelledGoals]);

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
            <p className="text-goal-text/70 mb-6">Please connect your wallet to view your goals history.</p>
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
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <main className="container-content py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/app/dashboard">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <SectionHeader
              title="Goals History"
              subtitle="Track your completed and failed goals"
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-fredoka font-bold text-goal-text">{stats.totalCompleted}</p>
                <p className="text-xs text-goal-text/70 font-inter">Completed</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-fredoka font-bold text-goal-text">{stats.totalFailed}</p>
                <p className="text-xs text-goal-text/70 font-inter">Failed</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-fredoka font-bold text-goal-text">{stats.successRate}%</p>
                <p className="text-xs text-goal-text/70 font-inter">Success Rate</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-goal-primary/20 rounded-lg">
                <Trophy className="w-5 h-5 text-goal-primary" />
              </div>
              <div>
                <p className="text-2xl font-fredoka font-bold text-goal-text">${stats.totalCompletedValue.toLocaleString()}</p>
                <p className="text-xs text-goal-text/70 font-inter">Total Saved</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Goals Tabs */}
        <Tabs defaultValue="completed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="completed" className="font-fredoka font-semibold">
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed ({stats.totalCompleted})
            </TabsTrigger>
            <TabsTrigger value="failed" className="font-fredoka font-semibold">
              <XCircle className="w-4 h-4 mr-2" />
              Failed ({stats.totalFailed})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="font-fredoka font-semibold">
              <Calendar className="w-4 h-4 mr-2" />
              Cancelled ({stats.totalCancelled})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="completed">
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
              <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-6">Completed Goals</h2>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-goal-primary mx-auto mb-4"></div>
                  <p className="text-goal-text/70">Loading completed goals...</p>
                </div>
              ) : hasError ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <p className="text-orange-600 font-medium mb-2">Error loading goals</p>
                  <Button onClick={handleRefresh} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              ) : completedGoals.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-goal-text/30 mx-auto mb-4" />
                  <h3 className="text-lg font-fredoka font-bold text-goal-text mb-2">No Completed Goals Yet</h3>
                  <p className="text-goal-text/70 mb-6">Complete your first goal to see it here!</p>
                  <Link to="/create">
                    <Button className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-semibold">
                      Create New Goal
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {completedGoals.map((goal) => (
                    <VaultCard key={goal.id} vault={goal} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="failed">
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
              <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-6">Failed Goals</h2>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-goal-primary mx-auto mb-4"></div>
                  <p className="text-goal-text/70">Loading failed goals...</p>
                </div>
              ) : hasError ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <p className="text-orange-600 font-medium mb-2">Error loading goals</p>
                  <Button onClick={handleRefresh} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              ) : failedGoals.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-goal-text/30 mx-auto mb-4" />
                  <h3 className="text-lg font-fredoka font-bold text-goal-text mb-2">No Failed Goals</h3>
                  <p className="text-goal-text/70 mb-6">Great job! You haven't failed any goals yet.</p>
                  <Link to="/app/dashboard">
                    <Button className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-semibold">
                      View Active Goals
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {failedGoals.map((goal) => (
                    <VaultCard key={goal.id} vault={goal} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="cancelled">
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
              <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-6">Cancelled Goals</h2>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-goal-primary mx-auto mb-4"></div>
                  <p className="text-goal-text/70">Loading cancelled goals...</p>
                </div>
              ) : hasError ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <p className="text-orange-600 font-medium mb-2">Error loading goals</p>
                  <Button onClick={handleRefresh} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              ) : cancelledGoals.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-goal-text/30 mx-auto mb-4" />
                  <h3 className="text-lg font-fredoka font-bold text-goal-text mb-2">No Cancelled Goals</h3>
                  <p className="text-goal-text/70 mb-6">You haven't cancelled any goals.</p>
                  <Link to="/app/dashboard">
                    <Button className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-semibold">
                      View Active Goals
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {cancelledGoals.map((goal) => (
                    <VaultCard key={goal.id} vault={goal} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default GoalsHistory;
