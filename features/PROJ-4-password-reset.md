# PROJ-4: Passwort-Reset Funktionalität

## Status: 🔵 Planned

## Beschreibung
Ermöglicht Usern ihr Passwort zurückzusetzen falls sie es vergessen haben. Inkludiert sicheren Email-basierten Reset-Flow mit 2FA-Berücksichtigung.

## User Stories

### Passwort vergessen Flow
- Als **User der sein Passwort vergessen hat** möchte ich einen Reset-Link per Email erhalten, um wieder Zugang zu meinem Account zu erhalten
- Als **User** möchte ich ein neues Passwort setzen können, um mich wieder einloggen zu können
- Als **User mit 2FA** möchte ich meinen 2FA-Code oder Recovery Code verwenden müssen beim Passwort-Reset, um sicherzustellen dass nur ich mein Passwort ändern kann

### Passwort ändern (in Settings)
- Als **eingeloggter User** möchte ich mein Passwort in den Settings ändern können, um regelmäßig mein Passwort zu aktualisieren
- Als **eingeloggter User** möchte ich mein altes Passwort eingeben müssen, um sicherzustellen dass nur ich das Passwort ändern kann

## Acceptance Criteria

### "Passwort vergessen" Flow (Login-Screen)
- [ ] "Passwort vergessen?" Link auf Login-Screen
- [ ] Klick führt zu "Passwort zurücksetzen" Screen
- [ ] Screen zeigt:
  - [ ] Input-Feld: "Email-Adresse"
  - [ ] Button: "Reset-Link senden"
  - [ ] Info-Text: "Wir senden dir einen Link zum Zurücksetzen deines Passworts."

### Reset-Link Anforderung
- [ ] User gibt Email ein und klickt "Reset-Link senden"
- [ ] System prüft: Existiert Account mit dieser Email?
  - [ ] Ja → Email mit Reset-Link wird versendet
  - [ ] Nein → **Gleiche Success-Message wie bei "Ja"** (Security: Email-Enumeration verhindern)
- [ ] Success-Screen: "Falls ein Account mit dieser Email existiert, haben wir dir einen Reset-Link gesendet."
- [ ] Email enthält:
  - [ ] Reset-Link (gültig für 1 Stunde)
  - [ ] Info: "Du hast keinen Reset angefordert? Ignoriere diese Email."
  - [ ] Info: "Link läuft ab in 1 Stunde"
- [ ] Rate Limiting: Max 3 Reset-Anfragen pro Email pro Stunde

### Reset-Link Usage
- [ ] User klickt auf Reset-Link in Email → Redirect zu "Neues Passwort setzen" Screen
- [ ] System validiert Reset-Token:
  - [ ] Token gültig + nicht abgelaufen → Zeige Formular
  - [ ] Token ungültig/abgelaufen → Error-Screen: "Link ungültig oder abgelaufen. Bitte fordere einen neuen an."
- [ ] "Neues Passwort setzen" Screen zeigt:
  - [ ] Input-Feld: "Neues Passwort"
  - [ ] Input-Feld: "Passwort bestätigen"
  - [ ] Passwort-Anforderungen (gleich wie PROJ-1)
  - [ ] Button: "Passwort ändern"

### Passwort-Reset mit 2FA (User hat 2FA aktiviert)
- [ ] User klickt auf gültigen Reset-Link
- [ ] System prüft: Hat User 2FA aktiviert?
  - [ ] Nein → Direkt zu "Neues Passwort setzen" Screen
  - [ ] Ja → Zuerst "2FA-Code eingeben" Screen
- [ ] "2FA-Code eingeben" Screen zeigt:
  - [ ] Input-Feld: "6-stelliger Code aus deiner Authenticator App"
  - [ ] Link: "Code nicht verfügbar? Recovery Code verwenden"
  - [ ] Button: "Bestätigen"
- [ ] User gibt TOTP-Code oder Recovery Code ein:
  - [ ] Code korrekt → Redirect zu "Neues Passwort setzen" Screen
  - [ ] Code falsch → Error "Code ungültig. Bitte versuche es erneut."
  - [ ] 3 falsche Codes → Link wird invalidiert, Error: "Zu viele fehlgeschlagene Versuche. Bitte fordere einen neuen Reset-Link an."
