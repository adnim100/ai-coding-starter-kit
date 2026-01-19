# PROJ-9: Projekt-Management & Dashboard

## Status: 🔵 Planned

## Beschreibung
Dashboard für User um alle Transkriptions-Projekte zu verwalten. Ermöglicht Erstellen, Ansehen, Filtern, Sortieren und Löschen von Projekten. Zeigt Status, Fortschritt und Metadaten aller Jobs.

## User Stories

### Dashboard Overview
- Als **User** möchte ich nach Login alle meine Projekte sehen, um einen Überblick zu haben
- Als **User** möchte ich Projekt-Status auf einen Blick sehen (Processing, Completed, Failed), um zu wissen was erledigt ist
- Als **User** möchte ich neue Projekte erstellen können, um neue Transkriptions-Vergleiche zu starten
- Als **User** möchte ich Projekte nach Datum, Status oder Name sortieren können, um schneller zu finden was ich suche

### Projekt-Details
- Als **User** möchte ich ein Projekt öffnen und alle Details sehen (Audio-Files, Provider, Transkripte), um den Status zu checken
- Als **User** möchte ich sehen welche Provider-Jobs abgeschlossen sind und welche noch laufen, um Fortschritt zu tracken
- Als **User** möchte ich von Projekt-Details direkt zum Transkript-Vergleich springen können (PROJ-8), um Ergebnisse zu sehen

### Projekt-Organisation
- Als **User** möchte ich Projekte mit Tags versehen können (z.B. "Interview", "Meeting", "Podcast"), um sie zu kategorisieren
- Als **User** möchte ich nach Tags filtern können, um relevante Projekte schnell zu finden
- Als **User** möchte ich Projekte umbenennen können, um bessere Bezeichnungen zu haben
- Als **User** möchte ich Projekte archivieren können (statt löschen), um alten Content zu behalten aber Dashboard clean zu halten

### Projekt-Löschung
- Als **User** möchte ich Projekte löschen können, um Speicherplatz freizugeben
- Als **User** möchte ich gewarnt werden bevor ein Projekt gelöscht wird, um versehentliche Löschungen zu vermeiden
- Als **User** möchte ich verstehen welche Daten gelöscht werden (Audio, Transkripte, Kommentare), um informierte Entscheidung zu treffen

## Acceptance Criteria

### Dashboard Screen Layout
- [ ] Header:
  - [ ] "Meine Projekte" Titel
  - [ ] Button: "+ Neues Projekt"
  - [ ] Search-Bar: "Projekte durchsuchen..."
  - [ ] Filter-Dropdown: "Status", "Tags", "Datum"
  - [ ] Sort-Dropdown: "Neueste zuerst", "Älteste zuerst", "Name A-Z", "Name Z-A"
- [ ] Body: Projekt-Grid oder Liste
  - [ ] Grid-View (Default): Cards in Grid-Layout (3-4 Spalten)
  - [ ] List-View (Toggle): Tabellarische Liste
- [ ] Empty-State (wenn keine Projekte):
  - [ ] Illustration/Icon
  - [ ] Text: "Noch keine Projekte vorhanden"
  - [ ] Button: "Erstes Projekt erstellen"

### Projekt-Card (Grid-View)
- [ ] Card zeigt:
  - [ ] Projekt-Name (editierbar via Inline-Edit oder Click)
  - [ ] Audio-File-Name(n) (max 3 anzeigen, "+X mehr" falls mehr)
  - [ ] Status-Badge:
    - [ ] "🟡 Processing" (gelb) - mindestens 1 Job läuft
    - [ ] "🟢 Completed" (grün) - alle Jobs abgeschlossen
    - [ ] "🔴 Failed" (rot) - alle Jobs fehlgeschlagen
    - [ ] "🟠 Partial" (orange) - manche Jobs erfolgreich, manche fehlgeschlagen
  - [ ] Progress-Bar (nur wenn Processing): "X von Y Provider abgeschlossen"
  - [ ] Metadaten:
    - [ ] Anzahl Audio-Files
    - [ ] Anzahl Provider
    - [ ] Erstellt: Datum (z.B. "19. Jan 2025")
  - [ ] Tags (falls vorhanden): Pill-Badges (z.B. "Interview", "Deutsch")
  - [ ] Actions:
    - [ ] Button: "Öffnen" → Projekt-Detail-Screen
    - [ ] Icon: "⋯" (3-Dot-Menu) → Dropdown mit "Umbenennen", "Tags bearbeiten", "Archivieren", "Löschen"

### Projekt-Detail-Screen
- [ ] Header:
  - [ ] Projekt-Name (editierbar)
  - [ ] Breadcrumb: "Dashboard > [Projekt-Name]"
  - [ ] Button: "Zurück zu Projekten"
  - [ ] Button: "Transkripte vergleichen" (nur wenn mindestens 1 Job completed)
