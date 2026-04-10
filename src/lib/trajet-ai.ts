// Estimation IA des frais de trajet via API Anthropic Claude

export interface EstimationIA {
  distanceKm: number
  dureeHeures: number
  typeRoute: 'autoroute' | 'nationale' | 'mixte'
  tronconsPeage: Array<{ de: string; a: string; tarifDH: number }>
  totalPeage: number
  coutCarburant: number
  coutTotal: number
  conditionsRoute: 'bonne' | 'moyenne' | 'difficile'
  notes: string
}

const SYSTEM_PROMPT = `Tu es un expert en logistique transport au Maroc. Tu connais parfaitement les routes, autoroutes (ADM), distances et tarifs de péage entre toutes les villes marocaines.

On te donne un trajet entre Temara (Zone Industrielle Ain Atiq) et un site de chantier.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans texte autour.

Format de réponse :
{
  "distance_km": number,
  "duree_heures": number,
  "type_route": "autoroute" | "nationale" | "mixte",
  "troncons_peage": [
    { "de": "ville", "a": "ville", "tarif_dh": number }
  ],
  "total_peage": number,
  "cout_carburant": number,
  "cout_total": number,
  "conditions_route": "bonne" | "moyenne" | "difficile",
  "notes": "conseils ou avertissements sur ce trajet"
}

Règles de calcul :
- Prix gasoil : PRIX_CARBURANT DH/L
- Consommation : CONSOMMATION L/100km
- cout_carburant = (distance_km / 100) * consommation * prix_gasoil
- cout_total = cout_carburant + total_peage (aller simple)
- Utilise les vrais tarifs ADM catégorie 1 pour les péages
- Si pas d'autoroute sur le tronçon, total_peage = 0`

export async function estimerFraisTrajet(
  siteNom: string,
  ville: string,
  lat: number,
  lng: number,
  apiKey: string,
  prixCarburant: number = 13,
  consommation: number = 8,
): Promise<EstimationIA> {
  const systemPrompt = SYSTEM_PROMPT
    .replace('PRIX_CARBURANT', String(prixCarburant))
    .replace('CONSOMMATION', String(consommation))

  const userPrompt = `Calcule les frais de trajet aller simple de Temara (Zone Industrielle Ain Atiq, GPS: 33.9275, -6.9062) jusqu'au site "${siteNom}" situé à ${ville} (GPS: ${lat}, ${lng}).
Inclus tous les tronçons de péage autoroute ADM sur ce trajet avec les tarifs réels catégorie 1 (véhicule léger).`

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
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => '')
    throw new Error(`API Anthropic ${response.status}: ${err}`)
  }

  const data = await response.json()
  const text: string = data.content?.[0]?.text ?? ''
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(clean)

  return {
    distanceKm: Math.round(Number(parsed.distance_km)),
    dureeHeures: Math.round(Number(parsed.duree_heures) * 10) / 10,
    typeRoute: parsed.type_route || 'mixte',
    tronconsPeage: Array.isArray(parsed.troncons_peage)
      ? parsed.troncons_peage.map((t: any) => ({
          de: String(t.de),
          a: String(t.a),
          tarifDH: Math.round(Number(t.tarif_dh)),
        }))
      : [],
    totalPeage: Math.round(Number(parsed.total_peage)),
    coutCarburant: Math.round(Number(parsed.cout_carburant)),
    coutTotal: Math.round(Number(parsed.cout_total)),
    conditionsRoute: parsed.conditions_route || 'moyenne',
    notes: String(parsed.notes || ''),
  }
}

// Fallback : estimation basée sur la distance à vol d'oiseau
export function estimerFraisLocal(
  lat: number,
  lng: number,
  prixCarburant: number = 13,
  consommation: number = 8,
): Omit<EstimationIA, 'notes'> & { notes: string } {
  // Haversine distance from Temara
  const R = 6371
  const dLat = ((lat - 33.9275) * Math.PI) / 180
  const dLon = ((lng - (-6.9062)) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((33.9275 * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  const volOiseau = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distanceKm = Math.round(volOiseau * 1.35) // facteur route
  const dureeHeures = Math.round((distanceKm / 80) * 10) / 10 // 80 km/h moyen
  const coutCarburant = Math.round((distanceKm / 100) * consommation * prixCarburant)

  // Estimation péage simplifiée : ~0.30 DH/km sur autoroute
  const autoroute = distanceKm > 200
  const totalPeage = autoroute ? Math.round(distanceKm * 0.22) : 0

  return {
    distanceKm,
    dureeHeures,
    typeRoute: autoroute ? 'mixte' : 'nationale',
    tronconsPeage: autoroute
      ? [{ de: 'Temara', a: 'Sortie autoroute', tarifDH: totalPeage }]
      : [],
    totalPeage,
    coutCarburant,
    coutTotal: coutCarburant + totalPeage,
    conditionsRoute: distanceKm > 600 ? 'difficile' : distanceKm > 300 ? 'moyenne' : 'bonne',
    notes: 'Estimation locale (distance à vol d\'oiseau × 1.35). Utilisez "Estimer avec IA" pour des données plus précises.',
  }
}
