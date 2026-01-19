# PROJ-2: Google OAuth Integration

## Status: 🔵 Planned

## Beschreibung
Ermöglicht Usern die 1-Click Registrierung und den Login mit ihrem Google-Account. Vereinfacht den Onboarding-Prozess und reduziert Passwort-Management für User.

## User Stories

### OAuth Registrierung
- Als **neuer User** möchte ich mich mit meinem Google-Account registrieren, um schnell Zugang zu ProjectHub zu erhalten ohne Passwort zu erstellen
- Als **neuer User** möchte ich sehen welche Berechtigungen ProjectHub von meinem Google-Account benötigt, um eine informierte Entscheidung zu treffen
- Als **neuer User** möchte ich nach erfolgreicher OAuth-Registrierung direkt eingeloggt sein, um sofort loszulegen

### OAuth Login
- Als **registrierter User (via Google)** möchte ich mich mit einem Klick auf "Login mit Google" einloggen, um schnell Zugang zu erhalten
- Als **registrierter User (via Google)** möchte ich nach Login für 7 Tage eingeloggt bleiben, um nicht bei jedem Besuch neu einloggen zu müssen

### Account Linking
- Als **existierender User (Email/Passwort)** möchte ich meinen Google-Account verknüpfen, um zukünftig auch via Google einloggen zu können
- Als **User mit Google-Account** der versucht sich mit bereits registrierter Email zu registrieren, möchte ich gefragt werden ob ich die Accounts verknüpfen möchte, um beide Login-Methoden nutzen zu können

## Acceptance Criteria

### OAuth Setup
- [ ] "Login mit Google" Button auf Login-Screen
- [ ] "Registrieren mit Google" Button auf Registrierungs-Screen
- [ ] Google OAuth 2.0 Integration (Scopes: email, profile)
- [ ] OAuth-Flow öffnet Google-Login in Popup oder neuem Tab

### Neue User Registration (via Google)
- [ ] User klickt "Registrieren mit Google" → Google OAuth-Flow startet
- [ ] Nach erfolgreicher Google-Authentifizierung: Account wird automatisch erstellt
- [ ] User-Daten von Google übernommen:
  - [ ] Email (aus Google-Account)
  - [ ] Name (aus Google-Account)
  - [ ] Profilbild URL (optional)
- [ ] Email ist automatisch verifiziert (kein Email-Verifizierungs-Flow nötig)
- [ ] Session-Cookie wird gesetzt (expires: 7 Tage)
- [ ] User wird zu Onboarding weitergeleitet (neue User)
- [ ] Account wird als "OAuth-Account" markiert (kein Passwort gesetzt)

### Bestehender User Login (via Google)
- [ ] User klickt "Login mit Google" → Google OAuth-Flow startet
- [ ] System prüft: Ist Google-Email bereits als OAuth-Account registriert?
- [ ] Bei Match: Session-Cookie gesetzt, Weiterleitung zu Dashboard
- [ ] Bei No-Match: Siehe "Account Linking Flow"

### Account Linking Flow
- [ ] User versucht Login/Registrierung via Google mit Email die bereits existiert (Email/Passwort-Account)
- [ ] System zeigt Dialog: "Account existiert bereits. Möchtest du deinen Google-Account verknüpfen?"
  - [ ] Option 1: "Ja, Accounts verknüpfen" (Recommended)
  - [ ] Option 2: "Nein, anderen Account verwenden"
- [ ] Bei "Ja, Accounts verknüpfen":
  - [ ] User muss Passwort eingeben (Sicherheits-Check)
  - [ ] Nach korrektem Passwort: Google-Account wird verknüpft
  - [ ] User ist eingeloggt, kann zukünftig mit Email+Passwort ODER Google einloggen
  - [ ] Success-Message: "Google-Account erfolgreich verknüpft!"
- [ ] Bei "Nein, anderen Account verwenden":
  - [ ] Zurück zu Login-Screen
  - [ ] Hinweis: "Bitte verwende eine andere Email für deinen Google-Account"

### Reverse Account Linking (Email/Passwort zu bestehendem Google-Account hinzufügen)
- [ ] User hat sich via Google registriert
- [ ] User kann in Account Settings ein Passwort setzen (siehe PROJ-5)
- [ ] Nach Passwort-Setup: User kann mit Email+Passwort ODER Google einloggen

