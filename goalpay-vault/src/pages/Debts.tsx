import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  History,
  Calculator,
} from 'lucide-react';
import { useDebtSummary, useUserDebts, useDebtRelationships, debtUtils } from '@/hooks/useDebtManager';
import { useFriendsData, useFriendDisplayName } from '@/hooks/useFriendsRegistry';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { SectionHeader } from '@/components/ui/section-header';
import { NATIVE_TOKEN } from '@/config/contracts';
import { Address } from 'viem';
import BottomNavigation from '@/components/BottomNavigation';

const SUPPORTED_TOKENS = [
  NATIVE_TOKEN,
  '0x77B2693ea846571259FA89CBe4DD8e18f3F61787', // USDC on Mantle Sepolia
];

export default function Debts() {
  const [activeTab, setActiveTab] = useState('overview');
  const { isConnected } = useWalletGuard();

  const { summary, isLoading: isSummaryLoading } = useDebtSummary(SUPPORTED_TOKENS);
  const { debtIds, isLoading: isDebtsLoading } = useUserDebts();
  const { friends } = useFriendsData();

  // Calculate totals across all tokens
  const totals = summary.reduce(
    (acc, tokenSummary) => {
      const totalOwed = Number(debtUtils.formatAmount(tokenSummary.totalOwed));
      const totalOwing = Number(debtUtils.formatAmount(tokenSummary.totalOwing));

      return {
        totalOwed: acc.totalOwed + totalOwed,
        totalOwing: acc.totalOwing + totalOwing,
        netBalance: acc.netBalance + (totalOwing - totalOwed),
      };
    },
    { totalOwed: 0, totalOwing: 0, netBalance: 0 }
  );

  const isNetCreditor = totals.netBalance > 0;
  const isNetDebtor = totals.netBalance < 0;

  const stats = [
    {
      label: 'You Owe',
      value: `$${totals.totalOwed.toFixed(2)}`,
      icon: ArrowUpRight,
      iconBgColor: 'bg-red-100',
    },
    {
      label: 'Owed to You',
      value: `$${totals.totalOwing.toFixed(2)}`,
      icon: ArrowDownLeft,
      iconBgColor: 'bg-green-100',
    },
    {
      label: `Net ${isNetCreditor ? 'Credit' : isNetDebtor ? 'Debt' : 'Balance'}`,
      value: `$${Math.abs(totals.netBalance).toFixed(2)}`,
      icon: isNetCreditor ? TrendingUp : isNetDebtor ? TrendingDown : Calculator,
      iconBgColor: isNetCreditor ? 'bg-green-100' : isNetDebtor ? 'bg-red-100' : 'bg-goal-accent',
    },
    {
      label: 'Active Debts',
      value: debtIds.length.toString(),
      icon: Users,
      iconBgColor: 'bg-goal-primary',
    },
  ];

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <main className="container-content py-8">
        {/* Welcome Section */}
        <SectionHeader
          title="Debts & Balances"
          subtitle="Track and settle your shared expenses"
          className="mb-8"
        />

        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="2xl:col-span-3 space-y-6 lg:space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-element rounded-2xl text-center hover:shadow-md transition-all duration-200">
                  <div className="space-tight">
                    <div className={`w-12 h-12 ${stat.iconBgColor} rounded-xl flex items-center justify-center mx-auto`}>
                      <stat.icon className="w-6 h-6 text-goal-text-secondary" />
                    </div>
                    <div className="space-xs">
                      <p className="font-fredoka font-bold text-xl md:text-2xl text-goal-text-primary">{stat.value}</p>
                      <p className="font-inter text-sm text-goal-text">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Main Content Tabs */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-fredoka font-bold text-goal-text">Debt Management</h2>
                  <p className="text-sm text-goal-text/70 font-inter">Track and settle your shared expenses</p>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-goal-accent/50 border-goal-border/30">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-2 font-fredoka font-medium data-[state=active]:bg-goal-primary data-[state=active]:text-goal-text"
                  >
                    <Calculator className="w-4 h-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="friends"
                    className="flex items-center gap-2 font-fredoka font-medium data-[state=active]:bg-goal-primary data-[state=active]:text-goal-text"
                  >
                    <Users className="w-4 h-4" />
                    Friends
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex items-center gap-2 font-fredoka font-medium data-[state=active]:bg-goal-primary data-[state=active]:text-goal-text"
                  >
                    <History className="w-4 h-4" />
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <DebtOverviewTab summary={summary} isLoading={isSummaryLoading} />
                </TabsContent>

                <TabsContent value="friends" className="mt-6">
                  <FriendsDebtsTab friends={friends} />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <DebtHistoryTab debtIds={debtIds} isLoading={isDebtsLoading} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="2xl:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
              <h3 className="font-fredoka font-bold text-goal-text mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka"
                  onClick={() => setActiveTab('friends')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Friends
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka"
                  onClick={() => setActiveTab('history')}
                >
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}

// Debt Overview Tab
interface DebtOverviewTabProps {
  summary: any[];
  isLoading: boolean;
}

function DebtOverviewTab({ summary, isLoading }: DebtOverviewTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-white/40 backdrop-blur-sm border-goal-border/20 p-6 rounded-2xl animate-pulse">
            <div className="space-y-4">
              <div className="h-4 bg-goal-accent rounded w-32"></div>
              <div className="h-8 bg-goal-accent rounded w-48"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (summary.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-goal-accent rounded-full flex items-center justify-center mx-auto">
            <Calculator className="w-8 h-8 text-goal-text-secondary" />
          </div>
          <div>
            <h3 className="font-fredoka font-bold text-goal-text mb-2">
              No debts yet
            </h3>
            <p className="text-goal-text/70 font-inter">
              Start splitting bills with friends to track shared expenses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-fredoka font-bold text-goal-text">
        Balance by Currency
      </h3>

      <div className="space-y-4">
        {summary.map((tokenSummary, index) => (
          <TokenSummaryCard key={index} summary={tokenSummary} />
        ))}
      </div>
    </div>
  );
}

// Token Summary Card
function TokenSummaryCard({ summary }: { summary: any }) {
  const totalOwed = Number(debtUtils.formatAmount(summary.totalOwed));
  const totalOwing = Number(debtUtils.formatAmount(summary.totalOwing));
  const netBalance = totalOwing - totalOwed;

  const isNetCreditor = netBalance > 0;
  const isNetDebtor = netBalance < 0;

  const tokenSymbol = summary.token === NATIVE_TOKEN ? 'ETH' : 'USDC';

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-fredoka font-semibold text-goal-text">{tokenSymbol}</h4>
        <Badge
          variant="secondary"
          className={`${
            isNetCreditor
              ? 'bg-green-100 text-green-800 border-green-200'
              : isNetDebtor
                ? 'bg-red-100 text-red-800 border-red-200'
                : 'bg-goal-accent text-goal-text border-goal-border/30'
          }`}
        >
          {isNetCreditor ? 'Net Credit' : isNetDebtor ? 'Net Debt' : 'Balanced'}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-goal-text/70 font-inter">You Owe</p>
          <p className="text-lg font-fredoka font-bold text-red-600">
            {totalOwed.toFixed(2)} {tokenSymbol}
          </p>
        </div>

        <div>
          <p className="text-sm text-goal-text/70 font-inter">Owed to You</p>
          <p className="text-lg font-fredoka font-bold text-green-600">
            {totalOwing.toFixed(2)} {tokenSymbol}
          </p>
        </div>

        <div>
          <p className="text-sm text-goal-text/70 font-inter">Net Balance</p>
          <p className={`text-lg font-fredoka font-bold ${
            isNetCreditor ? 'text-green-600' : isNetDebtor ? 'text-red-600' : 'text-goal-text-primary'
          }`}>
            {Math.abs(netBalance).toFixed(2)} {tokenSymbol}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Friends Debts Tab
interface FriendsDebtsTabProps {
  friends: any[];
}

function FriendsDebtsTab({ friends }: FriendsDebtsTabProps) {
  if (friends.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-goal-accent rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-goal-text-secondary" />
          </div>
          <div>
            <h3 className="font-fredoka font-bold text-goal-text mb-2">
              No friends added
            </h3>
            <p className="text-goal-text-secondary">
              Add friends to track debts and split bills together.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <FriendDebtCard key={friend.friendAddress} friend={friend} />
      ))}
    </div>
  );
}

