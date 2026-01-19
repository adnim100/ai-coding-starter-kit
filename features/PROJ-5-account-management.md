# PROJ-5: Account Management & Deletion

## Status: 🔵 Planned

## Beschreibung
Ermöglicht Usern die Verwaltung ihres ProjectHub-Accounts inkl. Profil-Settings, Email-Änderung, Daten-Aufbewahrung und Account-Löschung mit konfigurierbarer Löschfrist.

## User Stories

### Account Settings
- Als **registrierter User** möchte ich meine Profil-Informationen (Name, Profilbild) ändern können, um mein Profil aktuell zu halten
- Als **registrierter User** möchte ich meine Email-Adresse ändern können, um eine neue Email zu verwenden
- Als **registrierter User** möchte ich sehen welche Login-Methoden ich aktiviert habe (Email+Passwort, Google), um meine Account-Optionen zu verstehen

### Account Deletion
- Als **registrierter User** möchte ich meinen Account löschen können, um meine Daten aus ProjectHub zu entfernen
- Als **registrierter User** möchte ich eine Löschfrist selbst definieren können, um zu entscheiden wie lange meine Daten aufbewahrt werden
- Als **registrierter User** möchte ich während der Löschfrist meinen Account wiederherstellen können, um versehentliche Löschungen rückgängig zu machen
- Als **registrierter User** möchte ich verstehen welche Daten gelöscht werden, um eine informierte Entscheidung zu treffen

### Data Retention
- Als **registrierter User** möchte ich meine Transkriptions-Daten (Audio-Files, Transkripte) separat verwalten können, um Flexibilität bei der Datenlöschung zu haben
- Als **registrierter User** möchte ich eine Übersicht meiner gespeicherten Daten sehen, um zu verstehen was ProjectHub über mich speichert

## Acceptance Criteria

### Account Settings Screen
- [ ] Settings-Seite ist nur für eingeloggte User zugänglich
- [ ] Navigation: User-Menü → "Settings"
- [ ] Settings-Tabs:
  - [ ] "Profil" - Name, Profilbild, Email
  - [ ] "Sicherheit" - Passwort ändern (PROJ-4), 2FA (PROJ-3), Login-Methoden
  - [ ] "Daten & Privacy" - Data Download, Löschfrist-Einstellungen
  - [ ] "Account löschen" - Account-Deletion-Flow

### Profil-Tab
- [ ] Formular mit:
  - [ ] Input-Feld: "Name" (pre-filled mit aktuellem Namen)
  - [ ] Profilbild Upload (optional):
    - [ ] Unterstützte Formate: JPG, PNG (max 5 MB)
    - [ ] Preview nach Upload
    - [ ] Button: "Bild entfernen" (setzt auf Default Avatar)
  - [ ] Display-Only: "Email" (mit "Ändern" Button)
  - [ ] Button: "Änderungen speichern"
- [ ] Nach "Speichern": Success-Message "Profil aktualisiert"

### Email-Änderung Flow
- [ ] User klickt "Ändern" neben Email → Modal öffnet
- [ ] Modal zeigt:
  - [ ] Input-Feld: "Neue Email"
  - [ ] Input-Feld: "Aktuelles Passwort" (Sicherheits-Check)
  - [ ] Button: "Email ändern"
- [ ] Nach Submit:
  - [ ] System validiert Passwort korrekt
  - [ ] System prüft: Neue Email bereits registriert? → Error "Email bereits verwendet"
  - [ ] System sendet Bestätigungs-Email an NEUE Email mit Verifizierungs-Link
  - [ ] Info-Screen: "Wir haben eine Bestätigungs-Email an [neue-email] gesendet. Bitte klicke auf den Link."
  - [ ] Email bleibt auf alter Adresse bis Link geklickt wird
- [ ] User klickt Link in Email:
  - [ ] Email wird aktualisiert
  - [ ] Notification-Email an ALTE Email: "Deine Email wurde geändert zu [neue-email]"
  - [ ] Success-Screen: "Email erfolgreich geändert!"
- [ ] Link gültig für: 24 Stunden

### Sicherheits-Tab
- [ ] Sektion: "Passwort"
  - [ ] Button: "Passwort ändern" (siehe PROJ-4)
  - [ ] Für OAuth-Only Accounts: "Kein Passwort gesetzt. Passwort hinzufügen?"
