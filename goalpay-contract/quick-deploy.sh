#!/bin/bash

# Quick deployment script for common networks
# Usage: ./quick-deploy.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}GoalFi Quick Deployment${NC}"
echo ""

# Check if deploy.sh exists
if [[ ! -f "deploy.sh" ]]; then
    echo "Error: deploy.sh not found"
    exit 1
fi

echo "Select a network to deploy to:"
echo ""
echo "Testnets (Recommended for testing):"
echo "1) Base Sepolia"
echo "2) Arbitrum Sepolia" 
echo "3) Mantle Sepolia"
echo "4) Ethereum Sepolia"
echo ""
echo "Mainnets (Use with caution):"
echo "5) Base Mainnet"
echo "6) Arbitrum One"
echo "7) Ethereum Mainnet"
echo ""

read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        network="base-sepolia"
        ;;
    2)
        network="arbitrum-sepolia"
        ;;
    3)
        network="mantle-sepolia"
        ;;
    4)
        network="sepolia"
        ;;
    5)
        network="base"
        echo -e "${YELLOW}Warning: Deploying to MAINNET!${NC}"
        read -p "Are you sure? (y/N): " confirm
        if [[ $confirm != "y" && $confirm != "Y" ]]; then
            echo "Deployment cancelled"
            exit 0
        fi
        ;;
    6)
        network="arbitrum"
        echo -e "${YELLOW}Warning: Deploying to MAINNET!${NC}"
        read -p "Are you sure? (y/N): " confirm
        if [[ $confirm != "y" && $confirm != "Y" ]]; then
            echo "Deployment cancelled"
            exit 0
        fi
        ;;
    7)
        network="ethereum"
        echo -e "${YELLOW}Warning: Deploying to MAINNET!${NC}"
        read -p "Are you sure? (y/N): " confirm
        if [[ $confirm != "y" && $confirm != "Y" ]]; then
            echo "Deployment cancelled"
            exit 0
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
read -p "Do you want to verify contracts after deployment? (Y/n): " verify_choice

if [[ $verify_choice == "n" || $verify_choice == "N" ]]; then
    verify_flag=""
else
    verify_flag="verify"
fi

echo ""
echo -e "${GREEN}Deploying to $network...${NC}"

# Run the deployment
./deploy.sh "$network" $verify_flag

echo ""
echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${BLUE}Check deployments/${network}.json for contract addresses${NC}"
