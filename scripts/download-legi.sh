#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# Télécharge le dernier dump LEGI (Légifrance) depuis DILA et l'extrait.
# Usage :  ./scripts/download-legi.sh [target_dir]
#
# Par défaut : ~/legi
# Taille : ~1.5 Go compressé, ~5 Go décompressé
# ─────────────────────────────────────────────────────────────────────────
set -euo pipefail

TARGET="${1:-$HOME/legi}"
BASE_URL="https://echanges.dila.gouv.fr/OPENDATA/LEGI"

echo "▸ Cible : $TARGET"
mkdir -p "$TARGET"

echo "▸ Listing des dumps disponibles…"
LATEST=$(curl -s "$BASE_URL/" \
  | grep -oE 'LEGI_[0-9]{8}-[0-9]{6}\.tar\.gz' \
  | sort -u \
  | tail -1)

if [[ -z "$LATEST" ]]; then
  echo "✖ Impossible de détecter le dernier dump sur $BASE_URL/"
  exit 1
fi

echo "▸ Dernier dump détecté : $LATEST"
DUMP_PATH="$TARGET/$LATEST"

if [[ -f "$DUMP_PATH" ]]; then
  echo "▸ Dump déjà présent localement, skip download."
else
  echo "▸ Téléchargement (long, ~1.5 Go)…"
  curl -L --fail --progress-bar -o "$DUMP_PATH" "$BASE_URL/$LATEST"
fi

echo "▸ Extraction dans $TARGET …"
tar -xzf "$DUMP_PATH" -C "$TARGET"

echo "▸ Comptage des XML extraits…"
XML_COUNT=$(find "$TARGET" -name '*.xml' -type f | wc -l | tr -d ' ')
echo "✅ Terminé : $XML_COUNT fichiers XML disponibles dans $TARGET"
echo
echo "Prochaine étape :"
echo "  npm run ingest -- --dir $TARGET"
