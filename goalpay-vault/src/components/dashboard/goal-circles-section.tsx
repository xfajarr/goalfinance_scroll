import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionHeader } from '@/components/ui/section-header';
import { GoalCircleCard } from '@/components/goal-circles/GoalCircleCard';
import { Loader2 } from 'lucide-react';
import { GoalCircle } from '@/types/goalCircles';
import { MOCK_USER_JOINED_CIRCLES } from '@/constants/goalCircles';
import { useInviteCode, VaultPreview } from '@/hooks/useInviteCode';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { useToast } from '@/hooks/use-toast';
import { useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { MockUSDCABI } from '@/contracts/abis/MockUSDC';
import confetti from 'canvas-confetti';

interface GoalCirclesSectionProps {
  userJoinedCircles?: GoalCircle[];
  isLoading?: boolean;
}

export const GoalCirclesSection = ({
  userJoinedCircles = MOCK_USER_JOINED_CIRCLES,
  isLoading = false
}: GoalCirclesSectionProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const [goalPreview, setGoalPreview] = useState<VaultPreview | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Force USDC only - native token (ETH) is not available yet
  const isNativeToken = false;

  const { toast } = useToast();
  const { requireWalletConnection } = useWalletGuard();

  // Get user account and USDC balance
  const { address } = useAccount();
  const { data: usdcBalance, isLoading: isLoadingBalance } = useReadContract({
    address: CONTRACT_ADDRESSES[4202]?.USDC as `0x${string}`, // Lisk Sepolia USDC
    abi: MockUSDCABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  });

  const {
    validateInviteCode,
    isValidating,
    joinVaultByInvite,
    isJoining,
    joinError,
    joinTxHash,
    isApproving,
    isConfirming
  } = useInviteCode();

  // Handle successful transaction confirmation
  const {
    isSuccess: isTransactionConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: joinTxHash as `0x${string}` | undefined,
  });

  // Handle successful join with confetti and alert
  useEffect(() => {
    if (isTransactionConfirmed && joinTxHash) {
      // Trigger confetti animation
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#10B981', '#34D399']
      });

      // Additional confetti burst after a short delay
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#FBBF24', '#FCD34D']
        });
      }, 500);

      toast({
        title: '🎉 Successfully Joined Goal!',
        description: `Welcome to the savings squad! Deposited ${depositAmount} USDC`,
      });

      // Reset form
      setInviteCode('');
      setGoalPreview(null);
      setDepositAmount('');
      setShowJoinForm(false);
    }
  }, [isTransactionConfirmed, joinTxHash, depositAmount, isNativeToken, toast]);

  // Handle join errors
  useEffect(() => {
    if (joinError) {
      toast({
        title: '❌ Failed to Join Goal',
        description: joinError.message || 'Something went wrong while joining the goal.',
        variant: 'destructive',
      });
    }
  }, [joinError, toast]);

  // Handle confirmation errors
  useEffect(() => {
    if (confirmError) {
      toast({
        title: '❌ Transaction Failed',
        description: 'The transaction was rejected or failed to confirm.',
        variant: 'destructive',
      });
    }
  }, [confirmError, toast]);

  const handleValidateInviteCode = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: 'Enter Invite Code',
        description: 'Please enter a valid invite code.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const preview = await validateInviteCode(inviteCode.trim());
      if (preview) {
        setGoalPreview(preview);
        setShowJoinForm(true);
        // Note: Always use USDC - native tokens (ETH/MNT) are not supported yet
      }
    } catch (error) {
      console.error('Error validating invite code:', error);
    }
  };

  const handleJoinGoal = () => {
    requireWalletConnection(async () => {
      if (!goalPreview) return;

      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        toast({
          title: 'Enter Deposit Amount',
          description: 'Please enter a valid deposit amount.',
          variant: 'destructive',
        });
        return;
      }

      try {
        await joinVaultByInvite(inviteCode.trim(), depositAmount, isNativeToken);
        // Success feedback will be shown when transaction is confirmed
      } catch (error) {
        console.error('Error joining goal:', error);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SectionHeader
          title="Goal Circles"
          subtitle="Save together with friends"
        />
        <Card className="bg-goal-accent/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-goal-text-primary mx-auto mr-3"></div>
            <p className="text-goal-text-secondary font-inter">Loading goal circles...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Join Goal Circle Section */}
      <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
        <div className="text-center mb-6 lg:mb-8">
          <h3 className="text-goal-heading font-fredoka font-bold text-xl lg:text-2xl mb-2">Join a Circle</h3>
          <p className="text-goal-text-secondary font-inter text-sm lg:text-base">
            Enter an invite code to join a savings circle with friends
          </p>
        </div>

        <div className="space-y-4">
          {!showJoinForm ? (
            <>
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Input
                  type="text"
                  placeholder="Enter invite code (e.g., 0x...)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="flex-1 bg-goal-soft/50 border-goal-border/30 rounded-full px-4 py-3 lg:px-6 lg:py-4 font-inter placeholder:text-goal-text/50 focus:border-goal-primary focus:ring-goal-primary"
                />
                <Button
                  onClick={handleValidateInviteCode}
                  disabled={!inviteCode.trim() || isValidating}
                  className="bg-goal-primary hover:bg-goal-primary/90 text-white rounded-full px-6 lg:px-8 py-3 lg:py-4 font-fredoka font-semibold w-full sm:w-auto"
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Validate'
                  )}
                </Button>
              </div>

              {/* Helpful Info */}
              <div className="bg-goal-accent/10 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h4 className="font-fredoka font-bold text-goal-text text-sm mb-1">
                      Enter a real invite code from a circle creator
                    </h4>
                    <p className="text-goal-text/70 text-xs">
                      Invite codes are generated when circle creators share their goals.
                      Ask friends for their invite codes or create your own goal to generate codes!
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : goalPreview && (
            <div className="space-y-4">
              {/* Goal Preview */}
              <div className="bg-goal-accent/20 rounded-2xl p-6 border border-goal-border/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-fredoka font-bold text-goal-heading text-lg mb-2">
                      {goalPreview.name}
                    </h4>
                    <p className="text-goal-text-secondary text-sm mb-3">
                      {goalPreview.description}
                    </p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Active
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <div className="text-goal-primary mb-1">🎯</div>
                    <div className="text-sm font-bold text-goal-text">
                      {goalPreview.targetAmount > 0n
                        ? `$${Number(goalPreview.targetAmount / 1000000n).toLocaleString()}`
                        : 'Personal Goals'
                      }
                    </div>
                    <div className="text-xs text-goal-text/60">Target</div>
                  </div>

                  <div>
                    <div className="text-goal-primary mb-1">👥</div>
                    <div className="text-sm font-bold text-goal-text">
                      {Number(goalPreview.memberCount)}
                    </div>
                    <div className="text-xs text-goal-text/60">Members</div>
                  </div>

                  <div>
                    <div className="text-goal-primary mb-1">📅</div>
                    <div className="text-sm font-bold text-goal-text">
                      {Math.max(0, Math.floor((Number(goalPreview.deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))}
                    </div>
                    <div className="text-xs text-goal-text/60">Days Left</div>
                  </div>
                </div>

                {/* Progress Bar (only for GROUP type circles) */}
                {goalPreview.targetAmount > 0n && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-goal-text/70">Progress</span>
                      <span className="font-medium text-goal-text">
                        ${Number(goalPreview.currentAmount / 1000000n).toLocaleString()} / ${Number(goalPreview.targetAmount / 1000000n).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-goal-accent/30 rounded-full h-2">
                      <div
                        className="bg-goal-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((Number(goalPreview.currentAmount) / Number(goalPreview.targetAmount)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Deposit Amount Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-goal-text-secondary text-sm font-medium">
                    Deposit Amount (USDC Only)
                  </label>
                  {address && (
                    <div className="flex items-center gap-1 text-xs text-goal-text/70">
                      <img src="/usdc-logo.svg" alt="USDC" className="w-3 h-3" />
                      <span>Balance: </span>
                      {isLoadingBalance ? (
                        <span>Loading...</span>
                      ) : (
                        <span className="font-medium">
                          {usdcBalance ? Number(formatUnits(usdcBalance, 6)).toLocaleString() : '0'} USDC
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <img src="/usdc-logo.svg" alt="USDC" className="w-5 h-5" />
                  </div>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="bg-white border-goal-border/30 rounded-xl pl-12 pr-24 py-3 font-inter focus:border-goal-primary focus:ring-goal-primary"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {address && usdcBalance && Number(formatUnits(usdcBalance, 6)) > 0 && (
                      <button
                        type="button"
                        onClick={() => setDepositAmount(Number(formatUnits(usdcBalance, 6)).toString())}
                        className="text-xs text-goal-primary hover:text-goal-primary/80 font-medium px-1 py-0.5 rounded border border-goal-primary/30 hover:border-goal-primary/50 transition-colors"
                      >
                        Max
                      </button>
                    )}
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      <img src="/usdc-logo.svg" alt="USDC" className="w-3 h-3" />
                      USDC
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-700 text-xs font-medium">
                    ℹ️ Only USDC deposits are supported. ETH deposits are coming soon!
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowJoinForm(false);
                    setGoalPreview(null);
                    setDepositAmount('');
                  }}
                  variant="outline"
                  className="flex-1 rounded-xl font-fredoka font-semibold"
                >
                  Back
                </Button>
                <Button
                  onClick={handleJoinGoal}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0 || isJoining || isApproving || isConfirming}
                  className="flex-1 bg-goal-primary hover:bg-goal-primary/90 text-goal-text rounded-xl font-fredoka font-semibold"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Approving...
                    </>
                  ) : isJoining || isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Joining...
                    </>
                  ) : (
                    <>
                      👥 Join Circle
                    </>
                  )}
                </Button>
              </div>

              {joinError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3">
                  <p className="text-red-700 text-sm font-medium">
                    ❌ {joinError.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Empty State for Joined Circles */}
      {userJoinedCircles.length === 0 && (
        <Card className="bg-goal-accent/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl">
          <div className="text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-fredoka font-bold text-goal-heading mb-2">
              No Goal Circles Yet
            </h3>
            <p className="text-goal-text-secondary text-sm mb-4">
              Use an invite code above to join a savings circle with friends!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
