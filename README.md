
# Smart Exam Hub

Smart Exam Hub is a React + Vite online examination platform for students, teachers, and administrators. It includes role-based dashboards, exam creation and scheduling flows, a question bank, notifications, results, and a dedicated exam-taking interface.

## Quick Start Guide

**Prerequisites:** Node.js 18 or newer

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Frontend + Backend Together (One Command)

```bash
npm run start
```

This command starts both services together:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

Press Ctrl+C once to stop both.

### Step 3: Start the Backend (Terminal 1)

Open a new terminal and run:

```bash
npm run backend
```

You should see: `Backend running on http://localhost:4000`

The database auto-seeds with demo users and exams on first run.

### Step 4: Start the Frontend (Terminal 2)

Open another terminal and run:

```  
npm run dev
```

You should see:
```
   VITE v6.4.2  ready in 1712 ms
   ➜  Local: http://localhost:3000/
```
### Step 5: Login with Demo Accounts

**Available Demo Accounts:**

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | Admin |
| teacher@example.com | password123 | Teacher |
| student@example.com | password123 | Student |

#### To Login:
1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Select your role (Student, Teacher, or Admin)
3. Enter email and password
4. Click "Sign In"

## Build for Production

```bash
npm run build
npm run preview
```

## Architecture

**Frontend:**
- React 19 + Vite 6.2 + Tailwind CSS 4.1
- React Router for navigation
- Stores JWT tokens in localStorage
- Auto-fetches data from backend API

**Backend:**
- Express 4.21 server on port 4000
- Password hashing with bcrypt (crypto.scryptSync)
- JWT token-based authentication
- JSON file storage (`backend/data/db.json`)
- Role-based access control (student, teacher, admin)
- 20+ API endpoints with audit logging

## Key Features

✅ User registration and login with backend authentication
✅ Role-based dashboards (Student, Teacher, Admin)
✅ Exam creation and management
✅ Real-time question bank
✅ Exam submission and results tracking
✅ Notifications system
✅ Admin logs for audit trail
✅ Fresh user onboarding with empty state

## API Integration Status

- ✅ Authentication (login/register) - Connected
- ✅ Exam data fetching - Connected  
- ✅ Backend running with persistent JSON storage
- ✅ Dashboard population from API
- ✅ Logout functionality
- 🔄 Password reset email (generated but not sent)
- 🔄 OAuth (Google/GitHub) - Redirects built, callback handling pending

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Backend won't start** | Check port 4000 is free. Kill other Node processes: `Get-Process -Name node \| Stop-Process -Force` |
| **Frontend shows "Network error"** | Ensure backend is running (`npm run backend`) and CORS is set correctly |
| **Port 3000 in use** | Change in package.json: `"dev": "vite --port=3001 --host=0.0.0.0"` |
| **Port 4000 in use** | Set in `backend/.env`: `BACKEND_PORT=4001` |
| **Login keeps failing** | Check backend server is still running and check browser console for detailed errors |
| **Database errors** | Delete `backend/data/db.json` and restart backend - it will reseed automatically |

## Environment Variables (Optional)

Create a `backend/.env` file to override defaults:
```
BACKEND_PORT=4000
FRONTEND_URL=http://localhost:3000
```

Create a `.env` file in root for optional Gemini API (for AI features):
```
GEMINI_API_KEY=your_key_here
```

## Directory Structure

```
├── src/                    # Frontend React code
│   ├── pages/             # Page components (Login, Dashboards, etc.)
│   ├── components/        # Reusable UI components
│   ├── lib/
│   │   ├── api.ts         # Backend API client helper (NEW)
│   │   └── utils.ts       # Utility functions
│   └── types.ts           # TypeScript type definitions
├── backend/               # Backend Express server
│   ├── server.js          # Main server with 20+ endpoints
│   ├── data/
│   │   └── db.json        # JSON database (auto-created)
│   └── .env.example       # Environment template
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## Development Notes

- **Authentication Flow:** Login/Register → Backend validates → Returns JWT token → Token stored in localStorage → Used in Authorization header for subsequent API calls
- **Fresh User State:** New registrations have `isNewUser: true` flag, providing empty-state experience
- **Database Persistence:** All data saved to `backend/data/db.json` automatically
- **CORS Enabled:** Backend allows requests from `http://localhost:3000` (configurable in .env)
- **Role-Based Routes:** Different dashboards show based on user role (student/teacher/admin)
