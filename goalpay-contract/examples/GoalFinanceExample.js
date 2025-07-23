/**
 * GoalFinance Contract Interaction Example
 * 
 * This example demonstrates how to interact with the GoalFinance contract
 * using ethers.js or viem in a frontend application.
 */

// Example using ethers.js v6
import { ethers } from 'ethers';

// Contract ABI (simplified - include only functions you need)
const GOAL_FINANCE_ABI = [
  "function createVault(string memory _name, string memory _description, address _token, uint8 _goalType, uint8 _visibility, uint256 _targetAmount, uint256 _deadline) external returns (uint256 vaultId, bytes32 inviteCode)",
  "function joinVaultAndDeposit(uint256 _vaultId, uint256 _amount, bytes32 _inviteCode) external",
  "function addFunds(uint256 _vaultId, uint256 _amount) external",
  "function withdraw(uint256 _vaultId) external",
  "function withdrawEarly(uint256 _vaultId) external",
  "function claimPenalties(address _token) external",
  "function getVault(uint256 _vaultId) external view returns (tuple)",
  "function getMember(uint256 _vaultId, address _member) external view returns (tuple)",
  "function getAllVaults() external view returns (uint256[])",
  "function getVaultsByCreator(address _creator) external view returns (uint256[])",
  "function getVaultsPaginated(uint256 _offset, uint256 _limit) external view returns (uint256[], bool)",
  "function isGoalReached(uint256 _vaultId) external view returns (bool)",
  "function getVaultProgress(uint256 _vaultId) external view returns (uint256)",
  "function getClaimablePenalties(address _user) external view returns (uint256)",
  "function getClaimablePenaltiesByToken(address _user, address _token) external view returns (uint256)",
  "function isTokenSupported(address _token) external view returns (bool)",
  "function getTotalVaultCount() external view returns (uint256)"
];

const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

// Contract addresses (replace with actual deployed addresses)
const GOAL_FINANCE_ADDRESS = "0x..."; // Your deployed GoalFinance contract
const USDC_ADDRESS = "0x..."; // USDC token address

class GoalFinanceSDK {
  constructor(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    this.goalFinance = new ethers.Contract(GOAL_FINANCE_ADDRESS, GOAL_FINANCE_ABI, signer);
    this.usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
  }

  /**
   * Create a new savings vault
   */
  async createVault(params) {
    const { name, description, token, goalType, visibility, targetAmount, durationDays } = params;
    
    const deadline = Math.floor(Date.now() / 1000) + (durationDays * 24 * 60 * 60);
    const targetAmountWei = ethers.parseUnits(targetAmount.toString(), 6); // USDC has 6 decimals
    
    const tx = await this.goalFinance.createVault(
      name,
      description,
      token,
      goalType, // 0 = PERSONAL, 1 = GROUP
      visibility, // 0 = PUBLIC, 1 = PRIVATE
      targetAmountWei,
      deadline
    );
    
    const receipt = await tx.wait();
    
    // Parse the VaultCreated event to get vaultId and inviteCode
    const event = receipt.logs.find(log => 
      log.topics[0] === ethers.id("VaultCreated(uint256,address,string,uint8,uint256,uint256,bytes32)")
    );
    
    if (event) {
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ["uint256", "address", "string", "uint8", "uint256", "uint256", "bytes32"],
        event.data
      );
      return {
        vaultId: decoded[0],
        inviteCode: decoded[6],
        txHash: receipt.hash
      };
    }
    
