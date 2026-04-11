import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Award, ArrowRight, TrendingUp, BookOpen, LayoutDashboard, ClipboardList, Bell, Users, CheckCircle } from 'lucide-react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { MOCK_EXAMS, MOCK_USER } from '../mockData.js';
import { getExams } from '../lib/api.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../lib/utils.js';
import { useNavigate } from 'react-router-dom';
import { DashboardNav } from '../components/DashboardNav.jsx';
import { ExamDetailsModal } from '../components/ExamDetailsModal.jsx';
import { getStoredUser } from '../lib/session.js';

const PERFORMANCE_DATA = [
  { subject: 'Math', score: 85 },
  { subject: 'Physics', score: 72 },
  { subject: 'CS', score: 94 },
  { subject: 'English', score: 88 },
  { subject: 'History', score: 65 },
];

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const [isNewUser, setIsNewUser] = React.useState(false);
  const [selectedExam, setSelectedExam] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [exams, setExams] = React.useState([]);

  const studentNavItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Exams', path: '/student/exams', icon: BookOpen },
    { label: 'Results', path: '/student/results', icon: ClipboardList },
    { label: 'Schedule', path: '/student/schedule', icon: Calendar },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  React.useEffect(() => {
    const userData = getStoredUser();
    const fresh = Boolean(userData?.isNewUser);
    setIsNewUser(fresh);
    const fetchExams = async () => {
      try {
        const data = await getExams();
        setExams(data.exams || []);
      } catch (error) {
        console.error('Failed to fetch exams:', error);
        setExams([]);
      }
    };
    fetchExams();
  }, []);

  const stats = [
    { label: 'Exams Taken', value: isNewUser ? '0' : '12', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg. Score', value: isNewUser ? '0%' : '84%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Upcoming', value: isNewUser ? '01' : '03', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Certificates', value: isNewUser ? '0' : '05', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const chartData = isNewUser ? [] : PERFORMANCE_DATA;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Student Dashboard</h1>
          <p className="text-slate-500">Track your progress and upcoming examinations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white" onClick={() => navigate('/student/schedule')}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button onClick={() => navigate('/student/exams')}>
            <BookOpen className="w-4 h-4 mr-2" />
            My Exams
          </Button>
        </div>
      </div>

      <DashboardNav items={studentNavItems} />

      {/* Stats Grid */}
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
        {/* Upcoming Exams */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Upcoming Exams</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/exams')}>View All</Button>
          </div>
          <div className="space-y-4">
            {exams.length > 0 ? exams.map((exam) => (
              <div key={exam.id}>
                <Card className="group hover:border-brand-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 transition-colors">
                        <BookOpen className="w-6 h-6 text-slate-400 group-hover:text-brand-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{exam.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-1">{exam.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center text-xs text-slate-500">
                            <Clock className="w-3 h-3 mr-1" /> {exam.duration} mins
                          </span>
                          <span className="flex items-center text-xs text-slate-500">
                            <Calendar className="w-3 h-3 mr-1" /> {new Date(exam.startTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant={exam.status === 'active' ? 'primary' : 'outline'} 
                      className="sm:w-auto w-full"
                      onClick={() => {
                        setSelectedExam(exam);
                        setIsModalOpen(true);
                      }}
                    >
                      {exam.status === 'active' ? 'Start Now' : 'Details'}
                    </Button>
                  </div>
                </Card>
              </div>
            )) : (
              <Card className="p-8 text-center border border-dashed border-slate-200 bg-slate-50">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-medium text-slate-600">No exams assigned yet.</p>
                <p className="text-sm text-slate-500 mt-1">Fresh student accounts start with an empty dashboard.</p>
              </Card>
            )}
          </div>

          {!isNewUser && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Recent Results</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/student/results')}>View Results</Button>
              </div>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Award className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Advanced Mathematics II</p>
                      <p className="text-sm text-slate-500">Completed on March 15, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">A+</p>
                    <p className="text-xs text-slate-400">Score: 92/100</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Performance Chart */}
        <div className="space-y-6">
          <Card title="Performance Overview" subtitle="Subject-wise performance">
            <div className="h-[300px] w-full mt-4">
              {isNewUser ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <TrendingUp className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-500">No performance data yet. Complete your first exam to see analytics.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="subject" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#3b82f6' : '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            {!isNewUser && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Highest Score</span>
                  <span className="font-bold text-emerald-600">94% (CS)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Lowest Score</span>
                  <span className="font-bold text-amber-600">65% (History)</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ExamDetailsModal 
        exam={selectedExam}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={(id) => navigate(`/exam/${id}`)}
      />
    </div>
  );
};
