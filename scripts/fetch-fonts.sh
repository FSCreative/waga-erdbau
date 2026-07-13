#!/usr/bin/env bash
# Lädt die Inter-Schriftschnitte von Google Fonts herunter und legt sie als
# lokale Kopien unter public/assets/fonts/ ab (DSGVO: kein Google-CDN im Betrieb).
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)/public/assets/fonts"
mkdir -p "$DIR"

UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
CSS_URL="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"

TMP_CSS="$(mktemp)"
curl -fsSL -A "$UA" -o "$TMP_CSS" "$CSS_URL"

# Alle Font-Dateien herunterladen
grep -oE 'https://fonts\.gstatic\.com/[^)]+' "$TMP_CSS" | sort -u | while read -r url; do
  name="$(basename "$url")"
  echo "→ $name"
  curl -fsSL --retry 3 -o "$DIR/$name" "$url"
done

# CSS auf lokale Pfade umschreiben
sed -E 's|url\(https://fonts\.gstatic\.com/[^)]*/([^/)]+)\)|url(/assets/fonts/\1)|g' "$TMP_CSS" > "$DIR/fonts.css"
rm -f "$TMP_CSS"

echo "Fertig. $(ls "$DIR" | wc -l) Dateien in $DIR"
