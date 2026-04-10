// Générateur de rapport du jeudi

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Site, Photo, Avance, RapportHebdo, RapportSiteDetail } from '../types'
import {
  computeKPISite,
  computeKPIGlobal,
  recommandation,
} from './engine'

export function genererRapportHebdo(
  sites: Site[],
  photos: Photo[],
  avances: Avance[]
): RapportHebdo {
  const now = new Date()
  const kpiGlobal = computeKPIGlobal(sites, photos, avances)

  const details: RapportSiteDetail[] = sites.map((site) => {
    const sitePhotos = photos.filter((p) => p.siteId === site.id)
    const kpi = computeKPISite(site, sitePhotos)
    return {
      siteId: site.id,
      siteNom: site.nom,
      budget: kpi.budgetTotal,
      paye: kpi.totalPaye,
      avancementTheo: kpi.avancementTheorique,
      avancementReel: kpi.avancementReel,
      ecart: kpi.ecartAvancement,
      recommandation: recommandation(kpi, site),
    }
  })

  const sitesRisque = sites
    .filter((s) => {
      const sitePhotos = photos.filter((p) => p.siteId === s.id)
      const kpi = computeKPISite(s, sitePhotos)
      return kpi.alertLevel === 'rouge'
    })
    .map((s) => s.nom)

  return {
    id: `rapport-${now.getTime()}`,
    dateGeneration: now.toISOString(),
    semaine: format(now, "'Semaine du' dd MMMM yyyy", { locale: fr }),
    kpiGlobal,
    sitesRisque,
    details,
  }
}
