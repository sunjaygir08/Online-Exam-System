import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils.js';

export const DashboardNav = ({ items }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all border-2",
              isActive 
                ? "bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-200" 
                : "bg-white border-slate-100 text-slate-600 hover:border-brand-200 hover:text-brand-600"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
