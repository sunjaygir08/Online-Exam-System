import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Award, ArrowRight, Download, Share2, TrendingUp, Clock } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const TOPIC_PERFORMANCE = [
  { topic: 'Calculus', score: 92 },
  { topic: 'Algebra', score: 85 },
  { topic: 'Geometry', score: 78 },
  { topic: 'Trigonometry', score: 88 },
  { topic: 'Probability', score: 95 },
];

export const ResultPage = () => {
  const score = 88;
  const isPassed = score >= 40;

  const handleShare = async () => {
    const shareData = {
      title: 'Smart Exam Hub - Exam Result',
      text: `I scored ${score}/100 in Advanced Mathematics II! Check out my performance on Smart Exam Hub.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Result link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-4"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <h1 className="text-4xl font-bold font-display text-slate-900">Examination Results</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Congratulations! You have successfully completed the <strong>Advanced Mathematics II</strong> examination.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 flex flex-col items-center justify-center text-center p-10">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Your Score</p>
          <div className="relative w-40 h-40 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle 
                  cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * score) / 100}
                  className="text-brand-600 transition-all duration-1000" 
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-slate-900">{score}</span>
                <span className="text-sm text-slate-500">out of 100</span>
             </div>
          </div>
          <div className="mt-6 inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm">
            Status: PASSED
          </div>
        </Card>

        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          {[
            { label: 'Grade', value: 'A', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Percentile', value: '92nd', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Time Spent', value: '42m 15s', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Correct Ans', value: '44/50', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((item, idx) => (
            <div key={idx}>
              <Card className="p-6 flex items-center gap-4">
                <div className={cn('p-3 rounded-xl', item.bg)}>
                  <item.icon className={cn('w-6 h-6', item.color)} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-xl font-bold text-slate-900">{item.value}</p>
                </div>
              </Card>
            </div>
          ))}
          
          <Card className="col-span-2 p-6" title="Topic-wise Performance">
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TOPIC_PERFORMANCE} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="topic" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                    {TOPIC_PERFORMANCE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 90 ? '#3b82f6' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Button size="lg" className="h-14 px-8">
          <Download className="w-5 h-5 mr-2" /> Download Certificate
        </Button>
        <Button variant="outline" size="lg" className="h-14 px-8" onClick={handleShare}>
          <Share2 className="w-5 h-5 mr-2" /> Share Result
        </Button>
        <Link to="/student/dashboard">
          <Button variant="ghost" size="lg" className="h-14 px-8">
            Back to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