- [ ] Sections:
  - [ ] **Audio-Files**: Liste mit Name, Größe, Dauer, Audio-Typ
    - [ ] Audio-Player (inline)
    - [ ] Button: "Herunterladen"
    - [ ] Button: "Löschen" (nur File, nicht ganzes Projekt)
  - [ ] **Provider-Jobs**: Tabelle mit Spalten:
    - [ ] Provider-Name
    - [ ] Status: Icon + Text (Processing, Completed, Failed, Queued)
    - [ ] Started: Timestamp
    - [ ] Duration: Processing-Zeit (falls completed)
    - [ ] Actions: "Transkript ansehen" (falls completed), "Details" (falls failed), "Abbrechen" (falls processing)
  - [ ] **Tags**: Liste editierbar (Add/Remove Tags)
  - [ ] **Metadaten**: Created-At, Updated-At, Total-Cost (falls verfügbar)

### Neues Projekt erstellen
- [ ] Click "+ Neues Projekt" → Modal oder neue Seite
- [ ] Formular:
  - [ ] Input: "Projekt-Name" (required)
  - [ ] Textarea: "Beschreibung" (optional)
  - [ ] Multi-Select: "Tags" (optional, existing Tags + "Neuen Tag erstellen")
  - [ ] Button: "Projekt erstellen und Audio hochladen"
- [ ] Nach Erstellen: Redirect zu Upload-Screen (PROJ-6) mit Projekt-ID

### Filter & Search
- [ ] **Search-Bar**:
  - [ ] Sucht nach Projekt-Name, Audio-File-Name, Tags
  - [ ] Live-Suche (debounced, 300ms)
  - [ ] Zeigt "X Ergebnisse für '[query]'"
- [ ] **Status-Filter**:
  - [ ] Checkboxen: "Processing", "Completed", "Failed", "Partial"
  - [ ] Multi-Select möglich
  - [ ] Filter applied → URL-Parameter (shareable links)
- [ ] **Tag-Filter**:
  - [ ] Dropdown mit allen existierenden Tags
  - [ ] Multi-Select
- [ ] **Datum-Filter**:
  - [ ] Preset: "Heute", "Letzte 7 Tage", "Letzte 30 Tage", "Dieses Jahr"
  - [ ] Custom: Date-Range-Picker

### Sort-Funktionalität
- [ ] Sort-Options:
  - [ ] "Neueste zuerst" (Default)
  - [ ] "Älteste zuerst"
  - [ ] "Name A-Z"
  - [ ] "Name Z-A"
  - [ ] "Status" (Completed → Processing → Failed)
- [ ] Sort applied → URL-Parameter

### Projekt-Löschung
- [ ] Click "Löschen" im 3-Dot-Menu → Confirmation-Modal
- [ ] Modal zeigt:
  - [ ] Warning: "⚠️ Projekt unwiderruflich löschen?"
  - [ ] Info: "Folgende Daten werden gelöscht:"
    - [ ] "X Audio-Files"
    - [ ] "Y Transkripte (alle Provider)"
    - [ ] "Z Kommentare"
  - [ ] Checkbox: "Ich verstehe dass diese Aktion nicht rückgängig gemacht werden kann"
  - [ ] Input: "Gib 'DELETE' ein um zu bestätigen"
  - [ ] Button: "Projekt löschen" (danger-style, rot)
  - [ ] Button: "Abbrechen"
- [ ] Nach Deletion:
  - [ ] Audio-Files aus Cloud Storage löschen
  - [ ] Transkripte aus Database löschen
  - [ ] Kommentare löschen
  - [ ] Projekt-Metadaten löschen
  - [ ] Alle laufenden Jobs abbrechen
  - [ ] Success-Toast: "Projekt '[Name]' gelöscht"
  - [ ] Dashboard neu laden (Projekt verschwindet)

### Archivierung
- [ ] Click "Archivieren" → Projekt-Status wird "archived"
- [ ] Archivierte Projekte:
  - [ ] Nicht in Standard-Dashboard-View sichtbar
  - [ ] Filter-Toggle: "Archivierte anzeigen" (Checkbox)
  - [ ] Können wiederhergestellt werden ("Dearchivieren" Action)
  - [ ] Können gelöscht werden (gleicher Flow wie normale Projekte)

### Batch-Operations (Nice-to-Have)
- [ ] Checkbox-Selektion: User kann mehrere Projekte auswählen
- [ ] Batch-Actions-Bar (erscheint wenn > 0 Projekte ausgewählt):
  - [ ] "X Projekte ausgewählt"
  - [ ] Button: "Archivieren"
  - [ ] Button: "Löschen"
  - [ ] Button: "Tags hinzufügen"
  - [ ] Button: "Auswahl aufheben"

## Edge Cases

### Dashboard Edge Cases
- **User hat 0 Projekte**: Empty-State anzeigen
- **User hat 100+ Projekte**: Pagination (z.B. 20 Projekte pro Seite) oder Infinite-Scroll
- **Projekt ist Processing während User Dashboard ansieht**: Status-Update via Polling (alle 5 Sekunden) oder WebSocket
- **User löscht Projekt während es auf anderem Tab offen ist**: Tab zeigt Error "Projekt nicht gefunden (gelöscht)"

