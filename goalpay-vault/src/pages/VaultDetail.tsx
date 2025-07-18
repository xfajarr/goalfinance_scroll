import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { VaultStatusBadge } from '@/components/VaultStatusBadge';
import { AddFundsDialog } from '@/components/vault/AddFundsDialog';
import { ShareVaultDialog } from '@/components/vault/ShareVaultDialog';
import { useVaultData } from '@/hooks/useVaultData';
import { formatUnits } from 'viem';
import { ArrowLeft, Share2, Plus, Calendar, Users, Target, MessageCircle, Activity, Send } from 'lucide-react';

const VaultDetail = () => {
  const { id } = useParams();
  const [newMessage, setNewMessage] = useState('');

  // Parse vault ID from URL params
  const vaultId = id ? BigInt(id) : 0n;

  // Fetch real vault data using the hook
  const { vault, members, isLoading, error, refetch } = useVaultData(vaultId);

  // Fallback to mock data if real data is not available (for development)
  const mockVault = {
    id: 1,
    name: "Summer Vacation Fund 🏖️",
    goal: 5000,
    current: 3250,
    members: [
      { id: 1, name: "Alex", contributed: 850, avatar: "A" },
      { id: 2, name: "Sarah", contributed: 1200, avatar: "S" },
      { id: 3, name: "Mike", contributed: 650, avatar: "M" },
      { id: 4, name: "Emma", contributed: 550, avatar: "E" }
    ],
    daysLeft: 45,
    createdDate: "March 15, 2024",
    description: "Let's save together for our amazing summer vacation to Bali! 🌴",
    targetDate: "June 30, 2024",
    status: "active" as const,
    yieldRate: 8.5 // 8.5% APY
  };

  // Use real data if available, otherwise fallback to mock
  const displayVault = vault ? {
    id: Number(vault.id),
    name: vault.name,
    goal: Number(formatUnits(vault.goalAmount, 6)),
    current: Number(formatUnits(vault.currentAmount, 6)),
    members: members.map((member, index) => ({
      id: index + 1,
      name: `${member.member.slice(0, 6)}...${member.member.slice(-4)}`,
      contributed: Number(formatUnits(member.contribution, 6)),
      avatar: member.member.slice(2, 3).toUpperCase()
    })),
    daysLeft: Math.max(0, Math.floor((Number(vault.deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))),
    createdDate: new Date(Number(vault.createdAt) * 1000).toLocaleDateString(),
    description: vault.description,
    targetDate: new Date(Number(vault.deadline) * 1000).toLocaleDateString(),
    status: vault.status === 0 ? "active" as const : "completed" as const,
    yieldRate: Number(vault.yieldRate) / 100 // Convert basis points to percentage
  } : mockVault;

  // Mock activity data
  const activities = [
    { id: 1, user: "Sarah", action: "contributed", amount: 200, timestamp: "2 hours ago", avatar: "S" },
    { id: 2, user: "Mike", action: "joined", timestamp: "1 day ago", avatar: "M" },
    { id: 3, user: "Alex", action: "contributed", amount: 150, timestamp: "2 days ago", avatar: "A" },
    { id: 4, user: "Emma", action: "contributed", amount: 100, timestamp: "3 days ago", avatar: "E" },
    { id: 5, user: "Sarah", action: "created the vault", timestamp: "1 week ago", avatar: "S" }
  ];

  // Mock chat messages
  const [messages, setMessages] = useState([
    { id: 1, user: "Sarah", message: "So excited for this trip! 🎉", timestamp: "2 hours ago", avatar: "S" },
    { id: 2, user: "Mike", message: "Just added my contribution! We're getting closer!", timestamp: "1 day ago", avatar: "M" },
    { id: 3, user: "Alex", message: "Bali here we come! 🏝️", timestamp: "2 days ago", avatar: "A" },
    { id: 4, user: "Emma", message: "Can't wait to hit the beaches!", timestamp: "3 days ago", avatar: "E" }
  ]);

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
        <Navigation />
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
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 bg-white/60 backdrop-blur-sm border-goal-border/30 rounded-3xl text-center">
            <h2 className="text-xl font-fredoka font-bold text-goal-text mb-4">
              Failed to Load Vault
            </h2>
            <p className="font-inter text-goal-text/70 mb-6">
              {error.message}
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
      <Navigation />
      
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
                  <VaultStatusBadge status={displayVault.status} size="md" />
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
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-goal-accent/20 rounded-2xl">
                    <Avatar className="w-10 h-10 bg-goal-primary">
                      <AvatarFallback className="text-goal-text font-fredoka font-semibold">
                        {activity.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-inter text-goal-text">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                        {activity.amount && <span className="font-semibold"> ${activity.amount}</span>}
                      </p>
                      <p className="font-inter text-sm text-goal-text/60">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="chat" className="p-0">
              <div className="flex flex-col h-96">
                <div className="p-4 md:p-6 border-b border-goal-border/30">
                  <h2 className="text-xl md:text-2xl font-fredoka font-bold text-goal-text">
                    Group Chat
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8 bg-goal-primary">
                        <AvatarFallback className="text-goal-text font-fredoka font-semibold text-sm">
                          {message.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-inter font-semibold text-goal-text text-sm">{message.user}</span>
                          <span className="font-inter text-xs text-goal-text/60">{message.timestamp}</span>
                        </div>
                        <p className="font-inter text-goal-text/80 mt-1">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 md:p-6 border-t border-goal-border/30">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-white/50 border border-goal-border/50 rounded-2xl font-inter text-goal-text placeholder-goal-text/60 focus:outline-none focus:ring-2 focus:ring-goal-primary focus:border-transparent"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text rounded-2xl px-4 py-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
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

export default VaultDetail;
