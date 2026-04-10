// Normalisation des noms de sites et alias
// Convention : les noms DANS CE FICHIER suivent les noms du fichier source Excel.
// Z12NH1 (R15/27) et Z11NV2 (R15/28) sont les noms du fichier Excel.
// Le planning papier utilise Z11NH1 et Z12NV2 — ce sont des alias tolérés dans PLANNING_TO_SITE.

const ALIAS_MAP: Record<string, string> = {
  // Normalisation des noms de cellule longs vers noms courts
  'PC_S/SECTEUR_TOUIZGUI': 'TOUIZGUI',
  'PC_S/SECTEUR_AKKA': 'AKKA',
  'PC_S/SECTEUR_MAHBES': 'S/S MAHBES',
  'PA_TATA': 'PA TATA',
  'GARNISON_SIDIFNI': 'GARNISON SIDIFNI',
  'Entrée TATA': 'Entree TATA',
  // Z12NH1 et Z11NV2 ne sont PAS remplacés — ce sont les noms canoniques du fichier source
}

export function normaliserNomSite(nom: string): string {
  const trimmed = nom.trim()
  return ALIAS_MAP[trimmed] ?? trimmed
}

/**
 * Résoudre une référence planning (code + nom) vers l'ID interne du site.
 * Gère les alias : Z11NH1 (planning) = Z12NH1 (données) = R15/27
 * et Z12NV2 (planning) = Z11NV2 (données) = R15/28
 */
const PLANNING_TO_SITE: Record<string, string> = {
  // R15/6
  'R15/6 PA TATA': 'R15/6',
  'R15/6 PA_TATA': 'R15/6',
  // R15/8
  'R15/8 TOUIZGUI': 'R15/8',
  'R15/8 TOUIZGI': 'R15/8', // alias toléré
  // R15/10
  'R15/10 AKKA': 'R15/10',
  // R15/14
  'R15/14 JBEL TWAL': 'R15/14',
  // R15/19
  'R15/19 GARNISON SIDIFNI': 'R15/19',
  'R15/19 GARNISON': 'R15/19',
  // R15/23
  'R15/23 S/S MAHBES': 'R15/23',
  'R15/23 MAHBES': 'R15/23',
  // R15/24
  'R15/24 Z11TM1': 'R15/24',
  // R15/25
  'R15/25 Z13B1': 'R15/25',
  // R15/26
  'R15/26 Z12B1': 'R15/26',
  // R15/27 — nom source = Z12NH1 / alias planning = Z11NH1
  'R15/27 Z12NH1': 'R15/27',
  'R15/27 Z11NH1': 'R15/27',
  // R15/28 — nom source = Z11NV2 / alias planning = Z12NV2
  'R15/28 Z11NV2': 'R15/28',
  'R15/28 Z12NV2': 'R15/28',
  // R15/29
  'R15/29 Entree TATA': 'R15/29',
  'R15/29 Entrée TATA': 'R15/29',
  // R15/22 dupliqué
  'R15/22 DPM': 'R15/22-DPM',
  'R15/22 DPM Tantan': 'R15/22-DPM',
  'R15/22 4 CFA tantan': 'R15/22-CFA',
  'R15/22 4°CFA': 'R15/22-CFA',
  'R15/22 4CFA': 'R15/22-CFA',
}

export function resoudreSitePlanning(ref: string): string {
  const trimmed = ref.trim()
  return PLANNING_TO_SITE[trimmed] ?? trimmed
}

export function absVal(v: number | null | undefined): number {
  if (v == null || isNaN(v)) return 0
  return Math.abs(v)
}

export function numVal(v: unknown): number {
  if (v == null) return 0
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

export function strVal(v: unknown): string {
  if (v == null) return ''
  return String(v).trim()
}
