# Smart Exam Hub (Frontend Only)

Smart Exam Hub is a React + Vite online examination platform UI for students, teachers, and administrators.

## Quick Start

Prerequisites: Node.js 18 or newer

```bash
npm install
npm run dev
```

Website URL: http://localhost:3000

## Available Scripts

```bash
npm run dev      # Start development server
npm run start    # Alias of dev
npm run build    # Production build
npm run preview  # Preview production build
```

## Demo Accounts

Use password: `password123`

- admin@example.com (Admin)
- teacher@example.com (Teacher)
- student@example.com (Student)

## Notes

- This project is now frontend-only.
- Authentication and data calls are handled locally via browser storage and mock data.
- Optional OAuth UI still requires frontend env vars if you want to enable provider redirects:

```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```
