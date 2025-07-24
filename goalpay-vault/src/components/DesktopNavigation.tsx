
import { Link, useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { ConnectWalletDialog } from './ConnectWalletDialog';
import { ChainSwitcher } from './ChainSwitcher';
import { Wallet, Check } from 'lucide-react';

export const DesktopNavigation = () => {
  const location = useLocation();
  const { authenticated } = usePrivy();
  const { isConnected, address } = useAccount();

  const isWalletConnected = authenticated && isConnected;

  const navItems = [
    { label: 'Home', path: isWalletConnected ? '/dashboard' : '/' },
    { label: 'Discover Circles', path: '/discover-circles' },
    { label: 'Learn', path: '/learn' },
    { label: 'How it Works', path: '/how-it-works' },
    { label: 'FAQ', path: '/faq' },
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

      {/* Show chain switcher when wallet is connected */}
      {isWalletConnected && (
        <ChainSwitcher className="border-goal-border text-goal-text hover:bg-goal-accent" />
      )}

      <ConnectWalletDialog>
        <Button className={`font-medium rounded-full px-4 py-2 text-sm transition-all duration-200 ${
          isWalletConnected
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-goal-secondary hover:bg-goal-secondary/80 text-goal-text'
        }`}>
          {isWalletConnected ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
      </ConnectWalletDialog>

      {/* <Button
        asChild
        className="bg-goal-primary hover:bg-goal-primary/80 text-goal-text font-medium rounded-full px-6 py-2 text-sm transition-all duration-200 hover:scale-105"
      >
        <Link to="/dashboard">
          {isWalletConnected ? 'Launch App' : 'Start Saving'}
        </Link>
      </Button> */}
    </div>
  );
};
