# Smart Exam Hub

Smart Exam Hub is a React + Vite online examination platform for students, teachers, and administrators. It includes role-based dashboards, exam creation and scheduling flows, a question bank, notifications, results, and a dedicated exam-taking interface.

## Features

- Public landing page with product overview
- Login and registration entry points
- Student dashboard, exams, results, and schedule pages
- Teacher dashboard, exam creation, and question bank pages
- Admin dashboard, user management, and logs pages
- Shared notifications area
- Full-screen exam interface for active assessments
- Responsive UI built with React, Tailwind CSS, motion animations, and iconography

## Tech Stack

- React 19
- Vite
- TypeScript
- React Router
- Tailwind CSS
- motion
- Lucide React
- Recharts

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm, pnpm, or yarn

### Install

```bash
npm install
```

### Run the app

```bash
npm run dev
```

The app runs on `http://localhost:3000` by default.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Type-check the project

```bash
npm run lint
```

## Environment Variables

Create a local `.env` file from `.env.example` and set the values you need.

```bash
GEMINI_API_KEY=your_api_key_here
APP_URL=http://localhost:3000
```

- `GEMINI_API_KEY` is used for Gemini AI API calls.
- `APP_URL` should point to the deployed app URL or local development URL.

## Available Routes

- `/` - Landing page
- `/about` - About page
- `/contact` - Contact page
- `/login` - Login page
- `/register` - Registration entry point
- `/student/dashboard` - Student dashboard
- `/student/exams` - My exams
- `/student/results` - Results
- `/student/schedule` - Schedule
- `/teacher/dashboard` - Teacher dashboard
- `/teacher/create-exam` - Create exam
- `/teacher/questions` - Question bank
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/logs` - System logs
- `/notifications` - Notifications
- `/exam/:id` - Active exam view

## Project Structure

```text
src/
	components/      Reusable UI building blocks
	lib/             Shared utility helpers
	pages/           Route-level screens
	App.tsx          Application router
	main.tsx         App entry point
	index.css        Global styles
```

## Notes

- The current app uses localStorage for the demo user state on the landing page.
- Some pages are demo-focused and may not connect to a backend yet.
- External images are used in the landing page for presentation.

## License

No license has been specified yet.

