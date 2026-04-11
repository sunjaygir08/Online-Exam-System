import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

for (const envPath of [path.join(__dirname, '.env'), path.join(__dirname, '..', '.env')]) {
  try {
    await fs.access(envPath);
    dotenv.config({ path: envPath });
    break;
  } catch {
    // ignore missing env files
  }
}

dotenv.config();

const app = express();
const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:3000';
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const DEFAULT_DB = {
  users: [],
  exams: [],
  questions: [],
  results: [],
  notifications: [],
  passwordResetTokens: [],
  logs: [],
};

app.use(express.json({ limit: '1mb' }));
app.use(async (req, res, next) => {
  try {
    req.db = seedIfEmpty(await readDb());
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  const compareHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(compareHash, 'hex'));
};

const clone = (value) => JSON.parse(JSON.stringify(value));

async function ensureDbFile() {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  return {
    ...clone(DEFAULT_DB),
    ...parsed,
  };
}

async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

function publicUser(user) {
  const { password, sessions, ...safe } = user;
  return safe;
}

function now() {
  return new Date().toISOString();
}

function getToken(req) {
  const header = req.headers.authorization || req.headers['x-auth-token'];
  if (!header) return null;
  if (header.startsWith('Bearer ')) return header.slice(7);
  return header;
}

function authRequired(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Missing auth token' });
  }

  const user = req.db.users.find((entry) => Array.isArray(entry.sessions) && entry.sessions.includes(token));
  if (!user) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = user;
  req.token = token;
  next();
}

function roleRequired(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

function addLog(db, action, user, details = {}) {
  db.logs.unshift({
    id: crypto.randomUUID(),
    action,
    userId: user?.id || null,
    userName: user?.name || 'System',
    role: user?.role || 'system',
    details,
    createdAt: now(),
  });
}

function addNotification(db, notification) {
  db.notifications.unshift({
    id: crypto.randomUUID(),
    read: false,
    createdAt: now(),
    ...notification,
  });
}

function seedIfEmpty(db) {
  if (db.users.length === 0) {
    const adminId = crypto.randomUUID();
    const teacherId = crypto.randomUUID();
    const studentId = crypto.randomUUID();

    db.users.push(
      {
        id: adminId,
        name: 'Admin Demo',
        email: 'admin@example.com',
        password: hashPassword('password123'),
        role: 'admin',
        isNewUser: false,
        sessions: [],
      },
      {
        id: teacherId,
        name: 'Teacher Demo',
        email: 'teacher@example.com',
        password: hashPassword('password123'),
        role: 'teacher',
        isNewUser: false,
        sessions: [],
      },
      {
        id: studentId,
        name: 'Student Demo',
        email: 'student@example.com',
        password: hashPassword('password123'),
        role: 'student',
        isNewUser: false,
        sessions: [],
      }
    );
  }

  if (db.questions.length === 0) {
    db.questions.push(
      {
        id: crypto.randomUUID(),
        text: 'What is 2 + 2?',
        type: 'multiple-choice',
        points: 5,
        options: ['1', '2', '4', '8'],
        correctAnswer: 2,
        createdBy: 'teacher',
        createdAt: now(),
      },
      {
        id: crypto.randomUUID(),
        text: 'The capital of Pakistan is ______.',
        type: 'multiple-choice',
        points: 5,
        options: ['Karachi', 'Lahore', 'Islamabad', 'Peshawar'],
        correctAnswer: 2,
        createdBy: 'teacher',
        createdAt: now(),
      }
    );
  }

  if (db.exams.length === 0) {
    const [questionA, questionB] = db.questions;
    db.exams.push(
      {
        id: crypto.randomUUID(),
        title: 'Physics Mid-term',
        description: 'Basic physics exam for practice.',
        duration: 60,
        startTime: '2026-04-20T09:00:00.000Z',
        status: 'published',
        ownerId: db.users.find((user) => user.role === 'teacher')?.id || null,
        assignedRoles: ['student'],
        questions: [questionA],
        createdAt: now(),
      },
      {
        id: crypto.randomUUID(),
        title: 'General Knowledge Quiz',
        description: 'Short quiz for students.',
        duration: 30,
        startTime: '2026-04-22T11:00:00.000Z',
        status: 'draft',
        ownerId: db.users.find((user) => user.role === 'teacher')?.id || null,
        assignedRoles: ['student'],
        questions: [questionB],
        createdAt: now(),
      }
    );
  }

  if (db.notifications.length === 0) {
    const student = db.users.find((user) => user.role === 'student');
    if (student) {
      addNotification(db, {
        userId: student.id,
        title: 'Welcome',
        message: 'Your student dashboard is ready.',
        type: 'info',
      });
    }
  }

  return db;
}

async function withDb(handler) {
  const db = seedIfEmpty(await readDb());
  const result = await handler(db);
  await writeDb(db);
  return result;
}

app.get('/health', async (req, res) => {
  const db = await readDb();
  res.json({
    ok: true,
    service: 'smart-exam-hub-backend',
    users: db.users.length,
    exams: db.exams.length,
    questions: db.questions.length,
    results: db.results.length,
  });
});

app.post('/auth/register', async (req, res) => {
  const { name, email, password, role = 'student' } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (!['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  return withDb(async (db) => {
    const exists = db.users.find((user) => user.email === normalizedEmail);
    if (exists) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const user = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashPassword(String(password)),
      role,
      isNewUser: true,
      sessions: [],
      createdAt: now(),
    };

    const token = crypto.randomUUID();
    user.sessions.push(token);
    db.users.unshift(user);
    addLog(db, 'register', user, { email: user.email });
    addNotification(db, {
      userId: user.id,
      title: 'Welcome to Smart Exam Hub',
      message: 'Your account was created successfully.',
      type: 'success',
    });

    res.status(201).json({ token, user: publicUser(user) });
  });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  return withDb(async (db) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = db.users.find((entry) => entry.email === normalizedEmail);
    if (!user || !verifyPassword(String(password), user.password)) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = crypto.randomUUID();
    user.sessions = Array.isArray(user.sessions) ? user.sessions : [];
    user.sessions.push(token);
    user.isNewUser = false;
    addLog(db, 'login', user, { email: user.email });

    res.json({ token, user: publicUser(user) });
  });
});

