export const GoalVaultFactoryABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createVault",
    "inputs": [
      {"name": "_vaultName", "type": "string", "internalType": "string"},
      {"name": "_description", "type": "string", "internalType": "string"},
      {"name": "_targetAmount", "type": "uint256", "internalType": "uint256"},
      {"name": "_deadline", "type": "uint256", "internalType": "uint256"},
      {"name": "_isPublic", "type": "bool", "internalType": "bool"},
      {"name": "_goalType", "type": "uint8", "internalType": "enum IGoalVault.GoalType"},
      {"name": "_token", "type": "address", "internalType": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getVault",
    "inputs": [{"name": "_vaultId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{
      "name": "",
      "type": "tuple",
      "internalType": "struct GoalVaultFactory.VaultInfo",
      "components": [
        {"name": "vaultAddress", "type": "address", "internalType": "address"},
        {"name": "creator", "type": "address", "internalType": "address"},
        {"name": "vaultName", "type": "string", "internalType": "string"},
        {"name": "description", "type": "string", "internalType": "string"},
        {"name": "targetAmount", "type": "uint256", "internalType": "uint256"},
        {"name": "deadline", "type": "uint256", "internalType": "uint256"},
        {"name": "createdAt", "type": "uint256", "internalType": "uint256"},
        {"name": "isPublic", "type": "bool", "internalType": "bool"},
        {"name": "isActive", "type": "bool", "internalType": "bool"},
        {"name": "status", "type": "uint8", "internalType": "enum GoalVaultFactory.VaultStatus"},
        {"name": "memberCount", "type": "uint256", "internalType": "uint256"},
        {"name": "token", "type": "address", "internalType": "address"},
        {"name": "tokenSymbol", "type": "string", "internalType": "string"},
        {"name": "goalType", "type": "uint8", "internalType": "enum IGoalVault.GoalType"}
      ]
    }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPublicVaults",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256[]", "internalType": "uint256[]"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getVaultsByCreator",
    "inputs": [{"name": "_creator", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256[]", "internalType": "uint256[]"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "generateInviteCode",
    "inputs": [{"name": "_vaultId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "bytes32", "internalType": "bytes32"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "joinVaultByInvite",
    "inputs": [{"name": "_inviteCode", "type": "bytes32", "internalType": "bytes32"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "joinVaultByInviteWithGoal",
    "inputs": [
      {"name": "_inviteCode", "type": "bytes32", "internalType": "bytes32"},
      {"name": "_personalGoalAmount", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "nextVaultId",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "VaultCreated",
    "inputs": [
      {"name": "vaultId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "vaultAddress", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "creator", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "vaultName", "type": "string", "indexed": false, "internalType": "string"},
      {"name": "description", "type": "string", "indexed": false, "internalType": "string"},
      {"name": "targetAmount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "deadline", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "isPublic", "type": "bool", "indexed": false, "internalType": "bool"},
      {"name": "token", "type": "address", "indexed": false, "internalType": "address"},
      {"name": "tokenSymbol", "type": "string", "indexed": false, "internalType": "string"},
      {"name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "VaultJoined",
    "inputs": [
      {"name": "vaultId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "member", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "inviter", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  }
] as const;
