#!/bin/bash

# 🚀 Deploy Acorns Contracts to Scroll Sepolia
# Usage: ./deploy-scroll.sh

set -e

echo "🌰 Deploying Acorns Contracts to Scroll Sepolia"
echo "=============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your settings"
    exit 1
fi

# Source environment variables
source .env

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env file"
    exit 1
fi

# Check if SCROLL_SEPOLIA_RPC_URL is set
if [ -z "$SCROLL_SEPOLIA_RPC_URL" ]; then
    echo "❌ Error: SCROLL_SEPOLIA_RPC_URL not set in .env file"
    echo "Add this line to your .env: SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io"
    exit 1
fi

# Get deployer address
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)
echo "📍 Deployer Address: $DEPLOYER"

# Check balance
BALANCE=$(cast balance $DEPLOYER --rpc-url $SCROLL_SEPOLIA_RPC_URL)
BALANCE_ETH=$(cast to-unit $BALANCE ether)
echo "💰 Balance: $BALANCE_ETH ETH"

# Check if balance is sufficient
if (( $(echo "$BALANCE_ETH < 0.01" | bc -l) )); then
    echo "❌ Error: Insufficient balance for deployment"
    echo "You need at least 0.01 ETH on Scroll Sepolia"
    echo "Get ETH from: https://sepolia.scroll.io/faucet"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Build contracts
echo "🔨 Building contracts..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Run tests (optional)
read -p "🧪 Run tests before deployment? (y/N): " run_tests
if [[ $run_tests =~ ^[Yy]$ ]]; then
    echo "🧪 Running tests..."
    forge test --match-contract AcornsVaultTest
    
    if [ $? -ne 0 ]; then
        echo "❌ Tests failed!"
        read -p "Continue with deployment anyway? (y/N): " continue_deploy
        if [[ ! $continue_deploy =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "✅ Tests passed"
    fi
    echo ""
fi

# Deploy contracts
echo "🚀 Deploying contracts to Scroll Sepolia..."
echo "This may take a few minutes..."
echo ""

# Check if verification should be attempted
VERIFY_FLAG=""
if [ ! -z "$SCROLLSCAN_API_KEY" ]; then
    VERIFY_FLAG="--verify"
    echo "🔍 Verification enabled (Scrollscan API key found)"
else
    echo "⚠️  Verification disabled (no Scrollscan API key)"
fi

# Run deployment
forge script script/DeployScrollSepolia.s.sol:DeployScrollSepolia \
    --rpc-url scroll_sepolia \
    --broadcast \
    $VERIFY_FLAG \
    -vvvv

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Save the contract addresses from the output above"
    echo "2. Update your frontend configuration with these addresses"
    echo "3. Test the faucet functionality to get test tokens"
    echo "4. Test the Acorns features in your frontend"
    echo ""
    echo "🔗 Useful Links:"
    echo "- Scrollscan: https://sepolia.scrollscan.com/"
    echo "- Scroll Faucet: https://sepolia.scroll.io/faucet"
    echo "- Frontend Integration Guide: ./DEPLOY_SCROLL_SEPOLIA.md"
    echo ""
    echo "🌰 Happy micro-investing!"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check the error messages above and try again"
    echo ""
    echo "💡 Common solutions:"
    echo "- Ensure you have enough ETH for gas"
    echo "- Check your RPC URL is correct"
    echo "- Verify your private key is valid"
    echo "- Try again with a higher gas price"
    exit 1
fi
