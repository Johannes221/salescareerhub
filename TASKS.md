# SalesCareerHub – Aufgaben & Setup

Stand: 2026-03-10 14:35

---

## 👤 SETUP-ANLEITUNG (das musst DU machen)

### Schritt 1: MongoDB Atlas einrichten

1. Gehe zu [cloud.mongodb.com](https://cloud.mongodb.com) und erstelle einen Account
2. Erstelle einen **Free Shared Cluster** (M0)
3. Unter **Database Access** → Neuen User anlegen (Username + Passwort merken)
4. Unter **Network Access** → `0.0.0.0/0` hinzufügen (erlaubt alle IPs, für Dev ok)
5. Unter **Database** → **Connect** → **Drivers** → Connection String kopieren
6. Der String sieht so aus: `mongodb+srv://DEIN_USER:DEIN_PASSWORT@cluster0.xxxxx.mongodb.net/salescareerhub?retryWrites=true&w=majority`

### Schritt 2: Firebase einrichten

1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
2. **Neues Projekt erstellen** (Name egal, z.B. "salescareerhub")
3. **Authentication** → **Erste Schritte** → **E-Mail/Passwort** aktivieren
4. **Projekteinstellungen** (Zahnrad oben) → **Allgemein** → runterscrollen → **Web-App hinzufügen** (</> Icon)
5. Die angezeigten Config-Werte kopieren (apiKey, authDomain, projectId, etc.)
6. **Projekteinstellungen** → **Dienstkonten** → **Neuen privaten Schlüssel generieren** → JSON speichern
7. Aus der JSON: `project_id`, `client_email`, `private_key` merken

### Schritt 3: .env ausfüllen

Öffne `/Users/johan/CascadeProjects/windsurf-project-2/.env` und ersetze die Platzhalter:

```env
DATABASE_URL="mongodb+srv://DEIN_USER:DEIN_PASSWORT@cluster0.xxxxx.mongodb.net/salescareerhub?retryWrites=true&w=majority"

NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="dein-projekt.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="dein-projekt"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="dein-projekt.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abc123"

FIREBASE_ADMIN_PROJECT_ID="dein-projekt"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxx@dein-projekt.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nDEIN_KEY\n-----END PRIVATE KEY-----\n"
```

### Schritt 4: Befehle ausführen

```bash
cd /Users/johan/CascadeProjects/windsurf-project-2
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

### Schritt 5: Admin-Account einrichten

1. Öffne http://localhost:3001 und registriere dich
2. In MongoDB Atlas → **Browse Collections** → `salescareerhub` → `User` Collection
3. Finde deinen User und ändere `role` von `"candidate"` zu `"admin"`

Alternativ in der Mongo Shell:
```js
db.User.updateOne({ email: "deine@email.de" }, { $set: { role: "admin" } })
```

### Später: Branding & Rechtliches

- [ ] App-Name finalisieren → `packages/config/src/index.ts` → `APP_CONFIG.name`
- [ ] Logo erstellen und einbinden
- [ ] Datenschutzerklärung mit echtem Text füllen (`/datenschutz`)
- [ ] Impressum mit echten Angaben füllen (`/impressum`)
- [ ] Kontakt-E-Mail aktualisieren in `APP_CONFIG.contact.email`
- [ ] Firebase Storage aktivieren (für CV/Logo-Uploads)
- [ ] Domain registrieren + Vercel/Netlify Deployment
- [ ] DSGVO: Verarbeitungsverzeichnis, AV-Verträge (MongoDB Atlas, Firebase)

---

## 🤖 Offene KI-Tasks (Cascade)

### Noch zu bauen

- [ ] Admin: Salary-Insights CRUD (Erstellen, Bearbeiten, Löschen im Admin)
- [ ] Admin: Rankings automatisch aus Bewertungsdaten generieren
- [ ] Admin: Kandidaten-Detailansicht (Profil, Bewerbungen, Dokumente, interne Notizen)
- [ ] Unternehmen-Seite: Suchfilter erweitern (Industrie, Größe, Funding Stage)
- [ ] Analytics: Dashboard-Widgets mit echten Daten (Views, Clicks pro Tag)
- [ ] Empty States: Dashboard-Seiten mit passenden Illustrationen aufwerten

### Qualität & Hardening

- [ ] Input Sanitization: XSS-Schutz für alle User-Inputs
- [ ] Rate Limiting: API-Route-Level vorbereiten
- [ ] Konsistente API-Fehlerformate + Client-seitige Error-Toasts
- [ ] TypeScript: `any`-Types durch echte Types ersetzen
- [ ] Accessibility: ARIA-Labels, Keyboard-Navigation
- [ ] Performance: Dynamische Imports für Dashboard-Seiten
- [ ] Testing: Vitest + Playwright Setup

---

## ✅ Erledigte Tasks

### Infrastruktur
- [x] Monorepo (pnpm workspaces + Turborepo)
- [x] Next.js 14 App Router + Tailwind + shadcn/ui
- [x] Firebase Auth (Client/Server Split)
- [x] Prisma + MongoDB Schema (17 Modelle)
- [x] .env Handling (dotenv-cli für Prisma, dotenv in next.config.js)
- [x] Dev-Server lauffähig (HTTP 200)
- [x] Firebase graceful handling ohne Credentials (kein Crash)
- [x] turbo.json v2 Fix (pipeline → tasks)

### Öffentliche Seiten (18 Seiten)
- [x] Startseite mit Hero, USPs, Featured Jobs, Rankings, Gehälter, CTAs
- [x] Jobs-Übersicht mit Suche, Filter, Paginierung, Sortierung
- [x] Job-Detailseite mit Interesse-bekunden-Button
- [x] Unternehmen-Übersicht mit Suche
- [x] Unternehmen-Detailseite (Profil, Jobs, Reviews)
- [x] Gehaltsübersicht nach Rolle/Land
- [x] Rankings nach Land
- [x] Für Unternehmen (Landing Page)
- [x] Für Kandidaten (Landing Page)
- [x] Guides-Übersicht + Detailseite (Markdown-Rendering)
- [x] Über uns, Kontakt, Login, Registrierung, Passwort vergessen
- [x] Datenschutz + Impressum (Platzhalter)
- [x] Review-Formular (/unternehmen/[slug]/bewerten)
- [x] SEO Meta-Titles für alle öffentlichen Seiten

### Kandidaten-Dashboard (7 Seiten)
- [x] Übersicht (Stats + letzte Bewerbungen)
- [x] Profil-Bearbeitung (RHF + Zod, Skills + Sprachen als Tags)
- [x] Bewerbungen-Übersicht
- [x] Gespeicherte Jobs
- [x] Dokumente (Upload mit DSGVO-Hinweis)
- [x] Benachrichtigungen
- [x] Einstellungen (DSGVO Export + Löschung)

### Unternehmens-Dashboard (6 Seiten)
- [x] Übersicht (Stats + Jobs)
- [x] Jobs verwalten
- [x] Job erstellen (RHF + Zod)
- [x] Bewerbungen (empfohlene Kandidaten)
- [x] Unternehmensprofil (RHF + Zod + Logo-Placeholder)
- [x] Einstellungen (DSGVO Export + Löschung)

### Admin-Dashboard (10 Seiten)
- [x] Übersicht (Stats + Schnellzugriff)
- [x] Nutzerverwaltung (Rolle ändern, deaktivieren)
- [x] Unternehmen (verifizieren, featured setzen)
- [x] Kandidaten-Übersicht
- [x] Jobs (freischalten, ablehnen, featured)
- [x] Bewerbungs-Pipeline (Status, Fit-Score, Notizen, Weiterleiten)
- [x] Reviews moderieren
- [x] Salary Data Übersicht
- [x] Rankings Übersicht
- [x] Content verwalten (CRUD)
- [x] Leads verwalten
- [x] Audit Logs (DSGVO)
- [x] Einstellungen

### API Routes (32 Endpoints)
- [x] Auth: /api/auth/me, /api/auth/register
- [x] Jobs: /api/jobs, /api/jobs/[slug]
- [x] Companies: /api/companies, /api/companies/[slug]
- [x] Applications: /api/applications, /api/applications/[id]
- [x] Saved Jobs: /api/saved-jobs
- [x] Reviews: /api/reviews
- [x] Salary: /api/salary
- [x] Rankings: /api/rankings
- [x] Content: /api/content, /api/content/[slug]
- [x] Leads: /api/leads
- [x] Analytics: /api/analytics
- [x] Notifications: /api/notifications
- [x] Upload: /api/upload
- [x] GDPR: /api/gdpr/export, /api/gdpr/delete
- [x] Candidate: /api/candidate/profile, /api/candidate/dashboard
- [x] Company: /api/company/profile, /api/company/jobs, /api/company/dashboard
- [x] Admin: /api/admin/stats, /api/admin/jobs, /api/admin/leads, /api/admin/reviews, /api/admin/content, /api/admin/logs, /api/admin/users, /api/admin/candidates, /api/admin/companies

### Shared Komponenten & Utilities
- [x] DashboardSidebar (shared, mobile-responsive)
- [x] Skeleton-Komponenten (Card, Table, List, Stats)
- [x] Error + Not-Found Pages
- [x] Auth Context (graceful ohne Firebase)
- [x] DSGVO Layer (gdpr.ts, Consent, Audit)
- [x] API Auth Helper (requireAuth, requireRole)
- [x] Zod Validierungsschemas
- [x] RBAC Permissions Layer
- [x] Onboarding-Flow
- [x] Notification Bell im Header
