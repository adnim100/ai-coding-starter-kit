# ProjectHub - Multi-Provider Transkriptions-Vergleichs-Tool

## Vision
ProjectHub ist ein Transkriptions-Vergleichs-Tool, das es Usern ermöglicht, Audio-Files (WAV, MP3, MP4, etc.) bei verschiedenen Transkriptions-APIs hochzuladen und die Ergebnisse zu vergleichen - für Qualität, Kosten und Sprachunterstützung.

## Kernfunktionalität

### Audio-Typen
- **Mono**: Beide Gesprächspartner auf einer Spur
- **Stereo**: Getrennte Audiospuren für verschiedene Speaker

### Unterstützte Transkriptions-Provider
1. OpenAI Whisper
2. AssemblyAI
3. Google Speech-to-Text
4. AWS Transcribe
5. ElevenLabs
6. Deepgram
7. Gladia
8. Speechmatics
9. OpenRouter (Aggregator)

### Haupt-Use-Cases
- **Qualitätsvergleich**: Welcher Anbieter liefert die besten Transkripte?
- **Kostenoptimierung**: Günstigster Anbieter für bestimmte Audio-Typen finden
- **Sprach-/Akzent-Testing**: Testen welcher Anbieter mit Sprachen/Akzenten besser umgeht

## Feature-Übersicht

### User-Authentifizierung (Security Layer)
- **PROJ-1**: Email/Passwort Registrierung & Login
- **PROJ-2**: Google OAuth Integration
- **PROJ-3**: 2FA (TOTP) Implementation
- **PROJ-4**: Passwort-Reset Funktionalität
- **PROJ-5**: Account Management & Deletion

### Core-Funktionalität (Transkriptions-Engine)
- **PROJ-6**: Audio Upload & File Management
- **PROJ-7**: Multi-Provider Transkription Engine
- **PROJ-8**: Transkript-Vergleich UI (Side-by-side, Diff, Tabelle)
- **PROJ-9**: Projekt-Management (Organisation von Transkriptions-Jobs)

### Zusätzliche Features (Nice-to-Have)
- **PROJ-10**: Kommentare & Annotations (User-Feedback zu Transkripten)
- **PROJ-11**: Export & Reporting (Transkripte exportieren, Reports generieren)
- **PROJ-12**: Analytics Dashboard (Kosten-Tracking, Provider-Performance)

## User-Workflow

### 1. Audio Upload
```
User logged in → "Neues Projekt erstellen" → Audio-Files hochladen (Drag & Drop oder Browse)
→ Audio-Typ wählen (Mono/Stereo)
→ Provider auswählen (1-8 Provider)
→ Features wählen (Speaker Diarization, Timestamps, Confidence Scores)
→ "Transkription starten"
```

### 2. Transkription Processing
```
System → Parallel-Request an ausgewählte Provider-APIs
→ Progress-Tracking (Echtzeit für kleine Files < 5 Min, Async für große Files)
→ Notification bei Completion (In-App + optional Email)
```

### 3. Ergebnisse vergleichen
```
User → "Projekt öffnen"
→ Transkript-Vergleich-Screen
→ Views wechseln: Side-by-side / Diff-View / Tabellen-View
→ Metrics sehen: Kosten, Dauer, Confidence Scores, Word Error Rate (optional)
→ Kommentare hinzufügen
→ Transkripte exportieren (TXT, JSON, CSV)
```

### 4. Projekt-Management
```
User → Dashboard mit allen Projekten
→ Filtern nach: Datum, Provider, Status (Processing/Completed/Failed)
→ Projekt löschen (mit Retention Policy: 30 Tage Default)
```

## Technische Highlights

### Processing-Strategie
- **Kleine Audio-Files (< 5 Min)**: Echtzeit-Processing mit Live-Progress
- **Große Audio-Files (> 5 Min)**: Async-Processing mit Queue (BullMQ/Redis)

### Storage-Strategie
- **Audio-Files**: Cloud Storage (S3/GCS) mit configurable Retention (Default: 30 Tage)
- **Transkripte**: Database (PostgreSQL/Supabase)
- **User-Einstellung**: User kann pro Projekt oder global Retention-Policy setzen

### Audio-Features (Provider-abhängig)
- **Speaker Diarization**: Welcher Speaker spricht wann? (wichtig für Stereo)
- **Timestamps**: Wort-/Satz-Level Timestamps
- **Confidence Scores**: Wie sicher ist die API?

### Vergleichs-Ansichten
- **Side-by-side**: Alle Provider-Transkripte nebeneinander
- **Diff-View**: Text-Diff zwischen Transkripten (highlighten wo Unterschiede sind)
- **Tabellen-View**: Metrics-Vergleich (Kosten, Dauer, Confidence, Speaker-Accuracy)

## Nächste Schritte

1. ✅ **User-Authentifizierung Features definiert** (PROJ-1 bis PROJ-5)
2. 🔲 **Core-Features definieren** (PROJ-6 bis PROJ-9)
3. 🔲 **Architektur-Vorschlag erstellen** (Tech Stack, API-Design, Database-Schema)
4. 🔲 **Solution Architect Agent starten** (für detailliertes Tech-Design)
5. 🔲 **Implementation starten** (Frontend & Backend Development)

## Offene Fragen

- Soll es User-Rollen geben? (z.B. Admin-Panel für API-Key-Management?)
- Sollen User eigene API-Keys verwenden oder zentrale ProjectHub-Keys?
- Preismodell: Free Tier (X Transkriptions-Minuten pro Monat) vs. Pay-as-you-go?
- Soll es Templates geben? (z.B. "Interview Transkription" mit vordefinierten Provider-Settings)
