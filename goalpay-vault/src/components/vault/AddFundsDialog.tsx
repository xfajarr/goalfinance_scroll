import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle, Loader2, Wallet } from 'lucide-react';

import { useAddFunds } from '@/hooks/useAddFunds';
import { useGetVault, useGetMemberInfo } from '@/hooks/useVaultReads';
import { ConnectWalletDialog } from '@/components/ConnectWalletDialog';
import { formatCurrency } from '@/utils/formatters';
import { useAccount, usePublicClient } from 'wagmi';
import { Address, parseUnits } from 'viem';
import { Vault, Member } from '@/contracts/types';
import { ERC20ABI } from '@/contracts/abis/ERC20';

// Form validation schema
const addFundsSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be a positive number')
    .refine((val) => Number(val) >= 1, 'Minimum contribution is $1')
    .refine((val) => Number(val) <= 100000, 'Maximum contribution is $100,000'),
});

type AddFundsFormData = z.infer<typeof addFundsSchema>;

interface AddFundsDialogProps {
  vaultId: bigint;
  vaultName: string;
  currentAmount: number;
  goalAmount: number;
  yieldRate: number; // In percentage (e.g., 8.5 for 8.5%)
  children: React.ReactNode;
}

export const AddFundsDialog = ({
  vaultId,
  vaultName,
  currentAmount,
  goalAmount,
  yieldRate,
  children,
}: AddFundsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNativeToken, setIsNativeToken] = useState(false);
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null);

  // Get vault info from new GoalFinance contract
  const { data: vaultInfo, isLoading: isLoadingVault } = useGetVault(vaultId);

  // Check if user is a member of the vault using new contract structure
  const { data: memberInfo, isLoading: isLoadingMember } = useGetMemberInfo(vaultId, address);

  // Use the new add funds hook with separate functions
  const {
    addNativeFunds,
    addTokenFunds,
    isLoading,
    isConfirming,
    isSuccess,
    error,
    txHash,
    reset,
    // Approval states
    isApproving,
    isApprovingConfirming,
    approvalTxHash,
    needsApproval,
    currentStep
  } = useAddFunds();

  const form = useForm<AddFundsFormData>({
    resolver: zodResolver(addFundsSchema),
    defaultValues: {
      amount: '',
    },
  });

  const watchedAmount = form.watch('amount');
  const contributionAmount = Number(watchedAmount) || 0;
  const projectedYield = (contributionAmount * yieldRate) / 100;
  const totalReturn = contributionAmount + projectedYield;
  const newVaultTotal = currentAmount + contributionAmount;
  const progressToGoal = Math.min((newVaultTotal / goalAmount) * 100, 100);

  // Check if user is a member and active (new contract structure)
  const memberData = memberInfo as Member | undefined;
  const isActiveMember = memberData && !memberData.hasWithdrawn;
  const vaultData = vaultInfo as Vault | undefined;
  const isVaultCreator = vaultData && address && vaultData.creator?.toLowerCase() === address.toLowerCase();

  // Creator should always be able to add funds (they're automatically added as member in contract)
  const canAddFunds = isActiveMember || isVaultCreator;

  // Debug logging for membership status
  // console.log('AddFundsDialog Debug:', {
  //   address,
  //   vaultCreator: vaultData?.creator,
  //   isVaultCreator,
  //   memberInfo,
  //   isActiveMember,
  //   canAddFunds,
  //   isLoadingMember
  // });

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address || isNativeToken) {
        setUsdcBalance(null);
        return;
      }
      try {
        const bal = await publicClient.readContract({
          address: '0x77B2693ea846571259FA89CBe4DD8e18f3F61787',
          abi: ERC20ABI,
          functionName: 'balanceOf',
          args: [address],
        });
        setUsdcBalance(bal as bigint);
      } catch {
        setUsdcBalance(null);
      }
    };
    fetchBalance();
  }, [address, isNativeToken, publicClient]);


  const onSubmit = async (data: AddFundsFormData) => {
    try {
      if (!vaultId) {
        throw new Error('Vault ID is required');
      }

      // Use the appropriate function based on token type
      if (isNativeToken) {
        await addNativeFunds(vaultId, data.amount);
      } else {
        await addTokenFunds(vaultId, data.amount);
      }

      // Don't close modal or reset form here - let the success effect handle it
    } catch (error) {
      // Error is handled by the hook and displayed via toast
      console.error('Add funds failed:', error);
      // Modal stays open on error so user can try again
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
    setHasSucceeded(false);
    setIsNativeToken(false);
    reset(); // Reset the add funds hook state
  };

  // Track if we've had a successful transaction
  const [hasSucceeded, setHasSucceeded] = useState(false);

  // Effect to handle automatic modal closing on success
  useEffect(() => {
    // Mark as succeeded when we reach the success step
    if (isSuccess && !hasSucceeded) {
      setHasSucceeded(true);
    }
  }, [isSuccess, hasSucceeded]);

  // Effect to close modal after success
  useEffect(() => {
    if (hasSucceeded && isOpen) {
      // Small delay to let user see the success message
      const timer = setTimeout(() => {
        form.reset();
        setIsOpen(false);
        setHasSucceeded(false);
        setIsNativeToken(false);
        reset();
      }, 3000); // 3 second delay to show success state

      return () => clearTimeout(timer);
    }
  }, [hasSucceeded, isOpen, form, reset]);

  // Effect to handle modal closing on user rejection/cancellation
  useEffect(() => {
    // If there's an error and we're not loading, it means user rejected or transaction failed
    if (error && !isLoading && !isConfirming && isOpen) {
      // Don't auto-close on error - let user decide to close or try again
      // But we could add a timeout for auto-close after a longer delay if desired
    }
  }, [error, isLoading, isConfirming, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw] bg-white/95 backdrop-blur-sm border-goal-border/30 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 font-fredoka text-goal-text text-lg">
            <div className="w-10 h-10 bg-goal-primary rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Add Funds to Vault
          </DialogTitle>
          <DialogDescription className="font-inter text-goal-text/80 text-sm">
            Contribute to "<span className="font-semibold text-goal-text">{vaultName}</span>" and start saving together.
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="space-y-3">
            <Card className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <p className="font-inter text-sm text-goal-text font-medium">
                  Please connect your wallet to add funds to this vault.
                </p>
              </div>
            </Card>
            <div className="flex justify-center">
              <ConnectWalletDialog>
                <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-inter rounded-xl py-3 px-6">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </ConnectWalletDialog>
            </div>
          </div>
        ) : isLoadingVault || isLoadingMember ? (
          <div className="space-y-3">
            <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="font-inter text-sm text-goal-text font-medium">
                  Loading vault information...
                </p>
              </div>
            </Card>
          </div>
        ) : !canAddFunds ? (
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-inter text-sm text-goal-text font-medium mb-2">
                    {isVaultCreator
                      ? "Loading your vault membership status..."
                      : "You need to join this vault before you can add funds."
                    }
                  </p>
                  <p className="font-inter text-xs text-goal-text/70">
                    {isVaultCreator
                      ? "As the vault creator, you should automatically be a member. If this persists, please refresh the page."
                      : "Only vault members can contribute funds. Please join the vault first using an invite code or through the vault's public page."
                    }
                  </p>
                </div>
              </div>
            </Card>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  // You could navigate to join vault page or show join dialog here
                  window.location.href = '/dashboard';
                }}
                className="bg-goal-primary hover:bg-goal-primary/90 text-white rounded-2xl px-6 py-3"
              >
                Go to Dashboard to Join Goal
              </Button>
            </div>
          </div>
        ) : !vaultInfo ? (
          <div className="space-y-3">
            <Card className="p-3 bg-gradient-to-r from-red-50 to-rose-50 border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="font-inter text-sm text-goal-text font-medium">
                  Unable to load goal information. Please try again.
                </p>
              </div>
            </Card>
          </div>
        ) : hasSucceeded ? (
          // Success state
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-fredoka font-bold text-green-800 mb-2">
                🎉 Funds Added Successfully!
              </h3>
              <p className="text-sm text-green-700">
                Your contribution has been added to the vault. This dialog will close automatically.
              </p>
            </div>
            {txHash && (
              <div className="text-xs text-green-600 font-mono bg-green-50 p-2 rounded">
                Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </div>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-fredoka font-semibold text-goal-text">
                      Contribution Amount
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goal-text/60" />
                        <Input
                          {...field}
                          type="number"
                          placeholder="0.00"
                          className="pl-10 font-inter bg-white/50 border-goal-border/50 rounded-xl"
                          min="1"
                          max="100000"
                          step="0.01"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="font-inter text-xs text-goal-text/60">
                      Minimum: $1 • Maximum: $100,000
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* USDC Balance Display */}
              {!isNativeToken && (
                <div className="mb-2 text-xs text-goal-text/70">
                  USDC Balance: {usdcBalance !== null ? (Number(usdcBalance) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 6 }) : '...'}
                </div>
              )}

              {/* Token Selection */}
              <div className="space-y-3">
                <label className="font-fredoka font-bold text-goal-heading text-sm">
                  Choose Token
                </label>
                <div className="grid grid-cols-2 gap-3">
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
                <p className="text-xs text-goal-text/60">
                  Choose your preferred token for the deposit
                </p>
              </div>

              {/* Approval Status */}
              {!isNativeToken && contributionAmount > 0 && (
                <Card className="p-4 bg-yellow-50 border-yellow-200 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium text-yellow-800">
                      USDC Approval Required
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 mb-2">
                    For USDC deposits, you need to approve the contract to spend your tokens first, then add funds.
                  </p>
                  {currentStep === 'approving' && (
                    <div className="text-xs text-yellow-600">
                      Step 1/2: Approving USDC spending...
                    </div>
                  )}
                  {currentStep === 'adding' && (
                    <div className="text-xs text-green-600">
                      Step 2/2: Adding funds to vault...
                    </div>
                  )}
                  {approvalTxHash && (
                    <div className="text-xs text-yellow-600 font-mono bg-yellow-100 p-2 rounded mt-2">
                      Approval TX: {approvalTxHash.slice(0, 10)}...{approvalTxHash.slice(-8)}
                    </div>
                  )}
                </Card>
              )}

              {/* Transaction Status */}
              {(isApproving || isApprovingConfirming || isLoading || isConfirming) && (
                <Card className="p-4 bg-blue-50 border-blue-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-700 font-medium">
                      {isApproving ? 'Approving USDC...' :
                       isApprovingConfirming ? 'Confirming approval...' :
                       isLoading ? 'Adding funds...' : 'Confirming transaction...'}
                    </span>
                  </div>
                </Card>
              )}

              {isSuccess && (
                <Card className="p-4 bg-green-50 border-green-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Funds added successfully!
                    </span>
                  </div>
                </Card>
              )}

              {contributionAmount > 0 && (
                <Card className="p-3 bg-goal-accent/20 border-goal-border/40 rounded-2xl space-y-3">
                  <h4 className="font-fredoka font-bold text-goal-text flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-goal-primary" />
                    Projection Summary
                  </h4>

                  <div className="space-y-2 text-sm font-inter">
                    <div className="flex justify-between">
                      <span className="text-goal-text/80 font-medium">Your contribution:</span>
                      <span className="font-bold text-goal-text">{formatCurrency(contributionAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-goal-text/80 font-medium">Yield feature:</span>
                      <span className="font-bold text-goal-text bg-goal-accent px-2 py-1 rounded-full text-xs">Coming Soon</span>
                    </div>
                    <Separator className="bg-goal-border/40" />
                    <div className="flex justify-between">
                      <span className="text-goal-text/80 font-medium">Current total:</span>
                      <span className="font-bold text-goal-text text-base">{formatCurrency(contributionAmount)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-inter text-goal-text/70 mb-1 font-medium">
                      <span>Vault progress after contribution</span>
                      <span className="font-bold text-goal-text">{progressToGoal.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-goal-accent rounded-full h-2.5">
                      <div
                        className="bg-goal-primary h-2.5 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${Math.min(progressToGoal, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs font-inter text-goal-text/70 mt-1 font-medium">
                      <span className="font-bold text-goal-text">{formatCurrency(newVaultTotal)}</span> of {formatCurrency(goalAmount)}
                    </p>
                  </div>
                </Card>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-goal-border text-goal-text hover:bg-goal-accent rounded-2xl font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isApproving || contributionAmount === 0 || isLoadingVault || !vaultInfo || !canAddFunds}
                  className="flex-1 bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold rounded-2xl shadow-lg"
                >
                  {isLoadingVault ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading Vault...</span>
                    </div>
                  ) : (isApproving || isApprovingConfirming) ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {isApproving ? 'Approving USDC...' : 'Confirming Approval...'}
                      </span>
                    </div>
                  ) : (isLoading || isConfirming) ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {isLoading ? 'Adding Funds...' : 'Confirming...'}
                      </span>
                    </div>
                  ) : needsApproval && !isNativeToken ? (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>
                        Approve USDC First
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>
                        Add {contributionAmount} {isNativeToken ? 'MNT' : 'USDC'}
                      </span>
                    </div>
                  )}
                </Button>
              </div>

              {error && (
                <Card className="p-3 bg-gradient-to-r from-red-50 to-rose-50 border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="font-inter text-sm text-red-700 font-medium">{error.message}</p>
                  </div>
                </Card>
              )}
            </form>
          </Form>
        )}


      </DialogContent>
    </Dialog>
  );
};
