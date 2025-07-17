import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';

// Define the chains we want to support
const chains = [mainnet, sepolia, hardhat] as const;

// Get the Wagmi configuration
export const config = getDefaultConfig({
  appName: 'GoalPay Vault',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains,
  ssr: false, // If your dApp uses server side rendering (SSR)
});

// Export chain configurations for easy access
export { mainnet, sepolia, hardhat };
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
  [hardhat.id]: {
    VAULT_FACTORY: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default hardhat deployment address
    USDC: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Mock USDC on hardhat
  },
} as const;

// Default chain for development
export const DEFAULT_CHAIN = import.meta.env.DEV ? hardhat : mainnet;
