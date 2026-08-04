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

| | Ohne API-Key | Mit API-Key |
|---|---|---|
| Sprachausgabe | `espeak-ng` (lokal, kostenlos), 4 Stimmen | **ElevenLabs** (`ELEVENLABS_API_KEY`), 8 Stimmen zur Auswahl |
| Szenenbilder | Generierte Gradient-Titelkarten (via ffmpeg) | KI-generierte Illustrationen (`OPENAI_API_KEY`, `gpt-image-1`) |

Sind die Keys gesetzt, schaltet die App automatisch in den jeweiligen KI-Modus um —
ohne weitere Konfiguration. Schlägt ein KI-Aufruf zur Laufzeit fehl (z. B. Netzwerkfehler
oder ungültiger Key), fällt die betroffene Szene automatisch auf die Offline-Variante
zurück, statt das ganze Video abzubrechen.

### ElevenLabs-Stimmen

Mit gesetztem `ELEVENLABS_API_KEY` stehen bei der Stimmenauswahl acht kuratierte
ElevenLabs-Stimmen zur Verfügung (mehrsprachiges Modell `eleven_multilingual_v2`,
funktioniert für Deutsch und Englisch). Jede Stimme hat einen kleinen Play-Button
zum Anhören einer kurzen Sprachprobe, bevor man sie auswählt — das erzeugte Sample
wird pro Stimme einmalig generiert und danach auf dem Server zwischengespeichert:

- **Rachel** — klar & ruhig (weiblich)
- **Domi** — selbstbewusst & energisch (weiblich)
- **Bella** — sanft & warm (weiblich)
- **Elli** — jugendlich & lebendig (weiblich)
- **Antoni** — ausgewogen & angenehm (männlich)
- **Josh** — tief & seriös (männlich)
- **Arnold** — kraftvoll & markant (männlich)
- **Adam** — neutral & vielseitig (männlich)

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
cp .env.example .env   # optional: ELEVENLABS_API_KEY und/oder OPENAI_API_KEY eintragen
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
npm run build   # erzeugt client/dist
```

Existiert `client/dist`, liefert der Server (`server/src/index.js`) das gebaute Frontend
automatisch selbst mit aus — dann läuft die komplette App (Oberfläche + API) über einen
einzigen Port. Das ist die Basis für den Docker-Container unten.

## Online stellen (öffentlicher Link, z. B. fürs iPhone)

Lokal läuft die App nur auf deinem eigenen Rechner unter `localhost` — auf dem iPhone
erreichbar ist sie erst, wenn sie öffentlich gehostet wird. Das geht komplett über den
Browser, ganz ohne Terminal, z. B. kostenlos mit [Render](https://render.com):

1. Auf [render.com](https://dashboard.render.com/register) mit dem GitHub-Account anmelden
   (kein Terminal, kein Kreditkarte nötig für den kostenlosen Plan).
2. Im Dashboard **„New +" → „Web Service"**.
3. **„Build and deploy from a Git repository"** wählen, GitHub verbinden und das Repository
   `first-contributions` auswählen.
4. Einstellungen:
   - **Branch:** `claude/ai-video-generation-website-pdarmj` (oder `main`, sobald gemerged)
   - **Root Directory:** `ai-video-studio`
   - **Runtime:** Docker (wird automatisch erkannt, sobald das `Dockerfile` in diesem
     Ordner gefunden wird)
   - **Instance Type:** Free
5. Optional unter „Environment" die Keys `ELEVENLABS_API_KEY` und/oder `OPENAI_API_KEY`
   eintragen, wenn KI-Stimmen/-Bilder gewünscht sind. Ohne Keys läuft der Offline-Modus.
6. **„Deploy Web Service"** klicken. Der erste Build dauert einige Minuten (ffmpeg,
   espeak-ng und das Frontend werden im Container installiert/gebaut).
7. Nach erfolgreichem Deploy zeigt Render eine URL wie
   `https://ai-video-studio-xxxx.onrender.com` — die im Safari-Browser auf dem iPhone
   öffnen. Über „Zum Home-Bildschirm" lässt sie sich wie eine App anheften.

**Hinweise zum kostenlosen Plan:** Der Dienst schläft nach ca. 15 Minuten Inaktivität ein;
der erste Aufruf danach braucht ~30–60 Sekunden zum Aufwachen. Der Speicherplatz ist
flüchtig — bei einem Neustart/Redeploy gehen bereits erzeugte Videos verloren. Für
längere Skripte oder viele gleichzeitige Nutzer:innen kann der kostenlose Plan (512 MB RAM)
beim Video-Rendern an seine Grenzen kommen; ein bezahlter Plan ist dann spürbar schneller.

## Projektstruktur

```
ai-video-studio/
├── Dockerfile               Single-Container-Build (Client-Build + ffmpeg/espeak-ng + Server)
├── server/                  Node/Express-Backend
│   ├── src/
│   │   ├── lib/             Script-Parser, ffmpeg-Runner, Job-Store, Auflösungen
│   │   ├── providers/
│   │   │   ├── tts/         ElevenLabs-Stimmen + espeak-ng-Fallback
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
- `GET /api/videos/voices/:voiceId/preview` — kurze Sprachprobe der Stimme (gecacht)
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
