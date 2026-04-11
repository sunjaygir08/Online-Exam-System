import React from 'react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Plus, Save, Trash2, HelpCircle, List, Settings, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreateExamPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = React.useState('');
  const [duration, setDuration] = React.useState('60');
  const [description, setDescription] = React.useState('');
  const [questions, setQuestions] = React.useState([]);
  const [isPublishing, setIsPublishing] = React.useState(false);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      text: '',
      type: 'multiple-choice',
      points: 5,
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId, optIdx, value) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[optIdx] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handlePublish = () => {
    if (!title) {
      alert('Please enter an exam title');
      return;
    }
    
    setIsPublishing(true);
    
    const newExam = {
      id: 'EX-' + Date.now(),
      title,
      duration: parseInt(duration),
      description,
      date: new Date().toISOString().split('T')[0],
      students: 0,
      status: 'Scheduled',
      questions
    };

    const storedExams = localStorage.getItem('teacher_exams');
    const exams = storedExams ? JSON.parse(storedExams) : [];
    localStorage.setItem('teacher_exams', JSON.stringify([newExam, ...exams]));

    setTimeout(() => {
      setIsPublishing(false);
      navigate('/teacher/dashboard');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Create New Exam</h1>
          <p className="text-slate-500">Define exam details and add questions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/teacher/dashboard')}>Cancel</Button>
          <Button onClick={handlePublish} isLoading={isPublishing}>Publish Exam</Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card title="Exam Details">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Exam Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" 
                placeholder="e.g. Physics Mid-term" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Duration (Minutes)</label>
              <input 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" 
                placeholder="60" 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 h-24" 
                placeholder="Briefly describe the exam content..."
              ></textarea>
            </div>
          </div>
        </Card>

        <Card title="Questions" subtitle="Add questions to your exam">
          <div className="space-y-6 mt-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 border border-slate-200 rounded-2xl space-y-4 relative group">
                <button 
                  onClick={() => removeQuestion(q.id)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <input 
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                    className="flex-1 text-lg font-bold text-slate-900 border-b border-transparent focus:border-brand-500 outline-none"
                    placeholder="Enter your question here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuestion(q.id, 'correctAnswer', optIdx)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          q.correctAnswer === optIdx ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'
                        }`}
                      >
                        {q.correctAnswer === optIdx && <CheckCircle className="w-4 h-4" />}
                      </button>
                      <input 
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-500"
                        placeholder={`Option ${optIdx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900">
                {questions.length === 0 ? 'No questions added yet' : 'Ready for more?'}
              </h4>
              <p className="text-sm text-slate-500 mb-6">
                {questions.length === 0 ? 'Start by adding your first question or import from question bank.' : 'Add another question to your exam.'}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <List className="w-4 h-4 mr-2" /> Import from Bank
                </Button>
                <Button size="sm" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" /> Add Question
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Settings">
          <div className="space-y-4 mt-2">
            {[
              { label: 'Enable AI Proctoring', desc: 'Monitor students via camera and audio' },
              { label: 'Randomize Questions', desc: 'Shuffle question order for each student' },
              { label: 'Browser Lockdown', desc: 'Prevent students from switching tabs' },
              { label: 'Instant Grading', desc: 'Show results immediately after submission' },
            ].map((setting, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-semibold text-slate-900">{setting.label}</p>
                  <p className="text-xs text-slate-500">{setting.desc}</p>
                </div>
                <div className="w-12 h-6 bg-brand-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
