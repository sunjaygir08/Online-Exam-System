import React from 'react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Search, Filter, Plus, Edit2, Trash2, FileText, MoreVertical } from 'lucide-react';
import { MOCK_QUESTIONS } from '../mockData.js';
import { cn } from '../lib/utils.js';

export const QuestionBankPage = () => {
  const [questions, setQuestions] = React.useState([]);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newQuestion, setNewQuestion] = React.useState({
    text: '',
    type: 'multiple-choice',
    points: 5,
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  React.useEffect(() => {
    const stored = localStorage.getItem('question_bank');
    if (stored) {
      setQuestions(JSON.parse(stored));
    } else {
      localStorage.setItem('question_bank', JSON.stringify(MOCK_QUESTIONS));
      setQuestions(MOCK_QUESTIONS);
    }
  }, []);

  const saveQuestions = (updated) => {
    setQuestions(updated);
    localStorage.setItem('question_bank', JSON.stringify(updated));
  };

  const handleAdd = () => {
    const q = {
      ...newQuestion,
      id: 'Q-' + Date.now()
    };
    saveQuestions([q, ...questions]);
    setIsAdding(false);
    setNewQuestion({
      text: '',
      type: 'multiple-choice',
      points: 5,
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  };

  const handleDelete = (id) => {
    saveQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Question Bank</h1>
          <p className="text-slate-500">Manage and organize your repository of exam questions.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-5 h-5 mr-2" /> Add New Question
        </Button>
      </div>

      {isAdding && (
        <Card title="New Question" className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Question Text</label>
              <input 
                type="text" 
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" 
                placeholder="Enter question..." 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {newQuestion.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    checked={newQuestion.correctAnswer === idx}
                    onChange={() => setNewQuestion({...newQuestion, correctAnswer: idx})}
                  />
                  <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => {
                      const opts = [...(newQuestion.options || [])];
                      opts[idx] = e.target.value;
                      setNewQuestion({...newQuestion, options: opts});
                    }}
                    className="flex-1 px-3 py-1 border border-slate-200 rounded-lg text-sm" 
                    placeholder={`Option ${idx + 1}`} 
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Save Question</Button>
            </div>
          </div>
        </Card>
      )}

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
        {questions.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No questions in your bank yet.</p>
          </div>
        ) : questions.map((q) => (
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(q.id)}
                  >
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
