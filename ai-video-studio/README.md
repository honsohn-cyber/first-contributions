# AI Video Studio

Eine Web-App, die aus einem einfachen Text-Skript automatisch ein vollständiges,
vertontes Video erstellt: Sprachausgabe, passende Szenenbilder, Ken-Burns-Kamerafahrt
und eingebrannte Untertitel — als fertige MP4-Datei zum Herunterladen.

## Funktionsweise

1. **Skript eingeben** — Text schreiben oder einfügen. Leerzeilen markieren neue Szenen,
   ansonsten teilt die App den Text automatisch sinnvoll in Szenen auf.
2. **Stil wählen** — Seitenverhältnis (16:9 / 9:16 / 1:1), visueller Stil, Stimme, Sprache.
3. **Rendern lassen** — Für jede Szene erzeugt die Pipeline:
   - Sprachausgabe (Narration)
   - ein Hintergrundbild
   - eine Videoszene mit sanftem Zoom/Schwenk (Ken-Burns-Effekt) und Untertiteln
   - anschließend werden alle Szenen zu einem finalen Video zusammengefügt
4. **Ergebnis ansehen & herunterladen** — inklusive Live-Fortschrittsanzeige während der
   Erstellung und einem Verlauf aller bisher erstellten Videos.

## Zwei Betriebsmodi

Die App funktioniert **vollständig ohne API-Keys** (Offline-Modus):

| | Ohne `OPENAI_API_KEY` | Mit `OPENAI_API_KEY` |
|---|---|---|
| Sprachausgabe | `espeak-ng` (lokal, kostenlos) | OpenAI TTS (`gpt-4o-mini-tts`) |
| Szenenbilder | Generierte Gradient-Titelkarten (via ffmpeg) | KI-generierte Illustrationen (`gpt-image-1`) |

Ist ein `OPENAI_API_KEY` gesetzt, schaltet die App automatisch in den KI-Modus um —
ohne weitere Konfiguration. Schlägt ein KI-Bildaufruf fehl, fällt die jeweilige Szene
automatisch auf die Gradient-Karte zurück, statt das ganze Video abzubrechen.

## Voraussetzungen

- Node.js ≥ 18
- [ffmpeg](https://ffmpeg.org/) (im `PATH` verfügbar)
- [`espeak-ng`](https://github.com/espeak-ng/espeak-ng) für den Offline-Sprachmodus
- Eine Schriftart unter `/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`
  (Paket `fonts-dejavu-core` auf Debian/Ubuntu) für die Text- und Untertitel-Darstellung

```bash
# Debian/Ubuntu
sudo apt-get install -y ffmpeg espeak-ng fonts-dejavu-core
```

## Setup

```bash
# Backend
cd server
cp .env.example .env   # optional: OPENAI_API_KEY eintragen
npm install
npm start               # läuft auf http://localhost:8787

# Frontend (in einem zweiten Terminal)
cd client
npm install
npm run dev              # läuft auf http://localhost:5173
```

Der Vite-Dev-Server proxied `/api` und `/media` automatisch an den Backend-Port 8787
(siehe `client/vite.config.js`).

Für einen Produktions-Build des Frontends:

```bash
cd client
npm run build   # erzeugt client/dist, kann von jedem statischen Webserver ausgeliefert werden
```

## Projektstruktur

```
ai-video-studio/
├── server/                  Node/Express-Backend
│   ├── src/
│   │   ├── lib/             Script-Parser, ffmpeg-Runner, Job-Store, Auflösungen
│   │   ├── providers/
│   │   │   ├── tts/         OpenAI-TTS + espeak-ng-Fallback
│   │   │   └── visuals/     OpenAI-Bilder + Gradient-Karten-Fallback
│   │   ├── pipeline/        Szenen-Rendering (Ken-Burns, Untertitel), Concat, Orchestrierung
│   │   └── routes/          REST-API + Server-Sent-Events für Live-Fortschritt
│   └── storage/             Generierte Jobs/Videos (zur Laufzeit, nicht versioniert)
└── client/                  React + Vite + Tailwind Frontend
    └── src/
        ├── components/      Formular, Fortschrittsanzeige, Ergebnis, Verlauf
        └── api.js           Anbindung an das Backend
```

## API (Kurzüberblick)

- `GET /api/videos/meta` — verfügbare Stimmen, Stile, Formate, KI-Status
- `POST /api/videos` — neuen Video-Job anlegen `{ script, aspect, styleId, voiceId, language }`
- `GET /api/videos` — Liste aller Jobs
- `GET /api/videos/:id` — Job-Details
- `GET /api/videos/:id/events` — Server-Sent-Events mit Live-Fortschritt
- `GET /media/:jobId/final.mp4` — fertiges Video (unterstützt HTTP-Range für Streaming/Scrubbing)

## Hinweise

- Alle Jobs und generierten Medien werden lokal unter `server/storage/` abgelegt.
- Die Lautstärke der Sprachausgabe wird pro Szene normalisiert (`loudnorm`), damit das
  Endergebnis konsistent klingt.
- Ohne API-Key entstehen stilvolle, aber textbasierte Gradient-Videos — ideal zum
  Testen und für einfache Erklär-/Zitat-Videos ganz ohne Kosten.
