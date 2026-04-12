import { MOCK_EXAMS, MOCK_NOTIFICATIONS, MOCK_QUESTIONS } from '../mockData.js';

const USERS_STORAGE_KEY = 'users';

type ApiResult = Record<string, any>;

const DEMO_USERS = [
  {
    id: 'ADM-001',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  },
  {
    id: 'TEA-001',
    name: 'Teacher User',
    email: 'teacher@example.com',
    password: 'password123',
    role: 'teacher',
  },
  {
    id: 'STU-001',
    name: 'Student User',
    email: 'student@example.com',
    password: 'password123',
    role: 'student',
  },
];

function readBody(options: RequestInit): any {
  if (!options.body || typeof options.body !== 'string') {
    return {};
  }

  try {
    return JSON.parse(options.body);
  } catch {
    return {};
  }
}

function getUsers() {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEMO_USERS));
    return [...DEMO_USERS];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // fall back to seeded users
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEMO_USERS));
  return [...DEMO_USERS];
}

function saveUsers(users: any[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function createToken(userId: string) {
  return `local-token-${userId}-${Date.now()}`;
}

function stripPassword(user: any) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const payload = readBody(options);

  if (endpoint === '/auth/login' && method === 'POST') {
    const users = getUsers();
    const user = users.find(
      (entry: any) =>
        entry.email?.toLowerCase() === payload.email?.toLowerCase() && entry.password === payload.password,
    );

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    return {
      token: createToken(user.id),
      user: stripPassword(user),
    };
  }

  if (endpoint === '/auth/register' && method === 'POST') {
    const users = getUsers();
    const email = payload.email?.toLowerCase();

    if (!email || !payload.password || !payload.name) {
      throw new Error('Name, email, and password are required.');
    }

    const existing = users.find((entry: any) => entry.email?.toLowerCase() === email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const nextUser = {
      id: `${(payload.role || 'student').toUpperCase().slice(0, 3)}-${Date.now()}`,
      name: payload.name,
      email,
      password: payload.password,
      role: payload.role || 'student',
      isNewUser: true,
    };

    users.push(nextUser);
    saveUsers(users);

    return {
      token: createToken(nextUser.id),
      user: stripPassword(nextUser),
    };
  }

  if (endpoint === '/auth/logout' && method === 'POST') {
    return { success: true };
  }

  if (endpoint === '/exams' && method === 'GET') {
    return { exams: MOCK_EXAMS };
  }

  if (endpoint === '/questions' && method === 'GET') {
    return { questions: MOCK_QUESTIONS };
  }

  if (endpoint === '/notifications' && method === 'GET') {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        return { notifications: JSON.parse(stored) };
      } catch {
        // use defaults if parsing fails
      }
    }

    return { notifications: MOCK_NOTIFICATIONS };
  }

  if (endpoint === '/results' && method === 'GET') {
    const stored = localStorage.getItem('student_results');
    if (stored) {
      try {
        return { results: JSON.parse(stored) };
      } catch {
        // use defaults if parsing fails
      }
    }

    return { results: [] };
  }

  if (endpoint === '/exams' && method === 'POST') {
    return {
      success: true,
      exam: {
        id: `EX-${Date.now()}`,
        ...payload,
      },
    };
  }

  if (endpoint === '/results/submit' && method === 'POST') {
    return {
      success: true,
      submission: {
        id: `RES-${Date.now()}`,
        ...payload,
      },
    };
  }

  throw new Error(`Unsupported local API endpoint: ${method} ${endpoint}`);
}

export async function getExams() {
  return apiCall('/exams');
}

export async function getQuestions() {
  return apiCall('/questions');
}

export async function getNotifications() {
  return apiCall('/notifications');
}

export async function getResults() {
  return apiCall('/results');
}

export async function createExam(examData: any) {
  return apiCall('/exams', {
    method: 'POST',
    body: JSON.stringify(examData),
  });
}

export async function submitExam(examId: string, answers: any) {
  return apiCall('/results/submit', {
    method: 'POST',
    body: JSON.stringify({ examId, answers }),
  });
}

export async function logout() {
  try {
    await apiCall('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}
