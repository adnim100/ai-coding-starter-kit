# PROJ-3: 2FA (TOTP) Implementation

## Status: 🔵 Planned

## Beschreibung
Implementiert verpflichtende Two-Factor Authentication (2FA) mit TOTP (Time-based One-Time Password) für alle ProjectHub User. Nutzt Authenticator Apps wie Google Authenticator, Authy, oder 1Password für maximale Sicherheit.

## User Stories

### 2FA Setup (Onboarding)
- Als **neuer User** möchte ich nach Email-Verifizierung 2FA einrichten müssen, um meinen Account zu sichern
- Als **neuer User** möchte ich einen QR-Code scannen können, um 2FA in meiner Authenticator App einzurichten
- Als **neuer User** möchte ich Recovery Codes erhalten, um Zugang zu meinem Account zu behalten falls ich mein Gerät verliere
- Als **neuer User** möchte ich den 2FA-Setup mit einem Test-Code verifizieren, um sicherzustellen dass alles funktioniert

### 2FA Login Flow
- Als **registrierter User** möchte ich nach Email+Passwort-Login einen 2FA-Code eingeben, um Zugang zu erhalten
- Als **registrierter User** möchte ich klare Fehlermeldungen sehen wenn mein 2FA-Code falsch ist, um zu verstehen was schiefgelaufen ist
- Als **registrierter User** möchte ich einen Recovery Code verwenden können wenn mein Authenticator nicht verfügbar ist, um trotzdem Zugang zu erhalten

### 2FA Management
- Als **registrierter User** möchte ich meine 2FA-Einrichtung in den Settings zurücksetzen können, um zu einem neuen Gerät zu wechseln
- Als **registrierter User** möchte ich neue Recovery Codes generieren können, um alte Codes zu invalidieren
- Als **registrierter User** möchte ich sehen welche Recovery Codes bereits verwendet wurden, um meine Sicherheit im Blick zu behalten

## Acceptance Criteria

### 2FA Setup Flow (Mandatory für alle User)
- [ ] Nach erfolgreicher Email-Verifizierung (PROJ-1) oder Google OAuth (PROJ-2): Redirect zu "2FA Setup" Screen
- [ ] User kann NICHT App nutzen ohne 2FA-Setup (alle anderen Routes sind blocked)
- [ ] 2FA Setup Screen zeigt:
  - [ ] QR-Code für TOTP-Setup (Secret Key encoded)
  - [ ] Manual Entry Code (falls QR-Scan nicht funktioniert)
  - [ ] Anleitung: "Scanne diesen QR-Code mit deiner Authenticator App (Google Authenticator, Authy, 1Password, etc.)"
  - [ ] Input-Feld: "6-stelliger Code aus deiner App"
  - [ ] Button: "2FA aktivieren"

### 2FA Verification (Setup-Phase)
- [ ] User scannt QR-Code mit Authenticator App
- [ ] User gibt 6-stelligen TOTP-Code ein
- [ ] System validiert Code:
  - [ ] Code korrekt → 2FA aktiviert
  - [ ] Code falsch → Error "Code ungültig. Bitte versuche es erneut." (keine Retry-Limits während Setup)
- [ ] Nach erfolgreicher Aktivierung: Recovery Codes Screen

### Recovery Codes Screen
- [ ] 10 Recovery Codes werden generiert (8-stellige alphanumerische Codes)
- [ ] Screen zeigt:
  - [ ] Liste aller 10 Recovery Codes
  - [ ] Warning: "⚠️ Speichere diese Codes sicher! Jeder Code kann nur einmal verwendet werden."
  - [ ] Button: "Codes herunterladen" (TXT-File)
  - [ ] Button: "Codes drucken" (Print-Dialog)
  - [ ] Checkbox: "Ich habe die Codes sicher gespeichert"
  - [ ] Button: "Weiter" (nur enabled wenn Checkbox checked)
- [ ] Recovery Codes werden encrypted in Database gespeichert
- [ ] Nach "Weiter": User wird zu Onboarding/Dashboard weitergeleitet

