import React from 'react';
import { PrivyProvider as PrivyProviderCore } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mantleSepolia } from '@/config/wagmi';
import { mainnet, sepolia, polygon, arbitrum, optimism, base, avalanche } from 'viem/chains';

// Create wagmi config for Privy integration
// Include multiple chains so wagmi can detect network changes, but only Mantle Sepolia is supported by the app
const config = createConfig({
  chains: [mantleSepolia, mainnet, sepolia, polygon, arbitrum, optimism, base, avalanche],
  transports: {
    [mantleSepolia.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [avalanche.id]: http(),
  },
});

const queryClient = new QueryClient();

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
        supportedChains: [mantleSepolia],
        defaultChain: mantleSepolia,
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
