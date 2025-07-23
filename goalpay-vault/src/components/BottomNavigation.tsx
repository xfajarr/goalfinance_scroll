
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, User, BookOpen, Search } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { 
      icon: Home, 
      label: 'Home', 
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      icon: Search,
      label: 'Explore Vaults',
      path: '/community',
      active: location.pathname === '/community'
    },
    { 
      icon: Plus, 
      label: 'Create', 
      path: '/create-vault',
      active: location.pathname === '/create-vault'
    },
    { 
      icon: BookOpen, 
      label: 'Learn', 
      path: '/learn',
      active: location.pathname === '/learn'
    },
    { 
      icon: User, 
      label: 'Profile', 
      path: '/profile',
      active: location.pathname === '/profile'
    }
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 mb-6 mx-auto px-4 w-full max-w-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="bg-goal-text/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-between px-4 py-3">
        {navItems.map((item, index) => {
          const isMiddleItem = index === Math.floor(navItems.length / 2);

          // Middle item (Create button) with prominent styling
          if (isMiddleItem) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center rounded-full w-12 h-12 transition-all duration-300 focus:ring-2 focus:ring-goal-primary focus:outline-none ${
                  item.active
                    ? 'bg-goal-primary text-goal-text'
                    : 'bg-goal-primary text-goal-text hover:bg-goal-primary/90'
                }`}
                aria-label={`${item.label} - Create a new vault`}
                aria-current={item.active ? 'page' : undefined}
              >
                <item.icon className="w-6 h-6" />
              </Link>
            );
          }

          // Regular navigation items
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center rounded-full w-10 h-10 transition-all duration-200 focus:ring-2 focus:ring-goal-primary focus:outline-none ${
                item.active
                  ? 'bg-goal-primary/90 text-goal-text'
                  : 'text-goal-primary hover:bg-goal-text-muted/20'
              }`}
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
