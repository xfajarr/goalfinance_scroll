# 🎯 Goal Finance - Decentralized Collaborative Savings

<div align="center">

![Goal Finance Banner](https://img.shields.io/badge/Goal%20Finance-Collaborative%20Savings-brightgreen?style=for-the-badge&logo=ethereum)

**The future of collaborative savings** 🚀

[![Smart Contracts](https://img.shields.io/badge/Smart%20Contracts-Solidity%20^0.8.24-blue?style=flat-square&logo=solidity)](./goalpay-contract)
[![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-61dafb?style=flat-square&logo=react)](./goalpay-vault)
[![Web3](https://img.shields.io/badge/Web3-wagmi%20+%20viem-ff6b35?style=flat-square&logo=web3dotjs)](https://wagmi.sh/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[🌟 Live Demo](https://goal-finance.vercel.app) • [🏗️ Architecture](#architecture) • [📖 Documentation](#documentation) • [🔗 Multi-Chain Explorer](#-deployed-networks)

</div>

## 🌟 What is Goal Finance?

Goal Finance is a **decentralized savings protocol** built for **next-generation blockchains** that revolutionizes collaborative savings. Leveraging fast, secure, and cost-effective blockchain infrastructure, Goal Finance enables users to create shared savings goals with friends, family, or community members in a completely trustless environment.

### ✨ Why Goal Finance?

- 🚀 **Multi-Chain**: Deployed on Lisk, Scroll, and Etherlink for maximum accessibility
- 🎯 **Collaborative Savings**: Create and join savings goals with your community
- 🔒 **Smart Contract Security**: Funds protected by audited Solidity contracts
- ⚡ **Fast & Affordable**: Benefit from low transaction fees and quick finality
- 📈 **Yield Generation**: Earn returns while saving (8% APY coming soon!)
- 🎉 **Social Motivation**: Stay motivated through community accountability
- 💎 **Full Transparency**: Every transaction verifiable on-chain
- 🌐 **Interoperable**: Seamlessly connect with the broader Ethereum ecosystem

---

## 🎮 Live Demo

**Try GoalFi now**: [goal-finance.vercel.app](https://goal-finance.vercel.app)

### How to Test on Supported Networks:
1. **Connect your wallet** (MetaMask, WalletConnect, etc.)
2. **Switch to a supported testnet**:
   
   **Lisk Sepolia**:
   - Network Name: Lisk Sepolia Testnet
   - RPC URL: `https://rpc.sepolia-api.lisk.com`
   - Chain ID: `4202`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia-blockscout.lisk.com`
   
   **Scroll Sepolia**:
   - Network Name: Scroll Sepolia Testnet
   - RPC URL: `https://sepolia-rpc.scroll.io`
   - Chain ID: `534351`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.scrollscan.com`
   
   **Etherlink Testnet**:
   - Network Name: Etherlink Testnet
   - RPC URL: `https://node.ghostnet.etherlink.com`
   - Chain ID: `128123`
   - Currency Symbol: `XTZ`
   - Block Explorer: `https://testnet.explorer.etherlink.com`

3. **Get test USDC** from the built-in faucet (1000 USDC daily limit)
4. **Create a savings vault** with custom penalty rates (1%, 3%, 5%, 10%)
5. **Share the invite link** with friends to join instantly
6. **Add funds** and watch progress with real-time savings breakdown

---

## 🏗️ Architecture

Goal Finance leverages modern blockchain infrastructure for optimal performance across multiple networks:

### 🔗 Smart Contracts (`/goalpay-contract`)
- **GoalFinance**: Main contract managing all savings vaults
- **VaultConfig**: Configurable vault parameters with custom penalty rates
- **MockUSDC**: Test token for development across all testnets

### 🎨 Frontend (`/goalpay-vault`)
- **React + TypeScript**: Modern, type-safe development
- **wagmi + viem**: Optimized for multi-chain blockchain integration
- **shadcn/ui**: Beautiful, accessible components
- **RainbowKit**: Seamless wallet connections across all supported chains

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Smart Contracts │    │  Multi-Chain    │
│                 │    │                  │    │                 │
│ • React App     │◄──►│ • GoalFinance    │◄──►│ • Lisk          │
│ • Web3 UI       │    │ • Vault Configs  │    │ • Scroll        │
│ • Multi-Chain   │    │ • Penalty System │    │ • Etherlink     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## ✨ Features

### 🎯 Live Features
- ✅ **Custom Penalty Rates** - Choose 1%, 3%, 5%, or 10% commitment levels
- ✅ **Savings Breakdown Calculator** - See daily/weekly/monthly targets
- ✅ **Invite Link System** - Share complete invite links with embedded codes
- ✅ **Real-time Progress Tracking** - Watch your goals grow across all chains
- ✅ **Yield Projections** - Preview 8% APY earnings estimates
- ✅ **Public/Private Vaults** - Control who can join your goals
- ✅ **Secure Smart Contracts** - Audited and deployed across multiple chains
- ✅ **Multi-wallet Support** - Connect with any EVM-compatible wallet

### 🔮 Coming Soon
- 🚧 **Recurring Auto-Savings** - Automated daily/weekly/monthly deposits
- 🚧 **Yield Generation** - Earn 8% APY while saving
- 🚧 **Multi-Token Support** - USDT, DAI, and more native assets
- 🚧 **Mobile App** - Native mobile experience
- 🚧 **Cross-Chain Bridges** - Connect between supported L2s
- 🚧 **DAO Integration** - Community governance for platform decisions

---

## 💡 How Goal Finance Works

### 🎯 Simple 4-Step Process

#### 1. **Create Your Dream Goal** 💭
Set up your savings vault with:
- Goal name (e.g., "Family Vacation to Japan 🇯🇵")
- Target amount (e.g., $5,000)
- Deadline (e.g., 6 months)
- Privacy setting (public or invite-only)

#### 2. **Invite Your Circle** 👥
Share your goal with:
- Family members for shared expenses
- Friends for group adventures
- Community for collective goals
- Or keep it public for anyone to join

#### 3. **Save Together** 💰
Everyone contributes at their own pace:
- Add funds anytime with USDC
- Track progress in real-time
- See everyone's contributions
- Get motivated by group progress

#### 4. **Achieve & Celebrate** 🎉
When your goal is reached:
- Funds are automatically distributed
- Everyone gets their share proportionally
- Time to make your dream a reality!
- If goal isn't met, everyone gets their money back

---

## 🌐 Deployed Networks

| Network | Status | Chain ID | Explorer | Contract Addresses |
|---------|--------|----------|----------|-------------------|
| Lisk Sepolia | ✅ Live | 4202 | [Lisk Explorer](https://sepolia-blockscout.lisk.com/) | See [deployments/](./goalpay-contract/deployments/) |
| Scroll Sepolia | ✅ Live | 534351 | [Scroll Explorer](https://sepolia.scrollscan.com/) | See [deployments/](./goalpay-contract/deployments/) |
| Etherlink Testnet | ✅ Live | 128123 | [Etherlink Explorer](https://testnet.explorer.etherlink.com/) | See [deployments/](./goalpay-contract/deployments/) |

> **Note**: All contracts are currently deployed on testnets for hackathon demonstration. Mainnet deployment planned post-hackathon after security audit.

---

## 📖 Documentation

### 📋 Smart Contracts
- **[Contract Documentation](./goalpay-contract/README.md)** - Complete smart contract guide
- **[Deployment Guide](./goalpay-contract/DEPLOYMENT.md)** - Multi-chain deployment instructions
- **[Security Analysis](./goalpay-contract/CRITICAL_SECURITY_AUDIT.md)** - Security features and audit

### 🎨 Frontend Application
- **[Frontend Overview](./goalpay-vault/README.md)** - React application documentation
- **[Component Structure](./goalpay-vault/src/components/)** - UI component organization
- **[Web3 Integration](./goalpay-vault/src/hooks/)** - wagmi hooks and blockchain interaction

### Project Structure
```
GoalFi/
├── goalpay-contract/          # Smart contracts (Foundry)
│   ├── src/                   # Solidity contracts
│   ├── test/                  # Contract tests
│   ├── script/                # Deployment scripts
│   └── deployments/           # Deployed contract addresses
├── goalpay-vault/             # Frontend application (React)
│   ├── src/                   # React components and pages
│   ├── public/                # Static assets
│   └── contracts/             # Contract ABIs
└── planning/                  # Development planning docs
```

---

## Real-World Use Cases

### ‍👩‍👧‍👦 Family Goals
- **Family Vacation**: Save together for that dream trip to Europe
- **New Home**: Pool resources for a down payment on your family home
- **Education Fund**: Collaborate with relatives to fund a child's college education
- **Emergency Fund**: Build a family safety net with contributions from all members

### 👥 Friend Groups
- **Group Adventures**: Plan and save for music festivals, ski trips, or backpacking adventures
- **Shared Purchases**: Buy expensive items together like gaming setups or party equipment
- **Event Planning**: Coordinate savings for weddings, birthday parties, or reunions
- **Investment Clubs**: Pool money for group investments or business ventures

### 🌍 Community Projects
- **Local Initiatives**: Fund community gardens, playgrounds, or local events
- **Charity Drives**: Organize transparent fundraising for causes you care about
- **Startup Funding**: Gather initial capital from your network for business ideas
- **Creator Support**: Help content creators, artists, or innovators reach their funding goals

### 💡 Why People Love GoalFi
- **Transparency**: Everyone can see exactly how much has been saved and by whom
- **Motivation**: Group accountability keeps everyone committed to the goal
- **Flexibility**: Join or leave vaults, contribute any amount, anytime
- **Security**: Your money is protected by smart contracts, not promises
- **Celebration**: Achieving goals together creates stronger bonds and shared memories

---

## 🎯 Hackathon Achievements & Future Vision

### 🏆 What We Built (Q3 2025)
- ✅ **Complete Savings Platform** - Full-featured collaborative savings DApp
- ✅ **Multi-Chain Support** - Deployed on Lisk, Scroll, and Etherlink testnets
- ✅ **Seamless User Experience** - Intuitive interface with wallet integration
- ✅ **Smart Contract Security** - Audited contracts with comprehensive testing
- ✅ **Real-Time Collaboration** - Live progress tracking and member management
- ✅ **Flexible Privacy** - Public discovery or private invite-only vaults

### 🌐 Future Vision: Cross-Chain Savings Revolution
**The next evolution of collaborative savings across all blockchains**

#### 🔗 Cross-Chain Features (Coming 2026)
- **Universal Vaults**: Create a vault on one chain, contribute from another, withdraw anywhere
- **Multi-Token Support**: Save with ETH, USDC, native tokens across all supported chains
- **Chain-Agnostic Goals**: Set goals in any currency, contribute from any supported chain
- **Unified Dashboard**: Manage all your cross-chain savings from one interface
- **Automatic Bridging**: Seamless token transfers between chains for contributions

#### 🚀 Advanced Collaboration
- **Global Community Goals**: Join savings goals with people worldwide, regardless of their preferred chain
- **Cross-Chain Yield**: Optimize returns by automatically moving funds to the best yield opportunities
- **Multi-Chain Governance**: Vote on platform decisions using tokens from any supported chain

---

<div align="center">

**Try the live demo**: [goal-finance.vercel.app](https://goal-finance.vercel.app)

*Demonstrating the future of collaborative savings through Web3 technology - where dreams become achievable through community support and transparent, trustless smart contracts.*

**The future is cross-chain. The future is collaborative. The future is Goal Finance.** 🌐

</div>
