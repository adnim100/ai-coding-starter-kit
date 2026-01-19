# ProjectHub 🎙️

**Multi-Provider Audio-Transkriptions-Vergleichs-Tool**

ProjectHub ermöglicht den gleichzeitigen Vergleich von bis zu 9 verschiedenen Transkriptions-Diensten, um die beste Qualität für deine Audio-Files zu finden.

## ✨ Features

### 🔐 Vollständiges Auth-System
- Email/Passwort Registrierung mit Email-Verifizierung
- Google OAuth (1-Click Login)
- Verpflichtende 2FA mit TOTP (Google Authenticator, Authy, etc.)
- 10 Recovery Codes pro User
- Passwort-Reset Funktionalität
- Account Management & DSGVO-konformes Löschen

### 🎵 Audio-Verwaltung
- Upload mehrerer Audio-Dateien (WAV, MP3, MP4, M4A, FLAC, OGG, WEBM)
- Drag & Drop Interface
- Automatische Audio-Analyse (Dauer, Format, Channels)
- Konfigurierbare Retention-Policies (0-90 Tage)
- Mono & Stereo Support

### 🤖 9 Transkriptions-Provider
1. **OpenAI Whisper** - State-of-the-art accuracy
2. **AssemblyAI** - Fast with excellent diarization
3. **Google Speech-to-Text** - Multi-language support
4. **AWS Transcribe** - Enterprise-grade reliability
5. **ElevenLabs** - High-quality transcription
6. **Deepgram** - Real-time capabilities
7. **Gladia** - Accurate multilingual
8. **Speechmatics** - Batch processing
9. **OpenRouter** - Aggregator with fallback options

### 📊 Vergleichs-Features
- **Side-by-side View**: Alle Transkripte nebeneinander
- **Diff-View**: Unterschiede zwischen Providern highlighten
- **Tabellen-View**: Metrics-Vergleich (Kosten, Dauer, Confidence)
- **Audio-Synchronisation**: Click-to-Jump zu Timestamps
- **Kommentare**: Notizen zu spezifischen Stellen
- **Export**: TXT, JSON, CSV, PDF

### 🚀 Projekt-Management
- Dashboard mit allen Projekten
- Filter & Search
- Tags & Kategorisierung
- Status-Tracking (Processing, Completed, Failed, Partial)
- Archivierung
- Batch-Operations

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (30+ Components)
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth**: NextAuth.js v5 + 2FA (TOTP)
- **Storage**: Supabase Storage oder AWS S3
- **Queue**: BullMQ + Redis
- **Deployment**: Vercel (Frontend) + Railway (Worker)

## 📦 Installation

### Voraussetzungen
- Node.js 20+
- PostgreSQL-Datenbank (Supabase recommended)
- Redis (für Queue-System)

### Quick Start

```bash
# Clone repository
cd ai-coding-starter-kit

# Dependencies installieren (bereits gemacht)
npm install

# .env.local mit Database-URL ausfüllen
cp .env.local.example .env.local

# Database initialisieren
npm run db:push

# Development Server starten
npm run dev
```

**Server läuft auf:** http://localhost:3000

### Detaillierte Setup-Anleitung

Siehe [SETUP.md](./SETUP.md) für:
- Database-Setup (Supabase oder lokal)
- Google OAuth Konfiguration
- Redis-Setup
- Storage-Konfiguration
- Production-Deployment

## 🎯 Verwendung

### 1. Account erstellen
1. Navigate zu http://localhost:3000/register
2. Email + Passwort eingeben
3. Email verifizieren
4. 2FA einrichten (QR-Code scannen)
5. Recovery Codes speichern

### 2. API-Keys hinzufügen
1. Settings → API Keys
2. Für jeden Provider API-Key eingeben
3. Keys werden encrypted gespeichert

### 3. Projekt erstellen
1. Dashboard → "Neues Projekt"
2. Audio-Files hochladen (Drag & Drop)
3. Audio-Typ wählen (Mono/Stereo)

### 4. Transkription starten
1. Provider auswählen (1-9 möglich)
2. Features konfigurieren:
   - Speaker Diarization
   - Word-Level Timestamps
   - Confidence Scores
   - Sprache
3. "Transkription starten"

### 5. Ergebnisse vergleichen
1. Warte auf Completion (oder Email-Notification)
2. Öffne Comparison-View
3. Wechsle zwischen Ansichten
4. Füge Kommentare hinzu
5. Exportiere Ergebnisse

