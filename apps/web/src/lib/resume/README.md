# CV-Extraktion (Lebenslauf-Parsing)

Fullstack-Feature zur automatischen Extraktion strukturierter Daten aus PDF-Lebensläufen mittels KI-gestütztem Parsing.

## Architektur

```
apps/web/src/
├── lib/resume/
│   ├── schemas.ts              # Zod-Schemas & TypeScript Types
│   ├── config.ts               # Zentrale Konfiguration (ENV-basiert)
│   ├── errors.ts               # Fehlerklassen
│   ├── logger.ts               # DSGVO-konformes Logging (keine PII)
│   ├── pdf-parser.ts           # PDF-Text-Extraktion + Magic-Byte-Validierung
│   ├── normalization.ts        # Normalisierung, Dedup, Seniority-Inferenz
│   ├── prompts.ts              # KI-Extraktionsprompts
│   ├── rate-limiter.ts         # In-Memory Rate Limiting
│   ├── api-client.ts           # Frontend API Client
│   ├── index.ts                # Barrel Export
│   └── providers/
│       ├── types.ts            # Provider Interface
│       ├── factory.ts          # Provider Factory (ENV-basiert)
│       ├── mock.ts             # Mock Provider (kein API-Key nötig)
│       ├── openai.ts           # OpenAI Provider
│       └── vertex.ts           # Google Vertex AI Provider
├── app/api/resume/
│   ├── extract/route.ts        # POST /api/resume/extract
│   ├── health/route.ts         # GET  /api/resume/health
│   └── demo/route.ts           # POST /api/resume/demo
├── components/resume/
│   ├── UploadCard.tsx           # Drag & Drop PDF Upload
│   ├── ReviewPanel.tsx          # Erkannte Daten Review
│   ├── CandidateForm.tsx        # Kandidatenformular
│   └── PrivacyNotice.tsx        # DSGVO-Hinweis
└── app/(public)/kandidat/lebenslauf/
    └── page.tsx                 # Hauptseite
```

## Setup

### 1. Umgebungsvariablen

Kopiere `.env.example` nach `.env` und konfiguriere:

```env
# Mock-Modus (Standard, kein API-Key nötig)
AI_PROVIDER="mock"

# OpenAI aktivieren
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"

# Vertex AI aktivieren
AI_PROVIDER="vertex"
VERTEX_PROJECT_ID="mein-projekt"
VERTEX_LOCATION="europe-west1"
VERTEX_MODEL="gemini-1.5-flash"
GOOGLE_APPLICATION_CREDENTIALS="/pfad/zu/credentials.json"
```

### 2. Starten

```bash
pnpm install
pnpm dev
```

Öffne: `http://localhost:3000/kandidat/lebenslauf`

### 3. Tests

```bash
cd apps/web
pnpm test
```

## API Endpoints

### POST /api/resume/extract

Multipart/form-data Upload eines PDF-Lebenslaufs.

**Request:**
- `file`: PDF-Datei (max 10 MB)

**Response (Erfolg):**
```json
{
  "success": true,
  "requestId": "uuid",
  "extracted": { ... },
  "meta": {
    "provider": "mock",
    "processingMs": 1200,
    "rawTextLength": 3456,
    "warnings": ["Zielrolle konnte nicht sicher erkannt werden."]
  }
}
```

**Response (Fehler):**
```json
{
  "success": false,
  "requestId": "uuid",
  "error": { "code": "INVALID_FILE_TYPE", "message": "Nur PDF-Dateien sind erlaubt." }
}
```

### GET /api/resume/health

Zeigt Provider-Status und Konfiguration.

### POST /api/resume/demo

Liefert Mock-Daten ohne Dateiupload (für UI-Entwicklung).

## DSGVO-Hinweise

- **Keine dauerhafte Speicherung:** PDF wird nur im Arbeitsspeicher verarbeitet
- **Kein PII-Logging:** Logs enthalten nur requestId, Dateigröße, Provider, Dauer, Erfolg/Fehler
- **Nutzer-Kontrolle:** Automatisch extrahierte Daten werden nur vorbefüllt, nie automatisch übermittelt
- **Löschung temporärer Daten:** Buffer wird nach Verarbeitung vom GC freigegeben. Kein persistentes File-System involviert (es sei denn `ENABLE_TEMP_FILE_STORAGE=true`)
- **Datenschutz-Checkbox:** Frontend zeigt Einwilligung vor Upload

## Provider hinzufügen

1. Implementiere das Interface `ResumeExtractionProvider` aus `providers/types.ts`
2. Registriere den Provider in `providers/factory.ts`
3. Füge die ENV-Variable `AI_PROVIDER=mein_provider` hinzu

## Erweiterungsmöglichkeiten

- **OCR:** Setze `ENABLE_OCR=true` und implementiere OCR-Fallback in `pdf-parser.ts`
- **DOCX:** Erweitere `pdf-parser.ts` um DOCX-Parsing
- **Weitere Felder:** Erweitere `ExtractedResumeRawSchema` in `schemas.ts`
- **Mehrsprachigkeit:** Microcopy in separate i18n-Dateien auslagern

## Bekannte Grenzen

- Gescannte PDFs (Bilder) können ohne OCR nicht verarbeitet werden
- Stark formatierte PDFs (Tabellen, Spalten) können unstrukturierten Text liefern
- Gehaltsangaben werden nur extrahiert wenn explizit im CV genannt
- Zielrolle wird nur erkannt wenn im CV/Anschreiben angegeben
- Mock Provider liefert immer die gleichen Beispieldaten
