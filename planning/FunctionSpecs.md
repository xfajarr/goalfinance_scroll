## VaultFactory Functions

### Administrative Functions

```solidity
/**
 * @notice Constructor to initialize the factory
 * @param _usdc Address of the USDC token contract
 */
constructor(address _usdc)

/**
 * @notice Pause the contract
 * @dev Only callable by the owner
 */
function pause() external onlyOwner

/**
 * @notice Unpause the contract
 * @dev Only callable by the owner
 */
function unpause() external onlyOwner
```

### Core Functions

```solidity
/**
 * @notice Create a new vault
 * @param _name Name of the vault
 * @param _description Description of the vault
 * @param _targetAmount Target amount in USDC
 * @param _deadline Deadline timestamp
 * @param _isPublic Whether the vault is public
 * @return vaultId The ID of the created vault
 */
function createVault(
    string memory _name,
    string memory _description,
    uint256 _targetAmount,
    uint256 _deadline,
    bool _isPublic
) external returns (uint256)

/**
 * @notice Join a vault using an invite code
 * @param _inviteCode Invite code for the vault
 * @return vaultId The ID of the joined vault
 */
function joinVaultWithInviteCode(bytes32 _inviteCode) external returns (uint256)

/**
 * @notice Generate a new invite code for a vault
 * @param _vaultId ID of the vault
 * @return inviteCode The generated invite code
 */
function generateInviteCode(uint256 _vaultId) external returns (bytes32)

/**
 * @notice Mark a vault as inactive
 * @param _vaultId ID of the vault
 * @dev Only callable by the vault contract itself
 */
function markVaultInactive(uint256 _vaultId) external
```

### View Functions

```solidity
/**
 * @notice Get vaults created by a specific address
 * @param _creator Address of the creator
 * @return vaultIds Array of vault IDs created by the address
 */
function getVaultsByCreator(address _creator) external view returns (uint256[] memory)

/**
 * @notice Get all active vaults
 * @return activeVaultIds Array of active vault IDs
 */
function getAllActiveVaults() external view returns (uint256[] memory)
```

## GoalPayVault Functions

### Administrative Functions

```solidity
/**
 * @notice Constructor to initialize the vault
 * @param _usdc Address of the USDC token
 * @param _creator Address of the vault creator
 * @param _name Name of the vault
 * @param _description Description of the vault
 * @param _targetAmount Target amount in USDC
 * @param _deadline Deadline timestamp
 * @param _isPublic Whether the vault is public
 * @param _factory Address of the factory contract
 */
constructor(
    address _usdc,
    address _creator,
    string memory _name,
    string memory _description,
    uint256 _targetAmount,
    uint256 _deadline,
    bool _isPublic,
    address _factory
)

/**
 * @notice Emergency withdraw funds
 * @param _token Address of the token to withdraw
 * @param _to Address to send the tokens to
 * @param _amount Amount to withdraw
 * @dev Only callable by the owner (creator)
 */
function emergencyWithdraw(address _token, address _to, uint256 _amount) external onlyOwner
```

### Core Functions

```solidity
/**
 * @notice Add funds to the vault
 * @param _amount Amount to contribute in USDC
 */
function addFunds(uint256 _amount) external

/**
 * @notice Complete the vault when deadline is reached
 */
function completeVault() external

/**
 * @notice Add a member to the vault
 * @param _member Address of the new member
 * @dev Only callable by the factory contract
 */
function addMember(address _member) external

/**
 * @notice Internal function to complete the vault
 */
function _completeVault() internal
```

### View Functions

```solidity
/**
 * @notice Get all members of the vault
 * @return Array of member addresses
 */
function getMembers() external view returns (address[] memory)

/**
 * @notice Get contribution of a specific member
 * @param _member Address of the member
 * @return Amount contributed by the member
 */
function getMemberContribution(address _member) external view returns (uint256)
```