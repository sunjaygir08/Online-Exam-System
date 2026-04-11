import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Shield, AlertTriangle, ChevronLeft, ChevronRight, Save, Camera, Mic } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { MOCK_QUESTIONS } from '../mockData.js';
import { cn } from '../lib/utils.js';
import { useNavigate } from 'react-router-dom';

export const ActiveExamPage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(3600); // 1 hour in seconds
  const [answers, setAnswers] = React.useState({});

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const question = MOCK_QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Exam Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-brand-600 p-2 rounded-lg">
            <Shield className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Advanced Mathematics II</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span className="flex items-center gap-1"><Camera className="w-3 h-3 text-emerald-500" /> Camera Active</span>
              <span className="flex items-center gap-1"><Mic className="w-3 h-3 text-emerald-500" /> Audio Active</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-600 text-sm font-medium">
            <Save className="w-4 h-4 text-emerald-500" />
            Auto-saved at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className={cn(
            "flex items-center gap-3 px-6 py-2 rounded-xl border-2 font-mono text-xl font-bold",
            timeLeft < 300 ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "bg-slate-900 border-slate-800 text-white"
          )}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <Button variant="danger" className="px-8" onClick={() => navigate('/student/results')}>Finish Exam</Button>
        </div>
      </header>

      {/* Proctoring Warning */}
      <div className="bg-amber-50 border-b border-amber-100 px-6 py-2 flex items-center justify-center gap-2 text-amber-800 text-sm font-medium">
        <AlertTriangle className="w-4 h-4" />
        Live AI Proctoring is active. Your screen, camera, and audio are being monitored.
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Question Panel */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <span className="text-sm font-bold text-brand-600 uppercase tracking-wider">Question {currentQuestion + 1} of {MOCK_QUESTIONS.length}</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2 leading-relaxed">
                {question.text}
              </h2>
            </div>

            <div className="space-y-4">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers({ ...answers, [question.id]: idx })}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group",
                    answers[question.id] === idx 
                      ? "border-brand-600 bg-brand-50 text-brand-900" 
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm",
                      answers[question.id] === idx ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 text-slate-400 group-hover:border-slate-300"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg font-medium">{option}</span>
                  </div>
                  {answers[question.id] === idx && <div className="w-3 h-3 rounded-full bg-brand-600" />}
                </button>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-between">
              <Button 
                variant="outline" 
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                className="h-12 px-6"
              >
                <ChevronLeft className="mr-2 w-5 h-5" /> Previous
              </Button>
              <div className="flex gap-2">
                {MOCK_QUESTIONS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      currentQuestion === idx ? "w-8 bg-brand-600" : "bg-slate-300 hover:bg-slate-400"
                    )}
                  />
                ))}
              </div>
              <Button 
                disabled={currentQuestion === MOCK_QUESTIONS.length - 1}
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                className="h-12 px-8"
              >
                Next Question <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar */}
        <aside className="w-80 bg-white border-l border-slate-200 p-6 hidden lg:block overflow-y-auto">
          <h3 className="font-bold text-slate-900 mb-6">Question Navigator</h3>
          <div className="grid grid-cols-4 gap-3">
            {MOCK_QUESTIONS.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={cn(
                  "h-12 rounded-xl border-2 flex items-center justify-center font-bold transition-all",
                  currentQuestion === idx 
                    ? "border-brand-600 bg-brand-50 text-brand-600" 
                    : answers[q.id] !== undefined
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/20 blur-2xl rounded-full -mr-10 -mt-10"></div>
            <h4 className="font-bold mb-2 relative z-10">Need Help?</h4>
            <p className="text-sm text-slate-400 mb-4 relative z-10">If you encounter any technical issues, please contact the proctor immediately.</p>
            <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800 relative z-10">
              Contact Proctor
            </Button>
          </div>
        </aside>
      </main>
    </div>
  );
};
