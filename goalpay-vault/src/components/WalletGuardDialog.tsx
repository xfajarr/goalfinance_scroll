import { usePrivy } from '@privy-io/react-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletGuardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  actionText?: string;
}

export const WalletGuardDialog = ({ 
  isOpen, 
  onOpenChange,
  title = "Connect Your Wallet",
  description = "You need to connect your wallet to perform this action. Connect now to continue with GoalFi!",
  actionText = "Create Vault"
}: WalletGuardDialogProps) => {
  const { login, ready } = usePrivy();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await login();
      onOpenChange(false);
      toast({
        title: "🎉 Wallet Connected!",
        description: "Your wallet is now connected. You can continue with your action.",
        className: 'top-4 right-4 bg-goal-primary text-goal-text border-goal-primary shadow-lg',
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-goal-border/30 rounded-xl">
        <DialogHeader className="text-center">
          <DialogTitle className="flex flex-col items-center gap-3 font-fredoka text-goal-text">
            <div className="w-16 h-16 bg-gradient-to-br from-goal-primary to-purple-500 rounded-full flex items-center justify-center relative">
              <Wallet className="w-8 h-8 text-goal-text" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-yellow-800" />
              </div>
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="font-inter text-goal-text text-center mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Action Preview */}
          <div className="bg-gradient-to-r from-goal-primary/10 to-purple-100 border border-goal-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-goal-primary/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-goal-primary" />
              </div>
              <div>
                <p className="font-inter font-medium text-goal-text text-sm">
                  Ready to {actionText.toLowerCase()}?
                </p>
                <p className="font-inter text-goal-text/70 text-xs">
                  Connect your wallet to get started
                </p>
              </div>
            </div>
          </div>

          {/* Connect Button */}
          <Button
            onClick={handleConnect}
            disabled={!ready}
            className="w-full bg-gradient-to-r from-goal-primary to-purple-500 hover:from-goal-primary/90 hover:to-purple-500/90 text-goal-text font-fredoka font-semibold rounded-xl py-3 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            {!ready ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-goal-text/30 border-t-goal-text rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>

          {/* Security Note */}
          <div className="flex items-center justify-center space-x-2 text-xs font-inter text-goal-text/60">
            <AlertCircle className="w-3 h-3" />
            <span>Secure connection with industry-standard encryption</span>
          </div>

          {/* Cancel Button */}
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full border-goal-border text-goal-text hover:bg-goal-accent rounded-xl"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
