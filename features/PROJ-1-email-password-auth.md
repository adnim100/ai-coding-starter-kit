# PROJ-1: Email/Passwort Registrierung & Login

## Status: 🔵 Planned

## Beschreibung
Ermöglicht Usern die Registrierung und den Login in ProjectHub mit Email und Passwort. Dies ist die Basis-Authentifizierungsmethode für die Transkriptions-Vergleichs-Plattform.

## User Stories

### Registrierung
- Als **neuer User** möchte ich mich mit Email und Passwort registrieren, um Zugang zu ProjectHub zu erhalten
- Als **neuer User** möchte ich eine Bestätigungs-Email erhalten, um meine Email-Adresse zu verifizieren
- Als **neuer User** möchte ich klare Passwort-Anforderungen sehen, um ein sicheres Passwort zu erstellen
- Als **System** möchte ich prüfen, ob eine Email bereits registriert ist, um Duplikate zu vermeiden

### Login
- Als **registrierter User** möchte ich mich mit Email und Passwort einloggen, um auf meine Transkriptions-Projekte zuzugreifen
- Als **registrierter User** möchte ich nach erfolgreichem Login für 7 Tage eingeloggt bleiben, um nicht bei jedem Besuch neu einloggen zu müssen
- Als **registrierter User** möchte ich mich ausloggen können, um meine Session zu beenden

### Email-Verifizierung
- Als **neuer User** möchte ich einen Verifizierungs-Link per Email erhalten, um meine Email-Adresse zu bestätigen
- Als **neuer User** möchte ich erst nach Email-Verifizierung auf die App zugreifen können, um sicherzustellen dass meine Email korrekt ist
- Als **neuer User** möchte ich den Verifizierungs-Link erneut anfordern können, falls ich die Email nicht erhalten habe

## Acceptance Criteria

### Registrierung
- [ ] Registrierungs-Formular mit Feldern: Email, Passwort, Passwort-Bestätigung
- [ ] Passwort-Anforderungen werden angezeigt:
  - [ ] Mindestens 12 Zeichen
  - [ ] Mindestens 1 Großbuchstabe
  - [ ] Mindestens 1 Kleinbuchstabe
  - [ ] Mindestens 1 Zahl
  - [ ] Mindestens 1 Sonderzeichen
- [ ] Email-Validierung (gültiges Format)
- [ ] Passwort und Passwort-Bestätigung müssen übereinstimmen
- [ ] Bei bereits registrierter Email: Fehlermeldung "Account existiert bereits. Zum Login?" mit Link zum Login
- [ ] Nach erfolgreicher Registrierung: Weiterleitung zu "Email verifizieren" Screen
- [ ] Automatischer Email-Versand mit Verifizierungs-Link (Link gültig für 24 Stunden)

### Email-Verifizierung
- [ ] "Email verifizieren" Screen zeigt: "Wir haben dir eine Email an [email] gesendet. Bitte klicke auf den Link."
- [ ] Button "Email erneut senden" (Rate Limit: max 3x pro Stunde)
- [ ] Verifizierungs-Link führt zu Success-Screen: "Email bestätigt! Du kannst dich jetzt einloggen."
- [ ] Ungültige/abgelaufene Links zeigen Error: "Link ungültig oder abgelaufen. Bitte fordere einen neuen an."
- [ ] User kann sich NICHT einloggen vor Email-Verifizierung (Error: "Bitte bestätige zuerst deine Email")

### Login
- [ ] Login-Formular mit Feldern: Email, Passwort
- [ ] "Passwort vergessen?" Link (führt zu PROJ-4)
- [ ] Bei erfolgreicher Authentifizierung: Session-Cookie gesetzt (expires: 7 Tage)
- [ ] Bei falschen Credentials: Generic Error "Email oder Passwort falsch" (kein Hinweis welches Feld falsch ist)
- [ ] Nach 3 fehlgeschlagenen Login-Versuchen innerhalb 15 Minuten: Account temporär gesperrt (15 Min Cooldown)
- [ ] Sperrung zeigt Error: "Zu viele fehlgeschlagene Versuche. Bitte versuche es in 15 Minuten erneut."
- [ ] Erfolgreicher Login leitet zu Onboarding (neue User) oder Dashboard (returning User) - siehe PROJ-1 Dependency