### Filter/Search Edge Cases
- **Search ohne Ergebnisse**: "Keine Projekte gefunden für '[query]'" mit Button "Filter zurücksetzen"
- **Mehrere Filter aktiv (Status + Tags + Datum)**: Zeige "X Filter aktiv" mit Button "Alle Filter löschen"
- **User klickt "Alle Filter löschen"**: Reset zu Default-View (alle Projekte, neueste zuerst)

### Projekt-Detail Edge Cases
- **User öffnet Projekt das noch keine Jobs hat**: Zeige "Noch keine Transkriptions-Jobs gestartet" mit Button "Provider auswählen"
- **Alle Provider-Jobs failed**: Zeige Error-Summary "Alle Jobs fehlgeschlagen. Mögliche Gründe: [X]" mit Button "Erneut versuchen"
- **User löscht Audio-File während Job läuft**: Job wird abgebrochen, Status: "Failed (File deleted)"

### Archivierung Edge Cases
- **User archiviert Projekt mit laufenden Jobs**: Jobs laufen weiter im Hintergrund, werden completed
- **User dearchiviert Projekt**: Projekt erscheint wieder in Dashboard (an Position basierend auf Sort)

### Tag-Management Edge Cases
- **User erstellt Tag mit Leerzeichen**: Trimmen (leading/trailing spaces entfernen)
- **User erstellt duplikat Tag (case-insensitive)**: Merge zu existierendem Tag
- **User löscht Tag der bei vielen Projekten verwendet wird**: Tag wird von allen Projekten entfernt (mit Confirmation: "Tag wird von X Projekten entfernt")

### Batch-Operations Edge Cases
- **User wählt 50 Projekte aus und klickt "Löschen"**: Confirmation zeigt "50 Projekte löschen?" mit Details
- **User wählt Mix aus normalen und archivierten Projekten**: Batch-Actions funktionieren für beide Typen
- **User startet Batch-Delete, 5 von 10 Projekten schlagen fehl (z.B. Storage-Error)**: Zeige "5 von 10 Projekten gelöscht. 5 Fehler aufgetreten. Details..."

## Technische Anforderungen

### Performance
- Dashboard-Load: < 1 Sekunde für 100 Projekte
- Search: < 200ms Response-Time (debounced)
- Filter-Apply: < 300ms
- Pagination: Load-More < 500ms

### Real-Time Updates
- Status-Updates: Polling (alle 5-10 Sekunden) oder WebSocket
- Neue Projekt-Events: Push-Notification (optional)

### Database-Queries
- Index auf: `user_id`, `created_at`, `status`, `tags`
- Full-Text-Search auf: `project_name`, `description`, `audio_file_names`

### URL-State Management
- Filter/Sort als URL-Params: `/dashboard?status=completed&tags=interview&sort=newest`
- Shareable Links: User kann gefilterte View teilen
- Browser-Back-Button funktioniert (History-API)

### Caching
- Dashboard-Daten: Cache für 30 Sekunden (verhindert redundante DB-Queries)
- Projekt-Details: Cache bis Status-Change

## Abhängigkeiten
- **PROJ-1** (Auth) - User muss eingeloggt sein
- **PROJ-6** (Audio Upload) - Projekte enthalten Audio-Files
- **PROJ-7** (Transkription) - Projekte enthalten Jobs
- **PROJ-8** (Vergleich UI) - "Transkripte vergleichen" Button führt zu PROJ-8

## Abhängig von diesem Feature
- Alle anderen Features (PROJ-6, PROJ-7, PROJ-8) - Projekte sind zentrale Organisationseinheit

## Tech Stack Vorschläge (für Solution Architect)
- Frontend: React + Next.js
- State-Management: React Query (für Server-State + Caching)
- URL-State: `nuqs` oder `next-usequerystate`
- Real-Time: Socket.io (WebSocket) oder Supabase Realtime
- Search: PostgreSQL Full-Text-Search oder Algolia (für advanced search)
- Pagination: Cursor-based Pagination (besser als Offset für große Datasets)

## User Experience Hinweise
- **Status-Visibility**: User muss auf einen Blick sehen was läuft und was fertig ist
- **Quick-Actions**: Häufigste Actions (Öffnen, Löschen) sollten max 2 Clicks entfernt sein
- **Empty-States**: Klare CTAs ("Erstes Projekt erstellen!") statt leerer Screens
- **Loading-States**: Skeleton-Screens während Dashboard lädt
- **Error-States**: "Projekt konnte nicht geladen werden" mit Retry-Button
- **Confirmation-Dialogs**: Destruktive Actions (Löschen) immer mit Confirmation
- **Breadcrumbs**: User soll immer wissen wo sie sind (Dashboard > Projekt > Vergleich)
