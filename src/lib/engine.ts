// Moteur de calcul metier — budgets, avancements, KPIs, alertes

import { differenceInDays, parseISO } from 'date-fns'
import type {
  Site,
  KPISite,
  KPIGlobal,
  Alerte,
  AlertLevel,
  Avance,
  Photo,
} from '../types'

// ─── Budget & paiement ───

export function budgetTotal(s: Site): number {
  const b = s.budget
  return (
    (b.pylone ?? 0) +
    (b.local ?? 0) +
    (b.localGE ?? 0) +
    (b.murCloture ?? 0) +
    (b.electricite ?? 0) +
    (b.fraisExtra ?? 0)
  )
}

export function totalPaye(s: Site): number {
  const p = s.paiements
  return (
    Math.abs(p.pylone ?? 0) +
    Math.abs(p.local ?? 0) +
    Math.abs(p.localGE ?? 0)
  )
}

// ─── Tranches théoriques ───

export function tranchesTheoriques(bt: number) {
  return {
    avance1: bt * 0.45,
    avance2: bt * 0.45,
    solde: bt * 0.1,
  }
}

// ─── Avancement théorique ───

export function jourProjet(site: Site, today?: Date): number {
  if (!site.dateDemarrage) return 0
  const start = parseISO(site.dateDemarrage)
  const ref = today ?? new Date()
  const diff = differenceInDays(ref, start) + 1
  return diff < 0 ? 0 : diff
}

export function avancementTheorique(jp: number): number {
  if (jp <= 0) return 0
  if (jp <= 12) return (jp / 12) * 45
  if (jp <= 27) return 45 + ((jp - 12) / 15) * 45
  return 90
}

// ─── KPI par site ───

export function computeKPISite(
  site: Site,
  photos: Photo[],
  today?: Date
): KPISite {
  const bt = budgetTotal(site)
  const tp = totalPaye(site)
  const pourcentagePaye = bt > 0 ? (tp / bt) * 100 : 0
  const jp = jourProjet(site, today)
  const avTheo = avancementTheorique(jp)
  const avReel = site.avancementReel ?? 0
  const ecartAvancement = avReel - avTheo
  const ecartTresorerie = pourcentagePaye - avReel
  const resteAPayer = bt - tp

  const alertLevel = computeAlertLevel(
    site,
    pourcentagePaye,
    avReel,
    avTheo,
    ecartAvancement,
    photos
  )

  return {
    siteId: site.id,
    budgetTotal: bt,
    totalPaye: tp,
    pourcentagePaye,
    avancementTheorique: avTheo,
    avancementReel: avReel,
    ecartAvancement,
    ecartTresorerie,
    resteAPayer,
    jourProjet: jp,
    alertLevel,
  }
}

// ─── Alertes ───

function computeAlertLevel(
  site: Site,
  pourcentagePaye: number,
  avReel: number,
  avTheo: number,
  ecart: number,
  photos: Photo[]
): AlertLevel {
  // ROUGE conditions
  if (pourcentagePaye > avReel + 20) return 'rouge'
  if (site.statut === 'BLOQUE') return 'rouge'
  if (ecart < -15) return 'rouge'
  // Paiement incohérent (payé 1 DH quand budget >> 0)
  const bt = budgetTotal(site)
  const tp = totalPaye(site)
  if (bt > 10000 && tp > 0 && tp < 10) return 'rouge'

  // ORANGE conditions
  if (ecart >= -15 && ecart < -5) return 'orange'
  if (site.notes && site.notes.includes('A confirmer')) return 'orange'
  // Pas de photo depuis > 7 jours
  if (site.statut === 'EN_COURS' && photos.length > 0) {
    const lastPhoto = photos.sort(
      (a, b) =>
        new Date(b.dateUpload).getTime() - new Date(a.dateUpload).getTime()
    )[0]
    const daysSince = differenceInDays(new Date(), parseISO(lastPhoto.dateUpload))
    if (daysSince > 7) return 'orange'
  }

  return 'vert'
}

