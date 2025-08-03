import { Address } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import { 
  CONTRACT_ADDRESSES, 
  GOAL_FINANCE_CONTRACT, 
  BILL_SPLITTER_CONTRACT, 
  FRIENDS_REGISTRY_CONTRACT, 
  DEBT_MANAGER_CONTRACT,
  ERC20_CONTRACT 
} from '@/config/contracts';
import { 
  goalFinanceClient, 
  billSplitterClient, 
  friendsRegistryClient, 
  debtManagerClient,
  graphqlCache 
} from '@/lib/graphql';

// Unified contract interface that combines contract calls with GraphQL data
export class UnifiedContractInterface {
  private chainId: number;
  private userAddress?: Address;

  constructor(chainId: number, userAddress?: Address) {
    this.chainId = chainId;
    this.userAddress = userAddress;
  }

  // Get contract addresses for current chain
  getContractAddresses() {
    return CONTRACT_ADDRESSES[this.chainId as keyof typeof CONTRACT_ADDRESSES] || {};
  }

  // Check if contracts are deployed on current chain
  isChainSupported(): boolean {
    const addresses = this.getContractAddresses();
    return !!(addresses.GOAL_FINANCE && addresses.BILL_SPLITTER && addresses.FRIENDS_REGISTRY && addresses.DEBT_MANAGER);
  }

  // Get contract configuration for current chain
  getGoalFinanceContract() {
    const addresses = this.getContractAddresses();
    return {
      address: addresses.GOAL_FINANCE as Address,
      abi: GOAL_FINANCE_CONTRACT.abi,
    };
  }

  getBillSplitterContract() {
    const addresses = this.getContractAddresses();
    return {
      address: addresses.BILL_SPLITTER as Address,
      abi: BILL_SPLITTER_CONTRACT.abi,
    };
  }

  getFriendsRegistryContract() {
    const addresses = this.getContractAddresses();
    return {
      address: addresses.FRIENDS_REGISTRY as Address,
      abi: FRIENDS_REGISTRY_CONTRACT.abi,
    };
  }

  getDebtManagerContract() {
    const addresses = this.getContractAddresses();
    return {
      address: addresses.DEBT_MANAGER as Address,
      abi: DEBT_MANAGER_CONTRACT.abi,
    };
  }

  getERC20Contract(tokenAddress: Address) {
    return {
      address: tokenAddress,
      abi: ERC20_CONTRACT.abi,
    };
  }

  // Enhanced data fetching methods that combine contract and GraphQL data
  async getEnhancedVaultData(vaultId: bigint) {
    const cacheKey = `enhanced-vault-${vaultId}-${this.chainId}`;
    const cached = graphqlCache.get(cacheKey);
    if (cached) return cached;

    try {
      // This would combine contract calls with GraphQL data
      const [contractData, graphqlData] = await Promise.all([
        // Contract call would go here
        Promise.resolve(null),
        goalFinanceClient.query(`
          query GetVault($id: ID!) {
            vault(id: $id) {
              id
              name
              description
              creator
              token
              targetAmount
              totalDeposited
              deadline
              memberCount
              status
              members {
                user
                depositedAmount
                joinedAt
              }
              transactions {
                id
                type
                amount
                timestamp
                user
              }
            }
          }
        `, { id: vaultId.toString() })
      ]);

      const enhancedData = {
        contractData,
        graphqlData: graphqlData.vault,
        lastUpdated: Date.now(),
      };

      graphqlCache.set(cacheKey, enhancedData, 30000); // 30 second cache
      return enhancedData;
    } catch (error) {
      console.error('Failed to fetch enhanced vault data:', error);
      throw error;
    }
  }

  async getEnhancedUserBills() {
    if (!this.userAddress) throw new Error('User address required');

    const cacheKey = `enhanced-bills-${this.userAddress}-${this.chainId}`;
    const cached = graphqlCache.get(cacheKey);
    if (cached) return cached;

    try {
      const [contractData, graphqlData] = await Promise.all([
        // Contract call would go here
        Promise.resolve([]),
        billSplitterClient.query(`
          query GetUserBills($user: Bytes!) {
            bills(where: { or: [{ creator: $user }, { participants_contains: [$user] }] }) {
              id
              creator
              title
              description
              totalAmount
              token
              splitMode
              category
              participants
              settled
              createdAt
              settlements {
                participant
                amount
                timestamp
              }
            }
          }
        `, { user: this.userAddress.toLowerCase() })
      ]);

      const enhancedData = {
        contractData,
        graphqlData: graphqlData.bills || [],
        lastUpdated: Date.now(),
      };

      graphqlCache.set(cacheKey, enhancedData, 60000); // 1 minute cache
      return enhancedData;
    } catch (error) {
      console.error('Failed to fetch enhanced bills data:', error);
      throw error;
    }
  }

