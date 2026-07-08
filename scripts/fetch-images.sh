#!/usr/bin/env bash
# Lädt die Original-Bilder der alten Wix-Website herunter und legt sie als
# lokale Kopien unter public/assets/img/ ab.
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)/public/assets/img"
mkdir -p "$DIR"

declare -A IMAGES=(
  ["hero.jpg"]="https://static.wixstatic.com/media/d2f3ea_56e057d2184647ecb27b8474ee3d436d~mv2.jpg"
  ["projekt-bohrung-2.jpg"]="https://static.wixstatic.com/media/d2f3ea_56e057d2184647ecb27b8474ee3d436d~mv2.jpg"
  ["logo.png"]="https://static.wixstatic.com/media/d2f3ea_57223b807cb745daa85b7abc6d2dd53d~mv2.png"
  ["projekt-aushub.jpg"]="https://static.wixstatic.com/media/d2f3ea_dfb67915f2eb44e7ae1e3b21d06874d8~mv2.jpg"
  ["projekt-bohrung.jpg"]="https://static.wixstatic.com/media/d2f3ea_8297d5657850451f8b47b6690db0424e~mv2.jpg"
  ["portrait.jpg"]="https://static.wixstatic.com/media/d2f3ea_a0ee2ebd2ad34cafb05356784d0ebecd~mv2.jpeg"
  ["projekt-fundament.jpg"]="https://static.wixstatic.com/media/d2f3ea_7b758493505d4aaea29a79e89e2fc7a5~mv2.jpeg"
)

for name in "${!IMAGES[@]}"; do
  url="${IMAGES[$name]}"
  echo "→ $name"
  curl -fsSL --retry 3 -o "$DIR/$name" "$url"
done

echo "Fertig. Bilder liegen in $DIR"
