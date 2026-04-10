import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Search, Filter, Plus, Edit2, Trash2, FileText, MoreVertical } from 'lucide-react';
import { MOCK_QUESTIONS } from '../mockData';
import { cn } from '../lib/utils';

export const QuestionBankPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Question Bank</h1>
          <p className="text-slate-500">Manage and organize your repository of exam questions.</p>
        </div>
        <Button>
          <Plus className="w-5 h-5 mr-2" /> Add New Question
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" className="w-full pl-11 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" placeholder="Search questions..." />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {MOCK_QUESTIONS.map((q) => (
          <div key={q.id}>
            <Card className="p-6 hover:border-brand-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{q.type}</span>
                      <span className="text-xs text-slate-400">• {q.points} Points</span>
                    </div>
                    <h3 className="font-bold text-slate-900 leading-relaxed">{q.text}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {q.options.map((opt, idx) => (
                        <span key={idx} className={cn(
                          "px-3 py-1 rounded-lg text-xs font-medium border",
                          idx === q.correctAnswer ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-500"
                        )}>
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
