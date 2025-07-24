import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useChainManagement } from '@/hooks/useChainManagement';

// Extended chain info for display purposes
const CHAIN_DISPLAY_EXTRAS = {
  [5003]: { // Mantle Sepolia
    icon: '🔷',
    color: 'bg-blue-500',
  },
} as const;

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
  const { currentChain, isSupported } = useChainManagement();
  const isUnsupportedChain = !isSupported;

  if (isUnsupportedChain) {
    return (
      <Badge variant="destructive" className={`${className} flex items-center space-x-1`}>
        <AlertCircle className="w-3 h-3" />
        <span>Unsupported Network</span>
      </Badge>
    );
  }

  if (!currentChain) {
    return null;
  }

  const chainExtras = CHAIN_DISPLAY_EXTRAS[currentChain.id as keyof typeof CHAIN_DISPLAY_EXTRAS];

  return (
    <Badge variant={variant} className={`${className} flex items-center space-x-1`}>
      <CheckCircle className="w-3 h-3 text-green-500" />
      {showIcon && chainExtras && <span>{chainExtras.icon}</span>}
      {showName && <span>{currentChain.displayName}</span>}
    </Badge>
  );
}

// Compact version that only shows the icon and status
export function ChainIndicatorCompact({ className = '' }: { className?: string }) {
  const { currentChain, isSupported } = useChainManagement();
  const isUnsupportedChain = !isSupported;

  if (isUnsupportedChain) {
    return (
      <div className={`${className} flex items-center space-x-1 text-red-500`}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">Unsupported</span>
      </div>
    );
  }

  if (!currentChain) {
    return null;
  }

  const chainExtras = CHAIN_DISPLAY_EXTRAS[currentChain.id as keyof typeof CHAIN_DISPLAY_EXTRAS];

  return (
    <div className={`${className} flex items-center space-x-1 text-green-500`}>
      <CheckCircle className="w-4 h-4" />
      {chainExtras && <span className="text-lg">{chainExtras.icon}</span>}
    </div>
  );
}
