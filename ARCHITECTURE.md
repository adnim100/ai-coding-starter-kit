# ProjectHub - System-Architektur-Vorschlag

## Übersicht

ProjectHub ist eine Full-Stack Web-Anwendung für Multi-Provider Audio-Transkriptions-Vergleiche. Diese Architektur fokussiert auf Skalierbarkeit, Security und gute Developer-Experience.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI-Library**: React 18+
- **Styling**: Tailwind CSS + Headless UI (oder shadcn/ui)
- **State-Management**:
  - Server-State: TanStack Query (React Query)
  - Client-State: Zustand (lightweight, einfacher als Redux)
- **Forms**: React Hook Form + Zod (Validation)
- **Audio-Player**: Howler.js
- **File-Upload**: react-dropzone + tus (resumable uploads)
- **Diff-View**: diff-match-patch
- **Charts/Analytics**: Recharts oder Chart.js

### Backend
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Next.js API Routes (oder separates Express.js Backend)
- **Database**: PostgreSQL 15+ (via Supabase)
- **ORM**: Prisma oder Drizzle
- **Authentication**: NextAuth.js (oder Supabase Auth)
  - Providers: Email/Password, Google OAuth
  - 2FA: otpauth (TOTP)
- **Queue-System**: BullMQ (Redis-basiert)
- **Caching**: Redis (für Session, Queue, Rate-Limiting)

### Cloud-Services
- **Database**: Supabase PostgreSQL
- **Storage**: AWS S3 (oder Supabase Storage)
- **Email**: SendGrid, Resend, oder AWS SES
- **Hosting**: Vercel (Frontend + Serverless Functions)
- **Queue-Worker**: Separate Node.js Process (Render, Railway, oder AWS ECS)

### DevOps & Monitoring
- **Version-Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Error-Tracking**: Sentry
- **Logging**: Pino (strukturierte Logs)
- **Monitoring**: Vercel Analytics + Sentry Performance
- **Testing**:
  - Unit: Vitest
  - E2E: Playwright
  - API: Supertest

## System-Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  Next.js Frontend (React + TypeScript + Tailwind CSS)       │
└────────────┬────────────────────────────────────────────────┘
             │ HTTPS
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Edge Network)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Next.js App Router (SSR + API Routes)         │  │
│  │  - Authentication (NextAuth.js)                       │  │
│  │  - API Endpoints (/api/...)                           │  │
│  │  - Server-Side Rendering                              │  │
│  └───────────┬───────────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────────┘
               │
               ├──────────────┬──────────────┬─────────────────┐
               ▼              ▼              ▼                 ▼
     ┌─────────────┐  ┌──────────────┐  ┌─────────┐  ┌────────────────┐
     │  Supabase   │  │     Redis    │  │  AWS S3 │  │  Email Service │
     │ PostgreSQL  │  │   (Upstash)  │  │ Storage │  │   (SendGrid)   │
     │             │  │ - Queue      │  │ - Audio │  │  - Auth Emails │
     │ - Users     │  │ - Cache      │  │ - Images│  │  - Notifs      │
     │ - Projects  │  │ - Sessions   │  │         │  │                │
     │ - Transcr.  │  │ - Rate Limit │  │         │  │                │
     └─────────────┘  └──────────────┘  └─────────┘  └────────────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │  Queue Workers  │
                      │   (BullMQ)      │
                      │ - Transcription │
                      │ - Email Sending │
                      │ - File Cleanup  │
                      └────────┬────────┘
                               │
                ┌──────────────┼──────────────┬─────────────┐
                ▼              ▼              ▼             ▼
         ┌──────────┐   ┌──────────┐  ┌──────────┐ ┌──────────┐
         │ OpenAI   │   │AssemblyAI│  │  Google  │ │   AWS    │
         │ Whisper  │   │          │  │Speech2Txt│ │Transcribe│
         └──────────┘   └──────────┘  └──────────┘ └──────────┘
         ┌──────────┐   ┌──────────┐  ┌──────────┐ ┌──────────┐
         │ElevenLabs│   │ Deepgram │  │  Gladia  │ │Speechm.  │
         └──────────┘   └──────────┘  └──────────┘ └──────────┘
