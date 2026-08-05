# Die heilende Kraft der Ätherischen Öle

E-Book-Generator: 30 ätherische Öle, ein Öl pro Seite mit Abbildung,
210 Anwendungen, 21 Rezepturen, Anwendungsverzeichnis A–Z. 48 Seiten.

## Eigene Bilder einsetzen

1. Bilder in den Ordner **`img_neu/`** legen. Der Dateiname muss dem Öl
   entsprechen, die Endung ist frei (`.jpg`, `.jpeg`, `.png`, `.webp`):

   ```
   lavendel.jpg      pfefferminze.jpg   teebaum.jpg        eukalyptus.jpg
   zitrone.jpg       orange.jpg         rosmarin.jpg       zitronengras.jpg
   ingwer.jpg        nelke.jpg          weihrauch.jpg      kamille.jpg
   ylang.jpg         geranie.jpg        bergamotte.jpg     wacholder.jpg
   muskatellersalbei.jpg                sandelholz.jpg     zedernholz.jpg
   grapefruit.jpg    thymian.jpg        melisse.jpg        zimt.jpg
   fenchel.jpg       patchouli.jpg      vetiver.jpg        rose.jpg
   jasmin.jpg        kiefer.jpg         myrrhe.jpg
   ```

   Das Seitenverhältnis spielt keine Rolle — die Bilder werden mittig auf
   das Bannerformat 1500 × 640 zugeschnitten. Die Pflanze sollte mittig sitzen.

2. Aufbereiten und neu bauen:

   ```bash
   python3 prepare_images.py     # schneidet img_neu/ -> img_jpg/
   npm install                   # nur beim ersten Mal
   node build.js                 # erzeugt die .docx
   ```

3. PDF erzeugen (optional):

   ```bash
   soffice --headless --convert-to pdf Die-heilende-Kraft-der-Aetherischen-Oele.docx
   ```

Öle ohne eigenes Bild behalten automatisch die mitgelieferte Illustration.

## Dateien

| Datei | Zweck |
| --- | --- |
| `oils.js` | Datenbasis: 30 Öle mit Herkunft, Inhaltsstoffen, Anwendungen, Sicherheitshinweisen |
| `build.js` | Erzeugt die `.docx` aus `oils.js` und den Bildern |
| `prepare_images.py` | Zuschnitt gelieferter Fotos auf einheitliches Format |
| `plants.py`, `render.py` | Erzeugen die botanischen Platzhalter-Illustrationen |
| `img_jpg/` | Aktuell verwendete Bilder |
| `img_neu/` | Hier eigene Fotos ablegen |

## Hinweis zum Inhaltsverzeichnis

Die Seitenzahlen im Inhaltsverzeichnis stehen fest in `build.js` (Liste `toc`).
Wenn sich der Umfang ändert, müssen sie neu ermittelt und dort eingetragen werden.

## Rechtliches

Die Inhalte sind bewusst als traditionelle und erfahrungsheilkundliche
Anwendung formuliert, nicht als Heilversprechen. Vor einer Veröffentlichung
sollten Impressum, Autorenangabe und die Rechte an den verwendeten Bildern
geprüft werden.
