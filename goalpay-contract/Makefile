# GoalFi Smart Contract Makefile

# Load environment variables
include .env
export

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Help target
help: ## Show this help message
	@echo "$(GREEN)GoalFi Smart Contract Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Installation
install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	forge install
	@echo "$(GREEN)Dependencies installed!$(NC)"

# Building
build: ## Build contracts
	@echo "$(GREEN)Building contracts...$(NC)"
	forge build
	@echo "$(GREEN)Build complete!$(NC)"

build-v2: ## Build V2 contracts specifically
	@echo "$(GREEN)Building V2 contracts...$(NC)"
	forge build --contracts src/GoalVaultV2.sol src/GoalVaultFactoryV2.sol src/MockUSDCV2.sol
	@echo "$(GREEN)V2 build complete!$(NC)"

clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	forge clean
	@echo "$(GREEN)Clean complete!$(NC)"

# Testing
test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	forge test -vv

test-verbose: ## Run tests with verbose output
	@echo "$(GREEN)Running tests with verbose output...$(NC)"
	forge test -vvv

test-gas: ## Run tests with gas reporting
	@echo "$(GREEN)Running tests with gas reporting...$(NC)"
	forge test --gas-report

test-coverage: ## Run test coverage
	@echo "$(GREEN)Running test coverage...$(NC)"
	forge coverage

test-factory: ## Run only factory tests
	@echo "$(GREEN)Running factory tests...$(NC)"
	forge test --match-contract GoalVaultFactoryTest -vv

test-vault: ## Run only vault tests
	@echo "$(GREEN)Running vault tests...$(NC)"
	forge test --match-contract GoalVaultTest -vv

test-v2: ## Run V2 tests specifically
	@echo "$(GREEN)Running V2 tests...$(NC)"
	forge test --match-contract "V2" -vv

test-v2-coverage: ## Run V2 tests with coverage
	@echo "$(GREEN)Running V2 tests with coverage...$(NC)"
	forge coverage --match-contract "V2"

# Formatting
format: ## Format code
	@echo "$(GREEN)Formatting code...$(NC)"
	forge fmt

format-check: ## Check code formatting
	@echo "$(GREEN)Checking code formatting...$(NC)"
	forge fmt --check

# Universal deployment (auto-detects network)
deploy: ## Deploy to any network (auto-detects chain)
	@echo "$(GREEN)Deploying GoalFinance (auto-detecting network)...$(NC)"
	forge script script/Deploy.s.sol:Deploy --broadcast --private-key $(PRIVATE_KEY)

deploy-verify: ## Deploy to any network with verification
	@echo "$(GREEN)Deploying GoalFinance with verification...$(NC)"
	forge script script/Deploy.s.sol:Deploy --broadcast --verify --private-key $(PRIVATE_KEY)

# Specific network deployments
deploy-local: ## Deploy to local network
	@echo "$(GREEN)Deploying to local network...$(NC)"
	forge script script/Deploy.s.sol:Deploy --rpc-url http://localhost:8545 --broadcast --private-key $(PRIVATE_KEY)

