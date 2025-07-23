// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing purposes
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals = 6;
    
    // Faucet functionality
    mapping(address => uint256) public lastFaucetTime;
    uint256 public faucetAmount = 1000 * 10**6; // 1000 USDC
    uint256 public faucetCooldown = 1 days;

    event FaucetUsed(address indexed user, uint256 amount, uint256 timestamp);

    constructor() ERC20("Mock USDC", "USDC") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Faucet function - gives free USDC for testing
     */
    function faucet() external {
        require(
            block.timestamp >= lastFaucetTime[msg.sender] + faucetCooldown,
            "Faucet cooldown not met"
        );

        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, faucetAmount);

        emit FaucetUsed(msg.sender, faucetAmount, block.timestamp);
    }

    /**
     * @dev Check if user can use faucet
     */
    function canUseFaucet(address user) external view returns (bool) {
        return block.timestamp >= lastFaucetTime[user] + faucetCooldown;
    }

    /**
     * @dev Get time until next faucet use
     */
    function timeUntilNextFaucet(address user) external view returns (uint256) {
        uint256 nextTime = lastFaucetTime[user] + faucetCooldown;
        if (block.timestamp >= nextTime) {
            return 0;
        }
        return nextTime - block.timestamp;
    }

    /**
     * @dev Admin function to mint tokens
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Admin function to set faucet parameters
     */
    function setFaucetParams(uint256 _amount, uint256 _cooldown) external onlyOwner {
        faucetAmount = _amount;
        faucetCooldown = _cooldown;
    }
}
