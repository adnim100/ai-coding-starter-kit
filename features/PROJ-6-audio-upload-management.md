# PROJ-6: Audio Upload & File Management

## Status: 🔵 Planned

## Beschreibung
Ermöglicht Usern das Hochladen von Audio-Files (WAV, MP3, MP4, etc.) für Transkription. Inkludiert File-Validierung, Storage-Management und configurable Retention Policy.

## User Stories

### Audio Upload
- Als **User** möchte ich Audio-Files per Drag & Drop hochladen können, um schnell Files zur Transkription hinzuzufügen
- Als **User** möchte ich mehrere Files gleichzeitig hochladen können (Batch Upload), um Zeit zu sparen
- Als **User** möchte ich während des Uploads Progress sehen, um zu wissen wie lange es noch dauert
- Als **User** möchte ich Audio-Files vor Upload preview/abspielen können, um sicherzustellen dass ich die richtigen Files hochlade

### File Management
- Als **User** möchte ich meine hochgeladenen Files sehen (Liste), um einen Überblick zu haben
- Als **User** möchte ich Files löschen können, um Speicherplatz freizugeben
- Als **User** möchte ich File-Metadaten sehen (Größe, Dauer, Format, Upload-Datum), um Files zu identifizieren
- Als **User** möchte ich Audio-Typ (Mono/Stereo) angeben können, um die richtige Processing-Strategie zu wählen

### Storage Retention
- Als **User** möchte ich in Settings festlegen wie lange Files gespeichert werden (Default: 30 Tage), um Kontrolle über meine Daten zu haben
- Als **User** möchte ich pro Projekt festlegen ob Files dauerhaft oder temporär gespeichert werden, um Flexibilität zu haben
- Als **User** möchte ich gewarnt werden bevor Files automatisch gelöscht werden, um wichtige Daten nicht zu verlieren

## Acceptance Criteria

### Audio Upload UI
- [ ] "Neues Projekt erstellen" Button führt zu Upload-Screen
- [ ] Upload-Area mit Drag & Drop Support
  - [ ] Visual Feedback beim Hover (Drag-Over State)
  - [ ] Button "Files auswählen" als Alternative zu Drag & Drop
  - [ ] Multi-File-Upload möglich (bis zu 10 Files gleichzeitig)
- [ ] Unterstützte Formate anzeigen: "WAV, MP3, MP4, M4A, FLAC, OGG, WEBM"
- [ ] Max. File-Size: 500 MB pro File
- [ ] Nach File-Auswahl: Upload-Preview-Liste zeigt:
  - [ ] File-Name
  - [ ] File-Size
  - [ ] Geschätzte Dauer (nach Upload-Completion)
  - [ ] Audio-Typ Dropdown: "Mono" oder "Stereo"
  - [ ] Remove-Button (X) um File aus Upload-Liste zu entfernen

### Upload Processing
- [ ] Nach "Upload starten" Button-Klick:
  - [ ] Files werden zu Cloud Storage hochgeladen (S3/GCS)
  - [ ] Progress-Bar pro File (0-100%)
  - [ ] Overall Progress (z.B. "3 von 5 Files hochgeladen")
  - [ ] Upload läuft parallel (max 3 concurrent Uploads)
- [ ] Während Upload: User kann nicht navigieren (Modal/Blocking oder Warning)
- [ ] Bei erfolgreichem Upload:
  - [ ] File wird in Database gespeichert (Metadaten)
  - [ ] Audio-Analyse läuft (Dauer extrahieren, Sample-Rate, Channels)
  - [ ] Success-Message: "X Files erfolgreich hochgeladen"
  - [ ] Redirect zu "Provider auswählen" Screen (PROJ-7)

### File Validierung
- [ ] Format-Check: Nur erlaubte Formate (WAV, MP3, MP4, M4A, FLAC, OGG, WEBM)
- [ ] Size-Check: Max. 500 MB pro File
- [ ] Audio-Check: Ist File ein gültiges Audio-File? (nicht korrupt)
- [ ] Duration-Check: Min. 1 Sekunde, Max. 3 Stunden
- [ ] Bei Validierungs-Fehler:
  - [ ] File wird aus Upload-Liste entfernt
  - [ ] Error-Message: "File [name] konnte nicht hochgeladen werden: [Grund]"
  - [ ] Andere Files werden weiter hochgeladen (kein Abbruch)

