# Security Architecture

SecureGate prioritizes security by design. Below are the implemented defense mechanisms protecting the application.

## 1. Password Security
- All passwords are hashed using `bcryptjs` with a work factor (salt rounds) of 12.
- Plaintext passwords are never stored in the database or logged in the terminal.
- Strict password requirements (minimum 8 characters) enforced on client and server via Zod.

## 2. Token Integrity & Expiry
- **Verification Tokens**: Generated using `uuidv4`, strictly bound to an email identifier, and expire after 15 minutes.
- **Password Reset Tokens**: Securely generated, one-time use, and expire after 1 hour.
- Old tokens are immediately invalidated when a new one is requested.

## 3. Session Protection
- Utilizes `NextAuth.js` with HTTP-Only, secure JWT cookies.
- Sessions automatically expire and rotate.
- Route protection is implemented at the edge via Next.js Middleware (`/dashboard/:path*`).

## 4. Rate Limiting & Brute Force Prevention
- Upstash Redis Rate Limiting is implemented on critical authentication endpoints (`/api/auth/register`, `/api/auth/reset`, `/api/auth/login`).
- Limits are strictly enforced to 5 attempts per 10-minute sliding window per IP address.

## 5. Information Disclosure Prevention
- The `/api/auth/reset` endpoint always returns a generic success message ("If an account exists, a reset link was sent") to prevent email enumeration attacks.
- Registration endpoints return generic 500 errors to avoid leaking stack traces.
- No `console.log` statements containing sensitive PII exist in the production build.

## 6. HTTP Security Headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Configured at the Next.js framework level in `next.config.mjs`.
