# 📚 Smart Exam System

A simple, modern web-based examination platform designed for educational institutions to manage online exams, student assessments, and result tracking.

## ✨ Features

- **User Authentication**
  - Separate student and admin/teacher login portals
  - User self-registration with email validation
  - Role-based access control (Student, Teacher, Administrator)

- **Exam Management**
  - Create exams with multiple-choice questions (MCQs)
  - Set exam duration with automatic time tracking
  - Configure total marks and passing criteria
  - Question management with correct answer validation

- **Exam Taking**
  - Student-friendly exam interface
  - Real-time countdown timer
  - MCQ selection with instant feedback options
  - Auto-submission on time expiration

- **Results & Grading**
  - Automatic exam grading
  - Marks calculation and percentage display
  - Pass/Fail determination
  - Results history tracking

- **Modern UI/UX**
  - Responsive design (desktop and mobile)
  - Blue and white gradient theme
  - Smooth animations and transitions
  - Intuitive navigation

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: JSON file-based storage
- **Port**: 5000

## 📋 Project Structure

```
Online-Exam-System/
├── backend/
│   ├── src/
│   │   ├── server.js              # Enhanced Express server (with all 11 features)
│   │   └── server-simple.js       # Original simple server
│   ├── data/
│   │   ├── users.json             # User accounts database
│   │   ├── exams.json             # Exams database
│   │   ├── results.json           # Student results database
│   │   ├── questions.json         # Question bank
│   │   ├── feedback.json          # Student feedback
│   │   ├── analytics.json         # System analytics
│   │   ├── progress.json          # Exam progress tracking
│   │   ├── password-reset.json    # Password reset tokens
│   │   └── email-verification.json # Email verification tokens
│   ├── public/
│   │   ├── index.html             # Main UI
│   │   ├── style.css              # Styling
│   │   └── app.js                 # Frontend logic
│   ├── package.json               # Dependencies
│   ├── .env                       # Environment configuration
│   └── .gitignore
├── API_REFERENCE.md               # Complete API documentation
├── FEATURES_IMPLEMENTED.md        # Detailed feature documentation
├── README.md                      # This file
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Online-Exam-System.git
   cd Online-Exam-System
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:5000`

## 📖 Usage Guide

### For Students

1. **Registration**
   - Click "👨‍🎓 Student Portal" on the landing page
   - Click "Don't have an account? Create one now"
   - Fill in your details (Name, Email, Password - min 6 characters)
   - Click "Create Account"

2. **Taking an Exam**
   - Login with your credentials
   - Select an exam from the available exams list
   - Read the exam instructions
   - Answer all questions (MCQ format)
   - Watch the timer and submit before time expires
   - View your results with marks and percentage

### For Teachers/Admins

1. **Registration**
   - Click "👨‍💼 Admin & Teacher" on the landing page
   - Click "Don't have an account? Create one now"
   - Fill in details and select your role (Teacher or Administrator)
   - Click "Create Account"

2. **Creating an Exam**
   - Login to your dashboard
   - Click "+ Create New Exam"
   - Enter exam details:
     - Exam Title
     - Subject Name
     - Total Marks
     - Passing Marks
     - Duration (in minutes)
   - Add questions with:
     - Question text
     - 4 options (A, B, C, D)
     - Correct answer selection
   - Click "Create Exam"

3. **Viewing Results**
   - Access the results section in your dashboard
   - View student performance and scores

## 🔐 API Endpoints

### Authentication
- `POST /api/register` - User registration with email verification
- `GET /api/verify-email` - Verify email address
- `POST /api/login` - User login
- `POST /api/password-reset-request` - Request password reset
- `POST /api/password-reset-confirm` - Confirm password reset

### User Management (Admin)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Delete user

### Question Bank
- `GET /api/questions` - Get all questions
- `POST /api/questions/create` - Create question
- `PUT /api/questions/:questionId` - Update question
- `DELETE /api/questions/:questionId` - Delete question

### Exams
- `GET /api/exams` - Get all exams
- `GET /api/exams/:examId` - Get exam by ID (with optional randomization)
- `POST /api/exams/create` - Create new exam
- `PUT /api/exams/:examId` - Update exam
- `DELETE /api/exams/:examId` - Delete exam

