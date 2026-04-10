#!/bin/bash
# Generate French voiceover using fal.ai PlayAI TTS
set -e

KEY=$(grep ELEVENLABS_API_KEY "/Users/mac/Documents/Projet IA/mekki/.env" | cut -d= -f2)
FFMPEG="/Users/mac/Documents/Projet IA/mekki/sitepilot/node_modules/@remotion/compositor-darwin-x64/ffmpeg-real"
OUT="/Users/mac/Documents/Projet IA/mekki/sitepilot/public/voiceover"
mkdir -p "$OUT"

# French male voice via PlayAI TTS
VOICE="Baptiste"

generate_segment() {
  local id="$1"
  local text="$2"

  echo -n "🎙  $id... "

  RESPONSE=$(curl -s \
    -H "Authorization: Key $KEY" \
    -H "Content-Type: application/json" \
    "https://fal.run/fal-ai/playai-tts" \
    -d "{\"model\": \"PlayDialog\", \"input\": \"$text\", \"voice\": \"$VOICE\", \"language\": \"french\", \"output_format\": \"mp3\"}")

  AUDIO_URL=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('audio',{}).get('url',''))" 2>/dev/null)

  if [ -z "$AUDIO_URL" ]; then
    echo "❌ erreur: $RESPONSE"
    return
  fi

  curl -s "$AUDIO_URL" -o "${OUT}/${id}.mp3"
  SIZE=$(ls -lh "${OUT}/${id}.mp3" | awk '{print $5}')
  echo "✓ ($SIZE)"
}

generate_segment "segment-01" "SitePilot. Le pilotage intelligent de vos chantiers, en temps réel."
generate_segment "segment-02" "Aujourd'hui, le suivi de chantier repose sur des fichiers Excel éparpillés, des photos sans traçabilité, et des retards détectés trop tard."
generate_segment "segment-03" "Avec SitePilot, vous disposez d'une vision consolidée instantanée. Budget global, décaissements, alertes, tout est centralisé dans un tableau de bord clair et précis."
generate_segment "segment-04" "Chaque site est géolocalisé sur une carte interactive. Un clic suffit pour accéder à toutes les informations terrain."
generate_segment "segment-05" "Le budget est décomposé poste par poste. Pylône, local technique, groupe électrogène, clôture, électricité. Vous savez exactement où va chaque dirham."
generate_segment "segment-06" "L'intelligence artificielle analyse les photos de chantier et propose un score d'avancement. Le responsable valide ou ajuste en un geste."
generate_segment "segment-07" "Le planning des avances est visualisé sur une timeline claire. Chaque échéance, chaque montant, chaque site concerné."
generate_segment "segment-08" "Chaque jeudi, un rapport professionnel est généré automatiquement et exportable en PDF, prêt pour votre direction."
generate_segment "segment-09" "Import Excel intelligent, alertes automatiques, analyse IA, export PDF. SitePilot réunit tout ce dont vous avez besoin."
generate_segment "segment-10" "SitePilot. Pilotez vos chantiers. Maîtrisez vos budgets. Demandez votre démonstration."

echo ""
echo "✅ Segments générés dans $OUT"
ls -lh "$OUT"/segment-*.mp3
