#!/bin/bash
# Generate voiceover using fal.ai F5-TTS
set -e

KEY=$(grep ELEVENLABS_API_KEY "/Users/mac/Documents/Projet IA/mekki/.env" | cut -d= -f2)
FFMPEG="/Users/mac/Documents/Projet IA/mekki/sitepilot/node_modules/@ffmpeg-installer/darwin-x64/ffmpeg"
OUT="/Users/mac/Documents/Projet IA/mekki/sitepilot/public/voiceover"
mkdir -p "$OUT"

# Reference audio for French male voice clone
REF="https://cdn.themetavoice.xyz/speakers/bria.mp3"

declare -A SEGMENTS
SEGMENTS[segment-01]="SitePilot. Le pilotage intelligent de vos chantiers, en temps réel."
SEGMENTS[segment-02]="Aujourd'hui, le suivi de chantier repose sur des fichiers Excel éparpillés, des photos sans traçabilité, et des retards détectés trop tard."
SEGMENTS[segment-03]="Avec SitePilot, vous disposez d'une vision consolidée instantanée. Budget global, décaissements, alertes, tout est centralisé dans un tableau de bord clair et précis."
SEGMENTS[segment-04]="Chaque site est géolocalisé sur une carte interactive. Un clic suffit pour accéder à toutes les informations terrain."
SEGMENTS[segment-05]="Le budget est décomposé poste par poste. Pylône, local technique, groupe électrogène, clôture, électricité. Vous savez exactement où va chaque dirham."
SEGMENTS[segment-06]="L'intelligence artificielle analyse les photos de chantier et propose un score d'avancement. Le responsable valide ou ajuste en un geste."
SEGMENTS[segment-07]="Le planning des avances est visualisé sur une timeline claire. Chaque échéance, chaque montant, chaque site concerné."
SEGMENTS[segment-08]="Chaque jeudi, un rapport professionnel est généré automatiquement et exportable en PDF, prêt pour votre direction."
SEGMENTS[segment-09]="Import Excel intelligent, alertes automatiques, analyse IA, export PDF. SitePilot réunit tout ce dont vous avez besoin."
SEGMENTS[segment-10]="SitePilot. Pilotez vos chantiers. Maîtrisez vos budgets. Demandez votre démonstration."

for id in segment-01 segment-02 segment-03 segment-04 segment-05 segment-06 segment-07 segment-08 segment-09 segment-10; do
  text="${SEGMENTS[$id]}"
  echo -n "🎙  $id... "

  # Call fal.ai F5-TTS (synchronous)
  RESPONSE=$(curl -s \
    -H "Authorization: Key $KEY" \
    -H "Content-Type: application/json" \
    "https://fal.run/fal-ai/f5-tts" \
    -d "{\"gen_text\": \"$text\", \"ref_audio_url\": \"$REF\", \"model_type\": \"F5-TTS\"}")

  AUDIO_URL=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['audio_url']['url'])" 2>/dev/null)

  if [ -z "$AUDIO_URL" ]; then
    echo "❌ erreur: $RESPONSE"
    continue
  fi

  # Download WAV and convert to MP3
  curl -s "$AUDIO_URL" -o "/tmp/fal-${id}.wav"
  "$FFMPEG" -y -i "/tmp/fal-${id}.wav" -codec:a libmp3lame -b:a 192k -ar 44100 "${OUT}/${id}.mp3" 2>/dev/null
  rm -f "/tmp/fal-${id}.wav"

  SIZE=$(ls -lh "${OUT}/${id}.mp3" | awk '{print $5}')
  echo "✓ ($SIZE)"
done

echo ""
echo "✅ Tous les segments générés dans $OUT"
ls -lh "$OUT"/segment-*.mp3
