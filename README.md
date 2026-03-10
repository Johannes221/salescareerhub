# SalesCareerHub

**Die spezialisierte Plattform für Software Sales Karrieren im DACH-Raum.**

Kombination aus Job-Plattform, Recruiting-Agentur-Layer, Career Intelligence Hub und Bewertungs-/Transparenzplattform für Sales-Organisationen.

## Tech Stack

- **Monorepo**: pnpm Workspaces + Turborepo
- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **UI**: shadcn/ui, Tailwind CSS, Lucide Icons
- **Auth**: Firebase Authentication (Client + Admin SDK)
- **Datenbank**: MongoDB (via Prisma ORM)
- **Validierung**: Zod + React Hook Form
- **State**: TanStack Query (vorbereitet)
- **Tabellen**: TanStack Table (vorbereitet)

## Projektstruktur

```
salescareerhub/
├── apps/
│   └── web/                    # Next.js App
│       ├── src/
│       │   ├── app/            # App Router Pages
│       │   │   ├── (public)/   # Öffentliche Seiten
│       │   │   ├── dashboard/  # Protected Dashboards
│       │   │   └── api/        # API Routes
│       │   ├── components/     # UI Komponenten
│       │   └── lib/            # Utilities, Auth Context
│       └── ...
├── packages/
│   ├── config/                 # Zentrale Konfiguration, Konstanten, Labels
│   ├── types/                  # Shared TypeScript Types
│   ├── db/                     # Prisma ORM + MongoDB + Seed
│   ├── auth/                   # Firebase Auth (Client + Server)
│   └── utils/                  # Validierung, Formatierung, Permissions
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

## Lokale Installation

### Voraussetzungen

- Node.js >= 20
- pnpm >= 9
- MongoDB Instanz (lokal oder MongoDB Atlas)
- Firebase Projekt

### 1. Repository klonen

```bash
git clone <repo-url>
cd salescareerhub
```

### 2. Dependencies installieren

```bash
pnpm install
```

### 3. Umgebungsvariablen

```bash
cp .env.example apps/web/.env.local
```

Fülle alle Werte in `apps/web/.env.local` aus:

- **DATABASE_URL**: MongoDB Connection String
- **NEXT_PUBLIC_FIREBASE_***: Firebase Client Config (aus Firebase Console → Projekteinstellungen → Web App)
- **FIREBASE_ADMIN_***: Firebase Admin SDK (aus Firebase Console → Projekteinstellungen → Dienstkonto → Neuen privaten Schlüssel generieren)

### 4. Firebase Setup

1. Erstelle ein Firebase-Projekt unter [console.firebase.google.com](https://console.firebase.google.com)
2. Aktiviere **Authentication** → **E-Mail/Passwort** als Anmeldeanbieter
3. Erstelle eine Web-App und kopiere die Config-Werte in `.env.local`
4. Gehe zu Dienstkonten und generiere einen privaten Schlüssel für die Admin-SDK

### 5. Datenbank Setup

```bash
# Prisma Client generieren
pnpm db:generate

# Schema in MongoDB pushen
pnpm db:push
```

### 6. Seed-Daten laden

```bash
pnpm db:seed
```

**Wichtig**: Die Seed-Daten erstellen Benutzer mit Platzhalter-Firebase-UIDs. Für echten Login musst du:
1. Accounts in Firebase Authentication erstellen (über die App oder Firebase Console)
2. Die Firebase-UIDs der Seed-User in der DB aktualisieren

Oder: Registriere dich einfach über die App – neue Benutzer werden automatisch angelegt.

### 7. Dev Server starten

```bash
pnpm dev
```

Die App läuft auf [http://localhost:3000](http://localhost:3000).

### Admin-Account einrichten

1. Registriere dich über die App
2. Ändere die Rolle in der DB auf `admin`:

```js
// In MongoDB Shell oder Compass:
db.User.updateOne(
  { email: "deine-email@beispiel.de" },
  { $set: { role: "admin" } }
)
```

## Demo Accounts (Seed)

| Rolle      | E-Mail                    | Unternehmen        |
|------------|---------------------------|---------------------|
| Admin      | admin@salescareerhub.de   | -                   |
| Unternehmen| company1@demo.de          | TechCorp GmbH       |
| Unternehmen| company2@demo.de          | CloudScale AG        |
| Unternehmen| company3@demo.de          | DataFlow Solutions   |
| Kandidat   | kandidat1@demo.de         | Max Mustermann       |
| Kandidat   | kandidat2@demo.de         | Anna Schmidt         |
| Kandidat   | kandidat3@demo.de         | Lukas Weber          |

## Architektur-Entscheidungen

1. **Next.js API Routes statt separatem Backend**: Einfacheres Deployment, gleicher Tech-Stack, Prisma direkt nutzbar.
2. **MongoDB statt PostgreSQL**: Expliziter Wunsch. Prisma unterstützt MongoDB als Datenquelle.
3. **Firebase Auth**: Robuste Auth-Lösung ohne eigenes Backend für Token-Management. Admin SDK für serverseitige Verifizierung.
4. **Firebase Storage**: Konsistenter Einsatz des Firebase-Ökosystems für File Uploads (CV, Logos).
5. **Agency-Modell**: Bewerbungen laufen über die Plattform. Kandidaten bekunden Interesse, Admin screent und leitet weiter.

## Bewerbungsflow (Agency-Modell)

```
Kandidat sieht Job → "Interesse bekunden"
  → Status: interest_expressed
  → Admin erhält Benachrichtigung

