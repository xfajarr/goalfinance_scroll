import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowDownToLine, AlertTriangle, CheckCircle, Loader2, DollarSign } from 'lucide-react';

import { useWithdraw } from '@/hooks/useWithdraw';
import { useGetVault, useGetMemberInfo, useIsGoalReached, useIsVaultExpired } from '@/hooks/useVaultReads';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatCurrency } from '@/utils/formatters';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { Vault, Member } from '@/contracts/types';

interface WithdrawDialogProps {
  vaultId: bigint;
  vaultName: string;
  children: React.ReactNode;
}

export const WithdrawDialog = ({
  vaultId,
  vaultName,
  children,
}: WithdrawDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSucceeded, setHasSucceeded] = useState(false);
  const { isConnected, address } = useAccount();

  // Get vault info
  const { data: vaultInfo, isLoading: isLoadingVault } = useGetVault(vaultId);
  const vault = vaultInfo as Vault | undefined;

  // Get user's member info
  const { data: memberInfo, isLoading: isLoadingMember } = useGetMemberInfo(vaultId, address);
  const member = memberInfo as Member | undefined;

  // Check vault status
  const { data: isGoalReached } = useIsGoalReached(vaultId);
  const { data: isExpired } = useIsVaultExpired(vaultId);

  // Use withdrawal hook
  const {
    withdraw,
    withdrawEarly,
    isLoading,
    isConfirming,
    isSuccess,
    error,
    txHash,
    reset,
  } = useWithdraw();

  // Check if user can withdraw
  const canWithdraw = member && !member.hasWithdrawn && member.depositedAmount > 0n;
  const isNormalWithdrawal = isGoalReached || isExpired;
  const withdrawAmount = member ? Number(formatUnits(member.depositedAmount, vault?.config.token === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? 18 : 6)) : 0;
  
  // Calculate penalty for early withdrawal
  const penaltyRate = vault ? Number(vault.config.penaltyRate) / 100 : 2; // Convert basis points to percentage
  const penaltyAmount = isNormalWithdrawal ? 0 : withdrawAmount * (penaltyRate / 100);
  const netWithdrawAmount = withdrawAmount - penaltyAmount;

  const handleNormalWithdraw = async () => {
    try {
      await withdraw({ vaultId });
    } catch (error) {
      console.error('Normal withdrawal failed:', error);
    }
  };

  const handleEarlyWithdraw = async () => {
    try {
      await withdrawEarly({ vaultId });
    } catch (error) {
      console.error('Early withdrawal failed:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setHasSucceeded(false);
    reset();
  };

  // Track success state
  useEffect(() => {
    if (isSuccess && !hasSucceeded) {
      setHasSucceeded(true);
    }
  }, [isSuccess, hasSucceeded]);

  // Auto-close on success
  useEffect(() => {
    if (hasSucceeded && isOpen) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasSucceeded, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw] bg-white/95 backdrop-blur-sm border-goal-border/30 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 font-fredoka text-goal-text text-lg">
            <div className="w-10 h-10 bg-goal-primary rounded-full flex items-center justify-center shadow-lg">
              <ArrowDownToLine className="w-5 h-5 text-white" />
            </div>
            Withdraw Funds
          </DialogTitle>
          <DialogDescription className="font-inter text-goal-text/80 text-sm">
            Withdraw your funds from "<span className="font-semibold text-goal-text">{vaultName}</span>".
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="space-y-3">
            <Card className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <p className="font-inter text-sm text-goal-text font-medium">
                  Please connect your wallet to withdraw funds.
                </p>
              </div>
            </Card>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : isLoadingVault || isLoadingMember ? (
          <div className="space-y-3">
            <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="font-inter text-sm text-goal-text font-medium">
                  Loading withdrawal information...
                </p>
              </div>
            </Card>
          </div>
        ) : !canWithdraw ? (
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-inter text-sm text-goal-text font-medium mb-2">
                    {!member ? "You are not a member of this vault." : 
                     member.hasWithdrawn ? "You have already withdrawn from this vault." :
                     "No funds available for withdrawal."}
                  </p>
                  <p className="font-inter text-xs text-goal-text/70">
                    Only vault members with deposited funds can withdraw.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ) : hasSucceeded ? (
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-fredoka font-bold text-green-800 mb-2">
                💰 Withdrawal Successful!
              </h3>
              <p className="text-sm text-green-700">
                Your funds have been withdrawn successfully. This dialog will close automatically.
              </p>
            </div>
            {txHash && (
              <div className="text-xs text-green-600 font-mono bg-green-50 p-2 rounded">
                Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Withdrawal Summary */}
            <Card className="p-4 bg-goal-accent/20 border-goal-border/40 rounded-2xl space-y-3">
              <h4 className="font-fredoka font-bold text-goal-text flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-goal-primary" />
                Withdrawal Summary
              </h4>

              <div className="space-y-2 text-sm font-inter">
                <div className="flex justify-between">
                  <span className="text-goal-text/80 font-medium">Your deposit:</span>
                  <span className="font-bold text-goal-text">{formatCurrency(withdrawAmount)}</span>
                </div>
                
                {!isNormalWithdrawal && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-goal-text/80 font-medium">Early withdrawal penalty ({penaltyRate}%):</span>
                      <span className="font-bold text-red-600">-{formatCurrency(penaltyAmount)}</span>
                    </div>
                    <Separator className="bg-goal-border/40" />
                    <div className="flex justify-between">
                      <span className="text-goal-text/80 font-medium">You will receive:</span>
                      <span className="font-bold text-goal-text text-base">{formatCurrency(netWithdrawAmount)}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Warning for early withdrawal */}
            {!isNormalWithdrawal && (
              <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-inter text-sm text-goal-text font-medium mb-2">
                      Early Withdrawal Warning
                    </p>
                    <p className="font-inter text-xs text-goal-text/70">
                      Withdrawing before the goal is reached or deadline expires will incur a {penaltyRate}% penalty. 
                      The penalty goes to the platform to support the ecosystem.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Transaction Status */}
            {(isLoading || isConfirming) && (
              <Card className="p-4 bg-blue-50 border-blue-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-700 font-medium">
                    {isLoading ? 'Processing withdrawal...' : 'Confirming transaction...'}
                  </span>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-goal-border text-goal-text hover:bg-goal-accent rounded-2xl font-semibold"
              >
                Cancel
              </Button>
              
              {isNormalWithdrawal ? (
                <Button
                  onClick={handleNormalWithdraw}
                  disabled={isLoading || isConfirming}
                  className="flex-1 bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold rounded-2xl shadow-lg"
                >
                  {isLoading || isConfirming ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Withdrawing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>Withdraw {formatCurrency(withdrawAmount)}</span>
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleEarlyWithdraw}
                  disabled={isLoading || isConfirming}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-fredoka font-bold rounded-2xl shadow-lg"
                >
                  {isLoading || isConfirming ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Withdrawing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Early Withdraw {formatCurrency(netWithdrawAmount)}</span>
                    </div>
                  )}
                </Button>
              )}
            </div>

            {error && (
              <Card className="p-3 bg-gradient-to-r from-red-50 to-rose-50 border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="font-inter text-sm text-red-700 font-medium">{error.message}</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
