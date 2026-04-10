// SitePilot — Types principaux

export type Proprietaire = 'FAR' | 'REP'

export type StatutSite =
  | 'A_PLANIFIER'
  | 'EN_COURS'
  | 'BLOQUE'
  | 'TERMINE'
  | 'VALIDE'

export type AlertLevel = 'vert' | 'orange' | 'rouge'

export type SousTraitant = 'Toumi' | 'Nakabi' | 'Leban'

export interface BudgetDetail {
  pylone: number
  local: number
  localGE: number
  murCloture: number
  electricite: number
  fraisExtra: number
}

export interface PaiementDetail {
  pylone: number
  local: number
  localGE: number
}

export interface Site {
  id: string // ex: "R15/6"
  code: string // ex: "R15/6"
  proprietaire: Proprietaire
  nom: string // ex: "PA_TATA"
  hauteurPylone: number | null
  budget: BudgetDetail
  paiements: PaiementDetail
  sousTraitant: SousTraitant | string
  notes: string | null
  statut: StatutSite
  dateDemarrage: string | null // ISO date
  avancementReel: number // % validé par le manager
  lat?: number
  lng?: number
}

export interface Photo {
  id: string
  siteId: string
  filename: string
  dataUrl: string // base64
  dateUpload: string // ISO
  scoreIA: number
  confianceIA: number
  justificationIA: string
  elementsVisibles?: string[]
  scoreValide: number | null
  valide: boolean
  dateValidation?: string
  nomValidateur?: string
  commentaireValidateur?: string
}

export interface Avance {
  id: string
  date: string // ISO date
  montant: number
  sitesIds: string[] // codes des sites
  sitesNoms: string[]
  type: 'Avance N° 1' | 'Avance N° 2' | 'Dernier acompte'
  complementaire: boolean
}

export interface Alerte {
  id: string
  siteId: string
  siteNom: string
  level: AlertLevel
  message: string
  date: string // ISO
}

export interface KPISite {
  siteId: string
  budgetTotal: number
  totalPaye: number
  pourcentagePaye: number
  avancementTheorique: number
  avancementReel: number
  ecartAvancement: number
  ecartTresorerie: number
  resteAPayer: number
  jourProjet: number
  alertLevel: AlertLevel
}

export interface KPIGlobal {
  budgetGlobal: number
  totalPaye: number
  pourcentagePaye: number
  nbSitesEnCours: number
  nbAlertes: number
  prochaineEcheance: string | null
}

export interface RapportHebdo {
  id: string
  dateGeneration: string
  semaine: string
  kpiGlobal: KPIGlobal
  sitesRisque: string[]
  details: RapportSiteDetail[]
}

export interface RapportSiteDetail {
  siteId: string
  siteNom: string
  budget: number
  paye: number
  avancementTheo: number
  avancementReel: number
  ecart: number
  recommandation: string
}

// ── Frais de trajet ─────────────────────────────────────────────────────

export interface TronconPeage {
  de: string
  a: string
  tarifDH: number
}

export interface TrajetSite {
  id: string
  siteId: string
  siteNom: string
  ville: string
  lat: number
  lng: number
  distanceKm: number
  dureeHeures: number
  typeRoute: 'autoroute' | 'nationale' | 'mixte'
  coutCarburant: number
  tronconsPeage: TronconPeage[]
  totalPeage: number
  coutTotal: number
  conditionsRoute: 'bonne' | 'moyenne' | 'difficile'
  sourceEstimation: 'ia' | 'manuel'
  dateEstimation: string
  notes: string
}
