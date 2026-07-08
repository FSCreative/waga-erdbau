# WAGA Erdbau – Website

Moderne, interaktive Website für WAGA Erdbau (Wachter Joel, Montafon) mit integriertem Admin-Bereich.
Bewusst **ohne npm-Dependencies** gebaut: reines Node.js (>= 22.13) mit dem eingebauten `node:sqlite`.

## Features

- Startseite mit Parallax-Hero, animierten Zählern und Scroll-Animationen
- Leistungen, Projekte (filterbare Galerie + Lightbox), Über mich, Berichte (Blog), Kontakt
- Mobil app-like mit fixer Tab-Navigation in der Fußzeile
- Kontaktformular → Anfragen landen im Admin-Bereich
- Admin-Bereich (`/admin`, verlinkt in der Fußzeile):
  - **Berichte**: Blog-Beiträge schreiben (Markdown-Editor), Titelbild-Upload
  - **Fotos & Projekte**: Galerie verwalten, Fotos hochladen
  - **Texte**: alle Website-Texte ändern
  - **Anfragen**: eingegangene Kontaktanfragen lesen

## Lokal starten

```bash
node server.js
# → http://localhost:3000  (Admin: /admin, Standardpasswort: waga2026)
```

## Deployment (Railway)

1. Repo verbinden, es ist kein Build nötig (`npm start` läuft automatisch).
2. **Volume** anlegen und auf `/data` mounten.
3. Umgebungsvariablen setzen:
   - `DATA_DIR=/data`
   - `ADMIN_PASSWORD=<sicheres Passwort>`
   - `SESSION_SECRET=<zufälliger String>`
   - `NODE_ENV=production`

## Bilder

Die Original-Bilder der alten Wix-Website werden vom GitHub-Actions-Workflow
`fetch-images.yml` automatisch heruntergeladen und nach `public/assets/img/` committet
(läuft beim ersten Push bzw. manuell über den Actions-Tab).

Vom Admin hochgeladene Bilder landen unter `DATA_DIR/uploads` (auf Railway im Volume)
und werden unter `/uploads/…` ausgeliefert.
