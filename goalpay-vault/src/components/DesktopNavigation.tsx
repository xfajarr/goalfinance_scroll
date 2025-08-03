
import { Link, useLocation } from 'react-router-dom';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { Button } from '@/components/ui/button';
import { WalletButton } from './wallet/WalletButton';

export const DesktopNavigation = () => {
  const location = useLocation();
  const { isConnected } = useWalletGuard();

  const navItems = [
    { label: 'Home', path: isConnected ? '/app/dashboard' : '/' },
    ...(isConnected ? [
      { label: 'Split Bills', path: '/app/split-bills' },
      { label: 'Debts', path: '/app/debts' },
      { label: 'Profile', path: '/app/profile' },
    ] : [
      { label: 'How it Works', path: '/how-it-works' },
      { label: 'FAQ', path: '/faq' },
    ]),
    { label: 'Faucet', path: '/faucet' },
  ];

  return (
    <div className="hidden md:flex items-center space-x-8">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`font-fredoka text-sm font-medium transition-all duration-200 px-4 py-2 rounded-2xl ${
            location.pathname === item.path
              ? 'text-goal-text bg-goal-primary/20 shadow-sm'
              : 'text-goal-text/70 hover:text-goal-subheading hover:bg-goal-primary/10 hover:shadow-sm'
          }`}
        >
          {item.label}
        </Link>
      ))}

      <WalletButton variant="outline" size="sm" />

      <Button
        asChild
        className="bg-goal-primary hover:bg-goal-primary/80 text-goal-text font-medium rounded-full px-6 py-2 text-sm transition-all duration-200 hover:scale-105"
      >
        <Link to={isConnected ? '/app/dashboard' : '/app/dashboard'}>
          {isConnected ? 'Dashboard' : 'Get Started'}
        </Link>
      </Button>
    </div>
  );
};