// Friend Debt Card
function FriendDebtCard({ friend }: { friend: any }) {
  // TODO: Get actual debt data for this friend
  const mockDebt = {
    youOwe: 25.50,
    theyOwe: 15.00,
    currency: 'USDC',
  };

  const netBalance = mockDebt.theyOwe - mockDebt.youOwe;
  const isNetCreditor = netBalance > 0;
  const isNetDebtor = netBalance < 0;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-goal-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {friend.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-goal-text">{friend.displayName}</h4>
            <p className="text-xs text-goal-text-secondary font-mono">
              {friend.friendAddress.slice(0, 6)}...{friend.friendAddress.slice(-4)}
            </p>
          </div>
        </div>

        <div className="text-right">
          {netBalance === 0 ? (
            <Badge variant="secondary">Settled</Badge>
          ) : (
            <div>
              <p className={`font-bold ${
                isNetCreditor ? 'text-green-600' : 'text-red-600'
              }`}>
                {isNetCreditor ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}
              </p>
              <p className="text-xs text-goal-text-secondary">
                {isNetCreditor ? 'owes you' : 'you owe'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Debt History Tab
interface DebtHistoryTabProps {
  debtIds: bigint[];
  isLoading: boolean;
}

function DebtHistoryTab({ debtIds, isLoading }: DebtHistoryTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (debtIds.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-goal-accent rounded-full flex items-center justify-center mx-auto">
            <History className="w-8 h-8 text-goal-text-secondary" />
          </div>
          <div>
            <h3 className="font-fredoka font-bold text-goal-text mb-2">
              No debt history
            </h3>
            <p className="text-goal-text-secondary">
              Your debt transactions will appear here.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {debtIds.map((debtId) => (
        <DebtHistoryCard key={debtId.toString()} debtId={debtId} />
      ))}
    </div>
  );
}

// Debt History Card
function DebtHistoryCard({ debtId }: { debtId: bigint }) {
  // TODO: Fetch actual debt data
  const mockDebt = {
    description: `Debt #${debtId.toString()}`,
    amount: '25.50',
    currency: 'USDC',
    isSettled: Math.random() > 0.5,
    createdAt: new Date(),
    otherParty: 'Alice',
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            mockDebt.isSettled ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            {mockDebt.isSettled ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-600" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-goal-text">{mockDebt.description}</h4>
            <p className="text-sm text-goal-text-secondary">
              with {mockDebt.otherParty} • {mockDebt.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-bold text-goal-text">
            {mockDebt.amount} {mockDebt.currency}
          </p>
          <Badge variant={mockDebt.isSettled ? 'default' : 'secondary'}>
            {mockDebt.isSettled ? 'Settled' : 'Pending'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
