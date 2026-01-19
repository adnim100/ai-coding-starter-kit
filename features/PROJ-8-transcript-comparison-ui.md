# PROJ-8: Transkript-Vergleich UI

## Status: 🔵 Planned

## Beschreibung
Interaktive UI zum Vergleichen von Transkripten von mehreren Providern. Unterstützt 3 verschiedene Ansichten (Side-by-side, Diff-View, Tabelle), Kommentare, Export und Audio-Synchronisation.

## User Stories

### Vergleichs-Ansichten
- Als **User** möchte ich Transkripte nebeneinander sehen (Side-by-side), um Text direkt zu vergleichen
- Als **User** möchte ich Unterschiede zwischen Transkripten hervorheben sehen (Diff-View), um schnell Abweichungen zu finden
- Als **User** möchte ich Metrics in Tabellenform sehen (Kosten, Dauer, Confidence), um Provider quantitativ zu vergleichen
- Als **User** möchte ich zwischen Ansichten wechseln können, um verschiedene Perspektiven zu haben

### Audio-Synchronisation
- Als **User** möchte ich das Original-Audio abspielen können, um Transkript-Qualität zu verifizieren
- Als **User** möchte ich im Transkript an eine Stelle klicken und Audio springt zu dieser Zeit, um schnell zu navigieren
- Als **User** möchte ich während Audio-Playback sehen welches Wort gerade gesprochen wird (Highlight), um Text und Audio zu synchronisieren

### Kommentare & Annotations
- Als **User** möchte ich Kommentare zu spezifischen Transkript-Stellen hinzufügen können, um Fehler zu notieren
- Als **User** möchte ich meine Kommentare später sehen/editieren können, um meine Analyse zu dokumentieren
- Als **User** möchte ich Kommentare pro Provider separat machen können, um Provider-spezifisches Feedback zu geben

### Export
- Als **User** möchte ich Transkripte als TXT exportieren können, um sie in anderen Tools zu verwenden
- Als **User** möchte ich Transkripte als JSON exportieren können (mit Timestamps, Confidence), um strukturierte Daten zu haben
- Als **User** möchte ich einen Vergleichs-Report als PDF/HTML exportieren können, um Ergebnisse zu teilen

## Acceptance Criteria

### Main Comparison Screen Layout
- [ ] Header:
  - [ ] Projekt-Name + Audio-File-Name
  - [ ] Audio-Player (Play/Pause, Timeline, Volume)
  - [ ] View-Switcher: Tabs "Side-by-side" | "Diff" | "Tabelle"
  - [ ] Button: "Export"
  - [ ] Button: "Zurück zu Projekten"
- [ ] Body: View-abhängiger Content (siehe unten)
- [ ] Sidebar (optional, collapsible):
  - [ ] Provider-Filter: Checkboxen um Provider ein/auszublenden
  - [ ] Kommentare-Liste (alle Kommentare für dieses Projekt)

### Side-by-side View
- [ ] Layout: Grid mit Spalten für jeden Provider (max 4 Spalten pro Row)
- [ ] Pro Provider-Spalte:
  - [ ] Header: Provider-Name + Logo
  - [ ] Metrics-Summary:
    - [ ] Processing-Zeit: "X.X Sekunden"
    - [ ] Word-Count: "XXX Wörter"
    - [ ] Avg. Confidence: "XX%" (falls verfügbar)
    - [ ] Cost: "$X.XX" (falls verfügbar)
  - [ ] Transkript-Text (scrollable):
    - [ ] Text mit Timestamps (optional toggle)
    - [ ] Speaker-Labels (falls Diarization aktiv, z.B. "[Speaker 1]")
    - [ ] Clickable Segments: Click springt zu Audio-Position
    - [ ] Highlight aktives Segment (während Audio-Playback)
- [ ] Sync-Scroll: Alle Spalten scrollen zusammen (optional toggle)

### Diff-View
- [ ] Provider-Auswahl: 2 Dropdowns "Vergleiche [Provider A] mit [Provider B]"
- [ ] Side-by-side Diff-Layout:
  - [ ] Links: Provider A Transkript
  - [ ] Rechts: Provider B Transkript
  - [ ] Highlighting:
    - [ ] Grün: Text nur in A
    - [ ] Rot: Text nur in B
    - [ ] Gelb: Text unterschiedlich (z.B. "hello" vs "hallo")
    - [ ] Grau: Text identisch
- [ ] Diff-Algorithm: Word-Level Diff (nicht Zeichen-Level)
- [ ] Metrics-Comparison (über Diff):
  - [ ] "X Unterschiede gefunden"
  - [ ] "Übereinstimmung: XX%"
  - [ ] Word Error Rate (WER) - falls Reference-Transkript vorhanden

