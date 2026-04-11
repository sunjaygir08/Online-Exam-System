import React from 'react';
import { motion } from 'motion/react';
import { Users, BookOpen, Clock, CheckCircle, Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { DashboardNav } from '../components/DashboardNav';
import { LayoutDashboard, ClipboardList as ClipboardIcon, BookOpen as BookIcon, Bell as BellIcon, Calendar as CalendarIcon } from 'lucide-react';

const CLASS_PERFORMANCE = [
  { name: 'Class A', avg: 78 },
  { name: 'Class B', avg: 85 },
  { name: 'Class C', avg: 72 },
  { name: 'Class D', avg: 91 },
];

export const TeacherDashboard = () => {
  const [isNewUser, setIsNewUser] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState('');

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setIsNewUser(userData.isNewUser);
    }
  }, []);

  const stats = [
    { label: 'Total Students', value: isNewUser ? '0' : '450', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Exams', value: isNewUser ? '0' : '03', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Exams Created', value: isNewUser ? '0' : '24', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg. Passing Rate', value: isNewUser ? '0%' : '88%', icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentExams = isNewUser ? [] : [
    { title: 'Physics Mid-term', date: '2024-04-15', students: 120, status: 'Scheduled' },
    { title: 'Chemistry Quiz', date: '2024-04-12', students: 85, status: 'Active' },
    { title: 'Biology Final', date: '2024-04-08', students: 150, status: 'Completed' },
  ];

  const chartData = isNewUser ? [] : CLASS_PERFORMANCE;

  const teacherNavItems = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Create Exam', path: '/teacher/create-exam', icon: ClipboardIcon },
    { label: 'Question Bank', path: '/teacher/questions', icon: BookIcon },
    { label: 'Schedule', path: '/student/schedule', icon: CalendarIcon }, // Reusing student schedule for now
    { label: 'Notifications', path: '/notifications', icon: BellIcon },
  ];

  const showMessage = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 2200);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Examiner Dashboard</h1>
          <p className="text-slate-500">Manage your exams, questions, and track student performance.</p>
          {statusMessage && <p className="text-sm text-brand-600 mt-2">{statusMessage}</p>}
        </div>
        <Link to="/teacher/create-exam">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" /> Create New Exam
          </Button>
        </Link>
      </div>

      <DashboardNav items={teacherNavItems} />

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
        <Card className="lg:col-span-2" title="Recent Exams" subtitle="Monitor and manage your recently created exams">
          <div className="mt-4 space-y-4">
            {recentExams.length > 0 ? recentExams.map((exam, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{exam.title}</h4>
                    <p className="text-xs text-slate-500">{exam.date} • {exam.students} Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    exam.status === 'Active' ? "bg-emerald-50 text-emerald-600" : 
                    exam.status === 'Scheduled' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
                  )}>
                    {exam.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`More actions for ${exam.title}`}
                    onClick={() => showMessage(`Opened actions for ${exam.title}.`)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No exams created yet.</p>
                <Link to="/teacher/create-exam" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">Create Your First Exam</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        <Card title="Class Performance" subtitle="Average scores by class">
          <div className="h-[250px] w-full mt-4">
            {isNewUser ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No class data available yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
