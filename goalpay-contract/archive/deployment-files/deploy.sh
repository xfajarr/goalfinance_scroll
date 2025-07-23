#!/bin/bash

# GoalFinance Deployment Script for Mantle Testnet
# Make sure to set up your .env file first!

echo "🚀 GoalFinance Deployment to Mantle Testnet"
echo "============================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and fill in your details"
    exit 1
fi

# Load environment variables
source .env

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env file"
    exit 1
fi

# Check if RPC URL is set
if [ -z "$MANTLE_TESTNET_RPC_URL" ]; then
    echo "❌ MANTLE_TESTNET_RPC_URL not set in .env file"
    exit 1
fi

echo "✅ Environment variables loaded"

# Get deployer address
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)
echo "📝 Deployer address: $DEPLOYER"

# Check deployer balance
BALANCE=$(cast balance $DEPLOYER --rpc-url $MANTLE_TESTNET_RPC_URL)
BALANCE_ETH=$(cast --to-unit $BALANCE ether)
echo "💰 Deployer balance: $BALANCE_ETH MNT"

# Check if balance is sufficient (at least 0.1 MNT)
# Convert to integer comparison (multiply by 10 to check if >= 1, which means >= 0.1)
BALANCE_CHECK=$(echo "$BALANCE_ETH * 10" | awk '{print int($1)}')
if [ "$BALANCE_CHECK" -lt 1 ]; then
    echo "⚠️  Low balance! You might need more MNT for gas fees"
    echo "Get testnet MNT from: https://faucet.testnet.mantle.xyz"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🔨 Compiling contracts..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

echo "✅ Compilation successful"

echo "🧪 Running tests..."
forge test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed!"
    read -p "Continue with deployment anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Tests passed"

echo "🚀 Deploying to Mantle Testnet..."

# Deploy with verification if API key is available
if [ -n "$MANTLESCAN_API_KEY" ]; then
    echo "🔍 Deploying with verification..."
    forge script script/DeployMantle.s.sol \
        --rpc-url $MANTLE_TESTNET_RPC_URL \
        --private-key $PRIVATE_KEY \
        --broadcast \
        --verify \
        --etherscan-api-key $MANTLESCAN_API_KEY
else
    echo "⚠️  No MANTLESCAN_API_KEY found, deploying without verification..."
    forge script script/DeployMantle.s.sol \
        --rpc-url $MANTLE_TESTNET_RPC_URL \
        --private-key $PRIVATE_KEY \
        --broadcast
fi

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Check the deployment output above for contract addresses"
    echo "2. Update your frontend with the new addresses"
    echo "3. Test the contracts on Mantle Testnet"
    echo "4. Verify contracts manually if auto-verification failed"
    echo ""
    echo "🌐 Mantle Testnet Explorer: https://explorer.testnet.mantle.xyz"
    echo "💧 Get testnet MNT: https://faucet.testnet.mantle.xyz"
else
    echo "❌ Deployment failed!"
    exit 1
fi
