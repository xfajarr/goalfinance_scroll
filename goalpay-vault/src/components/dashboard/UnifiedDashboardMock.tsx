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
  Zap,
  Clock,
  DollarSign
} from 'lucide-react';
import { useAcornsMock, PortfolioType } from '@/hooks/useAcornsMock';
import { PurchaseTrackerMock } from './PurchaseTrackerMock';
import { AcornsSettingsMock } from './AcornsSettingsMock';
import { RoundableTransactions } from '@/components/acorns/RoundableTransactions';

// Mock goal savings data
const MOCK_GOALS = [
  {
    id: 1,
    name: 'Emergency Fund',
    description: 'Build a 6-month emergency fund',
    targetAmount: 10000,
    currentAmount: 3250,
    deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months
    members: 1,
  },
  {
    id: 2,
    name: 'Vacation to Japan',
    description: 'Family trip to Tokyo and Kyoto',
    targetAmount: 8000,
    currentAmount: 2100,
    deadline: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // 10 months
    members: 3,
  },
  {
    id: 3,
    name: 'New Car Down Payment',
    description: 'Save for Tesla Model 3 down payment',
    targetAmount: 15000,
    currentAmount: 7800,
    deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    members: 2,
  },
];

export const UnifiedDashboardMock = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPurchaseTracker, setShowPurchaseTracker] = useState(false);
  const [showAcornsSettings, setShowAcornsSettings] = useState(false);
  
  const { stats: acornsStats, userAccount, isLoading: acornsLoading, registerUser, investRoundUps } = useAcornsMock();

  // Calculate total savings across all goals
  const totalGoalSavings = MOCK_GOALS.reduce((total, goal) => total + goal.currentAmount, 0);

  // Calculate total portfolio value
  const totalPortfolioValue = (acornsStats?.portfolioValue || 0) + totalGoalSavings;

  const isAcornsRegistered = userAccount?.isRegistered;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fredoka font-bold text-goal-text-primary">
            Personal Finance Hub
          </h1>
          <p className="text-goal-text-secondary mt-1">
            Manage your savings goals and micro-investments in one place
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPurchaseTracker(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Track Purchase
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAcornsSettings(true)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Portfolio</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(totalPortfolioValue)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                +{formatCurrency((acornsStats?.currentYield || 0) * 30)} this month
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Goal Savings</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(totalGoalSavings)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {MOCK_GOALS.length} active goals
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Acorns Portfolio</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(acornsStats?.portfolioValue || 0)}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {acornsStats?.portfolioType || 'Not registered'}
              </p>
            </div>
            <PiggyBank className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Pending Round-ups</p>
              <p className="text-2xl font-bold text-orange-900">
                {formatCurrency(acornsStats?.pendingRoundUps || 0)}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Ready to invest
              </p>
            </div>
            <Coins className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Acorns Registration Prompt */}
      {!isAcornsRegistered && (
        <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">🌰 Enable Acorns Micro-Investing</h3>
              <p className="text-purple-100">
                Start investing your spare change automatically with every purchase
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => registerUser(PortfolioType.CONSERVATIVE)}
                className="bg-white text-purple-600 hover:bg-purple-50"
                disabled={acornsLoading}
              >
                Conservative (4%)
              </Button>
              <Button
                variant="secondary"
                onClick={() => registerUser(PortfolioType.MODERATE)}
                className="bg-white text-purple-600 hover:bg-purple-50"
                disabled={acornsLoading}
              >
                Moderate (6%)
              </Button>
              <Button
                variant="secondary"
                onClick={() => registerUser(PortfolioType.AGGRESSIVE)}
                className="bg-white text-purple-600 hover:bg-purple-50"
                disabled={acornsLoading}
              >
                Aggressive (8%)
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions for Acorns */}
      {isAcornsRegistered && acornsStats && acornsStats.pendingRoundUps > 0 && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  You have {formatCurrency(acornsStats.pendingRoundUps)} in round-ups ready to invest!
                </p>
                <p className="text-sm text-green-600">
                  Invest now to start earning {acornsStats.portfolioType.split('(')[1]?.replace(')', '')} returns
                </p>
              </div>
            </div>
            <Button 
              onClick={investRoundUps}
              disabled={acornsLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {acornsLoading ? 'Investing...' : 'Invest Now'}
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Savings Goals</TabsTrigger>
          <TabsTrigger value="acorns">Acorns Portfolio</TabsTrigger>
          <TabsTrigger value="transactions">Round-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Goals */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Goals</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-3">
                {MOCK_GOALS.slice(0, 3).map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{goal.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, progress)}%` }}
                          ></div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-3">
                        {Math.round(progress)}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Acorns Summary */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Acorns Summary</h3>
                <Badge variant="outline">{acornsStats?.portfolioType || 'Not Registered'}</Badge>
              </div>
              {isAcornsRegistered && acornsStats ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Invested</span>
                    <span className="font-medium">{formatCurrency(acornsStats.totalInvested)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Round-ups</span>
                    <span className="font-medium">{formatCurrency(acornsStats.totalRoundUps)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Yield</span>
                    <span className="font-medium text-green-600">+{formatCurrency(acornsStats.currentYield)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchases Tracked</span>
                    <span className="font-medium">{acornsStats.purchaseCount}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Portfolio Value</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(acornsStats.portfolioValue)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Enable Acorns to start micro-investing</p>
                  <Button onClick={() => registerUser(PortfolioType.MODERATE)} disabled={acornsLoading}>
                    {acornsLoading ? 'Setting up...' : 'Get Started'}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Performance Chart Placeholder */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
            <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Performance chart coming soon</p>
                <p className="text-sm text-gray-500">Track your portfolio growth over time</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Savings Goals</h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Goal
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_GOALS.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysLeft = Math.ceil((goal.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
              
              return (
                <Card key={goal.id} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{goal.name}</h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, progress)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span>{formatCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{daysLeft} days left</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{goal.members} members</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="acorns" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPurchaseTracker(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Purchase
              </Button>
              {acornsStats && acornsStats.pendingRoundUps > 0 && (
                <Button 
                  onClick={investRoundUps}
                  disabled={acornsLoading}
                  className="flex items-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Invest Round-ups ({formatCurrency(acornsStats.pendingRoundUps)})
                </Button>
              )}
            </div>
          </div>

          {isAcornsRegistered && acornsStats ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Portfolio Stats */}
              <Card className="lg:col-span-2 p-6">
                <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(acornsStats.portfolioValue)}</p>
                    <p className="text-sm text-gray-600">Total Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(acornsStats.totalInvested)}</p>
                    <p className="text-sm text-gray-600">Invested</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(acornsStats.totalRoundUps)}</p>
                    <p className="text-sm text-gray-600">Round-ups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">+{formatCurrency(acornsStats.currentYield)}</p>
                    <p className="text-sm text-gray-600">Yield</p>
                  </div>
                </div>

                {/* Performance Chart Placeholder */}
                <div className="h-48 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Portfolio growth chart</p>
                    <p className="text-sm text-gray-500">Coming soon</p>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={investRoundUps}
                    disabled={acornsStats.pendingRoundUps === 0 || acornsLoading}
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Invest Round-ups ({formatCurrency(acornsStats.pendingRoundUps)})
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Claim Yield ({formatCurrency(acornsStats.currentYield)})
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowAcornsSettings(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Portfolio Settings
                  </Button>
                </div>

                {/* Recurring Investment Status */}
                {acornsStats.recurringEnabled && (
                  <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Recurring Active</span>
                    </div>
                    <p className="text-sm text-green-700">
                      {formatCurrency(acornsStats.recurringAmount)} every {userAccount?.recurringInterval} days
                    </p>
                  </div>
                )}
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
                <Button 
                  onClick={() => registerUser(PortfolioType.CONSERVATIVE)}
                  disabled={acornsLoading}
                  variant="outline"
                >
                  Conservative (4% APY)
                </Button>
                <Button 
                  onClick={() => registerUser(PortfolioType.MODERATE)}
                  disabled={acornsLoading}
                >
                  Moderate (6% APY)
                </Button>
                <Button 
                  onClick={() => registerUser(PortfolioType.AGGRESSIVE)}
                  disabled={acornsLoading}
                  variant="outline"
                >
                  Aggressive (8% APY)
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Transaction Round-ups</h2>
              <p className="text-gray-600">Automatically detected transactions that can be rounded up</p>
            </div>
          </div>

          <RoundableTransactions />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showPurchaseTracker && (
        <PurchaseTrackerMock onClose={() => setShowPurchaseTracker(false)} />
      )}
      
      {showAcornsSettings && (
        <AcornsSettingsMock onClose={() => setShowAcornsSettings(false)} />
      )}
    </div>
  );
};
