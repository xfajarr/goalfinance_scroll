import React from 'react';
import { useChainId } from 'wagmi';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { mantleSepolia } from '@/config/wagmi';
import { sepolia, baseSepolia, arbitrumSepolia, mantleSepoliaTestnet } from 'viem/chains';

// Define supported chains with their display information
const SUPPORTED_CHAINS = [
  {
    ...mantleSepolia,
    displayName: 'Mantle Sepolia',
    icon: '🔷',
    color: 'bg-blue-500',
  },
  {
    ...baseSepolia,
    displayName: 'Base Sepolia',
    icon: '🔵',
    color: 'bg-blue-600',
  },
  {
    ...arbitrumSepolia,
    displayName: 'Arbitrum Sepolia',
    icon: '🔺',
    color: 'bg-blue-400',
  },
] as const;

interface ChainIndicatorProps {
  className?: string;
  showIcon?: boolean;
  showName?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

export function ChainIndicator({ 
  className = '',
  showIcon = true,
  showName = true,
  variant = 'outline'
}: ChainIndicatorProps) {
  const currentChainId = useChainId();
  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === currentChainId);
  const isUnsupportedChain = !currentChain;

  if (isUnsupportedChain) {
    return (
      <Badge variant="destructive" className={`${className} flex items-center space-x-1`}>
        <AlertCircle className="w-3 h-3" />
        <span>Unsupported Network</span>
      </Badge>
    );
  }

  return (
    <Badge variant={variant} className={`${className} flex items-center space-x-1`}>
      <CheckCircle className="w-3 h-3 text-green-500" />
      {showIcon && <span>{currentChain.icon}</span>}
      {showName && <span>{currentChain.displayName}</span>}
    </Badge>
  );
}

// Compact version that only shows the icon and status
export function ChainIndicatorCompact({ className = '' }: { className?: string }) {
  const currentChainId = useChainId();
  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === currentChainId);
  const isUnsupportedChain = !currentChain;

  if (isUnsupportedChain) {
    return (
      <div className={`${className} flex items-center space-x-1 text-red-500`}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">Unsupported</span>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center space-x-1 text-green-500`}>
      <CheckCircle className="w-4 h-4" />
      <span className="text-lg">{currentChain.icon}</span>
    </div>
  );
}

// Hook to get current chain information
export function useCurrentChain() {
  const currentChainId = useChainId();
  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === currentChainId);
  
  return {
    chain: currentChain,
    isSupported: !!currentChain,
    chainId: currentChainId,
  };
}
