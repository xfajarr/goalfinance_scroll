export const GoalVaultABI = [
  {
    "type": "constructor",
    "inputs": [
      {"name": "_token", "type": "address", "internalType": "address"},
      {"name": "_name", "type": "string", "internalType": "string"},
      {"name": "_description", "type": "string", "internalType": "string"},
      {"name": "_targetAmount", "type": "uint256", "internalType": "uint256"},
      {"name": "_deadline", "type": "uint256", "internalType": "uint256"},
      {"name": "_isPublic", "type": "bool", "internalType": "bool"},
      {"name": "_goalType", "type": "uint8", "internalType": "enum IGoalVault.GoalType"},
      {"name": "_creator", "type": "address", "internalType": "address"},
      {"name": "_factory", "type": "address", "internalType": "address"}
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addFunds",
    "inputs": [{"name": "amount", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getVaultDetails",
    "inputs": [],
    "outputs": [{
      "name": "",
      "type": "tuple",
      "internalType": "struct IGoalVault.VaultDetails",
      "components": [
        {"name": "name", "type": "string", "internalType": "string"},
        {"name": "description", "type": "string", "internalType": "string"},
        {"name": "creator", "type": "address", "internalType": "address"},
        {"name": "targetAmount", "type": "uint256", "internalType": "uint256"},
        {"name": "currentAmount", "type": "uint256", "internalType": "uint256"},
        {"name": "deadline", "type": "uint256", "internalType": "uint256"},
        {"name": "createdAt", "type": "uint256", "internalType": "uint256"},
        {"name": "status", "type": "uint8", "internalType": "enum IGoalVault.VaultStatus"},
        {"name": "isPublic", "type": "bool", "internalType": "bool"},
        {"name": "memberCount", "type": "uint256", "internalType": "uint256"},
        {"name": "token", "type": "address", "internalType": "address"},
        {"name": "goalType", "type": "uint8", "internalType": "enum IGoalVault.GoalType"}
      ]
    }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllMembers",
    "inputs": [],
    "outputs": [{
      "name": "",
      "type": "tuple[]",
      "internalType": "struct IGoalVault.MemberInfo[]",
      "components": [
        {"name": "member", "type": "address", "internalType": "address"},
        {"name": "contribution", "type": "uint256", "internalType": "uint256"},
        {"name": "personalGoalAmount", "type": "uint256", "internalType": "uint256"},
        {"name": "joinedAt", "type": "uint256", "internalType": "uint256"},
        {"name": "isActive", "type": "bool", "internalType": "bool"},
        {"name": "hasReachedPersonalGoal", "type": "bool", "internalType": "bool"}
      ]
    }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMemberInfo",
    "inputs": [{"name": "member", "type": "address", "internalType": "address"}],
    "outputs": [{
      "name": "",
      "type": "tuple",
      "internalType": "struct IGoalVault.MemberInfo",
      "components": [
        {"name": "member", "type": "address", "internalType": "address"},
        {"name": "contribution", "type": "uint256", "internalType": "uint256"},
        {"name": "personalGoalAmount", "type": "uint256", "internalType": "uint256"},
        {"name": "joinedAt", "type": "uint256", "internalType": "uint256"},
        {"name": "isActive", "type": "bool", "internalType": "bool"},
        {"name": "hasReachedPersonalGoal", "type": "bool", "internalType": "bool"}
      ]
    }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "joinVault",
    "inputs": [
      {"name": "member", "type": "address", "internalType": "address"},
      {"name": "personalGoalAmount", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "leaveVault",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "completeVault",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawFunds",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "token",
    "inputs": [],
    "outputs": [{"name": "", "type": "address", "internalType": "contract IERC20"}],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "FundsAdded",
    "inputs": [
      {"name": "member", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "newTotal", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "memberContribution", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "progressPercentage", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MemberJoined",
    "inputs": [
      {"name": "member", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "personalGoalAmount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "memberCount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "inviter", "type": "address", "indexed": true, "internalType": "address"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "VaultCompleted",
    "inputs": [
      {"name": "finalAmount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "targetAmount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "memberCount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "daysToComplete", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  }
] as const;
