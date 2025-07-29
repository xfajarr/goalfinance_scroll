import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Address } from 'viem';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Receipt,
  Users,
  DollarSign,
  Calculator,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { FriendSearch, SelectedFriend } from '@/components/friends/FriendSearch';
import { useBillSplitter, billUtils, ParticipantShare } from '@/hooks/useBillSplitter';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { SplitMode, NATIVE_TOKEN } from '@/config/contracts';
import { SplitCalculator } from './SplitCalculator';

// Form validation schema
const billCreationSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  totalAmount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be a positive number'),
  token: z.string().min(1, 'Token is required'),
  splitMode: z.nativeEnum(SplitMode),
  category: z.string().min(1, 'Category is required'),
});

type BillCreationFormData = z.infer<typeof billCreationSchema>;

interface BillCreationFormProps {
  onSuccess?: (billId: bigint) => void;
  onCancel?: () => void;
  className?: string;
}

const BILL_CATEGORIES = [
  { value: 'food', label: '🍽️ Food & Dining' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'utilities', label: '⚡ Utilities' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'transport', label: '🚗 Transportation' },
  { value: 'health', label: '🏥 Health & Medical' },
  { value: 'education', label: '📚 Education' },
  { value: 'other', label: '📦 Other' },
];

const TOKEN_OPTIONS = [
  { value: NATIVE_TOKEN, label: 'ETH (Native)', symbol: 'ETH' },
  { value: '0x77B2693ea846571259FA89CBe4DD8e18f3F61787', label: 'USDC', symbol: 'USDC' }, // Mantle Sepolia USDC
];

