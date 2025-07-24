import React from 'react';
import { PrivyProvider as PrivyProviderCore } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config, mantleSepolia, baseSepolia } from '@/config/wagmi';

// Create a single QueryClient instance to avoid duplicate initialization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

// Get Privy App ID
const PRIVY_APP_ID = 'cmd87c3bk0063lb0mssxa5y1m';

export function PrivyProvider({ children }: { children: React.ReactNode }) {
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
        supportedChains: [mantleSepolia, baseSepolia],
        defaultChain: mantleSepolia,

        // Wallet configuration to handle unsupported chains gracefully
        walletConnectCloudProjectId: undefined, // Disable WalletConnect to prevent duplicate initialization

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
