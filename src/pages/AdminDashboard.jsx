import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Users, Shield, Server, Activity, AlertCircle, UserPlus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStoredUser } from '../lib/session.js';
import { cn } from '../lib/utils.js';

const SYSTEM_LOAD = [
  { time: '10:00', load: 45 },
  { time: '11:00', load: 52 },
  { time: '12:00', load: 85 },
  { time: '13:00', load: 65 },
  { time: '14:00', load: 48 },
  { time: '15:00', load: 38 },
];

export const AdminDashboard = () => {
  const isFreshUser = Boolean(getStoredUser()?.isNewUser);
  const stats = isFreshUser
    ? [
        { label: 'Total Users', value: '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Sessions', value: '0', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'System Health', value: '100%', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Storage Used', value: '0%', icon: Server, color: 'text-amber-600', bg: 'bg-amber-50' },
      ]
    : [
        { label: 'Total Users', value: '1,240', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Sessions', value: '85', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'System Health', value: '99.9%', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Storage Used', value: '42%', icon: Server, color: 'text-amber-600', bg: 'bg-amber-50' },
      ];

  const alerts = isFreshUser
    ? []
    : [
        { title: 'High Memory Usage', time: '2 mins ago', type: 'warning' },
        { title: 'New Admin Registered', time: '15 mins ago', type: 'info' },
        { title: 'Database Backup Success', time: '1 hour ago', type: 'success' },
        { title: 'Failed Login Attempt', time: '2 hours ago', type: 'danger' },
      ];
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Admin Console</h1>
          <p className="text-slate-500">System-wide overview and administrative tools.</p>
        </div>
        <Link to="/admin/users">
          <Button>
            <UserPlus className="w-5 h-5 mr-2" /> Add New User
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
          <div key={idx}>
            <Card className="p-0">
              <div className="p-6 flex items-center gap-4">
                <div className={cn('p-3 rounded-xl', stat.bg)}>
                  <stat.icon className={cn('w-6 h-6', stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="System Load" subtitle="Real-time server load monitoring">
          <div className="h-[300px] w-full mt-4">
            {isFreshUser ? (
              <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 text-sm">
                No system activity yet. Fresh admin accounts start clean.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SYSTEM_LOAD}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card title="System Alerts" subtitle="Critical notifications and logs">
          <div className="space-y-4 mt-4">
            {alerts.length > 0 ? alerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <AlertCircle className={cn(
                  "w-4 h-4 mt-0.5",
                  alert.type === 'warning' ? "text-amber-500" :
                  alert.type === 'danger' ? "text-red-500" :
                  alert.type === 'success' ? "text-emerald-500" : "text-blue-500"
                )} />
                <div>
                  <p className="text-sm font-bold text-slate-900">{alert.title}</p>
                  <p className="text-xs text-slate-500">{alert.time}</p>
                </div>
              </div>
            )) : (
              <div className="p-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-slate-500 text-sm">
                No alerts yet. Fresh admin accounts start with an empty activity feed.
              </div>
            )}
            {!isFreshUser && (
              <Link to="/admin/logs">
                <Button variant="ghost" className="w-full text-xs">View All Logs</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
