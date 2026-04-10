// Données de seed — 14 sites réels + planning avances
// Source : Situation_R15ET_R16.xlsx, Feuil1, lignes 11-24
// RÈGLE : montants payés stockés en POSITIF (abs() des valeurs Excel négatives)

import type { Site, Avance, TrajetSite } from '../types'

export const SEED_SITES: Site[] = [
  // ── R15/6 · PA_TATA ─────────────────────────────────────────────────────
  {
    id: 'R15/6',
    code: 'R15/6',
    proprietaire: 'FAR',
    nom: 'PA TATA',
    hauteurPylone: 15,
    budget: {
      pylone: 39000,
      local: 52500,
      localGE: 52500,
      murCloture: 0,
      electricite: 24000 + 7000, // col N=24000 + col O=7000
      fraisExtra: 0,
    },
    paiements: { pylone: 17550, local: 47250, localGE: 47250 },
    sousTraitant: 'Toumi',
    notes: 'A confirmer : Mur de clôture',
    statut: 'EN_COURS',
    dateDemarrage: '2026-04-01',
    avancementReel: 12,
  },
  // ── R15/8 · TOUIZGUI ────────────────────────────────────────────────────
  {
    id: 'R15/8',
    code: 'R15/8',
    proprietaire: 'FAR',
    nom: 'TOUIZGUI',
    hauteurPylone: 30,
    budget: {
      pylone: 75000,
      local: 52500,
      localGE: 52500,
      murCloture: 0,
      electricite: 24000 + 7000,
      fraisExtra: 30000,
    },
    paiements: { pylone: 0, local: 0, localGE: 0 },
    sousTraitant: 'Nakabi',
    notes: 'A confirmer : hauteur pylone et Mur de clôture',
    statut: 'A_PLANIFIER',
    dateDemarrage: null,
    avancementReel: 0,
  },
  // ── R15/10 · AKKA ───────────────────────────────────────────────────────
  {
    id: 'R15/10',
    code: 'R15/10',
    proprietaire: 'FAR',
    nom: 'AKKA',
    hauteurPylone: null,
    budget: {
      pylone: 0,
      local: 52500,
      localGE: 52500,
      murCloture: 0,
      electricite: 24000 + 7000,
      fraisExtra: 0,
    },
    paiements: { pylone: 0, local: 46125, localGE: 46125 },
    sousTraitant: 'Leban',
    notes: 'A confirmer : Mur de clôture',
    statut: 'EN_COURS',
    dateDemarrage: '2026-04-05',
    avancementReel: 8,
  },
  // ── R15/23 · S/S MAHBES ─────────────────────────────────────────────────
  {
    id: 'R15/23',
    code: 'R15/23',
    proprietaire: 'FAR',
    nom: 'S/S MAHBES',
    hauteurPylone: null,
    budget: {
      pylone: 0,
      local: 52500,
      localGE: 52500,
      murCloture: 0,
      electricite: 24000 + 7000,
      fraisExtra: 30000,
    },
    paiements: { pylone: 0, local: 0, localGE: 0 },
    sousTraitant: 'Leban',
    notes: null,
    statut: 'A_PLANIFIER',
    dateDemarrage: null,
    avancementReel: 0,
  },
  // ── R15/29 · Entree TATA ────────────────────────────────────────────────
  {
    id: 'R15/29',
    code: 'R15/29',
    proprietaire: 'REP',
    nom: 'Entree TATA',
    hauteurPylone: 20,
    budget: {
      pylone: 45000,
      local: 52500,
      localGE: 52500,
      murCloture: 0,
      electricite: 24000 + 7000,
      fraisExtra: 0,
    },
    paiements: { pylone: 20250, local: 23625, localGE: 23625 },
    sousTraitant: 'Toumi',
    notes: 'A confirmer : Mur de clôture',
    statut: 'EN_COURS',
    dateDemarrage: '2026-04-03',
    avancementReel: 10,
  },
  // ── R15/24 · Z11TM1 ─────────────────────────────────────────────────────
  {
    id: 'R15/24',
    code: 'R15/24',
    proprietaire: 'REP',
    nom: 'Z11TM1',
    hauteurPylone: 40,
    budget: {
      pylone: 95000,
      local: 52500,
      localGE: 52500,
      murCloture: 0,
      electricite: 24000 + 7000,
      fraisExtra: 76000,
    },
    paiements: { pylone: 0, local: 0, localGE: 0 },
    sousTraitant: 'Nakabi',
    notes: null,
    statut: 'A_PLANIFIER',
    dateDemarrage: null,
    avancementReel: 0,
  },
  // ── R15/25 · Z13B1 ──────────────────────────────────────────────────────
  {
    id: 'R15/25',
    code: 'R15/25',
    proprietaire: 'REP',
    nom: 'Z13B1',
    hauteurPylone: 40,
    budget: {
      pylone: 95000,
      local: 52500,
      localGE: 52500,
      murCloture: 0,
      electricite: 24000 + 7000,
      fraisExtra: 30000,
    },
    paiements: { pylone: 0, local: 0, localGE: 0 },
    sousTraitant: 'Nakabi',
    notes: null,
    statut: 'A_PLANIFIER',
    dateDemarrage: null,
    avancementReel: 0,
  },
  // ── R15/26 · Z12B1 ──────────────────────────────────────────────────────
  {
    id: 'R15/26',
    code: 'R15/26',
    proprietaire: 'REP',
    nom: 'Z12B1',
    hauteurPylone: 40,
    budget: {
      pylone: 95000,
      local: 52500,
      localGE: 52500,
      murCloture: 0,
      electricite: 24000 + 7000,
      fraisExtra: 30000,
    },
    paiements: { pylone: 0, local: 0, localGE: 0 },
    sousTraitant: 'Nakabi',
    notes: null,
    statut: 'A_PLANIFIER',
    dateDemarrage: null,
    avancementReel: 0,
  },
  // ── R15/27 · Z12NH1 (nom fichier source; planning = Z11NH1) ─────────────
  {
    id: 'R15/27',
    code: 'R15/27',
    proprietaire: 'REP',
    nom: 'Z12NH1',
    hauteurPylone: 40,
    budget: {
      pylone: 95000,
      local: 52500,
      localGE: 52500,
      murCloture: 0,
      electricite: 24000 + 7000,
      fraisExtra: 76000,
    },
    paiements: { pylone: 0, local: 0, localGE: 0 },
    sousTraitant: 'Nakabi',
    notes: 'Essaie d\'utiliser existant',
    statut: 'A_PLANIFIER',
    dateDemarrage: null,
    avancementReel: 0,
  },
  // ── R15/28 · Z11NV2 (nom fichier source; planning = Z12NV2) ─────────────
  {
    id: 'R15/28',
    code: 'R15/28',
    proprietaire: 'REP',
    nom: 'Z11NV2',
    hauteurPylone: 40,
    budget: {
      pylone: 95000,
      local: 52500,
      localGE: 52500,
      murCloture: 0,
      electricite: 24000 + 7000,
      fraisExtra: 30000,
    },
    paiements: { pylone: 0, local: 0, localGE: 0 },
    sousTraitant: 'Nakabi',
    notes: 'Essaie d\'utiliser existant',
    statut: 'A_PLANIFIER',
    dateDemarrage: null,
    avancementReel: 0,
  },
  // ── R15/14 · JBEL TWAL ──────────────────────────────────────────────────
  {
    id: 'R15/14',
    code: 'R15/14',
    proprietaire: 'FAR',
    nom: 'JBEL TWAL',
    hauteurPylone: 15,
    budget: {
      pylone: 39000,
      local: 52500,
      localGE: 52500,
      murCloture: 0,
      electricite: 24000 + 7000,
      fraisExtra: 76000,
    },
    paiements: { pylone: 0, local: 0, localGE: 0 },
    sousTraitant: 'Nakabi',
    notes: 'A confirmer la hauteur',
    statut: 'EN_COURS',
    dateDemarrage: '2026-04-02',
    avancementReel: 5,
  },
  // ── R15/19 · GARNISON SIDIFNI · paiement 1 DH suspect ──────────────────
  {
    id: 'R15/19',
    code: 'R15/19',
    proprietaire: 'FAR',
    nom: 'GARNISON SIDIFNI',
    hauteurPylone: null,
    budget: {
      pylone: 0,
      local: 0,
      localGE: 52500,
      murCloture: 0,
      electricite: 7000, // col O seulement, pas de col N
      fraisExtra: 0,
    },
    // DONNÉE SUSPECTE : 1 DH payé pour local — probablement une erreur de saisie
    paiements: { pylone: 0, local: 1, localGE: 0 },
    sousTraitant: 'Leban',
    notes: 'A confirmer la construction — DONNÉE SUSPECTE : paiement local = 1 DH',
    statut: 'A_PLANIFIER',
    dateDemarrage: null,
    avancementReel: 0,
  },
  // ── R15/22-DPM · DPM Tantan (R15/22 dupliqué — discriminant = nom) ──────
  {
    id: 'R15/22-DPM',
    code: 'R15/22',
    proprietaire: 'FAR',
    nom: 'DPM Tantan',
    hauteurPylone: 20,
    budget: {
      pylone: 45000,
      local: 0,
      localGE: 0,
      murCloture: 0,
      electricite: 0,
      fraisExtra: 0,
    },
    paiements: { pylone: 0, local: 0, localGE: 0 },
    sousTraitant: 'Leban',
    notes: 'A confirmer : Mur de clôture et frais element FAR',
    statut: 'A_PLANIFIER',
    dateDemarrage: null,
    avancementReel: 0,
  },
  // ── R15/22-CFA · 4 CFA tantan (R15/22 dupliqué — discriminant = nom) ────
  {
    id: 'R15/22-CFA',
    code: 'R15/22',
    proprietaire: 'FAR',
    nom: '4 CFA tantan',
    hauteurPylone: 40,
    budget: {
      pylone: 95000,
      local: 0,
      localGE: 0,
      murCloture: 0,
      electricite: 0,
      fraisExtra: 0,
    },
    paiements: { pylone: 90000, local: 0, localGE: 0 },
    sousTraitant: 'Leban',
    notes: null,
    statut: 'A_PLANIFIER',
    dateDemarrage: null,
    avancementReel: 0,
  },
]