    throw new Error("VaultCreated event not found");
  }

  /**
   * Join a vault and make initial deposit
   */
  async joinVaultAndDeposit(vaultId, amount, inviteCode = "0x0000000000000000000000000000000000000000000000000000000000000000") {
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    
    // First approve USDC spending
    await this.approveUSDC(amountWei);
    
    const tx = await this.goalFinance.joinVaultAndDeposit(vaultId, amountWei, inviteCode);
    return await tx.wait();
  }

  /**
   * Add more funds to existing vault membership
   */
  async addFunds(vaultId, amount) {
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    
    // First approve USDC spending
    await this.approveUSDC(amountWei);
    
    const tx = await this.goalFinance.addFunds(vaultId, amountWei);
    return await tx.wait();
  }

  /**
   * Withdraw funds after goal is reached
   */
  async withdraw(vaultId) {
    const tx = await this.goalFinance.withdraw(vaultId);
    return await tx.wait();
  }

  /**
   * Withdraw early with penalty
   */
  async withdrawEarly(vaultId) {
    const tx = await this.goalFinance.withdrawEarly(vaultId);
    return await tx.wait();
  }

  /**
   * Claim released penalty funds for a specific token
   */
  async claimPenalties(tokenAddress) {
    const tx = await this.goalFinance.claimPenalties(tokenAddress);
    return await tx.wait();
  }

  /**
   * Get vault information
   */
  async getVault(vaultId) {
    const vault = await this.goalFinance.getVault(vaultId);
    return {
      id: vault.id,
      name: vault.name,
      description: vault.description,
      creator: vault.creator,
      goalType: vault.goalType,
      visibility: vault.visibility,
      targetAmount: ethers.formatUnits(vault.targetAmount, 6),
      deadline: new Date(Number(vault.deadline) * 1000),
      totalDeposited: ethers.formatUnits(vault.totalDeposited, 6),
      memberCount: Number(vault.memberCount),
      status: vault.status, // 0 = ACTIVE, 1 = SUCCESS, 2 = FAILED
      inviteCode: vault.inviteCode,
      createdAt: new Date(Number(vault.createdAt) * 1000)
    };
  }

  /**
   * Get member information
   */
  async getMember(vaultId, memberAddress) {
    const member = await this.goalFinance.getMember(vaultId, memberAddress);
    return {
      depositedAmount: ethers.formatUnits(member.depositedAmount, 6),
      targetShare: ethers.formatUnits(member.targetShare, 6),
      joinedAt: new Date(Number(member.joinedAt) * 1000),
      hasWithdrawn: member.hasWithdrawn,
      earlyWithdrawalTime: Number(member.earlyWithdrawalTime),
      penaltyAmount: ethers.formatUnits(member.penaltyAmount, 6)
    };
  }

  /**
   * Check if vault goal is reached
   */
  async isGoalReached(vaultId) {
    return await this.goalFinance.isGoalReached(vaultId);
  }

  /**
   * Get vault progress percentage
   */
  async getVaultProgress(vaultId) {
    const progress = await this.goalFinance.getVaultProgress(vaultId);
    return Number(progress) / 100; // Convert from basis points to percentage
  }

  /**
   * Get claimable penalty amount
   */
  async getClaimablePenalties(userAddress) {
    const amount = await this.goalFinance.getClaimablePenalties(userAddress);
    return ethers.formatUnits(amount, 6);
  }

  /**
   * Approve USDC spending
   */
  async approveUSDC(amount) {
    const currentAllowance = await this.usdc.allowance(
      await this.signer.getAddress(),
      GOAL_FINANCE_ADDRESS
    );
    
    if (currentAllowance < amount) {
      const tx = await this.usdc.approve(GOAL_FINANCE_ADDRESS, amount);
      await tx.wait();
    }
  }

  /**
   * Get user's USDC balance
   */
  async getUSDCBalance(userAddress) {
    const balance = await this.usdc.balanceOf(userAddress);
    return ethers.formatUnits(balance, 6);
  }

  /**
   * Get all vault IDs
   */
  async getAllVaults() {
    return await this.goalFinance.getAllVaults();
  }

  /**
   * Get vaults created by a specific creator
   */
  async getVaultsByCreator(creatorAddress) {
    return await this.goalFinance.getVaultsByCreator(creatorAddress);
  }

  /**
   * Get vaults with pagination
   */
  async getVaultsPaginated(offset, limit) {
    const result = await this.goalFinance.getVaultsPaginated(offset, limit);
    return {
      vaultIds: result[0],
      hasMore: result[1]
    };
  }

  /**
   * Get claimable penalties for specific token
   */
  async getClaimablePenaltiesByToken(userAddress, tokenAddress) {
    const amount = await this.goalFinance.getClaimablePenaltiesByToken(userAddress, tokenAddress);
    return ethers.formatUnits(amount, 6);
  }

  /**
   * Check if token is supported
   */
  async isTokenSupported(tokenAddress) {
    return await this.goalFinance.isTokenSupported(tokenAddress);
  }

  /**
   * Get total vault count
   */
  async getTotalVaultCount() {
    return await this.goalFinance.getTotalVaultCount();
  }
}

// Usage example
async function example() {
  // Initialize provider and signer
  const provider = new ethers.JsonRpcProvider("YOUR_RPC_URL");
  const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);
  
  // Create SDK instance
  const goalFinance = new GoalFinanceSDK(provider, signer);
  
  try {
    // Create a group vault
    const vaultResult = await goalFinance.createVault({
      name: "Family Vacation Fund",
      description: "Saving for our summer vacation to Europe",
      token: "0x...", // USDC token address
      goalType: 1, // GROUP
      visibility: 1, // PRIVATE
      targetAmount: 5000, // 5000 USDC
      durationDays: 90
    });
    
    console.log("Vault created:", vaultResult);
    
    // Join the vault with initial deposit
    await goalFinance.joinVaultAndDeposit(vaultResult.vaultId, 1000);
    console.log("Joined vault with 1000 USDC");
    
    // Check vault progress
    const progress = await goalFinance.getVaultProgress(vaultResult.vaultId);
    console.log(`Vault progress: ${progress}%`);
    
    // Get vault details
    const vault = await goalFinance.getVault(vaultResult.vaultId);
    console.log("Vault details:", vault);

    // Get all vaults
    const allVaults = await goalFinance.getAllVaults();
    console.log("All vault IDs:", allVaults);

    // Get vaults by creator
    const creatorVaults = await goalFinance.getVaultsByCreator(signer.address);
    console.log("Creator's vaults:", creatorVaults);

    // Get vaults with pagination
    const paginatedVaults = await goalFinance.getVaultsPaginated(0, 10);
    console.log("First 10 vaults:", paginatedVaults);

  } catch (error) {
    console.error("Error:", error);
  }
}

export { GoalFinanceSDK, example };
