import GoalFinanceABI from '../contracts/abis/GoalFinance.json';
import AcornsVaultABI from '../contracts/abis/AcornsVault.json';
import MockMorphoABI from '../contracts/abis/MockMorpho.json';
import BillSplitterABI from '../contracts/abis/BillSplitter.json';
import DebtManagerABI from '../contracts/abis/DebtManager.json';
import FriendsRegistryABI from '../contracts/abis/FriendsRegistry.json';
import { ERC20ABI } from '../contracts/abis/ERC20';
import { GoalVaultABI } from '../contracts/abis/GoalVault';
import { ERC20_ABI, VAULT_FACTORY_ABI } from '../contracts/abis';

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Mantle Testnet
  5003: {
    GOAL_FINANCE: '0xaCCB3947D19266D257Afc253D0DA9B4FB5810CAf' as const,
    USDC: '0x77B2693ea846571259FA89CBe4DD8e18f3F61787' as const,
    // TODO: Add deployed contract addresses
    BILL_SPLITTER: '0x0000000000000000000000000000000000000000' as const,
    DEBT_MANAGER: '0x0000000000000000000000000000000000000000' as const,
    FRIENDS_REGISTRY: '0x0000000000000000000000000000000000000000' as const,
    USDC_FAUCET: '0x0000000000000000000000000000000000000000' as const, // TODO: Deploy USDCFaucet contract
  },
  // Base Sepolia
  84532: {
    GOAL_FINANCE: '0x0000000000000000000000000000000000000000' as const,
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const,
    // TODO: Add deployed contract addresses
    BILL_SPLITTER: '0x0000000000000000000000000000000000000000' as const,
    DEBT_MANAGER: '0x0000000000000000000000000000000000000000' as const,
    FRIENDS_REGISTRY: '0x0000000000000000000000000000000000000000' as const,
    USDC_FAUCET: '0x0000000000000000000000000000000000000000' as const, // TODO: Deploy USDCFaucet contract
  },
  // Lisk Sepolia
  4202: {
    GOAL_FINANCE: '0xFe03ae72A941dFf0f07ba55b112Df6600Dd9a2f2' as const,
    BILL_SPLITTER: '0x75346BC0Aa2863CF24423E6dbA2D7374929847DB' as const,
    FRIENDS_REGISTRY: '0xD102088948108C0024444230CF87A1405986a06A' as const,
    DEBT_MANAGER: '0x7E5d8Bc253523d8E889865C7C0B903aC38346a55' as const,
    USDC: '0x8cCff0834e94BE6C68E30d2949d2f526195cB444' as const,
    USDC_FAUCET: '0x0000000000000000000000000000000000000000' as const, // TODO: Deploy USDCFaucet contract
  },
  // Scroll Sepolia
  534351: {
    GOAL_FINANCE: '0x9Dd1664238359e8d808c41Af735aa67dD91F5b7F' as const,
    ACORNS_VAULT: '0x62F86d88960F77D32c0a0a33b3f7c29cbEE384C6' as const,
    MOCK_MORPHO: '0x4fFa2a2bA2A66A5091483990a558B084B49452c2' as const,
    USDC: '0x4522b80fC6cccc35af1985982CC678CF8c466941' as const,
    USDC_FAUCET: '0x0000000000000000000000000000000000000000' as const, // TODO: Deploy USDCFaucet contract
    // TODO: Add other contract addresses when deployed
    BILL_SPLITTER: '0x0000000000000000000000000000000000000000' as const,
    DEBT_MANAGER: '0x0000000000000000000000000000000000000000' as const,
    FRIENDS_REGISTRY: '0x0000000000000000000000000000000000000000' as const,
  },
} as const;

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES;

// Contract configuration - using Scroll Sepolia addresses
export const GOAL_FINANCE_CONTRACT = {
  address: '0x9Dd1664238359e8d808c41Af735aa67dD91F5b7F' as const,
  abi: GoalFinanceABI,
} as const;

