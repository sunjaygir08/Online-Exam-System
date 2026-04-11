import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Clock, AlertTriangle, Info, CheckCircle2, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils.js';

const LOGS = [
  { id: 1, type: 'info', message: 'User Sunjay Gir logged in', time: '2 mins ago', user: 'Sunjay Gir' },
  { id: 2, type: 'warning', message: 'Failed login attempt from IP 192.168.1.1', time: '15 mins ago', user: 'System' },
  { id: 3, type: 'success', message: 'New exam "Advanced Math" created', time: '1 hour ago', user: 'Sarah Wilson' },
  { id: 4, type: 'error', message: 'Database connection timeout', time: '2 hours ago', user: 'System' },
  { id: 5, type: 'info', message: 'System settings updated', time: '5 hours ago', user: 'Admin' },
];

export const AdminLogsPage = () => {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  const filteredLogs = LOGS.filter((log) => {
    const queryMatch = log.message.toLowerCase().includes(query.toLowerCase()) || log.user.toLowerCase().includes(query.toLowerCase());
    const filterMatch = filter === 'all' || log.type === filter;
    return queryMatch && filterMatch;
  });

  const cycleFilter = () => {
    const order = ['all', 'info', 'warning', 'success', 'error'];
    const next = order[(order.indexOf(filter) + 1) % order.length];
    setFilter(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
        <p className="text-slate-500">Monitor system activities and security events.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={cycleFilter}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter: {filter}
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                log.type === 'info' && "bg-blue-50 text-blue-600",
                log.type === 'warning' && "bg-amber-50 text-amber-600",
                log.type === 'success' && "bg-emerald-50 text-emerald-600",
                log.type === 'error' && "bg-red-50 text-red-600",
              )}>
                {log.type === 'info' && <Info className="w-5 h-5" />}
                {log.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {log.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {log.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{log.message}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.time}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-500">User: {log.user}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">No logs match your current filter.</div>
          )}
        </div>
      </div>
    </div>
  );
};
