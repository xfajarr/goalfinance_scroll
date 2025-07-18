
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { ArrowLeft, Users, Target, Calendar, Plus, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWalletGuard } from '@/hooks/useWalletGuard';
import { WalletGuardDialog } from '@/components/WalletGuardDialog';
import confetti from 'canvas-confetti';

const JoinVault = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [contributionAmount, setContributionAmount] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const { toast } = useToast();

  // Wallet guard for protecting vault joining
  const { requireWalletConnection, showConnectDialog, setShowConnectDialog } = useWalletGuard();

  const inviteCode = searchParams.get('invite');
  
  // Mock vault data
  const vault = {
    id: 1,
    name: "Summer Vacation Fund 🏖️",
    description: "Let's save together for our amazing summer vacation to Bali! 🌴",
    goal: 5000,
    current: 2800,
    members: [
      { id: 1, name: "Sarah", contributed: 800, avatar: "S" },
      { id: 2, name: "Mike", contributed: 1200, avatar: "M" },
      { id: 3, name: "Emma", contributed: 800, avatar: "E" }
    ],
    daysLeft: 45,
    creator: "Sarah",
    isPublic: true,
    yieldRate: "8% APY"
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const handleJoinVault = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) return;

    // Use wallet guard to check connection and show dialog if needed
    requireWalletConnection(async () => {
      await performVaultJoin();
    });
  };

  const performVaultJoin = async () => {
    setIsJoining(true);
    try {
      // Mock joining vault - replace with actual Web3 logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Joining vault ${id} with ${contributionAmount} USD using invite code: ${inviteCode}`);

      toast({
        title: '🎉 Successfully Joined!',
        description: `You've joined "${vault.name}" with $${contributionAmount}!`,
        className: 'top-4 right-4 bg-goal-primary text-goal-text border-goal-primary shadow-lg',
      });

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']
      });

      setHasJoined(true);
    } catch (error) {
      console.error('Failed to join vault:', error);
      toast({
        title: '❌ Failed to Join',
        description: 'Please try again later.',
        variant: 'destructive',
        className: 'top-4 right-4 bg-red-500 text-white border-red-400 shadow-lg',
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Success state after joining
  if (hasJoined) {
    return (
      <div className="min-h-screen bg-goal-bg pb-20 md:pb-0">
        <Navigation />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl text-center">
            <div className="w-20 h-20 bg-goal-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-fredoka font-bold text-goal-text mb-4">
              🎉 Welcome to the Vault!
            </h1>

            <p className="font-inter text-goal-text/80 mb-6">
              You've successfully joined "{vault.name}" with ${contributionAmount}!
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.location.href = `/vault/${id}`}
                className="flex-1 bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-2xl px-6 py-3"
              >
                View Vault
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="flex-1 border-goal-border text-goal-text hover:bg-goal-accent rounded-2xl px-6 py-3"
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </main>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/community" 
          className="inline-flex items-center space-x-2 text-goal-text/70 hover:text-goal-text transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-inter font-medium">Back to Community</span>
        </Link>

        {/* Vault Info */}
        <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl mb-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-text mb-4">
              {vault.name}
            </h1>
            <p className="font-inter text-goal-text/80 mb-4">
              {vault.description}
            </p>

            {inviteCode && (
              <div className="bg-goal-accent/20 p-3 rounded-2xl mb-4">
                <p className="font-inter text-xs text-goal-text/70 mb-1">Invited via code:</p>
                <p className="font-mono text-sm font-bold text-goal-primary">{inviteCode}</p>
              </div>
            )}

            <div className="inline-flex items-center space-x-2 bg-goal-accent px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-goal-primary rounded-full"></span>
              <span className="font-inter text-sm text-goal-text font-medium">
                Yield Feature Coming Soon
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-inter text-xl font-bold text-goal-text">
                ${vault.current.toLocaleString()}
              </span>
              <span className="font-inter text-goal-text/80 font-medium">
                of ${vault.goal.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-goal-accent rounded-full h-3">
              <div
                className="bg-goal-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getProgressPercentage(vault.current, vault.goal), 100)}%` }}
              />
            </div>
            <p className="font-inter text-sm text-goal-text font-medium text-center">
              {Math.round(getProgressPercentage(vault.current, vault.goal))}% complete
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-goal-accent rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-goal-text" />
              </div>
              <p className="font-inter text-lg font-bold text-goal-text">{vault.members.length}</p>
              <p className="font-inter text-xs text-goal-text/70">Members</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-goal-primary rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-goal-text" />
              </div>
              <p className="font-inter text-lg font-bold text-goal-text">{vault.daysLeft}</p>
              <p className="font-inter text-xs text-goal-text/70">Days Left</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-goal-border rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-goal-text" />
              </div>
              <p className="font-inter text-lg font-bold text-goal-text">
                ${(vault.goal - vault.current).toLocaleString()}
              </p>
              <p className="font-inter text-xs text-goal-text/70">Needed</p>
            </div>
          </div>

          {/* Current Members */}
          <div className="mb-6">
            <h3 className="font-fredoka font-semibold text-goal-text mb-3">Current Members</h3>
            <div className="flex flex-wrap gap-2">
              {vault.members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2 bg-goal-accent/30 px-3 py-2 rounded-full">
                  <Avatar className="w-6 h-6 bg-goal-primary">
                    <AvatarFallback className="text-goal-text font-fredoka font-semibold text-xs">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-inter text-sm text-goal-text">{member.name}</span>
                  <span className="font-inter text-xs text-goal-text/70">${member.contributed}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Join Form */}
        <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
          <h2 className="font-fredoka font-bold text-goal-text text-xl mb-6 text-center">
            Join This Vault
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block font-inter font-semibold text-goal-text mb-2">
                Your Contribution (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-goal-text/60 font-inter">$</span>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="100"
                  className="w-full pl-8 pr-4 py-3 bg-white/50 border border-goal-border/50 rounded-2xl font-inter text-goal-text placeholder-goal-text/60 focus:outline-none focus:ring-2 focus:ring-goal-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-goal-accent/20 p-4 rounded-2xl">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-goal-primary">💎</span>
                <h4 className="font-inter font-semibold text-goal-text">Savings Information</h4>
              </div>
              <p className="font-inter text-sm text-goal-text/70">
                Join this collaborative savings vault and work together to reach the goal.
                Yield features are coming soon to help grow your savings even more!
              </p>
            </div>

            <Button
              onClick={handleJoinVault}
              disabled={!contributionAmount || parseFloat(contributionAmount) <= 0 || isJoining}
              className="w-full bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold text-lg py-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
            >
              {isJoining ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-goal-text/30 border-t-goal-text rounded-full animate-spin"></div>
                  <span>Joining Vault...</span>
                </div>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Join Vault with ${contributionAmount || '0'}
                </>
              )}
            </Button>
          </div>
        </Card>
      </main>

      <BottomNavigation />

      {/* Wallet Guard Dialog */}
      <WalletGuardDialog
        isOpen={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        title="Connect Wallet to Join Vault"
        description="You need to connect your wallet to join this savings vault. Connect now to start contributing to your shared goal!"
        actionText="Join Vault"
      />
    </div>
  );
};

export default JoinVault;
