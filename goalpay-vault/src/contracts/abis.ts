// Vault Factory Contract ABI
export const VAULT_FACTORY_ABI = [
  {
    type: 'function',
    name: 'createVault',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'goalAmount', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'isPublic', type: 'bool' },
    ],
    outputs: [{ name: 'vaultId', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getVault',
    inputs: [{ name: 'vaultId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'creator', type: 'address' },
          { name: 'goalAmount', type: 'uint256' },
          { name: 'currentAmount', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'isPublic', type: 'bool' },
          { name: 'memberCount', type: 'uint256' },
          { name: 'yieldRate', type: 'uint256' },
          { name: 'createdAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'addFunds',
    inputs: [
      { name: 'vaultId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getVaultMembers',
    inputs: [{ name: 'vaultId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'member', type: 'address' },
          { name: 'contribution', type: 'uint256' },
          { name: 'joinedAt', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'generateInviteCode',
    inputs: [{ name: 'vaultId', type: 'uint256' }],
    outputs: [{ name: 'inviteCode', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'VaultCreated',
    inputs: [
      { name: 'vaultId', type: 'uint256', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'goalAmount', type: 'uint256', indexed: false },
      { name: 'deadline', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'FundsAdded',
    inputs: [
      { name: 'vaultId', type: 'uint256', indexed: true },
      { name: 'member', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'newTotal', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'VaultCompleted',
    inputs: [
      { name: 'vaultId', type: 'uint256', indexed: true },
      { name: 'finalAmount', type: 'uint256', indexed: false },
      { name: 'yieldEarned', type: 'uint256', indexed: false },
    ],
  },
] as const;

// ERC20 USDC Contract ABI (minimal)
export const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const;
