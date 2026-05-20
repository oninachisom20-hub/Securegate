# SecureGate — Reflection & Engineering Analysis
 **Name:** Onina Chisom 
**Cohort:** Design to MVP Bootcamp 
*

What I Built

I built SecureGate, a full authentication system that handles user sign-up, login, email verification, password reset, and protected route access. It uses NextAuth for session management, Prisma with PostgreSQL for data persistence, bcrypt for password hashing, and Resend for transactional emails. I also implemented rate limiting using Upstash Redis to protect against brute-force attacks and ensured all sensitive flows are secured with token expiry and validation logic.


 Part 2 — What Surprised Me

The hardest part was not building authentication itself, but making token-based flows behave correctly in real-world conditions. I initially assumed that setting an expiry timestamp on email verification and password reset tokens would be enough. However, I discovered that expired tokens still exist in the database and can become a security risk if not explicitly checked and deleted after use. I had to implement strict expiry validation and immediate token cleanup after successful verification, which taught me that security is not passive—it must be actively enforced at every access point.


Part 3 — Engineering Laws Quiz

 Q1 — Murphy's Law
**Code reference:** `src/app/api/auth/signin/route.ts` lines 15-25, `src/app/api/auth/forgot-password/route.ts` lines 10-20  

My Answer:  
Murphy's Law forced me to assume that users will try to break or misuse every authentication flow. In my login route, I implemented rate limiting using Upstash Redis to block repeated failed login attempts. Without this, an attacker could brute-force passwords endlessly.

In my forgot-password flow, I also return the same success message whether or not the email exists. Without this, attackers could test thousands of emails and build a valid user list through email enumeration.

**What goes wrong if ignored:**  
Without rate limiting, accounts become vulnerable to automated password-guessing attacks. Without uniform responses in password reset, attackers can discover valid users and target them for phishing or credential stuffing attacks.



### Q2 — Law of Leaky Abstractions
**Code reference:** `src/app/api/auth/[...nextauth]/route.ts` lines 25-45  

My Answer:  
NextAuth is the abstraction that leaked in SecureGate. It handles sessions and authentication flow automatically, but it does not understand my business rule that users must verify their email before logging in.

I had to manually inject a check inside the `authorize()` callback:

