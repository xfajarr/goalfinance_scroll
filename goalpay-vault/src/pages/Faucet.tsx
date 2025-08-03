import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Droplets, 
  Info, 
  ExternalLink, 
  Shield, 
  Clock,
  Zap,
  Users
} from 'lucide-react';
import { USDCFaucet } from '@/components/faucet/USDCFaucet';
import { Container } from '@/components/layout-components';
import { useChainId } from 'wagmi';

const Faucet = () => {
  const chainId = useChainId();
  
  const getNetworkInfo = () => {
    switch (chainId) {
      case 5003:
        return {
          name: 'Mantle Sepolia',
          faucetUrl: 'https://faucet.testnet.mantle.xyz',
          explorerUrl: 'https://sepolia.mantlescan.xyz'
        };
      case 84532:
        return {
          name: 'Base Sepolia',
          faucetUrl: 'https://faucet.quicknode.com/base/sepolia',
          explorerUrl: 'https://sepolia.basescan.org'
        };
      case 4202:
        return {
          name: 'Lisk Sepolia',
          faucetUrl: 'https://sepolia-faucet.lisk.com',
          explorerUrl: 'https://sepolia-blockscout.lisk.com'
        };
      default:
        return {
          name: 'Unknown Network',
          faucetUrl: '',
          explorerUrl: ''
        };
    }
  };
  
  const networkInfo = getNetworkInfo();
  
  return (
    <div className="min-h-screen bg-goal-bg">
      {/* Header */}
      <Container size="xl" className="pt-10 pb-6 lg:pt-16 lg:pb-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-goal-primary/20 rounded-full flex items-center justify-center">
              <Droplets className="w-8 h-8 text-goal-primary" />
            </div>
          </div>
          <h1 className="text-goal-heading text-4xl md:text-5xl lg:text-6xl font-fredoka font-bold mb-4">
            USDC Faucet
          </h1>
          <p className="text-goal-text-secondary text-lg md:text-xl font-inter max-w-2xl mx-auto">
            Get free test USDC tokens to start using GoalFi on {networkInfo.name}
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-goal-accent/60 text-goal-text-primary">
              <Shield className="w-3 h-3 mr-1" />
              Testnet Only
            </Badge>
            <Badge variant="secondary" className="bg-goal-soft/60 text-goal-text-secondary">
              <Clock className="w-3 h-3 mr-1" />
              24h Cooldown
            </Badge>
          </div>
        </div>
      </Container>

      <Container size="lg" className="space-y-8">
        {/* Main Faucet Component */}
        <div className="max-w-2xl mx-auto">
          <USDCFaucet />
        </div>
        
        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* How it Works */}
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-goal-heading font-fredoka font-bold text-lg">How it Works</h3>
            </div>
            <div className="space-y-3 text-goal-text-secondary font-inter text-sm">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-goal-primary/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-goal-primary text-xs font-bold">1</span>
                </div>
                <p>Connect your wallet to the faucet</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-goal-primary/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-goal-primary text-xs font-bold">2</span>
                </div>
                <p>Click "Claim USDC" to receive 1,000 test USDC</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-goal-primary/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-goal-primary text-xs font-bold">3</span>
                </div>
                <p>Wait 24 hours before claiming again</p>
              </div>
            </div>
          </Card>
          
          {/* Features */}
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-goal-heading font-fredoka font-bold text-lg">Features</h3>
            </div>
            <div className="space-y-3 text-goal-text-secondary font-inter text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-goal-primary rounded-full"></div>
                <p>1,000 USDC per claim</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-goal-primary rounded-full"></div>
                <p>24-hour cooldown period</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-goal-primary rounded-full"></div>
                <p>Real-time balance updates</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-goal-primary rounded-full"></div>
                <p>Transaction confirmation</p>
              </div>
            </div>
          </Card>
          
          {/* Use Cases */}
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-goal-heading font-fredoka font-bold text-lg">Use Cases</h3>
            </div>
            <div className="space-y-3 text-goal-text-secondary font-inter text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-goal-primary rounded-full"></div>
                <p>Create savings goals</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-goal-primary rounded-full"></div>
                <p>Join group savings circles</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-goal-primary rounded-full"></div>
                <p>Test DeFi features</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-goal-primary rounded-full"></div>
                <p>Practice with mock transactions</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Additional Resources */}
        <Card className="bg-goal-accent/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-2xl">
          <div className="text-center">
            <h3 className="text-goal-heading font-fredoka font-bold text-xl mb-4">
              Need More Resources?
            </h3>
            <p className="text-goal-text-secondary font-inter mb-6">
              Get native tokens for gas fees and explore other testnet resources
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {networkInfo.faucetUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(networkInfo.faucetUrl, '_blank')}
                  className="border-goal-border/30 hover:bg-goal-soft/30"
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  {networkInfo.name} Faucet
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              )}
              
              {networkInfo.explorerUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(networkInfo.explorerUrl, '_blank')}
                  className="border-goal-border/30 hover:bg-goal-soft/30"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Block Explorer
                </Button>
              )}
            </div>
          </div>
        </Card>
        
        {/* Warning */}
        <Card className="bg-orange-50/60 backdrop-blur-sm border-orange-200/30 p-6 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mt-1">
              <Info className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h4 className="text-orange-800 font-fredoka font-bold text-lg mb-2">
                Important Notice
              </h4>
              <p className="text-orange-700 font-inter text-sm">
                This faucet provides test tokens for development and testing purposes only. 
                These tokens have no real value and should not be used on mainnet. 
                Always verify you're on a testnet before claiming tokens.
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Faucet;
