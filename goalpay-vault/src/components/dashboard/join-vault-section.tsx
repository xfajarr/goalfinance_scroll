import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInviteCode, VaultPreview } from '@/hooks/useInviteCode';
import { useWalletGuard } from '@/hooks/useWalletGuard';
import { WalletGuardDialog } from '@/components/WalletGuardDialog';
import { formatUnits, parseUnits } from 'viem';
import { Users, Target, Calendar, Loader2, Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

export const JoinVaultSection = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [vaultPreview, setVaultPreview] = useState<VaultPreview | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isNativeToken, setIsNativeToken] = useState(false);
  
  const { 
    validateInviteCode, 
    isValidating, 
    validateError,
    joinVaultByInvite,
    isJoining,
    joinError 
  } = useInviteCode();
  
  const { requireWalletConnection, showConnectDialog, setShowConnectDialog } = useWalletGuard();
  const { toast } = useToast();

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
        setVaultPreview(preview);
        // Show personal goal input for PERSONAL type vaults (you'd need to check vault type)
        // For now, we'll show it if targetAmount is 0 (indicating PERSONAL type)
        setShowPersonalGoal(preview.targetAmount === 0n);
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

  const handleJoinVault = () => {
    requireWalletConnection(async () => {
      if (!vaultPreview) return;

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

        // Trigger confetti animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']
        });

        // Reset form
        setInviteCode('');
        setVaultPreview(null);
        setDepositAmount('');
        setIsNativeToken(false);

      } catch (error) {
        console.error('Error joining vault:', error);
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
              Join a Vault
            </h2>
            <p className="text-goal-text/70 text-sm">
              Enter an invite code to join a savings vault with friends
            </p>
          </div>

          {/* Invite Code Input */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Enter invite code (e.g., GOAL1ABC123)"
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
              <p className="text-xs text-goal-text/60 mb-2 font-medium">
                💡 Enter a real invite code from a vault creator to join their savings goal
              </p>
              <p className="text-xs text-goal-text/50">
                Invite codes are generated when vault creators share their vaults.
                Ask friends for their invite codes or create your own vault to generate codes!
              </p>
            </div>

            {validateError && (
              <div className="text-red-500 text-sm text-center">
                {validateError.message}
              </div>
            )}
          </div>

          {/* Vault Preview */}
          {vaultPreview && (
            <Card className="bg-goal-accent/20 border-goal-border/40 p-6 rounded-2xl">
              <div className="space-y-4">
                {/* Vault Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-fredoka font-bold text-lg text-goal-text">
                      {vaultPreview.name}
                    </h3>
                    <p className="text-goal-text/70 text-sm mt-1">
                      {vaultPreview.description}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </div>

                {/* Vault Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center text-goal-primary mb-1">
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-bold text-goal-text">
                      {vaultPreview.targetAmount > 0n 
                        ? formatCurrency(vaultPreview.targetAmount)
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
                      {Number(vaultPreview.memberCount)}
                    </div>
                    <div className="text-xs text-goal-text/60">Members</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center text-goal-primary mb-1">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-bold text-goal-text">
                      {getDaysLeft(vaultPreview.deadline)}
                    </div>
                    <div className="text-xs text-goal-text/60">Days Left</div>
                  </div>
                </div>

                {/* Progress Bar (only for GROUP type vaults) */}
                {vaultPreview.targetAmount > 0n && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-goal-text/70">Progress</span>
                      <span className="font-medium text-goal-text">
                        {formatCurrency(vaultPreview.currentAmount)} / {formatCurrency(vaultPreview.targetAmount)}
                      </span>
                    </div>
                    <Progress 
                      value={calculateProgress(vaultPreview.currentAmount, vaultPreview.targetAmount)} 
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
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={!isNativeToken ? "default" : "outline"}
                        onClick={() => setIsNativeToken(false)}
                        className="flex-1 rounded-xl"
                      >
                        <img src="/usdc-logo.svg" alt="USDC" className="w-4 h-4 mr-2" />
                        USDC
                      </Button>
                      <Button
                        type="button"
                        variant={isNativeToken ? "default" : "outline"}
                        onClick={() => setIsNativeToken(true)}
                        className="flex-1 rounded-xl"
                      >
                        <img src="/mantle-mnt-logo.svg" alt="MNT" className="w-4 h-4 mr-2" />
                        MNT
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-goal-text/60">
                    Choose your deposit token and enter the amount to join the vault
                  </p>
                </div>

                {/* Join Button */}
                <Button
                  onClick={handleJoinVault}
                  disabled={isJoining || !depositAmount}
                  className="w-full bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-semibold rounded-2xl py-3"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining Vault...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Vault
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