```

## Database-Schema (Prisma-Style)

```prisma
// User & Authentication
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  passwordHash      String?   // null für OAuth-only Accounts
  name              String?
  profileImageUrl   String?

  // 2FA
  totpSecret        String?   @encrypted
  totpEnabled       Boolean   @default(false)
  recoveryCodes     RecoveryCode[]

  // OAuth
  oauthProviders    OAuthProvider[]

  // Relations
  projects          Project[]
  apiKeys           ApiKey[]
  sessions          Session[]

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Account Deletion
  scheduledDeletion DateTime?
  deletionDays      Int       @default(30)
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token        String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}

model RecoveryCode {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  codeHash  String   // bcrypt hashed
  used      Boolean  @default(false)
  usedAt    DateTime?
  usedIp    String?
  createdAt DateTime @default(now())
}

model OAuthProvider {
  id           String @id @default(cuid())
  userId       String
  user         User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider     String // "google"
  providerUserId String
  accessToken  String?
  refreshToken String?

  @@unique([provider, providerUserId])
}

// Projects & Audio
model Project {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  description String?
  status      ProjectStatus @default(PENDING)
  tags        String[]    // Array of tags
  archived    Boolean     @default(false)

  audioFiles  AudioFile[]
  jobs        TranscriptionJob[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum ProjectStatus {
  PENDING      // Erstellt, noch keine Jobs
  PROCESSING   // Mind. 1 Job läuft
  COMPLETED    // Alle Jobs abgeschlossen
  FAILED       // Alle Jobs fehlgeschlagen
  PARTIAL      // Manche Jobs erfolgreich, manche fehlgeschlagen
}

model AudioFile {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  fileName    String
  fileSize    Int      // Bytes
  duration    Float?   // Sekunden
  format      String   // "mp3", "wav", etc.
  audioType   AudioType // MONO, STEREO

  storageUrl  String   // S3 URL
  retentionDays Int    @default(30)
  deletionDate DateTime? // Upload + RetentionDays

  createdAt   DateTime @default(now())
}

enum AudioType {
  MONO
  STEREO
}

// Transcription
model TranscriptionJob {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  audioFileId String
  provider    Provider

  status      JobStatus @default(QUEUED)

  // Configuration
  language    String?  // "de", "en", "auto"
  features    Json     // { diarization: true, timestamps: true, confidence: true }
  modelName   String?  // Provider-specific model

  // Results
  transcript  Transcript?

  // Metadata
  startedAt   DateTime?
  completedAt DateTime?
  duration    Int?     // Processing-Zeit in ms
  cost        Float?   // USD

  // Error-Handling
  errorType   String?
  errorMessage String?
  retryCount  Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Provider {
  OPENAI_WHISPER
  ASSEMBLYAI
  GOOGLE_SPEECH
  AWS_TRANSCRIBE
  ELEVENLABS
  DEEPGRAM
  GLADIA
  SPEECHMATICS
  OPENROUTER
}

enum JobStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}

model Transcript {
  id          String   @id @default(cuid())
  jobId       String   @unique
  job         TranscriptionJob @relation(fields: [jobId], references: [id], onDelete: Cascade)

  fullText    String   @db.Text
  language    String?
  wordCount   Int?
  avgConfidence Float?

  segments    TranscriptSegment[]
  comments    Comment[]

  createdAt   DateTime @default(now())
}

model TranscriptSegment {
  id           String   @id @default(cuid())
  transcriptId String
  transcript   Transcript @relation(fields: [transcriptId], references: [id], onDelete: Cascade)

  startTime    Float    // Sekunden
  endTime      Float
  text         String   @db.Text
  confidence   Float?
  speaker      String?  // "Speaker 1", "Speaker 2"

  orderIndex   Int      // Reihenfolge der Segments
}

model Comment {
  id           String   @id @default(cuid())
  transcriptId String
  transcript   Transcript @relation(fields: [transcriptId], references: [id], onDelete: Cascade)
  userId       String

  segmentId    String?  // Optional: Kommentar zu spezifischem Segment
  timestamp    Float?   // Optional: Timestamp im Audio
  selectedText String?  // Original-Text der markiert wurde

  content      String   @db.Text

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// API-Keys (User-spezifisch)
model ApiKey {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider  Provider
  keyValue  String   @encrypted // AES-256 encrypted

  isValid   Boolean  @default(true)
  lastTested DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, provider])
}
```

## API-Endpunkt-Design

### Authentication
```
POST   /api/auth/register             - Email/Passwort Registrierung
POST   /api/auth/verify-email         - Email-Verifizierung
POST   /api/auth/login                - Login
POST   /api/auth/logout               - Logout
POST   /api/auth/forgot-password      - Passwort-Reset anfordern
POST   /api/auth/reset-password       - Neues Passwort setzen
GET    /api/auth/session              - Session-Info abrufen

POST   /api/auth/oauth/google         - Google OAuth Start
GET    /api/auth/oauth/callback       - OAuth Callback

POST   /api/auth/2fa/setup            - 2FA einrichten (QR-Code generieren)
POST   /api/auth/2fa/verify           - 2FA-Code verifizieren
POST   /api/auth/2fa/reset            - 2FA zurücksetzen
POST   /api/auth/2fa/recovery-codes   - Neue Recovery-Codes generieren
```

### Projects
```
GET    /api/projects                  - Alle Projekte (mit Filter/Sort)
POST   /api/projects                  - Neues Projekt erstellen
GET    /api/projects/:id              - Projekt-Details
PATCH  /api/projects/:id              - Projekt aktualisieren (Name, Tags)
DELETE /api/projects/:id              - Projekt löschen
POST   /api/projects/:id/archive      - Projekt archivieren
```

### Audio Upload
```
POST   /api/projects/:id/upload       - Upload-URL generieren (Presigned S3)
POST   /api/projects/:id/audio        - Audio-File-Metadaten speichern (nach Upload)
DELETE /api/audio/:id                 - Audio-File löschen
```

### Transcription
```
POST   /api/projects/:id/transcribe   - Transkriptions-Jobs starten
GET    /api/jobs/:id                  - Job-Status abrufen
DELETE /api/jobs/:id                  - Job abbrechen
GET    /api/transcripts/:id           - Transkript abrufen
```

### API-Keys
```
GET    /api/api-keys                  - Alle gespeicherten API-Keys (masked)
POST   /api/api-keys                  - API-Key hinzufügen
PUT    /api/api-keys/:provider        - API-Key aktualisieren
DELETE /api/api-keys/:provider        - API-Key löschen
POST   /api/api-keys/:provider/test   - API-Key testen
```

### Comments
```
GET    /api/transcripts/:id/comments  - Alle Kommentare für Transkript
POST   /api/transcripts/:id/comments  - Kommentar hinzufügen
PATCH  /api/comments/:id              - Kommentar editieren
DELETE /api/comments/:id              - Kommentar löschen
```

### Export
```
POST   /api/projects/:id/export       - Export starten (TXT, JSON, CSV, PDF)
GET    /api/exports/:id               - Export-Status/Download
```

### User-Settings
```
GET    /api/user/profile              - User-Profil
PATCH  /api/user/profile              - Profil aktualisieren
POST   /api/user/change-email         - Email ändern (mit Verifizierung)
POST   /api/user/change-password      - Passwort ändern
DELETE /api/user/account              - Account zur Löschung vormerken
POST   /api/user/restore-account      - Account wiederherstellen
```

## Queue-System (BullMQ)

### Queue-Types
1. **transcription-queue**: Transkriptions-Jobs
2. **email-queue**: Email-Versand (Auth-Emails, Notifications)
3. **cleanup-queue**: File-Deletion, Account-Deletion

### Worker-Implementation
```typescript
// workers/transcription-worker.ts
import { Worker } from 'bullmq';
import { transcriptionService } from './services/transcription';

const worker = new Worker('transcription-queue', async (job) => {
  const { jobId, provider, audioFileUrl, config } = job.data;

  try {
    // API-Request an Provider
    const result = await transcriptionService.transcribe(
      provider,
      audioFileUrl,
      config
    );

    // Speichere Transkript in DB
    await db.transcript.create({
      jobId,
      fullText: result.text,
      segments: result.segments,
      // ...
    });

    // Update Job-Status
    await db.transcriptionJob.update({
      where: { id: jobId },
      data: { status: 'COMPLETED', completedAt: new Date() }
    });

    return { success: true };
  } catch (error) {
    // Error-Handling mit Retry-Logic
    throw error; // BullMQ handled Retries automatisch
  }
}, {
  connection: redisConnection,
  concurrency: 5, // 5 Jobs parallel
});
```

## Security-Konzept

### Authentication & Authorization
- **Session-Tokens**: 256-bit random, stored in Redis (7 Tage TTL)
- **Password-Hashing**: bcrypt (12 rounds)
- **2FA**: TOTP (RFC 6238), 30s time-step, ±1 window
- **API-Keys**: AES-256-GCM encrypted at-rest

### Rate-Limiting
```typescript
// Beispiel mit Redis
const limits = {
  'auth:login': { points: 5, duration: 900 },       // 5 Versuche / 15 Min
  'auth:register': { points: 3, duration: 3600 },   // 3 Versuche / 1 Std
  'api:upload': { points: 10, duration: 3600 },     // 10 Uploads / 1 Std
  'api:transcription': { points: 100, duration: 86400 } // 100 Jobs / Tag
};
```

### Data-Protection
- **Encryption at-Rest**: S3 SSE-S256, Database TDE
- **Encryption in-Transit**: HTTPS-only, TLS 1.3
- **API-Key-Masking**: Logs/Errors zeigen niemals volle API-Keys
- **GDPR-Compliance**: Data-Export, Account-Deletion, Retention-Policies

## Deployment-Strategie

### Environments
1. **Development**: Localhost + Supabase Dev Project
2. **Staging**: Vercel Preview Deployments + Supabase Staging
3. **Production**: Vercel Production + Supabase Production

### CI/CD-Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:e2e

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions/deploy@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Environment-Variables
```env
# .env.example
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
AWS_S3_BUCKET=projecthub-audio-files
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://projecthub.com

SENDGRID_API_KEY=...

SENTRY_DSN=...
```

## Skalierungs-Strategie

### Horizontale Skalierung
- **Frontend**: Vercel Edge Network (automatisch skaliert)
- **API**: Vercel Serverless Functions (auto-scale)
- **Workers**: Mehrere Worker-Instanzen (Docker-Container)
- **Database**: Supabase (managed, auto-scale)
- **Redis**: Upstash (managed, auto-scale)

### Performance-Optimierung
- **CDN**: Vercel Edge für statische Assets
- **Image-Optimization**: Next.js Image-Component
- **Code-Splitting**: Next.js automatisches Code-Splitting
- **Database-Queries**: Prisma Query-Optimization, Eager-Loading
- **Caching**: Redis-Cache für häufige Queries (z.B. User-Session)

### Cost-Optimization
- **S3 Lifecycle-Policies**: Auto-Delete nach Retention-Period
- **Database-Cleanup**: Cron-Job löscht alte Sessions, gelöschte Accounts
- **Queue-Optimization**: Batch-Processing wo möglich

## Monitoring & Observability

### Metrics to Track
- **Performance**: API-Response-Times (P50, P95, P99)
- **Errors**: Error-Rate pro Endpoint, Provider-API-Fehler
- **Business**: Anzahl Transkriptions-Jobs, Provider-Nutzung
- **User**: Active-Users, Registrations, Churn

### Logging-Strategy
```typescript
// Strukturierte Logs mit Pino
logger.info({
  event: 'transcription.started',
  jobId: '123',
  provider: 'openai-whisper',
  userId: 'abc',
  audioFileId: 'xyz'
});
```

### Alerts
- Error-Rate > 5% → Slack/Email-Alert
- Provider-API down → Pagerduty
- Queue-Worker down → Auto-Restart + Alert

## Migration-Plan (für Zukunft)

### Phase 1: MVP (PROJ-1 bis PROJ-9)
- User-Auth (Email, Google OAuth, 2FA)
- Audio-Upload
- Multi-Provider Transkription
- Vergleichs-UI
- Projekt-Management

### Phase 2: Advanced Features
- **PROJ-10**: Team-Features (User-Rollen, Projekt-Sharing)
- **PROJ-11**: Analytics-Dashboard (Cost-Tracking, Provider-Performance)
- **PROJ-12**: Templates (vordefinierte Provider-Configs)

### Phase 3: Enterprise
- **PROJ-13**: SSO (SAML, LDAP)
- **PROJ-14**: Audit-Logs
- **PROJ-15**: Custom-Branding (White-Label)

## Offene Architektur-Fragen

1. **Self-Hosted vs. Cloud**: Aktuell Cloud-First (Vercel + Supabase). Self-Hosted-Option für Enterprise?
2. **Monorepo vs. Separate Repos**: Aktuell Monorepo (Frontend + Backend in einem Repo). Bei Team-Wachstum splitten?
3. **Provider-API-Abstraction**: Aktuell Adapter-Pattern. Alternative: Separate Microservices pro Provider?

---

**Nächster Schritt**: Solution-Architect-Agent starten um detaillierte Tech-Design-Docs zu erstellen (API-Specs, Component-Struktur, etc.)