export function generateAlertes(
  sites: Site[],
  photos: Photo[]
): Alerte[] {
  const alertes: Alerte[] = []
  const now = new Date()

  for (const site of sites) {
    const sitePhotos = photos.filter((p) => p.siteId === site.id)
    const kpi = computeKPISite(site, sitePhotos)

    if (kpi.alertLevel === 'rouge' || kpi.alertLevel === 'orange') {
      const messages: string[] = []

      const bt = budgetTotal(site)
      const tp = totalPaye(site)
      if (kpi.pourcentagePaye > kpi.avancementReel + 20) {
        messages.push(
          `Paiement excessif: ${kpi.pourcentagePaye.toFixed(0)}% payé vs ${kpi.avancementReel.toFixed(0)}% avancement`
        )
      }
      if (site.statut === 'BLOQUE') {
        messages.push('Site bloqué')
      }
      if (kpi.ecartAvancement < -15) {
        messages.push(
          `Retard critique: écart ${kpi.ecartAvancement.toFixed(1)}%`
        )
      }
      if (bt > 10000 && tp > 0 && tp < 10) {
        messages.push(`Montant payé suspect: ${tp} DH`)
      }
      if (kpi.ecartAvancement >= -15 && kpi.ecartAvancement < -5) {
        messages.push(
          `Retard léger: écart ${kpi.ecartAvancement.toFixed(1)}%`
        )
      }
      if (site.notes?.includes('A confirmer')) {
        messages.push(`Données à confirmer: ${site.notes}`)
      }

      for (const msg of messages) {
        alertes.push({
          id: `${site.id}-${alertes.length}`,
          siteId: site.id,
          siteNom: site.nom,
          level: kpi.alertLevel,
          message: msg,
          date: now.toISOString(),
        })
      }
    }
  }

  return alertes.sort((a, b) => {
    const order: Record<AlertLevel, number> = { rouge: 0, orange: 1, vert: 2 }
    return order[a.level] - order[b.level]
  })
}

// ─── KPI Global ───

export function computeKPIGlobal(
  sites: Site[],
  photos: Photo[],
  avances: Avance[]
): KPIGlobal {
  let budgetGlobal = 0
  let totalPayeGlobal = 0
  let nbEnCours = 0
  const alertes = generateAlertes(sites, photos)

  for (const site of sites) {
    budgetGlobal += budgetTotal(site)
    totalPayeGlobal += totalPaye(site)
    if (site.statut === 'EN_COURS') nbEnCours++
  }

  // Prochaine échéance = plus proche avance dans le futur
  const now = new Date()
  const futureAvances = avances
    .filter((a) => parseISO(a.date) > now)
    .sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
    )

  return {
    budgetGlobal,
    totalPaye: totalPayeGlobal,
    pourcentagePaye: budgetGlobal > 0 ? (totalPayeGlobal / budgetGlobal) * 100 : 0,
    nbSitesEnCours: nbEnCours,
    nbAlertes: alertes.filter((a) => a.level !== 'vert').length,
    prochaineEcheance: futureAvances.length > 0 ? futureAvances[0].date : null,
  }
}

// ─── Recommandations pour rapport ───

export function recommandation(kpi: KPISite, site: Site): string {
  if (site.statut === 'BLOQUE') return 'Action urgente: débloquer le site'
  if (kpi.ecartAvancement < -15) return 'Retard critique — renforcer les équipes'
  if (kpi.pourcentagePaye > kpi.avancementReel + 20)
    return 'Suspendre les paiements — avancement insuffisant'
  if (kpi.ecartAvancement < -5) return 'Surveiller de près — léger retard'
  if (site.statut === 'A_PLANIFIER') return 'Planifier le démarrage'
  if (kpi.avancementReel >= 90) return 'Préparer la validation finale'
  return 'En bonne voie — maintenir le rythme'
}
