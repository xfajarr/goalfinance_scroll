#!/bin/bash

# GoalFi Dynamic Contract Deployment Script
# Supports deployment to any EVM-compatible chain
# Usage: ./deploy.sh <network> [verify]
# Example: ./deploy.sh base verify

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Network configurations
declare -A NETWORKS
declare -A RPC_URLS
declare -A CHAIN_IDS
declare -A EXPLORERS
declare -A API_KEYS
declare -A VERIFIER_URLS

# Define network configurations
setup_networks() {
    # Mainnets
    NETWORKS["ethereum"]="Ethereum Mainnet"
    RPC_URLS["ethereum"]="$MAINNET_RPC_URL"
    CHAIN_IDS["ethereum"]="1"
    EXPLORERS["ethereum"]="https://etherscan.io"
    API_KEYS["ethereum"]="$ETHERSCAN_API_KEY"

    NETWORKS["base"]="Base Mainnet"
    RPC_URLS["base"]="$BASE_RPC_URL"
    CHAIN_IDS["base"]="8453"
    EXPLORERS["base"]="https://basescan.org"
    API_KEYS["base"]="$BASESCAN_API_KEY"

    NETWORKS["arbitrum"]="Arbitrum One"
    RPC_URLS["arbitrum"]="$ARBITRUM_RPC_URL"
    CHAIN_IDS["arbitrum"]="42161"
    EXPLORERS["arbitrum"]="https://arbiscan.io"
    API_KEYS["arbitrum"]="$ARBISCAN_API_KEY"

    NETWORKS["optimism"]="Optimism Mainnet"
    RPC_URLS["optimism"]="$OPTIMISM_RPC_URL"
    CHAIN_IDS["optimism"]="10"
    EXPLORERS["optimism"]="https://optimistic.etherscan.io"
    API_KEYS["optimism"]="$OPTIMISTIC_ETHERSCAN_API_KEY"

    NETWORKS["polygon"]="Polygon Mainnet"
    RPC_URLS["polygon"]="$POLYGON_RPC_URL"
    CHAIN_IDS["polygon"]="137"
    EXPLORERS["polygon"]="https://polygonscan.com"
    API_KEYS["polygon"]="$POLYGONSCAN_API_KEY"

    # Testnets
    NETWORKS["sepolia"]="Ethereum Sepolia"
    RPC_URLS["sepolia"]="$SEPOLIA_RPC_URL"
    CHAIN_IDS["sepolia"]="11155111"
    EXPLORERS["sepolia"]="https://sepolia.etherscan.io"
    API_KEYS["sepolia"]="$ETHERSCAN_API_KEY"

    NETWORKS["base-sepolia"]="Base Sepolia"
    RPC_URLS["base-sepolia"]="https://sepolia.base.org"
    CHAIN_IDS["base-sepolia"]="84532"
    EXPLORERS["base-sepolia"]="https://sepolia.basescan.org"
    API_KEYS["base-sepolia"]="$BASESCAN_API_KEY"

    NETWORKS["arbitrum-sepolia"]="Arbitrum Sepolia"
    RPC_URLS["arbitrum-sepolia"]="https://sepolia-rollup.arbitrum.io/rpc"
    CHAIN_IDS["arbitrum-sepolia"]="421614"
    EXPLORERS["arbitrum-sepolia"]="https://sepolia.arbiscan.io"
    API_KEYS["arbitrum-sepolia"]="$ARBISCAN_API_KEY"

    NETWORKS["mantle-sepolia"]="Mantle Sepolia"
    RPC_URLS["mantle-sepolia"]="https://rpc.sepolia.mantle.xyz"
    CHAIN_IDS["mantle-sepolia"]="5003"
    EXPLORERS["mantle-sepolia"]="https://sepolia.mantlescan.xyz"
    API_KEYS["mantle-sepolia"]="$MANTLESCAN_API_KEY"
    VERIFIER_URLS["mantle-sepolia"]="https://api.etherscan.io/v2/api?chainid=5003"
}

