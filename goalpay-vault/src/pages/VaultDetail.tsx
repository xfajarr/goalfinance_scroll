import { useParams, Link } from 'react-router-dom';
import { useState, Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import BottomNavigation from '@/components/BottomNavigation';
import { VaultStatusBadge } from '@/components/VaultStatusBadge';
import { AddFundsDialog } from '@/components/vault/AddFundsDialog';
import { ShareVaultDialog } from '@/components/vault/ShareVaultDialog';
import { WithdrawDialog } from '@/components/vault/WithdrawDialog';
import { useVaultData } from '@/hooks/useVaultData';
import { useCheckVaultStatus } from '@/hooks/useVaultReads';
import { formatUnits } from 'viem';
import { ArrowLeft, Share2, Plus, Calendar, Users, Target, MessageCircle, Activity, Send, AlertCircle, ArrowDownToLine, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class VaultErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('VaultDetail error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="p-8 bg-white/60 backdrop-blur-sm border-goal-border/30 rounded-3xl text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-fredoka font-bold text-goal-text mb-4">
                Something went wrong
              </h2>
              <p className="font-inter text-goal-text/70 mb-6">
                We're sorry, but there was an error loading this vault.
                Please try refreshing the page.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold rounded-full px-6 py-3"
              >
                Refresh Page
              </Button>
            </Card>
          </main>
          <BottomNavigation />
        </div>
      );
    }

    return this.props.children;
  }
}

