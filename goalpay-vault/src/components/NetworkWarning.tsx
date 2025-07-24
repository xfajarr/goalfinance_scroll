import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Network } from 'lucide-react';
import { useRequiredChain } from '@/hooks/useChainManagement';

interface NetworkWarningProps {
  className?: string;
}

export const NetworkWarning = ({ className = '' }: NetworkWarningProps) => {
  const {
    isCorrectChain,
    isConnected,
    switchToRequiredChain,
    isSwitching
  } = useRequiredChain();

  // Only show warning if wallet is connected and not on the correct chain
  if (!isConnected || isCorrectChain) {
    return null;
  }

  const handleSwitchNetwork = () => {
    switchToRequiredChain();
  };

  return (
    <Card className={`p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-inter font-semibold text-goal-text text-sm">
              Unsupported Network
            </h3>
            <p className="font-inter text-xs text-goal-text/80 mt-1">
              Goal Finance is available on Mantle Sepolia and Base Sepolia testnets.
              Please switch to a supported network to continue using the platform.
            </p>
          </div>
          
          <Button
            onClick={handleSwitchNetwork}
            disabled={isSwitching}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white font-inter rounded-lg"
          >
            {isSwitching ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                <span>Switching...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Network className="w-3 h-3" />
                <span>Switch Network</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NetworkWarning;
