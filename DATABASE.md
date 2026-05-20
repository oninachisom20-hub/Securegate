# Database Documentation

**SecureGate Database Schema & Setup Guide**

---

## 📊 Overview

SecureGate uses **PostgreSQL** as the primary database with **Prisma ORM** for type-safe database access. This document covers the complete database schema, setup instructions, migrations, and common queries.

---

## 🗄️ Database Schema

### User Model

Stores authenticated user accounts with email verification status.

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String    // bcrypt hashed, never plain text
  emailVerified DateTime? // null until email is verified
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Unique identifier (CUID format) |
| `name` | String | No | User's display name (optional) |
| `email` | String | Yes | Unique email address (used for login) |
| `password` | String | Yes | Bcrypt hash with 12 salt rounds |
| `emailVerified` | DateTime | No | Timestamp when email was verified (null = unverified) |
| `createdAt` | DateTime | Yes | Account creation timestamp |
| `updatedAt` | DateTime | Yes | Last account update timestamp |

**Constraints:**
- `email` must be unique (enforced at database level)
- `password` must never be stored in plain text
- `emailVerified` being `null` indicates unverified account

---

### VerificationToken Model

Stores email verification tokens sent to users during sign-up.

```prisma
model VerificationToken {
  identifier String   // Usually the user's email
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `identifier` | String | Yes | User's email address |
| `token` | String | Yes | Cryptographically secure random token (64 chars) |
| `expires` | DateTime | Yes | Token expiration timestamp (15 minutes from creation) |

**Constraints:**
- `token` must be unique
- Composite unique constraint on `[identifier, token]`
- Tokens are deleted after successful verification
- Expired tokens should be cleaned up periodically

**Security Notes:**
- Tokens generated using `crypto.randomBytes(32).toString('hex')`
- 15-minute expiry prevents stale links from working
- One-time use: deleted immediately after verification

---

### PasswordResetToken Model

Stores password reset tokens for the "forgot password" flow.

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())

  @@map("password_reset_tokens")
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Unique identifier (CUID format) |
| `email` | String | Yes | Email address requesting password reset |
| `token` | String | Yes | Cryptographically secure random token (64 chars) |
| `expires` | DateTime | Yes | Token expiration timestamp (1 hour from creation) |
| `createdAt` | DateTime | Yes | Token creation timestamp |

**Constraints:**
- `token` must be unique
- Tokens expire after 1 hour
- Multiple tokens can exist for same email (latest is valid)
- Used tokens are deleted after successful password reset

**Security Notes:**
- Longer expiry (1 hour) than verification tokens (users may not be at their device)
- Email existence is never revealed in API responses
- Tokens are single-use and deleted after consumption

---

## 🚀 Database Setup

### Prerequisites

- PostgreSQL 12+ installed (local or cloud)
- Node.js 18+ installed
- Prisma CLI installed

### Local PostgreSQL Setup

#### Option 1: Install PostgreSQL Locally

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb securegate
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb securegate
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Option 2: Use Docker

```bash
# Run PostgreSQL in Docker
docker run --name securegate-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=securegate \
  -p 5432:5432 \
  -d postgres:15

# Check if running
docker ps
```

#### Option 3: Cloud Database

**Recommended services:**
- [Neon](https://neon.tech) - Free tier with 0.5GB storage
- [Supabase](https://supabase.com) - Free tier with PostgreSQL
- [Railway](https://railway.app) - Free tier for hobby projects
- [Render](https://render.com) - Free PostgreSQL databases

---

### Prisma Setup

1. **Install Prisma:**

```bash
npm install prisma --save-dev
npm install @prisma/client
```

2. **Initialize Prisma:**

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema file
- `.env` - Environment variables file

3. **Configure Database URL:**

Edit `.env.local`:

```env
# Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/securegate"

# Example with defaults
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/securegate"

# Cloud database (example from Neon)
DATABASE_URL="postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/securegate?sslmode=require"
```

4. **Create the Schema:**

Create or update `prisma/schema.prisma`:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())

  @@map("password_reset_tokens")
}
```

5. **Run Migrations:**

```bash
# Create and apply migration
npx prisma migrate dev --name init

# This will:
# 1. Create a new migration file
# 2. Apply it to your database
# 3. Generate Prisma Client
```

6. **Generate Prisma Client:**

```bash
npx prisma generate
```

---

## 🔄 Database Migrations

### Creating New Migrations

When you modify the schema:

```bash
# After editing schema.prisma
npx prisma migrate dev --name descriptive_name

# Examples:
npx prisma migrate dev --name add_user_role
npx prisma migrate dev --name add_login_attempts_tracking
```

