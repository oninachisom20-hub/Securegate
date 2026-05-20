# SecureGate

SecureGate is a production-grade authentication and access control system built to demonstrate robust identity and session management. It acts as a standalone secure layer featuring Registration, Email Verification (Magic Link/OTP), JWT Session Authentication, Password Recovery, and Brute-Force Rate Limiting.

## Features Built
- **Account Creation**: Bcrypt password hashing (12 salt rounds), Zod form validation.
- **Email Verification**: Time-bound secure tokens, Resend integration, blocks unverified access.
- **Login**: NextAuth.js Credentials provider with strict password validation.
- **Password Recovery**: Secure token generation, expiry validation, and new password confirmation.
- **Dashboard Protection**: Next.js Middleware guarding authenticated routes.
- **Security Hardening**: Upstash Rate Limiting, HTTP security headers, generic API errors.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js (v4)
- **Styling**: TailwindCSS
- **Validation**: Zod + React Hook Form
- **Emails**: Resend

## Setup Instructions

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd securegate
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/securegate"
   NEXTAUTH_SECRET="your-super-secret-string"
   NEXTAUTH_URL="http://localhost:3000"
   RESEND_API_KEY="re_..."
   UPSTASH_REDIS_REST_URL="https://..."
   UPSTASH_REDIS_REST_TOKEN="..."
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Deployment
This project is ready to be deployed to Vercel. Ensure all environment variables are added in the Vercel project settings prior to the first build.

## State Machine Execution
This application was built strictly following a phase-by-phase State Machine Engineering protocol, ensuring security validation at every checkpoint.