// Vérification budgets attendus (commentaire de référence) :
// PA TATA:      175000  payé=112050
// TOUIZGUI:     241000  payé=0
// AKKA:         136000  payé=92250
// S/S MAHBES:   166000  payé=0
// Entree TATA:  181000  payé=67500
// Z11TM1:       307000  payé=0
// Z13B1:        261000  payé=0
// Z12B1:        261000  payé=0
// Z12NH1:       307000  payé=0
// Z11NV2:       261000  payé=0
// JBEL TWAL:    251000  payé=0
// GARNISON:      59500  payé=1
// DPM Tantan:    45000  payé=0
// 4 CFA tantan:  95000  payé=90000
// TOTAL:      2746500   payé=361801

export const SEED_AVANCES: Avance[] = [
  // ── Groupe 1 : JBEL TWAL + Z12NH1 + Z11TM1 ─────────────────────────────
  {
    id: 'av-1',
    date: '2026-04-02',
    montant: 381600,
    sitesIds: ['R15/14', 'R15/27', 'R15/24'],
    sitesNoms: ['JBEL TWAL', 'Z12NH1', 'Z11TM1'],
    type: 'Avance N° 1',
    complementaire: false,
  },
  // ── Groupe 2 : Z11NV2 + TOUIZGUI + Z13B1 + DPM + CFA ───────────────────
  {
    id: 'av-2',
    date: '2026-04-09',
    montant: 393000,
    sitesIds: ['R15/28', 'R15/8', 'R15/25', 'R15/22-DPM', 'R15/22-CFA'],
    sitesNoms: ['Z11NV2', 'TOUIZGUI', 'Z13B1', 'DPM Tantan', '4 CFA tantan'],
    type: 'Avance N° 1',
    complementaire: false,
  },
  // ── Groupe 3 : PA TATA + Entree TATA (complémentaire) ───────────────────
  {
    id: 'av-3',
    date: '2026-04-09',
    montant: 64800,
    sitesIds: ['R15/6', 'R15/29'],
    sitesNoms: ['PA TATA', 'Entree TATA'],
    type: 'Avance N° 1',
    complementaire: true,
  },
  // ── Avance 2 : JBEL TWAL + Z12NH1 + Z11TM1 ─────────────────────────────
  {
    id: 'av-4',
    date: '2026-04-23',
    montant: 335000,
    sitesIds: ['R15/14', 'R15/27', 'R15/24'],
    sitesNoms: ['JBEL TWAL', 'Z12NH1', 'Z11TM1'],
    type: 'Avance N° 2',
    complementaire: false,
  },
  // ── Avance 2 comp. : PA TATA + Entree TATA + AKKA ───────────────────────
  {
    id: 'av-5',
    date: '2026-04-23',
    montant: 51500,
    sitesIds: ['R15/6', 'R15/29', 'R15/10'],
    sitesNoms: ['PA TATA', 'Entree TATA', 'AKKA'],
    type: 'Avance N° 2',
    complementaire: true,
  },
  // ── Avance 2 : Z11NV2 + TOUIZGUI + Z13B1 + DPM + CFA ───────────────────
  {
    id: 'av-6',
    date: '2026-04-30',
    montant: 393000,
    sitesIds: ['R15/28', 'R15/8', 'R15/25', 'R15/22-DPM', 'R15/22-CFA'],
    sitesNoms: ['Z11NV2', 'TOUIZGUI', 'Z13B1', 'DPM Tantan', '4 CFA tantan'],
    type: 'Avance N° 2',
    complementaire: false,
  },
  // ── Solde final : JBEL TWAL + Z12NH1 + Z11TM1 ───────────────────────────
  {
    id: 'av-7',
    date: '2026-05-14',
    montant: 14400,
    sitesIds: ['R15/14', 'R15/27', 'R15/24'],
    sitesNoms: ['JBEL TWAL', 'Z12NH1', 'Z11TM1'],
    type: 'Dernier acompte',
    complementaire: false,
  },
  // ── Avance 1 : Z12B1 + S/S MAHBES ───────────────────────────────────────
  {
    id: 'av-8',
    date: '2026-05-21',
    montant: 166750,
    sitesIds: ['R15/26', 'R15/23'],
    sitesNoms: ['Z12B1', 'S/S MAHBES'],
    type: 'Avance N° 1',
    complementaire: false,
  },
  // ── Solde final : Z11NV2 + TOUIZGUI + Z13B1 + DPM + CFA ────────────────
  {
    id: 'av-9',
    date: '2026-05-28',
    montant: 74000,
    sitesIds: ['R15/28', 'R15/8', 'R15/25', 'R15/22-DPM', 'R15/22-CFA'],
    sitesNoms: ['Z11NV2', 'TOUIZGUI', 'Z13B1', 'DPM Tantan', '4 CFA tantan'],
    type: 'Dernier acompte',
    complementaire: false,
  },
  // ── Avance 2 : Z12B1 + S/S MAHBES ───────────────────────────────────────
  {
    id: 'av-10',
    date: '2026-06-04',
    montant: 166750,
    sitesIds: ['R15/26', 'R15/23'],
    sitesNoms: ['Z12B1', 'S/S MAHBES'],
    type: 'Avance N° 2',
    complementaire: false,
  },
  // ── Solde final : Z12B1 + S/S MAHBES ────────────────────────────────────
  {
    id: 'av-11',
    date: '2026-06-18',
    montant: 30500,
    sitesIds: ['R15/26', 'R15/23'],
    sitesNoms: ['Z12B1', 'S/S MAHBES'],
    type: 'Dernier acompte',
    complementaire: false,
  },
]

