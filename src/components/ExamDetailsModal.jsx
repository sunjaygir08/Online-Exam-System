import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Calendar, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button.jsx';

export const ExamDetailsModal = ({ exam, isOpen, onClose, onStart }) => {
  if (!exam) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-brand-600" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">{exam.title}</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">{exam.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{exam.duration} Minutes</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Date</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{new Date(exam.startTime).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Instructions</h4>
                <div className="space-y-3">
                  {[
                    "Ensure you have a stable internet connection.",
                    "The exam will automatically submit when time expires.",
                    "Do not refresh or close the browser window.",
                    "AI proctoring will be active during the session."
                  ].map((instruction, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <p className="text-sm text-slate-600">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12" onClick={onClose}>
                  Close
                </Button>
                {exam.status === 'active' && (
                  <Button className="flex-1 h-12" onClick={() => onStart(exam.id)}>
                    Start Exam
                  </Button>
                )}
              </div>
            </div>
            
            {exam.status !== 'active' && (
              <div className="bg-amber-50 p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-xs font-medium text-amber-700">
                  This exam is not yet active. It will be available on {new Date(exam.startTime).toLocaleString()}.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
