# Authentication Setup Guide

This guide explains the authentication system implemented for ProjectHub.

## Overview

The authentication foundation includes:
- NextAuth.js v5 with Prisma adapter
- Email/Password authentication with bcrypt
- Google OAuth provider
- JWT session strategy (7 days)
- Two-Factor Authentication (2FA) support
- Protected route middleware
- Account deletion tracking

## Files Created

### Core Authentication
- `src/lib/auth.ts` - NextAuth configuration with providers and callbacks
- `src/lib/auth-helpers.ts` - Helper functions for password hashing, 2FA, etc.
- `src/middleware.ts` - Route protection middleware
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API route handler
- `src/types/next-auth.d.ts` - TypeScript type definitions

## Setup Instructions

### 1. Generate Prisma Client

Before running the application, generate the Prisma Client:

```bash
npx prisma generate
```

### 2. Setup Database

Run Prisma migrations to create the database schema:

```bash
# Create a new migration (if not already done)
npx prisma migrate dev --name init

# Or apply existing migrations
npx prisma migrate deploy
```

### 3. Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/projecthub?schema=public

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Setup Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

## Authentication Features

### Email/Password Authentication

Users can sign up and sign in with email and password:

```typescript
// Sign in with credentials
signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  redirect: true,
  callbackUrl: "/dashboard",
});
```

Passwords are hashed using bcrypt with 12 salt rounds.

### Google OAuth

Users can sign in with their Google account:

```typescript
// Sign in with Google
signIn("google", {
  redirect: true,
  callbackUrl: "/dashboard",
});
```

The system allows linking OAuth accounts to existing email accounts.

### Two-Factor Authentication (2FA)

The system supports TOTP-based 2FA:

**Enable 2FA:**
```typescript
import { generateTotpSecret, enableTwoFactor } from "@/lib/auth-helpers";

// Generate secret and QR code
const { secret, qrCodeUrl } = generateTotpSecret(user.email);

// Show QR code to user for scanning with authenticator app

// Enable 2FA after user confirms setup
await enableTwoFactor(userId, secret);
```

**Sign in with 2FA:**
```typescript
signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  totpCode: "123456", // 6-digit code from authenticator app
});
```

**Recovery Codes:**
```typescript
import { generateRecoveryCodes } from "@/lib/auth-helpers";

// Generate 10 recovery codes
const codes = await generateRecoveryCodes(userId, 10);

// Display codes to user for safe storage
```

### Session Management

Sessions use JWT strategy with 7-day expiration:

```typescript
// Get current user session (server-side)
import { getCurrentUser, requireAuth } from "@/lib/auth-helpers";

// Get user (returns null if not authenticated)
const user = await getCurrentUser();

// Require authentication (throws error if not authenticated)
const user = await requireAuth();
```

**Session Data:**
```typescript
{
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    totpEnabled?: boolean;
    accountPendingDeletion?: boolean;
  }
}
```

### Protected Routes

The middleware automatically protects routes:

**Protected Routes (require authentication):**
- `/dashboard/*`
- `/projects/*`
- `/settings/*`
- `/api/projects/*`
- `/api/transcriptions/*`
- `/api/audio/*`
- `/api/settings/*`

**Public Auth Routes (redirect to dashboard if authenticated):**
- `/auth/signin`
- `/auth/signup`
- `/auth/forgot-password`

**Always Public:**
- `/` (homepage)
- `/auth/error`
- `/auth/verify-request`
- `/api/auth/*` (NextAuth endpoints)

### Account Deletion Protection

If a user schedules their account for deletion:
- They can still access `/settings/*` to cancel deletion
- All other protected routes redirect to `/settings/account` with a warning
- The session includes `accountPendingDeletion: true`

## Helper Functions Reference

### Password Helpers

```typescript
import { hashPassword, verifyPassword } from "@/lib/auth-helpers";

// Hash a password
const hash = await hashPassword("password123");

// Verify password
const isValid = await verifyPassword("password123", hash);
```

### 2FA Helpers

```typescript
import {
  generateTotpSecret,
  verifyTotpCode,
  isTwoFactorEnabled,
  enableTwoFactor,
  disableTwoFactor,
  generateRecoveryCodes,
  verifyRecoveryCode,
} from "@/lib/auth-helpers";

// Check if user has 2FA enabled
const enabled = await isTwoFactorEnabled(userId);

// Verify TOTP code
const isValid = verifyTotpCode(secret, "123456");

// Verify recovery code
const isValid = await verifyRecoveryCode(userId, "ABC12345");
```

## Next Steps

### Create Authentication Pages

You'll need to create UI pages for:

1. **Sign In Page** (`/auth/signin`)
   - Email/password form
   - Google OAuth button
   - 2FA code input (if enabled)

2. **Sign Up Page** (`/auth/signup`)
   - Email/password registration form
   - Email verification flow

3. **Dashboard** (`/dashboard`)
   - Protected page showing user info
   - Sign out button

4. **Settings** (`/settings/account`)
   - Enable/disable 2FA
   - Generate recovery codes
   - Account deletion

### Example: Protected API Route

```typescript
// src/app/api/projects/route.ts
import { requireAuth } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireAuth();

    // Fetch user's projects
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
```

### Example: Protected Server Component

```typescript
// src/app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <h1>Welcome, {user.name || user.email}</h1>
      {user.totpEnabled && <p>2FA is enabled</p>}
    </div>
  );
}
```

## Security Best Practices

1. **HTTPS in Production**: Always use HTTPS in production
2. **Environment Variables**: Never commit `.env.local` to version control
3. **Password Requirements**: Implement password strength validation on the frontend
4. **Rate Limiting**: Add rate limiting to auth endpoints to prevent brute force attacks
5. **Email Verification**: Implement email verification before allowing full access
6. **CSRF Protection**: NextAuth includes CSRF protection by default

## Troubleshooting

### Common Issues

**"No secret provided" error:**
- Make sure `NEXTAUTH_SECRET` is set in `.env.local`

**"Prisma Client not found" error:**
- Run `npx prisma generate`

**Google OAuth redirect error:**
- Check that the redirect URI is correctly configured in Google Cloud Console
- Ensure `NEXTAUTH_URL` matches your application URL

**2FA not working:**
- Verify the system clock is synchronized (TOTP is time-based)
- Check that the secret is correctly stored in the database

## Testing

### Manual Testing Checklist

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with Google OAuth
- [ ] Enable 2FA
- [ ] Sign in with 2FA code
- [ ] Use recovery code
- [ ] Access protected routes (should require auth)
- [ ] Access public routes (should work without auth)
- [ ] Sign out

## Production Considerations

Before deploying to production:

1. Set `NEXTAUTH_URL` to your production domain
2. Generate a strong `NEXTAUTH_SECRET`
3. Configure production database URL
4. Add production Google OAuth redirect URI
5. Enable email verification
6. Add rate limiting middleware
7. Set up error tracking (e.g., Sentry)
8. Enable security headers
9. Review and test all authentication flows

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [OTPAuth Library](https://github.com/hectorm/otpauth)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
