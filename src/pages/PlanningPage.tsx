import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronDown, ChevronUp, Pencil, X, Save, Filter, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { formatMontant, cn } from '../lib/utils'
import { budgetTotal } from '../lib/engine'
import type { Avance } from '../types'

const TYPE_COLORS: Record<string, string> = {
  'Avance N° 1': 'border-blue-500 bg-blue-500/10',
  'Avance N° 2': 'border-purple-500 bg-purple-500/10',
  'Dernier acompte': 'border-amber-500 bg-amber-500/10',
}

const TYPE_DOT: Record<string, string> = {
  'Avance N° 1': 'bg-blue-500',
  'Avance N° 2': 'bg-purple-500',
  'Dernier acompte': 'bg-amber-500',
}

const TYPE_TEXT: Record<string, string> = {
  'Avance N° 1': 'text-blue-600 dark:text-blue-400',
  'Avance N° 2': 'text-purple-600 dark:text-purple-400',
  'Dernier acompte': 'text-amber-600 dark:text-amber-400',
}

const AVANCE_TYPES: Avance['type'][] = ['Avance N° 1', 'Avance N° 2', 'Dernier acompte']

export function PlanningPage() {
  const { avances, sites, updateAvance, addAvance, deleteAvance } = useStore()
  const [filterType, setFilterType] = useState<string>('all')
  const [filterComp, setFilterComp] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editMontant, setEditMontant] = useState('')
  const [editSiteMontants, setEditSiteMontants] = useState<Record<string, number>>({})

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [newType, setNewType] = useState<Avance['type']>('Avance N° 1')
  const [newComp, setNewComp] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newSelectedSites, setNewSelectedSites] = useState<string[]>([])
  const [newSiteMontants, setNewSiteMontants] = useState<Record<string, number>>({})

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const sorted = useMemo(() => {
    let list = [...avances].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    if (filterType !== 'all') list = list.filter((a) => a.type === filterType)
    if (filterComp === 'oui') list = list.filter((a) => a.complementaire)
    if (filterComp === 'non') list = list.filter((a) => !a.complementaire)
    return list
  }, [avances, filterType, filterComp])

  // Group by date
  const grouped = useMemo(() => {
    const g: Record<string, Avance[]> = {}
    for (const av of sorted) {
      if (!g[av.date]) g[av.date] = []
      g[av.date].push(av)
    }
    return g
  }, [sorted])

  // Calculate per-site budget share for an avance
  function getSiteBreakdown(av: Avance) {
    const siteBudgets = av.sitesIds.map((sid) => {
      const site = sites.find((s) => s.id === sid)
      return { id: sid, nom: av.sitesNoms[av.sitesIds.indexOf(sid)], budget: site ? budgetTotal(site) : 0 }
    })
    const totalBudget = siteBudgets.reduce((s, x) => s + x.budget, 0)
    return siteBudgets.map((sb) => ({
      ...sb,
      part: totalBudget > 0 ? Math.round((sb.budget / totalBudget) * av.montant) : Math.round(av.montant / av.sitesIds.length),
      pct: totalBudget > 0 ? ((sb.budget / totalBudget) * 100).toFixed(1) : (100 / av.sitesIds.length).toFixed(1),
    }))
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id)
  }

  function startEdit(av: Avance) {
    setEditingId(av.id)
    setEditMontant(String(av.montant))
    // Initialize per-site amounts
    const breakdown = getSiteBreakdown(av)
    const siteMontants: Record<string, number> = {}
    breakdown.forEach((b) => { siteMontants[b.id] = b.part })
    setEditSiteMontants(siteMontants)
    setExpandedId(av.id)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditMontant('')
    setEditSiteMontants({})
  }

  function saveEdit() {
    if (editingId) {
      const total = Object.values(editSiteMontants).reduce((s, v) => s + v, 0)
      updateAvance(editingId, { montant: total || parseFloat(editMontant) || 0 })
      setEditingId(null)
      setEditMontant('')
      setEditSiteMontants({})
    }
  }

  function updateSiteMontant(siteId: string, value: number) {
    const updated = { ...editSiteMontants, [siteId]: value }
    setEditSiteMontants(updated)
    setEditMontant(String(Object.values(updated).reduce((s, v) => s + v, 0)))
  }

  // Modal helpers
  function openModal() {
    setNewType('Avance N° 1')
    setNewComp(false)
    setNewDate(new Date().toISOString().slice(0, 10))
    setNewSelectedSites([])
    setNewSiteMontants({})
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  function toggleSiteSelection(siteId: string) {
    setNewSelectedSites((prev) => {
      const next = prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
      // Remove montant for deselected sites
      if (!next.includes(siteId)) {
        setNewSiteMontants((m) => {
          const copy = { ...m }
          delete copy[siteId]
          return copy
        })
      }
      return next
    })
  }

  function toggleAllSites() {
    if (newSelectedSites.length === sites.length) {
      setNewSelectedSites([])
      setNewSiteMontants({})
    } else {
      setNewSelectedSites(sites.map((s) => s.id))
    }
  }

  function handleNewSiteMontant(siteId: string, value: number) {
    setNewSiteMontants((prev) => ({ ...prev, [siteId]: value }))
  }

  const newTotalMontant = Object.values(newSiteMontants).reduce((s, v) => s + v, 0)

  function handleCreate() {
    if (!newDate || newSelectedSites.length === 0) return
    const avance: Avance = {
      id: crypto.randomUUID(),
      type: newType,
      complementaire: newComp,
      date: newDate,
      montant: newTotalMontant,
      sitesIds: newSelectedSites,
      sitesNoms: newSelectedSites.map((sid) => {
        const site = sites.find((s) => s.id === sid)
        return site ? site.nom : sid
      }),
    }
    addAvance(avance)
    closeModal()
  }

  function handleDelete(id: string) {
    deleteAvance(id)
    setDeleteConfirmId(null)
  }

  const totalFiltered = sorted.reduce((s, a) => s + a.montant, 0)
  const totalAll = avances.reduce((s, a) => s + a.montant, 0)

  const selectCls = 'px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40'
  const inputCls = 'px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40'

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Planning des Avances</h1>
        <button
          onClick={openModal}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          title="Nouvelle Avance"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(TYPE_DOT).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className={cn('w-3 h-3 rounded-full', color)} />
            {type}
          </div>
        ))}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-3 h-3 rounded-full bg-gray-400 ring-2 ring-gray-500 dark:bg-gray-500 dark:ring-gray-400" />
          Complementaire
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm">
        <Filter className="w-4 h-4 text-gray-400" />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selectCls}>
          <option value="all">Toutes les tranches</option>
          <option value="Avance N° 1">Avance N° 1</option>
          <option value="Avance N° 2">Avance N° 2</option>
          <option value="Dernier acompte">Dernier acompte</option>
        </select>
        <select value={filterComp} onChange={(e) => setFilterComp(e.target.value)} className={selectCls}>
          <option value="all">Toutes</option>
          <option value="non">Principales</option>
          <option value="oui">Complementaires</option>
        </select>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {sorted.length} avance{sorted.length > 1 ? 's' : ''} · {formatMontant(totalFiltered)} DH
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-white/10" />

        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="relative pl-16">
              {/* Date dot */}
              <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-400 dark:bg-white/20 dark:border-white/40" />

              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {format(parseISO(date), 'EEEE dd MMMM yyyy', { locale: fr })}
              </div>

              <div className="space-y-3">
                {items.map((av) => {
                  const isExpanded = expandedId === av.id
                  const isEditing = editingId === av.id
                  const breakdown = getSiteBreakdown(av)

                  return (
                    <div key={av.id}>
                      {/* Card */}
                      <div
                        className={cn(
                          'rounded-xl border-l-4 p-4 backdrop-blur-sm cursor-pointer transition-all',
                          TYPE_COLORS[av.type] ?? 'border-gray-400 bg-gray-100 dark:bg-gray-500/10',
                          av.complementaire && 'border-dashed',
                          isExpanded && 'ring-2 ring-blue-500/20'
                        )}
                        onClick={() => toggleExpand(av.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {av.type}
                              </span>
                              {av.complementaire && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400">
                                  Complementaire
                                </span>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {av.sitesNoms.map((nom, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                                >
                                  {av.sitesIds[i]} {nom}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 flex items-center gap-2">
                            {!isEditing && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); startEdit(av) }}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
                                  title="Modifier"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(av.id) }}
                                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <div>
                              <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                                {formatMontant(av.montant)}
                              </p>
                              <p className="text-xs text-gray-500">DH</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded detail — montants par site */}
                      {isExpanded && (
                        <div className="mt-2 ml-4 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03] overflow-hidden">
                          {/* Header */}
                          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Detail par site
                            </span>
                            {isEditing && (
                              <div className="flex items-center gap-2">
                                <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors">
                                  <Save className="w-3 h-3" /> Enregistrer
                                </button>
                                <button onClick={cancelEdit} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors">
                                  <X className="w-3 h-3" /> Annuler
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Site rows */}
                          <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {breakdown.map((b) => (
                              <div key={b.id} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-16">{b.id}</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{b.nom}</span>
                                  <span className="text-xs text-gray-400">Budget: {formatMontant(b.budget)} DH</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-gray-400">{b.pct}%</span>
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      value={editSiteMontants[b.id] ?? b.part}
                                      onChange={(e) => updateSiteMontant(b.id, parseFloat(e.target.value) || 0)}
                                      onClick={(e) => e.stopPropagation()}
                                      className={cn(inputCls, 'w-28 text-right')}
                                    />
                                  ) : (
                                    <span className={cn('text-sm font-bold tabular-nums', TYPE_TEXT[av.type] || 'text-gray-900 dark:text-white')}>
                                      {formatMontant(b.part)} DH
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total row */}
                          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</span>
                            {isEditing ? (
                              <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                                {formatMontant(Object.values(editSiteMontants).reduce((s, v) => s + v, 0))} DH
                              </span>
                            ) : (
                              <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                                {formatMontant(av.montant)} DH
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="mt-8 p-5 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total planifie</span>
            {filterType !== 'all' && (
              <span className="ml-2 text-xs text-gray-400">({filterType})</span>
            )}
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
              {formatMontant(totalFiltered)} DH
            </span>
            {filterType !== 'all' && (
              <p className="text-xs text-gray-400 mt-1">
                Total global: {formatMontant(totalAll)} DH
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Voulez-vous vraiment supprimer cette avance ? Cette action est irreversible.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium text-white transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nouvelle Avance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nouvelle Avance</h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as Avance['type'])}
                  className={cn(selectCls, 'w-full')}
                >
                  {AVANCE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Complementaire */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Complementaire</label>
                <button
                  type="button"
                  onClick={() => setNewComp(!newComp)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    newComp ? 'bg-blue-600' : 'bg-gray-300 dark:bg-white/20'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                      newComp ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className={cn(inputCls, 'w-full')}
                />
              </div>

              {/* Sites concernes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sites concernes</label>
                <div className="border border-gray-200 dark:border-white/10 rounded-lg max-h-48 overflow-y-auto">
                  {/* Tout selectionner */}
                  <label className="flex items-center gap-3 px-3 py-2 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={newSelectedSites.length === sites.length && sites.length > 0}
                      onChange={toggleAllSites}
                      className="rounded border-gray-300 dark:border-white/20 text-blue-600 focus:ring-blue-500/40"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tout selectionner</span>
                    <span className="ml-auto text-xs text-gray-400">{newSelectedSites.length}/{sites.length}</span>
                  </label>
                  {sites.map((site) => (
                    <label
                      key={site.id}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                    >
                      <input
                        type="checkbox"
                        checked={newSelectedSites.includes(site.id)}
                        onChange={() => toggleSiteSelection(site.id)}
                        className="rounded border-gray-300 dark:border-white/20 text-blue-600 focus:ring-blue-500/40"
                      />
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{site.code}</span>
                      <span className="text-sm text-gray-900 dark:text-white">{site.nom}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Montant par site */}
              {newSelectedSites.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant par site (DH)</label>
                  <div className="space-y-2">
                    {newSelectedSites.map((sid) => {
                      const site = sites.find((s) => s.id === sid)
                      return (
                        <div key={sid} className="flex items-center gap-3">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">{sid}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{site?.nom ?? sid}</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={newSiteMontants[sid] ?? ''}
                            onChange={(e) => handleNewSiteMontant(sid, parseFloat(e.target.value) || 0)}
                            className={cn(inputCls, 'w-32 text-right')}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Montant total */}
              {newSelectedSites.length > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Montant total</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                    {formatMontant(newTotalMontant)} DH
                  </span>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={!newDate || newSelectedSites.length === 0}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
              >
                Creer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