- [ ] Sektion: "Two-Factor Authentication"
  - [ ] Status: "2FA aktiv seit [Datum]"
  - [ ] Button: "2FA zurücksetzen" (siehe PROJ-3)
  - [ ] Button: "Neue Recovery Codes generieren" (siehe PROJ-3)
  - [ ] Info: "X von 10 Recovery Codes verfügbar"
- [ ] Sektion: "Login-Methoden"
  - [ ] Liste aktiver Methoden:
    - [ ] "Email + Passwort" (falls gesetzt)
    - [ ] "Google OAuth" (falls verknüpft)
  - [ ] Für OAuth: Button "Verknüpfung entfernen" (nur wenn mindestens 1 andere Methode aktiv)
  - [ ] Für Passwort: Info "Zum Entfernen des Passworts kontaktiere Support" (Security: min. 1 Login-Methode erforderlich)

### Daten & Privacy Tab
- [ ] Sektion: "Daten herunterladen"
  - [ ] Button: "Meine Daten herunterladen (DSGVO)"
  - [ ] Klick generiert ZIP-File mit:
    - [ ] Account-Daten (JSON): Email, Name, Registrierungsdatum
    - [ ] Transkriptions-Projekte (JSON): Projekt-Metadaten
    - [ ] Audio-Files (original Upload-Files)
    - [ ] Transkripte (TXT/JSON)
  - [ ] Download-Link per Email (generiert asynchron, gültig 7 Tage)
- [ ] Sektion: "Löschfrist-Einstellungen"
  - [ ] Input-Feld: "Löschfrist in Tagen" (Default: 30, Range: 0-90)
  - [ ] Info: "Nach Account-Löschung werden deine Daten nach X Tagen endgültig gelöscht. Bis dahin kannst du deinen Account wiederherstellen."
  - [ ] Checkbox: "Sofort löschen (0 Tage)" - für User die keine Aufbewahrung wollen
  - [ ] Button: "Einstellung speichern"
  - [ ] Success-Message: "Löschfrist auf X Tage gesetzt"

### Account löschen Tab
- [ ] Warning-Banner: "⚠️ Account-Löschung ist endgültig! Bitte lies die Informationen sorgfältig."
- [ ] Info-Box: "Was wird gelöscht?"
  - [ ] Account-Daten (Email, Name, Passwort-Hash)
  - [ ] Transkriptions-Projekte und Metadaten
  - [ ] Audio-Files (Uploads)
  - [ ] Transkripte
  - [ ] Session-Daten
  - [ ] 2FA-Einstellungen
- [ ] Info-Box: "Löschfrist"
  - [ ] Aktuelle Einstellung: "X Tage" (aus Daten & Privacy Tab)
  - [ ] "Während dieser Frist kannst du deinen Account wiederherstellen."
  - [ ] Link: "Löschfrist ändern" (führt zu Daten & Privacy Tab)
- [ ] Formular:
  - [ ] Input-Feld: "Gib 'DELETE' ein um zu bestätigen" (muss exakt "DELETE" sein)
  - [ ] Input-Feld: "Aktuelles Passwort" (Sicherheits-Check)
  - [ ] Falls 2FA aktiv: Input-Feld: "2FA-Code"
  - [ ] Checkbox: "Ich verstehe dass meine Daten nach X Tagen endgültig gelöscht werden"
  - [ ] Button: "Account unwiderruflich löschen" (Danger-Style: rot)
- [ ] Nach Submit:
  - [ ] System validiert Passwort korrekt
  - [ ] Falls 2FA: System validiert 2FA-Code
  - [ ] Falls "DELETE" nicht korrekt: Error "Bitte gib exakt 'DELETE' ein"
  - [ ] Account wird auf "scheduled_for_deletion" Status gesetzt
  - [ ] Deletion_Date = NOW + Löschfrist (in Tagen)
  - [ ] User wird ausgeloggt (alle Sessions gelöscht)
  - [ ] Email an User: "Account zur Löschung vorgemerkt. Löschung erfolgt am [Datum]. Zum Wiederherstellen: [Link]"
  - [ ] Redirect zu Info-Screen: "Account zur Löschung vorgemerkt. Du erhältst eine Bestätigungs-Email."

