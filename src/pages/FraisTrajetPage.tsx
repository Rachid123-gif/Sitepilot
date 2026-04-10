import { useState, useMemo } from 'react'
import {
  Car,
  Fuel,
  MapPin,
  Plus,
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Navigation,
  Clock,
  Route,
  AlertTriangle,
} from 'lucide-react'
import { useStore } from '../store'
import { KPICard } from '../components/ui/KPICard'
import { formatMontant } from '../lib/utils'
import { cn } from '../lib/utils'
import { geocodeAddress } from '../lib/geocoding'
import { estimerFraisTrajet, estimerFraisLocal } from '../lib/trajet-ai'
import type { TrajetSite, TronconPeage } from '../types'

// ── Helpers ─────────────────────────────────────────────────────────────────

function costBadge(cost: number) {
  if (cost < 1000) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
  if (cost < 2000) return 'bg-amber-500/15 text-amber-400 border-amber-500/20'
  return 'bg-red-500/15 text-red-400 border-red-500/20'
}

function sourceBadge(source: 'ia' | 'manuel') {
  return source === 'ia'
    ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
    : 'bg-orange-500/15 text-orange-400 border-orange-500/20'
}

function routeBadge(type: string) {
  if (type === 'autoroute') return 'bg-emerald-500/15 text-emerald-400'
  if (type === 'nationale') return 'bg-amber-500/15 text-amber-400'
  return 'bg-blue-500/15 text-blue-400'
}

function conditionBadge(c: string) {
  if (c === 'bonne') return 'text-emerald-400'
  if (c === 'difficile') return 'text-red-400'
  return 'text-amber-400'
}

// ── Main Page ───────────────────────────────────────────────────────────────

type SortField = 'siteNom' | 'distanceKm' | 'coutCarburant' | 'totalPeage' | 'coutTotal'

