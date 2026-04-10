/**
 * generate-voiceover.ts
 * Génère les fichiers audio de narration via ElevenLabs API.
 *
 * Usage:
 *   cd sitepilot
 *   npx ts-node --esm src/video/lib/generate-voiceover.ts
 *
 * La clé API est lue depuis ../../.env (racine du projet mekki)
 * ou depuis la variable d'environnement ELEVENLABS_API_KEY.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Load .env from project root ──────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../../../.env')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx < 0) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
    console.log('✓ .env chargé depuis', envPath)
  }
}

loadEnv()

const API_KEY = process.env.ELEVENLABS_API_KEY
if (!API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY non définie. Vérifiez votre fichier .env')
  process.exit(1)
}

// ── Segments de narration ─────────────────────────────────────────────────────
const SEGMENTS = [
  {
    id: 'segment-01',
    text: 'SitePilot. Le pilotage intelligent de vos chantiers, en temps réel.',
  },
  {
    id: 'segment-02',
    text: "Aujourd'hui, le suivi de chantier repose sur des fichiers Excel éparpillés, des photos sans traçabilité, et des retards détectés trop tard.",
  },
  {
    id: 'segment-03',
    text: 'Avec SitePilot, vous disposez d\'une vision consolidée instantanée. Budget global, décaissements, alertes : tout est centralisé dans un tableau de bord clair et précis.',
  },
  {
    id: 'segment-04',
    text: 'Chaque site est géolocalisé sur une carte interactive. Un clic suffit pour accéder à toutes les informations terrain.',
  },
  {
    id: 'segment-05',
    text: 'Le budget est décomposé poste par poste : pylône, local technique, groupe électrogène, clôture, électricité. Vous savez exactement où va chaque dirham.',
  },
  {
    id: 'segment-06',
    text: "L'intelligence artificielle analyse les photos de chantier et propose un score d'avancement. Le responsable valide ou ajuste en un geste.",
  },
  {
    id: 'segment-07',
    text: "Le planning des avances est visualisé sur une timeline claire. Chaque échéance, chaque montant, chaque site concerné.",
  },
  {
    id: 'segment-08',
    text: 'Chaque jeudi, un rapport professionnel est généré automatiquement et exportable en PDF, prêt pour votre direction.',
  },
  {
    id: 'segment-09',
    text: 'Import Excel intelligent, alertes automatiques, analyse IA, export PDF : SitePilot réunit tout ce dont vous avez besoin.',
  },
  {
    id: 'segment-10',
    text: 'SitePilot. Pilotez vos chantiers. Maîtrisez vos budgets. Demandez votre démonstration.',
  },
]

const OUTPUT_DIR = path.resolve(__dirname, '../../assets/voiceover')

// Voice settings
const MODEL_ID = 'eleven_multilingual_v2'
const VOICE_SETTINGS = { stability: 0.6, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true }

// ── Helper: GET voices list ───────────────────────────────────────────────────
async function fetchVoices(): Promise<Array<{ voice_id: string; name: string; labels: Record<string, string> }>> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      path: '/v1/voices',
      method: 'GET',
      headers: { 'xi-api-key': API_KEY! },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(data).voices ?? []) }
        catch { reject(new Error('Parse error: ' + data.slice(0, 200))) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

// ── Helper: POST TTS ──────────────────────────────────────────────────────────
async function generateAudio(voiceId: string, text: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ text, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS })
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY!,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let err = ''
        res.on('data', (c) => { err += c })
        res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${err.slice(0, 300)}`)))
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // Find best French voice
  console.log('\n🔍 Récupération des voix disponibles...')
  const voices = await fetchVoices()

  // Prefer multilingual or French voices: look for Antoni, Adam, or first available
  const preferredNames = ['Antoni', 'Adam', 'Liam', 'Charlie']
  let chosenVoice = voices.find((v) => preferredNames.includes(v.name))
    ?? voices.find((v) => v.labels?.language === 'fr' || v.labels?.accent === 'french')
    ?? voices[0]

  if (!chosenVoice) {
    console.error('❌ Aucune voix disponible dans votre compte ElevenLabs.')
    process.exit(1)
  }

  console.log(`✓ Voix sélectionnée: ${chosenVoice.name} (${chosenVoice.voice_id})`)
  console.log(`📁 Sortie: ${OUTPUT_DIR}\n`)

  let successCount = 0
  for (const segment of SEGMENTS) {
    const outputPath = path.join(OUTPUT_DIR, `${segment.id}.mp3`)

    if (fs.existsSync(outputPath)) {
      console.log(`⏭  ${segment.id} déjà généré — ignoré`)
      successCount++
      continue
    }

    process.stdout.write(`🎙  Génération ${segment.id}... `)
    try {
      const audio = await generateAudio(chosenVoice.voice_id, segment.text)
      fs.writeFileSync(outputPath, audio)
      console.log(`✓ (${Math.round(audio.length / 1024)} KB)`)
      successCount++
      // Avoid rate limiting
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.log(`❌ Erreur: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log(`\n✅ ${successCount}/${SEGMENTS.length} segments générés dans ${OUTPUT_DIR}`)
  console.log('\n📌 Prochaine étape:')
  console.log('   npx remotion studio  (depuis le dossier sitepilot)')
  console.log('   → Ouvrir http://localhost:3000 pour prévisualiser la vidéo')
}

main().catch((err) => {
  console.error('❌ Erreur fatale:', err)
  process.exit(1)
})
