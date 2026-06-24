#!/usr/bin/env bash
# Télécharge et dézippe l'archive officielle des fiches « Vos droits et
# démarches — Particuliers » de Service-Public.fr (DILA, licence ouverte v2.0).
# Source : data.gouv.fr — mise à jour quotidienne.
# Résultat : ~/sp-data/fiches/*.xml (≈ 5500 fiches), prêt pour `npm run ingest:sp`.
set -euo pipefail

DEST="$HOME/sp-data"
URL="https://www.data.gouv.fr/api/1/datasets/r/0ed10f28-d197-4324-97b3-037f625095ac"

mkdir -p "$DEST/fiches"
echo "▸ Téléchargement de l'archive Service-Public.fr…"
curl -sL -o "$DEST/sp-fiches.zip" "$URL"
echo "   $(du -h "$DEST/sp-fiches.zip" | cut -f1) téléchargés"

echo "▸ Décompression dans $DEST/fiches/ …"
rm -f "$DEST/fiches/"*.xml 2>/dev/null || true
unzip -oq "$DEST/sp-fiches.zip" -d "$DEST/fiches"
echo "   $(ls "$DEST/fiches" | grep -c '\.xml$') fichiers XML extraits"
echo "✅ Prêt. Lance : npm run ingest:sp"