deploy-sepolia: ## Deploy to Ethereum Sepolia
	@echo "$(GREEN)Deploying to Ethereum Sepolia...$(NC)"
	forge script script/Deploy.s.sol:Deploy --rpc-url $(SEPOLIA_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

deploy-base-sepolia: ## Deploy to Base Sepolia
	@echo "$(GREEN)Deploying to Base Sepolia...$(NC)"
	forge script script/Deploy.s.sol:Deploy --rpc-url $(BASE_SEPOLIA_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

deploy-mantle-sepolia: ## Deploy to Mantle Sepolia
	@echo "$(GREEN)Deploying to Mantle Sepolia...$(NC)"
	forge script script/Deploy.s.sol:Deploy --rpc-url $(MANTLE_SEPOLIA_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

deploy-arbitrum-sepolia: ## Deploy to Arbitrum Sepolia
	@echo "$(GREEN)Deploying to Arbitrum Sepolia...$(NC)"
	forge script script/Deploy.s.sol:Deploy --rpc-url $(ARBITRUM_SEPOLIA_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

deploy-optimism-sepolia: ## Deploy to Optimism Sepolia
	@echo "$(GREEN)Deploying to Optimism Sepolia...$(NC)"
	forge script script/Deploy.s.sol:Deploy --rpc-url $(OPTIMISM_SEPOLIA_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

# Mainnet deployments (with confirmation)
deploy-ethereum: ## Deploy to Ethereum mainnet (DANGEROUS)
	@echo "$(RED)WARNING: This will deploy to ETHEREUM MAINNET!$(NC)"
	@echo "$(RED)Make sure you have reviewed all contracts and tests!$(NC)"
	@read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm && [ "$$confirm" = "yes" ]
	@echo "$(GREEN)Deploying to Ethereum mainnet...$(NC)"
	forge script script/Deploy.s.sol:Deploy --rpc-url $(ETHEREUM_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

deploy-base: ## Deploy to Base mainnet (DANGEROUS)
	@echo "$(RED)WARNING: This will deploy to BASE MAINNET!$(NC)"
	@read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm && [ "$$confirm" = "yes" ]
	@echo "$(GREEN)Deploying to Base mainnet...$(NC)"
	forge script script/Deploy.s.sol:Deploy --rpc-url $(BASE_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

deploy-arbitrum: ## Deploy to Arbitrum mainnet (DANGEROUS)
	@echo "$(RED)WARNING: This will deploy to ARBITRUM MAINNET!$(NC)"
	@read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm && [ "$$confirm" = "yes" ]
	@echo "$(GREEN)Deploying to Arbitrum mainnet...$(NC)"
	forge script script/Deploy.s.sol:Deploy --rpc-url $(ARBITRUM_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

deploy-optimism: ## Deploy to Optimism mainnet (DANGEROUS)
	@echo "$(RED)WARNING: This will deploy to OPTIMISM MAINNET!$(NC)"
	@read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm && [ "$$confirm" = "yes" ]
	@echo "$(GREEN)Deploying to Optimism mainnet...$(NC)"
	forge script script/Deploy.s.sol:Deploy --rpc-url $(OPTIMISM_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

deploy-polygon: ## Deploy to Polygon mainnet (DANGEROUS)
	@echo "$(RED)WARNING: This will deploy to POLYGON MAINNET!$(NC)"
	@read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm && [ "$$confirm" = "yes" ]
	@echo "$(GREEN)Deploying to Polygon mainnet...$(NC)"
	forge script script/Deploy.s.sol:Deploy --rpc-url $(POLYGON_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

# V2 Deployment targets
deploy-v2-local: ## Deploy V2 contracts to local network
	@echo "$(GREEN)Deploying V2 to local network...$(NC)"
	forge script script/DeployV2.s.sol:DeployV2 --rpc-url http://localhost:8545 --broadcast --private-key $(PRIVATE_KEY)

deploy-v2-sepolia: ## Deploy V2 contracts to Sepolia
	@echo "$(GREEN)Deploying V2 to Sepolia...$(NC)"
	forge script script/DeployV2.s.sol:DeployV2 --rpc-url $(SEPOLIA_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

deploy-v2-mantle: ## Deploy V2 contracts to Mantle Sepolia
	@echo "$(GREEN)Deploying V2 to Mantle Sepolia...$(NC)"
	forge script script/DeployV2.s.sol:DeployV2 --rpc-url $(MANTLE_SEPOLIA_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

deploy-v2-base: ## Deploy V2 contracts to Base Sepolia
	@echo "$(GREEN)Deploying V2 to Base Sepolia...$(NC)"
	forge script script/DeployV2.s.sol:DeployV2 --rpc-url $(BASE_SEPOLIA_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

deploy-v2-arbitrum: ## Deploy V2 contracts to Arbitrum Sepolia
	@echo "$(GREEN)Deploying V2 to Arbitrum Sepolia...$(NC)"
	forge script script/DeployV2.s.sol:DeployV2 --rpc-url $(ARBITRUM_SEPOLIA_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

# Verification
verify-sepolia: ## Verify contracts on Sepolia
	@echo "$(GREEN)Verifying contracts on Sepolia...$(NC)"
	forge verify-contract --chain sepolia --etherscan-api-key $(ETHERSCAN_API_KEY) $(CONTRACT_ADDRESS) src/GoalVaultFactory.sol:GoalVaultFactory

# Local development
anvil: ## Start local Anvil node
	@echo "$(GREEN)Starting Anvil local node...$(NC)"
	anvil --host 0.0.0.0 --port 8545

# Contract interaction
create-vault: ## Create a test vault (local)
	@echo "$(GREEN)Creating test vault...$(NC)"
	cast send $(FACTORY_ADDRESS) "createVault(string,string,uint256,uint256,bool)" "Test Vault" "Test Description" 5000000000 $$(date -d "+90 days" +%s) true --rpc-url http://localhost:8545 --private-key $(PRIVATE_KEY)

get-vault: ## Get vault info (requires VAULT_ID)
	@echo "$(GREEN)Getting vault info for ID $(VAULT_ID)...$(NC)"
	cast call $(FACTORY_ADDRESS) "getVault(uint256)" $(VAULT_ID) --rpc-url http://localhost:8545

# Utility commands
size: ## Check contract sizes
	@echo "$(GREEN)Checking contract sizes...$(NC)"
	forge build --sizes

gas-snapshot: ## Create gas snapshot
	@echo "$(GREEN)Creating gas snapshot...$(NC)"
	forge snapshot

slither: ## Run Slither static analysis (requires slither installation)
	@echo "$(GREEN)Running Slither analysis...$(NC)"
	slither .

mythril: ## Run Mythril security analysis (requires mythril installation)
	@echo "$(GREEN)Running Mythril analysis...$(NC)"
	myth analyze src/GoalVaultFactory.sol --solc-json mythril.json

# Documentation
docs: ## Generate documentation
	@echo "$(GREEN)Generating documentation...$(NC)"
	forge doc

docs-serve: ## Serve documentation locally
	@echo "$(GREEN)Serving documentation at http://localhost:3000$(NC)"
	forge doc --serve --port 3000

# Environment setup
setup-env: ## Setup environment file
	@echo "$(GREEN)Setting up environment file...$(NC)"
	cp .env.example .env
	@echo "$(YELLOW)Please edit .env file with your actual values$(NC)"

# Git hooks
setup-hooks: ## Setup git hooks
	@echo "$(GREEN)Setting up git hooks...$(NC)"
	echo "#!/bin/sh\nmake format-check && make test" > .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit
	@echo "$(GREEN)Git hooks setup complete!$(NC)"

# All-in-one commands
dev-setup: install setup-env ## Complete development setup
	@echo "$(GREEN)Development setup complete!$(NC)"
	@echo "$(YELLOW)Don't forget to edit your .env file!$(NC)"

full-test: format-check test test-coverage ## Run full test suite
	@echo "$(GREEN)Full test suite complete!$(NC)"

# CI/CD commands
ci-test: ## CI test command
	forge test --no-match-test "testFork"

ci-coverage: ## CI coverage command
	forge coverage --report lcov

# Security
security-check: slither ## Run security checks
	@echo "$(GREEN)Security checks complete!$(NC)"

.PHONY: help install build build-v2 clean test test-verbose test-gas test-coverage test-factory test-vault test-v2 test-v2-coverage format format-check deploy-local deploy-sepolia deploy-mainnet deploy-v2-local deploy-v2-sepolia deploy-v2-mantle deploy-v2-base deploy-v2-arbitrum verify-sepolia anvil create-vault get-vault size gas-snapshot slither mythril docs docs-serve setup-env setup-hooks dev-setup full-test ci-test ci-coverage security-check