export const BILL_SPLITTER_CONTRACT = {
  address: '0x75346BC0Aa2863CF24423E6dbA2D7374929847DB' as const,
  abi: BillSplitterABI,
} as const;

export const DEBT_MANAGER_CONTRACT = {
  address: '0x7E5d8Bc253523d8E889865C7C0B903aC38346a55' as const,
  abi: DebtManagerABI,
} as const;

export const FRIENDS_REGISTRY_CONTRACT = {
  address: '0xD102088948108C0024444230CF87A1405986a06A' as const,
  abi: FriendsRegistryABI,
} as const;

// Acorns Contract configuration - using Scroll Sepolia addresses
export const ACORNS_VAULT_CONTRACT = {
  address: '0x62F86d88960F77D32c0a0a33b3f7c29cbEE384C6' as const,
  abi: AcornsVaultABI,
} as const;

export const MOCK_MORPHO_CONTRACT = {
  address: '0x4fFa2a2bA2A66A5091483990a558B084B49452c2' as const,
  abi: MockMorphoABI,
} as const;

// ERC20 Contract configuration (for USDC and other tokens)
export const ERC20_CONTRACT = {
  abi: ERC20ABI,
} as const;

// Legacy Vault Factory Contract (if needed for backward compatibility)
export const VAULT_FACTORY_CONTRACT = {
  abi: VAULT_FACTORY_ABI,
} as const;

// Individual Goal Vault Contract (for direct vault interactions)
export const GOAL_VAULT_CONTRACT = {
  abi: GoalVaultABI,
} as const;

// Native token address constant from the contract
export const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const;

// Enums from the contract (updated for V2)
export enum GoalType {
  PERSONAL = 0,
  GROUP = 1,
}

export enum Visibility {
  PUBLIC = 0,
  PRIVATE = 1,
}

export enum VaultStatus {
  ACTIVE = 0,
  SUCCESS = 1,
  FAILED = 2,
}

// Bill Splitter enums
export enum SplitMode {
  EQUAL = 0,
  PERCENTAGE = 1,
  EXACT = 2,
}

export enum BillStatus {
  ACTIVE = 0,
  SETTLED = 1,
  CANCELLED = 2,
}

// Acorns enums
export enum PortfolioType {
  CONSERVATIVE = 0,
  MODERATE = 1,
  AGGRESSIVE = 2,
}

export enum InvestmentStatus {
  PENDING = 0,
  INVESTED = 1,
  FAILED = 2,
}

