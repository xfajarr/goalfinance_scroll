import { describe, it, expect } from 'vitest';
import { formatUnits } from 'viem';

// Mock vault data for testing
const mockVaultData = [
  {
    id: 1n,
    name: "Test Vault 1",
    description: "Test description",
    creator: "0x123" as const,
    goalAmount: 1000000000n, // 1000 USDC (6 decimals)
    currentAmount: 500000000n, // 500 USDC (6 decimals)
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400), // 1 day from now
    status: 0, // ACTIVE
    isPublic: true,
    memberCount: 3n,
    yieldRate: 0n,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
  },
  {
    id: 2n,
    name: "Test Vault 2",
    description: "Test description 2",
    creator: "0x456" as const,
    goalAmount: 2000000000n, // 2000 USDC (6 decimals)
    currentAmount: 1500000000n, // 1500 USDC (6 decimals)
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400), // 1 day from now
    status: 1, // COMPLETED
    isPublic: true,
    memberCount: 5n,
    yieldRate: 0n,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
  },
];

// Function to calculate stats (extracted from Dashboard component)
const calculateStats = (userVaults: typeof mockVaultData) => {
  if (!userVaults || userVaults.length === 0) {
    return {
      totalSaved: 0,
      earnedYield: 0,
      activeGoals: 0,
      friends: 0
    };
  }

  const totalSaved = userVaults.reduce((sum, vault) => {
    // Convert from USDC wei (6 decimals) to dollars
    return sum + Number(formatUnits(vault.currentAmount, 6));
  }, 0);

  const activeGoals = userVaults.filter(vault => 
    vault.status === 0 // VaultStatus.ACTIVE = 0
  ).length;

  // For now, yield is 0 as it's a future feature
  const earnedYield = 0;

  // Friends count - calculate total members across all vaults
  // This gives an approximation of social connections
  const friends = userVaults.reduce((sum, vault) => {
    return sum + Number(vault.memberCount);
  }, 0);

  return {
    totalSaved,
    earnedYield,
    activeGoals,
    friends
  };
};

describe('Dashboard Statistics', () => {
  it('should calculate total saved correctly', () => {
    const stats = calculateStats(mockVaultData);
    
    // 500 USDC + 1500 USDC = 2000 USDC
    expect(stats.totalSaved).toBe(2000);
  });

  it('should count active goals correctly', () => {
    const stats = calculateStats(mockVaultData);
    
    // Only vault 1 is active (status = 0)
    expect(stats.activeGoals).toBe(1);
  });

  it('should calculate friends count correctly', () => {
    const stats = calculateStats(mockVaultData);
    
    // 3 members + 5 members = 8 total
    expect(stats.friends).toBe(8);
  });

  it('should return zero stats for empty vault array', () => {
    const stats = calculateStats([]);
    
    expect(stats.totalSaved).toBe(0);
    expect(stats.earnedYield).toBe(0);
    expect(stats.activeGoals).toBe(0);
    expect(stats.friends).toBe(0);
  });

  it('should handle null/undefined vault data', () => {
    const stats = calculateStats(null as any);
    
    expect(stats.totalSaved).toBe(0);
    expect(stats.earnedYield).toBe(0);
    expect(stats.activeGoals).toBe(0);
    expect(stats.friends).toBe(0);
  });

  it('should handle vaults with zero amounts', () => {
    const emptyVaults = [{
      ...mockVaultData[0],
      currentAmount: 0n,
      memberCount: 0n,
      status: 0
    }];
    
    const stats = calculateStats(emptyVaults);
    
    expect(stats.totalSaved).toBe(0);
    expect(stats.activeGoals).toBe(1); // Still active
    expect(stats.friends).toBe(0);
  });
});
