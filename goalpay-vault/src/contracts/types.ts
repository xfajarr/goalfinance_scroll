import { Address } from 'viem';

// Vault status enum
export enum VaultStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  FAILED = 2,
  CANCELLED = 3,
}

// Vault data structure
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

// Member data structure
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