export function BillCreationForm({ onSuccess, onCancel, className }: BillCreationFormProps) {
  const [selectedFriends, setSelectedFriends] = useState<SelectedFriend[]>([]);
  const [participantShares, setParticipantShares] = useState<ParticipantShare[]>([]);
  const [isCalculationValid, setIsCalculationValid] = useState(true);
  
  const { requireWalletConnection } = useWalletGuard();
  const { createBill, isLoading, isConfirming, isSuccess, error, reset } = useBillSplitter();

  const form = useForm<BillCreationFormData>({
    resolver: zodResolver(billCreationSchema),
    defaultValues: {
      title: '',
      description: '',
      totalAmount: '',
      token: TOKEN_OPTIONS[1].value, // Default to USDC
      splitMode: SplitMode.EQUAL,
      category: 'food',
    },
  });

  const watchedValues = form.watch();
  const splitMode = watchedValues.splitMode;
  const totalAmount = watchedValues.totalAmount;

  // Reset shares when split mode changes
  useEffect(() => {
    setParticipantShares([]);
    setIsCalculationValid(splitMode === SplitMode.EQUAL);
  }, [splitMode]);

  // Validate calculation when shares or amount changes
  useEffect(() => {
    if (splitMode === SplitMode.EQUAL) {
      setIsCalculationValid(true);
      return;
    }

    if (participantShares.length === 0) {
      setIsCalculationValid(false);
      return;
    }

    const totalParticipants = selectedFriends.length + 1; // +1 for current user
    if (participantShares.length !== totalParticipants) {
      setIsCalculationValid(false);
      return;
    }

    if (splitMode === SplitMode.PERCENTAGE) {
      setIsCalculationValid(billUtils.validatePercentageShares(participantShares));
    } else if (splitMode === SplitMode.EXACT) {
      const totalAmountBigInt = billUtils.parseAmount(totalAmount || '0');
      setIsCalculationValid(billUtils.validateExactShares(participantShares, totalAmountBigInt));
    }
  }, [participantShares, splitMode, totalAmount, selectedFriends.length]);

  const handleSubmit = async (data: BillCreationFormData) => {
    const canProceed = await requireWalletConnection();
    if (!canProceed) return;

    if (selectedFriends.length === 0) {
      form.setError('root', { message: 'Please select at least one friend' });
      return;
    }

    if (!isCalculationValid) {
      form.setError('root', { message: 'Please fix the split calculation' });
      return;
    }

    try {
      const participants = selectedFriends.map(f => f.address);
      
      await createBill({
        title: data.title,
        description: data.description || '',
        token: data.token as Address,
        totalAmount: data.totalAmount,
        splitMode: data.splitMode,
        category: data.category,
        participants,
        shares: splitMode !== SplitMode.EQUAL ? participantShares : undefined,
      });
    } catch (err) {
      console.error('Failed to create bill:', err);
    }
  };

  // Handle successful bill creation
  useEffect(() => {
    if (isSuccess) {
      // TODO: Extract bill ID from transaction logs
      onSuccess?.(BigInt(1)); // Placeholder
      form.reset();
      setSelectedFriends([]);
      setParticipantShares([]);
      reset();
    }
  }, [isSuccess, onSuccess, form, reset]);

  const getSelectedToken = () => {
    return TOKEN_OPTIONS.find(t => t.value === watchedValues.token);
  };

  const calculatePreview = () => {
    if (!totalAmount || selectedFriends.length === 0) return null;

    const totalParticipants = selectedFriends.length + 1;
    const amount = Number(totalAmount);
    const selectedToken = getSelectedToken();

    if (splitMode === SplitMode.EQUAL) {
      const perPerson = amount / totalParticipants;
      return {
        perPerson: perPerson.toFixed(2),
        currency: selectedToken?.symbol || 'TOKEN',
      };
    }

    return null;
  };

  const preview = calculatePreview();

  return (
    <div className={`px-1 sm:px-0 ${className}`}>
      {/* Compact Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-goal-primary rounded-xl flex items-center justify-center">
          <Receipt className="w-4 h-4 text-goal-text" />
        </div>
        <div>
          <h2 className="text-lg font-fredoka font-bold text-goal-text">
            Create New Bill
          </h2>
          <p className="text-xs text-goal-text/70 font-inter">
            Split expenses with friends easily
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 px-1 sm:px-0">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="font-fredoka font-semibold text-goal-text flex items-center gap-2 text-sm">
              <Receipt className="w-4 h-4" />
              Bill Details
            </h3>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-fredoka font-medium text-goal-text text-sm">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Dinner at Restaurant"
                      className="bg-white/60 border-goal-border/30 rounded-xl focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text placeholder:text-goal-text/50 h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-fredoka font-medium text-goal-text text-sm">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the bill..."
                      className="bg-white/60 border-goal-border/30 rounded-xl focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text placeholder:text-goal-text/50 resize-none min-h-[60px]"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="font-fredoka font-medium text-goal-text text-sm">Total Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goal-text/50" />
                        <Input
                          placeholder="0.00"
                          className="bg-white/60 border-goal-border/30 rounded-xl focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text placeholder:text-goal-text/50 h-9 pl-10"
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="font-fredoka font-medium text-goal-text text-sm">Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/60 border-goal-border/30 rounded-xl focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text h-9">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TOKEN_OPTIONS.map((token) => (
                          <SelectItem key={token.value} value={token.value}>
                            {token.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-fredoka font-medium text-goal-text text-sm">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/60 border-goal-border/30 rounded-xl focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text h-9">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BILL_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="bg-goal-border/20" />

          {/* Participants */}
          <div className="space-y-3">
            <h3 className="font-fredoka font-semibold text-goal-text flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              Participants
            </h3>

            <FriendSearch
              selectedFriends={selectedFriends}
              onSelectionChange={setSelectedFriends}
              placeholder="Search and select friends..."
            />
          </div>

          <Separator className="bg-goal-border/20" />

          {/* Split Configuration */}
          <div className="space-y-3">
            <h3 className="font-fredoka font-semibold text-goal-text flex items-center gap-2 text-sm">
              <Calculator className="w-4 h-4" />
              Split Method
            </h3>

            <FormField
              control={form.control}
              name="splitMode"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-fredoka font-medium text-goal-text text-sm">How to split the bill?</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger className="bg-white/60 border-goal-border/30 rounded-xl focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text h-9">
                        <SelectValue placeholder="Select split method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SplitMode.EQUAL.toString()}>
                        <div className="font-inter">
                          <div className="font-medium">Equal Split</div>
                          <div className="text-xs text-goal-text/60">Everyone pays the same amount</div>
                        </div>
                      </SelectItem>
                      <SelectItem value={SplitMode.PERCENTAGE.toString()}>
                        <div className="font-inter">
                          <div className="font-medium">Percentage Split</div>
                          <div className="text-xs text-goal-text/60">Custom percentages for each person</div>
                        </div>
                      </SelectItem>
                      <SelectItem value={SplitMode.EXACT.toString()}>
                        <div className="font-inter">
                          <div className="font-medium">Exact Amount</div>
                          <div className="text-xs text-goal-text/60">Specific amounts for each person</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Split Calculator */}
            {selectedFriends.length > 0 && totalAmount && (
              <div className="bg-white/40 backdrop-blur-sm border border-goal-border/20 rounded-xl p-3">
                <SplitCalculator
                  splitMode={splitMode}
                  totalAmount={totalAmount}
                  participants={selectedFriends}
                  currency={getSelectedToken()?.symbol || 'TOKEN'}
                  onSharesChange={setParticipantShares}
                  isValid={isCalculationValid}
                />
              </div>
            )}

            {/* Preview */}
            {preview && splitMode === SplitMode.EQUAL && (
              <div className="bg-goal-accent/30 border border-goal-border/20 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-fredoka font-medium text-goal-text">
                    Amount per person:
                  </span>
                  <Badge variant="secondary" className="bg-goal-primary text-goal-text font-fredoka font-bold">
                    {preview.perPerson} {preview.currency}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {(error || form.formState.errors.root) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-inter text-red-600">
                  {form.formState.errors.root?.message ||
                   (error instanceof Error ? error.message : 'Failed to create bill')}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka font-medium rounded-xl h-9"
                disabled={isLoading || isConfirming}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-xl h-9 transition-all duration-300 hover:scale-105"
              disabled={isLoading || isConfirming || !isCalculationValid || selectedFriends.length === 0}
            >
              {isLoading || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="text-sm">{isConfirming ? 'Confirming...' : 'Creating...'}</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Created!</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4 mr-2" />
                  <span className="text-sm">Create Bill</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
