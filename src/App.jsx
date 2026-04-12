import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { StudentDashboard } from './pages/StudentDashboard.jsx';
import { TeacherDashboard } from './pages/TeacherDashboard.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { AdminUsersPage } from './pages/AdminUsersPage.jsx';
import { AdminLogsPage } from './pages/AdminLogsPage.jsx';
import { ActiveExamPage } from './pages/ActiveExamPage.jsx';
import { ResultPage } from './pages/ResultPage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { CreateExamPage } from './pages/CreateExamPage.jsx';
import { QuestionBankPage } from './pages/QuestionBankPage.jsx';
import { MyExamsPage } from './pages/MyExamsPage.jsx';
import { SchedulePage } from './pages/SchedulePage.jsx';
import { Layout } from './components/Layout.jsx';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        
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
    </HashRouter>
  );
}
