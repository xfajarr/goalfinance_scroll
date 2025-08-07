/**
 * Acorns Vault Example - Comprehensive demonstration of all features
 * 
 * Features demonstrated:
 * - Round-up transactions from purchases
 * - Micro-investing spare change
 * - Automatic investment in portfolios
 * - Transaction monitoring and rounding
 * - Recurring investments
 * - Mock Morpho yield generation
 * - Multi-token support
 */

const { ethers } = require('ethers');

// Contract ABIs (simplified for example)
const ACORNS_VAULT_ABI = [
  "function registerUser(uint8 _portfolio) external",
  "function simulatePurchase(uint256 _amount, string memory _merchant) external",
  "function calculateRoundUp(uint256 _amount) external pure returns (uint256)",
  "function investRoundUps() external",
  "function setRecurringInvestment(uint256 _amount, uint256 _intervalDays) external",
  "function executeRecurringInvestment() external",
  "function depositFunds(address _token, uint256 _amount) external",
  "function claimYield() external",
  "function withdrawFunds(uint256 _amount) external",
  "function changePortfolio(uint8 _newPortfolio) external",
  "function getUserAccount(address _user) external view returns (tuple)",
  "function getUserPurchases(address _user) external view returns (tuple[])",
  "function getPortfolioValue(address _user) external view returns (uint256)",
  "function getPendingRoundUps(address _user) external view returns (uint256)",
  "function calculateYield(address _user) external view returns (uint256)",
  "function isRecurringDue(address _user) external view returns (bool)",
  "function getPortfolioAPY(uint8 _portfolio) external pure returns (uint256)",
  "event UserRegistered(address indexed user, uint8 portfolio)",
  "event PurchaseRecorded(address indexed user, uint256 amount, uint256 roundUp, string merchant)",
  "event RoundUpsInvested(address indexed user, uint256 amount)",
  "event RecurringInvestmentExecuted(address indexed user, uint256 amount)",
  "event YieldClaimed(address indexed user, uint256 amount)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function claimFromFaucet() external"
];

class AcornsVaultSDK {
  constructor(provider, signer, contractAddress) {
    this.provider = provider;
    this.signer = signer;
    this.acornsVault = new ethers.Contract(contractAddress, ACORNS_VAULT_ABI, signer);
    this.userAddress = signer.address;
  }

  /**
   * Register user with portfolio type
   */
  async registerUser(portfolioType) {
    console.log(`🎯 Registering user with ${this.getPortfolioName(portfolioType)} portfolio...`);
    
    const tx = await this.acornsVault.registerUser(portfolioType);
    const receipt = await tx.wait();
    
    console.log(`✅ User registered! Transaction: ${receipt.hash}`);
    return receipt;
  }

  /**
   * Simulate a purchase and calculate round-up
   */
  async simulatePurchase(amount, merchant) {
    const amountWei = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals
    
    console.log(`🛒 Simulating purchase: $${amount} at ${merchant}`);
    
    // Calculate round-up first
    const roundUpWei = await this.acornsVault.calculateRoundUp(amountWei);
    const roundUpAmount = parseFloat(ethers.formatUnits(roundUpWei, 6));
    
    console.log(`💰 Round-up amount: $${roundUpAmount.toFixed(2)}`);
    
    const tx = await this.acornsVault.simulatePurchase(amountWei, merchant);
    const receipt = await tx.wait();
    
    console.log(`✅ Purchase recorded! Transaction: ${receipt.hash}`);
    return { receipt, roundUpAmount };
  }

  /**
   * Invest accumulated round-ups
   */
  async investRoundUps() {
    console.log(`📈 Investing accumulated round-ups...`);
    
    const pendingRoundUps = await this.acornsVault.getPendingRoundUps(this.userAddress);
    const pendingAmount = parseFloat(ethers.formatUnits(pendingRoundUps, 6));
    
    if (pendingAmount === 0) {
      console.log(`❌ No round-ups to invest`);
      return null;
    }
    
    console.log(`💵 Investing $${pendingAmount.toFixed(2)} in round-ups`);
    
    const tx = await this.acornsVault.investRoundUps();
    const receipt = await tx.wait();
    
    console.log(`✅ Round-ups invested! Transaction: ${receipt.hash}`);
    return receipt;
  }

