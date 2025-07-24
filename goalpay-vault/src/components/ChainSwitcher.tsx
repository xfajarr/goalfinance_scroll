import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { useChainManagement } from '@/hooks/useChainManagement';
import { SUPPORTED_CHAINS } from '@/utils/chainHelpers';
import { cn } from '@/lib/utils';

interface ChainSwitcherProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ChainSwitcher({
  className = '',
  variant = 'outline',
  size = 'default'
}: ChainSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    currentChain,
    isSupported,
    isConnected,
    switchToChain,
    isSwitching,
  } = useChainManagement();

  // Don't show anything if wallet is not connected
  if (!isConnected) {
    return null;
  }

  const isUnsupportedChain = !isSupported;

  const handleChainSwitch = async (chainId: number) => {
    try {
      await switchToChain(chainId);
      setIsOpen(false);
    } catch (error) {
      // Error is already logged in the hook
      // Could add toast notification here if needed
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            className,
            isUnsupportedChain && 'border-red-500 text-red-600 bg-red-50 hover:bg-red-100'
          )}
          disabled={isSwitching}
        >
          <div className="flex items-center space-x-2">
            {isUnsupportedChain ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="font-medium">Wrong Network</span>
              </>
            ) : currentChain ? (
              <>
                <img
                  src={currentChain.logoUrl}
                  alt={currentChain.displayName}
                  className="w-5 h-5"
                />
                <span className="hidden sm:inline">{currentChain.displayName}</span>
                <span className="sm:hidden">{currentChain.name}</span>
              </>
            ) : (
              <span className="font-medium">Select Network</span>
            )}
            <ChevronDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {SUPPORTED_CHAINS.map((chain) => {
          const isCurrentChain = currentChain?.id === chain.id;

          return (
            <DropdownMenuItem
              key={chain.id}
              onClick={() => handleChainSwitch(chain.id)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isSwitching}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={chain.logoUrl}
                  alt={chain.displayName}
                  className="w-5 h-5"
                />
                <div className="flex flex-col">
                  <span className="font-medium">{chain.displayName}</span>
                  {chain.isTestnet && (
                    <span className="text-xs text-muted-foreground">Testnet</span>
                  )}
                </div>
              </div>

              {isCurrentChain && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </DropdownMenuItem>
          );
        })}

        {isUnsupportedChain && (
          <>
            <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
              Current Network
            </div>
            <DropdownMenuItem disabled className="flex items-center space-x-3">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <div className="flex flex-col">
                <span className="font-medium text-red-600">Unsupported Network</span>
                <span className="text-xs text-muted-foreground">
                  Please switch to Mantle Sepolia
                </span>
              </div>
            </DropdownMenuItem>
            <div className="px-2 py-2 border-t">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-orange-800 mb-1">Network Warning</p>
                    <p className="text-orange-700">
                      Goal Finance only supports Mantle Sepolia. Please switch to continue using the platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for mobile/small spaces
export function ChainSwitcherCompact({ className = '' }: { className?: string }) {
  return (
    <ChainSwitcher
      className={className}
      variant="ghost"
      size="sm"
    />
  );
}