### File Management (Dashboard)
- [ ] Dashboard zeigt Liste aller Projekte mit hochgeladenen Files
- [ ] Pro Projekt: Liste der Audio-Files
  - [ ] Spalten: Name, Format, Größe, Dauer, Audio-Typ (Mono/Stereo), Upload-Datum, Status
  - [ ] Status: "Uploaded" → "Processing" → "Completed" → "Failed"
  - [ ] Audio-Player (inline) um File abzuspielen
  - [ ] Button: "Herunterladen" (original File)
  - [ ] Button: "Löschen" (mit Confirmation)
- [ ] Filter: Nach Format, Audio-Typ, Datum
- [ ] Sort: Nach Name, Größe, Datum (aufsteigend/absteigend)

### Storage Retention Policy
- [ ] User Settings → "Storage & Retention" Tab
- [ ] Global Retention-Einstellung:
  - [ ] Dropdown: "Audio-Files behalten für..."
    - [ ] "30 Tage" (Default)
    - [ ] "60 Tage"
    - [ ] "90 Tage"
    - [ ] "Dauerhaft"
  - [ ] Info: "Nach dieser Frist werden Audio-Files automatisch gelöscht. Transkripte bleiben erhalten."
  - [ ] Button: "Speichern"
- [ ] Pro-Projekt Override (optional):
  - [ ] Bei Projekt-Erstellung: Checkbox "Custom Retention für dieses Projekt"
  - [ ] Dropdown wie oben
- [ ] Automatische Deletion (Cron Job):
  - [ ] Täglich prüfen: Gibt es Files mit Upload-Datum + Retention-Days < NOW?
  - [ ] Files löschen aus Cloud Storage
  - [ ] Database-Eintrag Status: "Deleted" (Metadaten bleiben für Audit)
  - [ ] Optional: Email-Notification "X Files wurden automatisch gelöscht"

### Pre-Deletion Warning
- [ ] 7 Tage vor Deletion: Email an User
  - [ ] "Deine Audio-Files in Projekt [X] werden in 7 Tagen gelöscht"
  - [ ] Link zu Projekt: "Retention verlängern oder Files herunterladen"
- [ ] User kann in Projekt:
  - [ ] Button "Retention verlängern" → Öffnet Dropdown für neue Retention
  - [ ] Button "Files herunterladen" → ZIP-Download aller Audio-Files

## Edge Cases

### Upload Edge Cases
- **User bricht Upload ab (Browser geschlossen)**: Resumable Upload (nutze Chunked Upload)
- **Network Error während Upload**: Retry-Logic (max 3 Retries), dann Error "Upload fehlgeschlagen"
- **File > 500 MB**: Reject vor Upload, Error "File zu groß. Max. 500 MB."
- **Ungültiges Audio-Format (z.B. Video-only MP4)**: Error "Keine Audio-Spur gefunden in [file]"
- **User uploaded 10 Files, 3 schlagen fehl**: Zeige Error für 3 Files, 7 Files werden erfolgreich hochgeladen
- **Duplicate File-Names**: Append Timestamp (z.B. "audio.mp3" → "audio_20250119_143022.mp3")

### Storage Edge Cases
- **User ändert Retention von 30 auf 90 Tage**: Deletion-Date wird neu berechnet (Upload-Date + 90 Tage)
- **User ändert Retention von "Dauerhaft" auf "30 Tage"**: Deletion-Date wird gesetzt (NOW + 30 Tage)
- **Cloud Storage Quota voll**: Error "Speicherplatz voll. Bitte lösche alte Files oder erhöhe Quota."
- **Cron Job schlägt fehl beim File-Löschen**: Retry nach 24h, Alert an Admins
- **User löscht Projekt, Files haben noch Retention-Time**: Files werden sofort gelöscht (Projekt-Deletion override Retention)

