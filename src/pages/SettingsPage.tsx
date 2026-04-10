import { useState, useRef } from 'react'
import { Save, RotateCcw, Moon, Sun, Key, Eye, EyeOff, CheckCircle, Download, Upload, FileJson, AlertTriangle } from 'lucide-react'
import { useStore } from '../store'

export function SettingsPage() {
  const { sites, darkMode, toggleDarkMode, updateSite, resetData, initSeed } =
    useStore()

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anthropic-api-key') ?? '')
  const [showKey, setShowKey] = useState(false)
  const [keySaved, setKeySaved] = useState(false)

  // Export / Import
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importMessage, setImportMessage] = useState('')
  const [exportDone, setExportDone] = useState(false)

  function handleSaveApiKey() {
    localStorage.setItem('anthropic-api-key', apiKey.trim())
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2500)
  }

  const [dates, setDates] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {}
    for (const s of sites) {
      if (s.dateDemarrage) d[s.id] = s.dateDemarrage
    }
    return d
  })

  function handleDateChange(siteId: string, date: string) {
    setDates((prev) => ({ ...prev, [siteId]: date }))
  }

  function handleSaveDates() {
    for (const [id, date] of Object.entries(dates)) {
      updateSite(id, { dateDemarrage: date || null })
    }
  }

  function handleExport() {
    const state = useStore.getState()
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      app: 'SitePilot',
      data: {
        sites: state.sites,
        avances: state.avances,
        photos: state.photos,
        rapports: state.rapports,
        trajets: state.trajets,
      },
    }
    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `sitepilot-backup-${date}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setExportDone(true)
    setTimeout(() => setExportDone(false), 3000)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        // Validate structure
        if (!parsed.data || !parsed.data.sites || !Array.isArray(parsed.data.sites)) {
          setImportStatus('error')
          setImportMessage('Fichier invalide : structure de données non reconnue.')
          return
        }
        if (!confirm(
          `Importer les données du fichier "${file.name}" ?\n\n` +
          `• ${parsed.data.sites.length} sites\n` +
          `• ${parsed.data.avances?.length || 0} avances\n` +
          `• ${parsed.data.photos?.length || 0} photos\n` +
          `• ${parsed.data.rapports?.length || 0} rapports\n` +
          `• ${parsed.data.trajets?.length || 0} trajets\n\n` +
          `⚠️ Les données actuelles seront remplacées.`
        )) return

        const store = useStore.getState()
        store.setSites(parsed.data.sites)
        store.setAvances(parsed.data.avances || [])
        store.setPhotos(parsed.data.photos || [])
        store.setRapports(parsed.data.rapports || [])
        store.setTrajets(parsed.data.trajets || [])

        setImportStatus('success')
        setImportMessage(
          `Import réussi ! ${parsed.data.sites.length} sites, ` +
          `${parsed.data.avances?.length || 0} avances, ` +
          `${parsed.data.trajets?.length || 0} trajets chargés.`
        )
        setTimeout(() => {
          setImportStatus('idle')
          setImportMessage('')
        }, 5000)
      } catch {
        setImportStatus('error')
        setImportMessage('Erreur : le fichier n\'est pas un JSON valide.')
      }
    }
    reader.readAsText(file)
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleReset() {
    if (confirm('Réinitialiser toutes les données ? Cette action est irréversible.')) {
      resetData()
      setTimeout(() => initSeed(), 100)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      {/* Clé API Anthropic */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm p-5">
        <div className="flex items-center gap-2 mb-1">
          <Key className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Clé API Anthropic</h3>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Nécessaire pour l'analyse IA des photos de chantier. Sans cette clé, l'analyse fonctionne en mode simulation.
        </p>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full pr-10 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleSaveApiKey}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium transition-colors whitespace-nowrap"
          >
            {keySaved ? (
              <><CheckCircle className="w-4 h-4" /> Enregistrée</>
            ) : (
              <><Save className="w-4 h-4" /> Enregistrer</>
            )}
          </button>
        </div>
        {apiKey.trim() && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
            ✓ Clé configurée — le module photo utilisera l'analyse IA réelle.
          </p>
        )}
        {!apiKey.trim() && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            ⚠ Aucune clé — le module photo fonctionnera en mode simulation.
          </p>
        )}
      </div>

      {/* Dark mode */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm p-5">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Apparence</h3>
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-blue-400" />
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          </span>
        </button>
      </div>

      {/* Dates de démarrage */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm p-5">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
          Dates de démarrage par site
        </h3>
        <div className="space-y-3">
          {sites.map((site) => (
            <div
              key={site.id}
              className="flex items-center gap-4"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300 w-48 flex-shrink-0">
                {site.code} — {site.nom}
              </span>
              <input
                type="date"
                value={dates[site.id] || ''}
                onChange={(e) => handleDateChange(site.id, e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveDates}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium transition-colors"
        >
          <Save className="w-4 h-4" /> Enregistrer les dates
        </button>
      </div>

      {/* Export / Import */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm p-5">
        <div className="flex items-center gap-2 mb-1">
          <FileJson className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sauvegarde & Restauration</h3>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
          Exportez vos données en JSON pour les sauvegarder ou les transférer sur un autre poste. Importez un fichier de sauvegarde pour restaurer les données.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors flex-1"
          >
            {exportDone ? (
              <><CheckCircle className="w-4 h-4" /> Fichier téléchargé !</>
            ) : (
              <><Download className="w-4 h-4" /> Exporter les données</>
            )}
          </button>

          {/* Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex-1"
          >
            <Upload className="w-4 h-4" /> Importer des données
          </button>
        </div>

        {/* Status messages */}
        {importStatus === 'success' && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{importMessage}</p>
          </div>
        )}
        {importStatus === 'error' && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{importMessage}</p>
          </div>
        )}

        {/* Info box */}
        <div className="mt-4 px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
          <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            <strong>💡 Conseil :</strong> Avant chaque mise à jour de l'application, exportez vos données.
            Après la mise à jour, importez le fichier pour retrouver toutes vos informations.
          </p>
        </div>
      </div>

      {/* Reset */}
      <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5 backdrop-blur-sm p-5">
        <h3 className="text-sm font-medium text-red-700 dark:text-red-400 mb-4">Zone de danger</h3>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 dark:bg-red-500/20 dark:hover:bg-red-500/30 dark:border-red-500/30 dark:text-red-400 text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Réinitialiser les données
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Recharge les données seed d'origine. Les photos et rapports seront supprimés.
        </p>
      </div>
    </div>
  )
}
