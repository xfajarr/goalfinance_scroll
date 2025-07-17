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

# Formatting
format: ## Format code
	@echo "$(GREEN)Formatting code...$(NC)"
	forge fmt

format-check: ## Check code formatting
	@echo "$(GREEN)Checking code formatting...$(NC)"
	forge fmt --check

# Local deployment
deploy-local: ## Deploy to local network
	@echo "$(GREEN)Deploying to local network...$(NC)"
	forge script script/Deploy.s.sol:DeployLocal --rpc-url http://localhost:8545 --broadcast --private-key $(PRIVATE_KEY)

deploy-local-verify: ## Deploy to local network and verify
	@echo "$(GREEN)Deploying to local network with verification...$(NC)"
	forge script script/Deploy.s.sol:DeployLocal --rpc-url http://localhost:8545 --broadcast --verify --private-key $(PRIVATE_KEY)

# Testnet deployment
deploy-sepolia: ## Deploy to Sepolia testnet
	@echo "$(GREEN)Deploying to Sepolia testnet...$(NC)"
	forge script script/Deploy.s.sol:DeployTestnet --rpc-url $(SEPOLIA_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

# Mainnet deployment (with confirmation)
deploy-mainnet: ## Deploy to Ethereum mainnet (DANGEROUS)
	@echo "$(RED)WARNING: This will deploy to MAINNET!$(NC)"
	@echo "$(RED)Make sure you have reviewed all contracts and tests!$(NC)"
	@read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm && [ "$$confirm" = "yes" ]
	@echo "$(GREEN)Deploying to Ethereum mainnet...$(NC)"
	forge script script/Deploy.s.sol:DeployMainnet --rpc-url $(MAINNET_RPC_URL) --broadcast --verify --private-key $(PRIVATE_KEY)

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

.PHONY: help install build clean test test-verbose test-gas test-coverage test-factory test-vault format format-check deploy-local deploy-sepolia deploy-mainnet verify-sepolia anvil create-vault get-vault size gas-snapshot slither mythril docs docs-serve setup-env setup-hooks dev-setup full-test ci-test ci-coverage security-check
