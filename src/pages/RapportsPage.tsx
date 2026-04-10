import { useState } from 'react'
import { FileText, Download, Plus } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useStore } from '../store'
import { genererRapportHebdo } from '../lib/report-generator'
import { exportRapportPDF } from '../lib/pdf-export'
import { formatMontant, formatPourcent, cn } from '../lib/utils'
import type { RapportHebdo } from '../types'

export function RapportsPage() {
  const { sites, photos, avances, rapports, addRapport } = useStore()
  const [selected, setSelected] = useState<RapportHebdo | null>(null)
  const [exporting, setExporting] = useState(false)

  function handleGenerate() {
    const rapport = genererRapportHebdo(sites, photos, avances)
    addRapport(rapport)
    setSelected(rapport)
  }

  function handleExport() {
    if (!selected) return
    setExporting(true)
    try {
      exportRapportPDF(selected, sites, photos, avances)
    } catch (err) {
      console.error('PDF export failed:', err)
    }
    setExporting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rapport du Jeudi</h1>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Générer le rapport
        </button>
      </div>

      {/* Previous reports */}
      {rapports.length > 0 && !selected && (
        <div className="space-y-2">
          {rapports.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:shadow-none transition-colors text-left"
            >
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{r.semaine}</p>
                <p className="text-xs text-gray-500">
                  Généré le{' '}
                  {format(parseISO(r.dateGeneration), "dd/MM/yyyy 'à' HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {r.details.length} sites
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Report preview */}
      {selected && (
        <>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              ← Retour
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Export...' : 'Exporter PDF'}
            </button>
          </div>

          <div
            id="rapport-preview"
            className="rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#0d0d14] p-8 space-y-6"
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-white/10 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    SitePilot — Rapport Hebdomadaire
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selected.semaine}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Généré le{' '}
                {format(parseISO(selected.dateGeneration), "dd/MM/yyyy 'à' HH:mm", {
                  locale: fr,
                })}
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                <p className="text-xs text-gray-500">Budget global</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatMontant(selected.kpiGlobal.budgetGlobal)} DH
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                <p className="text-xs text-gray-500">Total payé</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatMontant(selected.kpiGlobal.totalPaye)} DH
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                <p className="text-xs text-gray-500">% Payé</p>
                <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                  {formatPourcent(selected.kpiGlobal.pourcentagePaye)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                <p className="text-xs text-gray-500">Sites en cours</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {selected.kpiGlobal.nbSitesEnCours}
                </p>
              </div>
            </div>

            {/* Risk sites */}
            {selected.sitesRisque.length > 0 && (
              <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5">
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                  Sites à risque
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.sitesRisque.map((nom) => (
                    <span
                      key={nom}
                      className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                    >
                      {nom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Site
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Budget
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Payé
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Av. Théo
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Av. Réel
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Écart
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Recommandation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selected.details.map((d, i) => (
                    <tr
                      key={d.siteId}
                      className={cn(
                        'border-b border-gray-100 dark:border-white/5',
                        i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-white/[0.02]'
                      )}
                    >
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                        {d.siteNom}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        {formatMontant(d.budget)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        {formatMontant(d.paye)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        {formatPourcent(d.avancementTheo)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-blue-600 dark:text-blue-400">
                        {formatPourcent(d.avancementReel)}
                      </td>
                      <td
                        className={cn(
                          'px-3 py-2 text-right tabular-nums font-medium',
                          d.ecart < -15
                            ? 'text-red-500 dark:text-red-400'
                            : d.ecart < -5
                              ? 'text-amber-500 dark:text-amber-400'
                              : 'text-green-600 dark:text-green-400'
                        )}
                      >
                        {d.ecart > 0 ? '+' : ''}
                        {formatPourcent(d.ecart)}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        {d.recommandation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {rapports.length === 0 && !selected && (
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Aucun rapport généré. Cliquez sur "Générer le rapport".</p>
        </div>
      )}
    </div>
  )
}