// ── Données seed trajets — estimations réalistes depuis Temara ────────────
// Bureau : Zone Industrielle Ain Atiq, Temara (33.9275, -6.9062)
// Prix gasoil : 13 DH/L, Consommation : 8 L/100km

export const SEED_TRAJETS: TrajetSite[] = [
  {
    id: 'tj-R15/6', siteId: 'R15/6', siteNom: 'PA TATA', ville: 'Tata',
    lat: 29.74, lng: -7.97, distanceKm: 590, dureeHeures: 7.5, typeRoute: 'mixte',
    coutCarburant: 614, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
    ],
    totalPeage: 180, coutTotal: 794, conditionsRoute: 'moyenne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Via Agadir puis route nationale vers Tata',
  },
  {
    id: 'tj-R15/8', siteId: 'R15/8', siteNom: 'TOUIZGUI', ville: 'Touizgi',
    lat: 29.30, lng: -7.50, distanceKm: 630, dureeHeures: 8.0, typeRoute: 'mixte',
    coutCarburant: 655, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
    ],
    totalPeage: 180, coutTotal: 835, conditionsRoute: 'moyenne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Route nationale après Agadir, piste possible',
  },
  {
    id: 'tj-R15/10', siteId: 'R15/10', siteNom: 'AKKA', ville: 'Akka',
    lat: 29.36, lng: -8.25, distanceKm: 610, dureeHeures: 7.8, typeRoute: 'mixte',
    coutCarburant: 634, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
    ],
    totalPeage: 180, coutTotal: 814, conditionsRoute: 'moyenne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Via Agadir puis N12 vers Akka',
  },
  {
    id: 'tj-R15/23', siteId: 'R15/23', siteNom: 'S/S MAHBES', ville: 'Smara',
    lat: 27.15, lng: -9.00, distanceKm: 980, dureeHeures: 11.5, typeRoute: 'mixte',
    coutCarburant: 1019, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
    ],
    totalPeage: 180, coutTotal: 1199, conditionsRoute: 'difficile',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Trajet très long, zone sahara, prévoir 2 jours',
  },
  {
    id: 'tj-R15/29', siteId: 'R15/29', siteNom: 'Entree TATA', ville: 'Tata',
    lat: 30.10, lng: -7.00, distanceKm: 580, dureeHeures: 7.3, typeRoute: 'mixte',
    coutCarburant: 603, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
    ],
    totalPeage: 180, coutTotal: 783, conditionsRoute: 'moyenne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Même itinéraire que PA TATA',
  },
  {
    id: 'tj-R15/24', siteId: 'R15/24', siteNom: 'Z11TM1', ville: 'Tiznit',
    lat: 29.70, lng: -9.80, distanceKm: 520, dureeHeures: 6.5, typeRoute: 'autoroute',
    coutCarburant: 541, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
      { de: 'Agadir', a: 'Tiznit', tarifDH: 20 },
    ],
    totalPeage: 200, coutTotal: 741, conditionsRoute: 'bonne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Autoroute jusqu\'à Tiznit',
  },
  {
    id: 'tj-R15/25', siteId: 'R15/25', siteNom: 'Z13B1', ville: 'Mirleft',
    lat: 29.58, lng: -10.05, distanceKm: 540, dureeHeures: 6.8, typeRoute: 'mixte',
    coutCarburant: 562, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
      { de: 'Agadir', a: 'Tiznit', tarifDH: 20 },
    ],
    totalPeage: 200, coutTotal: 762, conditionsRoute: 'bonne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Via Tiznit puis route côtière',
  },
  {
    id: 'tj-R15/26', siteId: 'R15/26', siteNom: 'Z12B1', ville: 'Assarag',
    lat: 29.55, lng: -9.50, distanceKm: 530, dureeHeures: 6.7, typeRoute: 'mixte',
    coutCarburant: 551, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
    ],
    totalPeage: 180, coutTotal: 731, conditionsRoute: 'moyenne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Via Agadir puis route vers Assarag',
  },
  {
    id: 'tj-R15/27', siteId: 'R15/27', siteNom: 'Z12NH1', ville: 'Oued Ifrane',
    lat: 30.05, lng: -9.35, distanceKm: 500, dureeHeures: 6.3, typeRoute: 'mixte',
    coutCarburant: 520, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
    ],
    totalPeage: 180, coutTotal: 700, conditionsRoute: 'moyenne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Via Agadir puis route vers Oued Ifrane',
  },
  {
    id: 'tj-R15/28', siteId: 'R15/28', siteNom: 'Z11NV2', ville: 'Tafraout',
    lat: 29.72, lng: -8.98, distanceKm: 510, dureeHeures: 6.5, typeRoute: 'mixte',
    coutCarburant: 530, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
    ],
    totalPeage: 180, coutTotal: 710, conditionsRoute: 'moyenne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Route de montagne après Agadir',
  },
  {
    id: 'tj-R15/14', siteId: 'R15/14', siteNom: 'JBEL TWAL', ville: 'Guelmim',
    lat: 28.98, lng: -10.06, distanceKm: 580, dureeHeures: 7.2, typeRoute: 'mixte',
    coutCarburant: 603, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
      { de: 'Agadir', a: 'Tiznit', tarifDH: 20 },
    ],
    totalPeage: 200, coutTotal: 803, conditionsRoute: 'moyenne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Via Tiznit puis Guelmim',
  },
  {
    id: 'tj-R15/19', siteId: 'R15/19', siteNom: 'GARNISON SIDIFNI', ville: 'Sidi Ifni',
    lat: 29.38, lng: -10.17, distanceKm: 560, dureeHeures: 7.0, typeRoute: 'mixte',
    coutCarburant: 582, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
      { de: 'Agadir', a: 'Tiznit', tarifDH: 20 },
    ],
    totalPeage: 200, coutTotal: 782, conditionsRoute: 'bonne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Via Tiznit puis route côtière vers Sidi Ifni',
  },
  {
    id: 'tj-R15/22-DPM', siteId: 'R15/22-DPM', siteNom: 'DPM Tantan', ville: 'Tan-Tan',
    lat: 28.50, lng: -11.40, distanceKm: 680, dureeHeures: 8.2, typeRoute: 'mixte',
    coutCarburant: 707, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
      { de: 'Agadir', a: 'Tiznit', tarifDH: 20 },
    ],
    totalPeage: 200, coutTotal: 907, conditionsRoute: 'moyenne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Via Tiznit et Guelmim puis N1 vers Tan-Tan',
  },
  {
    id: 'tj-R15/22-CFA', siteId: 'R15/22-CFA', siteNom: '4 CFA tantan', ville: 'Tan-Tan',
    lat: 28.30, lng: -11.10, distanceKm: 690, dureeHeures: 8.5, typeRoute: 'mixte',
    coutCarburant: 718, tronconsPeage: [
      { de: 'Temara', a: 'Marrakech', tarifDH: 80 },
      { de: 'Marrakech', a: 'Agadir', tarifDH: 100 },
      { de: 'Agadir', a: 'Tiznit', tarifDH: 20 },
    ],
    totalPeage: 200, coutTotal: 918, conditionsRoute: 'moyenne',
    sourceEstimation: 'ia', dateEstimation: '2026-04-02', notes: 'Via Tiznit et Guelmim puis N1 vers Tan-Tan',
  },
]