app.post('/auth/logout', authRequired, async (req, res) => {
  return withDb(async (db) => {
    req.user.sessions = (req.user.sessions || []).filter((token) => token !== req.token);
    addLog(db, 'logout', req.user);
    res.json({ message: 'Logged out successfully.' });
  });
});

app.get('/auth/me', authRequired, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  return withDb(async (db) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = db.users.find((entry) => entry.email === normalizedEmail);
    if (!user) {
      return res.json({ message: 'If the account exists, a reset link was created.' });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
    db.passwordResetTokens = (db.passwordResetTokens || []).filter((entry) => entry.email !== normalizedEmail);
    db.passwordResetTokens.push({ id: crypto.randomUUID(), email: normalizedEmail, token, expiresAt });
    addLog(db, 'forgot-password', user, { email: normalizedEmail });

    res.json({
      message: 'Reset token created.',
      resetToken: token,
      resetLink: `${FRONTEND_ORIGIN}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`,
    });
  });
});

app.post('/auth/reset-password', async (req, res) => {
  const { token, email, newPassword } = req.body || {};
  if (!token || !email || !newPassword) {
    return res.status(400).json({ message: 'Token, email, and new password are required.' });
  }

  return withDb(async (db) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const entry = (db.passwordResetTokens || []).find(
      (resetToken) => resetToken.token === token && resetToken.email === normalizedEmail
    );

    if (!entry) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    if (new Date(entry.expiresAt).getTime() < Date.now()) {
      db.passwordResetTokens = db.passwordResetTokens.filter((resetToken) => resetToken.token !== token);
      return res.status(400).json({ message: 'Reset token expired.' });
    }

    const user = db.users.find((entryUser) => entryUser.email === normalizedEmail);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = hashPassword(String(newPassword));
    db.passwordResetTokens = db.passwordResetTokens.filter((resetToken) => resetToken.token !== token);
    addLog(db, 'reset-password', user, { email: normalizedEmail });
    res.json({ message: 'Password updated successfully.' });
  });
});

