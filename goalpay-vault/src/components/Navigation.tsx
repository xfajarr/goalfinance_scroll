
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { DesktopNavigation } from './DesktopNavigation';
import { ConnectWalletDialog } from './ConnectWalletDialog';

const Navigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'How it Works', path: '/how-it-works' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Community', path: '/community' },
    { label: 'Learn', path: '/learn' },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-goal-accent/80 backdrop-blur-sm border-b border-goal-border">
      <div className="container-page">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl md:text-3xl font-fredoka font-bold text-goal-subheading hover:text-goal-text transition-colors">
              goalpay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ConnectWalletDialog>
              <Button className="bg-goal-secondary hover:bg-goal-secondary/80 text-goal-text font-medium rounded-full px-3 py-2 text-sm">
                Wallet
              </Button>
            </ConnectWalletDialog>
            
            <Button 
              asChild
              className="bg-goal-primary hover:bg-goal-primary/80 text-goal-text font-medium rounded-full px-4 py-2 text-sm"
            >
              <Link to="/dashboard">Start</Link>
            </Button>
            
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-goal-text hover:bg-goal-accent/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-goal-border/30 bg-goal-accent/90 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg font-inter text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-goal-primary text-goal-text'
                      : 'text-goal-text/70 hover:text-goal-text hover:bg-goal-accent/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
