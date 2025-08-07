import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Target,
  PiggyBank,
  Coins,
  Plus,
  ArrowUpRight,
  Settings,
  Zap
} from 'lucide-react';
import { useAcorns } from '@/hooks/useAcorns';
import { useMockMorpho } from '@/hooks/useMockMorpho';
import { useUserVaults } from '@/hooks/useUserVaults';
import { PortfolioType } from '@/config/contracts';
import { PurchaseTracker } from './PurchaseTracker';
import { AcornsSettings } from './AcornsSettings';

// Import layout components
import { Container } from '@/components/layout-components';
import BottomNavigation from '@/components/BottomNavigation';

export const UnifiedDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPurchaseTracker, setShowPurchaseTracker] = useState(false);
  const [showAcornsSettings, setShowAcornsSettings] = useState(false);
  
  const { stats: acornsStats, userAccount, isLoading: acornsLoading, registerUser } = useAcorns();
  const { yieldInfo, userPosition, isLoading: morphoLoading } = useMockMorpho();
  const { vaults, isLoading: vaultsLoading } = useUserVaults();

  // Calculate total savings across all goals
  const totalGoalSavings = vaults?.reduce((total, vault) => {
    return total + parseFloat(vault.totalDeposited.toString()) / 1e6;
  }, 0) || 0;

  // Calculate total portfolio value
  const totalPortfolioValue = (acornsStats?.portfolioValue || 0) + totalGoalSavings;

  const isAcornsRegistered = userAccount?.isRegistered;

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      {/* Header Section */}
      <Container size="xl" className="pt-10 pb-6 lg:pt-16 lg:pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-goal-heading text-3xl lg:text-4xl font-fredoka font-bold">
              🌰 Personal Finance Hub
            </h1>
            <p className="text-goal-text-secondary text-base lg:text-lg font-inter mt-2">
              Manage your savings goals and micro-investments in one place
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPurchaseTracker(true)}
              className="flex items-center gap-2 font-fredoka font-semibold"
            >
              <Plus className="w-4 h-4" />
              Track Purchase
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAcornsSettings(true)}
              className="flex items-center gap-2 font-fredoka font-semibold"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </Container>

      {/* Overview Cards */}
      <Container size="xl" className="space-y-6 lg:space-y-8 pb-8 lg:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
          <Card className="p-4 lg:p-6 bg-goal-primary/10 border-goal-border rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-fredoka font-medium text-goal-text-secondary">Total Portfolio</p>
                <p className="text-2xl lg:text-3xl font-fredoka font-bold text-goal-heading">
                  ${totalPortfolioValue.toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-goal-primary rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-goal-text" />
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-6 bg-goal-secondary/20 border-goal-border rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-fredoka font-medium text-goal-text-secondary">Goal Savings</p>
                <p className="text-2xl lg:text-3xl font-fredoka font-bold text-goal-heading">
                  ${totalGoalSavings.toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-goal-secondary rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 lg:w-6 lg:h-6 text-goal-text" />
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-6 bg-purple-100/50 border-goal-border rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-fredoka font-medium text-goal-text-secondary">Acorns Portfolio</p>
                <p className="text-2xl lg:text-3xl font-fredoka font-bold text-goal-heading">
                  ${(acornsStats?.portfolioValue || 0).toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-6 bg-orange-100/50 border-goal-border rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-fredoka font-medium text-goal-text-secondary">Pending Round-ups</p>
                <p className="text-2xl lg:text-3xl font-fredoka font-bold text-goal-heading">
                  ${(acornsStats?.pendingRoundUps || 0).toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Acorns Registration Prompt */}
        {!isAcornsRegistered && (
          <Card className="p-6 lg:p-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl border-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-xl lg:text-2xl font-fredoka font-bold mb-2">🌰 Enable Acorns Micro-Investing</h3>
                <p className="text-purple-100 font-inter">
                  Start investing your spare change automatically with every purchase
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => registerUser(PortfolioType.CONSERVATIVE)}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-fredoka font-semibold"
                >
                  Conservative
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => registerUser(PortfolioType.MODERATE)}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-fredoka font-semibold"
                >
                  Moderate
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => registerUser(PortfolioType.AGGRESSIVE)}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-fredoka font-semibold"
                >
                  Aggressive
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-goal-accent/50 rounded-2xl p-1">
            <TabsTrigger
              value="overview"
              className="font-fredoka font-semibold data-[state=active]:bg-goal-primary data-[state=active]:text-goal-text rounded-xl"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="font-fredoka font-semibold data-[state=active]:bg-goal-primary data-[state=active]:text-goal-text rounded-xl"
            >
              Savings Goals
            </TabsTrigger>
            <TabsTrigger
              value="acorns"
              className="font-fredoka font-semibold data-[state=active]:bg-goal-primary data-[state=active]:text-goal-text rounded-xl"
            >
              Acorns Portfolio
            </TabsTrigger>
          </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Goals */}
            <Card className="p-6 bg-goal-accent/30 border-goal-border rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-fredoka font-bold text-goal-heading">Recent Goals</h3>
                <Button variant="ghost" size="sm" className="font-fredoka font-semibold text-goal-text-secondary hover:text-goal-text">
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {vaults && vaults.length > 0 ? (
                  vaults.slice(0, 3).map((vault) => (
                    <div key={vault.id.toString()} className="flex items-center justify-between p-3 bg-goal-primary/10 rounded-xl border border-goal-border/50">
                      <div>
                        <p className="font-fredoka font-semibold text-goal-text">{vault.name || 'Unnamed Goal'}</p>
                        <p className="text-sm font-inter text-goal-text-secondary">
                          ${parseFloat(vault.totalDeposited?.toString() || '0') / 1e6} / ${parseFloat(vault.targetAmount?.toString() || '0') / 1e6}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-goal-secondary text-goal-text font-fredoka font-semibold">
                        {vault.targetAmount && vault.targetAmount > 0
                          ? Math.round((parseFloat(vault.totalDeposited?.toString() || '0') / parseFloat(vault.targetAmount.toString())) * 100)
                          : 0}%
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No goals created yet</p>
                )}
              </div>
            </Card>

            {/* Acorns Summary */}
            <Card className="p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-goal-border rounded-2xl">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="text-lg lg:text-xl font-fredoka font-bold text-goal-heading">Acorns Summary</h3>
                <Badge
                  variant="outline"
                  className="bg-white/80 border-goal-border text-goal-text-secondary font-fredoka"
                >
                  {acornsStats?.portfolioType || 'Not Registered'}
                </Badge>
              </div>
              {isAcornsRegistered ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm lg:text-base font-fredoka font-medium text-goal-text-secondary">Total Invested</span>
                    <span className="text-lg lg:text-xl font-fredoka font-bold text-goal-heading">${(acornsStats?.totalInvested || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm lg:text-base font-fredoka font-medium text-goal-text-secondary">Round-ups</span>
                    <span className="text-lg lg:text-xl font-fredoka font-bold text-goal-heading">${(acornsStats?.totalRoundUps || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm lg:text-base font-fredoka font-medium text-goal-text-secondary">Current Yield</span>
                    <span className="text-lg lg:text-xl font-fredoka font-bold text-green-600">+${(acornsStats?.currentYield || 0).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm lg:text-base font-fredoka font-medium text-goal-text-secondary">Purchases Tracked</span>
                    <span className="text-lg lg:text-xl font-fredoka font-bold text-goal-heading">{acornsStats?.purchaseCount || 0}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-10 h-10 lg:w-12 lg:h-12 text-goal-text-secondary mx-auto mb-3" />
                  <p className="text-goal-text-secondary font-fredoka mb-4">Enable Acorns to start micro-investing</p>
                  <Button
                    onClick={() => registerUser(PortfolioType.MODERATE)}
                    className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-medium rounded-xl px-6 py-2"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl lg:text-3xl font-fredoka font-bold text-goal-heading">Savings Goals</h2>
            <Button className="flex items-center gap-2 bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-medium rounded-xl px-4 py-2">
              <Plus className="w-4 h-4" />
              Create New Goal
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults && vaults.length > 0 ? (
              vaults.map((vault) => {
                const totalDeposited = parseFloat(vault.totalDeposited?.toString() || '0') / 1e6;
                const targetAmount = parseFloat(vault.targetAmount?.toString() || '0') / 1e6;
                const progress = targetAmount > 0 ? (totalDeposited / targetAmount) * 100 : 0;

                return (
                  <Card key={vault.id.toString()} className="p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-goal-border rounded-2xl">
                    <div className="space-y-4 lg:space-y-6">
                      <div>
                        <h3 className="font-fredoka font-bold text-lg lg:text-xl text-goal-heading">{vault.name || 'Unnamed Goal'}</h3>
                        <p className="text-sm lg:text-base font-fredoka font-medium text-goal-text-secondary mt-1">{vault.description || 'Build a 6-month emergency fund'}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm lg:text-base font-fredoka font-medium text-goal-text-secondary">Progress</span>
                          <span className="text-sm lg:text-base font-fredoka font-bold text-goal-heading">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                          <div
                            className="bg-gradient-to-r from-goal-primary to-goal-secondary h-2 lg:h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, progress)}%`
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-sm lg:text-base font-fredoka font-medium text-goal-text-secondary">
                          <span>${totalDeposited.toFixed(2)}</span>
                          <span>${targetAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full bg-white/80 border-goal-border hover:bg-white/90 font-fredoka font-medium rounded-xl py-2 lg:py-3"
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <Target className="w-12 h-12 lg:w-16 lg:h-16 text-goal-text-secondary mx-auto mb-4" />
                <p className="text-goal-text-secondary font-fredoka font-medium mb-4 lg:mb-6">No goals created yet</p>
                <Button
                  variant="outline"
                  className="bg-white border-goal-border hover:bg-gray-50 font-fredoka font-medium rounded-xl px-6 py-2"
                >
                  Create Your First Goal
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="acorns" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl lg:text-3xl font-fredoka font-bold text-goal-heading">Acorns Portfolio</h2>
            <div className="flex gap-2 lg:gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPurchaseTracker(true)}
                className="flex items-center gap-2 bg-white border-goal-border hover:bg-gray-50 font-fredoka font-medium rounded-xl px-4 py-2"
              >
                <Plus className="w-4 h-4" />
                Add Purchase
              </Button>
              <Button className="flex items-center gap-2 bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-medium rounded-xl px-4 py-2">
                <ArrowUpRight className="w-4 h-4" />
                Invest Round-ups
              </Button>
            </div>
          </div>

          {isAcornsRegistered ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Portfolio Stats */}
              <Card className="lg:col-span-2 p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-goal-border rounded-2xl">
                <h3 className="text-lg lg:text-xl font-fredoka font-bold text-goal-heading mb-4 lg:mb-6">Portfolio Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                  <div className="text-center">
                    <p className="text-xl lg:text-2xl font-fredoka font-bold text-blue-600">${(acornsStats?.portfolioValue || 0).toFixed(2)}</p>
                    <p className="text-xs lg:text-sm font-fredoka font-medium text-goal-text-secondary">Total Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl lg:text-2xl font-fredoka font-bold text-green-600">${(acornsStats?.totalInvested || 0).toFixed(2)}</p>
                    <p className="text-xs lg:text-sm font-fredoka font-medium text-goal-text-secondary">Invested</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl lg:text-2xl font-fredoka font-bold text-purple-600">${(acornsStats?.totalRoundUps || 0).toFixed(2)}</p>
                    <p className="text-xs lg:text-sm font-fredoka font-medium text-goal-text-secondary">Round-ups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl lg:text-2xl font-fredoka font-bold text-orange-600">+${(acornsStats?.currentYield || 0).toFixed(4)}</p>
                    <p className="text-xs lg:text-sm font-fredoka font-medium text-goal-text-secondary">Yield</p>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-4 lg:p-6 bg-gradient-to-br from-green-50 to-teal-50 border-goal-border rounded-2xl">
                <h3 className="text-lg lg:text-xl font-fredoka font-bold text-goal-heading mb-4 lg:mb-6">Quick Actions</h3>
                <div className="space-y-3 lg:space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/80 border-goal-border hover:bg-white/90 font-fredoka font-medium rounded-xl"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Invest Round-ups (${(acornsStats?.pendingRoundUps || 0).toFixed(2)})
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/80 border-goal-border hover:bg-white/90 font-fredoka font-medium rounded-xl"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Claim Yield (${(acornsStats?.currentYield || 0).toFixed(4)})
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/80 border-goal-border hover:bg-white/90 font-fredoka font-medium rounded-xl"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Change Portfolio
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <PiggyBank className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start Your Acorns Journey</h3>
              <p className="text-gray-600 mb-6">
                Invest your spare change automatically and watch your money grow
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => registerUser(PortfolioType.CONSERVATIVE)}>
                  Conservative (4% APY)
                </Button>
                <Button onClick={() => registerUser(PortfolioType.MODERATE)}>
                  Moderate (6% APY)
                </Button>
                <Button onClick={() => registerUser(PortfolioType.AGGRESSIVE)}>
                  Aggressive (8% APY)
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
        </Tabs>
      </Container>

      <BottomNavigation />

      {/* Modals */}
      {showPurchaseTracker && (
        <PurchaseTracker onClose={() => setShowPurchaseTracker(false)} />
      )}

      {showAcornsSettings && (
        <AcornsSettings onClose={() => setShowAcornsSettings(false)} />
      )}
    </div>
  );
};