const VaultDetailContent = () => {
  const { id } = useParams();
  if (!id) {
    throw new Error('No vault ID provided');
  }

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, user: "Sarah", message: "So excited for this trip! 🎉", timestamp: "2 hours ago", avatar: "S" },
    { id: 2, user: "Mike", message: "Just added my contribution! We're getting closer!", timestamp: "1 day ago", avatar: "M" },
    { id: 3, user: "Alex", message: "Bali here we come! 🏝️", timestamp: "2 days ago", avatar: "A" },
    { id: 4, user: "Emma", message: "Can't wait to hit the beaches!", timestamp: "3 days ago", avatar: "E" }
  ]);

  // Parse vault ID from URL params
  const vaultId = id ? BigInt(id) : 0n;

  // Fetch vault data using the hook
  const { vault, members, isLoading, error, refetch } = useVaultData(vaultId);

  // Get real-time vault status using checkVaultStatus function
  const {
    data: realTimeStatus,
    isLoading: isLoadingStatus,
    error: statusError
  } = useCheckVaultStatus(vaultId > 0n ? vaultId : undefined);

  // Handle vault loading errors gracefully
  if (error) {
    console.error('Vault loading error:', error.message);
  }

  // Debug logging for status checking
  if (statusError) {
    console.error('Status check error:', statusError.message);
  }

  // No old contract fallbacks - using new GoalFinance contract only

  const safeVault = vault ?? {
    id: vaultId,
    name: "Loading...",
    description: "Loading vault details...",
    creator: "0x0000000000000000000000000000000000000000",
    token: "0x0000000000000000000000000000000000000000",
    goalType: 0,
    visibility: 0,
    targetAmount: 0n,
    totalDeposited: 0n,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400), // 24 hours from now
    memberCount: 0n,
    status: 0,
    inviteCode: "0x0000000000000000000000000000000000000000000000000000000000000000",
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
  };

  const safeMembers = members ?? [];

  // Cast to proper vault type
  const vaultData = safeVault as any;
  const isNativeToken = vaultData.config?.token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const decimals = isNativeToken ? 18 : 6;

  // Helper function to map contract status to display status
  const getDisplayStatus = (): 'active' | 'completed' | 'failed' | 'pending' => {
    // Use real-time status if available, otherwise fall back to stored status
    const currentStatus = realTimeStatus !== undefined ? realTimeStatus : safeVault.status;

    console.log('🔍 Status mapping:', {
      realTimeStatus,
      storedStatus: safeVault.status,
      currentStatus,
      vaultId: Number(vaultData.id)
    });

    // Map contract status enum to display status
    // Contract: 0 = ACTIVE, 1 = SUCCESS, 2 = FAILED
    switch (currentStatus) {
      case 0:
        return 'active';
      case 1:
        return 'completed';
      case 2:
        return 'failed';
      default:
        return 'pending';
    }
  };

  const displayVault = {
    id: Number(vaultData.id),
    name: vaultData.config?.name || 'Unknown Vault',
    description: vaultData.config?.description || 'No description',
    goal: Number(formatUnits(vaultData.config?.targetAmount || 0n, decimals)),
    current: Number(formatUnits(vaultData.totalDeposited || 0n, decimals)),
    members: safeMembers.map((memberAddress, index) => ({
      id: index + 1,
      name: `${memberAddress.slice(0, 6)}...${memberAddress.slice(-4)}`,
      contributed: 0, // We'd need to fetch individual member data for this
      avatar: memberAddress.slice(2, 3).toUpperCase()
    })),
    daysLeft: Math.max(0, Math.floor((Number(vaultData.config?.deadline || 0n) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))),
    createdDate: new Date(Number(safeVault.createdAt || 0n) * 1000).toLocaleDateString(),
    targetDate: new Date(Number(vaultData.config?.deadline || 0n) * 1000).toLocaleDateString(),
    status: getDisplayStatus(),
    yieldRate: 0 // No yield rate in new contract structure
  };

  // Activity data based on members
  const activities = safeMembers.map((memberAddress, index) => ({
    id: index + 1,
    user: `${memberAddress.slice(0, 6)}...${memberAddress.slice(-4)}`,
    action: "contributed",
    amount: 0, // We'd need to fetch individual member data for this
    timestamp: 'Recently',
    avatar: memberAddress.slice(2, 3).toUpperCase()
  }));

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-goal-primary/30 border-t-goal-primary rounded-full animate-spin" />
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 bg-white/60 backdrop-blur-sm border-goal-border/30 rounded-3xl text-center">
            <h2 className="text-xl font-fredoka font-bold text-goal-text mb-4">
              Vault Not Found
            </h2>
            <p className="font-inter text-goal-text/70 mb-6">
              This vault may have been created with an older contract version or doesn't exist.
              Please create a new vault or check the vault ID.
            </p>
            <Button onClick={refetch} className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold rounded-full px-6 py-3">
              Try Again
            </Button>
          </Card>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        user: "You",
        message: newMessage,
        timestamp: "Just now",
        avatar: "Y"
      };
      setMessages([newMsg, ...messages]);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-6xl">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-goal-text/70 hover:text-goal-text transition-colors mb-6 md:mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-inter font-medium text-sm md:text-base">Back to Dashboard</span>
        </Link>



        {/* Vault Header */}
        <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 rounded-3xl p-6 md:p-8 mb-6 md:mb-8">
          <div className="space-y-6">
            {/* Title and Status */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-fredoka font-bold text-goal-text">
                    {displayVault.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <VaultStatusBadge status={displayVault.status} size="md" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        refetch();
                        console.log('🔄 Refreshing vault status...');
                      }}
                      className="h-8 w-8 p-0 text-goal-text/60 hover:text-goal-text hover:bg-goal-accent/20"
                      title="Refresh vault status"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                <p className="font-inter text-goal-text/80 text-base md:text-lg leading-relaxed">
                  {displayVault.description}
                </p>
              </div>

            </div>

            {/* Progress Section */}
            <div className="bg-goal-accent/30 rounded-2xl p-4 md:p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-inter text-2xl md:text-3xl font-bold text-goal-text">
                    ${displayVault.current.toLocaleString()}
                  </span>
                  <span className="font-inter text-goal-text/70 text-base md:text-lg font-medium">
                    of ${displayVault.goal.toLocaleString()}
                  </span>
                </div>

                <div className="w-full bg-goal-accent/50 rounded-full h-3 md:h-4">
                  <div
                    className="bg-gradient-to-r from-goal-primary to-goal-primary/80 h-3 md:h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(getProgressPercentage(displayVault.current, displayVault.goal), 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <p className="font-inter text-sm md:text-base text-goal-text/70 font-medium">
                    {Math.round(getProgressPercentage(displayVault.current, displayVault.goal))}% complete
                  </p>
                  <p className="font-inter text-sm md:text-base text-goal-text/70 font-medium">
                    ${(displayVault.goal - displayVault.current).toLocaleString()} to go
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:ml-6">
                <AddFundsDialog
                  vaultId={vaultId}
                  vaultName={displayVault.name}
                  currentAmount={displayVault.current}
                  goalAmount={displayVault.goal}
                  yieldRate={displayVault.yieldRate}
                >
                  <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 shadow-sm">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Funds
                  </Button>
                </AddFundsDialog>

                <WithdrawDialog
                  vaultId={vaultId}
                  vaultName={displayVault.name}
                >
                  <Button variant="outline" className="border-goal-border text-goal-text hover:bg-goal-accent rounded-full px-6 py-3 transition-all duration-300 hover:scale-105">
                    <ArrowDownToLine className="w-5 h-5 mr-2" />
                    Withdraw
                  </Button>
                </WithdrawDialog>

                <ShareVaultDialog
                  vaultId={vaultId}
                  vaultName={displayVault.name}
                  vaultDescription={displayVault.description}
                >
                  <Button variant="outline" className="border-goal-border text-goal-text hover:bg-goal-accent rounded-full px-6 py-3 transition-all duration-300 hover:scale-105">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                </ShareVaultDialog>
              </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-3 md:p-6 rounded-2xl md:rounded-3xl">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-goal-primary rounded-xl md:rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                <Calendar className="w-4 h-4 md:w-6 md:h-6 text-goal-text" />
              </div>
              <div className="text-center md:text-left">
                <p className="font-inter text-lg md:text-2xl font-bold text-goal-text">{displayVault.daysLeft}</p>
                <p className="font-inter text-xs md:text-sm text-goal-text font-medium">Days Left</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-3 md:p-6 rounded-2xl md:rounded-3xl">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-goal-accent rounded-xl md:rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                <Users className="w-4 h-4 md:w-6 md:h-6 text-goal-text" />
              </div>
              <div className="text-center md:text-left">
                <p className="font-inter text-lg md:text-2xl font-bold text-goal-text">{displayVault.members.length}</p>
                <p className="font-inter text-xs md:text-sm text-goal-text font-medium">Members</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-3 md:p-6 rounded-2xl md:rounded-3xl">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-goal-border rounded-xl md:rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                <Target className="w-4 h-4 md:w-6 md:h-6 text-goal-text" />
              </div>
              <div className="text-center md:text-left">
                <p className="font-inter text-base md:text-2xl font-bold text-goal-text">
                  ${(displayVault.goal - displayVault.current).toLocaleString()}
                </p>
                <p className="font-inter text-xs md:text-sm text-goal-text font-medium">To Goal</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs for Members, Activity, and Chat */}
        <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 rounded-3xl overflow-hidden">
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-goal-accent/30 rounded-none border-b border-goal-border/30 h-12 md:h-14">
              <TabsTrigger value="members" className="font-fredoka font-semibold data-[state=active]:bg-white/60 text-sm md:text-base py-3">
                <Users className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="hidden sm:inline">Members</span>
                <span className="sm:hidden">Members</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="font-fredoka font-semibold data-[state=active]:bg-white/60 text-sm md:text-base py-3">
                <Activity className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="hidden sm:inline">Activity</span>
                <span className="sm:hidden">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="font-fredoka font-semibold data-[state=active]:bg-white/60 text-sm md:text-base py-3">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="hidden sm:inline">Chat</span>
                <span className="sm:hidden">Chat</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="members" className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-fredoka font-bold text-goal-text mb-6">
                Vault Members
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
                {displayVault.members.map((member) => (
                  <Card key={member.id} className="bg-goal-accent/20 border-goal-border/20 p-4 md:p-5 rounded-2xl hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 md:w-14 md:h-14 bg-goal-primary">
                          <AvatarFallback className="text-goal-text font-fredoka font-semibold text-lg">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-inter font-semibold text-goal-text text-base md:text-lg">{member.name}</p>
                          <p className="font-inter text-sm md:text-base text-goal-text/70">Member</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-inter font-bold text-goal-text text-lg md:text-xl">${member.contributed.toLocaleString()}</p>
                        <p className="font-inter text-sm md:text-base text-goal-text/70">contributed</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-goal-border text-goal-text hover:bg-goal-accent rounded-full py-3 font-fredoka font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Invite Friends
              </Button>
            </TabsContent>
            
            <TabsContent value="activity" className="p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-fredoka font-bold text-goal-text mb-4 md:mb-6">
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-goal-accent/20 rounded-2xl">
                      <Avatar className="w-10 h-10 bg-goal-primary">
                        <AvatarFallback className="text-goal-text font-fredoka font-semibold">
                          {activity.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-inter text-goal-text">
                          <span className="font-semibold">{activity.user}</span> {activity.action}
                          {activity.amount && <span className="font-semibold"> ${activity.amount.toLocaleString()}</span>}
                        </p>
                        <p className="font-inter text-sm text-goal-text/60">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="font-inter text-goal-text/70">No activity to show yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="chat" className="p-0">
              <div className="flex flex-col h-96">
                <div className="p-4 md:p-6 border-b border-goal-border/30">
                  <h2 className="text-xl md:text-2xl font-fredoka font-bold text-goal-text">
                    Group Chat
                  </h2>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6">
                    <MessageCircle className="w-12 h-12 text-goal-text/30 mx-auto mb-4" />
                    <h3 className="font-fredoka font-bold text-goal-text mb-2">Chat Coming Soon</h3>
                    <p className="font-inter text-goal-text/70">
                      Chat functionality will be available in a future update.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

const VaultDetail = () => {
  return (
    <VaultErrorBoundary>
      <VaultDetailContent />
    </VaultErrorBoundary>
  );
};

export default VaultDetail;
