import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';

export const Layout = ({ role }) => {
  const location = useLocation();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // 1. If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If a specific role is required and doesn't match, redirect
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // Use the user's actual role for the sidebar if no specific role was requested
  const activeRole = role || user.role;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={activeRole} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-4 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
