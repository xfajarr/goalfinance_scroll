import { useState } from 'react';
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
import { Plus, DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useAddFunds } from '@/hooks/useAddFunds';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatCurrency } from '@/utils/formatters';

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
  const [isConnected, setIsConnected] = useState(true); // Mock connected state
  const { addFunds, isLoading, error, txHash } = useAddFunds();

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

  const onSubmit = async (data: AddFundsFormData) => {
    try {
      await addFunds({
        vaultId,
        amount: BigInt(Math.floor(Number(data.amount) * 1000000)), // Convert to 6 decimal places for USDC
      });
      
      form.reset();
      setIsOpen(false);
    } catch (error) {
      // Error is handled by the hook and displayed via toast
      console.error('Add funds failed:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
  };

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
              <ConnectButton />
            </div>
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
                  disabled={isLoading || contributionAmount === 0}
                  className="flex-1 bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold rounded-2xl shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-goal-text/30 border-t-goal-text rounded-full animate-spin" />
                      <span>Adding Funds...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>Add {formatCurrency(contributionAmount)}</span>
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