# Print usage
print_usage() {
    echo -e "${BLUE}GoalFi Dynamic Contract Deployment Script${NC}"
    echo ""
    echo "Usage: $0 <network> [verify]"
    echo ""
    echo "Available networks:"
    for network in "${!NETWORKS[@]}"; do
        echo -e "  ${GREEN}$network${NC} - ${NETWORKS[$network]}"
    done
    echo ""
    echo "Examples:"
    echo "  $0 base                 # Deploy to Base mainnet"
    echo "  $0 base-sepolia verify  # Deploy to Base Sepolia and verify"
    echo "  $0 mantle-sepolia       # Deploy to Mantle Sepolia"
    echo ""
}

# Validate network
validate_network() {
    local network=$1
    if [[ -z "${NETWORKS[$network]}" ]]; then
        echo -e "${RED}Error: Unknown network '$network'${NC}"
        print_usage
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"
    
    # Check if forge is installed
    if ! command -v forge &> /dev/null; then
        echo -e "${RED}Error: forge not found. Please install Foundry.${NC}"
        exit 1
    fi

    # Check if cast is installed
    if ! command -v cast &> /dev/null; then
        echo -e "${RED}Error: cast not found. Please install Foundry.${NC}"
        exit 1
    fi

    # Check private key
    if [[ -z "$PRIVATE_KEY" ]]; then
        echo -e "${RED}Error: PRIVATE_KEY not set in .env file${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Prerequisites check passed${NC}"
}

# Deploy contracts
deploy_contracts() {
    local network=$1
    local rpc_url="${RPC_URLS[$network]}"
    local chain_id="${CHAIN_IDS[$network]}"
    
    echo -e "${BLUE}Deploying to ${NETWORKS[$network]} (Chain ID: $chain_id)...${NC}"
    echo -e "${YELLOW}RPC URL: $rpc_url${NC}"
    
    # Create deployments directory
    mkdir -p deployments
    
    # Deploy using forge script
    echo -e "${BLUE}Running deployment script...${NC}"

    forge script script/Deploy.s.sol:DeployTestnet \
        --rpc-url "$rpc_url" \
        --private-key "$PRIVATE_KEY" \
        --broadcast \
        --verify \
        --etherscan-api-key "${API_KEYS[$network]}" \
        -vvvv || {

        echo -e "${YELLOW}Deployment without verification...${NC}"
        forge script script/Deploy.s.sol:DeployTestnet \
            --rpc-url "$rpc_url" \
            --private-key "$PRIVATE_KEY" \
            --broadcast \
            -vvvv
    }
    
    # Extract deployed addresses from broadcast
    local broadcast_file="broadcast/Deploy.s.sol/$chain_id/run-latest.json"
    if [[ -f "$broadcast_file" ]]; then
        extract_addresses "$broadcast_file" "$network" "$chain_id"
    else
        echo -e "${YELLOW}Warning: Broadcast file not found. Addresses not saved.${NC}"
    fi
}

# Extract addresses from broadcast file
extract_addresses() {
    local broadcast_file=$1
    local network=$2
    local chain_id=$3
    
    echo -e "${BLUE}Extracting deployed addresses...${NC}"
    
    # Use jq to extract addresses if available, otherwise use grep/sed
    if command -v jq &> /dev/null; then
        local usdc_address=$(jq -r '.transactions[] | select(.contractName == "MockUSDC") | .contractAddress' "$broadcast_file" 2>/dev/null || echo "")
        local factory_address=$(jq -r '.transactions[] | select(.contractName == "GoalVaultFactory") | .contractAddress' "$broadcast_file" 2>/dev/null || echo "")
    else
        # Fallback method without jq
        local usdc_address=$(grep -o '"contractAddress":"0x[a-fA-F0-9]*"' "$broadcast_file" | head -1 | cut -d'"' -f4)
        local factory_address=$(grep -o '"contractAddress":"0x[a-fA-F0-9]*"' "$broadcast_file" | tail -1 | cut -d'"' -f4)
    fi
    
    # Save deployment info
    local deployment_file="deployments/${network}.json"
    cat > "$deployment_file" << EOF
{
  "network": "${NETWORKS[$network]}",
  "chainId": $chain_id,
  "MockUSDC": "$usdc_address",
  "GoalVaultFactory": "$factory_address",
  "explorer": "${EXPLORERS[$network]}",
  "deployedAt": $(date +%s)
}
EOF
    
    echo -e "${GREEN}✓ Deployment addresses saved to $deployment_file${NC}"
    echo -e "${GREEN}MockUSDC: $usdc_address${NC}"
    echo -e "${GREEN}GoalVaultFactory: $factory_address${NC}"
    echo -e "${BLUE}Explorer: ${EXPLORERS[$network]}${NC}"
    
    # Export for verification
    export USDC_ADDRESS="$usdc_address"
    export FACTORY_ADDRESS="$factory_address"
}

