// Parser Excel — Import fichier Situation_R15ET_R16.xlsx

import * as XLSX from 'xlsx'
import type { Site, Avance } from '../types'
import { absVal, numVal, strVal, normaliserNomSite } from './normalizer'

interface ParseResult {
  sites: Site[]
  avances: Avance[]
  anomalies: string[]
}

export function parseExcelFile(buffer: ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) throw new Error('Feuille non trouvée')

  const anomalies: string[] = []
  const sites: Site[] = []

  // Parse sites (lignes 11 à 24, index 0-based = 10 à 23)
  for (let row = 11; row <= 24; row++) {
    const cell = (col: string) => ws[`${col}${row}`]?.v
    const note = strVal(cell('A'))
    const code = strVal(cell('C'))
    const proprietaire = strVal(cell('D'))
    const nom = strVal(cell('E'))
    const hauteur = numVal(cell('F'))
    const budgetPylone = numVal(cell('G'))
    const payePylone = numVal(cell('H'))
    const budgetLocal = numVal(cell('I'))
    const payeLocal = numVal(cell('J'))
    const budgetLocalGE = numVal(cell('K'))
    const payeLocalGE = numVal(cell('L'))
    const budgetMur = numVal(cell('M'))
    const budgetElec = numVal(cell('N'))
    const colO = numVal(cell('O'))
    const fraisExtra = numVal(cell('P'))

    if (!code) continue

    // Détection R15/22 dupliqué
    let id = code
    if (code === 'R15/22') {
      if (nom.toLowerCase().includes('dpm')) {
        id = 'R15/22-DPM'
      } else if (nom.toLowerCase().includes('cfa')) {
        id = 'R15/22-CFA'
      } else {
        anomalies.push(`R15/22 sans discriminant clair: "${nom}"`)
      }
    }

    // Détection paiement suspect
    if (payeLocal === 1 || payeLocal === -1) {
      anomalies.push(`${code} ${nom}: montant payé local suspect (${payeLocal} DH)`)
    }

    // Notes
    if (note) {
      anomalies.push(`${code} ${nom}: ${note}`)
    }

    const nomNormalise = normaliserNomSite(nom)

    const site: Site = {
      id,
      code,
      proprietaire: proprietaire === 'REP' ? 'REP' : 'FAR',
      nom: nomNormalise,
      hauteurPylone: hauteur || null,
      budget: {
        pylone: budgetPylone,
        local: budgetLocal,
        localGE: budgetLocalGE,
        murCloture: budgetMur,
        electricite: budgetElec + colO, // electricité N + O
        fraisExtra: fraisExtra,
      },
      paiements: {
        pylone: absVal(payePylone),
        local: absVal(payeLocal),
        localGE: absVal(payeLocalGE),
      },
      sousTraitant: strVal(cell('Q')) as Site['sousTraitant'],
      notes: note || null,
      statut: 'A_PLANIFIER',
      dateDemarrage: null,
      avancementReel: 0,
    }

    sites.push(site)
  }

  // Parse planning avances (simplified — seed data is used for this in practice)
  const avances: Avance[] = []

  return { sites, avances, anomalies }
}
