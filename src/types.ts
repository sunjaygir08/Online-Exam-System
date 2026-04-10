export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  points: number;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  startTime: string;
  endTime: string;
  totalPoints: number;
  questions: Question[];
  status: 'upcoming' | 'active' | 'completed';
  teacherId: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  answers: Record<string, any>;
  score: number;
  submittedAt: string;
  status: 'in-progress' | 'submitted' | 'graded';
  proctoringLogs: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: string;
  read: boolean;
}