  async getEnhancedUserDebts() {
    if (!this.userAddress) throw new Error('User address required');

    const cacheKey = `enhanced-debts-${this.userAddress}-${this.chainId}`;
    const cached = graphqlCache.get(cacheKey);
    if (cached) return cached;

    try {
      const [contractData, graphqlData] = await Promise.all([
        // Contract call would go here
        Promise.resolve([]),
        debtManagerClient.query(`
          query GetUserDebts($user: Bytes!) {
            debts(where: { or: [{ creditor: $user }, { debtor: $user }] }) {
              id
              creditor
              debtor
              token
              amount
              description
              category
              billId
              settled
              createdAt
              settledAt
            }
          }
        `, { user: this.userAddress.toLowerCase() })
      ]);

      const enhancedData = {
        contractData,
        graphqlData: graphqlData.debts || [],
        lastUpdated: Date.now(),
      };

      graphqlCache.set(cacheKey, enhancedData, 60000); // 1 minute cache
      return enhancedData;
    } catch (error) {
      console.error('Failed to fetch enhanced debts data:', error);
      throw error;
    }
  }

  async getEnhancedUserFriends() {
    if (!this.userAddress) throw new Error('User address required');

    const cacheKey = `enhanced-friends-${this.userAddress}-${this.chainId}`;
    const cached = graphqlCache.get(cacheKey);
    if (cached) return cached;

    try {
      const [contractData, graphqlData] = await Promise.all([
        // Contract call would go here
        Promise.resolve([]),
        friendsRegistryClient.query(`
          query GetUserFriends($user: Bytes!) {
            friends(where: { user: $user, isActive: true }) {
              id
              user
              friend
              displayName
              addedAt
              isActive
            }
          }
        `, { user: this.userAddress.toLowerCase() })
      ]);

      const enhancedData = {
        contractData,
        graphqlData: graphqlData.friends || [],
        lastUpdated: Date.now(),
      };

      graphqlCache.set(cacheKey, enhancedData, 60000); // 1 minute cache
      return enhancedData;
    } catch (error) {
      console.error('Failed to fetch enhanced friends data:', error);
      throw error;
    }
  }

  // Utility methods for data processing
  processVaultData(contractData: any, graphqlData: any) {
    return {
      ...contractData,
      enhancedMembers: graphqlData?.members || [],
      recentTransactions: graphqlData?.transactions?.slice(-10) || [],
      progress: {
        percentage: contractData ? Number(contractData.totalDeposited * 100n / contractData.config.targetAmount) : 0,
        isGoalReached: contractData ? contractData.totalDeposited >= contractData.config.targetAmount : false,
        timeRemaining: contractData ? contractData.config.deadline - BigInt(Math.floor(Date.now() / 1000)) : 0n,
      },
    };
  }

  processBillData(contractData: any[], graphqlData: any[]) {
    return graphqlData.map(bill => {
      const contractBill = contractData.find(cb => cb.id === bill.id);
      return {
        ...bill,
        contractData: contractBill,
        settlementProgress: {
          totalSettled: bill.settlements?.reduce((sum: number, s: any) => sum + Number(s.amount), 0) || 0,
          participantsSettled: bill.settlements?.length || 0,
          totalParticipants: bill.participants?.length || 0,
        },
      };
    });
  }

  processDebtData(contractData: any[], graphqlData: any[]) {
    const debtsByToken: Record<string, { owedTo: bigint; owedFrom: bigint }> = {};
    
    graphqlData.forEach(debt => {
      if (!debtsByToken[debt.token]) {
        debtsByToken[debt.token] = { owedTo: 0n, owedFrom: 0n };
      }
      
      if (debt.creditor.toLowerCase() === this.userAddress?.toLowerCase()) {
        debtsByToken[debt.token].owedTo += BigInt(debt.amount);
      } else {
        debtsByToken[debt.token].owedFrom += BigInt(debt.amount);
      }
    });

    return {
      debts: graphqlData,
      summary: debtsByToken,
      netBalances: Object.entries(debtsByToken).reduce((acc, [token, amounts]) => {
        acc[token] = amounts.owedTo - amounts.owedFrom;
        return acc;
      }, {} as Record<string, bigint>),
    };
  }

  // Cache management
  clearCache() {
    graphqlCache.clear();
  }

  clearUserCache() {
    if (!this.userAddress) return;
    
    const userCacheKeys = [
      `enhanced-bills-${this.userAddress}-${this.chainId}`,
      `enhanced-debts-${this.userAddress}-${this.chainId}`,
      `enhanced-friends-${this.userAddress}-${this.chainId}`,
    ];
    
    userCacheKeys.forEach(key => graphqlCache.delete(key));
  }
}

// Hook for using the unified contract interface
export function useUnifiedContractInterface() {
  const { address } = useAccount();
  const chainId = useChainId();

  const contractInterface = new UnifiedContractInterface(chainId, address);

  return {
    contractInterface,
    isSupported: contractInterface.isChainSupported(),
    addresses: contractInterface.getContractAddresses(),
    contracts: {
      goalFinance: contractInterface.getGoalFinanceContract(),
      billSplitter: contractInterface.getBillSplitterContract(),
      friendsRegistry: contractInterface.getFriendsRegistryContract(),
      debtManager: contractInterface.getDebtManagerContract(),
    },
  };
}

// Export singleton instance for use outside of React components
export const createContractInterface = (chainId: number, userAddress?: Address) => {
  return new UnifiedContractInterface(chainId, userAddress);
};