app.get('/users', authRequired, roleRequired('admin'), async (req, res) => {
  res.json({ users: req.db.users.map(publicUser) });
});

app.patch('/users/:id', authRequired, roleRequired('admin'), async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  return withDb(async (db) => {
    const user = db.users.find((entry) => entry.id === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (updates.name !== undefined) user.name = String(updates.name);
    if (updates.role !== undefined && ['student', 'teacher', 'admin'].includes(updates.role)) user.role = updates.role;
    if (updates.status !== undefined) user.status = updates.status;

    addLog(db, 'update-user', req.user, { targetUserId: id });
    res.json({ user: publicUser(user) });
  });
});

app.get('/exams', authRequired, async (req, res) => {
  const exams = req.db.exams;
  if (req.user.role === 'admin') {
    return res.json({ exams });
  }

  if (req.user.role === 'teacher') {
    return res.json({ exams: exams.filter((exam) => exam.ownerId === req.user.id) });
  }

  return res.json({ exams: exams.filter((exam) => exam.status === 'published' && (!exam.assignedRoles || exam.assignedRoles.includes('student'))) });
});

app.get('/exams/:id', authRequired, async (req, res) => {
  const exam = req.db.exams.find((entry) => entry.id === req.params.id);
  if (!exam) {
    return res.status(404).json({ message: 'Exam not found.' });
  }
  res.json({ exam });
});

app.post('/exams', authRequired, roleRequired('teacher', 'admin'), async (req, res) => {
  const { title, description = '', duration = 60, startTime = now(), questions = [], assignedRoles = ['student'], status = 'draft' } = req.body || {};
  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  return withDb(async (db) => {
    const exam = {
      id: crypto.randomUUID(),
      title: String(title),
      description: String(description),
      duration: Number(duration),
      startTime,
      status,
      ownerId: req.user.id,
      assignedRoles,
      questions,
      createdAt: now(),
    };

    db.exams.unshift(exam);
    addLog(db, 'create-exam', req.user, { examId: exam.id, title: exam.title });
    res.status(201).json({ exam });
  });
});

app.patch('/exams/:id', authRequired, roleRequired('teacher', 'admin'), async (req, res) => {
  const updates = req.body || {};
  return withDb(async (db) => {
    const exam = db.exams.find((entry) => entry.id === req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }

    if (req.user.role === 'teacher' && exam.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own exams.' });
    }

    if (updates.title !== undefined) exam.title = String(updates.title);
    if (updates.description !== undefined) exam.description = String(updates.description);
    if (updates.duration !== undefined) exam.duration = Number(updates.duration);
    if (updates.startTime !== undefined) exam.startTime = updates.startTime;
    if (updates.status !== undefined) exam.status = updates.status;
    if (updates.questions !== undefined) exam.questions = updates.questions;

    addLog(db, 'update-exam', req.user, { examId: exam.id });
    res.json({ exam });
  });
});

app.delete('/exams/:id', authRequired, roleRequired('teacher', 'admin'), async (req, res) => {
  return withDb(async (db) => {
    const exam = db.exams.find((entry) => entry.id === req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }

    if (req.user.role === 'teacher' && exam.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own exams.' });
    }

    db.exams = db.exams.filter((entry) => entry.id !== req.params.id);
    addLog(db, 'delete-exam', req.user, { examId: req.params.id });
    res.json({ message: 'Exam deleted.' });
  });
});

app.get('/questions', authRequired, async (req, res) => {
  if (req.user.role === 'student') {
    return res.json({ questions: [] });
  }
  res.json({ questions: req.db.questions });
});