### File Management Edge Cases
- **User löscht File während Transkription läuft**: Transkriptions-Jobs werden abgebrochen, Status: "Failed (File deleted)"
- **User versucht File herunterzuladen das bereits gelöscht wurde**: Error "File nicht mehr verfügbar (gelöscht am [Datum])"
- **File ist korrupt nach Upload**: Status: "Upload Failed", Error-Message: "File korrupt. Bitte neu hochladen."
- **Audio-Dauer Analyse schlägt fehl**: Default-Wert: "Unbekannt", User kann manuell korrigieren

### Audio-Typ Edge Cases
- **User wählt "Stereo" für Mono-File**: System detektiert Channels, zeigt Warning "File ist Mono, nicht Stereo. Audio-Typ korrigieren?"
- **User wählt "Mono" für Stereo-File**: Provider-Transkription könnte schlechter sein (keine Speaker Diarization möglich), Warning zeigen
- **User ändert Audio-Typ nach Upload**: Erlaubt, aber nur vor Transkription (danach grayed out)

## Technische Anforderungen

### Performance
- Upload-Speed: Abhängig von User-Bandwidth, aber min. 1 MB/s Server-seitig
- Chunked Upload: Files in 5 MB Chunks hochladen (für Resumable Upload)
- Parallel Uploads: Max 3 concurrent Uploads (verhindert Browser-Overload)
- Audio-Analyse: < 5 Sekunden für File < 100 MB

### Storage
- Cloud Storage: AWS S3, Google Cloud Storage, oder Azure Blob
- Storage-Structure:
  ```
  /uploads/{user_id}/{project_id}/{file_id}.{ext}
  ```
- File Encryption: At-Rest Encryption (S3 SSE oder KMS)
- Metadata Storage: Database (PostgreSQL/Supabase)

### Audio Processing
- Audio-Analyse-Library: `ffprobe` (FFmpeg) für Metadaten-Extraktion
- Extract: Duration, Sample-Rate, Bitrate, Channels (Mono/Stereo), Codec

### Security
- Signed Upload URLs (Presigned S3 URLs) - Client uploaded direkt zu S3 (nicht über Backend)
- CORS-Configuration: Nur allowed Origins können uploaden
- File-Type Validation: MIME-Type Check + Extension Check (doppelte Validierung)
- Virus-Scan: Optional (ClamAV oder Cloud-basierter Scanner)

### Monitoring/Logging
- Log Uploads (User-ID, File-ID, Size, Duration, Status)
- Log Upload-Failures (Reason, File-Info)
- Log Deletion-Events (File-ID, Deletion-Reason: Manual/Auto/Project-Deletion)
- Alert bei ungewöhnlich hoher Upload-Failure-Rate

## Abhängigkeiten
- **PROJ-1** (Auth) - User muss eingeloggt sein
- **PROJ-9** (Projekt-Management) - Files gehören zu Projekten

## Abhängig von diesem Feature
- **PROJ-7** (Multi-Provider Transkription) - benötigt hochgeladene Audio-Files
- **PROJ-8** (Vergleich UI) - zeigt Original-Audio + Transkripte

## Tech Stack Vorschläge (für Solution Architect)
- Upload: `react-dropzone` (Frontend), Presigned S3 URLs (Backend)
- Audio-Analyse: `ffprobe` (FFmpeg CLI) oder `fluent-ffmpeg` (Node.js)
- Cloud Storage: AWS S3 mit Lifecycle Policies (Auto-Deletion nach X Tagen)
- Chunked Upload: `tus` Protocol (resumable uploads)
- Progress Tracking: WebSockets oder Server-Sent Events (SSE)

## User Experience Hinweise
- **Drag & Drop**: Intuitive, moderne UX
- **Progress Feedback**: User muss sehen was passiert (nicht einfach warten)
- **Clear Errors**: "File zu groß" ist besser als "Upload fehlgeschlagen"
- **Audio-Preview**: User kann File abspielen vor Upload um sicherzustellen es ist richtig
- **Retention-Warnings**: 7 Tage vor Deletion warnen (verhindert Datenverlust)
