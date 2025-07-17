## VaultFactory Events

```solidity
/**
 * @notice Emitted when a new vault is created
 * @param vaultId ID of the created vault
 * @param vaultAddress Address of the deployed vault contract
 * @param creator Address of the vault creator
 * @param name Name of the vault
 * @param targetAmount Target amount in USDC
 * @param deadline Deadline timestamp
 */
event VaultCreated(
    uint256 indexed vaultId, 
    address indexed vaultAddress, 
    address indexed creator, 
    string name, 
    uint256 targetAmount, 
    uint256 deadline
);

/**
 * @notice Emitted when a new invite code is generated
 * @param vaultId ID of the vault
 * @param inviteCode Generated invite code
 */
event InviteCodeGenerated(uint256 indexed vaultId, bytes32 inviteCode);
```

## VaultFactory Errors

```solidity
/**
 * @notice Invalid amount provided
 */
error InvalidAmount();

/**
 * @notice Invalid deadline provided
 */
error InvalidDeadline();

/**
 * @notice Vault not found
 */
error VaultNotFound();

/**
 * @notice Invalid invite code
 */
error InviteCodeInvalid();
```

## GoalPayVault Events

```solidity
/**
 * @notice Emitted when funds are added to the vault
 * @param member Address of the member adding funds
 * @param amount Amount added
 * @param newTotal New total amount in the vault
 */
event FundsAdded(address indexed member, uint256 amount, uint256 newTotal);

/**
 * @notice Emitted when a new member is added to the vault
 * @param member Address of the new member
 */
event MemberAdded(address indexed member);

/**
 * @notice Emitted when the vault is completed
 * @param finalAmount Final amount in the vault
 */
event VaultCompleted(uint256 finalAmount);
```

## GoalPayVault Errors

```solidity
/**
 * @notice Invalid amount provided
 */
error InvalidAmount();

/**
 * @notice Vault is already completed
 */
error VaultAlreadyCompleted();

/**
 * @notice Deadline has not been reached yet
 */
error DeadlineNotReached();

/**
 * @notice Not authorized to perform this action
 */
error NotAuthorized();

/**
 * @notice Address is already a member
 */
error AlreadyMember();
```