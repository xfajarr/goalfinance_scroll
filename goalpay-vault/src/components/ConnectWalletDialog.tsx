
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Check, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConnectWalletDialogProps {
  children: React.ReactNode;
}

export const ConnectWalletDialog = ({ children }: ConnectWalletDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [alertState, setAlertState] = useState<{
    open: boolean;
    type: 'success' | 'error';
    title: string;
    description: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    description: ''
  });
  const { toast } = useToast();

  const connectWallet = async () => {
    setIsConnecting(true);

    try {
      // Mock wallet connection - replace with actual Web3 logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.3;
      
      if (success) {
        setAlertState({
          open: true,
          type: 'success',
          title: 'Wallet Connected Successfully!',
          description: 'Your wallet has been connected and you can now start saving with goalpay.'
        });
        toast({
          title: "Wallet Connected",
          description: "Your wallet is now connected to goalpay.",
        });
        setIsOpen(false);
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setAlertState({
        open: true,
        type: 'error',
        title: 'Connection Failed',
        description: 'Unable to connect to your wallet. Please try again or contact support if the issue persists.'
      });
      toast({
        title: "Connection Failed",
        description: "Unable to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-goal-border/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-fredoka text-goal-text">
              <div className="w-8 h-8 bg-goal-primary rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-goal-text" />
              </div>
              Connect Your Wallet
            </DialogTitle>
            <DialogDescription className="font-inter text-goal-text/70">
              Connect your Web3 wallet to start saving and earning yield on your goals with goalpay.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-inter rounded-xl"
              >
                {isConnecting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-goal-text/30 border-t-goal-text rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    MetaMask
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="border-goal-border text-goal-text hover:bg-goal-accent rounded-xl"
              >
                <Wallet className="w-4 h-4 mr-2" />
                WalletConnect
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-xs font-inter text-goal-text/60">
              <AlertCircle className="w-3 h-3" />
              <span>Secure connection with industry-standard encryption</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertState.open} onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-goal-border/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-fredoka">
              {alertState.type === 'success' ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
              {alertState.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-inter text-goal-text/70">
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text rounded-xl">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
