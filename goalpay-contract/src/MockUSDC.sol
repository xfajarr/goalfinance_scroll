// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Mock USDC token for testing purposes
 * @dev Implements ERC20 with 6 decimals like real USDC
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**DECIMALS; // 1000 USDC per day
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**DECIMALS; // 1 billion USDC max supply

    mapping(address => uint256) public lastFaucetTime;
    uint256 public constant FAUCET_COOLDOWN = 1 days;

    event Faucet(address indexed to, uint256 amount);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    /**
     * @notice Constructor creates MockUSDC with initial supply
     * @param initialSupply Initial supply to mint to deployer
     */
    constructor(uint256 initialSupply) ERC20("Mock USD Coin", "USDC") Ownable(msg.sender) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    /**
     * @notice Returns the number of decimals (6 like real USDC)
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @notice Mint tokens to a specific address (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount to mint (in 6 decimal format)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
        emit Mint(to, amount);
    }

    /**
     * @notice Burn tokens from caller's balance
     * @param amount Amount to burn (in 6 decimal format)
     */
    function burn(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance to burn");
        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }

    /**
     * @notice Burn tokens from a specific address (requires allowance)
     * @param from Address to burn tokens from
     * @param amount Amount to burn (in 6 decimal format)
     */
    function burnFrom(address from, uint256 amount) external {
        require(balanceOf(from) >= amount, "Insufficient balance to burn");
        uint256 currentAllowance = allowance(from, msg.sender);
        require(currentAllowance >= amount, "Burn amount exceeds allowance");
        
        _approve(from, msg.sender, currentAllowance - amount);
        _burn(from, amount);
        emit Burn(from, amount);
    }

    /**
     * @notice Faucet function for testing - gives free USDC to users
     * @dev Has 24-hour cooldown period to prevent spam (1000 USDC per day)
     */
    function faucet() external {
        require(
            lastFaucetTime[msg.sender] == 0 || block.timestamp >= lastFaucetTime[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown not met"
        );
        require(totalSupply() + FAUCET_AMOUNT <= MAX_SUPPLY, "Would exceed max supply");

        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit Faucet(msg.sender, FAUCET_AMOUNT);
    }

    /**
     * @notice Emergency faucet for testing (no cooldown, only owner)
     * @param to Address to send tokens to
     * @param amount Amount to send
     */
    function emergencyFaucet(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot send to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
        emit Faucet(to, amount);
    }

    /**
     * @notice Get time remaining until next faucet call
     * @param user Address to check
     * @return Time in seconds until next faucet call (0 if ready)
     */
    function getFaucetCooldown(address user) external view returns (uint256) {
        if (lastFaucetTime[user] == 0) {
            return 0; // First time user, no cooldown
        }
        uint256 nextFaucetTime = lastFaucetTime[user] + FAUCET_COOLDOWN;
        if (block.timestamp >= nextFaucetTime) {
            return 0;
        }
        return nextFaucetTime - block.timestamp;
    }

    /**
     * @notice Check if user can use faucet
     * @param user Address to check
     * @return True if user can use faucet
     */
    function canUseFaucet(address user) external view returns (bool) {
        return lastFaucetTime[user] == 0 || block.timestamp >= lastFaucetTime[user] + FAUCET_COOLDOWN;
    }

    /**
     * @notice Get formatted balance (for display purposes)
     * @param account Address to check balance for
     * @return Balance formatted as a string with 2 decimal places
     */
    function getFormattedBalance(address account) external view returns (string memory) {
        uint256 balance = balanceOf(account);
        uint256 wholePart = balance / 10**DECIMALS;
        uint256 fractionalPart = (balance % 10**DECIMALS) / 10**(DECIMALS-2);
        
        return string(abi.encodePacked(
            _toString(wholePart),
            ".",
            fractionalPart < 10 ? "0" : "",
            _toString(fractionalPart)
        ));
    }

    /**
     * @notice Convert uint256 to string
     * @param value Value to convert
     * @return String representation of the value
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
