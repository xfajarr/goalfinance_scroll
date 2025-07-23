import GoalFinanceABI from '../contracts/abis/GoalFinance.json';

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Mantle Testnet
  5003: {
    GOAL_FINANCE: '0xaCCB3947D19266D257Afc253D0DA9B4FB5810CAf' as const,
    USDC: '0x77B2693ea846571259FA89CBe4DD8e18f3F61787' as const,
  },
} as const;

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES;

// Contract configuration
export const GOAL_FINANCE_CONTRACT = {
  address: '0xaCCB3947D19266D257Afc253D0DA9B4FB5810CAf' as const,
  abi: GoalFinanceABI,
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
} as const;

// Contract constants
export const CONTRACT_CONSTANTS = {
  BASIS_POINTS: 10000,
  MIN_PENALTY_RATE: 100, // 1%
  MAX_PENALTY_RATE: 1000, // 10%
  DEFAULT_PENALTY_RATE: 200, // 2%
} as const;