## 📁 Projekt-Struktur

```
ai-coding-starter-kit/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth-Pages (Login, Register, 2FA)
│   │   ├── (dashboard)/      # Dashboard & Projekte
│   │   └── api/              # API Routes
│   ├── components/
│   │   ├── auth/             # Auth-Components
│   │   ├── dashboard/        # Dashboard-Components
│   │   ├── upload/           # Upload-Components
│   │   ├── transcription/    # Provider-Auswahl
│   │   ├── comparison/       # Vergleichs-UI
│   │   └── ui/               # shadcn/ui Components
│   ├── lib/
│   │   ├── auth.ts           # NextAuth Config
│   │   ├── prisma.ts         # Prisma Client
│   │   ├── queue.ts          # BullMQ Setup
│   │   └── transcription/    # Provider-Adapter
│   └── workers/
│       └── transcription-worker.ts  # Queue Worker
├── prisma/
│   └── schema.prisma         # Database Schema
├── features/                 # Feature Specifications
│   ├── PROJ-1-email-password-auth.md
│   ├── ...
│   └── PROJ-9-project-management.md
├── ARCHITECTURE.md           # System-Architektur
├── SETUP.md                  # Setup-Anleitung
└── PROJECT_OVERVIEW.md       # Projekt-Overview
```

## 🔧 Development

### Scripts

```bash
npm run dev          # Development Server
npm run build        # Production Build
npm run start        # Production Server
npm run lint         # ESLint
npm run db:generate  # Prisma Generate
npm run db:push      # Push Schema zu DB
npm run db:studio    # Prisma Studio (DB GUI)
```

### Database Änderungen

```bash
# Schema ändern in prisma/schema.prisma
npm run db:push

# Oder mit Migration:
npm run db:migrate
```

### Worker starten (separat)

```bash
tsx src/workers/transcription-worker.ts
```

## 🚀 Production Deployment

### Vercel (Frontend)

```bash
# Push to GitHub
git push origin main

# In Vercel:
# 1. Import Project
# 2. Add Environment Variables
# 3. Deploy
```

### Worker (Railway oder Render)

```yaml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "tsx src/workers/transcription-worker.ts"
restartPolicyType = "ON_FAILURE"
```

## 📊 Status & Roadmap

### ✅ Implementiert (MVP)
- [x] Authentication System (PROJ-1 bis PROJ-5)
- [x] Database Schema & Prisma
- [x] Project Management API
- [x] Provider-Adapter-Interface
- [x] Basis-UI-Komponenten

### 🚧 In Arbeit (Background-Agents)
- [ ] Auth UI Pages (Login, Register, 2FA)
- [ ] Dashboard UI (Project Grid, Cards)
- [ ] Provider-Adapter-Implementierungen (9x)
- [ ] Upload-UI & Storage
- [ ] Comparison-UI (Side-by-side, Diff, Tabelle)
- [ ] Queue-System & Worker

### 🔜 Geplant
- [ ] Real-time Status-Updates (WebSocket)
- [ ] Email-Notifications
- [ ] Analytics-Dashboard
- [ ] Team-Features
- [ ] Templates für häufige Use-Cases

## 🤝 Contributing

Dieses Projekt wurde mit dem **AI Coding Starter Kit** entwickelt, das ein vollständiges AI-Agent-Team-System für strukturierte Feature-Development enthält.

### Feature-Entwicklung

1. Erstelle Feature Spec in `/features/PROJ-X-feature-name.md`
2. Nutze die AI-Agents:
   - **Requirements Engineer**: Feature Specs schreiben
   - **Solution Architect**: Tech-Design
   - **Frontend/Backend Dev**: Implementation
   - **QA Engineer**: Testing
   - **DevOps**: Deployment

Siehe `.claude/agents/` für Agent-Konfigurationen.

## 📝 License

MIT License - siehe LICENSE file

## 🆘 Support

- **Documentation**: Siehe `/features` für Feature Specs
- **Architecture**: Siehe `ARCHITECTURE.md`
- **Setup**: Siehe `SETUP.md`
- **Issues**: GitHub Issues

## 🎉 Credits

Built with:
- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [NextAuth.js](https://next-auth.js.org)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [BullMQ](https://docs.bullmq.io)

---

**Made with ❤️ using Claude Code AI Agent System**

🚀 **Development Server läuft bereits auf http://localhost:3000**
