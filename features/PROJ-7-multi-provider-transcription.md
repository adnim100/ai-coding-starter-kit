# PROJ-7: Multi-Provider Transkriptions-Engine

## Status: 🔵 Planned

## Beschreibung
Ermöglicht das parallele Transkribieren von Audio-Files mit bis zu 9 verschiedenen Transkriptions-Providern. User wählen Provider aus, konfigurieren Features (Speaker Diarization, Timestamps, Confidence) und starten Jobs. System verwaltet API-Requests, Progress-Tracking und Error-Handling.

## Unterstützte Provider
1. **OpenAI Whisper** - whisper-1 model
2. **AssemblyAI** - Best, Nano models
3. **Google Speech-to-Text** - V2 API
4. **AWS Transcribe** - Standard, Medical
5. **ElevenLabs** - Speech-to-Text API
6. **Deepgram** - Nova-2, Whisper models
7. **Gladia** - Fast, Accurate models
8. **Speechmatics** - Batch, Real-time
9. **OpenRouter** - Aggregator mit Zugang zu vielen STT-Models

## User Stories

### Provider-Auswahl
- Als **User** möchte ich aus 9 Providern auswählen können, um verschiedene Engines zu testen
- Als **User** möchte ich mehrere Provider gleichzeitig auswählen können, um Ergebnisse zu vergleichen
- Als **User** möchte ich für jeden Provider sehen welche Features unterstützt werden, um die richtige Wahl zu treffen
- Als **User** möchte ich meine API-Keys für jeden Provider hinterlegen können, um die Services nutzen zu können

### Transkriptions-Features
- Als **User** möchte ich Speaker Diarization aktivieren können, um zu sehen wer wann spricht
- Als **User** möchte ich Timestamps (Wort-/Satz-Level) aktivieren können, um zeitliche Navigation zu haben
- Als **User** möchte ich Confidence Scores sehen, um die Qualität einzuschätzen
- Als **User** möchte ich Sprache/Language auswählen können, um bessere Ergebnisse zu erhalten

### Job-Processing
- Als **User** möchte ich den Transkriptions-Progress in Echtzeit sehen (für kleine Files < 5 Min), um zu wissen wie lange es noch dauert
- Als **User** möchte ich eine Notification erhalten wenn große Files (> 5 Min) fertig sind, um nicht warten zu müssen
- Als **User** möchte ich laufende Jobs abbrechen können, um Kosten zu sparen bei falscher Konfiguration
- Als **User** möchte ich Fehler-Details sehen wenn ein Provider-Job fehlschlägt, um das Problem zu verstehen

### API-Key Management
- Als **User** möchte ich meine API-Keys sicher speichern können, um sie nicht bei jedem Job neu eingeben zu müssen
- Als **User** möchte ich API-Keys pro Provider verwalten (hinzufügen, ändern, löschen), um Flexibilität zu haben
- Als **User** möchte ich testen können ob meine API-Keys funktionieren, bevor ich einen Job starte

## Acceptance Criteria

### Provider-Auswahl Screen (nach Upload)
- [ ] Screen zeigt: "Wähle Transkriptions-Provider"
- [ ] Grid/Liste mit 9 Provider-Cards:
  - [ ] Provider-Name + Logo
  - [ ] Status: "API-Key vorhanden ✓" oder "API-Key fehlt ⚠"
  - [ ] Checkbox: Provider auswählen
  - [ ] Button: "API-Key verwalten"
  - [ ] Info-Icon: Zeigt unterstützte Features (Speaker Diarization, Timestamps, etc.)
- [ ] User kann 1-9 Provider auswählen
- [ ] Button: "Weiter zu Konfiguration" (enabled nur wenn min. 1 Provider ausgewählt)

### API-Key Management Modal
- [ ] Click auf "API-Key verwalten" öffnet Modal für Provider X
- [ ] Modal zeigt:
  - [ ] Input-Feld: "API-Key" (password-type, masked)
  - [ ] Link: "Wo finde ich meinen API-Key?" → Provider-Docs
  - [ ] Button: "Key testen" (validiert Key mit Test-Request)
  - [ ] Button: "Speichern"
  - [ ] Button: "Löschen" (nur wenn Key bereits gespeichert)
