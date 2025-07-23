// Simple script to test contract connection
import { createPublicClient, http } from 'viem';
import { mantleSepolia } from './config/wagmi';
import GoalFinanceABI from './contracts/abis/GoalFinance.json';

const CONTRACT_ADDRESS = '0xaCCB3947D19266D257Afc253D0DA9B4FB5810CAf';

async function testContractConnection() {
  console.log('Testing contract connection...');
  
  const client = createPublicClient({
    chain: mantleSepolia,
    transport: http(),
  });

  try {
    // Test 1: Get total vault count
    console.log('Test 1: Getting total vault count...');
    const totalCount = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: GoalFinanceABI,
      functionName: 'getTotalVaultCount',
    });
    console.log('Total vault count:', totalCount);

    // Test 2: Get all vaults
    console.log('Test 2: Getting all vaults...');
    const allVaults = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: GoalFinanceABI,
      functionName: 'getAllVaults',
    });
    console.log('All vaults:', allVaults);

    // Test 3: Try to get vault 1 if it exists
    if (totalCount && Number(totalCount) > 0) {
      console.log('Test 3: Getting vault 1...');
      const vault1 = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: GoalFinanceABI,
        functionName: 'getVault',
        args: [1n],
      });
      console.log('Vault 1 data:', vault1);
    }

    console.log('Contract connection test completed successfully!');
  } catch (error) {
    console.error('Contract connection test failed:', error);
  }
}

// Export for use in browser console
(window as any).testContractConnection = testContractConnection;

export { testContractConnection };
