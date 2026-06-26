# 📚 Online Examination System

A web-based examination platform designed for educational institutions to manage online exams, student assessments, and real-time grading. Built with a modern dark glassmorphic UI, responsive layouts, role-based controls, and an intelligent local database engine.

---

## ✨ Features

- **🛡️ Secure Authentication**
  - Role-based authorization: Student, Teacher, and System Administrator
  - HTTP-Only secure JWT cookies (AccessToken/RefreshToken mechanism)
  - Interactive password strength feedback & secure client validation

- **📝 Exam Management (Teachers & Admins)**
  - Create, modify, and delete exams
  - Set custom exam durations (minutes) and schedule date/time
  - Centralized MCQ Question Bank (add, edit, delete questions with customizable marks)
  - Export CSV detailed reports of student scores for any exam

- **✏️ Exam Taking (Students)**
  - Dynamic student portal listing assigned/upcoming exams
  - Anti-cheating randomized question shuffling
  - Interactive side-palette showing current, answered, and skipped questions
  - Real-time countdown timer with warnings (orange at 5m, red at 1m) and automatic submission

- **📊 Results & Visual Analytics**
  - Automated grading & pass/fail determination (50% passing threshold)
  - Detailed result sheet review showing student answers side-by-side with correct options
  - SVG Score Ring loader with counter animation
  - Admin analytics dashboard showing system-wide statistics (student vs. teacher vs. admin counts, pass/fail ratios) using **Chart.js**

---

## 🛠️ Architecture & Technologies

- **Frontend**: Vanilla HTML5, Modern CSS3 variables (featuring a premium dark glassmorphism theme, smooth animations, and Outfit typography), Vanilla JavaScript.
- **Backend**: Node.js, Express.js.
- **Database**: Simulated Mongoose engine utilizing a local JSON database cache located in `server/data/`. Runs completely standalone without requiring a local MongoDB server installation.

---

## 📂 Project Structure

```
Online-Exam-System/
├── client/                 # Frontend Static Assets
│   ├── css/                # Styling (Tokens, Components, Sidebar/Layouts, CSS Animations)
│   ├── js/                 # Vanilla JavaScript controllers (Auth, Dashboard, Exam, Result, Timers)
│   └── pages/              # HTML views (index, register, dashboard, teacher, admin, exam, result)
├── server/                 # Backend Node.js / Express Server
│   ├── config/             # Database connection wrapper and Mock Mongoose bootloader
│   ├── data/               # JSON-based databases (seeded automatically on startup)
│   ├── middleware/         # Auth, Roles, Joi schema request validation rules
│   ├── models/             # Schema specifications (User, Exam, Question, Result)
│   ├── routes/             # REST endpoints (auth, exams, results)
│   ├── utils/              # Token generators, response handlers, and the Mock Mongoose driver
│   └── server.js           # Server bootstrapper & static files server
├── .env.example            # Environment variables template
├── package.json            # NPM dependencies configuration
└── README.md               # Project guide (this file)
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)

### Setup & Installation

1. **Install dependencies**
   In the project root directory, run:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Rename `.env.example` to `.env` in the root folder. You can configure:
   - `PORT` - defaults to `5000`
   - `JWT_SECRET` - signing key for access tokens
   - `REFRESH_SECRET` - signing key for refresh tokens

3. **Start the Server**
   Start the Node.js server in development mode:
   ```bash
   npm run dev
   ```

4. **Access the Web Interface**
   Open your browser and navigate to:
   [http://localhost:5000](http://localhost:5000)

---

## 🔑 Seeding & Default Accounts

On the first start, if the databases in `server/data/` are missing or empty, the server automatically seeds the system with a mock JavaScript Exam, 4 questions, and 3 pre-configured user roles:

| Role | Email | Password |
|---|---|---|
| **System Admin** | `admin@example.com` | `password123` |
| **Teacher** | `teacher@example.com` | `password123` |
| **Student** | `student@example.com` | `password123` |

---

## ⚙️ REST API Endpoints

### 1. Authentication
* `POST /api/auth/register` - Registers student, teacher, or admin account.
* `POST /api/auth/login` - Authenticates user and sets HTTP-Only JWT cookies.
* `POST /api/auth/logout` - Revokes refresh tokens and clears cookies.
* `GET /api/auth/me` - Retrieves profile details for authenticated user session.
* `GET /api/auth/users` - List all system users (Admin only).
* `PUT /api/auth/users/:id/role` - Update user role (Admin only).
* `DELETE /api/auth/users/:id` - Delete user account (Admin only).

### 2. Exams
* `GET /api/exams` - Returns exams list (Students get assigned/public exams; Teachers get their own exams; Admins get all).
* `GET /api/exams/:id` - Exam details (correct answers are hidden for students).
* `POST /api/exams` - Create a new exam (Teacher & Admin only).
* `PUT /api/exams/:id` - Edit exam details (Teacher & Admin only).
* `DELETE /api/exams/:id` - Delete exam and associated questions (Teacher & Admin only).

### 3. Questions
* `POST /api/exams/:id/questions` - Add question to an exam (Teacher & Admin only).
* `PUT /api/exams/questions/:questionId` - Update question parameters (Teacher & Admin only).
* `DELETE /api/exams/questions/:questionId` - Delete question (Teacher & Admin only).

### 4. Results
* `POST /api/results/submit` - Server-side grades student MCQ submission and saves score.
* `GET /api/results/my` - Returns the logged-in student's result history.
* `GET /api/results/:id` - Detailed response feedback review showing student/correct answers side-by-side.
* `GET /api/results/exam/:examId` - List all results for a specific exam (Teacher & Admin only).
* `GET /api/results/all` - List all system-wide results (Admin only).
