import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Save, Trash2, HelpCircle, List, Settings } from 'lucide-react';

export const CreateExamPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Create New Exam</h1>
          <p className="text-slate-500">Define exam details and add questions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Save Draft</Button>
          <Button>Publish Exam</Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card title="Exam Details">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Exam Title</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. Physics Mid-term" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Duration (Minutes)</label>
              <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" placeholder="60" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 h-24" placeholder="Briefly describe the exam content..."></textarea>
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
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <List className="w-4 h-4 mr-2" /> Import from Bank
                </Button>
                <Button size="sm">
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