- [ ] API-Keys werden encrypted in Database gespeichert (AES-256)
- [ ] Nach "Speichern": Success-Message "API-Key für [Provider] gespeichert"
- [ ] Test-Request:
  - [ ] System sendet kleinen Test-Request an Provider-API
  - [ ] Success: "✓ API-Key funktioniert!"
  - [ ] Error: "✗ API-Key ungültig oder Quota überschritten"

### Transkriptions-Konfiguration Screen
- [ ] Screen zeigt ausgewählte Provider (z.B. "3 Provider ausgewählt: OpenAI Whisper, AssemblyAI, Deepgram")
- [ ] Global Settings (gelten für alle Provider):
  - [ ] Dropdown: "Sprache/Language" (Auto-Detect, Deutsch, Englisch, Spanisch, etc.)
  - [ ] Checkbox: "Speaker Diarization aktivieren" (nur für Stereo-Files)
  - [ ] Checkbox: "Word-Level Timestamps"
  - [ ] Checkbox: "Confidence Scores"
- [ ] Pro-Provider Settings (Advanced):
  - [ ] Collapsible-Section pro Provider
  - [ ] Model-Auswahl (falls Provider mehrere Models hat, z.B. AssemblyAI Best vs Nano)
  - [ ] Custom Parameters (JSON-Input für Advanced Users)
- [ ] Cost Estimation (optional):
  - [ ] Zeige geschätzte Kosten pro Provider (basierend auf Audio-Dauer)
  - [ ] Total: "Geschätzte Kosten: ~$X.XX"
- [ ] Button: "Transkription starten"

### Job-Processing (Echtzeit für kleine Files < 5 Min)
- [ ] Nach "Transkription starten": Processing-Screen
- [ ] Screen zeigt Liste der Provider-Jobs:
  - [ ] Provider-Name
  - [ ] Status: "Queued" → "Processing" → "Completed" / "Failed"
  - [ ] Progress-Bar (0-100%)
  - [ ] Elapsed Time
  - [ ] Button: "Abbrechen" (für laufende Jobs)
- [ ] Jobs laufen parallel (max 9 concurrent API-Requests)
- [ ] Progress-Tracking:
  - [ ] Bei Providern mit Polling-API: Polling alle 2-5 Sekunden
  - [ ] Bei Providern mit Webhook: Webhook-Endpoint für Completion-Notification
- [ ] Nach Completion aller Jobs:
  - [ ] Success-Screen: "Transkription abgeschlossen! X von Y Jobs erfolgreich."
  - [ ] Button: "Ergebnisse vergleichen" → PROJ-8

### Job-Processing (Async für große Files > 5 Min)
- [ ] Nach "Transkription starten": Info-Screen
  - [ ] "Deine Transkriptions-Jobs wurden gestartet. Wir senden dir eine Notification wenn sie fertig sind."
  - [ ] Button: "Zum Dashboard"
- [ ] Background-Processing (Queue-System):
  - [ ] Jobs werden zu Queue hinzugefügt (Redis Queue / BullMQ)
  - [ ] Worker verarbeiten Jobs parallel
  - [ ] Status-Updates in Database
- [ ] Notification bei Completion:
  - [ ] In-App-Notification: "Transkription für Projekt [X] abgeschlossen!"
  - [ ] Optional: Email-Notification
  - [ ] Link zu Ergebnissen (PROJ-8)

### Job Status & Error Handling
- [ ] Status-Types:
  - [ ] `queued` - Job wartet in Queue
  - [ ] `processing` - API-Request läuft
  - [ ] `completed` - Erfolgreich
  - [ ] `failed` - Fehler aufgetreten
  - [ ] `cancelled` - User hat Job abgebrochen
- [ ] Error-Details bei `failed`:
  - [ ] Error-Type: "API Error", "Quota Exceeded", "Invalid Audio", "Timeout"
  - [ ] Error-Message: Provider-spezifische Error-Message
  - [ ] Retry-Button: "Erneut versuchen" (nur für transiente Errors wie Timeout)
- [ ] Failed Jobs beeinflussen nicht andere Jobs (isoliert)

### Provider-spezifische Implementation

