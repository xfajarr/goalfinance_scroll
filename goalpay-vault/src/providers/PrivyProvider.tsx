import React from 'react';
import { PrivyProvider as PrivyProviderCore } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mantleSepolia } from '@/config/wagmi';
import { sepolia, baseSepolia, arbitrumSepolia } from 'viem/chains';

// Create wagmi config for Privy integration
const config = createConfig({
  chains: [mantleSepolia, sepolia, baseSepolia, arbitrumSepolia],
  transports: {
    [mantleSepolia.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

// Get Privy App ID from environment variables
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'cmd87c3bk0063lb0mssxa5y1m';

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
          logo: '/goal-finance-logo.png',
          showWalletLoginFirst: true,
          walletChainType: 'ethereum-only',
          landingHeader: 'Welcome to Goal Finance',
          loginMessage: 'Sign in to create your dreams',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        supportedChains: [mantleSepolia, baseSepolia],
        defaultChain: mantleSepolia,
        mfa: {
          noPromptOnMfaRequired: false,
        },
        walletConnectCloudProjectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
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
