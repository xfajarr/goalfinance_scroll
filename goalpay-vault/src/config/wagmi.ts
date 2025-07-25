import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { baseSepolia } from 'viem/chains';

// Define Mantle Sepolia testnet with multiple RPC endpoints
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
      http: [
        'https://mantle-sepolia.infura.io/v3/694a8404d98e4fb5a6c806e394dc4fb3',
        'https://rpc.sepolia.mantle.xyz',
        'https://mantle-sepolia.drpc.org',
        'https://mantle-sepolia-testnet.rpc.thirdweb.com',
        'https://sepolia.mantle.xyz',
      ],
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

// Define the chains we want to support - Mantle Sepolia and Base Sepolia
const chains = [mantleSepolia, baseSepolia] as const;

// Get the Wagmi configuration for Privy with enhanced RPC handling
export const config = createConfig({
  chains,
  transports: {
    [mantleSepolia.id]: http(undefined, {
      // Retry configuration for rate limiting
      retryCount: 3,
      retryDelay: 2000, // 2 second delay between retries
      timeout: 15000, // 15 second timeout
    }),
    [baseSepolia.id]: http(undefined, {
      retryCount: 3,
      retryDelay: 2000,
      timeout: 15000,
    }),
  },
});

// Export type for supported chains
export type SupportedChain = typeof chains[number];

// Contract addresses - Support for both Mantle Sepolia and Base Sepolia
export const CONTRACT_ADDRESSES = {
  [mantleSepolia.id]: {
    GOAL_FINANCE: '0xaCCB3947D19266D257Afc253D0DA9B4FB5810CAf', // GoalFinance V2 contract on Mantle Sepolia
    USDC: '0x77B2693ea846571259FA89CBe4DD8e18f3F61787', // MockUSDC on Mantle Sepolia
  },
  [baseSepolia.id]: {
    GOAL_FINANCE: '0x0000000000000000000000000000000000000000', // TODO: Deploy contract to Base Sepolia
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
  },
} as const;

// Default chain for development
export const DEFAULT_CHAIN = mantleSepolia;

// Export chains for use in other files
export { baseSepolia };