- [ ] 2FA bleibt nach Passwort-Reset AKTIV (wird NICHT deaktiviert)

### Neues Passwort setzen
- [ ] User gibt neues Passwort ein (2x zur Bestätigung)
- [ ] System validiert:
  - [ ] Passwort erfüllt Anforderungen (siehe PROJ-1)
  - [ ] Beide Passwort-Felder stimmen überein
  - [ ] Neues Passwort ≠ altes Passwort (optional, erhöht Security)
- [ ] Nach erfolgreicher Validierung:
  - [ ] Passwort wird gehasht und gespeichert (bcrypt, 12 rounds)
  - [ ] Reset-Token wird invalidiert
  - [ ] Alle bestehenden Sessions werden gelöscht (User muss sich neu einloggen)
  - [ ] Success-Screen: "Passwort erfolgreich geändert! Du kannst dich jetzt einloggen."
  - [ ] Button: "Zum Login"

### Passwort ändern (Settings - eingeloggter User)
- [ ] Settings-Seite zeigt Sektion: "Passwort ändern"
- [ ] Formular mit:
  - [ ] Input-Feld: "Aktuelles Passwort"
  - [ ] Input-Feld: "Neues Passwort"
  - [ ] Input-Feld: "Neues Passwort bestätigen"
  - [ ] Button: "Passwort ändern"
- [ ] User gibt Daten ein:
  - [ ] System validiert aktuelles Passwort korrekt
  - [ ] System validiert neues Passwort erfüllt Anforderungen
  - [ ] System validiert beide neue Passwort-Felder stimmen überein
- [ ] Bei erfolgreicher Validierung:
  - [ ] Passwort wird gehasht und gespeichert
  - [ ] User bekommt 2FA-Prompt (falls 2FA aktiv)
  - [ ] Nach 2FA-Bestätigung: Success-Message "Passwort erfolgreich geändert"
  - [ ] Alle anderen Sessions werden gelöscht (außer aktuelle Session)
- [ ] Bei OAuth-Only Accounts (Google, kein Passwort):
  - [ ] Zeige: "Du hast kein Passwort gesetzt. Möchtest du ein Passwort hinzufügen?"
  - [ ] Formular zeigt nur: "Neues Passwort" + "Neues Passwort bestätigen" (kein "Aktuelles Passwort")

### Security Notifications
- [ ] Nach erfolgreichem Passwort-Reset: Email an User
  - [ ] Subject: "Dein Passwort wurde geändert"
  - [ ] Content: "Falls du das nicht warst, kontaktiere sofort den Support."
  - [ ] Link zu Support
- [ ] Nach Passwort-Änderung in Settings: Gleiche Notification-Email

## Edge Cases

### Reset-Link Edge Cases
- **User fordert mehrere Reset-Links an**: Nur der neueste Link ist gültig (alte Links werden invalidiert)
- **Link bereits verwendet**: Error "Link bereits verwendet. Bitte fordere einen neuen an."
- **Link abgelaufen (> 1 Stunde)**: Error "Link abgelaufen. Bitte fordere einen neuen an."
- **User klickt mehrfach auf "Reset-Link senden"**: Rate Limiting greift nach 3. Versuch (Error: "Zu viele Anfragen. Bitte versuche es in 1 Stunde erneut.")
- **User gibt nicht-existierende Email ein**: Gleiche Success-Message (verhindert Email-Enumeration)
- **User manipuliert Reset-Token in URL**: Token-Validierung schlägt fehl (Error: "Ungültiger Link")

### 2FA + Reset Edge Cases
- **User hat 2FA aktiviert aber kein Authenticator-Gerät mehr**: Recovery Code als Fallback verfügbar
- **User hat 2FA aktiviert, alle Recovery Codes verwendet**: User kann Reset NICHT ohne Support durchführen (Support-Prozess erforderlich)
- **User gibt 3x falschen 2FA-Code beim Reset ein**: Link wird invalidiert (verhindert Brute-Force), User muss neuen Link anfordern
- **User hat 2FA aktiviert, verwendet Recovery Code für Reset**: Recovery Code wird als "verwendet" markiert

