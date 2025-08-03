import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInviteCode, VaultPreview } from '@/hooks/useInviteCode';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { WalletGuardDialog } from '@/components/WalletGuardDialog';
import { formatUnits, parseUnits } from 'viem';
import { Users, Target, Calendar, Loader2, Search, UserPlus, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWaitForTransactionReceipt } from 'wagmi';
import confetti from 'canvas-confetti';
import { useSupportedTokens } from '@/hooks/useTokenInfo';

export const JoinGoalSection = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [goalPreview, setGoalPreview] = useState<VaultPreview | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(1); // Default to USDC
  const supportedTokens = useSupportedTokens();

  // Get current selected token info
  const selectedToken = supportedTokens[selectedTokenIndex];
  const isNativeToken = selectedToken?.isNative || false;
  
  const {
    validateInviteCode,
    isValidating,
    validateError,
    joinVaultByInvite,
    isJoining,
    joinError,
    joinTxHash,
    currentStep,
    isApproving,
    isConfirming
  } = useInviteCode();
  
  const { requireWalletConnection, showConnectDialog, setShowConnectDialog } = useWalletGuard();
  const { toast } = useToast();

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
        description: `Welcome to the savings squad! Deposited ${depositAmount} ${isNativeToken ? 'ETH' : 'USDC'}`,
      });

      // Reset form
      setInviteCode('');
      setGoalPreview(null);
      setDepositAmount('');
      setSelectedTokenIndex(1); // Reset to USDC
    }
  }, [isConfirmed, joinTxHash, depositAmount, isNativeToken, toast]);

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

  const handleValidateCode = async () => {
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
      } else {
        toast({
          title: 'Invalid Invite Code',
          description: 'The invite code you entered is not valid or has expired.',
          variant: 'destructive',
        });
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

  const calculateProgress = (current: bigint, target: bigint): number => {
    if (target === 0n) return 0;
    return Math.min((Number(formatUnits(current || 0n, 6)) / Number(formatUnits(target || 0n, 6))) * 100, 100);
  };

  const formatCurrency = (amount: bigint): string => {
    return `$${Number(formatUnits(amount || 0n, 6)).toLocaleString()}`;
  };

  const getDaysLeft = (deadline: bigint): number => {
    const deadlineMs = Number(deadline) * 1000;
    const now = Date.now();
    const diffMs = deadlineMs - now;
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  return (
    <>
      <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 md:p-8 rounded-3xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-2">
              Join a Circle
            </h2>
            <p className="text-goal-text/90 text-sm">
              Enter an invite code to join a savings circle with friends
            </p>
          </div>

          {/* Invite Code Input */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Enter invite code (e.g., 0x...)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="flex-1 rounded-2xl border-goal-border/60 bg-white/70 font-mono text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleValidateCode()}
              />
              <Button
                onClick={handleValidateCode}
                disabled={isValidating || !inviteCode.trim()}
                className="bg-goal-text text-white rounded-2xl px-6"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Real Invite Codes Info */}
            <div className="bg-goal-accent/10 rounded-2xl p-4">
              <p className="text-xs text-goal-text mb-2 font-medium">
                💡 Enter a real invite code from a circle creator to join their savings goal
              </p>
              <p className="text-xs text-goal-text">
                Invite codes are generated when circle creators share their goals.
                Ask friends for their invite codes or create your own goal to generate codes!
              </p>
            </div>

            {validateError && (
              <div className="text-red-500 text-sm text-center">
                {validateError.message}
              </div>
            )}
          </div>

          {/* Circle Preview */}
          {goalPreview && (
            <Card className="bg-goal-accent/20 border-goal-border/40 p-6 rounded-2xl">
              <div className="space-y-4">
                {/* Circle Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-fredoka font-bold text-lg text-goal-text">
                      {goalPreview.name}
                    </h3>
                    <p className="text-goal-text/70 text-sm mt-1">
                      {goalPreview.description}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </div>

                {/* Circle Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center text-goal-primary mb-1">
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-bold text-goal-text">
                      {goalPreview.targetAmount > 0n
                        ? formatCurrency(goalPreview.targetAmount)
                        : 'Personal Goals'
                      }
                    </div>
                    <div className="text-xs text-goal-text/60">Target</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center text-goal-primary mb-1">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-bold text-goal-text">
                      {Number(goalPreview.memberCount)}
                    </div>
                    <div className="text-xs text-goal-text/60">Members</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center text-goal-primary mb-1">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-bold text-goal-text">
                      {getDaysLeft(goalPreview.deadline)}
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
                        {formatCurrency(goalPreview.currentAmount)} / {formatCurrency(goalPreview.targetAmount)}
                      </span>
                    </div>
                    <Progress
                      value={calculateProgress(goalPreview.currentAmount, goalPreview.targetAmount)}
                      className="h-2 bg-goal-accent/30"
                    />
                  </div>
                )}

                {/* Deposit Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-goal-text">
                    Initial Deposit Amount
                  </label>
                  <div className="space-y-3">
                    <Input
                      type="number"
                      placeholder="Enter deposit amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="rounded-2xl border-goal-border/60 bg-white/70"
                    />

                    {/* Token Selection */}
                    <div className="space-y-2">
                      {/* USDC Option */}
                      <div
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedTokenIndex === 1
                            ? 'bg-goal-primary/10 border-goal-primary'
                            : 'bg-white border-goal-border/30 hover:border-goal-primary/50'
                        }`}
                        onClick={() => setSelectedTokenIndex(1)}
                      >
                        <div className="flex items-center gap-3">
                          <img src="/usdc-logo.svg" alt="USDC" className="w-5 h-5" />
                          <span className="font-medium text-sm">USDC</span>
                          {selectedTokenIndex === 1 && (
                            <CheckCircle className="w-4 h-4 text-goal-primary ml-auto" />
                          )}
                        </div>
                      </div>

                      {/* ETH Option */}
                      <div
                        className="p-3 rounded-xl border cursor-not-allowed bg-gray-50 border-gray-200 opacity-75"
                        onClick={() => {
                          toast({
                            title: "ETH Coming Soon",
                            description: "ETH deposits are being developed. Please use USDC for now.",
                          });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <img src="/ethereum-eth-logo.svg" alt="ETH" className="w-5 h-5 opacity-60" />
                          <span className="font-medium text-sm text-gray-600">ETH</span>
                          <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium ml-auto">
                            Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-goal-text/60">
                    Choose your deposit token and enter the amount to join the circle
                  </p>
                </div>

                {/* Join Button */}
                <Button
                  onClick={handleJoinGoal}
                  disabled={isJoining || !depositAmount || selectedToken?.isNative}
                  className="w-full bg-goal-primary hover:bg-goal-primary/90 text-goal-text-primary font-fredoka font-semibold rounded-2xl py-3"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {currentStep === 'checking' && 'Checking approval...'}
                      {currentStep === 'approving' && 'Approving USDC...'}
                      {currentStep === 'joining' && 'Joining Circle...'}
                      {(currentStep === 'idle' || !currentStep) && 'Processing...'}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Circle
                    </>
                  )}
                </Button>

                {joinError && (
                  <div className="text-red-500 text-sm text-center">
                    {joinError.message}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </Card>

      <WalletGuardDialog 
        isOpen={showConnectDialog} 
        onClose={() => setShowConnectDialog(false)} 
      />
    </>
  );
};
