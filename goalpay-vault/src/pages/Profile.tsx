
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import BottomNavigation from '@/components/BottomNavigation';
import { Settings, Trophy, Target, Users, Copy, Check, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWalletGuard } from '@/hooks/useWalletGuard';
import { ConnectWalletDialog } from '@/components/ConnectWalletDialog';

const Profile = () => {
  const [walletCopied, setWalletCopied] = useState(false);

  // Get real user profile data
  const {
    name,
    avatar,
    walletAddress,
    joinedDate,
    stats,
    isLoading,
    error
  } = useUserProfile();

  // Wallet guard for connection state
  const { isConnected, requireWalletConnection } = useWalletGuard();

  const copyWalletAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy wallet address');
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-0 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-goal-primary" />
          <p className="font-inter text-goal-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-0 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="font-inter text-goal-text mb-4">Failed to load profile</p>
          <p className="font-inter text-goal-text/70 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // Show connect wallet prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-0 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-goal-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-goal-text" />
          </div>
          <h1 className="text-2xl font-fredoka font-bold text-goal-text mb-4">
            Connect Your Wallet
          </h1>
          <p className="font-inter text-goal-text/70 mb-6">
            Connect your wallet to view your profile and track your savings goals.
          </p>
          <ConnectWalletDialog>
            <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-full px-8 py-3">
              Connect Wallet
            </Button>
          </ConnectWalletDialog>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl mb-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-20 h-20 bg-goal-primary">
              <AvatarFallback className="text-goal-text font-fredoka font-bold text-2xl">
                {avatar}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-fredoka font-bold text-goal-text mb-2">
                {name}
              </h1>
              <p className="font-inter text-goal-text/70">
                Member since {joinedDate}
              </p>
            </div>

            {/* Wallet Address */}
            <div className="flex items-center space-x-2 bg-goal-accent/30 px-4 py-2 rounded-2xl">
              <span className="font-inter text-sm text-goal-text">
                {truncateAddress(walletAddress)}
              </span>
              <Button
                onClick={copyWalletAddress}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-goal-accent/50"
              >
                {walletCopied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 text-goal-text/70" />
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              className="border-goal-border text-goal-text hover:bg-goal-accent rounded-full px-6"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-goal-primary rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-goal-text" />
              </div>
              <div>
                <p className="font-inter text-xl font-bold text-goal-text">
                  {stats.vaultsCreated}
                </p>
                <p className="font-inter text-xs text-goal-text/70">Created</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-goal-accent rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-goal-text" />
              </div>
              <div>
                <p className="font-inter text-xl font-bold text-goal-text">
                  {stats.vaultsJoined}
                </p>
                <p className="font-inter text-xs text-goal-text/70">Joined</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-inter text-xl font-bold text-goal-text">
                  {stats.goalsCompleted}
                </p>
                <p className="font-inter text-xs text-goal-text/70">Completed</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-goal-border rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-goal-text" />
              </div>
              <div>
                <p className="font-inter text-xl font-bold text-goal-text">
                  ${stats.totalSaved.toLocaleString()}
                </p>
                <p className="font-inter text-xs text-goal-text/70">Total Saved</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Yield Earned */}
        <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💎</span>
            </div>
            <h3 className="font-fredoka font-bold text-goal-text text-lg mb-2">
              Yield Earned
            </h3>
            <p className="font-inter text-3xl font-bold text-green-600 mb-2">
              ${stats.yieldEarned}
            </p>
            <p className="font-inter text-goal-text/70 text-sm">
              From completed savings goals
            </p>
          </div>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
