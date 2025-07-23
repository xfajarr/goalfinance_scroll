import { mantleSepolia } from '../config/wagmi';

export const getChainById = (chainId: number) => {
  const chains = {
    [mantleSepolia.id]: mantleSepolia
  };
  
  return chains[chainId] || mantleSepolia;
};

export const getSupportedChainIds = (): number[] => {
  return [mantleSepolia.id];
};

export const isChainSupported = (chainId: number): boolean => {
  return getSupportedChainIds().includes(chainId);
};