Admin prüft Kandidat → Screening
  → Status: screening
  → Admin kann Fit-Score, Notizen vergeben

Admin empfiehlt → Shortlist / Weiterleitung
  → Status: shortlisted → forwarded
  → Unternehmen erhält Kandidaten-Paket

Unternehmen → Interview → Angebot → Einstellung
  → Status: interview_1 → interview_2 → offer → hired
```

## DSGVO / Datenschutz-Compliance

Das System implementiert folgende DSGVO-Maßnahmen:

- **Art. 15 – Auskunftsrecht**: Nutzer können über `/api/gdpr/export` alle gespeicherten Daten als JSON exportieren (Einstellungen-Seite)
- **Art. 17 – Recht auf Löschung**: Vollständige Kontolöschung über `/api/gdpr/delete` inkl. aller personenbezogenen Daten
- **Audit Trail**: Alle relevanten Aktionen werden in `AuditLog` protokolliert mit Rechtsgrundlage
- **Zweckbindung**: Jede Datenverarbeitung dokumentiert die DSGVO-Rechtsgrundlage im Audit-Log
- **Dateisicherheit**: File-Uploads werden validiert (Typ, Größe), DSGVO-konform gespeichert und löschbar
- **Interne Notizen**: `internalNotes` und `fitScore` sind nie für Kandidaten/Unternehmen sichtbar
- **Consent-Tracking**: Reviews erfordern explizite DSGVO-Einwilligung vor Verarbeitung

### Rechtsgrundlagen
| Verarbeitung | Rechtsgrundlage |
|---|---|
| Kontoerstellung | Art. 6 Abs. 1 lit. b (Vertragserfüllung) |
| Kandidatenprofil | Art. 6 Abs. 1 lit. b (Vertragsanbahnung) |
| Interessenbekundung | Art. 6 Abs. 1 lit. b (Vertragsanbahnung) |
| CV-Upload | Art. 6 Abs. 1 lit. a (Einwilligung) |
| Bewertungen | Art. 6 Abs. 1 lit. a (Einwilligung) |
| Analytics | Art. 6 Abs. 1 lit. f (Berechtigtes Interesse) |

## Vollständige Routen-Übersicht

### Öffentliche Seiten
`/` · `/jobs` · `/jobs/[slug]` · `/unternehmen` · `/unternehmen/[slug]` · `/gehaelter` · `/rankings` · `/fuer-unternehmen` · `/fuer-kandidaten` · `/guides` · `/guides/[slug]` · `/ueber-uns` · `/kontakt` · `/login` · `/registrieren` · `/passwort-vergessen` · `/datenschutz` · `/impressum`

### Kandidaten-Dashboard
`/dashboard/candidate` · `/dashboard/candidate/profil` · `/dashboard/candidate/bewerbungen` · `/dashboard/candidate/gespeichert` · `/dashboard/candidate/dokumente` · `/dashboard/candidate/benachrichtigungen` · `/dashboard/candidate/einstellungen`

### Unternehmens-Dashboard
`/dashboard/company` · `/dashboard/company/profil` · `/dashboard/company/jobs` · `/dashboard/company/jobs/neu` · `/dashboard/company/bewerbungen`

### Admin-Dashboard
`/dashboard/admin` · `/dashboard/admin/jobs` · `/dashboard/admin/applications` · `/dashboard/admin/reviews` · `/dashboard/admin/leads` · `/dashboard/admin/content` · `/dashboard/admin/logs`

### API-Routes
`/api/auth/me` · `/api/auth/register` · `/api/jobs` · `/api/jobs/[slug]` · `/api/companies` · `/api/companies/[slug]` · `/api/salary` · `/api/rankings` · `/api/content` · `/api/content/[slug]` · `/api/leads` · `/api/analytics` · `/api/applications` · `/api/applications/[id]` · `/api/saved-jobs` · `/api/notifications` · `/api/reviews` · `/api/upload` · `/api/candidate/profile` · `/api/candidate/dashboard` · `/api/company/profile` · `/api/company/jobs` · `/api/company/dashboard` · `/api/admin/stats` · `/api/admin/jobs` · `/api/admin/leads` · `/api/admin/reviews` · `/api/admin/content` · `/api/admin/logs` · `/api/gdpr/export` · `/api/gdpr/delete`

## Nächste Schritte

1. Firebase-Projekt einrichten und `.env` mit echten Werten füllen
2. MongoDB Atlas Cluster erstellen und `DATABASE_URL` setzen
3. `pnpm install && pnpm db:generate && pnpm db:push && pnpm db:seed`
4. Admin-Account registrieren und Rolle in DB auf `admin` setzen
5. Firebase Storage aktivieren und File-Upload-Integration fertigstellen
6. Responsive Feinschliff und Loading/Error States vervollständigen
7. E2E Tests mit Playwright für kritische Flows
8. Review-Formular auf Unternehmens-Detailseite integrieren
9. Datenschutzerklärung und Impressum mit echten Texten füllen
10. Deployment-Pipeline (Vercel/Netlify) einrichten

## Lizenz

Proprietary – Alle Rechte vorbehalten.
# salescareerhub
