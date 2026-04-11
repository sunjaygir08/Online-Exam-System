import React from 'react';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { BookOpen, Clock, Calendar, Search, Filter } from 'lucide-react';
import { MOCK_EXAMS } from '../mockData.js';
import { useNavigate } from 'react-router-dom';
import { ExamDetailsModal } from '../components/ExamDetailsModal.jsx';

export const MyExamsPage = () => {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  const filteredExams = MOCK_EXAMS.filter((exam) => {
    const searchMatch = exam.title.toLowerCase().includes(query.toLowerCase()) || exam.description.toLowerCase().includes(query.toLowerCase());
    const filterMatch = filter === 'all' ? true : exam.status === filter;
    return searchMatch && filterMatch;
  });

  const cycleFilter = () => {
    const order = ['all', 'active', 'upcoming'];
    const next = order[(order.indexOf(filter) + 1) % order.length];
    setFilter(next);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">My Examinations</h1>
          <p className="text-slate-500">View and take exams assigned to you by your teachers.</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" 
              placeholder="Search exams..." 
            />
          </div>
          <Button variant="outline" onClick={cycleFilter}>
            <Filter className="w-4 h-4 mr-2" /> Filter: {filter}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <div key={exam.id}>
            <Card className="flex flex-col h-full hover:border-brand-300 transition-all group">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-brand-600" />
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    exam.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {exam.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">{exam.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{exam.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                    <span>Duration: {exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    <span>Date: {new Date(exam.startTime).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Button 
                  className="w-full" 
                  variant={exam.status === 'active' ? 'primary' : 'outline'}
                  onClick={() => {
                    setSelectedExam(exam);
                    setIsModalOpen(true);
                  }}
                >
                  {exam.status === 'active' ? 'Take Exam' : 'View Details'}
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <Card className="p-8 text-center text-slate-500">No exams found for the selected filter.</Card>
      )}

      <ExamDetailsModal 
        exam={selectedExam}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={(id) => navigate(`/exam/${id}`)}
      />
    </div>
  );
};