``` ts
if (!user.emailVerified) return null
The abstraction also leaked when I needed to expose emailVerified on the session object. I had to modify both JWT and session callbacks because NextAuth does not automatically expose custom database fields.

What goes wrong if ignored:
If I treated NextAuth as fully automatic, unverified users could access protected routes, and custom user fields would silently disappear from the session object, causing broken authorization logic.

Q3 — YAGNI
Code reference: prisma/schema.prisma, src/app/api/auth/[...nextauth]/route.ts

My Answer:
SecureGate intentionally does not include OAuth login, multi-factor authentication, or role-based access control. These features would increase complexity without being required for the core authentication system being built.

If I added them too early, I would introduce unnecessary schema changes, authentication branches, and security flows that are not needed for email/password authentication.
Later, if required, OAuth can be added through NextAuth providers, and RBAC can be introduced by extending the User model with a role field.

What goes wrong if ignored:
Adding unnecessary features early would slow development, increase bugs, and make the authentication system harder to debug and maintain without improving the core functionality required.

Q4 — Kerckhoffs's Principle
Code reference: src/app/api/auth/signup/route.ts lines 10-20
My Answer:
SecureGate uses bcrypt with automatic salt generation when hashing passwords. A salt is random data added to a password before hashing, ensuring that identical passwords produce different hashes.

If I used SHA-256 instead, passwords would be hashed quickly without built-in salt protection, making them vulnerable to rainbow table and brute-force attacks.
Bcrypt is intentionally slow (12 salt rounds), which makes large-scale password cracking impractical.
What goes wrong if ignored:
Without salting and slow hashing, attackers with a leaked database could instantly recover weak passwords and compromise multiple accounts using precomputed hash attacks.

Q5 — Postel's Law + Security by Design
Code reference: src/app/api/auth/forgot-password/route.ts lines 10-30
My Answer:
The forgot-password endpoint always returns the same response whether the email exists or not. This prevents attackers from discovering which emails are registered in the system.
If the response differed, attackers could enumerate valid users by analyzing system responses.

What goes wrong if ignored:
Email enumeration would allow attackers to build a target list of real users for phishing, credential stuffing, or social engineering attacks.

Q6 — Boy Scout Rule
Code reference: src/lib/email.ts
My Answer:
I found duplicated email-sending logic in both the signup and password reset routes. I refactored it into a reusable sendEmail() utility function.
This reduced duplication and centralized email configuration.

What goes wrong if ignored:
Without refactoring, any future change to email logic would require editing multiple files, increasing the risk of inconsistency and bugs.

Q7 — Gall's Law
Code reference: Project evolution (auth → verification → reset → rate limit)
My Answer:
SecureGate was built in stages, starting with simple authentication before adding email verification, password reset, and rate limiting.

Each feature was built only after the previous one worked correctly. This prevented debugging complexity and ensured system stability at every stage.

What goes wrong if ignored:
If all features were built at once, debugging would become impossible because multiple broken layers would interact at the same time without a known working baseline.

Q8 — Leaky ORM Abstraction (Prisma)
Code reference: prisma/schema.prisma
My Answer:
Prisma hides SQL complexity, but it leaks when dealing with database constraints and NULL behavior.
For example, optional fields in Prisma (String?) map to SQL NULL, but Prisma still requires careful handling when filtering or querying these values.
Also, Prisma schema constraints generate multiple database indexes that are not obvious from the schema alone.
What goes wrong if ignored:
If I assume Prisma fully abstracts SQL, I could create inefficient queries, misunderstand constraints, or introduce unexpected database behavior in production.

Q9 — Zawinski's Law
Code reference: src/lib/rate-limit.ts
My Answer:
Rate limiting is not part of Next.js or NextAuth, so I implemented it using Upstash Redis.
This shows separation of concerns: authentication handles identity, while rate limiting handles abuse prevention.
Zawinski's Law warns that systems naturally expand in scope, so I deliberately kept SecureGate focused only on authentication.
What goes wrong if ignored:
Without discipline, SecureGate could slowly expand into a monolithic system handling payments, messaging, and other unrelated features, making it harder to maintain.

Q10 — Principle of Least Surprise
Code reference: src/app/login/page.tsx
My Answer:
The login form displays a single error message: "Invalid email or password."
This is expected by users because it clearly indicates a failed login without exposing whether the email or password was incorrect.
What goes wrong if ignored:
If error messages were too specific, they would leak sensitive information. If too vague, users would be confused and frustrated.

Q11 — Middleware Authentication Flow
Code reference: middleware.ts lines 5-20

My Answer:
The middleware checks for a valid session token before allowing access to /dashboard. If the cookie is missing or invalid, the user is redirected to /login.
If a user deletes their cookie manually, the middleware treats them as unauthenticated and blocks access immediately.
What goes wrong if ignored:
Without middleware protection, unauthorized users could access protected routes or trigger runtime errors due to missing session data.

Q12 — Leaked NEXTAUTH_SECRET
Code reference: .env.local

My Answer:
If NEXTAUTH_SECRET is leaked, attackers can forge valid JWT sessions and impersonate users.
The solution is immediate secret rotation, environment variable updates, redeployment, and forcing session invalidation.
What goes wrong if ignored:
Attackers could permanently access user accounts without passwords until the secret is rotated.

Q13 — Conway's Law
Code reference: src/app/, src/lib/, src/components/
My Answer:
My folder structure reflects how I think about system boundaries: authentication logic in API routes, UI in components, shared logic in lib, and protected pages in dashboard.
This separation mirrors how different responsibilities are divided conceptually in a full-stack system.

What goes wrong if ignored:
Without structure, the codebase becomes difficult to navigate, and debugging becomes slower because unrelated logic is mixed together.

Q14 — Technical Debt
Code reference: src/lib/tokens.ts (expiry logic)
My Answer:
I used a hardcoded token expiry value:
const TOKEN_EXPIRY = 15 * 60 * 1000
This creates rigidity because changing security policies requires code changes instead of configuration updates.
Refactored version:
const TOKEN_EXPIRY_MINUTES =
  parseInt(process.env.TOKEN_EXPIRY_MINUTES || "15")

const TOKEN_EXPIRY =
  TOKEN_EXPIRY_MINUTES * 60 * 1000

What goes wrong if ignored:
Scaling across environments becomes harder, and future changes to security policies require code deployments instead of simple configuration updates.

Q15 — Payments Integration (Flutterwave)
Code reference: SecureGate authentication system design
My Answer:
Adding payments introduces higher stakes where all security principles become more critical.
Murphy's Law: webhook failures and duplicate payments must be handled
Kerckhoffs's Principle: never store card data, rely on secure provider APIs
Idempotency: prevents duplicate transactions
Postel's Law: avoid leaking payment failure details
Technical Debt: cannot delay fixing financial logic issues

What goes wrong if ignored:
Payment bugs could result in financial loss, duplicate charges, or users gaining access without payment confirmation.

Part 4 — One Thing I Would Refactor
One technical debt in SecureGate is hardcoded expiry logic in token handling.
Current:
const TOKEN_EXPIRY = 15 * 60 * 1000
This is inflexible and requires code changes for any adjustment.
Refactored:
const TOKEN_EXPIRY_MINUTES =
  parseInt(process.env.TOKEN_EXPIRY_MINUTES || "15")

const TOKEN_EXPIRY =
  TOKEN_EXPIRY_MINUTES * 60 * 1000
This improves flexibility, environment configuration, and production scalability.

Part 5 — How This Changes How I Build
I now understand that authentication systems are not just about making features work, but about anticipating failure cases before they happen. I also learned that abstractions like NextAuth and Prisma reduce complexity but require an understanding of what happens underneath when they fail. The most important shift for me is realizing that security decisions are not optional—they must be built into the system from the first line of code, not added later.
