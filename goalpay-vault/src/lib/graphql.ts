import { INDEXER_ENDPOINTS } from '@/config/contracts';

// GraphQL client configuration
export class GraphQLClient {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async query<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL query failed:', error);
      throw error;
    }
  }
}

// Create clients for each indexer
export const goalFinanceClient = new GraphQLClient(INDEXER_ENDPOINTS.GOAL_FINANCE_CORE);
export const acornsClient = new GraphQLClient(INDEXER_ENDPOINTS.GOAL_FINANCE_CORE); // Using same endpoint for Acorns
export const billSplitterClient = new GraphQLClient(INDEXER_ENDPOINTS.BILL_SPLITTER);
export const friendsRegistryClient = new GraphQLClient(INDEXER_ENDPOINTS.FRIENDS_REGISTRY);
export const debtManagerClient = new GraphQLClient(INDEXER_ENDPOINTS.DEBT_MANAGER);

// Common GraphQL fragments
export const VAULT_FRAGMENT = `
  fragment VaultFragment on Vault {
    id
    name
    description
    creator
    token
    goalType
    visibility
    targetAmount
    totalDeposited
    deadline
    memberCount
    status
    inviteCode
    createdAt
    updatedAt
  }
`;

export const MEMBER_FRAGMENT = `
  fragment MemberFragment on Member {
    id
    vault
    user
    depositedAmount
    targetShare
    joinedAt
    hasWithdrawn
    penaltyAmount
  }
`;

export const BILL_FRAGMENT = `
  fragment BillFragment on Bill {
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
    updatedAt
  }
`;

export const DEBT_FRAGMENT = `
  fragment DebtFragment on Debt {
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
`;

export const FRIEND_FRAGMENT = `
  fragment FriendFragment on Friend {
    id
    user
    friend
    displayName
    addedAt
    isActive
  }
`;

// Acorns GraphQL fragments based on indexed events
export const ACORNS_USER_REGISTERED_FRAGMENT = `
  fragment AcornsUserRegisteredFragment on AcornsVault_UserRegistered {
    id
    user
    portfolioType
    block_number
    block_timestamp
    transaction_hash
  }
`;

export const ACORNS_PURCHASE_FRAGMENT = `
  fragment AcornsPurchaseFragment on AcornsVault_PurchaseRecorded {
    id
    user
    amount
    roundUpAmount
    merchant
    block_number
    block_timestamp
    transaction_hash
  }
`;

export const ACORNS_ROUNDUPS_INVESTED_FRAGMENT = `
  fragment AcornsRoundUpsInvestedFragment on AcornsVault_RoundUpsInvested {
    id
    user
    amount
    portfolioType
    block_number
    block_timestamp
    transaction_hash
  }
`;

export const ACORNS_YIELD_CLAIMED_FRAGMENT = `
  fragment AcornsYieldClaimedFragment on AcornsVault_YieldClaimed {
    id
    user
    amount
    block_number
    block_timestamp
    transaction_hash
  }
`;

// GoalFinance Core Queries
export const GET_VAULTS_QUERY = `
  ${VAULT_FRAGMENT}
  query GetVaults($first: Int, $skip: Int, $where: Vault_filter, $orderBy: Vault_orderBy) {
    vaults(first: $first, skip: $skip, where: $where, orderBy: $orderBy) {
      ...VaultFragment
    }
  }
`;

export const GET_VAULT_BY_ID_QUERY = `
  ${VAULT_FRAGMENT}
  ${MEMBER_FRAGMENT}
  query GetVaultById($id: ID!) {
    vault(id: $id) {
      ...VaultFragment
      members {
        ...MemberFragment
      }
    }
  }
`;

export const GET_USER_VAULTS_QUERY = `
  ${VAULT_FRAGMENT}
  query GetUserVaults($user: Bytes!) {
    vaults(where: { creator: $user }) {
      ...VaultFragment
    }
    members(where: { user: $user }) {
      vault {
        ...VaultFragment
      }
    }
  }
`;

// BillSplitter Queries
export const GET_BILLS_QUERY = `
  ${BILL_FRAGMENT}
  query GetBills($first: Int, $skip: Int, $where: Bill_filter) {
    bills(first: $first, skip: $skip, where: $where) {
      ...BillFragment
    }
  }
`;

export const GET_USER_BILLS_QUERY = `
  ${BILL_FRAGMENT}
  query GetUserBills($user: Bytes!) {
    bills(where: { or: [{ creator: $user }, { participants_contains: [$user] }] }) {
      ...BillFragment
    }
  }
`;

// DebtManager Queries
export const GET_DEBTS_QUERY = `
  ${DEBT_FRAGMENT}
  query GetDebts($first: Int, $skip: Int, $where: Debt_filter) {
    debts(first: $first, skip: $skip, where: $where) {
      ...DebtFragment
    }
  }
`;

export const GET_USER_DEBTS_QUERY = `
  ${DEBT_FRAGMENT}
  query GetUserDebts($user: Bytes!) {
    debts(where: { or: [{ creditor: $user }, { debtor: $user }] }) {
      ...DebtFragment
    }
  }
`;

// FriendsRegistry Queries
export const GET_FRIENDS_QUERY = `
  ${FRIEND_FRAGMENT}
  query GetFriends($user: Bytes!) {
    friends(where: { user: $user, isActive: true }) {
      ...FriendFragment
    }
  }
`;

