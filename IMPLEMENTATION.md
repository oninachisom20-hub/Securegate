# IMPLEMENTATION_CHECKLIST.md

# SecureGate — Implementation Tracker & Assessment Checklist



# Build Strategy

Follow the SecureGate phases in order.

Rule:

Do not move to the next phase until the current phase works.

Commit working code after each phase.

Recommended Commit Pattern:

- Phase 1 Complete
- Phase 2 Auth Complete
- Phase 3 Verification Complete
- Phase 4 Password Reset Complete
- Phase 5 Security Complete
- Phase 6 Deployment Complete

---

# PHASE 1 — Scaffold & Database

Goal:

Create a stable project foundation.

## Project Setup

- [ ] Create Next.js 14 app
- [ ] Enable App Router
- [ ] Enable TypeScript
- [ ] Install Tailwind
- [ ] Initialize Git
- [ ] Create GitHub repo
- [ ] First scaffold commit

## Prisma + PostgreSQL

- [ ] Install Prisma
- [ ] Initialize Prisma
- [ ] Connect DATABASE_URL
- [ ] Configure PostgreSQL
- [ ] Create schema.prisma

## Database Models

### User

- [ ] id
- [ ] name
- [ ] email
- [ ] password
- [ ] emailVerified
- [ ] createdAt

### VerificationToken

- [ ] identifier
- [ ] token
- [ ] expires

### PasswordResetToken

- [ ] email
- [ ] token
- [ ] expires

## Database Migration

- [ ] Run prisma migrate dev
- [ ] Confirm DB tables exist
- [ ] Push Phase 1 code

Phase 1 Status:

- [ ] Complete

---

# PHASE 2 — Authentication Core

Goal:

Build secure signup and login.

## NextAuth Setup

- [ ] Install NextAuth
- [ ] Configure Credentials Provider
- [ ] Create auth config
- [ ] Configure session strategy

## Signup

- [ ] Signup form
- [ ] Zod validation
- [ ] Password strength indicator
- [ ] Hash password
- [ ] bcrypt salt rounds = 12
- [ ] Save user

## Login

- [ ] Login form
- [ ] Compare hashed password
- [ ] Session creation
- [ ] Generic auth errors

## Dashboard Protection

- [ ] Create middleware
- [ ] Protect dashboard
- [ ] Redirect unauthenticated users

## Manual Testing

- [ ] Signup works
- [ ] Login works
- [ ] Password NOT plain text

Phase 2 Status:

- [ ] Complete

---

# PHASE 3 — Email Verification

Goal:

Secure account verification.

## Token System

- [ ] Generate secure token
- [ ] Save token in DB
- [ ] 15 min expiry

## Email

- [ ] Install Resend
- [ ] Create React Email template
- [ ] Send verification email

## Verification Route

- [ ] Create verify route
- [ ] Validate token
- [ ] Check expiry
- [ ] Verify user
- [ ] Delete token

## Access Rules

- [ ] Block unverified users
- [ ] Middleware updated
- [ ] Resend verification option

## Manual Testing

- [ ] Email arrives
- [ ] Link works
- [ ] Expired token handled

Phase 3 Status:

- [ ] Complete

---

# PHASE 4 — Forgot Password

Goal:

Enable secure recovery.

## Forgot Password

- [ ] Build page
- [ ] Email input
- [ ] Lookup email
- [ ] Generic success response

## Token

- [ ] Generate reset token
- [ ] Save in DB
- [ ] 1 hour expiry

## Reset Flow

- [ ] Send reset email
- [ ] Reset route
- [ ] Validate token
- [ ] Expiry check
- [ ] Hash new password
- [ ] Delete token
- [ ] Redirect login

## Manual Testing

- [ ] Email sends
- [ ] Reset succeeds
- [ ] Old password fails
- [ ] New password works

Phase 4 Status:

- [ ] Complete

---

# PHASE 5 — Security Hardening

Goal:

Protect against abuse.

## Rate Limiting

- [ ] Install Upstash / custom limiter
- [ ] Login protection
- [ ] Forgot password protection
- [ ] 5 attempts / 10 mins

## Error Handling

- [ ] No email enumeration
- [ ] No leaked stack traces
- [ ] Generic errors only

## Security Headers

- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Referrer-Policy

## Environment Security

- [ ] .env.local ignored
- [ ] No secrets committed
- [ ] Env vars configured

## Attack Testing

Try breaking app:

- [ ] Wrong password
- [ ] Expired token
- [ ] Empty fields
- [ ] Invalid links
- [ ] Multiple login attempts

Phase 5 Status:

- [ ] Complete

---

# PHASE 6 — UI + Deployment

Goal:

Ship polished MVP.

## UI

- [ ] Clean styling
- [ ] Accessible labels
- [ ] Validation messages
- [ ] Loading states
- [ ] Consistent UI

## Deployment

- [ ] Push GitHub code
- [ ] Connect Vercel
- [ ] Add env vars
- [ ] Deploy

## End-to-End Testing

- [ ] Signup
- [ ] Verification
- [ ] Login
- [ ] Dashboard
- [ ] Forgot password
- [ ] Logout

Phase 6 Status:

- [ ] Complete

---

# Assessment Checklist

Final pre-submission review.

## Required Deliverables

- [ ] GitHub repo
- [ ] Vercel URL
- [ ] REFLECTION.md
- [ ] Voice note

## Security Review

- [ ] Password hashed
- [ ] No plaintext password
- [ ] Token expiry active
- [ ] Rate limiting active
- [ ] No secrets leaked
- [ ] Protected routes working

## Documentation

- [ ] README.md
- [ ] SECURITY.md
- [ ] SecureGate_PRD.md
- [ ] REFLECTION.md complete
- [ ] All 15 questions answered

## GitHub Review

- [ ] .env.local absent
- [ ] No API keys
- [ ] Clean commit history