### 2FA Login Flow
- [ ] User gibt Email + Passwort ein → Erfolgreiche Authentifizierung
- [ ] System prüft: Ist 2FA aktiviert? → Ja
- [ ] Redirect zu "2FA-Code eingeben" Screen
- [ ] Screen zeigt:
  - [ ] Input-Feld: "6-stelliger Code aus deiner Authenticator App"
  - [ ] Link: "Code nicht verfügbar? Recovery Code verwenden"
  - [ ] Button: "Bestätigen"
- [ ] User gibt TOTP-Code ein:
  - [ ] Code korrekt → Session erstellt (7 Tage), Redirect zu Dashboard
  - [ ] Code falsch → Error "Code ungültig oder abgelaufen. Bitte versuche es erneut."
  - [ ] 3 falsche Codes → Account temporär gesperrt (15 Min), Error: "Zu viele fehlgeschlagene Versuche. Bitte versuche es in 15 Minuten erneut."

### Recovery Code Login
- [ ] User klickt "Recovery Code verwenden" auf 2FA-Code Screen
- [ ] Input-Feld wechselt zu: "8-stelliger Recovery Code"
- [ ] User gibt Recovery Code ein:
  - [ ] Code korrekt + nicht verwendet → Session erstellt, Redirect zu Dashboard
  - [ ] Code bereits verwendet → Error "Recovery Code bereits verwendet"
  - [ ] Code ungültig → Error "Ungültiger Recovery Code"
  - [ ] Nach erfolgreicher Verwendung: Code wird als "verwendet" markiert (kann nicht erneut verwendet werden)
- [ ] Warning nach Recovery Code Login: "⚠️ Du hast einen Recovery Code verwendet. Bitte richte 2FA in den Settings neu ein oder generiere neue Recovery Codes."

### 2FA Management (Settings)
- [ ] Settings-Seite zeigt 2FA-Status: "2FA aktiv seit [Datum]"
- [ ] Button: "2FA zurücksetzen"
  - [ ] Klick öffnet Modal: "Möchtest du 2FA wirklich zurücksetzen? Du musst 2FA anschließend neu einrichten."
  - [ ] Confirmation erfordert Passwort-Eingabe + aktuellen 2FA-Code (oder Recovery Code)
  - [ ] Nach Bestätigung: TOTP Secret gelöscht, Recovery Codes gelöscht, Redirect zu "2FA Setup" Screen (Setup ist verpflichtend!)
- [ ] Button: "Neue Recovery Codes generieren"
  - [ ] Klick erfordert Passwort + 2FA-Code
  - [ ] 10 neue Codes werden generiert, alte Codes werden invalidiert
  - [ ] Recovery Codes Screen wird angezeigt (wie bei Setup)
- [ ] Liste: "Recovery Codes Status"
  - [ ] Zeigt: "X von 10 Codes noch verfügbar"
  - [ ] Zeigt NICHT die Codes selbst (Security)
  - [ ] Zeigt welche Codes verwendet wurden (Datum + IP)

### Security
- [ ] TOTP Secret wird encrypted in Database gespeichert
- [ ] Recovery Codes werden hashed in Database gespeichert (wie Passwörter)
- [ ] TOTP-Validierung: ±1 Time Window (30-Sekunden-Schritte, akzeptiert Code von vorherigem/aktuellem/nächstem Window)
- [ ] Rate Limiting: Max 5 2FA-Code-Versuche pro Session (dann 15 Min Cooldown)
- [ ] Replay Protection: Verwendete TOTP-Codes werden für 90 Sekunden gespeichert (verhindern Re-Use)

## Edge Cases

### Setup Edge Cases
- **User schließt Browser während 2FA-Setup**: Bei nächstem Login: Redirect zu "2FA Setup" (Setup ist verpflichtend)
- **QR-Code funktioniert nicht**: Manual Entry Code als Fallback anzeigen
- **User gibt Code zu früh ein (App noch nicht fertig synced)**: Error "Code ungültig", User kann sofort neu versuchen
- **User scannt QR-Code mit mehreren Apps**: Funktioniert, alle Apps generieren gleichen Code
- **User verliert Recovery Codes Checkbox ohne zu checken**: Button "Weiter" bleibt disabled (User kann nicht weitermachen ohne Bestätigung)

