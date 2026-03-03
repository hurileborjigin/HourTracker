# HourTracker

A mobile-first work hour tracking app built with Next.js 14, Prisma, and NextAuth.

## Features

- **Authentication** — Email/password registration and login
- **Check-in/Check-out** — One-tap time tracking with live timer
- **Manual entry** — Add past work sessions with date, time, and notes
- **Summary** — Filter sessions by date range with total hours and salary calculation
- **Excel export** — Download `.xlsx` reports with session details and totals
- **Settings** — Configurable hourly rate per user

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Prisma + SQLite
- NextAuth.js v4 (Credentials provider, bcrypt)
- SheetJS (xlsx) for Excel export
- date-fns for date utilities

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set a secure `NEXTAUTH_SECRET`:

   ```bash
   openssl rand -base64 32
   ```

3. **Set up the database:**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run development server:**

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) and create an account.

## Production Build

```bash
npm run build
npm start
```