# Verify contracts
verify_contracts() {
    local network=$1
    
    if [[ -z "$USDC_ADDRESS" || -z "$FACTORY_ADDRESS" ]]; then
        echo -e "${RED}Error: Contract addresses not found. Deploy first.${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Verifying contracts on ${NETWORKS[$network]}...${NC}"
    
    local chain_id="${CHAIN_IDS[$network]}"
    local api_key="${API_KEYS[$network]}"
    
    # Special handling for Mantle
    if [[ "$network" == "mantle-sepolia" ]]; then
        verify_mantle_contracts "$chain_id" "$api_key"
    else
        verify_standard_contracts "$chain_id" "$api_key"
    fi
}

# Verify contracts on Mantle (special case)
verify_mantle_contracts() {
    local chain_id=$1
    local api_key=$2
    
    echo -e "${BLUE}Verifying on Mantle Sepolia...${NC}"
    
    # Verify MockUSDC
    echo -e "${YELLOW}Verifying MockUSDC...${NC}"
    forge verify-contract \
        --verifier-url "https://api.etherscan.io/v2/api?chainid=5003" \
        --etherscan-api-key "$api_key" \
        --compiler-version "v0.8.24+commit.e11b9ed9" \
        "$USDC_ADDRESS" \
        "src/MockUSDC.sol:MockUSDC" \
        --constructor-args $(cast abi-encode "constructor(uint256)" 100000000000) \
        --watch || echo -e "${YELLOW}MockUSDC verification failed${NC}"
    
    # Verify GoalVaultFactory
    echo -e "${YELLOW}Verifying GoalVaultFactory...${NC}"
    forge verify-contract \
        --verifier-url "https://api-sepolia.mantlescan.xyz/api" \
        --etherscan-api-key "$api_key" \
        --compiler-version "v0.8.24+commit.e11b9ed9" \
        "$FACTORY_ADDRESS" \
        "src/GoalVaultFactory.sol:GoalVaultFactory" \
        --constructor-args $(cast abi-encode "constructor(address)" "$USDC_ADDRESS") \
        --watch || echo -e "${YELLOW}GoalVaultFactory verification failed${NC}"
}

# Verify contracts on standard networks
verify_standard_contracts() {
    local chain_id=$1
    local api_key=$2
    
    # Verify MockUSDC
    echo -e "${YELLOW}Verifying MockUSDC...${NC}"
    forge verify-contract \
        --chain-id "$chain_id" \
        --etherscan-api-key "$api_key" \
        "$USDC_ADDRESS" \
        "src/MockUSDC.sol:MockUSDC" \
        --constructor-args $(cast abi-encode "constructor(uint256)" 100000000000) || echo -e "${YELLOW}MockUSDC verification failed${NC}"
    
    # Verify GoalVaultFactory
    echo -e "${YELLOW}Verifying GoalVaultFactory...${NC}"
    forge verify-contract \
        --chain-id "$chain_id" \
        --etherscan-api-key "$api_key" \
        "$FACTORY_ADDRESS" \
        "src/GoalVaultFactory.sol:GoalVaultFactory" \
        --constructor-args $(cast abi-encode "constructor(address)" "$USDC_ADDRESS") || echo -e "${YELLOW}GoalVaultFactory verification failed${NC}"
}

# Main execution
main() {
    local network=$1
    local should_verify=$2
    
    if [[ -z "$network" ]]; then
        print_usage
        exit 1
    fi
    
    setup_networks
    validate_network "$network"
    check_prerequisites
    
    echo -e "${GREEN}Starting deployment to ${NETWORKS[$network]}...${NC}"
    
    deploy_contracts "$network"
    
    if [[ "$should_verify" == "verify" ]]; then
        verify_contracts "$network"
    fi
    
    echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
    echo -e "${BLUE}Check deployments/${network}.json for contract addresses${NC}"
}

# Run main function with all arguments
main "$@"