  /**
   * Set up recurring investment
   */
  async setRecurringInvestment(amount, intervalDays) {
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    
    console.log(`🔄 Setting up recurring investment: $${amount} every ${intervalDays} days`);
    
    const tx = await this.acornsVault.setRecurringInvestment(amountWei, intervalDays);
    const receipt = await tx.wait();
    
    console.log(`✅ Recurring investment set! Transaction: ${receipt.hash}`);
    return receipt;
  }

  /**
   * Execute recurring investment if due
   */
  async executeRecurringInvestment() {
    console.log(`🔄 Checking and executing recurring investment...`);
    
    const isDue = await this.acornsVault.isRecurringDue(this.userAddress);
    
    if (!isDue) {
      console.log(`⏰ Recurring investment not due yet`);
      return null;
    }
    
    const tx = await this.acornsVault.executeRecurringInvestment();
    const receipt = await tx.wait();
    
    console.log(`✅ Recurring investment executed! Transaction: ${receipt.hash}`);
    return receipt;
  }

  /**
   * Deposit funds manually
   */
  async depositFunds(tokenAddress, amount) {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
    const decimals = await token.decimals ? await token.decimals() : 6;
    const amountWei = ethers.parseUnits(amount.toString(), decimals);
    
    console.log(`💳 Depositing $${amount} tokens...`);
    
    // Approve first
    console.log(`🔓 Approving token spend...`);
    const approveTx = await token.approve(this.acornsVault.target, amountWei);
    await approveTx.wait();
    
    // Deposit
    const tx = await this.acornsVault.depositFunds(tokenAddress, amountWei);
    const receipt = await tx.wait();
    
    console.log(`✅ Funds deposited! Transaction: ${receipt.hash}`);
    return receipt;
  }

  /**
   * Claim accumulated yield
   */
  async claimYield() {
    console.log(`🎁 Claiming accumulated yield...`);
    
    const yieldAmount = await this.acornsVault.calculateYield(this.userAddress);
    const yieldValue = parseFloat(ethers.formatUnits(yieldAmount, 6));
    
    if (yieldValue === 0) {
      console.log(`❌ No yield to claim`);
      return null;
    }
    
    console.log(`💰 Claiming $${yieldValue.toFixed(4)} in yield`);
    
    const tx = await this.acornsVault.claimYield();
    const receipt = await tx.wait();
    
    console.log(`✅ Yield claimed! Transaction: ${receipt.hash}`);
    return receipt;
  }

  /**
   * Change portfolio type
   */
  async changePortfolio(newPortfolioType) {
    console.log(`🔄 Changing portfolio to ${this.getPortfolioName(newPortfolioType)}...`);
    
    const tx = await this.acornsVault.changePortfolio(newPortfolioType);
    const receipt = await tx.wait();
    
    console.log(`✅ Portfolio changed! Transaction: ${receipt.hash}`);
    return receipt;
  }

  /**
   * Get user account information
   */
  async getUserInfo() {
    console.log(`📊 Fetching user account information...`);
    
    const account = await this.acornsVault.getUserAccount(this.userAddress);
    const portfolioValue = await this.acornsVault.getPortfolioValue(this.userAddress);
    const pendingRoundUps = await this.acornsVault.getPendingRoundUps(this.userAddress);
    const currentYield = await this.acornsVault.calculateYield(this.userAddress);
    const purchases = await this.acornsVault.getUserPurchases(this.userAddress);
    
    const info = {
      totalInvested: parseFloat(ethers.formatUnits(account.totalInvested, 6)),
      totalRoundUps: parseFloat(ethers.formatUnits(account.totalRoundUps, 6)),
      pendingRoundUps: parseFloat(ethers.formatUnits(pendingRoundUps, 6)),
      accumulatedYield: parseFloat(ethers.formatUnits(account.accumulatedYield, 6)),
      currentYield: parseFloat(ethers.formatUnits(currentYield, 6)),
      portfolioValue: parseFloat(ethers.formatUnits(portfolioValue, 6)),
      portfolio: this.getPortfolioName(account.portfolio),
      recurringEnabled: account.recurringEnabled,
      recurringAmount: parseFloat(ethers.formatUnits(account.recurringAmount, 6)),
      purchaseCount: purchases.length
    };
    
    console.log(`📈 Portfolio Value: $${info.portfolioValue.toFixed(2)}`);
    console.log(`💰 Total Invested: $${info.totalInvested.toFixed(2)}`);
    console.log(`🔄 Total Round-ups: $${info.totalRoundUps.toFixed(2)}`);
    console.log(`⏳ Pending Round-ups: $${info.pendingRoundUps.toFixed(2)}`);
    console.log(`🎁 Current Yield: $${info.currentYield.toFixed(4)}`);
    console.log(`📊 Portfolio: ${info.portfolio}`);
    console.log(`🛒 Total Purchases: ${info.purchaseCount}`);
    
    return info;
  }

