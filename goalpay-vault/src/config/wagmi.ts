import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, hardhat, baseSepolia, arbitrumSepolia } from 'wagmi/chains';
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

// Define the chains we want to support
const chains = [mantleSepolia, baseSepolia, arbitrumSepolia, sepolia, hardhat] as const;

// Get the Wagmi configuration for Privy
export const config = createConfig({
  chains,
  transports: {
    [sepolia.id]: http(),
    [hardhat.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [mantleSepolia.id]: http(),
  },
});

// Export chain configurations for easy access
export { mainnet, sepolia, hardhat, baseSepolia, arbitrumSepolia };
export type SupportedChain = typeof chains[number];

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  [mainnet.id]: {
    VAULT_FACTORY: '0x0000000000000000000000000000000000000000', // Replace with actual deployed address
    USDC: '0xA0b86a33E6441b8e8C7C7b0b8b8b8b8b8b8b8b8b', // Real USDC on mainnet
  },
  [sepolia.id]: {
    VAULT_FACTORY: '0x0000000000000000000000000000000000000000', // Replace with actual deployed address
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia testnet
  },
  [baseSepolia.id]: {
    VAULT_FACTORY: '0x0000000000000000000000000000000000000000', // Replace with actual deployed address
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
  },
  [arbitrumSepolia.id]: {
    VAULT_FACTORY: '0x0000000000000000000000000000000000000000', // Replace with actual deployed address
    USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // USDC on Arbitrum Sepolia
  },
  [mantleSepolia.id]: {
    VAULT_FACTORY: '0x8319A4b5c6b0b458bA988161cde98025FbAEE7a3', // Deployed GoalVaultFactory
    USDC: '0x77B2693ea846571259FA89CBe4DD8e18f3F61787', // Deployed MockUSDC
  },
  [hardhat.id]: {
    VAULT_FACTORY: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default hardhat deployment address
    USDC: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Mock USDC on hardhat
  },
} as const;

// Default chain for development
export const DEFAULT_CHAIN = import.meta.env.DEV ? hardhat : mantleSepolia;
