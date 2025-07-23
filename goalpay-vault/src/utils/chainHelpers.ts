import { mantleSepolia, baseSepolia } from '../config/wagmi';

export const getChainById = (chainId: number) => {
  const chains = {
    [mantleSepolia.id]: mantleSepolia,
    [baseSepolia.id]: baseSepolia
  };
  
  return chains[chainId] || mantleSepolia;
};

export const getSupportedChainIds = (): number[] => {
  return [mantleSepolia.id, baseSepolia.id];
};

export const isChainSupported = (chainId: number): boolean => {
  return getSupportedChainIds().includes(chainId);
};