### Tabellen-View
- [ ] Tabelle mit Spalten:
  - [ ] Provider-Name
  - [ ] Status (✓ Completed / ✗ Failed)
  - [ ] Processing-Zeit
  - [ ] Word-Count
  - [ ] Avg. Confidence Score
  - [ ] Cost (falls verfügbar)
  - [ ] Actions: "Transkript anzeigen" (Modal), "Export"
- [ ] Sortierbar nach jeder Spalte (aufsteigend/absteigend)
- [ ] Row-Click öffnet Transkript-Detail-Modal:
  - [ ] Voller Transkript-Text
  - [ ] Segments mit Timestamps
  - [ ] Speaker-Labels
  - [ ] Confidence pro Segment

### Audio-Player Integration
- [ ] HTML5 Audio-Player mit Custom-Controls:
  - [ ] Play/Pause Button
  - [ ] Timeline/Seek-Bar (clickable)
  - [ ] Current-Time / Total-Duration Display
  - [ ] Volume-Control
  - [ ] Playback-Speed: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- [ ] Timeline zeigt Segment-Markers (vertikale Linien wo neue Segments starten)
- [ ] Click auf Transkript-Segment → Audio springt zu `segment.start`
- [ ] Während Playback: Aktives Segment wird highlighted (background-color)
- [ ] Keyboard-Shortcuts:
  - [ ] Space: Play/Pause
  - [ ] Arrow-Left: -5 Sekunden
  - [ ] Arrow-Right: +5 Sekunden

### Kommentare-System
- [ ] User kann Text-Selection im Transkript machen → Right-Click oder Button "Kommentar hinzufügen"
- [ ] Kommentar-Modal öffnet:
  - [ ] Textarea: "Dein Kommentar"
  - [ ] Button: "Speichern"
  - [ ] Button: "Abbrechen"
- [ ] Kommentar wird gespeichert mit:
  - [ ] Provider-ID
  - [ ] Segment-ID (oder Timestamp-Range)
  - [ ] Selected-Text (Original-Text der markiert wurde)
  - [ ] User-Kommentar
  - [ ] Timestamp (wann Kommentar erstellt wurde)
- [ ] Kommentierte Stellen im Transkript: Gelber Marker/Highlight
- [ ] Hover über Marker zeigt Kommentar-Tooltip
- [ ] Click auf Marker öffnet Kommentar-Edit-Modal (kann editieren/löschen)
- [ ] Sidebar: Liste aller Kommentare mit Filter nach Provider

### Export-Funktionalität
- [ ] Export-Modal mit Optionen:
  - [ ] Format: TXT, JSON, CSV, PDF, HTML
  - [ ] Provider-Auswahl: "Alle" oder spezifische Provider
  - [ ] Include: Checkboxen "Timestamps", "Confidence Scores", "Speaker Labels", "Kommentare"
  - [ ] Button: "Export starten"

#### TXT-Export
```
Provider: OpenAI Whisper
Processing Time: 4.2s
Word Count: 234

[00:00.0 - 00:03.5] Speaker 1: Hallo, wie geht es dir?
[00:03.5 - 00:06.2] Speaker 2: Mir geht es gut, danke!
...

--- Kommentare ---
[00:00.0] User: "Hallo" wurde korrekt transkribiert
```

#### JSON-Export
```json
{
  "project_name": "Interview_2025",
  "audio_file": "interview.mp3",
  "transcripts": [
    {
      "provider": "openai-whisper",
      "status": "completed",
      "processing_time_s": 4.2,
      "word_count": 234,
      "segments": [
        {
          "start": 0.0,
          "end": 3.5,
          "text": "Hallo, wie geht es dir?",
          "confidence": 0.95,
          "speaker": "Speaker 1"
        }
      ],
      "comments": [
        {
          "timestamp": 0.0,
          "text": "Hallo wurde korrekt transkribiert",
          "created_at": "2025-01-19T14:30:00Z"
        }
      ]
    }
  ]
}
```

#### PDF/HTML-Export (Vergleichs-Report)
- [ ] Professional Report-Layout:
  - [ ] Header: Projekt-Name, Datum, Audio-Info
  - [ ] Executive Summary: Anzahl Provider, Best Performer (nach Metrics)
  - [ ] Provider-Comparison-Tabelle
  - [ ] Side-by-side Transkript-Vergleich (first 500 words)
  - [ ] Key-Findings: Unterschiede, häufigste Fehler
  - [ ] Kommentare-Section
- [ ] PDF-Generation: Puppeteer oder jsPDF
- [ ] HTML-Export: Standalone HTML-File (CSS inline)

## Edge Cases

### View Edge Cases
- **User hat nur 1 Provider-Transkript**: Diff-View disabled (braucht min 2 Provider)
- **User hat 8 Provider-Transkripte**: Side-by-side zeigt 4 Spalten, scrollable horizontal
- **Transkripte haben unterschiedliche Längen**: Kürzeres Transkript zeigt Empty-Space am Ende
- **Provider hat kein Confidence Score**: Spalte zeigt "N/A"