### Logout
- [ ] "Logout" Button im User-Menü
- [ ] Logout löscht Session-Cookie
- [ ] Logout leitet zu Login-Screen weiter

### Security
- [ ] Passwörter werden mit bcrypt (min. 12 rounds) gehasht
- [ ] Session-Tokens sind kryptographisch sicher (min. 32 Bytes Random)
- [ ] HTTPS-only für alle Auth-Requests
- [ ] CSRF-Protection für Login/Logout
- [ ] Rate Limiting: Max 5 Registrierungen pro IP pro Stunde

## Edge Cases

### Registrierung Edge Cases
- **Whitespace in Email**: Email wird getrimmt (leading/trailing spaces entfernt)
- **Email Case-Sensitivity**: Emails werden lowercase gespeichert (user@example.com = USER@EXAMPLE.COM)
- **Disposable Email Domains**: Akzeptieren (kein Blocking von temp-mail.org etc.)
- **Copy-Paste Passwort**: Erlaubt (kein Blocking)
- **Browser Autocomplete**: Erlaubt für bessere UX
- **Bereits verifizierte Email erneut verifizieren**: Success-Screen zeigt "Email bereits bestätigt"
- **User klickt mehrfach auf "Registrieren"**: Button disabled nach erstem Klick (Loading State)

### Login Edge Cases
- **Login während Rate-Limit-Sperre**: Zeige verbleibende Zeit: "Zu viele Versuche. Versuche es in X Minuten erneut."
- **Login mit unverifizierter Email**: Error "Bitte bestätige zuerst deine Email" + Button "Email erneut senden"
- **Session läuft während aktiver Nutzung ab**: Auto-Refresh Session wenn User aktiv (API-Request extend Session um 7 Tage)
- **Mehrere Tabs offen, Logout in einem Tab**: Alle Tabs erkennen Logout (BroadcastChannel API oder Polling)
- **Login auf mehreren Geräten gleichzeitig**: Erlaubt (keine Session-Limits)

### Email-Verifizierung Edge Cases
- **Link bereits verwendet**: Success-Screen "Email bereits bestätigt"
- **Link abgelaufen**: Error mit Button "Neuen Link anfordern"
- **User ändert Email im Token manuell**: Token-Validierung schlägt fehl (Error: "Ungültiger Link")
- **3x "Email erneut senden" Limit erreicht**: Disable Button für 1 Stunde, zeige: "Limit erreicht. Versuche es in 1 Stunde erneut."

## Technische Anforderungen

### Performance
- Login-Response: < 500ms (p95)
- Registrierungs-Response: < 1000ms (p95)
- Email-Versand: Asynchron (nicht-blockierend)

### Security Standards
- OWASP Top 10 Compliance
- Password Hashing: bcrypt mit min. 12 rounds
- Session Tokens: Cryptographically secure random (32+ bytes)
- HTTPS-only (keine HTTP-Verbindungen)
- Rate Limiting auf allen Auth-Endpoints

### Monitoring/Logging
- Log fehlgeschlagene Login-Versuche (für Security-Monitoring)
- Log Email-Versand-Fehler
- Alert bei ungewöhnlich hoher Rate von fehlgeschlagenen Logins (möglicher Brute-Force-Angriff)

## Abhängigkeiten
- Keine (dies ist das Basis-Feature für User-Authentifizierung)

## Abhängig von diesem Feature
- PROJ-2 (Google OAuth) - für Account-Linking
- PROJ-3 (2FA) - erfordert erfolgreichen Login
- PROJ-4 (Passwort-Reset) - erfordert existierenden Account
- PROJ-5 (Account Management) - erfordert authentifizierten User

## Tech Stack Vorschläge (für Solution Architect)
- Email-Provider: SendGrid, AWS SES, oder Resend
- Session-Storage: Redis oder Database (encrypted)
- Rate Limiting: Redis oder In-Memory (für kleine Deployment)
