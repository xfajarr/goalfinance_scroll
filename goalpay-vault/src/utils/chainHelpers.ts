import { mantleSepolia, baseSepolia, liskSepolia } from '../config/wagmi';
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
    id: liskSepolia.id,
    name: liskSepolia.name,
    displayName: 'Lisk Sepolia',
    isTestnet: true,
    logoUrl: '/lisk-logo.svg',
    nativeCurrency: liskSepolia.nativeCurrency,
  },
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
    [liskSepolia.id]: liskSepolia,
    [mantleSepolia.id]: mantleSepolia,
  };

  return chains[chainId];
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

// Native token utilities
export interface NativeTokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
  displayName: string;
}

export const getNativeTokenInfo = (chainId: number): NativeTokenInfo => {
  const chainInfo = getChainDisplayInfo(chainId);

  if (!chainInfo) {
    // Fallback to default chain
    const defaultChain = getDefaultChain();
    return {
      symbol: defaultChain.nativeCurrency.symbol,
      name: defaultChain.nativeCurrency.name,
      decimals: defaultChain.nativeCurrency.decimals,
      logoUrl: defaultChain.logoUrl,
      displayName: `${defaultChain.nativeCurrency.symbol} (Native)`,
    };
  }

  return {
    symbol: chainInfo.nativeCurrency.symbol,
    name: chainInfo.nativeCurrency.name,
    decimals: chainInfo.nativeCurrency.decimals,
    logoUrl: chainInfo.logoUrl,
    displayName: `${chainInfo.nativeCurrency.symbol} (Native)`,
  };
};

export const getNativeTokenSymbol = (chainId: number): string => {
  return getNativeTokenInfo(chainId).symbol;
};

export const getNativeTokenLogo = (chainId: number): string => {
  return getNativeTokenInfo(chainId).logoUrl;
};

export const getNativeTokenDisplayName = (chainId: number): string => {
  return getNativeTokenInfo(chainId).displayName;
};

// Token utilities
export const getTokenSymbol = (tokenAddress: string, chainId: number): string => {
  // Check if it's the native token
  if (tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    return getNativeTokenSymbol(chainId);
  }

  // For now, assume USDC for other tokens - this could be expanded
  // to include a token registry in the future
  return 'USDC';
};

export const getTokenLogo = (tokenAddress: string, chainId: number): string => {
  // Check if it's the native token
  if (tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    return getNativeTokenLogo(chainId);
  }

  // For USDC
  return '/usdc-logo.svg';
};

export const getTokenDisplayName = (tokenAddress: string, chainId: number): string => {
  // Check if it's the native token
  if (tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    return getNativeTokenDisplayName(chainId);
  }

  // For USDC
  return 'USDC';
};