### Applying Migrations in Production

```bash
# Apply migrations without prompts
npx prisma migrate deploy
```

### Resetting Database (Development Only)

```bash
# ⚠️ WARNING: This deletes all data
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Apply all migrations
# 4. Run seed script (if exists)
```

### Viewing Migration Status

```bash
npx prisma migrate status
```

---

## 🔍 Database Queries & Inspection

### Using Prisma Studio

Visual database browser:

```bash
npx prisma studio
```

Opens at `http://localhost:5555` - you can view and edit data directly.

---

### Common SQL Queries

#### Check if passwords are hashed

```sql
SELECT id, email, 
       LEFT(password, 10) as password_prefix,
       LENGTH(password) as password_length
FROM users;
```

**Expected result:**
- `password_prefix` should be `$2b$12$` or `$2a$12$` (bcrypt format)
- `password_length` should be 60 characters

---

#### View all users with verification status

```sql
SELECT 
  id,
  email,
  name,
  CASE 
    WHEN "emailVerified" IS NULL THEN 'Unverified'
    ELSE 'Verified'
  END as status,
  "createdAt",
  "emailVerified"
FROM users
ORDER BY "createdAt" DESC;
```

---

#### Find unverified users

```sql
SELECT email, "createdAt"
FROM users
WHERE "emailVerified" IS NULL
ORDER BY "createdAt" DESC;
```

---

#### View active verification tokens

```sql
SELECT 
  identifier as email,
  token,
  expires,
  CASE 
    WHEN expires > NOW() THEN 'Valid'
    ELSE 'Expired'
  END as status
FROM verification_tokens
ORDER BY expires DESC;
```

---

#### Clean up expired verification tokens

```sql
DELETE FROM verification_tokens
WHERE expires < NOW();
```

---

#### View password reset tokens

```sql
SELECT 
  email,
  token,
  expires,
  "createdAt",
  CASE 
    WHEN expires > NOW() THEN 'Valid'
    ELSE 'Expired'
  END as status
FROM password_reset_tokens
ORDER BY "createdAt" DESC;
```

---

#### Clean up expired reset tokens

```sql
DELETE FROM password_reset_tokens
WHERE expires < NOW();
```

---

#### User registration statistics

```sql
SELECT 
  DATE("createdAt") as registration_date,
  COUNT(*) as users_registered
FROM users
GROUP BY DATE("createdAt")
ORDER BY registration_date DESC;
```

---

#### Verification completion rate

```sql
SELECT 
  COUNT(*) as total_users,
  COUNT("emailVerified") as verified_users,
  ROUND(COUNT("emailVerified") * 100.0 / COUNT(*), 2) as verification_rate_percent
FROM users;
```

---

## 🔧 Prisma Client Usage in Code

### Initialize Prisma Client

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Why this pattern?**
- Prevents multiple Prisma Client instances in development (Next.js hot reload)
- Enables query logging in development
- Properly typed for TypeScript

---

### Common Database Operations

#### Create a new user

```typescript
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

const hashedPassword = await bcrypt.hash(password, 12)

const user = await prisma.user.create({
  data: {
    email,
    name,
    password: hashedPassword,
    emailVerified: null, // Not verified yet
  },
})
```

---

#### Find user by email

```typescript
const user = await prisma.user.findUnique({
  where: { email },
})

if (!user) {
  throw new Error('User not found')
}
```

---

#### Update user email verification

```typescript
await prisma.user.update({
  where: { email },
  data: {
    emailVerified: new Date(),
  },
})
```

---

#### Create verification token

```typescript
import crypto from 'crypto'

const token = crypto.randomBytes(32).toString('hex')
const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

await prisma.verificationToken.create({
  data: {
    identifier: email,
    token,
    expires,
  },
})
```

---

#### Verify email token

```typescript
const verificationToken = await prisma.verificationToken.findUnique({
  where: { token },
})

if (!verificationToken) {
  throw new Error('Invalid token')
}

if (verificationToken.expires < new Date()) {
  throw new Error('Token expired')
}

// Mark user as verified
await prisma.user.update({
  where: { email: verificationToken.identifier },
  data: { emailVerified: new Date() },
})

// Delete used token
await prisma.verificationToken.delete({
  where: { token },
})
```

---

#### Create password reset token

```typescript
const token = crypto.randomBytes(32).toString('hex')
const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

await prisma.passwordResetToken.create({
  data: {
    email,
    token,
    expires,
  },
})
```

---

#### Reset password