export function FraisTrajetPage() {
  const { trajets, addTrajet, updateTrajet, deleteTrajet, sites } = useStore()

  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('distanceKm')
  const [sortAsc, setSortAsc] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  // ── KPIs ────────────────────────────────────────────────────────────────
  const totalSites = trajets.length
  const totalCarburantAR = trajets.reduce((s, t) => s + t.coutCarburant * 2, 0)
  const totalPeageAR = trajets.reduce((s, t) => s + t.totalPeage * 2, 0)
  const totalCoutAR = totalCarburantAR + totalPeageAR
  const maxTrajet = trajets.length > 0
    ? trajets.reduce((a, b) => (a.coutTotal > b.coutTotal ? a : b))
    : null
  const totalDistance = trajets.reduce((s, t) => s + t.distanceKm, 0)

  // ── Filtered + sorted ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = trajets.filter(
      (t) =>
        t.siteNom.toLowerCase().includes(search.toLowerCase()) ||
        t.ville.toLowerCase().includes(search.toLowerCase())
    )
    list.sort((a, b) => {
      const va = a[sortField]
      const vb = b[sortField]
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va)
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number)
    })
    return list
  }, [trajets, search, sortField, sortAsc])

  function toggleSort(field: SortField) {
    if (sortField === field) setSortAsc(!sortAsc)
    else { setSortField(field); setSortAsc(true) }
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="inline-flex ml-1">
      {sortField === field ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
    </span>
  )

  const cardCls = 'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Car className="w-7 h-7 text-blue-500" />
            Frais de Trajet
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Depuis Temara (Zone Industrielle Ain Atiq) vers les sites de chantier
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un site
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard title="Sites suivis" value={totalSites} icon={<MapPin className="w-5 h-5" />} color="blue" />
        <KPICard title="Budget carburant A/R" value={formatMontant(totalCarburantAR)} suffix="DH" icon={<Fuel className="w-5 h-5" />} color="amber" />
        <KPICard title="Budget peage A/R" value={formatMontant(totalPeageAR)} suffix="DH" icon={<Route className="w-5 h-5" />} color="purple" />
        <KPICard title="Budget total A/R" value={formatMontant(totalCoutAR)} suffix="DH" icon={<Car className="w-5 h-5" />} color="green" subtitle={`Carburant: ${formatMontant(totalCarburantAR)} + Peage: ${formatMontant(totalPeageAR)}`} />
        <KPICard title="Distance totale" value={formatMontant(totalDistance)} suffix="km" icon={<Navigation className="w-5 h-5" />} color="cyan" />
        <KPICard title="Site le plus cher" value={maxTrajet ? maxTrajet.siteNom : '—'} subtitle={maxTrajet ? `${formatMontant(maxTrajet.coutTotal)} DH aller` : ''} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
      </div>

      {/* Search bar */}
      <div className={cn(cardCls, 'p-4')}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un site ou une ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>

      {/* Table */}
      <div className={cn(cardCls, 'overflow-x-auto')}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10">
              {[
                { field: 'siteNom' as SortField, label: 'Site' },
                { field: 'distanceKm' as SortField, label: 'Distance' },
                { field: 'coutCarburant' as SortField, label: 'Carburant' },
                { field: 'totalPeage' as SortField, label: 'Péage' },
                { field: 'coutTotal' as SortField, label: 'Total aller' },
              ].map(({ field, label }) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                >
                  {label}<SortIcon field={field} />
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">A/R</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Source</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {filtered.map((t) => (
              <tr
                key={t.id}
                onClick={() => setDetailId(detailId === t.id ? null : t.id)}
                className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-white">{t.siteNom}</div>
                  <div className="text-xs text-gray-500">{t.ville} · {t.dureeHeures}h</div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatMontant(t.distanceKm)} km</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatMontant(t.coutCarburant)} DH</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatMontant(t.totalPeage)} DH</td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border', costBadge(t.coutTotal))}>
                    {formatMontant(t.coutTotal)} DH
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                  {formatMontant(t.coutTotal * 2)} DH
                </td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border', sourceBadge(t.sourceEstimation))}>
                    {t.sourceEstimation === 'ia' ? <><Sparkles className="w-3 h-3" /> IA</> : <><Pencil className="w-3 h-3" /> Manuel</>}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditId(t.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTrajet(t.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 dark:text-gray-400 hover:text-red-500"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  Aucun trajet trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {detailId && <TrajetDetailPanel trajet={trajets.find((t) => t.id === detailId)!} onClose={() => setDetailId(null)} />}

      {/* Add modal */}
      {showAddModal && (
        <AddSiteModal
          existingSites={sites}
          existingTrajets={trajets}
          onAdd={(t) => {
            // If trajet already exists for this site, replace it
            const existing = trajets.find((x) => x.siteId === t.siteId)
            if (existing) {
              updateTrajet(existing.id, { ...t, id: existing.id })
            } else {
              addTrajet(t)
            }
            setShowAddModal(false)
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit modal */}
      {editId && (
        <EditTrajetModal
          trajet={trajets.find((t) => t.id === editId)!}
          onSave={(updates) => { updateTrajet(editId, { ...updates, sourceEstimation: 'manuel' }); setEditId(null) }}
          onClose={() => setEditId(null)}
        />
      )}
    </div>
  )
}

// ── Detail Panel ────────────────────────────────────────────────────────────

function TrajetDetailPanel({ trajet: t, onClose }: { trajet: TrajetSite; onClose: () => void }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.siteNom}</h3>
          <p className="text-sm text-gray-500">{t.ville} · {t.siteId}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard icon={<Navigation className="w-4 h-4" />} label="Distance" value={`${formatMontant(t.distanceKm)} km`} />
        <MetricCard icon={<Clock className="w-4 h-4" />} label="Durée" value={`${t.dureeHeures}h`} />
        <MetricCard icon={<Fuel className="w-4 h-4" />} label="Carburant" value={`${formatMontant(t.coutCarburant)} DH`} />
        <MetricCard icon={<Route className="w-4 h-4" />} label="Péage" value={`${formatMontant(t.totalPeage)} DH`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
          <p className="text-xs text-gray-500 mb-1">Type de route</p>
          <span className={cn('inline-flex px-2 py-0.5 rounded text-xs font-medium', routeBadge(t.typeRoute))}>
            {t.typeRoute}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
          <p className="text-xs text-gray-500 mb-1">Conditions</p>
          <span className={cn('text-sm font-medium', conditionBadge(t.conditionsRoute))}>
            {t.conditionsRoute}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
          <p className="text-xs text-gray-500 mb-1">Total A/R</p>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{formatMontant(t.coutTotal * 2)} DH</span>
        </div>
      </div>

      {/* Tronçons péage */}
      {t.tronconsPeage.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tronçons de péage</h4>
          <div className="space-y-1">
            {t.tronconsPeage.map((tp, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 text-sm">
                <span className="text-gray-600 dark:text-gray-400">{tp.de} → {tp.a}</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatMontant(tp.tarifDH)} DH</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {t.notes && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
          <p className="text-sm text-blue-700 dark:text-blue-300">{t.notes}</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded border', sourceBadge(t.sourceEstimation))}>
          {t.sourceEstimation === 'ia' ? <><Sparkles className="w-3 h-3" /> Estimé par IA</> : <><Pencil className="w-3 h-3" /> Modifié manuellement</>}
        </span>
        <span>· {t.dateEstimation}</span>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

// ── Add Site Modal ──────────────────────────────────────────────────────────

function AddSiteModal({
  existingSites,
  existingTrajets,
  onAdd,
  onClose,
}: {
  existingSites: any[]
  existingTrajets: TrajetSite[]
  onAdd: (t: TrajetSite) => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('new')
  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [nom, setNom] = useState('')
  const [ville, setVille] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [error, setError] = useState('')
  const [prixCarburant] = useState(13)
  const [consommation] = useState(8)

  const existingIds = new Set(existingTrajets.map((t) => t.siteId))

  async function handleGeocode() {
    if (!ville) return
    setGeocoding(true)
    setError('')
    try {
      const result = await geocodeAddress(ville)
      if (result) {
        setLat(result.lat.toFixed(4))
        setLng(result.lng.toFixed(4))
      } else {
        setError('Lieu non trouvé. Essayez un autre nom.')
      }
    } catch {
      setError('Erreur de géocodage')
    }
    setGeocoding(false)
  }

  async function handleEstimateAndAdd() {
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    const siteNom = mode === 'existing' ? existingSites.find((s) => s.id === selectedSiteId)?.nom || nom : nom

    if (!siteNom || !ville || isNaN(latNum) || isNaN(lngNum)) {
      setError('Remplissez tous les champs (nom, ville, coordonnées)')
      return
    }

    setEstimating(true)
    setError('')

    const siteId = mode === 'existing' ? selectedSiteId : `custom-${Date.now()}`
    const id = `tj-${siteId}`

    try {
      const apiKey = localStorage.getItem('anthropic-api-key') || ''
      let estimation

      if (apiKey) {
        estimation = await estimerFraisTrajet(siteNom, ville, latNum, lngNum, apiKey, prixCarburant, consommation)
      } else {
        estimation = estimerFraisLocal(latNum, lngNum, prixCarburant, consommation)
      }

      const trajet: TrajetSite = {
        id,
        siteId,
        siteNom,
        ville,
        lat: latNum,
        lng: lngNum,
        distanceKm: estimation.distanceKm,
        dureeHeures: estimation.dureeHeures,
        typeRoute: estimation.typeRoute,
        coutCarburant: estimation.coutCarburant,
        tronconsPeage: estimation.tronconsPeage,
        totalPeage: estimation.totalPeage,
        coutTotal: estimation.coutTotal,
        conditionsRoute: estimation.conditionsRoute,
        sourceEstimation: apiKey ? 'ia' : 'manuel',
        dateEstimation: new Date().toISOString().split('T')[0],
        notes: estimation.notes,
      }

      onAdd(trajet)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'estimation')
    }

    setEstimating(false)
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40'
  const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#0d0d14] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ajouter un site</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Mode switch */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('new')}
              className={cn('flex-1 py-2 text-sm font-medium rounded-lg border transition-colors', mode === 'new' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'text-gray-500 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5')}
            >
              Nouveau site
            </button>
            <button
              onClick={() => setMode('existing')}
              className={cn('flex-1 py-2 text-sm font-medium rounded-lg border transition-colors', mode === 'existing' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'text-gray-500 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5')}
            >
              Site existant ({existingSites.length})
            </button>
          </div>

          {mode === 'existing' ? (
            <div>
              <label className={labelCls}>Selectionnez un site</label>
              <select
                value={selectedSiteId}
                onChange={(e) => {
                  setSelectedSiteId(e.target.value)
                  const s = existingSites.find((s: any) => s.id === e.target.value)
                  if (s) {
                    setNom(s.nom)
                    setVille(s.nom)
                    if (s.lat) setLat(String(s.lat))
                    if (s.lng) setLng(String(s.lng))
                  }
                }}
                className={inputCls}
              >
                <option value="">-- Choisir --</option>
                {existingSites.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.code} · {s.nom}{existingIds.has(s.id) ? ' (deja ajoute)' : ''}
                  </option>
                ))}
              </select>
              {selectedSiteId && existingIds.has(selectedSiteId) && (
                <p className="mt-1 text-xs text-amber-500">Ce site a deja un trajet. L'estimation va le remplacer.</p>
              )}
            </div>
          ) : (
            <div>
              <label className={labelCls}>Nom du site</label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Base Ouarzazate" className={inputCls} />
            </div>
          )}

          <div>
            <label className={labelCls}>Ville / Localité</label>
            <div className="flex gap-2">
              <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ex: Ouarzazate" className={cn(inputCls, 'flex-1')} />
              <button
                onClick={handleGeocode}
                disabled={geocoding || !ville}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors"
              >
                {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                GPS
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Latitude</label>
              <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="29.74" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Longitude</label>
              <input type="text" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-7.97" className={inputCls} />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            Annuler
          </button>
          <button
            onClick={handleEstimateAndAdd}
            disabled={estimating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:opacity-50 transition-colors"
          >
            {estimating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Estimation en cours...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Estimer et ajouter</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Modal ──────────────────────────────────────────────────────────────

function EditTrajetModal({
  trajet,
  onSave,
  onClose,
}: {
  trajet: TrajetSite
  onSave: (updates: Partial<TrajetSite>) => void
  onClose: () => void
}) {
  const [distanceKm, setDistanceKm] = useState(String(trajet.distanceKm))
  const [dureeHeures, setDureeHeures] = useState(String(trajet.dureeHeures))
  const [coutCarburant, setCoutCarburant] = useState(String(trajet.coutCarburant))
  const [totalPeage, setTotalPeage] = useState(String(trajet.totalPeage))
  const [troncons, setTroncons] = useState<TronconPeage[]>([...trajet.tronconsPeage])
  const [notes, setNotes] = useState(trajet.notes)
  const [reEstimating, setReEstimating] = useState(false)

  function addTroncon() {
    setTroncons([...troncons, { de: '', a: '', tarifDH: 0 }])
  }

  function updateTroncon(i: number, field: keyof TronconPeage, value: string | number) {
    const updated = [...troncons]
    updated[i] = { ...updated[i], [field]: value }
    setTroncons(updated)
    // Recalc total péage
    const sum = updated.reduce((s, t) => s + (typeof t.tarifDH === 'string' ? parseFloat(t.tarifDH) || 0 : t.tarifDH), 0)
    setTotalPeage(String(Math.round(sum)))
  }

  function removeTroncon(i: number) {
    const updated = troncons.filter((_, idx) => idx !== i)
    setTroncons(updated)
    const sum = updated.reduce((s, t) => s + t.tarifDH, 0)
    setTotalPeage(String(Math.round(sum)))
  }

  async function handleReEstimate() {
    setReEstimating(true)
    try {
      const apiKey = localStorage.getItem('anthropic-api-key') || ''
      if (!apiKey) throw new Error('Clé API non configurée')
      const est = await estimerFraisTrajet(trajet.siteNom, trajet.ville, trajet.lat, trajet.lng, apiKey)
      setDistanceKm(String(est.distanceKm))
      setDureeHeures(String(est.dureeHeures))
      setCoutCarburant(String(est.coutCarburant))
      setTotalPeage(String(est.totalPeage))
      setTroncons(est.tronconsPeage)
      setNotes(est.notes)
    } catch {
      // silently fail
    }
    setReEstimating(false)
  }

  function handleSave() {
    const peage = parseFloat(totalPeage) || 0
    const carburant = parseFloat(coutCarburant) || 0
    onSave({
      distanceKm: parseFloat(distanceKm) || 0,
      dureeHeures: parseFloat(dureeHeures) || 0,
      coutCarburant: carburant,
      totalPeage: peage,
      tronconsPeage: troncons,
      coutTotal: carburant + peage,
      notes,
      dateEstimation: new Date().toISOString().split('T')[0],
    })
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40'
  const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#0d0d14] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-[#0d0d14] z-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Modifier — {trajet.siteNom}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Re-estimate button */}
          <button
            onClick={handleReEstimate}
            disabled={reEstimating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors disabled:opacity-50"
          >
            {reEstimating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Recalculer avec IA
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Distance (km)</label>
              <input type="number" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Durée (heures)</label>
              <input type="number" step="0.1" value={dureeHeures} onChange={(e) => setDureeHeures(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Carburant (DH)</label>
              <input type="number" value={coutCarburant} onChange={(e) => setCoutCarburant(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Total péage (DH)</label>
              <input type="number" value={totalPeage} onChange={(e) => setTotalPeage(e.target.value)} className={inputCls} readOnly />
            </div>
          </div>

          {/* Tronçons de péage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Tronçons de péage</label>
              <button onClick={addTroncon} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {troncons.map((tp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text" value={tp.de} placeholder="De"
                    onChange={(e) => updateTroncon(i, 'de', e.target.value)}
                    className={cn(inputCls, 'flex-1')}
                  />
                  <span className="text-gray-500 text-xs">→</span>
                  <input
                    type="text" value={tp.a} placeholder="À"
                    onChange={(e) => updateTroncon(i, 'a', e.target.value)}
                    className={cn(inputCls, 'flex-1')}
                  />
                  <input
                    type="number" value={tp.tarifDH} placeholder="DH"
                    onChange={(e) => updateTroncon(i, 'tarifDH', parseFloat(e.target.value) || 0)}
                    className={cn(inputCls, 'w-20')}
                  />
                  <button onClick={() => removeTroncon(i)} className="p-1 text-gray-400 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} />
          </div>

          <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total aller</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatMontant((parseFloat(coutCarburant) || 0) + (parseFloat(totalPeage) || 0))} DH
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Total A/R</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatMontant(((parseFloat(coutCarburant) || 0) + (parseFloat(totalPeage) || 0)) * 2)} DH
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
            Annuler
          </button>
          <button onClick={handleSave} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
