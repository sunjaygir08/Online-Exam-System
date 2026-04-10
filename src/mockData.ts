import { Exam, Question, User, Notification } from './types';

export const MOCK_USER: User = {
  id: 'STU-001',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  role: 'student',
  avatar: 'https://picsum.photos/seed/alex/100/100',
};

export const MOCK_EXAMS: Exam[] = [
  {
    id: 'EX-001',
    title: 'Advanced Mathematics II',
    description: 'Calculus, Linear Algebra, and Differential Equations.',
    duration: 60,
    startTime: '2024-04-12T10:00:00Z',
    endTime: '2024-04-12T11:00:00Z',
    totalPoints: 100,
    status: 'upcoming',
    teacherId: 'TEA-001',
    questions: [],
  },
  {
    id: 'EX-002',
    title: 'Introduction to Computer Science',
    description: 'Algorithms, Data Structures, and Programming Basics.',
    duration: 45,
    startTime: '2024-04-10T14:00:00Z',
    endTime: '2024-04-10T14:45:00Z',
    totalPoints: 50,
    status: 'active',
    teacherId: 'TEA-002',
    questions: [],
  },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'Q-001',
    text: 'What is the derivative of sin(x)?',
    options: ['cos(x)', '-cos(x)', 'tan(x)', 'sec(x)'],
    correctAnswer: 0,
    points: 5,
    type: 'multiple-choice',
  },
  {
    id: 'Q-002',
    text: 'The time complexity of binary search is O(log n).',
    options: ['True', 'False'],
    correctAnswer: 0,
    points: 5,
    type: 'true-false',
  },
  {
    id: 'Q-003',
    text: 'Who is the father of Computer Science?',
    options: ['Alan Turing', 'Charles Babbage', 'Ada Lovelace', 'Bill Gates'],
    correctAnswer: 0,
    points: 10,
    type: 'multiple-choice',
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'N-001',
    title: 'Exam Scheduled',
    message: 'Advanced Mathematics II has been scheduled for April 12th.',
    type: 'info',
    timestamp: '2024-04-08T09:00:00Z',
    read: false,
  },
  {
    id: 'N-002',
    title: 'Result Published',
    message: 'Your result for Physics 101 is now available.',
    type: 'success',
    timestamp: '2024-04-07T15:30:00Z',
    read: true,
  },
];
