
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, Check, AlertCircle } from 'lucide-react';

const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Mock wallet connection - replace with actual Web3 logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock wallet address
      const mockAddress = '0x742d35Cc6663C82C0532e4F2b7d848';
      setWalletAddress(mockAddress);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-inter font-semibold text-goal-text text-sm">
                {truncateAddress(walletAddress)}
              </p>
              <p className="font-inter text-goal-text/70 text-xs">Connected</p>
            </div>
          </div>
          <Button
            onClick={disconnectWallet}
            variant="outline"
            size="sm"
            className="border-goal-border text-goal-text hover:bg-goal-accent rounded-full"
          >
            Disconnect
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-goal-primary rounded-3xl flex items-center justify-center mx-auto">
          <Wallet className="w-8 h-8 text-goal-text" />
        </div>
        
        <div>
          <h3 className="font-fredoka font-bold text-goal-text text-lg mb-2">
            Connect Your Wallet
          </h3>
          <p className="font-inter text-goal-text/70 text-sm">
            Connect your Web3 wallet to start saving and earning yield on your goals
          </p>
        </div>

        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-2xl py-3 transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
        >
          {isConnecting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-goal-text/30 border-t-goal-text rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            'Connect Wallet'
          )}
        </Button>

        <div className="flex items-center justify-center space-x-2 text-xs font-inter text-goal-text/60">
          <AlertCircle className="w-3 h-3" />
          <span>Supports MetaMask, WalletConnect, and more</span>
        </div>
      </div>
    </Card>
  );
};

export default WalletConnect;
