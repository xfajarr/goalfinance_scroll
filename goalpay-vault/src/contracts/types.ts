import { Address } from 'viem';

// Enums from smart contracts
export enum GoalType {
  GROUP = 0,
  PERSONAL = 1
}

export enum VaultStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  FAILED = 2,
  CANCELLED = 3,
}

// Factory types
export interface VaultInfo {
  vaultAddress: Address;
  creator: Address;
  vaultName: string;
  description: string;
  targetAmount: bigint;
  deadline: bigint;
  createdAt: bigint;
  isPublic: boolean;
  isActive: boolean;
  status: VaultStatus;
  memberCount: bigint;
  token: Address;
  tokenSymbol: string;
  goalType: GoalType;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  isActive: boolean;
  addedAt: bigint;
}

// Vault types
export interface VaultDetails {
  name: string;
  description: string;
  creator: Address;
  targetAmount: bigint;
  currentAmount: bigint;
  deadline: bigint;
  createdAt: bigint;
  status: VaultStatus;
  isPublic: boolean;
  memberCount: bigint;
  token: Address;
  goalType: GoalType;
}

export interface MemberInfo {
  member: Address;
  contribution: bigint;
  personalGoalAmount: bigint;
  joinedAt: bigint;
  isActive: boolean;
  hasReachedPersonalGoal: boolean;
}

export interface PenaltyInfo {
  amount: bigint;
  releaseTime: bigint;
  claimed: boolean;
}

// Legacy types for backward compatibility
export interface VaultData {
  id: bigint;
  name: string;
  description: string;
  creator: Address;
  goalAmount: bigint;
  currentAmount: bigint;
  deadline: bigint;
  status: VaultStatus;
  isPublic: boolean;
  memberCount: bigint;
  yieldRate: bigint; // In basis points (e.g., 800 = 8%)
  createdAt: bigint;
}

export interface MemberData {
  member: Address;
  contribution: bigint;
  joinedAt: bigint;
  isActive: boolean;
}

// Transaction types for vault operations
export interface AddFundsParams {
  vaultId: bigint;
  amount: bigint;
}

export interface CreateVaultParams {
  vaultName: string;
  description: string;
  targetAmount: bigint;
  deadline: bigint;
  isPublic: boolean;
  goalType: GoalType;
  token: Address;
}

// Legacy interface for backward compatibility
export interface LegacyCreateVaultParams {
  name: string;
  description: string;
  goalAmount: bigint;
  deadline: bigint;
  isPublic: boolean;
  initialContribution: bigint;
}

export interface ShareVaultData {
  vaultId: bigint;
  inviteCode: string;
  shareUrl: string;
  qrCodeData: string;
}

// Event types
export interface VaultCreatedEvent {
  vaultId: bigint;
  creator: Address;
  name: string;
  goalAmount: bigint;
  deadline: bigint;
}

export interface FundsAddedEvent {
  vaultId: bigint;
  member: Address;
  amount: bigint;
  newTotal: bigint;
}

export interface VaultCompletedEvent {
  vaultId: bigint;
  finalAmount: bigint;
  yieldEarned: bigint;
}

// Hook return types
export interface UseVaultDataReturn {
  vault: VaultData | null;
  members: MemberData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseAddFundsReturn {
  addFunds: (params: AddFundsParams) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  txHash: string | null;
}

export interface UseShareVaultReturn {
  generateShareData: (vaultId: bigint) => Promise<ShareVaultData>;
  isLoading: boolean;
  error: Error | null;
}