### Security
- [ ] OAuth State Parameter gegen CSRF (kryptographisch sicher)
- [ ] OAuth Callback URL validieren (nur allowed domains)
- [ ] Google Access Token wird NICHT gespeichert (nur als Session-Token verwenden)
- [ ] Google Refresh Token speichern für zukünftige API-Calls (optional, falls benötigt)
- [ ] Rate Limiting: Max 10 OAuth-Versuche pro IP pro Stunde

## Edge Cases

### OAuth Flow Edge Cases
- **User bricht Google-Login ab**: Zurück zu Login/Registrierungs-Screen, keine Error-Message nötig
- **User declined Permissions**: Error "Google-Login fehlgeschlagen. Bitte erlaube Zugriff auf Email und Profil."
- **Google API Fehler/Timeout**: Error "Login fehlgeschlagen. Bitte versuche es erneut." (Generic Message)
- **Network Error während OAuth-Flow**: Error "Verbindungsproblem. Bitte prüfe deine Internetverbindung."
- **User klickt mehrfach auf "Login mit Google"**: Button disabled nach erstem Klick (Loading State)

### Account Linking Edge Cases
- **User gibt falsches Passwort bei Linking ein**: Error "Passwort falsch" (max 3 Versuche, dann Rate-Limit wie PROJ-1)
- **User versucht gleichen Google-Account 2x zu verknüpfen**: Success-Message "Google-Account bereits verknüpft"
- **User hat 2FA aktiviert (PROJ-3) und versucht Account Linking**: Nach Passwort-Eingabe auch 2FA-Code verlangen
- **Email in Google-Account unterscheidet sich von registrierter Email (Case)**: Lowercase-Vergleich (user@gmail.com = USER@GMAIL.COM)
- **Google ändert User Email nach Verknüpfung**: Bei nächstem Login: Google-Email aktualisieren (aber Primary Email bleibt original)

### Session & Multi-Login Edge Cases
- **User hat Email+Passwort UND Google verknüpft, logged mit Methode A ein**: Session gilt für beide Methoden
- **User logged mit Google ein, Google-Session läuft ab**: User muss sich neu einloggen (7 Tage Session in ProjectHub, aber Google-Token kann früher expiren)
- **User löscht Google-Account extern**: Nächster Login via Google schlägt fehl, Error: "Google-Account nicht gefunden. Bitte verwende Email/Passwort Login." (falls verknüpft)

### Data Sync Edge Cases
- **Google ändert Profilbild**: Bei jedem Login Profilbild URL aktualisieren (optional, basierend auf Product Decision)
- **Google ändert Namen**: User-Name in ProjectHub NICHT automatisch überschreiben (User kann in Settings manuell ändern)
- **Keine Profilbild URL von Google**: Default Avatar anzeigen

## Technische Anforderungen

### Performance
- OAuth-Flow (Roundtrip zu Google): < 3 Sekunden (p95)
- Account-Linking: < 500ms (nach Passwort-Validierung)

### Security Standards
- OAuth 2.0 Best Practices (RFC 6749)
- State Parameter für CSRF-Protection
- HTTPS-only für Callback URLs
- Validate Google ID Token (verify signature mit Google Public Keys)

### Google OAuth Scopes
- `email` (required) - für Account-Identifizierung
- `profile` (required) - für Name und Profilbild
- Keine weiteren Scopes (Principle of Least Privilege)

### Error Handling
- Generic Error Messages für User (keine technischen Details)
- Detailliertes Logging für Debugging:
  - Log OAuth Errors mit Error Code
  - Log Account-Linking Attempts
  - Alert bei hoher OAuth-Fehlerrate

## Abhängigkeiten
- **PROJ-1 (Email/Passwort Auth)** - benötigt für Account-Linking, Passwort-Validierung
- **PROJ-3 (2FA)** - falls aktiviert, muss 2FA-Check auch bei Account-Linking erfolgen

## Abhängig von diesem Feature
- Keine direkten Abhängigkeiten

## Tech Stack Vorschläge (für Solution Architect)
- OAuth Library: `next-auth` (für Next.js) oder `passport-google-oauth20`
- Google OAuth API: https://console.cloud.google.com/apis/credentials
- Token Storage: Database (encrypted) oder Redis
- State Parameter Storage: Redis (TTL: 10 Minuten)

## Setup Requirements (für Developer)
- Google Cloud Project erstellen
- OAuth 2.0 Client ID & Secret generieren
- Authorized Redirect URIs konfigurieren:
  - Development: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://projecthub.com/api/auth/callback/google`
