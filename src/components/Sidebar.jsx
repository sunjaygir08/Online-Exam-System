import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, BookOpen, ClipboardList, Bell, Settings, LogOut, User, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils.js';

export const Sidebar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const menuItems = {
    student: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
      { icon: BookOpen, label: 'My Exams', path: '/student/exams' },
      { icon: ClipboardList, label: 'Results', path: '/student/results' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
    ],
    teacher: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
      { icon: ClipboardList, label: 'Create Exam', path: '/teacher/create-exam' },
      { icon: BookOpen, label: 'Question Bank', path: '/teacher/questions' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
    ],
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: User, label: 'Users', path: '/admin/users' },
      { icon: ShieldCheck, label: 'System Logs', path: '/admin/logs' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
    ],
  };

  const items = menuItems[role] || [];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 flex items-center gap-2">
        <div className="bg-brand-600 p-2 rounded-lg">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold font-display text-slate-900">Smart Exam Hub</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-brand-600' : 'text-slate-400')} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
