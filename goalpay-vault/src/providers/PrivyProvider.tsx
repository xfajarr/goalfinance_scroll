import React from 'react';
import { PrivyProvider as PrivyProviderCore } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config, mantleSepolia, baseSepolia, liskSepolia } from '@/config/wagmi';

// Create a single QueryClient instance to avoid duplicate initialization
let queryClientInstance: QueryClient | null = null;

const getQueryClient = () => {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          retry: 3,
        },
      },
    });
  }
  return queryClientInstance;
};

// Get Privy App ID from environment or fallback
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'cmd87c3bk0063lb0mssxa5y1m';

// WalletConnect Project ID (only set if explicitly provided)
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  
  // Note: The "PrivyProvider already initialized" warning in development is expected
  // due to React StrictMode double-rendering. This is normal and doesn't affect production.

  return (
    <PrivyProviderCore
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet', 'email', 'google', 'telegram', 'farcaster'],

        // Customize Privy's appearance
        appearance: {
          theme: 'light',
          accentColor: '#8B5CF6',
          logo: '/goal_finance_icon_png.png',
          showWalletLoginFirst: true,
          walletChainType: 'ethereum-only',
          landingHeader: 'Welcome to Goal Finance',
          loginMessage: 'Sign in to create your dreams come true!',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        supportedChains: [mantleSepolia, baseSepolia, liskSepolia],
        defaultChain: liskSepolia,

        // Only include WalletConnect config if project ID is provided
        // This prevents duplicate initialization warnings
        ...(WALLETCONNECT_PROJECT_ID ? {
          walletConnectCloudProjectId: WALLETCONNECT_PROJECT_ID,
        } : {}),

        // Configure external wallets to handle chain compatibility
        externalWallets: {
          coinbaseWallet: {
            // Use eoaOnly to avoid Smart Wallet issues with unsupported chains
            connectionOptions: 'eoaOnly',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProviderCore>
  );
}
