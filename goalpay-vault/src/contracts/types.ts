import { Address } from 'viem';

// Enums from smart contracts (updated to match new GoalFinance V2 contract)
export enum GoalType {
  PERSONAL = 0,
  GROUP = 1
}

export enum Visibility {
  PUBLIC = 0,
  PRIVATE = 1
}

export enum VaultStatus {
  ACTIVE = 0,
  SUCCESS = 1,
  FAILED = 2
}

// VaultConfig struct from the new contract
export interface VaultConfig {
  name: string;
  description: string;
  token: Address;
  goalType: GoalType;
  visibility: Visibility;
  targetAmount: bigint;
  deadline: bigint;
  penaltyRate: bigint; // In basis points (100-1000 = 1%-10%)
}

// Vault struct from the new contract
export interface Vault {
  id: bigint;
  config: VaultConfig;
  creator: Address;
  totalDeposited: bigint;
  memberCount: bigint;
  status: VaultStatus;
  inviteCode: string; // bytes32 as hex string
  createdAt: bigint;
}

// Member struct from the new contract
export interface Member {
  depositedAmount: bigint;
  targetShare: bigint;
  joinedAt: bigint;
  hasWithdrawn: boolean;
  penaltyAmount: bigint;
}

// PenaltyInfo struct from the new contract
export interface PenaltyInfo {
  token: Address;
  amount: bigint;
  unlockTime: bigint;
  claimed: boolean;
}

// Create vault return type for new contract
export interface CreateVaultResult {
  vaultId: bigint;
  inviteCode: string; // bytes32 as hex string
}

// Parameters for creating a vault with new contract
export interface CreateVaultParams {
  config: VaultConfig;
}

// Parameters for joining a vault (native token)
export interface JoinVaultParams {
  vaultId: bigint;
  inviteCode: string; // bytes32 as hex string, use "0x00...00" for public vaults
  value: bigint; // Amount of native token to send
}

// Parameters for joining a vault (ERC20 token)
export interface JoinVaultWithTokenParams {
  vaultId: bigint;
  amount: bigint;
  inviteCode: string; // bytes32 as hex string
}

// Parameters for adding funds (native token)
export interface AddNativeFundsParams {
  vaultId: bigint;
  value: bigint; // Amount of native token to send
}

// Parameters for adding funds (ERC20 token)
export interface AddTokenFundsParams {
  vaultId: bigint;
  amount: bigint;
}

// Parameters for withdrawals
export interface WithdrawParams {
  vaultId: bigint;
}

// Token information
export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address: Address;
  isNative: boolean;
}

// Hook return types for new contract
export interface UseVaultDataReturn {
  vault: Vault | null;
  members: Address[];
  memberData: Record<Address, Member>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseCreateVaultReturn {
  createVault: (params: CreateVaultParams) => Promise<CreateVaultResult>;
  isLoading: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash: string | null;
  reset: () => void;
}

export interface UseJoinVaultReturn {
  joinVault: (params: JoinVaultParams) => Promise<void>;
  joinVaultWithToken: (params: JoinVaultWithTokenParams) => Promise<void>;
  isLoading: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash: string | null;
  reset: () => void;
}

export interface UseAddFundsReturn {
  addNativeFunds: (params: AddNativeFundsParams) => Promise<void>;
  addTokenFunds: (params: AddTokenFundsParams) => Promise<void>;
  isLoading: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash: string | null;
  reset: () => void;
}

export interface UseWithdrawReturn {
  withdraw: (params: WithdrawParams) => Promise<void>;
  withdrawEarly: (params: WithdrawParams) => Promise<void>;
  isLoading: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash: string | null;
  reset: () => void;
}

// Utility types for vault operations
export interface ShareVaultData {
  vaultId: bigint;
  inviteCode: string;
  shareUrl: string;
  qrCodeData: string;
}

// Pagination for vault discovery
export interface VaultPaginationParams {
  offset: bigint;
  limit: bigint;
}

export interface PaginatedVaultResult {
  vaultIds: bigint[];
  hasMore: boolean;
}

// Vault progress and status helpers
export interface VaultProgress {
  percentage: number; // 0-100
  basisPoints: bigint; // 0-10000 from contract
  isGoalReached: boolean;
  timeRemaining: bigint; // seconds
  isExpired: boolean;
}

// Event types for new contract
export interface VaultCreatedEvent {
  vaultId: bigint;
  creator: Address;
  token: Address;
  config: VaultConfig;
  inviteCode: string;
}

export interface MemberJoinedEvent {
  vaultId: bigint;
  member: Address;
  token: Address;
  depositAmount: bigint;
  memberCount: bigint;
}

export interface FundsDepositedEvent {
  vaultId: bigint;
  member: Address;
  token: Address;
  amount: bigint;
  totalDeposited: bigint;
}

export interface GoalReachedEvent {
  vaultId: bigint;
  token: Address;
  totalAmount: bigint;
}

export interface WithdrawalEvent {
  vaultId: bigint;
  member: Address;
  token: Address;
  amount: bigint;
}

export interface EarlyWithdrawalEvent {
  vaultId: bigint;
  member: Address;
  token: Address;
  amount: bigint;
  penalty: bigint;
}

// Constants for the new contract
export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const;
export const EMPTY_INVITE_CODE = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;
