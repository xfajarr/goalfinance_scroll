
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ConnectWalletDialog } from './ConnectWalletDialog';

export const DesktopNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'How it Works', path: '/how-it-works' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Community', path: '/community' },
    { label: 'Learn', path: '/learn' },
  ];

  return (
    <div className="hidden md:flex items-center space-x-8">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`font-fredoka text-sm font-medium transition-colors hover:text-goal-subheading ${
            location.pathname === item.path 
              ? 'text-goal-text' 
              : 'text-goal-text/70'
          }`}
        >
          {item.label}
        </Link>
      ))}
      
      <ConnectWalletDialog>
        <Button className="bg-goal-secondary hover:bg-goal-secondary/80 text-goal-text font-medium rounded-full px-4 py-2 text-sm">
          Connect Wallet
        </Button>
      </ConnectWalletDialog>
      
      <Button 
        asChild
        className="bg-goal-primary hover:bg-goal-primary/80 text-goal-text font-medium rounded-full px-6 py-2 text-sm transition-all duration-200 hover:scale-105"
      >
        <Link to="/dashboard">Start Saving</Link>
      </Button>
    </div>
  );
};
