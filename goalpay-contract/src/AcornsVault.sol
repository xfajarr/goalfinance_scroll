// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AcornsVault
 * @notice Acorns-like micro-investing platform with round-up transactions, automatic portfolio investment, and yield generation
 * @dev Implements purchase tracking, round-up calculation, portfolio management, and mock Morpho yield generation
 */
contract AcornsVault is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Constants
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant DAYS_PER_YEAR = 365;
    uint256 public constant DOLLAR_UNIT = 1e6; // 6 decimals for USDC

    // Portfolio APY rates (in basis points)
    uint256 public constant CONSERVATIVE_APY = 400; // 4%
    uint256 public constant MODERATE_APY = 600; // 6%
    uint256 public constant AGGRESSIVE_APY = 800; // 8%

    // Enums
    enum PortfolioType { CONSERVATIVE, MODERATE, AGGRESSIVE }

    // Structs
    struct UserAccount {
        uint256 totalInvested;
        uint256 totalRoundUps;
        uint256 pendingRoundUps;
        uint256 lastYieldClaim;
        uint256 accumulatedYield;
        PortfolioType portfolio;
        bool recurringEnabled;
        uint256 recurringAmount;
        uint256 recurringInterval; // in seconds
        uint256 nextRecurringDate;
        bool isRegistered;
    }

    struct Purchase {
        uint256 amount;
        uint256 roundUpAmount;
        uint256 timestamp;
        bool invested;
        string merchant;
    }

    struct TokenInfo {
        bool supported;
        uint256 exchangeRate; // Rate to USDC (1e6 = 1:1)
        uint8 decimals;
    }

    // State variables
    mapping(address => UserAccount) public userAccounts;
    mapping(address => Purchase[]) public userPurchases;
    mapping(address => mapping(address => uint256)) public userTokenBalances;
    mapping(address => TokenInfo) public supportedTokens;
    mapping(address => mapping(uint256 => uint256)) public goalRoundUps; // user => goalId => amount

    address[] public registeredUsers;
    uint256 public totalValueLocked;
    uint256 public totalYieldDistributed;

    // Integration with GoalFinance
    address public goalFinanceContract;
    bool public goalIntegrationEnabled;

    // Events
    event UserRegistered(address indexed user, PortfolioType portfolio);
    event PurchaseRecorded(address indexed user, uint256 amount, uint256 roundUp, string merchant);
    event RoundUpsInvested(address indexed user, uint256 amount);
    event RecurringInvestmentSet(address indexed user, uint256 amount, uint256 interval);
    event RecurringInvestmentExecuted(address indexed user, uint256 amount);
    event FundsDeposited(address indexed user, address token, uint256 amount);
    event YieldClaimed(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);
    event PortfolioChanged(address indexed user, PortfolioType oldPortfolio, PortfolioType newPortfolio);
    event TokenSupported(address indexed token, bool supported, uint256 exchangeRate);

    // Custom errors
    error AcornsVault__UserNotRegistered();
    error AcornsVault__UserAlreadyRegistered();
    error AcornsVault__InvalidAmount();
    error AcornsVault__TokenNotSupported();
    error AcornsVault__InsufficientBalance();
    error AcornsVault__NoRoundUpsToInvest();
    error AcornsVault__NoYieldToClaim();
    error AcornsVault__RecurringNotDue();

    constructor() Ownable(msg.sender) {
        // Initialize supported tokens with mock exchange rates
        supportedTokens[address(0)] = TokenInfo(true, 1e6, 6); // USDC placeholder
    }

    // Modifiers
    modifier onlyRegistered() {
        if (!userAccounts[msg.sender].isRegistered) revert AcornsVault__UserNotRegistered();
        _;
    }

    modifier validAmount(uint256 _amount) {
        if (_amount == 0) revert AcornsVault__InvalidAmount();
        _;
    }

    // User registration and management
    function registerUser(PortfolioType _portfolio) external whenNotPaused {
        if (userAccounts[msg.sender].isRegistered) revert AcornsVault__UserAlreadyRegistered();

        userAccounts[msg.sender] = UserAccount({
            totalInvested: 0,
            totalRoundUps: 0,
            pendingRoundUps: 0,
            lastYieldClaim: block.timestamp,
            accumulatedYield: 0,
            portfolio: _portfolio,
            recurringEnabled: false,
            recurringAmount: 0,
            recurringInterval: 0,
            nextRecurringDate: 0,
            isRegistered: true
        });

        registeredUsers.push(msg.sender);
        emit UserRegistered(msg.sender, _portfolio);
    }

    // Purchase simulation and round-up calculation
    function simulatePurchase(uint256 _amount, string memory _merchant) 
        external 
        onlyRegistered 
        validAmount(_amount) 
    {
        uint256 roundUpAmount = calculateRoundUp(_amount);
        
        userPurchases[msg.sender].push(Purchase({
            amount: _amount,
            roundUpAmount: roundUpAmount,
            timestamp: block.timestamp,
            invested: false,
            merchant: _merchant
        }));

        if (roundUpAmount > 0) {
            userAccounts[msg.sender].pendingRoundUps += roundUpAmount;
        }

        emit PurchaseRecorded(msg.sender, _amount, roundUpAmount, _merchant);
    }

    // Calculate round-up amount (round to nearest dollar)
    function calculateRoundUp(uint256 _amount) public pure returns (uint256) {
        uint256 dollars = _amount / DOLLAR_UNIT;
        uint256 cents = _amount % DOLLAR_UNIT;
        
        if (cents == 0) return 0;
        return DOLLAR_UNIT - cents;
    }

    // Invest accumulated round-ups
    function investRoundUps() external onlyRegistered nonReentrant {
        UserAccount storage account = userAccounts[msg.sender];
        
        if (account.pendingRoundUps == 0) revert AcornsVault__NoRoundUpsToInvest();

        uint256 investAmount = account.pendingRoundUps;
        account.pendingRoundUps = 0;
        account.totalRoundUps += investAmount;
        account.totalInvested += investAmount;
        totalValueLocked += investAmount;

        // Mark purchases as invested
        Purchase[] storage purchases = userPurchases[msg.sender];
        for (uint256 i = 0; i < purchases.length; i++) {
            if (!purchases[i].invested && purchases[i].roundUpAmount > 0) {
                purchases[i].invested = true;
            }
        }

        emit RoundUpsInvested(msg.sender, investAmount);
    }

    // Set up recurring investment
    function setRecurringInvestment(uint256 _amount, uint256 _intervalDays) 
        external 
        onlyRegistered 
        validAmount(_amount) 
    {
        UserAccount storage account = userAccounts[msg.sender];
        
        account.recurringEnabled = true;
        account.recurringAmount = _amount;
        account.recurringInterval = _intervalDays * SECONDS_PER_DAY;
        account.nextRecurringDate = block.timestamp + account.recurringInterval;

        emit RecurringInvestmentSet(msg.sender, _amount, _intervalDays);
    }

    // Execute recurring investment
    function executeRecurringInvestment() external onlyRegistered nonReentrant {
        UserAccount storage account = userAccounts[msg.sender];
        
        if (!account.recurringEnabled) revert AcornsVault__RecurringNotDue();
        if (block.timestamp < account.nextRecurringDate) revert AcornsVault__RecurringNotDue();

        uint256 investAmount = account.recurringAmount;
        account.totalInvested += investAmount;
        account.nextRecurringDate = block.timestamp + account.recurringInterval;
        totalValueLocked += investAmount;

        emit RecurringInvestmentExecuted(msg.sender, investAmount);
    }

    // Manual deposit funds
    function depositFunds(address _token, uint256 _amount) 
        external 
        onlyRegistered 
        nonReentrant 
        validAmount(_amount) 
    {
        if (!supportedTokens[_token].supported) revert AcornsVault__TokenNotSupported();

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        
        // Convert to USDC equivalent
        uint256 usdcEquivalent = convertToUSDC(_token, _amount);
        userTokenBalances[msg.sender][_token] += _amount;
        userAccounts[msg.sender].totalInvested += usdcEquivalent;
        totalValueLocked += usdcEquivalent;

        emit FundsDeposited(msg.sender, _token, _amount);
    }

    // Claim accumulated yield
    function claimYield() external onlyRegistered nonReentrant {
        uint256 yieldAmount = calculateYield(msg.sender);
        
        if (yieldAmount == 0) revert AcornsVault__NoYieldToClaim();

        UserAccount storage account = userAccounts[msg.sender];
        account.lastYieldClaim = block.timestamp;
        account.accumulatedYield += yieldAmount;
        totalYieldDistributed += yieldAmount;

        emit YieldClaimed(msg.sender, yieldAmount);
    }

    // Calculate yield for user
    function calculateYield(address _user) public view returns (uint256) {
        UserAccount storage account = userAccounts[_user];
        
        if (account.totalInvested == 0) return 0;

        uint256 timeElapsed = block.timestamp - account.lastYieldClaim;
        uint256 apy = getPortfolioAPY(account.portfolio);
        
        // Calculate compound daily yield
        uint256 dailyRate = (apy * 1e18) / (DAYS_PER_YEAR * BASIS_POINTS);
        uint256 daysElapsed = timeElapsed / SECONDS_PER_DAY;
        
        if (daysElapsed == 0) return 0;

        // Simple compound interest calculation
        uint256 yieldAmount = (account.totalInvested * dailyRate * daysElapsed) / 1e18;
        return yieldAmount;
    }

    // Get portfolio APY
    function getPortfolioAPY(PortfolioType _portfolio) public pure returns (uint256) {
        if (_portfolio == PortfolioType.CONSERVATIVE) return CONSERVATIVE_APY;
        if (_portfolio == PortfolioType.MODERATE) return MODERATE_APY;
        return AGGRESSIVE_APY;
    }

    // Convert token amount to USDC equivalent
    function convertToUSDC(address _token, uint256 _amount) public view returns (uint256) {
        TokenInfo storage tokenInfo = supportedTokens[_token];
        return (_amount * tokenInfo.exchangeRate) / (10 ** tokenInfo.decimals);
    }

    // Change portfolio type
    function changePortfolio(PortfolioType _newPortfolio) external onlyRegistered {
        PortfolioType oldPortfolio = userAccounts[msg.sender].portfolio;
        userAccounts[msg.sender].portfolio = _newPortfolio;
        
        emit PortfolioChanged(msg.sender, oldPortfolio, _newPortfolio);
    }

    // Withdraw funds
    function withdrawFunds(uint256 _amount) external onlyRegistered nonReentrant validAmount(_amount) {
        UserAccount storage account = userAccounts[msg.sender];
        uint256 totalBalance = account.totalInvested + account.accumulatedYield;
        
        if (_amount > totalBalance) revert AcornsVault__InsufficientBalance();

        if (_amount <= account.accumulatedYield) {
            account.accumulatedYield -= _amount;
        } else {
            uint256 fromInvestment = _amount - account.accumulatedYield;
            account.accumulatedYield = 0;
            account.totalInvested -= fromInvestment;
            totalValueLocked -= fromInvestment;
        }

        emit FundsWithdrawn(msg.sender, _amount);
    }

    // Admin functions
    function setSupportedToken(address _token, bool _supported, uint256 _exchangeRate, uint8 _decimals) 
        external 
        onlyOwner 
    {
        supportedTokens[_token] = TokenInfo(_supported, _exchangeRate, _decimals);
        emit TokenSupported(_token, _supported, _exchangeRate);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // View functions
    function getUserAccount(address _user) external view returns (UserAccount memory) {
        return userAccounts[_user];
    }

    function getUserPurchases(address _user) external view returns (Purchase[] memory) {
        return userPurchases[_user];
    }

    function getPortfolioValue(address _user) external view returns (uint256) {
        UserAccount storage account = userAccounts[_user];
        uint256 currentYield = calculateYield(_user);
        return account.totalInvested + account.accumulatedYield + currentYield;
    }

    function getPendingRoundUps(address _user) external view returns (uint256) {
        return userAccounts[_user].pendingRoundUps;
    }

    function isRecurringDue(address _user) external view returns (bool) {
        UserAccount storage account = userAccounts[_user];
        return account.recurringEnabled && block.timestamp >= account.nextRecurringDate;
    }

    function getTotalUsers() external view returns (uint256) {
        return registeredUsers.length;
    }

    function getRegisteredUsers() external view returns (address[] memory) {
        return registeredUsers;
    }
}