### Login Edge Cases
- **TOTP-Code expired während Eingabe**: Error "Code abgelaufen. Bitte verwende den aktuellen Code aus deiner App."
- **Time-Sync Problem (Server-Zeit ≠ User-Device-Zeit)**: ±1 Window Toleranz fängt die meisten Probleme ab
- **User verwendet gleichen Code 2x**: Zweiter Versuch schlägt fehl (Replay Protection)
- **Alle 10 Recovery Codes verwendet**: User MUSS 2FA zurücksetzen (erfordert Passwort + Support-Kontakt falls kein 2FA-Zugang)
- **User hat Google OAuth UND Email+Passwort verknüpft**: 2FA gilt für BEIDE Login-Methoden

### Management Edge Cases
- **User resettet 2FA während aktiver Session**: Session bleibt aktiv (kein Logout), aber bei nächstem Login muss 2FA neu eingerichtet werden
- **User generiert neue Recovery Codes, alte sind noch heruntergeladen**: Alte TXT-Files sind ungültig (User muss informiert werden)
- **User verliert Authenticator-Gerät + alle Recovery Codes**: Support-Prozess erforderlich (manuelle Account-Verifizierung via Email + ID-Check)

### Cross-Feature Edge Cases
- **Passwort-Reset (PROJ-4) mit aktiver 2FA**: Nach Passwort-Reset muss User 2FA-Code eingeben (2FA bleibt aktiv)
- **Account-Linking (PROJ-2) erfordert 2FA**: Nach Passwort-Eingabe beim Linking auch 2FA-Code verlangen
- **User-Gerät gewechselt (neuer Browser/Computer)**: Kein "Remember this device", 2FA bei JEDEM Login (User-Anforderung)

## Technische Anforderungen

### Performance
- TOTP-Code-Validierung: < 100ms
- QR-Code-Generierung: < 200ms
- Recovery Codes Generierung: < 300ms

### Security Standards
- TOTP Algorithm: RFC 6238 (Time-Based One-Time Password)
- TOTP Parameters:
  - Time Step: 30 Sekunden
  - Code Length: 6 Digits
  - Hash Algorithm: SHA-1 (Standard für Kompatibilität)
- Secret Key: 160-bit (20 bytes) kryptographisch sicher
- Recovery Codes: 8 Zeichen alphanumerisch (A-Z, 0-9, ohne ähnliche Zeichen wie O/0, I/1)

### Backup & Recovery
- Recovery Codes: 10 Codes pro User
- Recovery Code Hash: bcrypt (wie Passwörter)
- Recovery Code Format: XXXX-XXXX (mit Bindestrich für bessere Lesbarkeit)

### Monitoring/Logging
- Log 2FA-Setup-Events (Success/Failure)
- Log 2FA-Login-Attempts (Success/Failure mit Code-Type: TOTP vs Recovery)
- Log Recovery Code Usage (welcher Code, wann, IP)
- Alert bei ungewöhnlich hoher 2FA-Fehlerrate (möglicher Account-Compromise-Versuch)

## Abhängigkeiten
- **PROJ-1 (Email/Passwort Auth)** - 2FA erfolgt nach Passwort-Login
- **PROJ-2 (Google OAuth)** - 2FA erfolgt auch nach OAuth-Login

## Abhängig von diesem Feature
- **PROJ-4 (Passwort-Reset)** - muss 2FA berücksichtigen
- **PROJ-5 (Account Management)** - 2FA-Settings werden dort verwaltet

## Tech Stack Vorschläge (für Solution Architect)
- TOTP Library: `otpauth` oder `speakeasy` (Node.js)
- QR-Code Generator: `qrcode` (Node.js) oder `qrcode.react` (Frontend)
- Encryption: AES-256-GCM für TOTP Secrets
- Storage: Database (encrypted column) für TOTP Secret, hashed column für Recovery Codes

## User Experience Hinweise
- **Onboarding-Friction**: 2FA-Setup verlängert Onboarding, aber ist verpflichtend für Security
- **Recovery Codes Screen**: User muss aktiv bestätigen dass Codes gespeichert wurden (verhindert "Weiter-Klick-Spam")
- **Klare Errors**: Unterscheide zwischen "Code ungültig" vs "Code abgelaufen" vs "Zu viele Versuche"
- **Help-Links**: Link zu "Wie funktioniert 2FA?" FAQ im Setup-Screen
