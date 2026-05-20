# API Documentation

**SecureGate API Endpoints Reference**

---

## 📋 Overview

SecureGate exposes several API endpoints for authentication, user management, and security operations. All endpoints follow RESTful conventions and return JSON responses.

**Base URL (Development):** `http://localhost:3000/api`  
**Base URL (Production):** `https://your-app.vercel.app/api`

---

## 🔐 Authentication

### NextAuth Endpoints

SecureGate uses NextAuth.js for session management. NextAuth automatically provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signin` | GET/POST | Sign in page and submission |
| `/api/auth/signout` | GET/POST | Sign out |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/csrf` | GET | Get CSRF token |
| `/api/auth/providers` | GET | List available providers |

---

## 📝 User Registration & Authentication

### 1. Sign Up

Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Validation Rules:**
- `name`: Optional, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your account.",
  "user": {
    "id": "clx1234567890",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation failed:
```json
{
  "error": "Invalid input",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

**409 Conflict** - Email already exists:
```json
{
  "error": "Email already registered"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create account. Please try again."
}
```

**Rate Limiting:** 10 requests per 10 minutes per IP

**Example Usage:**
```typescript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePassword123!',
  }),
})

const data = await response.json()
```

---

### 2. Sign In

Authenticate an existing user.

**Endpoint:** `POST /api/auth/callback/credentials`

**Note:** This is handled by NextAuth. Use the `signIn()` function from `next-auth/react`.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "callbackUrl": "/dashboard"
}
```

**Success Response:**
Redirects to `callbackUrl` with session cookie set.

**Error Response:**
```json
{
  "error": "Invalid credentials"
}
```

**Security Notes:**
- Generic error message prevents email enumeration
- Rate limited: 5 attempts per 10 minutes per IP
- Requires email to be verified (`emailVerified !== null`)

**Example Usage (Client-Side):**
```typescript
import { signIn } from 'next-auth/react'

const result = await signIn('credentials', {
  email: 'john@example.com',
  password: 'SecurePassword123!',
  redirect: false,
})

if (result?.error) {
  console.error('Login failed:', result.error)
} else {
  router.push('/dashboard')
}
```

---

### 3. Sign Out

End the current session.

**Endpoint:** `GET /api/auth/signout`

**Usage:**
```typescript
import { signOut } from 'next-auth/react'

await signOut({ callbackUrl: '/login' })
```

---

### 4. Get Current Session

Retrieve the authenticated user's session.

**Endpoint:** `GET /api/auth/session`

**Success Response (Authenticated):**
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "john@example.com",
    "name": "John Doe",
    "emailVerified": "2024-03-15T10:30:00.000Z"
  },
  "expires": "2024-04-15T10:30:00.000Z"
}
```

**Response (Not Authenticated):**
```json
{}
```

**Example Usage:**
```typescript
import { useSession } from 'next-auth/react'

export default function Component() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return <div>Not logged in</div>
  
  return <div>Welcome, {session?.user?.name}</div>
}
```

---

## ✉️ Email Verification

### 5. Verify Email

Verify a user's email address using a token.

**Endpoint:** `GET /api/auth/verify-email?token={token}`

**Query Parameters:**
- `token` (required): The verification token sent via email

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

**Error Responses:**

**400 Bad Request** - Invalid or expired token:
```json
{
  "error": "Invalid or expired verification token"
}
```

**404 Not Found** - User not found:
```json
{
  "error": "User not found"
}
```

**Example Usage:**
User clicks link in email: `https://your-app.vercel.app/verify-email?token=abc123...`

---

### 6. Resend Verification Email

Request a new verification email.

**Endpoint:** `POST /api/auth/resend-verification`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification email sent. Please check your inbox."
}
```

**Error Responses:**

**400 Bad Request** - Email already verified:
```json
{
  "error": "Email is already verified"
}
```

**404 Not Found** - User not found:
```json
{
  "error": "User not found"
}
```

**429 Too Many Requests** - Rate limited:
```json
{
  "error": "Too many requests. Please try again later."
}
```

**Rate Limiting:** 3 requests per 10 minutes per email

---

## 🔑 Password Management

### 7. Request Password Reset

Initiate password reset flow.

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "If that email exists, we've sent password reset instructions."
}
```

**Security Note:** 
Always returns success, even if email doesn't exist. This prevents email enumeration attacks.

**Error Responses:**

**429 Too Many Requests:**
```json
{
  "error": "Too many password reset requests. Please try again later."
}
```

**Rate Limiting:** 3 requests per hour per IP

**Example Usage:**
```typescript
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
  }),
})

const data = await response.json()
console.log(data.message)
```

---

### 8. Reset Password

Complete password reset with token.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "abc123def456...",
  "password": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Validation Rules:**