app.post('/questions', authRequired, roleRequired('teacher', 'admin'), async (req, res) => {
  const { text, type = 'multiple-choice', points = 5, options = [], correctAnswer = 0 } = req.body || {};
  if (!text) {
    return res.status(400).json({ message: 'Question text is required.' });
  }

  return withDb(async (db) => {
    const question = {
      id: crypto.randomUUID(),
      text: String(text),
      type: String(type),
      points: Number(points),
      options,
      correctAnswer: Number(correctAnswer),
      createdBy: req.user.id,
      createdAt: now(),
    };

    db.questions.unshift(question);
    addLog(db, 'create-question', req.user, { questionId: question.id });
    res.status(201).json({ question });
  });
});

app.patch('/questions/:id', authRequired, roleRequired('teacher', 'admin'), async (req, res) => {
  return withDb(async (db) => {
    const question = db.questions.find((entry) => entry.id === req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const { text, type, points, options, correctAnswer } = req.body || {};
    if (text !== undefined) question.text = String(text);
    if (type !== undefined) question.type = String(type);
    if (points !== undefined) question.points = Number(points);
    if (options !== undefined) question.options = options;
    if (correctAnswer !== undefined) question.correctAnswer = Number(correctAnswer);

    addLog(db, 'update-question', req.user, { questionId: question.id });
    res.json({ question });
  });
});

app.delete('/questions/:id', authRequired, roleRequired('teacher', 'admin'), async (req, res) => {
  return withDb(async (db) => {
    const exists = db.questions.some((entry) => entry.id === req.params.id);
    if (!exists) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    db.questions = db.questions.filter((entry) => entry.id !== req.params.id);
    addLog(db, 'delete-question', req.user, { questionId: req.params.id });
    res.json({ message: 'Question deleted.' });
  });
});

app.get('/notifications', authRequired, async (req, res) => {
  const notifications = req.db.notifications.filter((notification) => {
    const roleMatch = !notification.audienceRoles || notification.audienceRoles.includes(req.user.role);
    const userMatch = !notification.userId || notification.userId === req.user.id;
    return roleMatch && userMatch;
  });

  res.json({ notifications });
});

app.patch('/notifications/:id/read', authRequired, async (req, res) => {
  return withDb(async (db) => {
    const notification = db.notifications.find((entry) => entry.id === req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.userId && notification.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    notification.read = true;
    res.json({ notification });
  });
});

app.get('/results', authRequired, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.json({ results: req.db.results });
  }

  if (req.user.role === 'teacher') {
    return res.json({ results: req.db.results.filter((entry) => entry.examOwnerId === req.user.id) });
  }

  return res.json({ results: req.db.results.filter((entry) => entry.userId === req.user.id) });
});

app.post('/results/submit', authRequired, roleRequired('student'), async (req, res) => {
  const { examId, answers = {} } = req.body || {};
  if (!examId) {
    return res.status(400).json({ message: 'Exam ID is required.' });
  }

  return withDb(async (db) => {
    const exam = db.exams.find((entry) => entry.id === examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }

    const questionList = exam.questions || [];
    const total = questionList.reduce((sum, question) => sum + Number(question.points || 0), 0) || 100;
    const earned = questionList.reduce((sum, question) => {
      const selected = answers[question.id];
      return selected === question.correctAnswer ? sum + Number(question.points || 0) : sum;
    }, 0);
    const score = Math.round((earned / total) * 100);

    const result = {
      id: crypto.randomUUID(),
      examId,
      examTitle: exam.title,
      userId: req.user.id,
      userName: req.user.name,
      examOwnerId: exam.ownerId,
      score,
      totalPoints: total,
      earnedPoints: earned,
      answers,
      submittedAt: now(),
    };

    db.results.unshift(result);
    addNotification(db, {
      userId: req.user.id,
      title: 'Exam submitted',
      message: `${exam.title} was submitted successfully.`,
      type: 'success',
    });
    addLog(db, 'submit-exam', req.user, { examId, score });

    res.status(201).json({ result });
  });
});

app.get('/admin/logs', authRequired, roleRequired('admin'), async (req, res) => {
  res.json({ logs: req.db.logs });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

await ensureDbFile();
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
