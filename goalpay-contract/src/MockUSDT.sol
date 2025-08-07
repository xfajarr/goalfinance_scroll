// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @notice Mock USDT token for testing and demonstration
 * @dev ERC20 token with 6 decimals to match real USDT
 */
contract MockUSDT is ERC20, Ownable {
    uint8 private _decimals = 6;
    
    // Faucet settings
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**6; // 1000 USDT
    uint256 public constant FAUCET_COOLDOWN = 24 hours;
    
    mapping(address => uint256) public lastFaucetClaim;
    
    event FaucetClaimed(address indexed user, uint256 amount);
    
    error MockUSDT__FaucetCooldown();
    error MockUSDT__InvalidAmount();
    
    constructor(uint256 _initialSupply) ERC20("Mock Tether USD", "USDT") Ownable(msg.sender) {
        _mint(msg.sender, _initialSupply);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @notice Claim free USDT from faucet (once per day)
     */
    function claimFromFaucet() external {
        if (block.timestamp < lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN) {
            revert MockUSDT__FaucetCooldown();
        }
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @notice Mint tokens (only owner)
     */
    function mint(address _to, uint256 _amount) external onlyOwner {
        if (_amount == 0) revert MockUSDT__InvalidAmount();
        _mint(_to, _amount);
    }
    
    /**
     * @notice Burn tokens
     */
    function burn(uint256 _amount) external {
        if (_amount == 0) revert MockUSDT__InvalidAmount();
        _burn(msg.sender, _amount);
    }
    
    /**
     * @notice Check if user can claim from faucet
     */
    function canClaimFromFaucet(address _user) external view returns (bool) {
        return block.timestamp >= lastFaucetClaim[_user] + FAUCET_COOLDOWN;
    }
    
    /**
     * @notice Get time until next faucet claim
     */
    function timeUntilNextClaim(address _user) external view returns (uint256) {
        uint256 nextClaimTime = lastFaucetClaim[_user] + FAUCET_COOLDOWN;
        if (block.timestamp >= nextClaimTime) {
            return 0;
        }
        return nextClaimTime - block.timestamp;
    }
}