### Account Wiederherstellung (während Löschfrist)
- [ ] User klickt auf Wiederherstellungs-Link in Email (oder geht zu Login)
- [ ] Login-Screen zeigt für gelöschte Accounts: Banner "Account zur Löschung vorgemerkt (Löschung am [Datum]). Wiederherstellen?"
- [ ] Button: "Account wiederherstellen"
- [ ] Nach Klick:
  - [ ] User muss sich einloggen (Email+Passwort oder Google OAuth)
  - [ ] Falls 2FA aktiv: 2FA-Code erforderlich
  - [ ] Nach erfolgreicher Auth: Account-Status zurück auf "active"
  - [ ] Deletion_Date wird gelöscht
  - [ ] Success-Screen: "Account erfolgreich wiederhergestellt!"
  - [ ] Email an User: "Account wiederhergestellt"
  - [ ] Redirect zu Dashboard

### Automatische Account-Löschung (Cron Job)
- [ ] Täglicher Cron Job (z.B. 03:00 UTC) prüft:
  - [ ] Gibt es Accounts mit Status "scheduled_for_deletion" UND Deletion_Date <= NOW?
  - [ ] Für jeden Match:
    - [ ] Hard-Delete Account-Daten aus Database
    - [ ] Lösche Audio-Files aus Storage (S3, Cloud Storage, etc.)
    - [ ] Lösche Transkripte aus Database/Storage
    - [ ] Lösche Sessions
    - [ ] Lösche 2FA-Daten
    - [ ] Log Deletion-Event (für Compliance/Audit)
    - [ ] Optional: Anonymisierte Metrics behalten (z.B. "Account gelöscht am X", ohne User-ID)

### Security & Validierung
- [ ] Email-Änderung erfordert Passwort + Email-Verifizierung
- [ ] Account-Löschung erfordert Passwort + 2FA (falls aktiv) + "DELETE" Confirmation
- [ ] Mindestens 1 Login-Methode muss aktiv bleiben (User kann nicht alle Methoden entfernen)
- [ ] HTTPS-only für alle Settings-Änderungen
- [ ] CSRF-Protection auf allen Forms

## Edge Cases

### Profil-Update Edge Cases
- **User uploaded Profilbild > 5 MB**: Error "Datei zu groß. Max. 5 MB."
- **Unsupported Image Format (z.B. GIF, WebP)**: Error "Format nicht unterstützt. Bitte JPG oder PNG verwenden."
- **User ändert Name zu leerem String**: Error "Name darf nicht leer sein"
- **User uploaded Profilbild ist kein gültiges Image**: Error "Ungültige Bilddatei"
- **Google OAuth User hat kein Passwort gesetzt**: Email-Änderung erfordert 2FA-Code statt Passwort

### Email-Änderung Edge Cases
- **User ändert Email zu bereits registrierter Email**: Error "Email bereits verwendet"
- **User klickt Verifizierungs-Link, Email wurde zwischenzeitlich geändert**: Link invalid (Token ist Email-spezifisch)
- **User fordert mehrere Email-Änderungen an**: Nur neueste Änderung ist gültig (alte Links werden invalidiert)
- **Verifizierungs-Link abgelaufen (> 24h)**: Error "Link abgelaufen. Bitte fordere eine neue Änderung an."
- **User hat keinen Zugriff mehr auf alte Email**: Support-Prozess erforderlich (manuelle Email-Änderung via ID-Check)

### Account-Löschung Edge Cases
- **User tippt "delete" statt "DELETE"**: Error "Bitte gib exakt 'DELETE' ein (Großbuchstaben)"
- **User klickt mehrfach auf "Account löschen"**: Button disabled nach erstem Klick (Loading State)
- **User löscht Account, Löschfrist = 0 Tage**: Sofortige Löschung (kein Wiederherstellungs-Link)
- **User löscht Account, hat aktive Transkriptions-Jobs laufend**: Jobs werden abgebrochen, User wird informiert
- **Cron Job schlägt fehl (Storage-Error beim Datei-Löschen)**: Retry-Logic (max 3 Retries), Alert an Admins bei Failure