### Audio-Sync Edge Cases
- **User klickt auf Segment, Audio ist noch am Laden**: Zeige Loading-Spinner, dann springe zu Position
- **Segment-Timestamp außerhalb Audio-Duration (Bug im Provider-Response)**: Clamp zu Max-Duration
- **User scrollt während Audio-Playback**: Auto-Scroll zu aktivem Segment (optional toggle)
- **Audio-File wurde gelöscht (Retention-Policy)**: Audio-Player disabled, zeige "Audio nicht mehr verfügbar"

### Kommentar Edge Cases
- **User macht Text-Selection über mehrere Segments**: Kommentar gilt für Timestamp-Range (first.start - last.end)
- **User löscht Kommentar**: Marker verschwindet, Kommentar aus Liste entfernt
- **User editiert Transkript nach Kommentar-Erstellung**: Kommentar bleibt (referenziert Original-Text)
- **Mehrere Kommentare für gleiche Stelle**: Zeige Count-Badge (z.B. "3 Kommentare"), Click öffnet Liste

### Export Edge Cases
- **User exportiert alle 8 Provider als JSON**: Large File-Size, zeige Warning "Export kann groß sein (> X MB)"
- **PDF-Generation schlägt fehl**: Fallback zu HTML-Export, Error-Message "PDF-Export fehlgeschlagen, HTML-Version verfügbar"
- **User exportiert ohne Timestamps**: Segments werden zu einem Fließtext zusammengefügt
- **Export während Transkripte noch Processing**: Nur completed Transkripte exportieren, Warning "X Provider noch am Processing"

### Diff-View Edge Cases
- **Provider A hat 100 Wörter, Provider B hat 500 Wörter**: Diff zeigt große Unterschiede (viel Rot/Grün)
- **Beide Transkripte identisch**: Zeige Success-Message "Transkripte sind identisch! (100% Match)"
- **Language-Mix (z.B. A: Englisch, B: Deutsch Translation)**: Diff funktioniert nicht sinnvoll, zeige Warning

## Technische Anforderungen

### Performance
- Side-by-side View: Rendering < 1 Sekunde für 8 Provider mit je 1000 Wörtern
- Diff-Algorithm: < 500ms für 2 Transkripte mit je 5000 Wörtern
- Audio-Sync: Latency < 100ms (Click → Audio-Jump)
- Scroll-Performance: Virtual Scrolling für lange Transkripte (> 10k Wörter)

### Frontend-Libraries
- Diff-Algorithm: `diff-match-patch` oder `fast-diff`
- Audio-Player: HTML5 Audio + Custom-Controls (React-Player oder Howler.js)
- PDF-Generation: `jsPDF` oder Puppeteer (Backend)
- Export: `file-saver` für Client-side Downloads
- Virtual Scrolling: `react-window` oder `react-virtualized`

### Responsive Design
- Desktop: Full 3-View Support
- Tablet: Side-by-side max 2 Spalten
- Mobile: Single-Column View, View-Switcher als Dropdown

### Accessibility
- Keyboard-Navigation: Tab durch Segments, Enter zum Audio-Jump
- Screen-Reader Support: ARIA-Labels für Audio-Controls, Segment-Markers
- High-Contrast Mode: Diff-Colors müssen WCAG-konform sein

## Abhängigkeiten
- **PROJ-7** (Multi-Provider Transkription) - benötigt fertige Transkripte
- **PROJ-6** (Audio Upload) - benötigt Original-Audio-File
- **PROJ-9** (Projekt-Management) - Transkripte gehören zu Projekten

## Abhängig von diesem Feature
- Keine direkten Abhängigkeiten

## Tech Stack Vorschläge (für Solution Architect)
- Frontend-Framework: React/Next.js
- State-Management: Zustand oder Redux (für Audio-Playback-State)
- Styling: Tailwind CSS + Headless UI
- Audio-Library: Howler.js (bessere Browser-Kompatibilität als native HTML5)
- Diff-Library: `diff-match-patch` (von Google, battle-tested)
- Export-Libraries:
  - TXT/JSON/CSV: Native Browser APIs
  - PDF: Puppeteer (Backend) oder jsPDF (Frontend)
  - HTML: Template-Engine (Handlebars, EJS)

## User Experience Hinweise
- **View-Persistierung**: Letzte gewählte View speichern (LocalStorage), beim Re-Visit gleiche View zeigen
- **Audio-Sync-Feedback**: Visuelles Feedback (Highlight, Scroll-Animation) wenn zu Segment gesprungen wird
- **Diff-Color-Coding**: Intuitive Farben (Grün = hinzugefügt, Rot = entfernt, Gelb = geändert)
- **Export-Preview**: Vor finalem Export Preview zeigen (besonders für PDF/HTML)
- **Loading-States**: Während Transkripte laden, Skeleton-Screens zeigen
- **Empty-States**: "Noch keine Transkripte vorhanden. Starte einen Transkriptions-Job!"
