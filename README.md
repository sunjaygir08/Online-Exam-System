
# Smart Exam Hub

Smart Exam Hub is a React + Vite online examination platform for students, teachers, and administrators. It includes role-based dashboards, exam creation and scheduling flows, a question bank, notifications, results, and a dedicated exam-taking interface.

## Run Locally

**Prerequisites:** Node.js 18 or newer

1. Install dependencies:
   `npm install`
2. Create a local `.env` file if you want to use Gemini features and set `GEMINI_API_KEY`.
3. Start the app:
   `npm run dev`

The app runs on `http://localhost:3000` by default.

## Build

1. Create a production build:
   `npm run build`
2. Preview the build:
   `npm run preview`

## Notes

- The app can run without Gemini configuration for the dashboard flows.
- Camera and microphone permissions are requested for the exam interface.
