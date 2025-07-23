// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20 ^0.8.24;

// lib/openzeppelin-contracts/contracts/utils/Context.sol

// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/introspection/IERC165.sol)

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}

// lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol

// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/IERC165.sol)

// lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol

// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/IERC20.sol)

// lib/openzeppelin-contracts/contracts/access/Ownable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol

// OpenZeppelin Contracts (last updated v5.1.0) (interfaces/IERC1363.sol)

/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol

// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC20/utils/SafeERC20.sol)

/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Opposedly, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturnBool} that reverts if call fails to meet the requirements.
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            let success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            // bubble errors
            if iszero(success) {
                let ptr := mload(0x40)
                returndatacopy(ptr, 0, returndatasize())
                revert(ptr, returndatasize())
            }
            returnSize := returndatasize()
            returnValue := mload(0)
        }

        if (returnSize == 0 ? address(token).code.length == 0 : returnValue != 1) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silently catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0)
        }
        return success && (returnSize == 0 ? address(token).code.length > 0 : returnValue == 1);
    }
}

// src/GoalFinance.sol

/**
 * @title GoalFinance
 * @notice A decentralized savings vault platform for group and personal financial goals
 * @dev Implements vault creation, joining, deposits, withdrawals with penalty mechanisms
 */
