import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// File-based "database" (simple JSON files)
const usersFile = 'data/users.json';
const examsFile = 'data/exams.json';
const resultsFile = 'data/results.json';

// Ensure data directory exists
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// Initialize files if they don't exist
function initFiles() {
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([
      { id: 1, name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'admin' },
      { id: 2, name: 'Teacher', email: 'teacher@example.com', password: 'password123', role: 'teacher' },
      { id: 3, name: 'Student', email: 'student@example.com', password: 'password123', role: 'student' }
    ]));
  }
  if (!fs.existsSync(examsFile)) {
    fs.writeFileSync(examsFile, JSON.stringify([]));
  }
  if (!fs.existsSync(resultsFile)) {
    fs.writeFileSync(resultsFile, JSON.stringify([]));
  }
}

// Simple helper functions
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Initialize on startup
initFiles();

// ==================== AUTH ROUTES ====================

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(usersFile);
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: 'simple-token-' + user.id
    });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/register', (req, res) => {
  const { email, name, password, confirmPassword, role } = req.body;
  
  // Validation
  if (!email || !name || !password || !confirmPassword || !role) {
    return res.json({ success: false, message: 'All fields are required' });
  }
  
  if (password !== confirmPassword) {
    return res.json({ success: false, message: 'Passwords do not match' });
  }
  
  if (password.length < 6) {
    return res.json({ success: false, message: 'Password must be at least 6 characters' });
  }
  
  const users = readJSON(usersFile);
  
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: 'Email already registered' });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role: role || 'student',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeJSON(usersFile, users);
  
  res.json({
    success: true,
    message: 'Account created successfully!',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

// ==================== EXAM ROUTES ====================

app.get('/api/exams', (req, res) => {
  const exams = readJSON(examsFile);
  res.json(exams);
});

app.post('/api/exams/create', (req, res) => {
  const { title, subject, questions, totalMarks, passingMarks, duration } = req.body;
  
  const exams = readJSON(examsFile);
  const newExam = {
    id: exams.length + 1,
    title,
    subject,
    questions,
    totalMarks,
    passingMarks,
    duration,
    createdAt: new Date().toISOString()
  };
  
  exams.push(newExam);
  writeJSON(examsFile, exams);
  
  res.json({ success: true, exam: newExam });
});

// ==================== RESULT ROUTES ====================

app.post('/api/results/submit', (req, res) => {
  const { examId, answers, studentId } = req.body;
  const exams = readJSON(examsFile);
  const exam = exams.find(e => e.id == examId);
  
  if (!exam) {
    return res.json({ success: false, message: 'Exam not found' });
  }
  
  // Calculate marks
  let marksObtained = 0;
  answers.forEach((answer, index) => {
    if (exam.questions[index].correctAnswer === answer) {
      marksObtained += exam.questions[index].marks;
    }
  });
  
  const percentage = (marksObtained / exam.totalMarks) * 100;
  const isPassed = marksObtained >= exam.passingMarks;
  
  const result = {
    id: Date.now(),
    examId,
    studentId,
    marksObtained,
    totalMarks: exam.totalMarks,
    percentage: percentage.toFixed(2),
    isPassed,
    submittedAt: new Date().toISOString()
  };
  
  const results = readJSON(resultsFile);
  results.push(result);
  writeJSON(resultsFile, results);
  
  res.json({ success: true, result });
});

app.get('/api/results/:studentId', (req, res) => {
  const { studentId } = req.params;
  const results = readJSON(resultsFile);
  const studentResults = results.filter(r => r.studentId == studentId);
  res.json(studentResults);
});

// ==================== PAGES ====================

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 Exam System Ready!`);
});
