import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Save, Trash2, HelpCircle, List, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreateExamPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = React.useState('');
  const [duration, setDuration] = React.useState('60');
  const [description, setDescription] = React.useState('');
  const [questionsCount, setQuestionsCount] = React.useState(0);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [settingsState, setSettingsState] = React.useState([
    true,
    true,
    false,
    true,
  ]);

  const settings = [
    { label: 'Enable AI Proctoring', desc: 'Monitor students via camera and audio' },
    { label: 'Randomize Questions', desc: 'Shuffle question order for each student' },
    { label: 'Browser Lockdown', desc: 'Prevent students from switching tabs' },
    { label: 'Instant Grading', desc: 'Show results immediately after submission' },
  ];

  const canSubmit = title.trim().length > 2 && Number(duration) > 0;

  const showMessage = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 2500);
  };

  const saveDraft = () => {
    localStorage.setItem(
      'examDraft',
      JSON.stringify({ title, duration, description, questionsCount, settingsState, savedAt: new Date().toISOString() })
    );
    showMessage('Draft saved locally.');
  };

  const publishExam = () => {
    if (!canSubmit) {
      showMessage('Add title and valid duration before publishing.');
      return;
    }
    showMessage('Exam published successfully. Redirecting to dashboard...');
    window.setTimeout(() => navigate('/teacher/dashboard'), 800);
  };

  const toggleSetting = (index: number) => {
    setSettingsState((prev) => prev.map((value, idx) => (idx === index ? !value : value)));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Create New Exam</h1>
          <p className="text-slate-500">Define exam details and add questions.</p>
          {statusMessage && <p className="text-sm text-emerald-600 mt-2">{statusMessage}</p>}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={saveDraft}>Save Draft</Button>
          <Button onClick={publishExam} disabled={!canSubmit}>Publish Exam</Button>
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
            <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900">No questions added yet</h4>
              <p className="text-sm text-slate-500 mb-6">Start by adding your first question or import from question bank.</p>
              <p className="text-xs text-slate-400 mb-4">Questions in draft: {questionsCount}</p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/teacher/questions')}>
                  <List className="w-4 h-4 mr-2" /> Import from Bank
                </Button>
                <Button size="sm" onClick={() => setQuestionsCount((prev) => prev + 1)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Question
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Settings">
          <div className="space-y-4 mt-2">
            {settings.map((setting, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-semibold text-slate-900">{setting.label}</p>
                  <p className="text-xs text-slate-500">{setting.desc}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Toggle ${setting.label}`}
                  onClick={() => toggleSetting(idx)}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settingsState[idx] ? 'bg-brand-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settingsState[idx] ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
