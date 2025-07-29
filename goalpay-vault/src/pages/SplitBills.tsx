import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogDescription,
  MobileDialogHeader,
  MobileDialogTitle,
  MobileDialogTrigger,
} from '@/components/ui/mobile-dialog';
import {
  Receipt,
  Plus,
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { BillCreationForm } from '@/components/bills/BillCreationForm';
import { FriendsManager } from '@/components/friends/FriendsManager';
import { useUserBills } from '@/hooks/useBillSplitter';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { SectionHeader } from '@/components/ui/section-header';
import BottomNavigation from '@/components/BottomNavigation';

export default function SplitBills() {
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [activeTab, setActiveTab] = useState('bills');
  const { isConnected } = useWalletGuard();
  const { billIds, isLoading } = useUserBills();

  const handleBillCreated = (billId: bigint) => {
    setShowCreateBill(false);
    // TODO: Refresh bills list or show success message
  };

  const stats = [
    {
      label: 'Active Bills',
      value: billIds.length,
      icon: Receipt,
      iconBgColor: 'bg-goal-primary',
    },
    {
      label: 'Total Owed',
      value: '$0.00', // TODO: Calculate from actual data
      icon: ArrowUpRight,
      iconBgColor: 'bg-red-100',
    },
    {
      label: 'Total Owing',
      value: '$0.00', // TODO: Calculate from actual data
      icon: ArrowDownLeft,
      iconBgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <main className="container-content py-8">
        {/* Welcome Section */}
        <SectionHeader
          title="Split Bills & Expenses"
          subtitle="Share costs with friends easily and transparently"
          className="mb-8"
        />

        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="2xl:col-span-3 space-y-6 lg:space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <h2 className="text-2xl font-fredoka font-bold text-goal-text">Bills & Friends</h2>
                  <p className="text-sm text-goal-text/70 font-inter">Manage your shared expenses</p>
                </div>
                <MobileDialog open={showCreateBill} onOpenChange={setShowCreateBill}>
                  <MobileDialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-full transition-all duration-300 hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Bill
                    </Button>
                  </MobileDialogTrigger>
                  <MobileDialogContent className="bg-white/95 backdrop-blur-sm border-goal-border/30">
                    <MobileDialogHeader>
                      <MobileDialogTitle className="font-fredoka font-bold text-goal-text">Create New Bill</MobileDialogTitle>
                      <MobileDialogDescription className="text-goal-text/70">
                        Split expenses with friends easily and transparently
                      </MobileDialogDescription>
                    </MobileDialogHeader>
                    <BillCreationForm
                      onSuccess={handleBillCreated}
                      onCancel={() => setShowCreateBill(false)}
                    />
                  </MobileDialogContent>
                </MobileDialog>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-goal-accent/50 border-goal-border/30">
                  <TabsTrigger
                    value="bills"
                    className="flex items-center gap-2 font-fredoka font-medium data-[state=active]:bg-goal-primary data-[state=active]:text-goal-text"
                  >
                    <Receipt className="w-4 h-4" />
                    Bills
                  </TabsTrigger>
                  <TabsTrigger
                    value="friends"
                    className="flex items-center gap-2 font-fredoka font-medium data-[state=active]:bg-goal-primary data-[state=active]:text-goal-text"
                  >
                    <Users className="w-4 h-4" />
                    Friends
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bills" className="mt-6">
                  <BillsTab billIds={billIds} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="friends" className="mt-6">
                  <FriendsManager />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="2xl:col-span-1 space-y-6">
            {/* Quick Actions or Additional Info */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
              <h3 className="font-fredoka font-bold text-goal-text mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka"
                  onClick={() => setShowCreateBill(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Bill
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka"
                  onClick={() => setActiveTab('friends')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Friends
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

// Bills Tab Component
interface BillsTabProps {
  billIds: bigint[];
  isLoading: boolean;
}

function BillsTab({ billIds, isLoading }: BillsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/40 backdrop-blur-sm border-goal-border/20 p-6 rounded-2xl animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-goal-accent rounded w-48"></div>
                <div className="h-3 bg-goal-accent rounded w-32"></div>
              </div>
              <div className="h-8 bg-goal-accent rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (billIds.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-goal-accent rounded-full flex items-center justify-center mx-auto">
            <Receipt className="w-8 h-8 text-goal-text-secondary" />
          </div>
          <div>
            <h3 className="font-fredoka font-bold text-goal-text mb-2">
              No bills yet
            </h3>
            <p className="text-goal-text/70 font-inter mb-6">
              Create your first bill to start splitting expenses with friends.
            </p>
            <MobileDialog>
              <MobileDialogTrigger asChild>
                <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-full transition-all duration-300 hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Bill
                </Button>
              </MobileDialogTrigger>
              <MobileDialogContent className="bg-white/95 backdrop-blur-sm border-goal-border/30">
                <MobileDialogHeader>
                  <MobileDialogTitle className="font-fredoka font-bold text-goal-text">Create New Bill</MobileDialogTitle>
                  <MobileDialogDescription className="text-goal-text/70">
                    Split expenses with friends easily and transparently
                  </MobileDialogDescription>
                </MobileDialogHeader>
                <BillCreationForm />
              </MobileDialogContent>
            </MobileDialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goal-text-secondary" />
          <input
            type="text"
            placeholder="Search bills..."
            className="w-full pl-10 pr-4 py-2 bg-white/60 border border-goal-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text placeholder:text-goal-text/50"
          />
        </div>
        <Button
          variant="outline"
          className="gap-2 border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka font-medium rounded-xl"
        >
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {billIds.map((billId) => (
          <BillCard key={billId.toString()} billId={billId} />
        ))}
      </div>
    </div>
  );
}

// Individual Bill Card Component
interface BillCardProps {
  billId: bigint;
}

function BillCard({ billId }: BillCardProps) {
  // TODO: Fetch actual bill data using useBillData hook
  const mockBill = {
    title: `Bill #${billId.toString()}`,
    description: 'Sample bill description',
    totalAmount: '100.00',
    currency: 'USDC',
    participantCount: 3,
    settledCount: 1,
    status: 'active',
    category: 'food',
    createdAt: new Date(),
  };

  const getStatusBadge = () => {
    switch (mockBill.status) {
      case 'active':
        return (
          <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3" />
            Active
          </Badge>
        );
      case 'settled':
        return (
          <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3" />
            Settled
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryEmoji = (category: string) => {
    const categories: Record<string, string> = {
      food: '🍽️',
      travel: '✈️',
      utilities: '⚡',
      entertainment: '🎬',
      shopping: '🛍️',
      transport: '🚗',
      health: '🏥',
      education: '📚',
      other: '📦',
    };
    return categories[category] || '📦';
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-white/70">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-goal-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{getCategoryEmoji(mockBill.category)}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-fredoka font-semibold text-goal-text truncate">{mockBill.title}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-goal-text/70 font-inter truncate mb-2">
              {mockBill.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-goal-text/60 font-inter">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {mockBill.totalAmount} {mockBill.currency}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {mockBill.participantCount} people
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {mockBill.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-lg font-fredoka font-bold text-goal-text-primary">
              ${(Number(mockBill.totalAmount) / mockBill.participantCount).toFixed(2)}
            </p>
            <p className="text-xs text-goal-text/60 font-inter">Your share</p>
          </div>
          <div className="text-xs text-goal-text/60 font-inter">
            {mockBill.settledCount}/{mockBill.participantCount} settled
          </div>
        </div>
      </div>
    </Card>
  );
}