#### OpenAI Whisper
- [ ] API: POST /v1/audio/transcriptions
- [ ] Model: whisper-1
- [ ] Features: Timestamps (word/segment), Language, Prompt (optional)
- [ ] Response-Format: JSON with timestamps

#### AssemblyAI
- [ ] API: POST /v2/upload → POST /v2/transcript
- [ ] Models: best, nano
- [ ] Features: Speaker Diarization, Word-Level Timestamps, Confidence, Auto Chapters
- [ ] Polling: GET /v2/transcript/{id} alle 3 Sekunden

#### Google Speech-to-Text
- [ ] API: POST /v1/speech:longrunningrecognize
- [ ] Models: latest_long, latest_short
- [ ] Features: Speaker Diarization, Word-Level Timestamps, Confidence
- [ ] Polling: GET /v1/operations/{name}

#### AWS Transcribe
- [ ] API: StartTranscriptionJob
- [ ] Features: Speaker Identification, Timestamps, Confidence
- [ ] Polling: GetTranscriptionJob

#### ElevenLabs, Deepgram, Gladia, Speechmatics
- [ ] Analog zu oben, jeweils mit Provider-spezifischer API-Dokumentation
- [ ] Unified Response-Format: Alle Provider-Responses werden in einheitliches Schema konvertiert

#### OpenRouter
- [ ] API: POST /api/v1/audio/transcriptions
- [ ] Models: Zugang zu verschiedenen STT-Models (Whisper, etc.)
- [ ] Features: Abhängig vom gewählten Model (Timestamps, Language)
- [ ] Vorteil: Fallback-Option wenn ein Provider down ist, Zugang zu mehreren Models über eine API

### Unified Transcript Schema
```json
{
  "provider": "openai-whisper",
  "status": "completed",
  "duration_seconds": 125.4,
  "language": "de",
  "transcript_text": "Vollständiger Text...",
  "segments": [
    {
      "start": 0.0,
      "end": 3.5,
      "text": "Hallo, wie geht es dir?",
      "confidence": 0.95,
      "speaker": "Speaker 1" // nur wenn Diarization aktiv
    }
  ],
  "metadata": {
    "processing_time_ms": 4532,
    "word_count": 342,
    "cost_usd": 0.15 // optional
  }
}
```

## Edge Cases

### API-Key Edge Cases
- **User startet Job ohne API-Key**: Error "Bitte hinterlege einen API-Key für [Provider]"
- **API-Key ungültig während Job**: Job schlägt fehl mit Error "API-Key ungültig"
- **User ändert API-Key während laufendem Job**: Laufender Job nutzt alten Key (bis Completion)
- **API-Key Quota exceeded**: Error "Provider-Quota überschritten. Bitte prüfe dein Account-Limit."

### Processing Edge Cases
- **Provider-API down/Timeout**: Retry-Logic (max 3 Retries mit Exponential Backoff), dann Status: "failed"
- **User bricht Job ab während Processing**: API-Request wird gecancelled (falls Provider Cancel-API hat), Status: "cancelled"
- **Audio-File zu groß für Provider (> Max-Size)**: Error "Audio-File zu groß für [Provider]. Max. X MB."
- **Provider unterstützt Language nicht**: Warning "Provider [X] unterstützt Sprache [Y] nicht optimal. Ergebnis kann schlechter sein."
- **Alle Jobs schlagen fehl**: Error-Screen "Alle Transkriptions-Jobs fehlgeschlagen. Bitte prüfe deine API-Keys und Audio-File."

### Feature-Support Edge Cases
- **User aktiviert Speaker Diarization für Mono-File**: Warning "Speaker Diarization funktioniert besser mit Stereo-Audio"
- **Provider unterstützt Feature nicht**: Feature wird disabled (grayed out) mit Info-Text "Nicht unterstützt von [Provider]"
- **User wählt 9 Provider, 3 unterstützen Diarization nicht**: Jobs laufen trotzdem, Transkripte ohne Diarization für diese 3

### Cost Edge Cases
- **Cost Estimation fehlschlägt (Provider-API unreachable)**: Zeige "Kosten unbekannt"
- **Tatsächliche Kosten weichen von Estimation ab**: Zeige tatsächliche Kosten nach Job-Completion (falls Provider das zurückgibt)