### Exam Progress
- `POST /api/exam-progress/start` - Start exam and track progress
- `POST /api/exam-progress/update` - Update exam progress
- `GET /api/exam-progress/:progressId` - Get exam progress

### Results
- `POST /api/results/submit` - Submit exam and get results
- `GET /api/results/:studentId` - Get student results history
- `GET /api/admin/results` - Get all results (Admin)

### Analytics & Reports
- `GET /api/analytics/exams/:examId` - Get exam analytics
- `GET /api/analytics/student/:studentId` - Get student performance
- `GET /api/analytics/dashboard` - Get system dashboard

### Feedback
- `POST /api/feedback/submit` - Submit feedback
- `GET /api/feedback/exam/:examId` - Get exam feedback

## 📊 Key Data Structures

**See [API_REFERENCE.md](API_REFERENCE.md) for detailed data structure examples and all endpoint responses.**

## 🎨 Theme Colors

- **Primary Blue**: #3b82f6
- **Dark Blue**: #1e40af
- **Secondary Cyan**: #0ea5e9
- **Dark Cyan**: #0369a1
- **Background**: White and light blue gradients
- **Text**: Dark blue (#1e40af), Gray (#64748b)

## 🔍 Features Overview

| Feature | Description | Status |
|---------|-------------|--------|
| User Registration | Self-registration for students, teachers, and admins | ✅ Complete |
| User Authentication | Email/password login with session management | ✅ Complete |
| Password Encryption | Bcryptjs hashing for all passwords | ✅ Complete |
| Email Verification | Verify email on registration (24-hour tokens) | ✅ Complete |
| Password Reset | Secure password reset via email (1-hour tokens) | ✅ Complete |
| Admin User Management | Full CRUD operations for users | ✅ Complete |
| Question Bank | Centralized repository of reusable questions | ✅ Complete |
| Exam Creation | Teachers/Admins can create exams with MCQs | ✅ Complete |
| Exam Scheduling | Schedule exams for future dates/times | ✅ Complete |
| Question Randomization | Shuffle questions to prevent cheating | ✅ Complete |
| Negative Marking | Deduct marks for incorrect answers | ✅ Complete |
| Exam Taking | Students can take exams with timer | ✅ Complete |
| Real-time Progress | Track student progress during exam | ✅ Complete |
| Auto Grading | Automatic marking with detailed analytics | ✅ Complete |
| Results Display | Show marks, percentage, correct/wrong count | ✅ Complete |
| Analytics & Reports | Exam stats, student performance, dashboard | ✅ Complete |
| Feedback System | Students rate and comment on exams | ✅ Complete |
| Responsive Design | Mobile and desktop support | ✅ Complete |
| Modern UI | Blue and white gradient theme | ✅ Complete |

## ⚙️ Configuration

The `.env` file includes:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `EMAIL_USER` & `EMAIL_PASSWORD` - Gmail configuration (optional)

## � Limitations

- JSON file-based storage (suitable for small-scale deployments)
- No built-in load balancing or clustering
- Limited concurrent session management
- Email service requires Gmail App Password setup (optional)

## 🔐 Security

✅ **Built-in Features:**
- Password hashing (bcryptjs, 10 rounds)
- Email verification on registration
- Password reset with expiring tokens
- Role-based access control
- Admin user management

**Production Recommendations:**
- Use MongoDB/PostgreSQL instead of JSON files
- Add HTTPS/SSL encryption
- Implement JWT-based authentication
- Add rate limiting and input validation
- Use a reverse proxy (Nginx/Apache)

## ✅ Implemented Features

- [x] Password encryption & hashing
- [x] Email verification on registration
- [x] Password reset functionality
- [x] Question bank management
- [x] Exam analytics & reports
- [x] Real-time exam progress tracking
- [x] Automated exam scheduling
- [x] Question randomization
- [x] Negative marking system
- [x] Feedback system for students
- [x] Admin user management

## � Planned Features

- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] Bulk user import from CSV
- [ ] Exam templates
- [ ] Discussion forums
- [ ] Proctoring integration
- [ ] Multi-language support
- [ ] Database migration (MongoDB/PostgreSQL)
- [ ] Certificate generation
