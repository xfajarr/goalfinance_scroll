#!/bin/bash

# 🔍 Verify Acorns Contracts on Scroll Sepolia
# Usage: ./verify-scroll.sh

set -e

echo "🔍 Verifying GoalFinance + Acorns Contracts on Scroll Sepolia"
echo "=============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your settings"
    exit 1
fi

# Source environment variables
source .env

# Check if SCROLLSCAN_API_KEY is set
if [ -z "$SCROLLSCAN_API_KEY" ]; then
    echo "❌ Error: SCROLLSCAN_API_KEY not set in .env file"
    echo "Get your API key from: https://scrollscan.com/apis"
    echo "Add this line to your .env: SCROLLSCAN_API_KEY=your_api_key_here"
    exit 1
fi

# Prompt for contract addresses
echo "📋 Enter the deployed contract addresses:"
echo ""

read -p "GoalFinance address: " GOAL_FINANCE_ADDRESS
read -p "AcornsVault address: " ACORNS_VAULT_ADDRESS
read -p "MockMorpho address: " MOCK_MORPHO_ADDRESS
read -p "MockUSDC address: " MOCK_USDC_ADDRESS
read -p "MockUSDT address: " MOCK_USDT_ADDRESS
read -p "MockDAI address: " MOCK_DAI_ADDRESS

echo ""
echo "🔍 Starting verification process..."
echo ""

# Function to verify a contract
verify_contract() {
    local name=$1
    local address=$2
    local contract_path=$3
    local constructor_args=$4
    
    echo "🔍 Verifying $name at $address..."
    
    if [ -z "$constructor_args" ]; then
        forge verify-contract $address \
            $contract_path \
            --chain scroll_sepolia \
            --etherscan-api-key $SCROLLSCAN_API_KEY
    else
        forge verify-contract $address \
            $contract_path \
            --chain scroll_sepolia \
            --constructor-args $constructor_args \
            --etherscan-api-key $SCROLLSCAN_API_KEY
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ $name verified successfully!"
    else
        echo "❌ $name verification failed!"
        return 1
    fi
    echo ""
}

# Verify each contract
echo "1/6 Verifying GoalFinance..."
verify_contract "GoalFinance" $GOAL_FINANCE_ADDRESS "src/GoalFinance.sol:GoalFinance"

echo "2/6 Verifying AcornsVault..."
verify_contract "AcornsVault" $ACORNS_VAULT_ADDRESS "src/AcornsVault.sol:AcornsVault"

echo "3/6 Verifying MockMorpho..."
verify_contract "MockMorpho" $MOCK_MORPHO_ADDRESS "src/MockMorpho.sol:MockMorpho"

echo "4/6 Verifying MockUSDC..."
USDC_CONSTRUCTOR_ARGS=$(cast abi-encode "constructor(uint256)" 1000000000000)
verify_contract "MockUSDC" $MOCK_USDC_ADDRESS "src/MockUSDC.sol:MockUSDC" $USDC_CONSTRUCTOR_ARGS

echo "5/6 Verifying MockUSDT..."
USDT_CONSTRUCTOR_ARGS=$(cast abi-encode "constructor(uint256)" 1000000000000)
verify_contract "MockUSDT" $MOCK_USDT_ADDRESS "src/MockUSDT.sol:MockUSDT" $USDT_CONSTRUCTOR_ARGS

echo "6/6 Verifying MockDAI..."
DAI_CONSTRUCTOR_ARGS=$(cast abi-encode "constructor(uint256)" 1000000000000000000000000)
verify_contract "MockDAI" $MOCK_DAI_ADDRESS "src/MockDAI.sol:MockDAI" $DAI_CONSTRUCTOR_ARGS

echo "🎉 All contracts verified successfully!"
echo ""
echo "🔗 View verified contracts on Scrollscan:"
echo "- GoalFinance: https://sepolia.scrollscan.com/address/$GOAL_FINANCE_ADDRESS"
echo "- AcornsVault: https://sepolia.scrollscan.com/address/$ACORNS_VAULT_ADDRESS"
echo "- MockMorpho: https://sepolia.scrollscan.com/address/$MOCK_MORPHO_ADDRESS"
echo "- MockUSDC: https://sepolia.scrollscan.com/address/$MOCK_USDC_ADDRESS"
echo "- MockUSDT: https://sepolia.scrollscan.com/address/$MOCK_USDT_ADDRESS"
echo "- MockDAI: https://sepolia.scrollscan.com/address/$MOCK_DAI_ADDRESS"
echo ""
echo "✅ Verification complete!"