contract GoalFinance is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Custom errors for gas optimization
    error ZeroAddress();
    error InvalidAmount();
    error TokenNotSupported();
    error InvalidDeadline();
    error VaultNotFound();
    error AlreadyMember();
    error NotMember();
    error InvalidInviteCode();
    error VaultNotActive();
    error DeadlineReached();
    error GoalNotReached();
    error GoalAlreadyReached();
    error WithdrawalNotAllowed();
    error PenaltyPeriodActive();
    error InsufficientBalance();
    error TransferFailed();

    // Enums
    enum GoalType { PERSONAL, GROUP }
    enum Visibility { PUBLIC, PRIVATE }
    enum VaultStatus { ACTIVE, SUCCESS, FAILED }

    // Structs
    struct Vault {
        uint256 id;
        string name;
        string description;
        address creator;
        address token;
        GoalType goalType;
        Visibility visibility;
        uint256 targetAmount;
        uint256 deadline;
        uint256 totalDeposited;
        uint256 memberCount;
        VaultStatus status;
        bytes32 inviteCode;
        uint256 createdAt;
    }

    struct Member {
        uint256 depositedAmount;
        uint256 targetShare;
        uint256 joinedAt;
        bool hasWithdrawn;
        uint256 earlyWithdrawalTime;
        uint256 penaltyAmount;
    }

    struct PenaltyInfo {
        address token;
        uint256 amount;
        uint256 unlockTime;
        bool claimed;
    }

    // State variables
    uint256 public constant PENALTY_RATE = 200; // 2% = 200 basis points
    uint256 public constant PENALTY_LOCK_PERIOD = 30 days;
    uint256 public constant BASIS_POINTS = 10000;

    // Special address to represent native token (ETH, MNT, etc.)
    address public constant NATIVE_TOKEN = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    uint256 public nextVaultId;
    mapping(uint256 => Vault) public vaults;
    mapping(uint256 => mapping(address => Member)) public vaultMembers;
    mapping(uint256 => address[]) public vaultMembersList;
    mapping(bytes32 => uint256) public inviteCodeToVaultId;
    mapping(address => PenaltyInfo[]) public userPenalties;
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256[]) public vaultsByCreator;
    uint256[] public allVaultIds;

    // Events
    event VaultCreated(
        uint256 indexed vaultId,
        address indexed creator,
        address indexed token,
        string name,
        string description,
        GoalType goalType,
        Visibility visibility,
        uint256 targetAmount,
        uint256 deadline,
        bytes32 inviteCode,
        uint256 timestamp
    );

    event MemberJoined(
        uint256 indexed vaultId,
        address indexed member,
        address indexed token,
        uint256 depositAmount,
        uint256 memberCount,
        uint256 timestamp
    );

    event FundsAdded(
        uint256 indexed vaultId,
        address indexed member,
        address indexed token,
        uint256 amount,
        uint256 totalDeposited,
        uint256 timestamp
    );

    event EarlyWithdrawal(
        uint256 indexed vaultId,
        address indexed member,
        address indexed token,
        uint256 amount,
        uint256 penalty,
        uint256 timestamp
    );

    event GoalReached(
        uint256 indexed vaultId,
        address indexed token,
        uint256 totalAmount,
        uint256 timestamp
    );

    event VaultFailed(
        uint256 indexed vaultId,
        address indexed token,
        uint256 totalAmount,
        uint256 timestamp
    );

    event Withdrawal(
        uint256 indexed vaultId,
        address indexed member,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event PenaltyReleased(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event TokenAdded(address indexed token, uint256 timestamp);
    event TokenRemoved(address indexed token, uint256 timestamp);

    event VaultStatusUpdated(
        uint256 indexed vaultId,
        VaultStatus indexed oldStatus,
        VaultStatus indexed newStatus,
        uint256 timestamp
    );

    /**
     * @notice Constructor initializes the contract
     */
    constructor() Ownable(msg.sender) {
        nextVaultId = 1;
    }

    /**
     * @notice Add a supported token (only owner)
     * @param _token Address of the token to add
     */
    function addSupportedToken(address _token) external onlyOwner {
        if (_token == address(0)) revert ZeroAddress();
        if (supportedTokens[_token]) revert("Token already supported");

        supportedTokens[_token] = true;
        emit TokenAdded(_token, block.timestamp);
    }

    /**
     * @notice Remove a supported token (only owner)
     * @param _token Address of the token to remove
     */
    function removeSupportedToken(address _token) external onlyOwner {
        if (!supportedTokens[_token]) {
            revert TokenNotSupported();
        }

        supportedTokens[_token] = false;
        emit TokenRemoved(_token, block.timestamp);
    }

    /**
     * @notice Creates a new savings vault
     * @param _name Name of the vault
     * @param _description Description of the vault
     * @param _token Address of the token to use for this vault
     * @param _goalType Type of goal (PERSONAL or GROUP)
     * @param _visibility Visibility of the vault (PUBLIC or PRIVATE)
     * @param _targetAmount Target amount to reach
     * @param _deadline Deadline timestamp
     * @return vaultId The ID of the created vault
     * @return inviteCode The invite code for the vault
     */
    function createVault(
        string memory _name,
        string memory _description,
        address _token,
        GoalType _goalType,
        Visibility _visibility,
        uint256 _targetAmount,
        uint256 _deadline
    ) external returns (uint256 vaultId, bytes32 inviteCode) {
        if (_token == address(0)) revert ZeroAddress();
        if (!supportedTokens[_token]) {
            revert TokenNotSupported();
        }
        if (_targetAmount == 0) revert InvalidAmount();
        if (_deadline <= block.timestamp) revert InvalidDeadline();

        vaultId = nextVaultId++;
        inviteCode = keccak256(abi.encodePacked(vaultId, msg.sender, block.timestamp));

        vaults[vaultId] = Vault({
            id: vaultId,
            name: _name,
            description: _description,
            creator: msg.sender,
            token: _token,
            goalType: _goalType,
            visibility: _visibility,
            targetAmount: _targetAmount,
            deadline: _deadline,
            totalDeposited: 0,
            memberCount: 0,
            status: VaultStatus.ACTIVE,
            inviteCode: inviteCode,
            createdAt: block.timestamp
        });

        inviteCodeToVaultId[inviteCode] = vaultId;
        vaultsByCreator[msg.sender].push(vaultId);
        allVaultIds.push(vaultId);

        // Auto-enroll creator as first member
        _addMember(vaultId, msg.sender);

        emit VaultCreated(
            vaultId,
            msg.sender,
            _token,
            _name,
            _description,
            _goalType,
            _visibility,
            _targetAmount,
            _deadline,
            inviteCode,
            block.timestamp
        );
    }

    /**
     * @notice Join a vault and make initial deposit
     * @param _vaultId ID of the vault to join
     * @param _amount Initial deposit amount (ignored if vault uses native token)
     * @param _inviteCode Invite code (required for private vaults)
     */
    function joinVaultAndDeposit(uint256 _vaultId, uint256 _amount, bytes32 _inviteCode) external payable nonReentrant {
        Vault storage vault = vaults[_vaultId];
        if (vault.id == 0) revert VaultNotFound();
        if (vault.status != VaultStatus.ACTIVE) revert VaultNotActive();
        if (block.timestamp >= vault.deadline) revert DeadlineReached();
        if (vaultMembers[_vaultId][msg.sender].joinedAt != 0) revert AlreadyMember();

        // Check invite code for private vaults
        if (vault.visibility == Visibility.PRIVATE && vault.inviteCode != _inviteCode) {
            revert InvalidInviteCode();
        }

        // Determine deposit amount based on vault token type
        uint256 depositAmount;
        if (vault.token == NATIVE_TOKEN) {
            if (msg.value == 0) revert InvalidAmount();
            depositAmount = msg.value;
        } else {
            if (_amount == 0) revert InvalidAmount();
            if (msg.value > 0) revert("Cannot send native token to ERC20 vault");
            depositAmount = _amount;
        }

        // Add member and process deposit
        _addMember(_vaultId, msg.sender);
        _processDeposit(_vaultId, msg.sender, depositAmount);

        emit MemberJoined(
            _vaultId,
            msg.sender,
            vault.token,
            depositAmount,
            vault.memberCount,
            block.timestamp
        );
    }

    /**
     * @notice Add funds to an existing vault membership
     * @param _vaultId ID of the vault
     * @param _amount Amount to deposit (ignored if vault uses native token)
     */
    function addFunds(uint256 _vaultId, uint256 _amount) external payable nonReentrant {
        if (vaultMembers[_vaultId][msg.sender].joinedAt == 0) revert NotMember();

        Vault storage vault = vaults[_vaultId];
        if (vault.status != VaultStatus.ACTIVE) revert VaultNotActive();
        if (block.timestamp >= vault.deadline) revert DeadlineReached();

        // Determine deposit amount based on vault token type
        uint256 depositAmount;
        if (vault.token == NATIVE_TOKEN) {
            if (msg.value == 0) revert InvalidAmount();
            depositAmount = msg.value;
        } else {
            if (_amount == 0) revert InvalidAmount();
            if (msg.value > 0) revert("Cannot send native token to ERC20 vault");
            depositAmount = _amount;
        }

        _processDeposit(_vaultId, msg.sender, depositAmount);

        emit FundsAdded(
            _vaultId,
            msg.sender,
            vault.token,
            depositAmount,
            vault.totalDeposited,
            block.timestamp
        );
    }

    /**
     * @notice Withdraw funds early with penalty
     * @param _vaultId ID of the vault
     */
    function withdrawEarly(uint256 _vaultId) external nonReentrant {
        Member storage member = vaultMembers[_vaultId][msg.sender];
        if (member.joinedAt == 0) revert NotMember();
        if (member.hasWithdrawn) revert WithdrawalNotAllowed();

        Vault storage vault = vaults[_vaultId];
        if (vault.status != VaultStatus.ACTIVE) revert VaultNotActive();

        uint256 depositAmount = member.depositedAmount;
        if (depositAmount == 0) revert InsufficientBalance();

        // Calculate penalty (2% of deposit)
        uint256 penalty = (depositAmount * PENALTY_RATE) / BASIS_POINTS;
        uint256 withdrawAmount = depositAmount - penalty;

        // Update member state
        member.hasWithdrawn = true;
        member.earlyWithdrawalTime = block.timestamp;
        member.penaltyAmount = penalty;

        // Update vault total
        vault.totalDeposited -= depositAmount;

        // Store penalty info for later release
        userPenalties[msg.sender].push(PenaltyInfo({
            token: vault.token,
            amount: penalty,
            unlockTime: block.timestamp + PENALTY_LOCK_PERIOD,
            claimed: false
        }));

        // Transfer funds
        if (vault.token == NATIVE_TOKEN) {
            (bool success, ) = msg.sender.call{value: withdrawAmount}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(vault.token).safeTransfer(msg.sender, withdrawAmount);
        }

        emit EarlyWithdrawal(
            _vaultId,
            msg.sender,
            vault.token,
            withdrawAmount,
            penalty,
            block.timestamp
        );
    }

    /**
     * @notice Withdraw funds after goal is reached
     * @param _vaultId ID of the vault
     */
    function withdraw(uint256 _vaultId) external nonReentrant {
        Member storage member = vaultMembers[_vaultId][msg.sender];
        if (member.joinedAt == 0) revert NotMember();
        if (member.hasWithdrawn) revert WithdrawalNotAllowed();

        Vault storage vault = vaults[_vaultId];
        if (vault.status != VaultStatus.SUCCESS) revert GoalNotReached();

        uint256 withdrawAmount = member.depositedAmount;
        if (withdrawAmount == 0) revert InsufficientBalance();

        // Update member state
        member.hasWithdrawn = true;

        // Transfer exact amount contributed
        if (vault.token == NATIVE_TOKEN) {
            (bool success, ) = msg.sender.call{value: withdrawAmount}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(vault.token).safeTransfer(msg.sender, withdrawAmount);
        }

        emit Withdrawal(
            _vaultId,
            msg.sender,
            vault.token,
            withdrawAmount,
            block.timestamp
        );
    }

    /**
     * @notice Claim released penalty funds for a specific token
     * @param _token Address of the token to claim penalties for
     */
    function claimPenalties(address _token) external nonReentrant {
        PenaltyInfo[] storage penalties = userPenalties[msg.sender];
        uint256 totalClaimable = 0;

        for (uint256 i = 0; i < penalties.length; i++) {
            if (!penalties[i].claimed &&
                block.timestamp >= penalties[i].unlockTime &&
                penalties[i].token == _token) {
                totalClaimable += penalties[i].amount;
                penalties[i].claimed = true;
            }
        }

        if (totalClaimable == 0) revert InsufficientBalance();

        if (_token == NATIVE_TOKEN) {
            (bool success, ) = msg.sender.call{value: totalClaimable}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(_token).safeTransfer(msg.sender, totalClaimable);
        }

        emit PenaltyReleased(
            msg.sender,
            _token,
            totalClaimable,
            block.timestamp
        );
    }

    /**
     * @notice Check and update vault status based on goal achievement
     * @param _vaultId ID of the vault to check
     */
    function checkVaultStatus(uint256 _vaultId) external {
        Vault storage vault = vaults[_vaultId];
        if (vault.id == 0) revert VaultNotFound();
        if (vault.status != VaultStatus.ACTIVE) return;

        if (vault.totalDeposited >= vault.targetAmount) {
            VaultStatus oldStatus = vault.status;
            vault.status = VaultStatus.SUCCESS;

            emit VaultStatusUpdated(_vaultId, oldStatus, VaultStatus.SUCCESS, block.timestamp);
            emit GoalReached(
                _vaultId,
                vault.token,
                vault.totalDeposited,
                block.timestamp
            );
        } else if (block.timestamp >= vault.deadline) {
            VaultStatus oldStatus = vault.status;
            vault.status = VaultStatus.FAILED;
            _handleFailedVault(_vaultId);

            emit VaultStatusUpdated(_vaultId, oldStatus, VaultStatus.FAILED, block.timestamp);
            emit VaultFailed(
                _vaultId,
                vault.token,
                vault.totalDeposited,
                block.timestamp
            );
        }
    }

    // Internal functions

    /**
     * @dev Add a member to a vault
     * @param _vaultId ID of the vault
     * @param _member Address of the member to add
     */
    function _addMember(uint256 _vaultId, address _member) internal {
        Vault storage vault = vaults[_vaultId];

        vaultMembers[_vaultId][_member] = Member({
            depositedAmount: 0,
            targetShare: 0,
            joinedAt: block.timestamp,
            hasWithdrawn: false,
            earlyWithdrawalTime: 0,
            penaltyAmount: 0
        });

        vaultMembersList[_vaultId].push(_member);
        vault.memberCount++;

        // Update target shares for all members
        _updateTargetShares(_vaultId);
    }

    /**
     * @dev Process a deposit and update vault state
     * @param _vaultId ID of the vault
     * @param _member Address of the member
     * @param _amount Amount to deposit
     */
    function _processDeposit(uint256 _vaultId, address _member, uint256 _amount) internal {
        Vault storage vault = vaults[_vaultId];

        // Transfer tokens from user (skip for native tokens as they're already received)
        if (vault.token != NATIVE_TOKEN) {
            IERC20(vault.token).safeTransferFrom(_member, address(this), _amount);
        }

        // Update member and vault state
        vaultMembers[_vaultId][_member].depositedAmount += _amount;
        vault.totalDeposited += _amount;

        // Check if goal is reached
        if (vault.totalDeposited >= vault.targetAmount) {
            VaultStatus oldStatus = vault.status;
            vault.status = VaultStatus.SUCCESS;

            emit VaultStatusUpdated(_vaultId, oldStatus, VaultStatus.SUCCESS, block.timestamp);
            emit GoalReached(
                _vaultId,
                vault.token,
                vault.totalDeposited,
                block.timestamp
            );
        }
    }

    /**
     * @dev Update target shares for all members in a vault
     * @param _vaultId ID of the vault
     */
    function _updateTargetShares(uint256 _vaultId) internal {
        Vault storage vault = vaults[_vaultId];
        address[] storage members = vaultMembersList[_vaultId];

        if (vault.goalType == GoalType.GROUP) {
            // Equal split among all members
            uint256 sharePerMember = vault.targetAmount / vault.memberCount;
            for (uint256 i = 0; i < members.length; i++) {
                vaultMembers[_vaultId][members[i]].targetShare = sharePerMember;
            }
        } else {
            // Personal goals - each member has individual target
            for (uint256 i = 0; i < members.length; i++) {
                vaultMembers[_vaultId][members[i]].targetShare = vault.targetAmount;
            }
        }
    }

    /**
     * @dev Handle failed vault by applying penalties to all members
     * @param _vaultId ID of the failed vault
     */
    function _handleFailedVault(uint256 _vaultId) internal {
        Vault storage vault = vaults[_vaultId];
        address[] storage members = vaultMembersList[_vaultId];

        for (uint256 i = 0; i < members.length; i++) {
            address member = members[i];
            Member storage memberData = vaultMembers[_vaultId][member];

            if (memberData.depositedAmount > 0 && !memberData.hasWithdrawn) {
                uint256 penalty = (memberData.depositedAmount * PENALTY_RATE) / BASIS_POINTS;

                // Store penalty for later release
                userPenalties[member].push(PenaltyInfo({
                    token: vault.token,
                    amount: penalty,
                    unlockTime: block.timestamp + PENALTY_LOCK_PERIOD,
                    claimed: false
                }));
            }
        }
    }

    // View functions

    /**
     * @notice Get vault information by ID
     * @param _vaultId ID of the vault
     * @return vault The vault struct
     */
    function getVault(uint256 _vaultId) external view returns (Vault memory vault) {
        return vaults[_vaultId];
    }

    /**
     * @notice Get member information for a specific vault
     * @param _vaultId ID of the vault
     * @param _member Address of the member
     * @return member The member struct
     */
    function getMember(uint256 _vaultId, address _member) external view returns (Member memory member) {
        return vaultMembers[_vaultId][_member];
    }

    /**
     * @notice Get all members of a vault
     * @param _vaultId ID of the vault
     * @return members Array of member addresses
     */
    function getVaultMembers(uint256 _vaultId) external view returns (address[] memory members) {
        return vaultMembersList[_vaultId];
    }

    /**
     * @notice Get vault ID by invite code
     * @param _inviteCode The invite code
     * @return vaultId The vault ID
     */
    function getVaultByInviteCode(bytes32 _inviteCode) external view returns (uint256 vaultId) {
        return inviteCodeToVaultId[_inviteCode];
    }

    /**
     * @notice Get claimable penalty amount for a user (all tokens combined)
     * @param _user Address of the user
     * @return claimable Total claimable penalty amount (note: this combines different tokens)
     * @dev This function is kept for backward compatibility but may not be meaningful with multiple tokens
     */
    function getClaimablePenalties(address _user) external view returns (uint256 claimable) {
        PenaltyInfo[] storage penalties = userPenalties[_user];

        for (uint256 i = 0; i < penalties.length; i++) {
            if (!penalties[i].claimed && block.timestamp >= penalties[i].unlockTime) {
                claimable += penalties[i].amount;
            }
        }
    }

    /**
     * @notice Get all penalty information for a user
     * @param _user Address of the user
     * @return penalties Array of penalty info structs
     */
    function getUserPenalties(address _user) external view returns (PenaltyInfo[] memory penalties) {
        return userPenalties[_user];
    }

    /**
     * @notice Check if a vault has reached its goal
     * @param _vaultId ID of the vault
     * @return reached True if goal is reached
     */
    function isGoalReached(uint256 _vaultId) external view returns (bool reached) {
        Vault storage vault = vaults[_vaultId];
        return vault.totalDeposited >= vault.targetAmount;
    }

    /**
     * @notice Get vault progress percentage (in basis points)
     * @param _vaultId ID of the vault
     * @return progress Progress in basis points (10000 = 100%)
     */
    function getVaultProgress(uint256 _vaultId) external view returns (uint256 progress) {
        Vault storage vault = vaults[_vaultId];
        if (vault.targetAmount == 0) return 0;
        return (vault.totalDeposited * BASIS_POINTS) / vault.targetAmount;
    }

    /**
     * @notice Check if vault uses native token
     * @param _vaultId ID of the vault
     * @return isNative True if vault uses native token
     */
    function isNativeTokenVault(uint256 _vaultId) external view returns (bool isNative) {
        return vaults[_vaultId].token == NATIVE_TOKEN;
    }

    /**
     * @notice Get native token symbol for current chain
     * @return symbol Native token symbol
     */
    function getNativeTokenSymbol() external view returns (string memory symbol) {
        if (block.chainid == 5000 || block.chainid == 5001) {
            return "MNT"; // Mantle
        } else if (block.chainid == 8453 || block.chainid == 84532) {
            return "ETH"; // Base
        } else if (block.chainid == 1 || block.chainid == 11155111) {
            return "ETH"; // Ethereum
        } else {
            return "NATIVE"; // Generic
        }
    }

    // Receive function to accept native tokens
    receive() external payable {
        // Allow contract to receive native tokens
        // This is needed for penalty refunds and withdrawals
    }

    /**
     * @notice Get all vault IDs
     * @return vaultIds Array of all vault IDs
     */
    function getAllVaults() external view returns (uint256[] memory vaultIds) {
        return allVaultIds;
    }

    /**
     * @notice Get all vault IDs created by a specific creator
     * @param _creator Address of the creator
     * @return vaultIds Array of vault IDs created by the creator
     */
    function getVaultsByCreator(address _creator) external view returns (uint256[] memory vaultIds) {
        return vaultsByCreator[_creator];
    }

    /**
     * @notice Get claimable penalty amount for a user for a specific token
     * @param _user Address of the user
     * @param _token Address of the token
     * @return claimable Total claimable penalty amount for the token
     */
    function getClaimablePenaltiesByToken(address _user, address _token) external view returns (uint256 claimable) {
        PenaltyInfo[] storage penalties = userPenalties[_user];

        for (uint256 i = 0; i < penalties.length; i++) {
            if (!penalties[i].claimed &&
                block.timestamp >= penalties[i].unlockTime &&
                penalties[i].token == _token) {
                claimable += penalties[i].amount;
            }
        }
    }

    /**
     * @notice Check if a token is supported
     * @param _token Address of the token
     * @return supported True if token is supported
     */
    function isTokenSupported(address _token) external view returns (bool supported) {
        return supportedTokens[_token];
    }

    /**
     * @notice Get total number of vaults
     * @return count Total number of vaults created
     */
    function getTotalVaultCount() external view returns (uint256 count) {
        return allVaultIds.length;
    }

    /**
     * @notice Get vault IDs with pagination
     * @param _offset Starting index
     * @param _limit Maximum number of vaults to return
     * @return vaultIds Array of vault IDs
     * @return hasMore True if there are more vaults beyond this page
     */
    function getVaultsPaginated(uint256 _offset, uint256 _limit)
        external
        view
        returns (uint256[] memory vaultIds, bool hasMore)
    {
        uint256 totalVaults = allVaultIds.length;

        if (_offset >= totalVaults) {
            return (new uint256[](0), false);
        }

        uint256 end = _offset + _limit;
        if (end > totalVaults) {
            end = totalVaults;
        }

        uint256 length = end - _offset;
        vaultIds = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            vaultIds[i] = allVaultIds[_offset + i];
        }

        hasMore = end < totalVaults;
    }
}

