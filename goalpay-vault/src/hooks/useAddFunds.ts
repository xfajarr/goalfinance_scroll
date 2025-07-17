import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { AddFundsParams, UseAddFundsReturn } from '@/contracts/types';

export const useAddFunds = (): UseAddFundsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { toast } = useToast();

  const addFunds = async ({ vaultId, amount }: AddFundsParams): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      setTxHash(mockTxHash);

      toast({
        title: '🚀 Transaction Submitted',
        description: `Adding $${Number(amount) / 1000000} USDC to vault.`,
        className: 'top-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400 shadow-lg',
      });

      // Simulate confirmation delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: '✅ Funds Added Successfully!',
        description: `Successfully added $${Number(amount) / 1000000} to the vault.`,
        className: 'top-4 right-4 bg-goal-primary text-goal-text border-goal-primary shadow-lg',
      });

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']
      });

    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: '❌ Transaction Failed',
        description: error.message,
        variant: 'destructive',
        className: 'top-4 right-4 bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-400 shadow-lg',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addFunds,
    isLoading,
    error,
    txHash,
  };
};