// Contract error signatures for better error handling (updated for V2)
export const CONTRACT_ERRORS = {
  GoalFinance__ZeroAddress: 'GoalFinance__ZeroAddress()',
  GoalFinance__InvalidAmount: 'GoalFinance__InvalidAmount()',
  GoalFinance__InvalidPenaltyRate: 'GoalFinance__InvalidPenaltyRate()',
  GoalFinance__InvalidDeadline: 'GoalFinance__InvalidDeadline()',
  GoalFinance__InvalidDuration: 'GoalFinance__InvalidDuration()',
  GoalFinance__TokenNotSupported: 'GoalFinance__TokenNotSupported()',
  GoalFinance__VaultNotFound: 'GoalFinance__VaultNotFound()',
  GoalFinance__VaultNotActive: 'GoalFinance__VaultNotActive()',
  GoalFinance__VaultExpired: 'GoalFinance__VaultExpired()',
  GoalFinance__GoalAlreadyReached: 'GoalFinance__GoalAlreadyReached()',
  GoalFinance__GoalNotReached: 'GoalFinance__GoalNotReached()',
  GoalFinance__AlreadyMember: 'GoalFinance__AlreadyMember()',
  GoalFinance__NotMember: 'GoalFinance__NotMember()',
  GoalFinance__InvalidInviteCode: 'GoalFinance__InvalidInviteCode()',
  GoalFinance__WithdrawalNotAllowed: 'GoalFinance__WithdrawalNotAllowed()',
  GoalFinance__InsufficientBalance: 'GoalFinance__InsufficientBalance()',
  GoalFinance__TransferFailed: 'GoalFinance__TransferFailed()',
  GoalFinance__ExcessiveNativeValue: 'GoalFinance__ExcessiveNativeValue()',
  GoalFinance__DuplicateToken: 'GoalFinance__DuplicateToken()',
  GoalFinance__NoClaimablePenalties: 'GoalFinance__NoClaimablePenalties()',

  // Acorns Vault errors
  AcornsVault__InsufficientBalance: 'AcornsVault__InsufficientBalance()',
  AcornsVault__InvalidAmount: 'AcornsVault__InvalidAmount()',
  AcornsVault__NoRoundUpsToInvest: 'AcornsVault__NoRoundUpsToInvest()',
  AcornsVault__NoYieldToClaim: 'AcornsVault__NoYieldToClaim()',
  AcornsVault__RecurringNotDue: 'AcornsVault__RecurringNotDue()',
  AcornsVault__TokenNotSupported: 'AcornsVault__TokenNotSupported()',
  AcornsVault__UserAlreadyRegistered: 'AcornsVault__UserAlreadyRegistered()',
  AcornsVault__UserNotRegistered: 'AcornsVault__UserNotRegistered()',

  // MockMorpho errors
  MockMorpho__InsufficientBalance: 'MockMorpho__InsufficientBalance()',
  MockMorpho__InvalidAmount: 'MockMorpho__InvalidAmount()',
  MockMorpho__MarketNotActive: 'MockMorpho__MarketNotActive()',
  MockMorpho__Unauthorized: 'MockMorpho__Unauthorized()',
} as const;

// Contract constants
export const CONTRACT_CONSTANTS = {
  BASIS_POINTS: 10000,
  MIN_PENALTY_RATE: 100, // 1%
  MAX_PENALTY_RATE: 1000, // 10%
  DEFAULT_PENALTY_RATE: 200, // 2%
} as const;

// GraphQL Indexer Endpoints for Scroll Sepolia
export const INDEXER_ENDPOINTS = {
  GOAL_FINANCE_CORE: 'https://indexer.dev.hyperindex.xyz/81da39f/v1/graphql',
  BILL_SPLITTER: 'https://indexer.dev.hyperindex.xyz/81da39f/v1/graphql', // Using same endpoint for now
  FRIENDS_REGISTRY: 'https://indexer.dev.hyperindex.xyz/81da39f/v1/graphql', // Using same endpoint for now
  DEBT_MANAGER: 'https://indexer.dev.hyperindex.xyz/81da39f/v1/graphql', // Using same endpoint for now
} as const;

// Supported tokens by chain
export const SUPPORTED_TOKENS = {
  5003: [ // Mantle Sepolia
    NATIVE_TOKEN, // MNT
    '0x77B2693ea846571259FA89CBe4DD8e18f3F61787', // Mock USDC
  ],
  84532: [ // Base Sepolia
    NATIVE_TOKEN, // ETH
    '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC
  ],
  4202: [ // Lisk Sepolia
    NATIVE_TOKEN, // LSK
    '0x8cCff0834e94BE6C68E30d2949d2f526195cB444', // MockUSDC
  ],
  534351: [ // Scroll Sepolia
    NATIVE_TOKEN, // ETH
    '0x4522b80fC6cccc35af1985982CC678CF8c466941', // MockUSDC
  ],
} as const;

// Helper function to get supported tokens for a chain
export const getSupportedTokensForChain = (chainId: number): readonly string[] => {
  return SUPPORTED_TOKENS[chainId as keyof typeof SUPPORTED_TOKENS] || SUPPORTED_TOKENS[534351]; // Default to Scroll Sepolia
};
