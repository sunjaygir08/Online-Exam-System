import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminLogsPage } from './pages/AdminLogsPage';
import { ActiveExamPage } from './pages/ActiveExamPage';
import { ResultPage } from './pages/ResultPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CreateExamPage } from './pages/CreateExamPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { MyExamsPage } from './pages/MyExamsPage';
import { SchedulePage } from './pages/SchedulePage';
import { Layout } from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} /> {/* Reusing login for demo */}
        
        {/* Student Routes */}
        <Route element={<Layout role="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/exams" element={<MyExamsPage />} />
          <Route path="/student/results" element={<ResultPage />} />
          <Route path="/student/schedule" element={<SchedulePage />} />
        </Route>

        {/* Teacher Routes */}
        <Route element={<Layout role="teacher" />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/create-exam" element={<CreateExamPage />} />
          <Route path="/teacher/questions" element={<QuestionBankPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<Layout role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/logs" element={<AdminLogsPage />} />
        </Route>

        {/* Shared Protected Routes */}
        <Route element={<Layout />}>
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Exam Interface (No Sidebar/Navbar) */}
        <Route path="/exam/:id" element={<ActiveExamPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
