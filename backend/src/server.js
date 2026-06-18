import express from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// File-based database
const usersFile = 'data/users.json';
const examsFile = 'data/exams.json';
const resultsFile = 'data/results.json';
const questionsFile = 'data/questions.json';
const feedbackFile = 'data/feedback.json';
const analyticsFile = 'data/analytics.json';
const progressFile = 'data/progress.json';
const passwordResetFile = 'data/password-reset.json';
const emailVerificationFile = 'data/email-verification.json';

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Helper functions
function readJSON(file) {
  if (!fs.existsSync(file)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Initialize data directory and files
function initFiles() {
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
  }

  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(examsFile)) {
    fs.writeFileSync(examsFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(resultsFile)) {
    fs.writeFileSync(resultsFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(questionsFile)) {
    fs.writeFileSync(questionsFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(feedbackFile)) {
    fs.writeFileSync(feedbackFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(analyticsFile)) {
    fs.writeFileSync(analyticsFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(progressFile)) {
    fs.writeFileSync(progressFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(passwordResetFile)) {
    fs.writeFileSync(passwordResetFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(emailVerificationFile)) {
    fs.writeFileSync(emailVerificationFile, JSON.stringify([], null, 2));
  }
}

// Send email function
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.log('Email service not configured. In production, configure .env file');
    return false;
  }
}

// Initialize files
initFiles();

// ==================== AUTH ROUTES ====================

// User Registration
app.post('/api/register', async (req, res) => {
  const { email, name, password, confirmPassword, role } = req.body;

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

  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: 'Email already registered' });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Generate email verification token
  const verificationToken = uuidv4();

  const newUser = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email,
    password: hashedPassword,
    role: role || 'student',
    isEmailVerified: false,
    createdAt: new Date().toISOString(),
    lastLogin: null
  };

  users.push(newUser);
  writeJSON(usersFile, users);

  // Store verification token
  const verifications = readJSON(emailVerificationFile);
  verifications.push({
    email,
    token: verificationToken,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  writeJSON(emailVerificationFile, verifications);

  // Send verification email
  const verificationLink = `http://localhost:${PORT}/api/verify-email?token=${verificationToken}&email=${email}`;
  await sendEmail(
    email,
    'Verify Your Email',
    `<h2>Welcome to Smart Exam System!</h2>
     <p>Click <a href="${verificationLink}">here</a> to verify your email.</p>
     <p>Or copy this link: ${verificationLink}</p>`
  );

  res.json({
    success: true,
    message: 'Account created! Check your email for verification link.',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

// Email Verification
app.get('/api/verify-email', (req, res) => {
  const { token, email } = req.query;

  const verifications = readJSON(emailVerificationFile);
  const verification = verifications.find(v => v.token === token && v.email === email);

  if (!verification) {
    return res.json({ success: false, message: 'Invalid verification token' });
  }

  if (new Date(verification.expiresAt) < new Date()) {
    return res.json({ success: false, message: 'Verification token expired' });
  }

  // Update user
  const users = readJSON(usersFile);
  const user = users.find(u => u.email === email);

  if (user) {
    user.isEmailVerified = true;
    writeJSON(usersFile, users);
  }

  // Remove verification token
  const updatedVerifications = verifications.filter(v => !(v.token === token && v.email === email));
  writeJSON(emailVerificationFile, updatedVerifications);

  res.json({ success: true, message: 'Email verified successfully!' });
});

// User Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(usersFile);

  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isEmailVerified) {
    return res.json({ success: false, message: 'Please verify your email first' });
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  writeJSON(usersFile, users);

  res.json({
    success: true,
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      isEmailVerified: user.isEmailVerified
    },
    token: 'token-' + user.id + '-' + uuidv4()
  });
});

// Password Reset - Request
app.post('/api/password-reset-request', async (req, res) => {
  const { email } = req.body;

  const users = readJSON(usersFile);
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.json({ success: false, message: 'Email not found' });
  }

  const resetToken = uuidv4();
  const resetTokens = readJSON(passwordResetFile);

  resetTokens.push({
    email,
    token: resetToken,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
  });

  writeJSON(passwordResetFile, resetTokens);

  const resetLink = `http://localhost:${PORT}/reset-password?token=${resetToken}&email=${email}`;
  await sendEmail(
    email,
    'Password Reset Request',
    `<h2>Password Reset</h2>
     <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
     <p>Link expires in 1 hour.</p>`
  );

  res.json({ success: true, message: 'Password reset link sent to your email' });
});

// Password Reset - Confirm
app.post('/api/password-reset-confirm', (req, res) => {
  const { token, email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.json({ success: false, message: 'Passwords do not match' });
  }

  const resetTokens = readJSON(passwordResetFile);
  const resetToken = resetTokens.find(t => t.token === token && t.email === email);

  if (!resetToken) {
    return res.json({ success: false, message: 'Invalid reset token' });
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    return res.json({ success: false, message: 'Reset token expired' });
  }

  const users = readJSON(usersFile);
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.json({ success: false, message: 'User not found' });
  }

  user.password = bcrypt.hashSync(newPassword, 10);
  writeJSON(usersFile, users);

  const updatedTokens = resetTokens.filter(t => !(t.token === token && t.email === email));
  writeJSON(passwordResetFile, updatedTokens);

  res.json({ success: true, message: 'Password reset successfully!' });
});

// ==================== USER MANAGEMENT (ADMIN ROUTES) ====================

// Get all users
app.get('/api/admin/users', (req, res) => {
  const users = readJSON(usersFile);
  // Remove passwords from response
  const usersWithoutPasswords = users.map(u => {
    const { password, ...user } = u;
    return user;
  });
  res.json(usersWithoutPasswords);
});

// Update user (Admin)
app.put('/api/admin/users/:userId', (req, res) => {
  const { userId } = req.params;
  const { name, email, role, isEmailVerified } = req.body;

  const users = readJSON(usersFile);
  const user = users.find(u => u.id == userId);

  if (!user) {
    return res.json({ success: false, message: 'User not found' });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

  writeJSON(usersFile, users);

  const { password, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

// Delete user (Admin)
app.delete('/api/admin/users/:userId', (req, res) => {
  const { userId } = req.params;

  const users = readJSON(usersFile);
  const updatedUsers = users.filter(u => u.id != userId);

  if (users.length === updatedUsers.length) {
    return res.json({ success: false, message: 'User not found' });
  }

  writeJSON(usersFile, updatedUsers);
  res.json({ success: true, message: 'User deleted successfully' });
});

// ==================== QUESTION BANK MANAGEMENT ====================

// Get all questions (Question Bank)
app.get('/api/questions', (req, res) => {
  const questions = readJSON(questionsFile);
  res.json(questions);
});

// Create question in question bank
app.post('/api/questions/create', (req, res) => {
  const { text, options, correctAnswer, subject, difficulty, marks } = req.body;

  if (!text || !options || !correctAnswer || !subject || !difficulty) {
    return res.json({ success: false, message: 'All fields are required' });
  }

  const questions = readJSON(questionsFile);
  const newQuestion = {
    id: questions.length ? Math.max(...questions.map(q => q.id)) + 1 : 1,
    text,
    options,
    correctAnswer,
    subject,
    difficulty,
    marks: marks || 1,
    createdAt: new Date().toISOString()
  };

  questions.push(newQuestion);
  writeJSON(questionsFile, questions);

  res.json({ success: true, question: newQuestion });
});

// Update question
app.put('/api/questions/:questionId', (req, res) => {
  const { questionId } = req.params;
  const { text, options, correctAnswer, subject, difficulty, marks } = req.body;

  const questions = readJSON(questionsFile);
  const question = questions.find(q => q.id == questionId);

  if (!question) {
    return res.json({ success: false, message: 'Question not found' });
  }

  if (text) question.text = text;
  if (options) question.options = options;
  if (correctAnswer) question.correctAnswer = correctAnswer;
  if (subject) question.subject = subject;
  if (difficulty) question.difficulty = difficulty;
  if (marks) question.marks = marks;

  writeJSON(questionsFile, questions);
  res.json({ success: true, question });
});

// Delete question
app.delete('/api/questions/:questionId', (req, res) => {
  const { questionId } = req.params;

  const questions = readJSON(questionsFile);
  const updatedQuestions = questions.filter(q => q.id != questionId);

  if (questions.length === updatedQuestions.length) {
    return res.json({ success: false, message: 'Question not found' });
  }

  writeJSON(questionsFile, updatedQuestions);
  res.json({ success: true, message: 'Question deleted' });
});

// ==================== EXAM ROUTES ====================

// Get all exams
app.get('/api/exams', (req, res) => {
  const exams = readJSON(examsFile);
  res.json(exams);
});

// Create exam
app.post('/api/exams/create', (req, res) => {
  const { title, subject, questions, totalMarks, passingMarks, duration, negativeMarks, randomizeQuestions, scheduleDate, scheduleTime } = req.body;

  if (!title || !subject || !questions || !totalMarks || !passingMarks || !duration) {
    return res.json({ success: false, message: 'Required fields are missing' });
  }

  const exams = readJSON(examsFile);
  const newExam = {
    id: exams.length ? Math.max(...exams.map(e => e.id)) + 1 : 1,
    title,
    subject,
    questions,
    totalMarks,
    passingMarks,
    duration,
    negativeMarks: negativeMarks || 0,
    randomizeQuestions: randomizeQuestions || false,
    scheduleDate: scheduleDate || null,
    scheduleTime: scheduleTime || null,
    createdAt: new Date().toISOString()
  };

  exams.push(newExam);
  writeJSON(examsFile, exams);

  // Track analytics
  const analytics = readJSON(analyticsFile);
  analytics.push({
    id: uuidv4(),
    type: 'exam_created',
    examId: newExam.id,
    timestamp: new Date().toISOString()
  });
  writeJSON(analyticsFile, analytics);

  res.json({ success: true, exam: newExam });
});

// Get exam by ID
app.get('/api/exams/:examId', (req, res) => {
  const { examId } = req.params;
  const exams = readJSON(examsFile);
  const exam = exams.find(e => e.id == examId);

  if (!exam) {
    return res.json({ success: false, message: 'Exam not found' });
  }

  // Randomize questions if enabled
  if (exam.randomizeQuestions) {
    const randomizedQuestions = [...exam.questions].sort(() => Math.random() - 0.5);
    exam = { ...exam, questions: randomizedQuestions };
  }

  res.json(exam);
});

// Update exam
app.put('/api/exams/:examId', (req, res) => {
  const { examId } = req.params;
  const { title, subject, questions, totalMarks, passingMarks, duration, negativeMarks, randomizeQuestions } = req.body;

  const exams = readJSON(examsFile);
  const exam = exams.find(e => e.id == examId);

  if (!exam) {
    return res.json({ success: false, message: 'Exam not found' });
  }

  if (title) exam.title = title;
  if (subject) exam.subject = subject;
  if (questions) exam.questions = questions;
  if (totalMarks) exam.totalMarks = totalMarks;
  if (passingMarks) exam.passingMarks = passingMarks;
  if (duration) exam.duration = duration;
  if (negativeMarks !== undefined) exam.negativeMarks = negativeMarks;
  if (randomizeQuestions !== undefined) exam.randomizeQuestions = randomizeQuestions;

  writeJSON(examsFile, exams);
  res.json({ success: true, exam });
});

// Delete exam
app.delete('/api/exams/:examId', (req, res) => {
  const { examId } = req.params;

  const exams = readJSON(examsFile);
  const updatedExams = exams.filter(e => e.id != examId);

  if (exams.length === updatedExams.length) {
    return res.json({ success: false, message: 'Exam not found' });
  }

  writeJSON(examsFile, updatedExams);
  res.json({ success: true, message: 'Exam deleted' });
});

// ==================== EXAM PROGRESS TRACKING ====================

// Start exam (track progress)
app.post('/api/exam-progress/start', (req, res) => {
  const { examId, studentId } = req.body;

  const progress = readJSON(progressFile);
  const existingProgress = progress.find(p => p.examId == examId && p.studentId == studentId && !p.submittedAt);

  if (existingProgress) {
    return res.json({ success: false, message: 'Exam already started' });
  }

  const newProgress = {
    id: uuidv4(),
    examId,
    studentId,
    startedAt: new Date().toISOString(),
    currentQuestion: 0,
    answers: [],
    submittedAt: null
  };

  progress.push(newProgress);
  writeJSON(progressFile, progress);

  res.json({ success: true, progressId: newProgress.id });
});

// Update exam progress
app.post('/api/exam-progress/update', (req, res) => {
  const { progressId, currentQuestion, answers } = req.body;

  const progress = readJSON(progressFile);
  const progressRecord = progress.find(p => p.id === progressId);

  if (!progressRecord) {
    return res.json({ success: false, message: 'Progress record not found' });
  }

  if (currentQuestion !== undefined) progressRecord.currentQuestion = currentQuestion;
  if (answers) progressRecord.answers = answers;

  writeJSON(progressFile, progress);
  res.json({ success: true, progress: progressRecord });
});

// Get exam progress
app.get('/api/exam-progress/:progressId', (req, res) => {
  const { progressId } = req.params;
  const progress = readJSON(progressFile);
  const progressRecord = progress.find(p => p.id === progressId);

  if (!progressRecord) {
    return res.json({ success: false, message: 'Progress record not found' });
  }

  res.json(progressRecord);
});

// ==================== RESULT ROUTES ====================

// Submit exam and calculate results
app.post('/api/results/submit', (req, res) => {
  const { examId, answers, studentId, progressId, negativeMarkingEnabled } = req.body;
  const exams = readJSON(examsFile);
  const exam = exams.find(e => e.id == examId);

  if (!exam) {
    return res.json({ success: false, message: 'Exam not found' });
  }

  // Calculate marks with optional negative marking
  let marksObtained = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;

  answers.forEach((answer, index) => {
    const question = exam.questions[index];
    if (question.correctAnswer === answer) {
      marksObtained += question.marks || 1;
      correctAnswers++;
    } else if (negativeMarkingEnabled && exam.negativeMarks > 0) {
      marksObtained -= exam.negativeMarks;
      wrongAnswers++;
    } else {
      wrongAnswers++;
    }
  });

  // Ensure marks don't go below 0
  marksObtained = Math.max(0, marksObtained);

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
    correctAnswers,
    wrongAnswers,
    totalQuestions: answers.length,
    submittedAt: new Date().toISOString()
  };

  const results = readJSON(resultsFile);
  results.push(result);
  writeJSON(resultsFile, results);

  // Mark progress as submitted
  if (progressId) {
    const progress = readJSON(progressFile);
    const progressRecord = progress.find(p => p.id === progressId);
    if (progressRecord) {
      progressRecord.submittedAt = new Date().toISOString();
      writeJSON(progressFile, progress);
    }
  }

  // Track analytics
  const analytics = readJSON(analyticsFile);
  analytics.push({
    id: uuidv4(),
    type: 'exam_submitted',
    examId,
    studentId,
    marks: marksObtained,
    timestamp: new Date().toISOString()
  });
  writeJSON(analyticsFile, analytics);

  res.json({ success: true, result });
});

// Get student results
app.get('/api/results/:studentId', (req, res) => {
  const { studentId } = req.params;
  const results = readJSON(resultsFile);
  const studentResults = results.filter(r => r.studentId == studentId);
  res.json(studentResults);
});

// Get all results (Admin)
app.get('/api/admin/results', (req, res) => {
  const results = readJSON(resultsFile);
  res.json(results);
});

// ==================== ANALYTICS & REPORTS ====================

// Get exam analytics
app.get('/api/analytics/exams/:examId', (req, res) => {
  const { examId } = req.params;
  const results = readJSON(resultsFile);
  const examResults = results.filter(r => r.examId == examId);

  if (examResults.length === 0) {
    return res.json({
      examId,
      totalAttempts: 0,
      averageMarks: 0,
      passRate: 0,
      highestMarks: 0,
      lowestMarks: 0
    });
  }

  const totalAttempts = examResults.length;
  const averageMarks = (examResults.reduce((sum, r) => sum + parseFloat(r.marksObtained), 0) / totalAttempts).toFixed(2);
  const passedCount = examResults.filter(r => r.isPassed).length;
  const passRate = ((passedCount / totalAttempts) * 100).toFixed(2);
  const highestMarks = Math.max(...examResults.map(r => r.marksObtained));
  const lowestMarks = Math.min(...examResults.map(r => r.marksObtained));

  res.json({
    examId,
    totalAttempts,
    averageMarks,
    passRate: passRate + '%',
    highestMarks,
    lowestMarks,
    passedCount,
    failedCount: totalAttempts - passedCount
  });
});

// Get student performance analytics
app.get('/api/analytics/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const results = readJSON(resultsFile);
  const studentResults = results.filter(r => r.studentId == studentId);

  if (studentResults.length === 0) {
    return res.json({
      studentId,
      totalExams: 0,
      averageMarks: 0,
      passRate: 0
    });
  }

  const totalExams = studentResults.length;
  const averageMarks = (studentResults.reduce((sum, r) => sum + parseFloat(r.marksObtained), 0) / totalExams).toFixed(2);
  const passedCount = studentResults.filter(r => r.isPassed).length;
  const passRate = ((passedCount / totalExams) * 100).toFixed(2);

  res.json({
    studentId,
    totalExams,
    averageMarks,
    passRate: passRate + '%',
    examResults: studentResults
  });
});

// Get overall analytics dashboard
app.get('/api/analytics/dashboard', (req, res) => {
  const users = readJSON(usersFile);
  const exams = readJSON(examsFile);
  const results = readJSON(resultsFile);

  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalTeachers = users.filter(u => u.role === 'teacher').length;
  const totalExams = exams.length;
  const totalSubmissions = results.length;

  res.json({
    totalStudents,
    totalTeachers,
    totalExams,
    totalSubmissions,
    averagePassRate: ((results.filter(r => r.isPassed).length / results.length) * 100).toFixed(2) + '%'
  });
});

// ==================== FEEDBACK SYSTEM ====================

// Submit feedback
app.post('/api/feedback/submit', (req, res) => {
  const { examId, studentId, rating, comment } = req.body;

  if (!examId || !studentId || !rating) {
    return res.json({ success: false, message: 'Required fields are missing' });
  }

  const feedback = readJSON(feedbackFile);
  const newFeedback = {
    id: uuidv4(),
    examId,
    studentId,
    rating,
    comment,
    submittedAt: new Date().toISOString()
  };

  feedback.push(newFeedback);
  writeJSON(feedbackFile, feedback);

  res.json({ success: true, feedback: newFeedback });
});

// Get feedback for exam
app.get('/api/feedback/exam/:examId', (req, res) => {
  const { examId } = req.params;
  const feedback = readJSON(feedbackFile);
  const examFeedback = feedback.filter(f => f.examId == examId);

  if (examFeedback.length === 0) {
    return res.json({
      examId,
      averageRating: 0,
      totalFeedback: 0,
      feedbacks: []
    });
  }

  const totalFeedback = examFeedback.length;
  const averageRating = (examFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(2);

  res.json({
    examId,
    averageRating,
    totalFeedback,
    feedbacks: examFeedback
  });
});

// ==================== PAGES ====================

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 Smart Exam System Ready!`);
  console.log(`⚙️  Features: Password Hashing, Email Verification, Question Bank, Analytics, Feedback`);
});
