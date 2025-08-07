
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, User, DollarSign, PiggyBank } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/app/dashboard',
      active: location.pathname === '/app/dashboard'
    },
    {
      icon: PiggyBank,
      label: 'Acorns',
      path: '/app/acorns',
      active: location.pathname === '/app/acorns'
    },
    {
      icon: Plus,
      label: 'Create',
      path: '/app/create-goal',
      active: location.pathname === '/app/create-goal'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/app/profile',
      active: location.pathname === '/app/profile'
    }
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 mb-6 mx-auto px-4 w-full max-w-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="bg-goal-text/95 backdrop-blur-xl rounded-full shadow-xl border border-white/10 flex items-center justify-between px-6 py-2">
        {navItems.map((item, index) => {
          const isMiddleItem = index === Math.floor(navItems.length / 2);

          // Middle item (Create button) with prominent styling
          if (isMiddleItem) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center rounded-full w-14 h-14 transition-all duration-300 focus:ring-2 focus:ring-goal-primary focus:outline-none shadow-lg ${
                  item.active
                    ? 'bg-goal-primary text-goal-text scale-110'
                    : 'bg-goal-primary text-goal-text hover:bg-goal-primary/90 hover:scale-105'
                }`}
                aria-label={`${item.label} - Create a new goal`}
                aria-current={item.active ? 'page' : undefined}
              >
                <item.icon className="w-7 h-7" />
              </Link>
            );
          }

          // Regular navigation items
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center rounded-full w-11 h-11 transition-all duration-200 focus:ring-2 focus:ring-goal-primary focus:outline-none ${
                item.active
                  ? 'bg-goal-primary/20 text-goal-primary scale-110'
                  : 'text-goal-primary/70 hover:bg-goal-primary/10 hover:text-goal-primary hover:scale-105'
              }`}
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
            >
              <item.icon className="w-6 h-6" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