- `token`: Required, valid reset token
- `password`: Same rules as signup (min 8 chars, uppercase, lowercase, number, special)
- `confirmPassword`: Must match `password`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now log in with your new password."
}
```

**Error Responses:**

**400 Bad Request** - Invalid or expired token:
```json
{
  "error": "Invalid or expired reset token"
}
```

**400 Bad Request** - Password validation failed:
```json
{
  "error": "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character"
}
```

**400 Bad Request** - Passwords don't match:
```json
{
  "error": "Passwords do not match"
}
```

---

## 🛡️ Rate Limiting

SecureGate implements rate limiting on sensitive endpoints to prevent abuse.

### Rate Limit Headers

All rate-limited responses include these headers:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1678901234
```

### Rate Limited Endpoints

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/auth/signin` | 5 attempts | 10 minutes |
| `POST /api/auth/signup` | 10 attempts | 10 minutes |
| `POST /api/auth/forgot-password` | 3 attempts | 60 minutes |
| `POST /api/auth/resend-verification` | 3 attempts | 10 minutes |

### Rate Limit Response

**429 Too Many Requests:**
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 600
}
```

---

## 🧪 Testing Endpoints

### Health Check

Simple endpoint to verify API is running.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-03-15T10:30:00.000Z",
  "environment": "production"
}
```

---

## 🔒 Security Features

### CSRF Protection

All POST/PUT/DELETE requests require a valid CSRF token. NextAuth handles this automatically.

**Getting CSRF Token:**
```typescript
const response = await fetch('/api/auth/csrf')
const { csrfToken } = await response.json()
```

### Session Cookies

Session cookies are:
- HTTP-only (not accessible via JavaScript)
- Secure (HTTPS only in production)
- SameSite=Lax (CSRF protection)
- Max age: 30 days

### Password Security

- Passwords hashed with bcrypt
- 12 salt rounds (recommended for 2024)
- Never returned in API responses
- Minimum complexity requirements enforced

---

## 🚨 Error Handling

### Standard Error Response Format

All errors follow this structure:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error or invalid input |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (duplicate email) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Error Examples

**Validation Error:**
```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

**Authentication Error:**
```json
{
  "error": "Invalid credentials"
}
```

**Rate Limit Error:**
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 600
}
```

---

## 📊 Response Times (SLA)

Target response times for each endpoint:

| Endpoint | Target | P95 |
|----------|--------|-----|
| `POST /api/auth/signup` | < 500ms | < 1000ms |
| `POST /api/auth/signin` | < 300ms | < 600ms |
| `GET /api/auth/session` | < 100ms | < 200ms |
| `POST /api/auth/forgot-password` | < 400ms | < 800ms |
| `POST /api/auth/reset-password` | < 400ms | < 800ms |

---

## 🧩 Code Examples

### Complete Sign Up Flow

```typescript
// 1. Sign up
const signupResponse = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePassword123!',
  }),
})

if (!signupResponse.ok) {
  const error = await signupResponse.json()
  console.error('Signup failed:', error)
  return
}

// 2. User receives email and clicks link
// GET /api/auth/verify-email?token=abc123...

// 3. Now user can log in
const loginResult = await signIn('credentials', {
  email: 'john@example.com',
  password: 'SecurePassword123!',
  redirect: false,
})

if (loginResult?.error) {
  console.error('Login failed:', loginResult.error)
} else {
  router.push('/dashboard')
}
```

### Password Reset Flow

```typescript
// 1. Request password reset
const forgotResponse = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
  }),
})

// 2. User receives email and clicks link
// User lands on /reset-password?token=xyz789...

// 3. Submit new password
const resetResponse = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'xyz789...',
    password: 'NewPassword123!',
    confirmPassword: 'NewPassword123!',
  }),
})

if (resetResponse.ok) {
  // Redirect to login
  router.push('/login')
}
```

### Protected API Route Example

```typescript
// pages/api/protected/user-data.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  // Proceed with protected logic
  return res.status(200).json({
    user: session.user,
    data: 'Protected data',
  })
}
```

---

## 🔧 Debugging

### Enable API Logging

Set in `.env.local`:
```env
DEBUG=true
```

### Check Session State

```typescript
import { getSession } from 'next-auth/react'

// Client-side
const session = await getSession()
console.log('Current session:', session)

// Server-side
import { getServerSession } from 'next-auth'
const session = await getServerSession(req, res, authOptions)
```

### Test Rate Limiting

```bash
# Send multiple requests rapidly
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

---

## 📚 Additional Resources

- [NextAuth.js API Documentation](https://next-auth.js.org/getting-started/rest-api)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

---

**API Version:** 1.0  
**Last Updated:** [Date]  
**Maintained by:** SecureGate Development Team