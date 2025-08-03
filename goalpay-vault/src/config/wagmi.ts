import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { baseSepolia, liskSepolia } from 'viem/chains';

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
        'https://rpc.sepolia.mantle.xyz',
        'https://mantle-sepolia.g.alchemy.com/public',
        'https://endpoints.omniatech.io/v1/mantle/sepolia/public',
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

// Define the chains we want to support - Mantle Sepolia, Base Sepolia, and Lisk Sepolia
const chains = [mantleSepolia, baseSepolia, liskSepolia] as const;

// Get the Wagmi configuration for Privy with enhanced RPC handling
export const config = createConfig({
  chains,
  transports: {
    [mantleSepolia.id]: http(),
    [baseSepolia.id]: http(undefined, {
      retryCount: 3,
      retryDelay: 2000,
      timeout: 15000,
    }),
    [liskSepolia.id]: http(undefined, {
      retryCount: 3,
      retryDelay: 2000,
      timeout: 15000,
    }),
  },
});

// Export type for supported chains
export type SupportedChain = typeof chains[number];

// Contract addresses - Support for Mantle Sepolia, Base Sepolia, and Lisk Sepolia
export const CONTRACT_ADDRESSES = {
  [mantleSepolia.id]: {
    GOAL_FINANCE: '0xaCCB3947D19266D257Afc253D0DA9B4FB5810CAf', // GoalFinance V2 contract on Mantle Sepolia
    USDC: '0x77B2693ea846571259FA89CBe4DD8e18f3F61787', // MockUSDC on Mantle Sepolia
    USDC_FAUCET: '0x0000000000000000000000000000000000000000', // TODO: Deploy USDCFaucet contract
  },
  [liskSepolia.id]: {
    GOAL_FINANCE: '0xFe03ae72A941dFf0f07ba55b112Df6600Dd9a2f2', // GoalFinance contract on Lisk Sepolia
    BILL_SPLITTER: '0x75346BC0Aa2863CF24423E6dbA2D7374929847DB', // BillSplitter contract on Lisk Sepolia
    FRIENDS_REGISTRY: '0xD102088948108C0024444230CF87A1405986a06A', // FriendsRegistry contract on Lisk Sepolia
    DEBT_MANAGER: '0x7E5d8Bc253523d8E889865C7C0B903aC38346a55', // DebtManager contract on Lisk Sepolia
    USDC: '0x8cCff0834e94BE6C68E30d2949d2f526195cB444', // MockUSDC on Lisk Sepolia
    USDC_FAUCET: '0x0000000000000000000000000000000000000000', // TODO: Deploy USDCFaucet contract
  },
} as const;

// Default chain for development - using Lisk Sepolia for the new contracts
export const DEFAULT_CHAIN = liskSepolia;

// Export chains for use in other files
export { baseSepolia, liskSepolia };
