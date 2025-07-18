# Privy Setup Guide

This guide will help you set up Privy authentication for the GoalFi application.

## Prerequisites

1. A Privy account (free to create)
2. Node.js and pnpm installed

## Step 1: Create a Privy Account

1. Go to [https://dashboard.privy.io](https://dashboard.privy.io)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create a New App

1. In the Privy dashboard, click "Create App"
2. Choose a name for your app (e.g., "GoalFi")
3. Select "Web" as the platform
4. Copy the App ID that's generated

## Step 3: Configure Environment Variables

1. Open the `.env` file in the `goalpay-vault` directory
2. Replace `cmd87c3bk0063lb0mssxa5y1m` with your actual Privy App ID:
   ```
   VITE_PRIVY_APP_ID=your_actual_app_id_here
   ```

## Step 4: Configure Your App Settings

In the Privy dashboard, configure the following:

### Login Methods
- Enable the login methods you want to support:
  - Wallet (MetaMask, Coinbase Wallet, etc.)
  - Email
  - Google
  - Telegram
  - Farcaster

### Allowed Origins
Add your development and production URLs:
- `http://localhost:8080` (for development)
- Your production domain (when deployed)

### Supported Chains
The app is configured to support:
- Mantle Sepolia (testnet)
- Ethereum Sepolia (testnet)
- Base Sepolia (testnet)
- Arbitrum Sepolia (testnet)

## Step 5: Test the Integration

1. Start the development server:
   ```bash
   cd goalpay-vault
   pnpm dev
   ```

2. Open your browser to `http://localhost:8080`
3. Try connecting a wallet using the "Connect Wallet" button
4. You should see the Privy authentication modal

## Troubleshooting

### "Invalid Privy app ID" Error
- Make sure you've replaced the placeholder App ID with your actual App ID from the Privy dashboard
- Ensure there are no extra spaces or characters in the App ID

### Login Methods Not Working
- Check that you've enabled the desired login methods in the Privy dashboard
- Verify that your domain is added to the allowed origins

### Chain Not Supported
- The app is configured for testnet chains by default
- To add mainnet support, update the `supportedChains` in `src/providers/PrivyProvider.tsx`

## Production Deployment

Before deploying to production:

1. Update the `VITE_PRIVY_APP_ID` environment variable with your production App ID
2. Add your production domain to the allowed origins in Privy dashboard
3. Consider enabling additional security features in Privy dashboard
4. Update the legal URLs in the Privy configuration

## Support

- [Privy Documentation](https://docs.privy.io)
- [Privy Discord](https://discord.gg/privy)
- [GoalFi GitHub Issues](https://github.com/your-repo/issues)
