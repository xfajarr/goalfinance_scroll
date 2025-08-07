import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/components/wallet/WalletButton';
import { ChainSwitcher } from '@/components/ChainSwitcher';
import { Droplets } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component for authenticated app pages
 * Features full navigation with wallet info, chain switcher, and all app functionality
 */
export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { isConnected } = useWalletGuard();

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard' },
    { label: 'Acorns', path: '/app/acorns' },
    { label: 'Split Bills', path: '/app/split-bills' },
    { label: 'Debts', path: '/app/debts' },
    { label: 'Faucet', path: '/faucet' },
    { label: 'Profile', path: '/app/profile' },
  ];

  return (
    <div className="min-h-screen bg-goal-accent">
      {/* App Navigation */}
      <nav className="sticky top-0 z-50 bg-goal-accent/80 backdrop-blur-sm border-b border-goal-border">
        <div className="container-page">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/app/dashboard" className="flex items-center">
              <span className="text-2xl md:text-2xl font-fredoka font-bold text-goal-text-primary hover:text-goal-text transition-colors">
                Goal Finance
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-fredoka font-medium transition-all duration-200 px-4 py-2 rounded-2xl ${
                    location.pathname === item.path
                      ? 'text-goal-text-primary bg-goal-primary shadow-sm'
                      : 'text-goal-text hover:text-goal-text-primary hover:bg-goal-primary hover:shadow-sm'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Wallet Button */}
              <WalletButton 
                variant="default"
                className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold px-4 py-2 rounded-2xl"
              />

              {/* Dashboard Button */}
              {/* <Button
                asChild
                className="bg-goal-secondary hover:bg-goal-secondary/80 text-goal-text font-medium rounded-2xl px-4 py-2"
              >
                <Link to="/app/dashboard">
                  Dashboard
                </Link>
              </Button> */}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Faucet Button for Mobile */}
              <Button
                asChild
                size="sm"
                className="bg-goal-secondary hover:bg-goal-secondary/80 text-goal-text font-fredoka font-medium px-3 py-2 rounded-2xl"
              >
                <Link to="/faucet">
                  <Droplets className="w-4 h-4" />
                </Link>
              </Button>

              <WalletButton
                variant="default"
                size="sm"
                className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold px-3 py-2 rounded-2xl"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
