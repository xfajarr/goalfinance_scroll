# 🎯 GoalFi - Collaborative Savings Made Simple

<div align="center">

![GoalFi Banner](https://img.shields.io/badge/GoalFi-Collaborative%20Savings-brightgreen?style=for-the-badge&logo=ethereum)
![Hackathon](https://img.shields.io/badge/🏆-Hackathon%20Project-orange?style=for-the-badge)

**Turn your financial dreams into reality with friends, family, and community** 🚀

> 🏆 **Hackathon Project** - Built during a blockchain hackathon to showcase the future of collaborative savings

[![Smart Contracts](https://img.shields.io/badge/Smart%20Contracts-Solidity%20^0.8.24-blue?style=flat-square&logo=solidity)](./goalpay-contract)
[![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-61dafb?style=flat-square&logo=react)](./goalpay-vault)
[![Web3](https://img.shields.io/badge/Web3-wagmi%20+%20viem-ff6b35?style=flat-square&logo=web3dotjs)](https://wagmi.sh/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[🌟 Live Demo](https://goal-finance.vercel.app) • [🏆 Hackathon Info](#hackathon-submission) • [🏗️ Architecture](#architecture) • [📖 Documentation](#documentation)

</div>

## �🌟 What is GoalFi?

GoalFi is a **decentralized savings platform** that transforms the way people save money by making it **collaborative, fun, transparent, and rewarding**. Create shared savings goals with friends, family, or community members, and watch your dreams become reality together!

### ✨ Why GoalFi?

- 🎯 **Shared Goals**: Save together for vacations, gadgets, emergencies, or any dream
- 🔒 **Trustless Security**: Smart contracts ensure your funds are always safe
- 📈 **Yield Generation**: Earn returns while saving (coming soon!)
- 🎉 **Social Motivation**: Stay motivated with friends and community
- 🌍 **Multi-Chain**: Deploy on Base, Arbitrum, Mantle, and more
- 💎 **Transparent**: Every transaction is on-chain and verifiable

---

## 🎮 Live Demo

**Try GoalFi now**: [goal-finance.vercel.app](https://goal-finance.vercel.app)

### How to Test:
1. **Connect your wallet** (MetaMask, WalletConnect, etc.)
2. **Switch to a supported testnet**:
   - Mantle Sepolia
   - Base Sepolia
3. **Get test USDC** from the built-in faucet (1000 USDC daily limit)
4. **Create a savings vault** with your goal
5. **Share the invite code** with friends to join
6. **Add funds** and watch progress in real-time

---

## 🏗️ Architecture

GoalFi consists of two main components working in perfect harmony:

### 🔗 Smart Contracts (`/goalpay-contract`)
- **GoalVaultFactory**: Creates and manages all savings vaults
- **GoalVault**: Individual vault contracts for each savings goal
- **MockUSDC**: Test token for development and testing

### 🎨 Frontend (`/goalpay-vault`)
- **React + TypeScript**: Modern, type-safe development
- **wagmi + viem**: Best-in-class Web3 integration
- **shadcn/ui**: Beautiful, accessible components
- **RainbowKit**: Seamless wallet connections

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Smart Contracts │    │   Blockchain    │
│                 │    │                  │    │                 │
│ • React App     │◄──►│ • VaultFactory   │◄──►│ • Base/Arbitrum │
│ • Web3 UI       │    │ • Individual     │    │ • Mantle/Sepolia│
│ • Wallet Connect│    │   Vaults         │    │ • Ethereum      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## ✨ Features

### 🎯 MVP Features (Live Now!)
- ✅ **Create Savings Vaults** with custom goals and deadlines
- ✅ **Invite Friends** via shareable codes
- ✅ **Add Funds** with USDC contributions
- ✅ **Track Progress** in real-time
- ✅ **Public/Private Vaults** for different privacy needs
- ✅ **Automatic Completion** when goals are reached
- ✅ **Secure Withdrawals** if goals aren't met

### 🔮 Coming Soon
- 🚧 **Yield Generation** - Earn while you save
- 🚧 **Multi-Token Support** - DAI, USDT, and more
- 🚧 **Recurring Contributions** - Set it and forget it
- 🚧 **Vault Templates** - Quick setup for common goals
- 🚧 **Mobile App** - Save on the go
- 🚧 **DAO Governance** - Community-driven decisions

---

## 💡 How GoalFi Works

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
| Mantle Sepolia | ✅ Live | 5003 | [MantleScan](https://sepolia.mantlescan.xyz) | See [deployments/](./goalpay-contract/deployments/) |
| Base Sepolia | ✅ Live | 84532 | [BaseScan](https://sepolia.basescan.org) | See [deployments/](./goalpay-contract/deployments/) |

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

### � Project Structure
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

## � Real-World Use Cases

### �‍👩‍👧‍👦 Family Goals
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
- ✅ **Multi-Chain Support** - Deployed on Base, Arbitrum, and Mantle testnets
- ✅ **Seamless User Experience** - Intuitive interface with wallet integration
- ✅ **Smart Contract Security** - Audited contracts with comprehensive testing
- ✅ **Real-Time Collaboration** - Live progress tracking and member management
- ✅ **Flexible Privacy** - Public discovery or private invite-only vaults

### 🌐 Future Vision: Cross-Chain Savings Revolution
**The next evolution of collaborative savings across all blockchains**

#### 🔗 Cross-Chain Features (Coming 2026)
- **Universal Vaults**: Create a vault on Ethereum, contribute from Polygon, withdraw on Base
- **Multi-Token Support**: Save with ETH on mainnet, USDC on Arbitrum, MATIC on Polygon
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

**The future is cross-chain. The future is collaborative. The future is GoalFi.** 🌐

</div>