  /**
   * Get portfolio name from enum
   */
  getPortfolioName(portfolioType) {
    const portfolios = ['Conservative (4% APY)', 'Moderate (6% APY)', 'Aggressive (8% APY)'];
    return portfolios[portfolioType] || 'Unknown';
  }

  /**
   * Simulate a full day of purchases
   */
  async simulateDay() {
    console.log(`\n🌅 Simulating a full day of purchases...`);
    
    const purchases = [
      { amount: 4.25, merchant: "Coffee Shop" },
      { amount: 12.67, merchant: "Grocery Store" },
      { amount: 25.99, merchant: "Gas Station" },
      { amount: 8.50, merchant: "Lunch Restaurant" },
      { amount: 15.30, merchant: "Pharmacy" },
      { amount: 45.00, merchant: "Utility Bill" }
    ];
    
    let totalRoundUps = 0;
    
    for (const purchase of purchases) {
      const result = await this.simulatePurchase(purchase.amount, purchase.merchant);
      totalRoundUps += result.roundUpAmount;
      
      // Small delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n💰 Total round-ups for the day: $${totalRoundUps.toFixed(2)}`);
    
    // Invest all round-ups
    await this.investRoundUps();
    
    return totalRoundUps;
  }
}

// Usage example
async function demonstrateAcornsFeatures() {
  console.log("🚀 Acorns Vault Feature Demonstration\n");
  
  // Initialize provider and signer
  const provider = new ethers.JsonRpcProvider("YOUR_RPC_URL");
  const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);
  
  // Contract addresses (replace with actual deployed addresses)
  const ACORNS_VAULT_ADDRESS = "0x...";
  const USDC_ADDRESS = "0x...";
  
  // Create SDK instance
  const acorns = new AcornsVaultSDK(provider, signer, ACORNS_VAULT_ADDRESS);
  
  try {
    // 1. Register user with moderate portfolio
    await acorns.registerUser(1); // 1 = MODERATE
    
    // 2. Simulate daily purchases and round-ups
    await acorns.simulateDay();
    
    // 3. Set up recurring investment
    await acorns.setRecurringInvestment(50, 7); // $50 weekly
    
    // 4. Deposit additional funds
    await acorns.depositFunds(USDC_ADDRESS, 100); // $100 USDC
    
    // 5. Check account status
    await acorns.getUserInfo();
    
    // 6. Simulate time passing and claim yield
    console.log("\n⏰ Simulating 30 days passing...");
    // In real usage, you would wait or use a time manipulation tool
    
    await acorns.claimYield();
    
    // 7. Change to aggressive portfolio for higher yield
    await acorns.changePortfolio(2); // 2 = AGGRESSIVE
    
    // 8. Final account status
    console.log("\n📊 Final Account Status:");
    await acorns.getUserInfo();
    
    console.log("\n🎉 Demonstration complete!");
    
  } catch (error) {
    console.error("❌ Error during demonstration:", error.message);
  }
}

// Export for use in other scripts
module.exports = {
  AcornsVaultSDK,
  demonstrateAcornsFeatures
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateAcornsFeatures();
}
