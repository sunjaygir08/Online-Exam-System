const API_BASE_URL = 'http://localhost:4000';

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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API error');
  }

  return data;
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
