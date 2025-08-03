import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Droplets, 
  Clock, 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useMockUSDCFaucet } from '@/hooks/useMockUSDCFaucet';
import { useAccount, useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { useToast } from '@/hooks/use-toast';

interface USDCFaucetProps {
  className?: string;
}

export const USDCFaucet = ({ className }: USDCFaucetProps) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  const {
    claimFaucet,
    isLoading,
    isConfirming,
    isSuccess,
    error,
    txHash,
    canUseFaucet,
    timeUntilNextFaucet,
    faucetAmount,
    userBalance,
    isLoadingFaucetInfo,
    isLoadingBalance,
    reset,
    refetch
  } = useMockUSDCFaucet();
  
  // Get contract addresses for current chain
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const usdcAddress = contractAddresses?.USDC;
  const faucetAddress = contractAddresses?.USDC_FAUCET;
  
  // Format time remaining
  useEffect(() => {
    if (timeUntilNextFaucet > 0) {
      const hours = Math.floor(timeUntilNextFaucet / 3600);
      const minutes = Math.floor((timeUntilNextFaucet % 3600) / 60);
      const seconds = timeUntilNextFaucet % 60;
      
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    } else {
      setTimeLeft('');
    }
  }, [timeUntilNextFaucet]);
  
  // Update countdown every second
  useEffect(() => {
    if (timeUntilNextFaucet > 0) {
      const interval = setInterval(() => {
        refetch();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [timeUntilNextFaucet, refetch]);
  
  const handleClaimFaucet = async () => {
    try {
      await claimFaucet();
    } catch (error) {
      // Error is already handled in the hook
      console.error('Faucet claim failed:', error);
    }
  };
  
  const copyAddress = () => {
    if (usdcAddress) {
      navigator.clipboard.writeText(usdcAddress);
      toast({
        title: "Address Copied",
        description: "USDC contract address copied to clipboard",
      });
    }
  };
  
  const openExplorer = () => {
    if (txHash && chainId) {
      let explorerUrl = '';
      
      switch (chainId) {
        case 5003: // Mantle Sepolia
          explorerUrl = `https://sepolia.mantlescan.xyz/tx/${txHash}`;
          break;
        case 84532: // Base Sepolia
          explorerUrl = `https://sepolia.basescan.org/tx/${txHash}`;
          break;
        case 4202: // Lisk Sepolia
          explorerUrl = `https://sepolia-blockscout.lisk.com/tx/${txHash}`;
          break;
        default:
          explorerUrl = `https://etherscan.io/tx/${txHash}`;
      }
      
      window.open(explorerUrl, '_blank');
    }
  };
  
  if (!isConnected) {
    return (
      <Card className={`bg-goal-accent/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl ${className}`}>
        <div className="text-center">
          <Wallet className="w-12 h-12 text-goal-text-secondary mx-auto mb-4" />
          <h3 className="text-goal-heading font-fredoka font-bold text-xl mb-2">
            Connect Wallet
          </h3>
          <p className="text-goal-text-secondary font-inter">
            Connect your wallet to access the USDC faucet
          </p>
        </div>
      </Card>
    );
  }
  
  if (!usdcAddress) {
    return (
      <Card className={`bg-goal-accent/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-goal-heading font-fredoka font-bold text-xl mb-2">
            Unsupported Network
          </h3>
          <p className="text-goal-text-secondary font-inter">
            USDC faucet is not available on this network
          </p>
        </div>
      </Card>
    );
  }

  // Check if faucet contract is deployed
  if (!faucetAddress || faucetAddress === '0x0000000000000000000000000000000000000000') {
    return (
      <Card className={`bg-goal-accent/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-goal-heading font-fredoka font-bold text-xl mb-2">
            Faucet Coming Soon
          </h3>
          <p className="text-goal-text-secondary font-inter mb-4">
            The USDC faucet contract is being deployed. Please check back soon!
          </p>
          <div className="bg-goal-soft/30 rounded-lg p-4">
            <p className="text-goal-text-secondary font-inter text-sm">
              <strong>Current Balance:</strong> {isLoadingBalance ? (
                <Loader2 className="w-4 h-4 animate-spin inline ml-1" />
              ) : (
                `${parseFloat(userBalance).toLocaleString()} USDC`
              )}
            </p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={`bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-goal-primary/20 rounded-full flex items-center justify-center">
            <Droplets className="w-6 h-6 text-goal-primary" />
          </div>
          <div>
            <h3 className="text-goal-heading font-fredoka font-bold text-xl">USDC Faucet</h3>
            <p className="text-goal-text-secondary text-sm font-inter">Get free test USDC</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={refetch}
          disabled={isLoadingFaucetInfo}
          className="text-goal-text-secondary hover:text-goal-text"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingFaucetInfo ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* Balance Display */}
      <div className="bg-goal-soft/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-goal-text-secondary text-sm font-inter mb-1">Your Balance</p>
            <p className="text-goal-heading text-2xl font-fredoka font-bold">
              {isLoadingBalance ? (
                <Loader2 className="w-6 h-6 animate-spin inline" />
              ) : (
                `${parseFloat(userBalance).toLocaleString()} USDC`
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-goal-text-secondary text-sm font-inter mb-1">Faucet Amount</p>
            <p className="text-goal-text text-lg font-fredoka font-semibold">
              {faucetAmount} USDC
            </p>
          </div>
        </div>
      </div>
      
      {/* Faucet Status */}
      <div className="mb-6">
        {isLoadingFaucetInfo ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-goal-primary mr-2" />
            <span className="text-goal-text-secondary font-inter">Loading faucet status...</span>
          </div>
        ) : canUseFaucet ? (
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="font-inter font-medium">Faucet available!</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-inter font-medium">Cooldown active</span>
            </div>
            
            {timeLeft && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-700 text-sm font-inter">Time remaining:</span>
                  <span className="text-orange-800 font-fredoka font-bold">{timeLeft}</span>
                </div>
                
                {/* Progress bar for cooldown */}
                <Progress 
                  value={((86400 - timeUntilNextFaucet) / 86400) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Claim Button */}
      <Button
        onClick={handleClaimFaucet}
        disabled={!canUseFaucet || isLoading || isConfirming}
        className="w-full bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold py-3 rounded-xl mb-4"
      >
        {isLoading || isConfirming ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {isLoading ? 'Claiming...' : 'Confirming...'}
          </>
        ) : canUseFaucet ? (
          <>
            <Droplets className="w-4 h-4 mr-2" />
            Claim {faucetAmount} USDC
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 mr-2" />
            Cooldown Active
          </>
        )}
      </Button>
      
      {/* Transaction Status */}
      {isSuccess && txHash && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="font-inter font-medium">Transaction successful!</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={openExplorer}
            className="text-green-600 hover:text-green-700 p-0 h-auto"
          >
            View on Explorer
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-inter font-medium">Error</span>
          </div>
          <p className="text-red-600 text-sm font-inter">{error.message}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-red-600 hover:text-red-700 p-0 h-auto mt-2"
          >
            Try Again
          </Button>
        </div>
      )}
      
      {/* Contract Info */}
      <div className="border-t border-goal-border/20 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-goal-text-secondary text-xs font-inter">Contract:</span>
          <div className="flex items-center gap-2">
            <code className="text-goal-text text-xs font-mono bg-goal-soft/30 px-2 py-1 rounded">
              {usdcAddress.slice(0, 6)}...{usdcAddress.slice(-4)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="p-1 h-auto text-goal-text-secondary hover:text-goal-text"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