### Passwort-Anforderungen Edge Cases
- **User versucht gleiches Passwort erneut zu setzen**: Optional-Error "Bitte verwende ein anderes Passwort" (erhöht Security)
- **Passwort-Validierung schlägt fehl**: Zeige spezifische Errors (z.B. "Passwort zu kurz" statt generischer Error)
- **Beide Passwort-Felder stimmen nicht überein**: Error "Passwörter stimmen nicht überein"
- **Copy-Paste in Passwort-Felder**: Erlaubt (für bessere UX mit Password Managern)

### Session Management Edge Cases
- **User ändert Passwort in Settings auf Gerät A, ist auf Gerät B eingeloggt**: Gerät B wird ausgeloggt (Session invalidiert)
- **User ändert Passwort via Reset-Link**: ALLE Sessions werden gelöscht (inkl. potentielle Attacker-Sessions)
- **User ändert Passwort in Settings**: Aktuelle Session bleibt, alle anderen werden gelöscht

### Cross-Feature Edge Cases
- **OAuth-Only Account (Google) versucht Passwort-Reset**:
  - Option 1: Error "Du hast keinen Passwort-Account. Bitte logge dich mit Google ein."
  - Option 2: Erlaube Passwort-Setup (dann wird Account zu Hybrid: Google + Passwort)
  - **Empfehlung: Option 2** (mehr Flexibilität für User)
- **Account-Linking während Passwort-Reset aktiv**: Reset-Link bleibt gültig auch nach Linking

### Email Delivery Edge Cases
- **Email kommt nicht an (Spam-Filter)**: User kann nach 5 Min erneut Request senden
- **User hat keinen Email-Zugriff mehr**: Support-Prozess erforderlich (Email-Änderung via ID-Verifizierung)
- **Email-Provider down**: Async Email-Queue mit Retry-Logic (max 3 Retries über 1 Stunde)

## Technische Anforderungen

### Performance
- Reset-Link Generierung: < 500ms
- Passwort-Hash-Generierung: < 1000ms (bcrypt ist CPU-intensiv)
- Email-Versand: Asynchron (nicht-blockierend)

### Security Standards
- Reset-Token: Kryptographisch sicher (min. 32 bytes random)
- Token Storage: Hashed in Database (wie Passwörter)
- Token TTL: 1 Stunde
- Passwort Hashing: bcrypt mit min. 12 rounds (gleich wie PROJ-1)
- Rate Limiting:
  - Max 3 Reset-Anfragen pro Email pro Stunde
  - Max 5 Reset-Anfragen pro IP pro Stunde
- HTTPS-only für alle Reset-Flows

### Email Content
- Plain Text + HTML Version
- Reset-Link mit Token-Parameter
- Klare Instruktionen
- Support-Link
- "Not you?" Hinweis

### Monitoring/Logging
- Log Reset-Anfragen (Email, IP, Timestamp)
- Log erfolgreiche/fehlgeschlagene Passwort-Resets
- Log 2FA-Versuche während Reset
- Alert bei ungewöhnlich hoher Reset-Rate (möglicher Angriff)

## Abhängigkeiten
- **PROJ-1 (Email/Passwort Auth)** - Passwort-Reset betrifft Passwort-Accounts
- **PROJ-3 (2FA)** - Falls aktiviert, muss 2FA-Check während Reset erfolgen

## Abhängig von diesem Feature
- Keine direkten Abhängigkeiten

## Tech Stack Vorschläge (für Solution Architect)
- Token Generation: `crypto.randomBytes()` (Node.js)
- Token Hashing: bcrypt oder SHA-256
- Email-Provider: SendGrid, AWS SES, oder Resend
- Queue für Email-Versand: Redis Queue oder Database Queue
- Token Storage: Database (hashed, mit TTL)

## User Experience Hinweise
- **Generic Success Messages**: "Falls ein Account existiert..." verhindert Email-Enumeration (Security > UX)
- **Clear Token Expiry**: "Link läuft ab in 1 Stunde" gibt User Zeitrahmen
- **2FA während Reset**: Kann frustrierend sein wenn User Authenticator verloren hat → Recovery Codes sind wichtig!
- **Session Invalidation**: User muss verstehen warum sie auf anderen Geräten ausgeloggt werden (Security-Notification-Email)
- **Support-Option**: Für Edge-Cases (2FA verloren + keine Recovery Codes) → Support-Link prominent platzieren
