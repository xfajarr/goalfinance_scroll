import { mantleSepolia } from '../config/wagmi';
import type { Chain } from 'viem';

// Types for chain display information
export interface ChainDisplayInfo {
  id: number;
  name: string;
  displayName: string;
  isTestnet: boolean;
  logoUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Supported chains with display information
export const SUPPORTED_CHAINS: readonly ChainDisplayInfo[] = [
  {
    id: mantleSepolia.id,
    name: mantleSepolia.name,
    displayName: 'Mantle Sepolia',
    isTestnet: true,
    logoUrl: '/mantle-mnt-logo.svg',
    nativeCurrency: mantleSepolia.nativeCurrency,
  },
] as const;

// Chain utilities
export const getChainById = (chainId: number): Chain => {
  const chains = {
    [mantleSepolia.id]: mantleSepolia
  };

  return chains[chainId] || mantleSepolia;
};

export const getChainDisplayInfo = (chainId: number): ChainDisplayInfo | undefined => {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
};

export const getSupportedChainIds = (): readonly number[] => {
  return SUPPORTED_CHAINS.map(chain => chain.id);
};

export const isChainSupported = (chainId: number): boolean => {
  return getSupportedChainIds().includes(chainId);
};

export const getDefaultChain = (): ChainDisplayInfo => {
  return SUPPORTED_CHAINS[0];
};