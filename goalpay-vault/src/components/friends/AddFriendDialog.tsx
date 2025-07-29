import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAddress } from 'viem';
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
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { UserPlus, Wallet, User, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useFriendsRegistry } from '@/hooks/useFriendsRegistry';
import { useWalletGuard } from '@/hooks/use-wallet-guard';

// Form validation schema
const addFriendSchema = z.object({
  friendAddress: z
    .string()
    .min(1, 'Wallet address is required')
    .refine((address) => isAddress(address), 'Invalid wallet address'),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters'),
  notes: z
    .string()
    .max(200, 'Notes must be less than 200 characters')
    .optional(),
});

type AddFriendFormData = z.infer<typeof addFriendSchema>;

interface AddFriendDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function AddFriendDialog({ children, onSuccess }: AddFriendDialogProps) {
  const [open, setOpen] = useState(false);
  const { requireWalletConnection } = useWalletGuard();
  const { addFriend, isLoading, isConfirming, isSuccess, error, reset } = useFriendsRegistry();

  const form = useForm<AddFriendFormData>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: {
      friendAddress: '',
      displayName: '',
      notes: '',
    },
  });

  const handleSubmit = async (data: AddFriendFormData) => {
    const canProceed = await requireWalletConnection();
    if (!canProceed) return;

    try {
      await addFriend({
        friendAddress: data.friendAddress as `0x${string}`,
        displayName: data.displayName,
        notes: data.notes,
      });
    } catch (err) {
      console.error('Failed to add friend:', err);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form and state when closing
      form.reset();
      reset();
    }
    setOpen(newOpen);
  };

  // Close dialog and call onSuccess when transaction is successful
  React.useEffect(() => {
    if (isSuccess) {
      setOpen(false);
      onSuccess?.();
      form.reset();
      reset();
    }
  }, [isSuccess, onSuccess, form, reset]);

  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-goal-primary" />
            Add Friend
          </DialogTitle>
          <DialogDescription>
            Add a friend by their wallet address to easily split bills and track debts.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Wallet Address Field */}
            <FormField
              control={form.control}
              name="friendAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Wallet Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      {...field}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your friend's Ethereum wallet address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Name Field */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Display Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., John Doe"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify your friend
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., College roommate, work colleague..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about your friend
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Card */}
            {form.watch('friendAddress') && form.watch('displayName') && (
              <Card className="p-4 bg-goal-accent/50 border-goal-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-goal-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-goal-text truncate">
                      {form.watch('displayName')}
                    </p>
                    <p className="text-sm text-goal-text-secondary font-mono">
                      {formatAddress(form.watch('friendAddress'))}
                    </p>
                    {form.watch('notes') && (
                      <p className="text-xs text-goal-text-secondary mt-1 truncate">
                        {form.watch('notes')}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="p-4 bg-red-50 border-red-200">
                <p className="text-sm text-red-600">
                  {error instanceof Error ? error.message : 'Failed to add friend'}
                </p>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                disabled={isLoading || isConfirming}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || isConfirming}
              >
                {isLoading || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isConfirming ? 'Confirming...' : 'Adding...'}
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Added!
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Quick add friend button component
export function AddFriendButton({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <AddFriendDialog onSuccess={onSuccess}>
      <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-full transition-all duration-300 hover:scale-105 gap-2">
        <UserPlus className="w-4 h-4" />
        Add Friend
      </Button>
    </AddFriendDialog>
  );
}

// Compact add friend button for mobile
export function AddFriendButtonCompact({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <AddFriendDialog onSuccess={onSuccess}>
      <Button size="sm" variant="outline" className="gap-2">
        <UserPlus className="w-4 h-4" />
        Add
      </Button>
    </AddFriendDialog>
  );
}