```typescript
const resetToken = await prisma.passwordResetToken.findUnique({
  where: { token },
})

if (!resetToken || resetToken.expires < new Date()) {
  throw new Error('Invalid or expired token')
}

const hashedPassword = await bcrypt.hash(newPassword, 12)

await prisma.user.update({
  where: { email: resetToken.email },
  data: { password: hashedPassword },
})

// Delete used token
await prisma.passwordResetToken.delete({
  where: { token },
})
```

---

## 🧹 Database Maintenance

### Scheduled Cleanup Tasks

Create a cleanup script `scripts/cleanup-tokens.ts`:

```typescript
import { prisma } from '@/lib/db'

async function cleanupExpiredTokens() {
  console.log('Starting token cleanup...')

  // Delete expired verification tokens
  const verificationResult = await prisma.verificationToken.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  })

  // Delete expired password reset tokens
  const resetResult = await prisma.passwordResetToken.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  })

  console.log(`Deleted ${verificationResult.count} expired verification tokens`)
  console.log(`Deleted ${resetResult.count} expired password reset tokens`)
}

cleanupExpiredTokens()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run it:

```bash
npx tsx scripts/cleanup-tokens.ts
```

Or add to `package.json`:

```json
{
  "scripts": {
    "cleanup": "tsx scripts/cleanup-tokens.ts"
  }
}
```

---

### Database Backups

#### Local Backup

```bash
# Backup
pg_dump securegate > backup_$(date +%Y%m%d).sql

# Restore
psql securegate < backup_20240315.sql
```

#### Production Backup

Most cloud providers (Neon, Supabase, Railway) handle automatic backups. Check your provider's documentation.

---

## 🔒 Security Best Practices

### 1. Connection String Security

❌ **Never do this:**
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://user:password@localhost:5432/db'
    }
  }
})
```

✅ **Always do this:**
```typescript
// Use environment variables
const prisma = new PrismaClient()
// DATABASE_URL is read from .env automatically
```

---

### 2. Password Storage

❌ **Never do this:**
```typescript
await prisma.user.create({
  data: {
    email,
    password: plainPassword, // ❌ Plain text!
  },
})
```

✅ **Always do this:**
```typescript
const hashedPassword = await bcrypt.hash(plainPassword, 12)
await prisma.user.create({
  data: {
    email,
    password: hashedPassword, // ✅ Hashed
  },
})
```

---

### 3. SQL Injection Protection

Prisma automatically prevents SQL injection through parameterized queries.

❌ **Raw queries (use with caution):**
```typescript
// Vulnerable if userInput is not sanitized
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`
```

✅ **Prisma queries (safe):**
```typescript
// Automatically parameterized
await prisma.user.findUnique({
  where: { email: userInput },
})
```

---

### 4. Database Access Control

- Use separate database users for different environments
- Production database should have restricted permissions
- Never use superuser accounts in application code
- Enable SSL/TLS for database connections in production

---

## 🐛 Troubleshooting

### "Can't reach database server"

**Symptoms:** `Error: Can't reach database server at localhost:5432`

**Solutions:**
1. Check if PostgreSQL is running: `pg_isready`
2. Verify connection string in `.env.local`
3. Check firewall settings
4. For cloud databases, verify IP whitelist

---

### "Unique constraint failed"

**Symptoms:** `Unique constraint failed on the fields: (email)`

**Cause:** Trying to create user with existing email

**Solution:**
```typescript
const existingUser = await prisma.user.findUnique({
  where: { email },
})

if (existingUser) {
  throw new Error('Email already registered')
}
```

---

### "Invalid prisma.user.xyz() invocation"

**Symptoms:** TypeScript errors when using Prisma Client

**Solution:**
```bash
# Regenerate Prisma Client after schema changes
npx prisma generate
```

---

### Schema and Database Out of Sync

**Symptoms:** Prisma complains schema doesn't match database

**Solution:**
```bash
# Reset database (development only)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [NextAuth Database Adapters](https://next-auth.js.org/adapters/prisma)
- [Bcrypt Best Practices](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns)

---

## 🔄 Schema Evolution Examples

### Adding a new field to User

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String
  emailVerified DateTime?
  role          String    @default("user") // New field
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

Run migration:
```bash
npx prisma migrate dev --name add_user_role
```

---

### Adding login attempt tracking

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String
  emailVerified DateTime?
  loginAttempts Int       @default(0)      // Track failed attempts
  lockedUntil   DateTime?                  // Lockout timestamp
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

---

**Last Updated:** [Date]  
**Maintained by:** SecureGate Development Team