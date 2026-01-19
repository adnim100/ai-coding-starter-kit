# ProjectHub - Setup Guide

## Quick Start

### 1. Database Setup

**Option A: Supabase (Recommended)**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy Database URL from Settings → Database → Connection String (URI)
4. Update `.env.local`:
   ```
   DATABASE_URL="your-postgres-url"
   NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL
# Create database
createdb projecthub

# Update .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/projecthub"
```

### 2. Initialize Database

```bash
npm run db:push
```

This will create all tables according to the Prisma schema.

### 3. Setup Authentication

**Generate NextAuth Secret:**
```bash
openssl rand -base64 32
```

**Google OAuth (Optional):**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID & Secret to `.env.local`

**Update `.env.local`:**
```
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
```

### 4. Setup Redis (for Queue System)

**Option A: Local Redis**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Option B: Upstash (Cloud Redis)**
1. Create account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy URL to `.env.local`:
   ```
   REDIS_URL="rediss://default:xxx@xxx.upstash.io:6379"
   ```

### 5. Setup Storage

**Option A: Supabase Storage (Recommended)**
1. In Supabase Dashboard → Storage
2. Create bucket: `audio-files`
3. Set to Public
4. Done! (uses existing Supabase credentials)

**Option B: AWS S3**
1. Create S3 bucket
2. Enable CORS
3. Add to `.env.local`:
   ```
   AWS_ACCESS_KEY_ID="xxx"
   AWS_SECRET_ACCESS_KEY="xxx"
   AWS_S3_BUCKET="projecthub-audio"
   AWS_REGION="eu-central-1"
   ```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. (Optional) Setup Email Service

For password reset emails, configure one:

**SendGrid:**
```
EMAIL_FROM="noreply@yourapp.com"
EMAIL_API_KEY="SG.xxx"
```

**Resend:**
```
EMAIL_FROM="noreply@yourapp.com"
RESEND_API_KEY="re_xxx"
```

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Database

Use Supabase Production or:
- Neon
- Railway
- AWS RDS

### Redis

Use Upstash or:
- Railway Redis
- AWS ElastiCache

### Worker (BullMQ)

Deploy worker separately on:
- Railway
- Render
- AWS ECS

```bash
# Worker command:
tsx src/workers/transcription-worker.ts
```

## Troubleshooting

### Prisma errors

```bash
npm run db:generate
npx prisma db push --force-reset  # WARNING: deletes all data
```

### Next Auth errors

Make sure:
- `NEXTAUTH_SECRET` is set
- `NEXTAUTH_URL` matches your domain
- Google OAuth redirect URI is correct

### Redis connection errors

Test connection:
```bash
redis-cli -u $REDIS_URL ping
```

Should return `PONG`

## Environment Variables Checklist

Required:
- [x] `DATABASE_URL`
- [x] `NEXTAUTH_SECRET`
- [x] `NEXTAUTH_URL`
- [x] `REDIS_URL`

Optional (but recommended):
- [ ] `GOOGLE_CLIENT_ID` (for OAuth)
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `EMAIL_FROM` (for password reset)
- [ ] `EMAIL_API_KEY`
- [ ] `SENTRY_DSN` (for error tracking)

## Next Steps

1. Register first user at `/register`
2. Setup 2FA
3. Create first project
4. Add API keys for transcription providers in Settings
5. Upload audio & start transcription!

## Provider API Keys

To use transcription providers, add your API keys in the app (Settings → API Keys):

- **OpenAI Whisper**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **AssemblyAI**: [assemblyai.com/app](https://www.assemblyai.com/app)
- **Deepgram**: [console.deepgram.com](https://console.deepgram.com)
- **Google Cloud**: [console.cloud.google.com](https://console.cloud.google.com)
- **AWS Transcribe**: [aws.amazon.com/console](https://aws.amazon.com/console)
- **Others**: Check respective provider documentation

## Support

For issues, check:
- Feature specs in `/features` folder
- Architecture docs in `ARCHITECTURE.md`
- Plan file in `.claude/plans/`
