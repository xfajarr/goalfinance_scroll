
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import BottomNavigation from '@/components/BottomNavigation';
import { WalletGuard } from '@/components/wallet/WalletGuard';
import { Settings, Trophy, Target, Users, Copy, Check, DollarSign, Loader2, AlertCircle, LogOut, History } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';

const Profile = () => {
  const [walletCopied, setWalletCopied] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

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
  const { isConnected, requireConnection, address } = useWalletGuard();

  // Privy for wallet disconnection
  const { logout } = usePrivy();

  const copyWalletAddress = async () => {
    try {
      const addressToCopy = walletAddress || address;
      if (addressToCopy) {
        await navigator.clipboard.writeText(addressToCopy);
        setWalletCopied(true);
        toast.success('Address copied to clipboard');
        setTimeout(() => setWalletCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy wallet address');
      toast.error('Failed to copy address');
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      setIsDisconnecting(true);

      // First try to logout from Privy
      try {
        await logout();
      } catch (logoutError) {
        console.warn('Privy logout failed, but continuing with disconnect:', logoutError);
        // Continue with disconnect even if Privy logout fails
      }

      toast.success('Wallet disconnected successfully');

      // Navigate to landing page after successful disconnect
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet. Please try again.');
    } finally {
      setIsDisconnecting(false);
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

  return (
    <WalletGuard requireAuth={false}>
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-8">
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <Link to="/app/goals-history" className="flex-1">
                <Button
                  variant="outline"
                  className="border-goal-border text-goal-text hover:bg-goal-accent rounded-full px-6 w-full"
                >
                  <History className="w-4 h-4 mr-2" />
                  <span className="font-fredoka font-semibold">History</span>
                </Button>
              </Link>

              {/* <Button
                variant="outline"
                className="border-goal-border text-goal-text hover:bg-goal-accent rounded-full px-6 flex-1 min-w-0"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline font-fredoka font-semibold">Settings</span>
                <span className="sm:hidden font-fredoka font-semibold">Settings</span>
              </Button> */}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-full px-6 flex-1 min-w-0 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline font-fredoka font-semibold">Disconnect</span>
                    <span className="sm:hidden font-fredoka font-semibold">Disconnect</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-goal-border/30 rounded-xl max-w-[90vw] sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-fredoka text-goal-text">
                      Disconnect Wallet?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="font-inter text-goal-text/70">
                      Are you sure you want to disconnect your wallet? You will need to reconnect to access your profile and savings goals.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="border-goal-border text-goal-text hover:bg-goal-accent rounded-full w-full sm:w-auto">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDisconnectWallet}
                      disabled={isDisconnecting}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full w-full sm:w-auto"
                    >
                      {isDisconnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <LogOut className="w-4 h-4 mr-2" />
                          Disconnect
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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

        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </div>
    </WalletGuard>
  );
};

export default Profile;
