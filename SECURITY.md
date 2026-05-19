# SECURITY.md

# SecureGate Security Policy

## Security Practices

SecureGate follows secure authentication and identity management principles.

Security measures include:

- Password hashing using bcryptjs
- Email verification
- Password reset token expiry
- Rate limiting
- Secure session handling
- Protected routes
- Environment variable protection
- HTTP security headers

---

## Sensitive Data

Do not commit:

- `.env.local`
- API Keys
- Secrets
- Tokens

Use:

- Vercel Environment Variables
- Secret rotation if leaked

---

## Responsible Disclosure

If you discover a vulnerability:

1. Do not publish it publicly
2. Contact the maintainer privately
3. Provide reproduction steps
4. Allow time for remediation

---

## Authentication Security Rules

- Never store plain passwords
- Never reveal account existence
- Never expose stack traces
- Always expire tokens
- Always validate server-side
