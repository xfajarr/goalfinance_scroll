
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import BottomNavigation from '@/components/BottomNavigation';
import { ArrowLeft, Users, Target, Calendar, Plus, CheckCircle, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { WalletGuardDialog } from '@/components/WalletGuardDialog';
import { useInviteCode, VaultPreview } from '@/hooks/useInviteCode';
import { extractVaultIdFromInviteCode } from '@/utils/inviteCodeUtils';
import { formatUnits, parseUnits } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import confetti from 'canvas-confetti';
import { useSupportedTokens, useNativeTokenInfo } from '@/hooks/useTokenInfo';

const JoinVault = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [contributionAmount, setContributionAmount] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [goalPreview, setGoalPreview] = useState<VaultPreview | null>(null);
  const [isLoadingGoal, setIsLoadingGoal] = useState(true);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(1); // Default to USDC
  const supportedTokens = useSupportedTokens();
  const nativeTokenInfo = useNativeTokenInfo();
  const { toast } = useToast();

  // Get current selected token info
  const selectedToken = supportedTokens[selectedTokenIndex];
  const isNativeToken = selectedToken?.isNative || false;

  // Wallet guard for protecting goal joining
  const { requireWalletConnection, showConnectDialog, setShowConnectDialog } = useWalletGuard();

  // Invite code hooks
  const {
    validateInviteCode,
    isValidating,
    joinVaultByInvite,
    isJoining,
    joinError,
    joinTxHash,
    currentStep,
    isApproving,
    isConfirming: isJoinConfirming
  } = useInviteCode();

  const inviteCode = searchParams.get('invite');

  // Wait for transaction confirmation
  const {
    isLoading: isTxConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: joinTxHash as `0x${string}` | undefined,
  });

  // Handle successful transaction confirmation
  useEffect(() => {
    if (isConfirmed && joinTxHash) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']
      });

      toast({
        title: '🎉 Successfully Joined Vault!',
        description: `Welcome to the savings squad! Deposited ${contributionAmount} ${isNativeToken ? 'MNT' : 'USDC'}`,
      });

      setHasJoined(true);
    }
  }, [isConfirmed, joinTxHash, contributionAmount, isNativeToken, toast]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (confirmError) {
      toast({
        title: 'Transaction Failed',
        description: 'The transaction was rejected or failed to confirm.',
        variant: 'destructive',
      });
    }
  }, [confirmError, toast]);

  // Load goal data when component mounts
  useEffect(() => {
    const loadGoalData = async () => {
      if (!inviteCode) {
        toast({
          title: 'Missing Invite Code',
          description: 'No invite code provided in the URL.',
          variant: 'destructive',
        });
        setIsLoadingGoal(false);
        return;
      }

      try {
        setIsLoadingGoal(true);
        const preview = await validateInviteCode(inviteCode);
        if (preview) {
          setGoalPreview(preview);
        } else {
          toast({
            title: 'Invalid Invite Code',
            description: 'The invite code is invalid or the goal does not exist.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error loading goal:', error);
        toast({
          title: 'Error Loading Goal',
          description: 'Failed to load goal information.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingGoal(false);
      }
    };

    loadGoalData();
  }, [inviteCode, validateInviteCode, toast]);

  // Mock goal data for fallback (will be replaced by real data)
  const goal = goalPreview ? {
    id: Number(goalPreview.id),
    name: goalPreview.name,
    description: goalPreview.description,
    goal: Number(formatUnits(goalPreview.targetAmount || 0n, 6)),
    current: Number(formatUnits(goalPreview.currentAmount || 0n, 6)),
    members: [], // Would need to fetch member data separately
    daysLeft: Math.max(0, Math.floor((Number(goalPreview.deadline || 0n) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))),
    creator: goalPreview.creator,
    isPublic: goalPreview.isPublic,
    yieldRate: "8% APY"
  } : {
    id: 1,
    name: "Loading...",
    description: "Loading goal information...",
    goal: 0,
    current: 0,
    members: [],
    daysLeft: 0,
    creator: "",
    isPublic: true,
    yieldRate: "8% APY"
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const handleJoinGoal = async () => {
    if (!inviteCode || !goalPreview) {
      toast({
        title: 'Cannot Join Goal',
        description: 'Goal information is not loaded yet.',
        variant: 'destructive',
      });
      return;
    }

    // Use wallet guard to check connection and show dialog if needed
    requireWalletConnection(async () => {
      await performGoalJoin();
    });
  };

  const performGoalJoin = async () => {
    if (!inviteCode) return;

    try {
      // Validate contribution amount
      if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
        toast({
          title: 'Enter Contribution Amount',
          description: 'Please enter a valid contribution amount.',
          variant: 'destructive',
        });
        return;
      }

      await joinVaultByInvite(inviteCode, contributionAmount, isNativeToken);
      // Success feedback will be shown when transaction is confirmed
    } catch (error) {
      console.error('Error joining goal:', error);
      // Error handling is done in the hook
    }
  };

  // Loading state
  if (isLoadingGoal) {
    return (
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-goal-primary" />
            <h2 className="text-xl font-fredoka font-bold text-goal-text mb-2">
              Loading Goal...
            </h2>
            <p className="font-inter text-goal-text/80">
              Please wait while we load the goal information.
            </p>
          </Card>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  // Error state - no goal found
  if (!goalPreview) {
    return (
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl text-center">
            <h2 className="text-xl font-fredoka font-bold text-goal-text mb-2">
              Goal Not Found
            </h2>
            <p className="font-inter text-goal-text/80 mb-4">
              The invite code is invalid or the goal does not exist.
            </p>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-goal-primary hover:bg-goal-primary/90 text-white rounded-2xl px-6 py-3"
            >
              Go to Dashboard
            </Button>
          </Card>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  // Success state after joining
  if (hasJoined) {
    return (
      <div className="min-h-screen bg-goal-bg pb-20 md:pb-0">

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl text-center">
            <div className="w-20 h-20 bg-goal-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-fredoka font-bold text-goal-text mb-4">
              🎉 Welcome to the Goal!
            </h1>

            <p className="font-inter text-goal-text/80 mb-6">
              You've successfully joined "{goal.name}"!
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.location.href = `/goal/${id}`}
                className="flex-1 bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-2xl px-6 py-3"
              >
                View Goal
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/community" 
          className="inline-flex items-center space-x-2 text-goal-text/70 hover:text-goal-text transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-inter font-medium">Back to Community</span>
        </Link>

        {/* Goal Info */}
        <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl mb-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-text mb-4">
              {goal.name}
            </h1>
            <p className="font-inter text-goal-text/80 mb-4">
              {goal.description}
            </p>

            {inviteCode && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-2xl mb-4">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-blue-500 text-white rounded-full p-1 mr-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="font-inter text-sm font-semibold text-blue-800">
                    🎫 Joined via Invite Link
                  </p>
                </div>
                <div className="bg-white/60 p-3 rounded-xl border border-blue-200/50">
                  <p className="font-inter text-xs text-blue-600 mb-1">Invite Code:</p>
                  <p className="font-mono text-sm font-bold text-blue-900 break-all">
                    {inviteCode.length > 20 ? `${inviteCode.slice(0, 10)}...${inviteCode.slice(-10)}` : inviteCode}
                  </p>
                </div>
                <p className="font-inter text-xs text-blue-600 text-center mt-2">
                  ✅ Valid invite - you can join this goal
                </p>
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
                ${goal.current.toLocaleString()}
              </span>
              <span className="font-inter text-goal-text/80 font-medium">
                of ${goal.goal.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-goal-accent rounded-full h-3">
              <div
                className="bg-goal-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getProgressPercentage(goal.current, goal.goal), 100)}%` }}
              />
            </div>
            <p className="font-inter text-sm text-goal-text font-medium text-center">
              {Math.round(getProgressPercentage(goal.current, goal.goal))}% complete
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-goal-accent rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-goal-text" />
              </div>
              <p className="font-inter text-lg font-bold text-goal-text">{goal.members.length}</p>
              <p className="font-inter text-xs text-goal-text/70">Members</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-goal-primary rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-goal-text" />
              </div>
              <p className="font-inter text-lg font-bold text-goal-text">{goal.daysLeft}</p>
              <p className="font-inter text-xs text-goal-text/70">Days Left</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-goal-border rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-goal-text" />
              </div>
              <p className="font-inter text-lg font-bold text-goal-text">
                ${(goal.goal - goal.current).toLocaleString()}
              </p>
              <p className="font-inter text-xs text-goal-text/70">Needed</p>
            </div>
          </div>

          {/* Current Members */}
          <div className="mb-6">
            <h3 className="font-fredoka font-semibold text-goal-text mb-3">Current Members</h3>
            <div className="flex flex-wrap gap-2">
              {goal.members.map((member) => (
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
            Join This Goal
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

            {/* Token Selection */}
            <div className="space-y-3">
              <label className="font-inter font-semibold text-goal-text">Choose Token</label>

              {/* USDC Option */}
              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedTokenIndex === 1
                    ? 'bg-goal-primary/10 border-goal-primary'
                    : 'bg-white border-goal-border/30 hover:border-goal-primary/50'
                }`}
                onClick={() => setSelectedTokenIndex(1)}
              >
                <div className="flex items-center gap-3">
                  <img src="/usdc-logo.svg" alt="USDC" className="w-6 h-6" />
                  <div>
                    <h3 className="font-medium text-goal-text">USDC</h3>
                    <p className="text-xs text-goal-text/60">Stable and ready to use</p>
                  </div>
                  {selectedTokenIndex === 1 && (
                    <CheckCircle className="w-5 h-5 text-goal-primary ml-auto" />
                  )}
                </div>
              </div>

              {/* ETH Option */}
              <div
                className="p-4 rounded-xl border-2 cursor-not-allowed bg-gray-50 border-gray-200 opacity-75"
                onClick={() => {
                  toast({
                    title: "ETH Coming Soon",
                    description: "ETH deposits are being developed. Please use USDC for now.",
                  });
                }}
              >
                <div className="flex items-center gap-3">
                  <img src="/ethereum-eth-logo.svg" alt="ETH" className="w-6 h-6 opacity-60" />
                  <div>
                    <h3 className="font-medium text-gray-600">ETH</h3>
                    <p className="text-xs text-gray-500">Coming soon</p>
                  </div>
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium ml-auto">
                    Soon
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-goal-accent/20 p-4 rounded-2xl">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-goal-primary">💎</span>
                <h4 className="font-inter font-semibold text-goal-text">Savings Information</h4>
              </div>
              <p className="font-inter text-sm text-goal-text/70">
                Join this collaborative savings goal and work together to reach the target.
                Yield features are coming soon to help grow your savings even more!
              </p>
            </div>

            <Button
              onClick={handleJoinGoal}
              disabled={!contributionAmount || parseFloat(contributionAmount) <= 0 || isJoining || selectedToken?.isNative}
              className="w-full bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold text-lg py-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
            >
              {isJoining ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-goal-text/30 border-t-goal-text rounded-full animate-spin"></div>
                  <span>
                    {currentStep === 'checking' && 'Checking approval...'}
                    {currentStep === 'approving' && 'Approving USDC...'}
                    {currentStep === 'joining' && 'Joining Goal...'}
                    {(currentStep === 'idle' || !currentStep) && 'Processing...'}
                  </span>
                </div>
              ) : selectedToken?.isNative ? (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  ETH Coming Soon - Use USDC
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Join Goal with {contributionAmount || '0'} USDC
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
        title="Connect Wallet to Join Goal"
        description="You need to connect your wallet to join this savings goal. Connect now to start contributing to your shared goal!"
        actionText="Join Goal"
      />
    </div>
  );
};

export default JoinVault;
