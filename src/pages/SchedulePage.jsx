import React from 'react';
import { Card } from '../components/Card.jsx';
import { Calendar as CalendarIcon, Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { MOCK_EXAMS } from '../mockData.js';

export const SchedulePage = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth(year, month) }, (_, i) => i);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-slate-900">Exam Schedule</h1>
        <p className="text-slate-500">Keep track of your upcoming examinations and deadlines.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">{monthName} {year}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {padding.map(i => <div key={`pad-${i}`} className="aspect-square" />)}
            {days.map(day => {
              const date = new Date(year, month, day);
              const hasExam = MOCK_EXAMS.some(exam => 
                new Date(exam.startTime).toDateString() === date.toDateString()
              );
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div 
                  key={day} 
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all cursor-pointer hover:border-brand-300 ${
                    isToday ? 'border-brand-600 bg-brand-50' : 'border-slate-100 bg-white'
                  }`}
                >
                  <span className={`text-sm font-bold ${isToday ? 'text-brand-600' : 'text-slate-700'}`}>{day}</span>
                  {hasExam && (
                    <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-brand-600" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Upcoming Events</h2>
          <div className="space-y-4">
            {MOCK_EXAMS.map(exam => (
              <div key={exam.id}>
                <Card className="p-4 border-l-4 border-l-brand-600">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-brand-50 rounded-lg">
                      <BookOpen className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{exam.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center text-xs text-slate-500">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {new Date(exam.startTime).toLocaleDateString()}
                        </span>
                        <span className="flex items-center text-xs text-slate-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
