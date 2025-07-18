import React, { useState } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { mantleSepolia } from '@/config/wagmi';
import { sepolia, baseSepolia, arbitrumSepolia } from 'viem/chains';

// Define supported chains with their display information
const SUPPORTED_CHAINS = [
  {
    ...mantleSepolia,
    displayName: 'Mantle Sepolia',
    isTestnet: true,
  },
  {
    ...baseSepolia,
    displayName: 'Base Sepolia',
    isTestnet: true,
  },
] as const;

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
  const currentChainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);

  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === currentChainId);
  const isUnsupportedChain = !currentChain;

  const handleChainSwitch = async (chainId: number) => {
    try {
      await switchChain({ chainId });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch chain:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`${className} ${isUnsupportedChain ? 'border-red-500 text-red-600' : ''}`}
          disabled={isPending}
        >
          <div className="flex items-center space-x-2">
            {isUnsupportedChain ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Unsupported</span>
              </>
            ) : (
              <>
                <span className="text-lg">{currentChain.icon}</span>
                <span className="hidden sm:inline">{currentChain.displayName}</span>
                <span className="sm:hidden">{currentChain.name}</span>
              </>
            )}
            <ChevronDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {SUPPORTED_CHAINS.map((chain) => {
          const isCurrentChain = chain.id === currentChainId;
          
          return (
            <DropdownMenuItem
              key={chain.id}
              onClick={() => handleChainSwitch(chain.id)}
              className="flex items-center justify-between cursor-pointer"
              disabled={isPending}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{chain.icon}</span>
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
                  Chain ID: {currentChainId}
                </span>
              </div>
            </DropdownMenuItem>
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
