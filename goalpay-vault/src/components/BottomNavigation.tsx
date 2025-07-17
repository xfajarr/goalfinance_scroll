
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, Users, User, BookOpen } from 'lucide-react';

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
      icon: Users, 
      label: 'Community', 
      path: '/community',
      active: location.pathname === '/community'
    },
    { 
      icon: User, 
      label: 'Profile', 
      path: '/profile',
      active: location.pathname === '/profile'
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-goal-border/30 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-2xl transition-all duration-300 ${
              item.active 
                ? 'bg-goal-primary text-goal-text scale-110' 
                : 'text-goal-text/60 hover:text-goal-text hover:bg-goal-accent/30'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-inter font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
