#!/usr/bin/env node

/**
 * Test script to verify Acorns and MockMorpho integration on Scroll Sepolia
 * This script tests the contract deployment and functionality
 */

import { createPublicClient, http } from 'viem';
import { scrollSepolia } from 'viem/chains';

// Configuration
const SCROLL_SEPOLIA_RPC = 'https://sepolia-rpc.scroll.io';
const ACORNS_VAULT_ADDRESS = '0x62F86d88960F77D32c0a0a33b3f7c29cbEE384C6';
const MOCK_MORPHO_ADDRESS = '0x4fFa2a2bA2A66A5091483990a558B084B49452c2';
const MOCK_USDC_ADDRESS = '0x4522b80fC6cccc35af1985982CC678CF8c466941';
const GRAPHQL_ENDPOINT = 'https://indexer.dev.hyperindex.xyz/81da39f/v1/graphql';

// Simple ABI for testing basic contract calls
const ACORNS_VAULT_ABI = [
  {
    "inputs": [],
    "name": "getTotalUsers",
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
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserAccount",
    "outputs": [{"internalType": "bool", "name": "isRegistered", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const MOCK_MORPHO_ABI = [
  {
    "inputs": [],
    "name": "getTotalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentAPY",
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

async function testAcornsContract() {
  console.log('🌰 Testing AcornsVault Contract...\n');

  try {
    // Create public client
    const client = createPublicClient({
      chain: scrollSepolia,
      transport: http(SCROLL_SEPOLIA_RPC),
    });

    console.log('✅ RPC Connection established');

    // Test AcornsVault contract
    console.log('\n📋 Testing AcornsVault Contract...');
    
    try {
      const totalUsers = await client.readContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: ACORNS_VAULT_ABI,
        functionName: 'getTotalUsers',
      });
      console.log(`✅ Total Users: ${totalUsers}`);
    } catch (error) {
      console.log(`❌ Failed to read total users: ${error.message}`);
    }

    try {
      const owner = await client.readContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: ACORNS_VAULT_ABI,
        functionName: 'owner',
      });
      console.log(`✅ AcornsVault Owner: ${owner}`);
    } catch (error) {
      console.log(`❌ Failed to read owner: ${error.message}`);
    }

    // Test a sample user account (zero address for testing)
    try {
      const userAccount = await client.readContract({
        address: ACORNS_VAULT_ADDRESS,
        abi: ACORNS_VAULT_ABI,
        functionName: 'getUserAccount',
        args: ['0x0000000000000000000000000000000000000000'],
      });
      console.log(`✅ Sample User Registered: ${userAccount}`);
    } catch (error) {
      console.log(`❌ Failed to read user account: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ AcornsVault test failed: ${error.message}`);
  }
}

async function testMockMorphoContract() {
  console.log('\n🏦 Testing MockMorpho Contract...\n');

  try {
    // Create public client
    const client = createPublicClient({
      chain: scrollSepolia,
      transport: http(SCROLL_SEPOLIA_RPC),
    });

    // Test MockMorpho contract
    console.log('📋 Testing MockMorpho Contract...');
    
    try {
      const totalSupply = await client.readContract({
        address: MOCK_MORPHO_ADDRESS,
        abi: MOCK_MORPHO_ABI,
        functionName: 'getTotalSupply',
      });
      console.log(`✅ Total Supply: ${totalSupply}`);
    } catch (error) {
      console.log(`❌ Failed to read total supply: ${error.message}`);
    }

    try {
      const currentAPY = await client.readContract({
        address: MOCK_MORPHO_ADDRESS,
        abi: MOCK_MORPHO_ABI,
        functionName: 'getCurrentAPY',
      });
      console.log(`✅ Current APY: ${currentAPY}%`);
    } catch (error) {
      console.log(`❌ Failed to read current APY: ${error.message}`);
    }

    try {
      const owner = await client.readContract({
        address: MOCK_MORPHO_ADDRESS,
        abi: MOCK_MORPHO_ABI,
        functionName: 'owner',
      });
      console.log(`✅ MockMorpho Owner: ${owner}`);
    } catch (error) {
      console.log(`❌ Failed to read owner: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ MockMorpho test failed: ${error.message}`);
  }
}

async function testGraphQLAcornsQueries() {
  console.log('\n📊 Testing GraphQL Acorns Queries...\n');

  try {
    // Test basic schema query
    const schemaQuery = `
      query {
        __schema {
          queryType {
            fields {
              name
              type {
                name
              }
            }
          }
        }
      }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: schemaQuery }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    console.log('✅ GraphQL schema accessible');
    
    // Look for Acorns-related fields
    const queryFields = result.data.__schema.queryType.fields;
    const acornsFields = queryFields.filter(field => 
      field.name.toLowerCase().includes('acorns') || 
      field.name.toLowerCase().includes('user') ||
      field.name.toLowerCase().includes('purchase') ||
      field.name.toLowerCase().includes('investment')
    );
    
    if (acornsFields.length > 0) {
      console.log(`✅ Found ${acornsFields.length} potential Acorns-related fields:`);
      acornsFields.forEach(field => {
        console.log(`   - ${field.name}`);
      });
    } else {
      console.log('⚠️  No obvious Acorns-related fields found in schema');
      console.log('   Available fields:', queryFields.slice(0, 10).map(f => f.name).join(', '));
    }

  } catch (error) {
    console.log(`❌ GraphQL Acorns test failed: ${error.message}`);
  }
}

async function testTokenIntegration() {
  console.log('\n💰 Testing Token Integration...\n');

  try {
    const client = createPublicClient({
      chain: scrollSepolia,
      transport: http(SCROLL_SEPOLIA_RPC),
    });

    // Test MockUSDC token
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
    console.log(`❌ Token integration test failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Acorns & MockMorpho Integration Test\n');
  console.log('='.repeat(60));
  
  console.log(`📍 Chain: Scroll Sepolia (534351)`);
  console.log(`📍 RPC: ${SCROLL_SEPOLIA_RPC}`);
  console.log(`📍 AcornsVault: ${ACORNS_VAULT_ADDRESS}`);
  console.log(`📍 MockMorpho: ${MOCK_MORPHO_ADDRESS}`);
  console.log(`📍 MockUSDC: ${MOCK_USDC_ADDRESS}`);
  console.log(`📍 GraphQL: ${GRAPHQL_ENDPOINT}`);
  console.log('='.repeat(60));

  await testAcornsContract();
  await testMockMorphoContract();
  await testTokenIntegration();
  await testGraphQLAcornsQueries();

  console.log('\n🎉 Acorns integration test completed!');
  console.log('\nNext steps:');
  console.log('1. Start the frontend: pnpm dev');
  console.log('2. Connect your wallet to Scroll Sepolia');
  console.log('3. Navigate to /acorns-demo to test the integration');
  console.log('4. Register as an Acorns user and test micro-investing');
  console.log('5. Test MockMorpho yield generation features');
}

// Run the test
main().catch(console.error);
