## VaultFactory Data Structures

### Structs

```solidity
struct VaultInfo {
    address vaultAddress;    // Address of the deployed vault contract
    address creator;         // Address of the vault creator
    string name;             // Name of the vault
    string description;      // Description of the vault
    uint256 targetAmount;    // Target amount in USDC
    uint256 deadline;        // Deadline timestamp
    uint256 createdAt;       // Creation timestamp
    bool isPublic;           // Whether the vault is public
    bool isActive;           // Whether the vault is still active
}
```

### Mappings

```solidity
// Store vault info by ID
mapping(uint256 => VaultInfo) public vaults;

// Track vaults created by each address
mapping(address => uint256[]) public vaultsByCreator;

// Map invite codes to vault IDs
mapping(bytes32 => uint256) public inviteCodes;
```

### State Variables

```solidity
// USDC token interface
IERC20 public immutable usdc;

// Counter for vault IDs
uint256 public nextVaultId;
```

## GoalPayVault Data Structures

### State Variables

```solidity
// USDC token interface
IERC20 public immutable usdc;

// Factory contract address
address public immutable factory;

// Vault ID in the factory
uint256 public vaultId;

// Vault details
string public name;
string public description;
uint256 public targetAmount;
uint256 public deadline;
uint256 public totalContributed;
bool public isCompleted;
bool public isPublic;
```

### Arrays and Mappings

```solidity
// List of all members
address[] public members;

// Quick lookup for membership
mapping(address => bool) public isMember;

// Track contributions by member
mapping(address => uint256) public contributions;
```