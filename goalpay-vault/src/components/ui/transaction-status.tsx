import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionStatusProps {
  txHash: string | null;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const TransactionStatus = ({
  txHash,
  onSuccess,
  onError,
  successMessage = 'Transaction completed successfully!',
  errorMessage = 'Transaction failed. Please try again.',
}: TransactionStatusProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (txHash) {
      setIsVisible(true);
      setIsConfirming(true);
      setIsSuccess(false);
      setIsError(false);

      // Simulate transaction confirmation
      const timer = setTimeout(() => {
        setIsConfirming(false);

        // Simulate success (90% chance)
        if (Math.random() > 0.1) {
          setIsSuccess(true);
          toast({
            title: 'Transaction Confirmed',
            description: successMessage,
          });
          onSuccess?.();
        } else {
          setIsError(true);
          toast({
            title: 'Transaction Failed',
            description: errorMessage,
            variant: 'destructive',
          });
          onError?.(new Error('Transaction failed'));
        }

        // Hide after 5 seconds
        setTimeout(() => setIsVisible(false), 5000);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [txHash, successMessage, errorMessage, onSuccess, onError, toast]);

  if (!isVisible || !txHash) {
    return null;
  }

  const getExplorerUrl = (hash: string) => {
    // This should be dynamic based on the current chain
    return `https://etherscan.io/tx/${hash}`;
  };

  return (
    <Card className="fixed top-4 right-4 z-50 p-3 bg-white/95 backdrop-blur-sm border-goal-border/40 rounded-lg shadow-xl max-w-sm animate-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isConfirming && (
            <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          )}
          {isSuccess && <CheckCircle className="w-5 h-5 text-green-600" />}
          {isError && <XCircle className="w-5 h-5 text-red-600" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-fredoka font-bold text-goal-text text-sm">
              {isConfirming && '⏳ Confirming Transaction...'}
              {isSuccess && '✅ Transaction Confirmed'}
              {isError && '❌ Transaction Failed'}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-auto p-1 text-goal-text/60 hover:text-goal-text rounded-full"
            >
              ×
            </Button>
          </div>

          <p className="font-inter text-xs text-goal-text/80 mb-3 font-medium">
            {isConfirming && 'Please wait while your transaction is being confirmed on the blockchain.'}
            {isSuccess && successMessage}
            {isError && errorMessage}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getExplorerUrl(txHash), '_blank')}
              className="text-xs border-goal-primary/60 hover:bg-goal-primary/10 rounded-lg font-semibold"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View on Explorer
            </Button>

            {isConfirming && (
              <div className="flex items-center gap-1 text-xs text-goal-text/70 font-medium">
                <Clock className="w-3 h-3" />
                <span>~30s</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