### Wiederherstellungs Edge Cases
- **User versucht Wiederherstellung nach Löschfrist**: Account bereits gelöscht, Login zeigt: "Account nicht gefunden"
- **User versucht Wiederherstellung, gibt falsches Passwort**: Normale Login-Rate-Limiting greift
- **User restored Account am letzten Tag der Frist**: Deletion_Date wird gelöscht, Account ist safe

### Login-Methoden Edge Cases
- **User entfernt Google OAuth, hat kein Passwort gesetzt**: Error "Du musst erst ein Passwort setzen bevor du Google OAuth entfernen kannst"
- **User entfernt letzte Login-Methode**: Nicht erlaubt (mindestens 1 Methode muss aktiv bleiben)
- **OAuth-Verknüpfung entfernen erfordert Bestätigung**: Modal "Bist du sicher? Du kannst dich danach nicht mehr mit Google einloggen."

### DSGVO Data Download Edge Cases
- **User fordert mehrere Downloads an**: Alle Requests werden verarbeitet (kein Limit), aber Max 1 aktiver Generation-Job pro User
- **Download-Generierung schlägt fehl (Storage Error)**: Error-Email an User: "Download fehlgeschlagen. Bitte versuche es erneut oder kontaktiere Support."
- **User löscht Account während Download-Generierung läuft**: Job wird abgebrochen, kein Download-Link versendet

## Technische Anforderungen

### Performance
- Profil-Update: < 500ms
- Email-Änderung (Link-Versand): < 1000ms
- Account-Löschung (Status-Update): < 500ms
- Data-Download-Generierung: Asynchron (kann mehrere Minuten dauern)
- Cron Job: Sollte < 5 Min laufen für 1000 Accounts

### Storage Management
- Profilbilder: Cloud Storage (S3, Cloudinary, etc.)
- Audio-Files: Cloud Storage mit Lifecycle Policy (automatische Löschung nach X Tagen für deleted Accounts)
- Data Downloads: Temp Storage (gelöscht nach 7 Tagen)

### Compliance (DSGVO)
- Data Download muss ALLE User-Daten enthalten
- Account-Löschung muss ALLE personenbezogenen Daten entfernen
- Logs dürfen keine personenbezogenen Daten nach Löschung enthalten (oder anonymisiert)
- User muss Export-Recht haben (DSGVO Art. 20)

### Monitoring/Logging
- Log Email-Änderungen (Old Email → New Email, Timestamp)
- Log Account-Löschungen (User-ID, Deletion_Date, Status)
- Log Account-Wiederherstellungen
- Log Data-Download-Requests
- Alert bei ungewöhnlich hoher Löschungs-Rate (möglicher Mass-Exit)

## Abhängigkeiten
- **PROJ-1 (Email/Passwort Auth)** - Passwort-Checks für Settings-Änderungen
- **PROJ-2 (Google OAuth)** - OAuth-Verknüpfung verwalten
- **PROJ-3 (2FA)** - 2FA-Codes für sensible Settings-Änderungen
- **PROJ-4 (Passwort-Reset)** - Passwort-Änderung in Settings

## Abhängig von diesem Feature
- Keine direkten Abhängigkeiten

## Tech Stack Vorschläge (für Solution Architect)
- Image Upload: Cloudinary, AWS S3, oder Google Cloud Storage
- Cron Jobs: Node-Cron, AWS Lambda (scheduled), oder Database-Triggers
- Data Export: ZIP-Library (archiver.js), Queue-basiert (Bull, BullMQ)
- Email-Service: SendGrid, AWS SES, oder Resend
- Storage Cleanup: Cloud Storage Lifecycle Policies (automatische Löschung nach X Tagen)

## User Experience Hinweise
- **Clear Warnings**: Account-Löschung ist ernst, UX sollte deutlich warnen
- **Löschfrist-Flexibilität**: User-definierte Löschfrist (0-90 Tage) gibt Kontrolle
- **Wiederherstellungs-Link**: Muss prominent in Deletion-Email platziert werden
- **Progress Indicators**: Data-Download kann lange dauern → "Wir generieren deine Daten, du erhältst eine Email wenn fertig"
- **Support-Links**: Bei komplexen Cases (Email-Zugriff verloren, 2FA verloren) → Support prominent anbieten
