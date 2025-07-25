# GoalFi Frontend

## Project Overview

GoalFi is a decentralized savings platform that transforms the way people save money by making it collaborative, fun, transparent, and rewarding. This is the frontend application built with React, TypeScript, and modern Web3 technologies.

## How to run this project locally

**Prerequisites**

You need Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

**Installation & Setup**

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd goalpay-vault

# Step 3: Install dependencies (using pnpm)
pnpm install

# Step 4: Start the development server
pnpm dev
```

The application will be available at `http://localhost:8081`

## Development

**Local Development**

Edit files directly in your IDE and save them. You'll see changes reflected in the browser with hot reload.

**GitHub Codespaces**

- Navigate to the main page of your repository
- Click on the "Code" button (green button) near the top right
- Select the "Codespaces" tab
- Click on "New codespace" to launch a new Codespace environment
- Edit files directly within the Codespace and commit and push your changes once you're done

## Technologies Used

This project is built with modern web technologies:

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components

### Web3 Integration
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript interface for Ethereum
- **RainbowKit** - Wallet connection library

### State Management & Utils
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

## Project Structure

```
goalpay-vault/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
└── contracts/         # Smart contract ABIs
```

## Features

- 🎯 **Goal-based Savings** - Create and track savings goals
- 🤝 **Community Savings** - Join savings circles with others
- 📚 **Learn & Earn** - Interactive flashcard learning system
- 🏆 **Gamification** - Points, achievements, and streaks
- 📱 **Mobile-First** - Responsive design for all devices
- 🔐 **Web3 Native** - Connect with any Ethereum wallet

## Deployment

This project can be deployed to any static hosting service:

- **Vercel** (Recommended)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**

Build the project with:
```sh
pnpm build
```

The `dist` folder will contain the production-ready files.
