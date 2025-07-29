import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/components/wallet/WalletButton';

interface LandingLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component for public/landing pages
 * Features minimal navigation focused on marketing and wallet connection
 */
export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-goal-bg">
      {/* Landing Navigation */}
      <nav className="sticky top-0 z-50 bg-goal-accent/80 backdrop-blur-sm border-b border-goal-border">
        <div className="container-page">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl md:text-2xl font-fredoka font-bold text-goal-text-primary hover:text-goal-text transition-colors">
                Goal Finance
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/how-it-works" 
                className="text-goal-text hover:text-goal-text-primary transition-colors font-medium"
              >
                How it Works
              </Link>
              <Link 
                to="/faq" 
                className="text-goal-text hover:text-goal-text-primary transition-colors font-medium"
              >
                FAQ
              </Link>
              
              {/* Connect Wallet Button */}
              <WalletButton 
                variant="default"
                className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold px-6 py-2 rounded-2xl"
              />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <WalletButton 
                variant="default"
                size="sm"
                className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold px-4 py-2 rounded-2xl"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-goal-accent/50 border-t border-goal-border mt-16">
        <div className="container-page py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="font-fredoka font-bold text-lg text-goal-text-primary">
                Goal Finance
              </h3>
              <p className="text-goal-text/70 text-sm">
                Achieve your financial goals together with friends through secure, social savings.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="font-fredoka font-semibold text-goal-text-primary">
                Product
              </h4>
              <div className="space-y-2">
                <Link 
                  to="/how-it-works" 
                  className="block text-goal-text/70 hover:text-goal-text transition-colors text-sm"
                >
                  How it Works
                </Link>
                <Link 
                  to="/faq" 
                  className="block text-goal-text/70 hover:text-goal-text transition-colors text-sm"
                >
                  FAQ
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="font-fredoka font-semibold text-goal-text-primary">
                Resources
              </h4>
              <div className="space-y-2">
                <a 
                  href="https://github.com/your-repo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-goal-text/70 hover:text-goal-text transition-colors text-sm"
                >
                  GitHub
                </a>
                <a 
                  href="https://docs.goalfinance.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-goal-text/70 hover:text-goal-text transition-colors text-sm"
                >
                  Documentation
                </a>
              </div>
            </div>

            {/* Community */}
            <div className="space-y-4">
              <h4 className="font-fredoka font-semibold text-goal-text-primary">
                Community
              </h4>
              <div className="space-y-2">
                <a 
                  href="https://twitter.com/goalfinance" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-goal-text/70 hover:text-goal-text transition-colors text-sm"
                >
                  Twitter
                </a>
                <a 
                  href="https://discord.gg/goalfinance" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-goal-text/70 hover:text-goal-text transition-colors text-sm"
                >
                  Discord
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-goal-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-goal-text/60 text-sm">
              © 2024 Goal Finance. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                to="/privacy" 
                className="text-goal-text/60 hover:text-goal-text transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-goal-text/60 hover:text-goal-text transition-colors text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingLayout;
