// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MockMorpho
 * @notice Mock Morpho protocol for yield generation on deposits
 * @dev Simulates lending protocol with configurable APY rates for different tokens
 */
contract MockMorpho is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Constants
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

    // Structs
    struct MarketInfo {
        bool isActive;
        uint256 supplyAPY; // in basis points
        uint256 totalSupplied;
        uint256 totalBorrowed;
        uint256 lastUpdateTimestamp;
    }

    struct UserPosition {
        uint256 supplied;
        uint256 lastUpdateTimestamp;
        uint256 accruedInterest;
    }

    // State variables
    mapping(address => MarketInfo) public markets;
    mapping(address => mapping(address => UserPosition)) public userPositions; // token => user => position
    mapping(address => bool) public authorizedContracts;
    
    address[] public supportedTokens;

    // Events
    event MarketCreated(address indexed token, uint256 supplyAPY);
    event Supplied(address indexed user, address indexed token, uint256 amount);
    event Withdrawn(address indexed user, address indexed token, uint256 amount, uint256 interest);
    event InterestAccrued(address indexed user, address indexed token, uint256 interest);
    event ContractAuthorized(address indexed contractAddr, bool authorized);

    // Custom errors
    error MockMorpho__MarketNotActive();
    error MockMorpho__InvalidAmount();
    error MockMorpho__InsufficientBalance();
    error MockMorpho__Unauthorized();

    constructor() Ownable(msg.sender) {}

    // Modifiers
    modifier onlyAuthorized() {
        if (!authorizedContracts[msg.sender] && msg.sender != owner()) {
            revert MockMorpho__Unauthorized();
        }
        _;
    }

    modifier marketActive(address _token) {
        if (!markets[_token].isActive) revert MockMorpho__MarketNotActive();
        _;
    }

    // Admin functions
    function createMarket(address _token, uint256 _supplyAPY) external onlyOwner {
        markets[_token] = MarketInfo({
            isActive: true,
            supplyAPY: _supplyAPY,
            totalSupplied: 0,
            totalBorrowed: 0,
            lastUpdateTimestamp: block.timestamp
        });

        supportedTokens.push(_token);
        emit MarketCreated(_token, _supplyAPY);
    }

    function setMarketAPY(address _token, uint256 _newAPY) external onlyOwner marketActive(_token) {
        markets[_token].supplyAPY = _newAPY;
    }

    function authorizeContract(address _contract, bool _authorized) external onlyOwner {
        authorizedContracts[_contract] = _authorized;
        emit ContractAuthorized(_contract, _authorized);
    }

    // Core functions
    function supply(address _token, uint256 _amount) external nonReentrant marketActive(_token) {
        if (_amount == 0) revert MockMorpho__InvalidAmount();

        // Update user's accrued interest before new supply
        _updateUserInterest(_token, msg.sender);

        // Transfer tokens
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // Update user position
        userPositions[_token][msg.sender].supplied += _amount;
        userPositions[_token][msg.sender].lastUpdateTimestamp = block.timestamp;

        // Update market
        markets[_token].totalSupplied += _amount;

        emit Supplied(msg.sender, _token, _amount);
    }

    function supplyFor(address _token, address _user, uint256 _amount) 
        external 
        onlyAuthorized 
        nonReentrant 
        marketActive(_token) 
    {
        if (_amount == 0) revert MockMorpho__InvalidAmount();

        // Update user's accrued interest before new supply
        _updateUserInterest(_token, _user);

        // Transfer tokens from caller (authorized contract)
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // Update user position
        userPositions[_token][_user].supplied += _amount;
        userPositions[_token][_user].lastUpdateTimestamp = block.timestamp;

        // Update market
        markets[_token].totalSupplied += _amount;

        emit Supplied(_user, _token, _amount);
    }

    function withdraw(address _token, uint256 _amount) external nonReentrant marketActive(_token) {
        if (_amount == 0) revert MockMorpho__InvalidAmount();

        // Update user's accrued interest
        _updateUserInterest(_token, msg.sender);

        UserPosition storage position = userPositions[_token][msg.sender];
        uint256 totalAvailable = position.supplied + position.accruedInterest;

        if (_amount > totalAvailable) revert MockMorpho__InsufficientBalance();

        uint256 interestWithdrawn = 0;
        uint256 principalWithdrawn = _amount;

        // Withdraw interest first, then principal
        if (_amount <= position.accruedInterest) {
            interestWithdrawn = _amount;
            position.accruedInterest -= _amount;
            principalWithdrawn = 0;
        } else {
            interestWithdrawn = position.accruedInterest;
            principalWithdrawn = _amount - position.accruedInterest;
            position.accruedInterest = 0;
            position.supplied -= principalWithdrawn;
        }

        // Update market
        if (principalWithdrawn > 0) {
            markets[_token].totalSupplied -= principalWithdrawn;
        }

        // Transfer tokens
        IERC20(_token).safeTransfer(msg.sender, _amount);

        emit Withdrawn(msg.sender, _token, _amount, interestWithdrawn);
    }

    function withdrawFor(address _token, address _user, uint256 _amount) 
        external 
        onlyAuthorized 
        nonReentrant 
        marketActive(_token) 
        returns (uint256 interestEarned)
    {
        if (_amount == 0) revert MockMorpho__InvalidAmount();

        // Update user's accrued interest
        _updateUserInterest(_token, _user);

        UserPosition storage position = userPositions[_token][_user];
        uint256 totalAvailable = position.supplied + position.accruedInterest;

        if (_amount > totalAvailable) revert MockMorpho__InsufficientBalance();

        uint256 principalWithdrawn = _amount;

        // Withdraw interest first, then principal
        if (_amount <= position.accruedInterest) {
            interestEarned = _amount;
            position.accruedInterest -= _amount;
            principalWithdrawn = 0;
        } else {
            interestEarned = position.accruedInterest;
            principalWithdrawn = _amount - position.accruedInterest;
            position.accruedInterest = 0;
            position.supplied -= principalWithdrawn;
        }

        // Update market
        if (principalWithdrawn > 0) {
            markets[_token].totalSupplied -= principalWithdrawn;
        }

        // Transfer tokens to caller (authorized contract)
        IERC20(_token).safeTransfer(msg.sender, _amount);

        emit Withdrawn(_user, _token, _amount, interestEarned);
    }

    function claimInterest(address _token) external nonReentrant marketActive(_token) {
        _updateUserInterest(_token, msg.sender);

        UserPosition storage position = userPositions[_token][msg.sender];
        uint256 interest = position.accruedInterest;

        if (interest == 0) return;

        position.accruedInterest = 0;
        IERC20(_token).safeTransfer(msg.sender, interest);

        emit Withdrawn(msg.sender, _token, interest, interest);
    }

    // Internal functions
    function _updateUserInterest(address _token, address _user) internal {
        UserPosition storage position = userPositions[_token][_user];
        
        if (position.supplied == 0) return;

        uint256 timeElapsed = block.timestamp - position.lastUpdateTimestamp;
        if (timeElapsed == 0) return;

        MarketInfo storage market = markets[_token];
        uint256 interest = (position.supplied * market.supplyAPY * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);

        position.accruedInterest += interest;
        position.lastUpdateTimestamp = block.timestamp;

        if (interest > 0) {
            emit InterestAccrued(_user, _token, interest);
        }
    }

    // View functions
    function getUserPosition(address _token, address _user) 
        external 
        view 
        returns (uint256 supplied, uint256 accruedInterest, uint256 totalBalance) 
    {
        UserPosition memory position = userPositions[_token][_user];
        
        // Calculate pending interest
        uint256 timeElapsed = block.timestamp - position.lastUpdateTimestamp;
        uint256 pendingInterest = 0;
        
        if (position.supplied > 0 && timeElapsed > 0) {
            MarketInfo memory market = markets[_token];
            pendingInterest = (position.supplied * market.supplyAPY * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
        }

        supplied = position.supplied;
        accruedInterest = position.accruedInterest + pendingInterest;
        totalBalance = supplied + accruedInterest;
    }

    function getMarketInfo(address _token) external view returns (MarketInfo memory) {
        return markets[_token];
    }

    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    function calculateAPY(address _token, uint256 _amount, uint256 _timeInSeconds) 
        external 
        view 
        marketActive(_token) 
        returns (uint256) 
    {
        MarketInfo memory market = markets[_token];
        return (_amount * market.supplyAPY * _timeInSeconds) / (BASIS_POINTS * SECONDS_PER_YEAR);
    }

    function isAuthorized(address _contract) external view returns (bool) {
        return authorizedContracts[_contract];
    }
}
