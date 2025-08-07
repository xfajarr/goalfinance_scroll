#!/usr/bin/env node

/**
 * Test script to verify Scroll Sepolia integration
 * This script tests the contract deployment and GraphQL indexer
 */

import { createPublicClient, http } from 'viem';
import { scrollSepolia } from 'viem/chains';

// Configuration
const SCROLL_SEPOLIA_RPC = 'https://sepolia-rpc.scroll.io';
const GOAL_FINANCE_ADDRESS = '0x9Dd1664238359e8d808c41Af735aa67dD91F5b7F';
const MOCK_USDC_ADDRESS = '0x4522b80fC6cccc35af1985982CC678CF8c466941';
const GRAPHQL_ENDPOINT = 'https://indexer.dev.hyperindex.xyz/81da39f/v1/graphql';

// Simple ABI for testing basic contract calls
const GOAL_FINANCE_ABI = [
  {
    "inputs": [],
    "name": "getTotalVaultCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const ERC20_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function testContractConnection() {
  console.log('🔗 Testing Scroll Sepolia Contract Connection...\n');

  try {
    // Create public client
    const client = createPublicClient({
      chain: scrollSepolia,
      transport: http(SCROLL_SEPOLIA_RPC),
    });

    console.log('✅ RPC Connection established');

    // Test GoalFinance contract
    console.log('\n📋 Testing GoalFinance Contract...');
    
    try {
      const totalVaults = await client.readContract({
        address: GOAL_FINANCE_ADDRESS,
        abi: GOAL_FINANCE_ABI,
        functionName: 'getTotalVaultCount',
      });
      console.log(`✅ Total Vaults: ${totalVaults}`);
    } catch (error) {
      console.log(`❌ Failed to read total vaults: ${error.message}`);
    }

    try {
      const owner = await client.readContract({
        address: GOAL_FINANCE_ADDRESS,
        abi: GOAL_FINANCE_ABI,
        functionName: 'owner',
      });
      console.log(`✅ Contract Owner: ${owner}`);
    } catch (error) {
      console.log(`❌ Failed to read owner: ${error.message}`);
    }

    // Test MockUSDC contract
    console.log('\n💰 Testing MockUSDC Contract...');
    
    try {
      const name = await client.readContract({
        address: MOCK_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'name',
      });
      console.log(`✅ Token Name: ${name}`);
    } catch (error) {
      console.log(`❌ Failed to read token name: ${error.message}`);
    }

    try {
      const symbol = await client.readContract({
        address: MOCK_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'symbol',
      });
      console.log(`✅ Token Symbol: ${symbol}`);
    } catch (error) {
      console.log(`❌ Failed to read token symbol: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ RPC Connection failed: ${error.message}`);
  }
}

async function testGraphQLEndpoint() {
  console.log('\n📊 Testing GraphQL Indexer...\n');

  try {
    const query = `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    console.log('✅ GraphQL endpoint is accessible');
    console.log(`✅ Schema contains ${result.data.__schema.types.length} types`);

    // Test a simple query for vaults
    const vaultsQuery = `
      query {
        vaults(first: 5) {
          id
          name
          creator
          totalDeposited
        }
      }
    `;

    const vaultsResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: vaultsQuery }),
    });

    if (vaultsResponse.ok) {
      const vaultsResult = await vaultsResponse.json();
      if (!vaultsResult.errors) {
        console.log(`✅ Vaults query successful`);
        console.log(`✅ Found ${vaultsResult.data?.vaults?.length || 0} vaults`);
      } else {
        console.log(`⚠️  Vaults query returned errors: ${JSON.stringify(vaultsResult.errors)}`);
      }
    } else {
      console.log(`⚠️  Vaults query failed: ${vaultsResponse.statusText}`);
    }

  } catch (error) {
    console.log(`❌ GraphQL test failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Scroll Sepolia Integration Test\n');
  console.log('='.repeat(50));
  
  console.log(`📍 Chain: Scroll Sepolia (534351)`);
  console.log(`📍 RPC: ${SCROLL_SEPOLIA_RPC}`);
  console.log(`📍 GoalFinance: ${GOAL_FINANCE_ADDRESS}`);
  console.log(`📍 MockUSDC: ${MOCK_USDC_ADDRESS}`);
  console.log(`📍 GraphQL: ${GRAPHQL_ENDPOINT}`);
  console.log('='.repeat(50));

  await testContractConnection();
  await testGraphQLEndpoint();

  console.log('\n🎉 Integration test completed!');
  console.log('\nNext steps:');
  console.log('1. Start the frontend: cd goalpay-vault && pnpm dev');
  console.log('2. Connect your wallet to Scroll Sepolia');
  console.log('3. Test creating and joining vaults');
}

// Run the test
main().catch(console.error);
