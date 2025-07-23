import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';

// Define Mantle Sepolia testnet
export const mantleSepolia = defineChain({
  id: 5003,
  name: 'Mantle Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Sepolia Explorer',
      url: 'https://sepolia.mantlescan.xyz',
    },
  },
  testnet: true,
});

// Define the chains we want to support - Only Mantle Sepolia
const chains = [mantleSepolia] as const;

// Get the Wagmi configuration for Privy
export const config = createConfig({
  chains,
  transports: {
    [mantleSepolia.id]: http(),
  },
});

// Export type for supported chains
export type SupportedChain = typeof chains[number];

// Contract addresses - Only Mantle Sepolia supported
export const CONTRACT_ADDRESSES = {
  [mantleSepolia.id]: {
    GOAL_FINANCE: '0xaCCB3947D19266D257Afc253D0DA9B4FB5810CAf', // GoalFinance V2 contract on Mantle Sepolia
    USDC: '0x77B2693ea846571259FA89CBe4DD8e18f3F61787', // MockUSDC on Mantle Sepolia
  },
} as const;

// Default chain for development
export const DEFAULT_CHAIN = mantleSepolia;
