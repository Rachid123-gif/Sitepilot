// Analyse IA de photos de chantier via API Anthropic

export interface AnalyseIAResult {
  scoreIA: number
  confianceIA: number
  justificationIA: string
  elementsVisibles: string[]
}

const SYSTEM_PROMPT = `Tu es un expert en suivi de chantiers de construction de pylônes télécom et de locaux techniques au Maroc.
Analyse cette photo de chantier et donne :

score : un pourcentage d'avancement estimé entre 0 et 100 basé sur ce que tu vois. Utilise cette échelle :

0-10% : terrain nu, piquetage, début de terrassement
10-25% : fouilles, fondations en cours
25-40% : fondations terminées, début dalle/radier
40-55% : dalle terminée, murs en cours ou structure métallique en montage
55-70% : structure pylône montée partiellement, local en gros œuvre terminé
70-85% : pylône monté, local fermé, finitions en cours
85-95% : équipements installés, clôture posée, finitions
95-100% : site terminé, prêt à livrer

justification : une description courte (2-3 phrases max) de ce que tu observes sur la photo qui justifie ton score
confiance : un score de confiance entre 0 et 1 sur ton estimation (0.3 = photo floue ou ambiguë, 0.9 = éléments très clairs)
elements_visibles : liste des éléments que tu identifies (ex: "fondations", "pylône partiellement monté", "mur clôture", "local technique", "groupe électrogène")

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{"score": 35, "justification": "...", "confiance": 0.7, "elements_visibles": ["...", "..."]}`

export async function analyserPhotoIA(
  imageBase64: string,
  imageMimeType: string,
  siteContext: {
    nom: string
    code: string
    hauteurPylone: number | null
    budgetTotal: number
    avancementTheorique: number
  },
  apiKey: string
): Promise<AnalyseIAResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageMimeType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyse cette photo du chantier "${siteContext.nom}" (${siteContext.code}). Ce site concerne la construction d'un pylône télécom de ${siteContext.hauteurPylone ?? '?'}m avec local technique et local groupe électrogène. Le budget total est de ${siteContext.budgetTotal} DH et le site en est théoriquement à ${siteContext.avancementTheorique.toFixed(1)}% d'avancement.`,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    throw new Error(`API Anthropic ${response.status}: ${err}`)
  }

  const data = await response.json()
  const text: string = data.content?.[0]?.text ?? ''

  // Strip any accidental markdown fences
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(clean)

  return {
    scoreIA: Math.min(100, Math.max(0, Math.round(Number(parsed.score)))),
    confianceIA: Math.min(1, Math.max(0, Number(parsed.confiance))),
    justificationIA: String(parsed.justification ?? ''),
    elementsVisibles: Array.isArray(parsed.elements_visibles)
      ? parsed.elements_visibles.map(String)
      : [],
  }
}

// Fallback simulation when no API key is configured
export function simulerAnalyseIA(file: File): AnalyseIAResult {
  const seed = file.size % 100
  const nameLower = file.name.toLowerCase()

  let baseScore = 25 + (seed % 50)
  let confiance = 0.4 + (seed % 50) / 100

  if (nameLower.includes('fondation') || nameLower.includes('fond')) {
    baseScore = Math.min(baseScore + 15, 85)
  }
  if (nameLower.includes('pylone') || nameLower.includes('pylon')) {
    baseScore = Math.min(baseScore + 20, 85)
  }
  if (nameLower.includes('final') || nameLower.includes('termine')) {
    baseScore = Math.min(baseScore + 25, 85)
  }
  if (nameLower.includes('debut') || nameLower.includes('start')) {
    baseScore = Math.max(baseScore - 10, 10)
  }

  if (baseScore > 70 || baseScore < 20) {
    confiance = Math.max(confiance - 0.15, 0.3)
  }

  const justifications = [
    'Fondations visibles, structure métallique en cours de montage.',
    'Terrassement terminé, début de maçonnerie visible.',
    'Structure pylône partiellement érigée, câblage non visible.',
    'Local technique en construction, murs montés à mi-hauteur.',
    'Clôture en cours d\'installation, terrain préparé.',
    'Dalle coulée, attente séchage avant suite des travaux.',
    'Montage pylône avancé, haubanage en cours.',
    'Finitions locaux techniques, peinture et électricité.',
    'Excavation en cours, terrain rocheux détecté.',
    'Assemblage éléments préfabriqués sur site.',
  ]

  const elementsSets = [
    ['fondations', 'terrassement'],
    ['dalle', 'radier'],
    ['murs', 'local technique'],
    ['pylône partiellement monté', 'local technique'],
    ['clôture', 'pylône monté'],
    ['équipements', 'local GE', 'groupe électrogène'],
    ['finitions', 'câblage'],
  ]

  return {
    scoreIA: Math.round(baseScore),
    confianceIA: Math.round(confiance * 100) / 100,
    justificationIA: justifications[seed % justifications.length],
    elementsVisibles: elementsSets[seed % elementsSets.length],
  }
}
