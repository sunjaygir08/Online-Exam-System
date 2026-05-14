# 📖 API Reference Guide

Complete API documentation for the Smart Exam System with all implemented features.

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/api/register`

Creates new user account and sends verification email.

**Request:**
```json
{
  "email": "student@example.com",
  "name": "John Doe",
  "password": "securepass123",
  "confirmPassword": "securepass123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created! Check your email for verification link.",
  "user": {
    "id": 4,
    "name": "John Doe",
    "email": "student@example.com",
    "role": "student"
  }
}
```

---

### 2. Verify Email
**GET** `/api/verify-email?token={token}&email={email}`

Verifies user email address using token from email link.

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully!"
}
```

---

### 3. Login User
**POST** `/api/login`

Authenticates user and returns token.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 3,
    "name": "Student",
    "email": "student@example.com",
    "role": "student",
    "isEmailVerified": true
  },
  "token": "token-3-xxxx-xxxx-xxxx"
}
```

---

### 4. Request Password Reset
**POST** `/api/password-reset-request`

Sends password reset email with token.

**Request:**
```json
{
  "email": "student@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

### 5. Confirm Password Reset
**POST** `/api/password-reset-confirm`

Updates password with reset token.

**Request:**
```json
{
  "token": "uuid-token",
  "email": "student@example.com",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully!"
}
```

---

## 👥 Admin User Management

### 1. Get All Users
**GET** `/api/admin/users`

Returns all users (without passwords).

**Response:**
```json
[
  {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "isEmailVerified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLogin": "2024-01-15T11:00:00Z"
  },
  ...
]
```

---

### 2. Update User
**PUT** `/api/admin/users/:userId`

Updates user information.

**Request:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "teacher",
  "isEmailVerified": true
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

---

### 3. Delete User
**DELETE** `/api/admin/users/:userId`

Removes user from system.

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 📚 Question Bank Management

### 1. Get All Questions
**GET** `/api/questions`

Returns all questions in question bank.

**Response:**
```json
[
  {
    "id": 1,
    "text": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": 1,
    "subject": "Mathematics",
    "difficulty": "easy",
    "marks": 1,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  ...
]
```

---

### 2. Create Question
**POST** `/api/questions/create`

Adds new question to question bank.

**Request:**
```json
{
  "text": "What is the capital of France?",
  "options": ["London", "Paris", "Berlin", "Madrid"],
  "correctAnswer": 1,
  "subject": "Geography",
  "difficulty": "easy",
  "marks": 1
}
```

**Response:**
```json
{
  "success": true,
  "question": { ... }
}
```

---

### 3. Update Question
**PUT** `/api/questions/:questionId`

Modifies existing question.

**Request:**
```json
{
  "text": "Updated question text",
  "difficulty": "medium",
  "marks": 2
}
```

**Response:**
```json
{
  "success": true,
  "question": { ... }
}
```

---

### 4. Delete Question
**DELETE** `/api/questions/:questionId`

Removes question from bank.

**Response:**
```json
{
  "success": true,
  "message": "Question deleted"
}
```

---

## 📝 Exam Management

### 1. Get All Exams
**GET** `/api/exams`

Returns all available exams.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Math Quiz",
    "subject": "Mathematics",
    "totalMarks": 100,
    "passingMarks": 40,
    "duration": 60,
    "negativeMarks": 0.5,
    "randomizeQuestions": true,
    "scheduleDate": "2024-02-15",
    "scheduleTime": "10:00 AM",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  ...
]
```

---

### 2. Create Exam
**POST** `/api/exams/create`

Creates new exam with questions.

**Request:**
```json
{
  "title": "Advanced Math",
  "subject": "Mathematics",
  "questions": [
    {
      "text": "What is 5+5?",
      "options": ["9", "10", "11", "12"],
      "correctAnswer": 1,
      "marks": 1
    }
  ],
  "totalMarks": 100,
  "passingMarks": 40,
  "duration": 120,
  "negativeMarks": 0.5,
  "randomizeQuestions": true,
  "scheduleDate": "2024-02-15",
  "scheduleTime": "10:00 AM"
}
```

**Response:**
```json
{
  "success": true,
  "exam": { ... }
}
```

---

### 3. Get Exam by ID
**GET** `/api/exams/:examId`

Returns exam with optionally randomized questions.

**Response:**
```json
{
  "id": 1,
  "title": "Math Quiz",
  "questions": [ ... ], // Randomized if enabled
  "totalMarks": 100,
  "passingMarks": 40,
  "duration": 60
}
```

---

### 4. Update Exam
**PUT** `/api/exams/:examId`

Modifies exam settings.

**Request:**
```json
{
  "title": "Updated Title",
  "passingMarks": 50,
  "negativeMarks": 1,
  "randomizeQuestions": false
}
```

**Response:**
```json
{
  "success": true,
  "exam": { ... }
}
```

---

### 5. Delete Exam
**DELETE** `/api/exams/:examId`

Removes exam from system.

**Response:**
```json
{
  "success": true,
  "message": "Exam deleted"
}
```

---

## ⏱️ Exam Progress Tracking

### 1. Start Exam
**POST** `/api/exam-progress/start`

Initiates exam and creates progress record.

**Request:**
```json
{
  "examId": 1,
  "studentId": 3
}
```

**Response:**
```json
{
  "success": true,
  "progressId": "uuid-xxxx"
}
```

---

### 2. Update Progress
**POST** `/api/exam-progress/update`

Updates student's exam progress.

**Request:**
```json
{
  "progressId": "uuid-xxxx",
  "currentQuestion": 5,
  "answers": [0, 1, 2, 1, 0, null, ...]
}
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "id": "uuid-xxxx",
    "examId": 1,
    "studentId": 3,
    "startedAt": "2024-01-15T10:00:00Z",
    "currentQuestion": 5,
    "answers": [0, 1, 2, 1, 0, null, ...],
    "submittedAt": null
  }
}
```

---

### 3. Get Progress
**GET** `/api/exam-progress/:progressId`

Retrieves exam progress.

**Response:**
```json
{
  "id": "uuid-xxxx",
  "examId": 1,
  "studentId": 3,
  "startedAt": "2024-01-15T10:00:00Z",
  "currentQuestion": 5,
  "answers": [0, 1, 2, 1, 0],
  "submittedAt": null
}
```

---

## 📊 Results & Grading

### 1. Submit Exam
**POST** `/api/results/submit`

Submits exam and calculates results.

**Request:**
```json
{
  "examId": 1,
  "studentId": 3,
  "answers": [0, 1, 2, 1, 0, 1, 2, 0, 1, 2],
  "progressId": "uuid-xxxx",
  "negativeMarkingEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "id": 1705329600000,
    "examId": 1,
    "studentId": 3,
    "marksObtained": 8,
    "totalMarks": 10,
    "percentage": "80.00",
    "isPassed": true,
    "correctAnswers": 8,
    "wrongAnswers": 2,
    "totalQuestions": 10,
    "submittedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### 2. Get Student Results
**GET** `/api/results/:studentId`

Returns all results for a student.

**Response:**
```json
[
  {
    "id": 1705329600000,
    "examId": 1,
    "studentId": 3,
    "marksObtained": 8,
    "totalMarks": 10,
    "percentage": "80.00",
    "isPassed": true,
    "correctAnswers": 8,
    "wrongAnswers": 2,
    "totalQuestions": 10,
    "submittedAt": "2024-01-15T11:00:00Z"
  },
  ...
]
```

---

### 3. Get All Results (Admin)
**GET** `/api/admin/results`

Returns all exam results in system.

**Response:**
```json
[
  { ... },
  { ... }
]
```

---

## 📈 Analytics & Reports

### 1. Get Exam Analytics
**GET** `/api/analytics/exams/:examId`

Gets performance metrics for specific exam.

**Response:**
```json
{
  "examId": 1,
  "totalAttempts": 25,
  "averageMarks": "72.50",
  "passRate": "80%",
  "highestMarks": 98,
  "lowestMarks": 35,
  "passedCount": 20,
  "failedCount": 5
}
```

---

### 2. Get Student Analytics
**GET** `/api/analytics/student/:studentId`

Gets performance metrics for specific student.

**Response:**
```json
{
  "studentId": 3,
  "totalExams": 5,
  "averageMarks": "75.00",
  "passRate": "100%",
  "examResults": [
    { ... },
    { ... }
  ]
}
```

---

### 3. Get Dashboard Analytics
**GET** `/api/analytics/dashboard`

Gets overall system statistics.

**Response:**
```json
{
  "totalStudents": 50,
  "totalTeachers": 10,
  "totalExams": 15,
  "totalSubmissions": 200,
  "averagePassRate": "78.50%"
}
```

---

## 💬 Feedback System

### 1. Submit Feedback
**POST** `/api/feedback/submit`

Student submits feedback for exam.

**Request:**
```json
{
  "examId": 1,
  "studentId": 3,
  "rating": 4,
  "comment": "Great exam, well structured!"
}
```

**Response:**
```json
{
  "success": true,
  "feedback": {
    "id": "uuid-xxxx",
    "examId": 1,
    "studentId": 3,
    "rating": 4,
    "comment": "Great exam, well structured!",
    "submittedAt": "2024-01-15T11:30:00Z"
  }
}
```

---

### 2. Get Exam Feedback
**GET** `/api/feedback/exam/:examId`

Gets all feedback for specific exam.

**Response:**
```json
{
  "examId": 1,
  "averageRating": "4.20",
  "totalFeedback": 25,
  "feedbacks": [
    {
      "id": "uuid-xxxx",
      "examId": 1,
      "studentId": 3,
      "rating": 4,
      "comment": "Great exam!",
      "submittedAt": "2024-01-15T11:30:00Z"
    },
    ...
  ]
}
```

---

## 🔄 Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 📝 Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🧪 Testing the APIs

### cURL Examples:

**Register:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "confirmPassword": "password123",
    "role": "student"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

**Get Exams:**
```bash
curl http://localhost:5000/api/exams
```

**Submit Exam:**
```bash
curl -X POST http://localhost:5000/api/results/submit \
  -H "Content-Type: application/json" \
  -d '{
    "examId": 1,
    "studentId": 3,
    "answers": [0, 1, 2, 1, 0, 1, 2, 0, 1, 2],
    "negativeMarkingEnabled": true
  }'
```

---

**Version:** 2.0.0
**Last Updated:** May 14, 2026
**Status:** Complete with all 11 features ✅