export const SEARCH_FRIENDS_QUERY = `
  ${FRIEND_FRAGMENT}
  query SearchFriends($user: Bytes!, $searchTerm: String!) {
    friends(where: { user: $user, displayName_contains_nocase: $searchTerm, isActive: true }) {
      ...FriendFragment
    }
  }
`;

// Acorns Queries using indexed events
export const GET_USER_REGISTRATION_QUERY = `
  ${ACORNS_USER_REGISTERED_FRAGMENT}
  query GetUserRegistration($user: String!) {
    AcornsVault_UserRegistered(where: { user: { _eq: $user } }, limit: 1, order_by: { block_timestamp: desc }) {
      ...AcornsUserRegisteredFragment
    }
  }
`;

export const GET_USER_PURCHASES_QUERY = `
  ${ACORNS_PURCHASE_FRAGMENT}
  query GetUserPurchases($user: String!, $limit: Int, $offset: Int) {
    AcornsVault_PurchaseRecorded(
      where: { user: { _eq: $user } },
      limit: $limit,
      offset: $offset,
      order_by: { block_timestamp: desc }
    ) {
      ...AcornsPurchaseFragment
    }
  }
`;

export const GET_USER_INVESTMENTS_QUERY = `
  ${ACORNS_ROUNDUPS_INVESTED_FRAGMENT}
  query GetUserInvestments($user: String!, $limit: Int, $offset: Int) {
    AcornsVault_RoundUpsInvested(
      where: { user: { _eq: $user } },
      limit: $limit,
      offset: $offset,
      order_by: { block_timestamp: desc }
    ) {
      ...AcornsRoundUpsInvestedFragment
    }
  }
`;

export const GET_USER_YIELD_CLAIMS_QUERY = `
  ${ACORNS_YIELD_CLAIMED_FRAGMENT}
  query GetUserYieldClaims($user: String!, $limit: Int, $offset: Int) {
    AcornsVault_YieldClaimed(
      where: { user: { _eq: $user } },
      limit: $limit,
      offset: $offset,
      order_by: { block_timestamp: desc }
    ) {
      ...AcornsYieldClaimedFragment
    }
  }
`;

export const GET_PORTFOLIO_ACTIVITY_QUERY = `
  query GetPortfolioActivity($user: String!) {
    userRegistration: AcornsVault_UserRegistered(where: { user: { _eq: $user } }, limit: 1) {
      portfolioType
      block_timestamp
    }
    purchases: AcornsVault_PurchaseRecorded(where: { user: { _eq: $user } }, order_by: { block_timestamp: desc }) {
      amount
      roundUpAmount
      block_timestamp
    }
    investments: AcornsVault_RoundUpsInvested(where: { user: { _eq: $user } }, order_by: { block_timestamp: desc }) {
      amount
      block_timestamp
    }
    yieldClaims: AcornsVault_YieldClaimed(where: { user: { _eq: $user } }, order_by: { block_timestamp: desc }) {
      amount
      block_timestamp
    }
  }
`;

// Utility functions for GraphQL queries
export const queryVaults = async (variables?: {
  first?: number;
  skip?: number;
  where?: any;
  orderBy?: string;
}) => {
  return goalFinanceClient.query(GET_VAULTS_QUERY, variables);
};

export const queryVaultById = async (id: string) => {
  return goalFinanceClient.query(GET_VAULT_BY_ID_QUERY, { id });
};

export const queryUserVaults = async (user: string) => {
  return goalFinanceClient.query(GET_USER_VAULTS_QUERY, { user });
};

export const queryUserBills = async (user: string) => {
  return billSplitterClient.query(GET_USER_BILLS_QUERY, { user });
};

export const queryUserDebts = async (user: string) => {
  return debtManagerClient.query(GET_USER_DEBTS_QUERY, { user });
};

export const queryUserFriends = async (user: string) => {
  return friendsRegistryClient.query(GET_FRIENDS_QUERY, { user });
};

export const searchFriends = async (user: string, searchTerm: string) => {
  return friendsRegistryClient.query(SEARCH_FRIENDS_QUERY, { user, searchTerm });
};

// Acorns utility functions
export const queryUserRegistration = async (user: string) => {
  return acornsClient.query(GET_USER_REGISTRATION_QUERY, { user });
};

export const queryUserPurchases = async (user: string, variables?: { limit?: number; offset?: number }) => {
  return acornsClient.query(GET_USER_PURCHASES_QUERY, { user, limit: 50, offset: 0, ...variables });
};

export const queryUserInvestments = async (user: string, variables?: { limit?: number; offset?: number }) => {
  return acornsClient.query(GET_USER_INVESTMENTS_QUERY, { user, limit: 50, offset: 0, ...variables });
};

export const queryUserYieldClaims = async (user: string, variables?: { limit?: number; offset?: number }) => {
  return acornsClient.query(GET_USER_YIELD_CLAIMS_QUERY, { user, limit: 50, offset: 0, ...variables });
};

export const queryPortfolioActivity = async (user: string) => {
  return acornsClient.query(GET_PORTFOLIO_ACTIVITY_QUERY, { user });
};

// Error handling utility
export const handleGraphQLError = (error: any) => {
  console.error('GraphQL Error:', error);
  
  if (error.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  return 'An error occurred while fetching data. Please try again.';
};

// Cache utility for GraphQL responses
export class GraphQLCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 60000) { // Default 1 minute TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const graphqlCache = new GraphQLCache();
