import { useState, useRef } from 'react'
import { Upload, AlertTriangle, CheckCircle, FileSpreadsheet } from 'lucide-react'
import { useStore } from '../store'
import { parseExcelFile } from '../lib/excel-parser'
import { formatMontant, cn } from '../lib/utils'
import { budgetTotal, totalPaye } from '../lib/engine'
import type { Site } from '../types'

export function ImportPage() {
  const { setSites } = useStore()
  const [parsed, setParsed] = useState<{
    sites: Site[]
    anomalies: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imported, setImported] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setImported(false)

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const result = parseExcelFile(reader.result as ArrayBuffer)
        setParsed({ sites: result.sites, anomalies: result.anomalies })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de parsing')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    setError(null)
    setImported(false)

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const result = parseExcelFile(reader.result as ArrayBuffer)
        setParsed({ sites: result.sites, anomalies: result.anomalies })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de parsing')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleConfirm() {
    if (!parsed) return
    setSites(parsed.sites)
    setImported(true)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Import Excel</h1>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="flex flex-col items-center justify-center gap-4 p-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-red-400 bg-gray-50 dark:border-white/20 dark:hover:border-blue-500/40 dark:bg-white/5 cursor-pointer transition-colors"
      >
        <FileSpreadsheet className="w-12 h-12 text-gray-400" />
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Glissez le fichier Excel ici ou cliquez pour sélectionner
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Format attendu: Situation_R15ET_R16.xlsx
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Preview */}
      {parsed && (
        <>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm p-5">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Preview — {parsed.sites.length} sites détectés
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Code
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Site
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Propriétaire
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Budget
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Payé
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      S/Traitant
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.sites.map((site, i) => (
                    <tr
                      key={site.id}
                      className={cn(
                        'border-b border-gray-100 dark:border-white/5',
                        i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-white/[0.02]'
                      )}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-gray-500 dark:text-gray-300">
                        {site.code}
                      </td>
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{site.nom}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                        {site.proprietaire}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        {formatMontant(budgetTotal(site))}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        {formatMontant(totalPaye(site))}
                      </td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                        {site.sousTraitant}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Anomalies */}
          {parsed.anomalies.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/5 backdrop-blur-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Anomalies détectées ({parsed.anomalies.length})
                </h3>
              </div>
              <ul className="space-y-1">
                {parsed.anomalies.map((a, i) => (
                  <li key={i} className="text-sm text-amber-800 dark:text-amber-200">
                    • {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confirm */}
          {!imported ? (
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition-colors"
            >
              <Upload className="w-5 h-5" /> Confirmer l'import
            </button>
          ) : (
            <div className="flex items-center gap-2 p-4 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-sm">
              <CheckCircle className="w-5 h-5" /> Import réussi —{' '}
              {parsed.sites.length} sites chargés
            </div>
          )}
        </>
      )}
    </div>
  )
}
