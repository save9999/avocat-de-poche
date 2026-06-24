#!/usr/bin/env bash
# Relance l'ingestion Service-Public (resume-safe) — déclenché chaque matin par
# le LaunchAgent com.avocatpoche.ingest, après le reset quotidien du quota free
# tier Gemini (minuit Pacific ≈ 9h heure FR). S'arrête vite si la base est déjà
# complète (0 fiche à traiter).
set -uo pipefail

PROJECT="/Users/superbot/Projects/avocat-de-poche"
LOG="$HOME/sp-data/auto-ingest.log"
export PATH="/Users/superbot/.nvm/versions/node/v22.22.2/bin:$PATH"

cd "$PROJECT" || exit 1
mkdir -p "$HOME/sp-data"
{
  echo "════════ $(date '+%Y-%m-%d %H:%M:%S') — lancement auto-ingest ════════"
  npm run ingest:sp
  echo "──────── $(date '+%Y-%m-%d %H:%M:%S') — fin (exit $?) ────────"
} >> "$LOG" 2>&1
