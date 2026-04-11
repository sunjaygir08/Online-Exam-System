const USER_STORAGE_KEY = 'user';
const DEMO_STORAGE_KEYS = [
  'notifications',
  'question_bank',
  'teacher_exams',
  'student_results',
  'student_schedule',
  'examDraft',
  'password_reset_requests',
];

export function getStoredUser() {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function isFreshUserSession() {
  const user = getStoredUser();
  return Boolean(user?.isNewUser);
}

export function clearDemoData() {
  DEMO_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function setStoredUser(userData, { resetDemoData = false } = {}) {
  if (resetDemoData) {
    clearDemoData();
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  window.dispatchEvent(new Event('userUpdated'));
}

export function requestPasswordReset(email) {
  const requests = JSON.parse(localStorage.getItem('password_reset_requests') || '[]');
  const request = {
    email,
    requestedAt: new Date().toISOString(),
    token: `reset-${Date.now()}`,
  };

  const nextRequests = [request, ...requests].slice(0, 20);
  localStorage.setItem('password_reset_requests', JSON.stringify(nextRequests));
  return request;
}