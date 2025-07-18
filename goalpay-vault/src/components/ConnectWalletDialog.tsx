
import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Check, AlertCircle, X, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConnectWalletDialogProps {
  children: React.ReactNode;
}

export const ConnectWalletDialog = ({ children }: ConnectWalletDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { login, logout, ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  // If user is authenticated and connected, show wallet info instead of connect button
  if (authenticated && isConnected && address) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-goal-border/30 rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-fredoka text-goal-text">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              Wallet Connected
            </DialogTitle>
            <DialogDescription className="font-inter text-goal-text">
              Your wallet is connected and ready to use with goalpay.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-goal-accent/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-inter text-sm font-medium text-goal-text">Connected Address</p>
                  <p className="font-mono text-xs text-goal-text break-all">
                    {address}
                  </p>
                  {user?.email && (
                    <p className="font-inter text-xs text-goal-text/70 mt-1">
                      {user.email.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-goal-primary hover:bg-goal-primary/90 text-goal-text rounded-xl"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  disconnect();
                  logout();
                  setIsOpen(false);
                  toast({
                    title: "Wallet Disconnected",
                    description: "Your wallet has been disconnected.",
                  });
                }}
                variant="outline"
                className="flex-1 border-goal-border text-goal-text hover:bg-goal-accent rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleConnect = async () => {
    try {
      await login();
      setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-goal-border/30 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-fredoka text-goal-text">
            <div className="w-8 h-8 bg-goal-primary rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-goal-text" />
            </div>
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription className="font-inter text-goal-text">
            Connect your wallet to start saving and achieving your goals with Goal Finance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={handleConnect}
            disabled={!ready}
            className="w-full bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-inter rounded-xl py-3"
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

          <div className="flex items-center justify-center space-x-2 text-xs font-inter text-goal-text">
            <AlertCircle className="w-3 h-3" />
            <span>Secure connection with industry-standard encryption</span>
          </div>

          <div className="text-center">
            <p className="text-xs font-inter text-goal-text">
              Supports MetaMask, WalletConnect, Coinbase Wallet, and more
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
