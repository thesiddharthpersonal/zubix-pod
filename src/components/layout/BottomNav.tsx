import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Users, label: 'Rooms', path: '/rooms' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: MoreHorizontal, label: 'More', path: '/more' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/home' && location.pathname.startsWith('/home')) ||
            (item.path === '/rooms' && location.pathname.startsWith('/rooms')) ||
            (item.path === '/events' && location.pathname.startsWith('/events')) ||
            (item.path === '/more' && location.pathname.startsWith('/more'));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