### Parallel Processing Edge Cases
- **User startet 9 Jobs gleichzeitig, Server-Kapazität begrenzt**: Queue-System verarbeitet Jobs nacheinander (FIFO)
- **User startet mehrere Projekte parallel**: Alle Jobs werden zur Queue hinzugefügt, Worker verarbeiten parallel (global max concurrent Jobs: z.B. 10)

## Technische Anforderungen

### Performance
- API-Request-Timeout: 60 Sekunden (dann Retry)
- Polling-Interval: 3-5 Sekunden (abhängig von Provider)
- Max Concurrent Jobs pro User: 9 (1 pro Provider)
- Queue-Worker: Min 2 Worker (für Redundanz)

### Security
- API-Keys: Encrypted at-rest (AES-256-GCM)
- API-Keys: Never logged oder in Error-Messages exposed
- HTTPS-only für alle Provider-API-Requests
- Rate Limiting: Max 100 Jobs pro User pro Tag (verhindert Abuse)

### Queue-System
- Queue: Redis-basiert (BullMQ oder Bee-Queue)
- Job-Retry: Max 3 Retries bei transienten Errors
- Job-TTL: 24 Stunden (nach 24h wird Job automatisch gecancelled)
- Dead Letter Queue: Failed Jobs nach 3 Retries

### Error Handling & Logging
- Log alle API-Requests (Provider, Status, Duration, Error)
- Log API-Key-Validierungen (Success/Failure ohne Key-Content)
- Alert bei ungewöhnlich hoher Failure-Rate (> 30% pro Provider)
- Sentry/Error-Tracking für Exception-Monitoring

### Provider-Adapter Pattern
```typescript
interface TranscriptionProvider {
  name: string;
  validateApiKey(apiKey: string): Promise<boolean>;
  transcribe(audioFile: File, config: TranscriptionConfig): Promise<Job>;
  getJobStatus(jobId: string): Promise<JobStatus>;
  cancelJob(jobId: string): Promise<void>;
  parseResponse(rawResponse: any): UnifiedTranscript;
}
```
- Jeder Provider implementiert dieses Interface
- Unified API für Backend-Logic
- Provider-spezifische Details sind abstrahiert

## Abhängigkeiten
- **PROJ-6** (Audio Upload) - benötigt hochgeladene Audio-Files
- **PROJ-1** (Auth) - User muss eingeloggt sein
- **PROJ-9** (Projekt-Management) - Jobs gehören zu Projekten

## Abhängig von diesem Feature
- **PROJ-8** (Vergleich UI) - zeigt Transkriptions-Ergebnisse

## Tech Stack Vorschläge (für Solution Architect)
- Queue: BullMQ (Redis-basiert, robustes Retry-Handling)
- API-Clients: Axios (HTTP-Requests), Provider-spezifische SDKs (falls verfügbar)
- Encryption: `crypto` (Node.js native) für AES-256-GCM
- Progress-Tracking: Server-Sent Events (SSE) oder WebSockets
- Job-Storage: PostgreSQL (Job-Metadaten, Status) + Redis (Queue)

## Provider-Dokumentation Links (für Developer)
- OpenAI Whisper: https://platform.openai.com/docs/guides/speech-to-text
- AssemblyAI: https://www.assemblyai.com/docs
- Google Speech-to-Text: https://cloud.google.com/speech-to-text/docs
- AWS Transcribe: https://docs.aws.amazon.com/transcribe
- ElevenLabs: https://elevenlabs.io/docs/api-reference/text-to-speech
- Deepgram: https://developers.deepgram.com/docs
- Gladia: https://docs.gladia.io/
- Speechmatics: https://docs.speechmatics.com/
- OpenRouter: https://openrouter.ai/docs

## User Experience Hinweise
- **Provider-Auswahl**: Zeige welche Provider User bereits konfiguriert haben (grüner Haken)
- **Progress-Feedback**: User muss sehen was passiert (nicht einfach warten)
- **Clear Errors**: Provider-spezifische Errors übersetzen in User-freundliche Messages
- **Cost Transparency**: Zeige geschätzte Kosten VOR Job-Start (verhindert teure Überraschungen)
- **Retry-Option**: Bei transienten Errors "Erneut versuchen" anbieten
