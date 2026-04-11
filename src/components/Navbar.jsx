import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Bell, User } from 'lucide-react';
import { Button } from './Button.jsx';
import { logout } from '../lib/api.ts';

export const Navbar = () => {
  const [user, setUser] = React.useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : { name: 'Guest User', role: 'student' };
  });
  const [unreadCount, setUnreadCount] = React.useState(0);
  const navigate = useNavigate();

  const updateUnreadCount = () => {
    let stored = localStorage.getItem('notifications');
    if (!stored) {
      const initialNotifs = [
        {
          id: 'N-001',
          title: 'Exam Scheduled',
          message: 'Advanced Mathematics II has been scheduled for April 12th.',
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
        },
        {
          id: 'N-002',
          title: 'Result Published',
          message: 'Your result for Physics 101 is now available.',
          type: 'success',
          timestamp: new Date().toISOString(),
          read: true,
        },
      ];
      localStorage.setItem('notifications', JSON.stringify(initialNotifs));
      stored = JSON.stringify(initialNotifs);
    }
    
    const notifications = JSON.parse(stored);
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  };

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    updateUnreadCount();

    window.addEventListener('notificationsUpdated', updateUnreadCount);
    return () => window.removeEventListener('notificationsUpdated', updateUnreadCount);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 lg:hidden">
           <GraduationCap className="text-brand-600 w-7 h-7" />
           <span className="text-lg font-bold font-display">Smart Exam Hub</span>
        </div>
      </div>
      
      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold text-slate-800">Welcome back, {user.name.split(' ')[0]}</h2>
        <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2">Logout</Button>
        <p className="text-xs text-slate-500">{user.role === 'student' ? 'Student ID: #STU-2024-001' : 'Faculty ID: #FAC-2024-001'}</p>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-brand-600 font-medium capitalize">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center border border-brand-200">
            <User className="w-6 h-6 text-brand-600" />
          </div>
        </div>
      </div>
    </header>
  );
};
