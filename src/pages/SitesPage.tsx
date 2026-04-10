import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Pencil, Check, X } from 'lucide-react'
import { useStore } from '../store'
import { StatutBadge, AlertBadge, ProprietaireBadge } from '../components/ui/Badge'
import { computeKPISite } from '../lib/engine'
import { formatMontant, formatPourcent, cn } from '../lib/utils'
import type { StatutSite, Proprietaire, Site, BudgetDetail, PaiementDetail } from '../types'

export function SitesPage() {
  const { sites, photos, updateSite } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterST, setFilterST] = useState<string>('all')
  const [filterStatut, setFilterStatut] = useState<string>('all')
  const [filterProp, setFilterProp] = useState<string>('all')
  const [filterCode, setFilterCode] = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Site>>({})
  const [editBudget, setEditBudget] = useState<BudgetDetail | null>(null)
  const [editPaiements, setEditPaiements] = useState<PaiementDetail | null>(null)

  const sousTraitants = [...new Set(sites.map((s) => s.sousTraitant))]
  const codes = [...new Set(sites.map((s) => s.code))].sort()

  const filtered = sites.filter((s) => {
    if (search && !s.nom.toLowerCase().includes(search.toLowerCase()) && !s.code.toLowerCase().includes(search.toLowerCase())) return false
    if (filterST !== 'all' && s.sousTraitant !== filterST) return false
    if (filterStatut !== 'all' && s.statut !== filterStatut) return false
    if (filterProp !== 'all' && s.proprietaire !== filterProp) return false
    if (filterCode !== 'all' && s.code !== filterCode) return false
    return true
  })

  function startEdit(site: Site) {
    setEditingId(site.id)
    setEditData({
      nom: site.nom,
      proprietaire: site.proprietaire,
      sousTraitant: site.sousTraitant,
      statut: site.statut,
      avancementReel: site.avancementReel,
      hauteurPylone: site.hauteurPylone,
    })
    setEditBudget({ ...site.budget })
    setEditPaiements({ ...site.paiements })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditData({})
    setEditBudget(null)
    setEditPaiements(null)
  }

  function saveEdit() {
    if (editingId) {
      const updates: Partial<Site> = { ...editData }
      if (editBudget) updates.budget = editBudget
      if (editPaiements) updates.paiements = editPaiements
      updateSite(editingId, updates)
      setEditingId(null)
      setEditData({})
      setEditBudget(null)
      setEditPaiements(null)
    }
  }

  function editBudgetTotal(): number {
    if (!editBudget) return 0
    return (editBudget.pylone ?? 0) + (editBudget.local ?? 0) + (editBudget.localGE ?? 0) +
      (editBudget.murCloture ?? 0) + (editBudget.electricite ?? 0) + (editBudget.fraisExtra ?? 0)
  }

  function editPayeTotal(): number {
    if (!editPaiements) return 0
    return Math.abs(editPaiements.pylone ?? 0) + Math.abs(editPaiements.local ?? 0) + Math.abs(editPaiements.localGE ?? 0)
  }

  const selectCls = 'px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40'
  const editInputCls = 'px-2 py-1 rounded border border-blue-400 bg-white text-sm text-gray-900 dark:bg-white/10 dark:border-blue-500/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-full'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sites</h1>
        <button
          onClick={() => navigate('/sites/nouveau')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Nouveau site
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <select value={filterCode} onChange={(e) => setFilterCode(e.target.value)} className={selectCls}>
          <option value="all">Tous codes</option>
          {codes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={filterProp} onChange={(e) => setFilterProp(e.target.value)} className={selectCls}>
          <option value="all">FAR + REP</option>
          <option value="FAR">FAR</option>
          <option value="REP">REP</option>
        </select>
        <select value={filterST} onChange={(e) => setFilterST(e.target.value)} className={selectCls}>
          <option value="all">Tous sous-traitants</option>
          {sousTraitants.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className={selectCls}>
          <option value="all">Tous statuts</option>
          <option value="A_PLANIFIER">A planifier</option>
          <option value="EN_COURS">En cours</option>
          <option value="BLOQUE">Bloqué</option>
          <option value="TERMINE">Terminé</option>
          <option value="VALIDE">Validé</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Prop.</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Site</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">S/Traitant</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Budget</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Payé</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">% Payé</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Av. Théo</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Av. Réel</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Écart</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Statut</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Risque</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((site, idx) => {
              const sitePhotos = photos.filter((p) => p.siteId === site.id)
              const kpi = computeKPISite(site, sitePhotos)
              const isEditing = editingId === site.id

              return (
                <tr
                  key={site.id}
                  className={cn(
                    'border-b border-gray-100 dark:border-white/5 transition-colors',
                    isEditing ? 'bg-blue-50/50 dark:bg-blue-500/5' : 'hover:bg-gray-50 dark:hover:bg-white/5',
                    idx % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/50 dark:bg-white/[0.02]'
                  )}
                >
                  {/* Code — always link */}
                  <td className="px-4 py-3 font-mono text-xs">
                    <button
                      onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}`)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {site.code}
                    </button>
                  </td>

                  {/* Propriétaire */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        value={editData.proprietaire ?? site.proprietaire}
                        onChange={(e) => setEditData({ ...editData, proprietaire: e.target.value as Proprietaire })}
                        className={cn(editInputCls, 'w-20')}
                      >
                        <option value="FAR">FAR</option>
                        <option value="REP">REP</option>
                      </select>
                    ) : (
                      <ProprietaireBadge prop={site.proprietaire} />
                    )}
                  </td>

                  {/* Nom */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.nom ?? site.nom}
                        onChange={(e) => setEditData({ ...editData, nom: e.target.value })}
                        className={cn(editInputCls, 'min-w-[120px]')}
                      />
                    ) : (
                      <span
                        className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}`)}
                      >
                        {site.nom}
                      </span>
                    )}
                  </td>

                  {/* Sous-traitant */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        value={editData.sousTraitant ?? site.sousTraitant}
                        onChange={(e) => setEditData({ ...editData, sousTraitant: e.target.value })}
                        className={cn(editInputCls, 'w-24')}
                      >
                        {sousTraitants.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">{site.sousTraitant}</span>
                    )}
                  </td>

                  {/* Budget — editable */}
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editBudgetTotal()}
                        onChange={(e) => {
                          // Distribute proportionally across budget postes
                          const newTotal = parseFloat(e.target.value) || 0
                          const oldTotal = editBudgetTotal() || 1
                          if (editBudget) {
                            const ratio = newTotal / oldTotal
                            setEditBudget({
                              pylone: Math.round((editBudget.pylone ?? 0) * ratio),
                              local: Math.round((editBudget.local ?? 0) * ratio),
                              localGE: Math.round((editBudget.localGE ?? 0) * ratio),
                              murCloture: Math.round((editBudget.murCloture ?? 0) * ratio),
                              electricite: Math.round((editBudget.electricite ?? 0) * ratio),
                              fraisExtra: Math.round((editBudget.fraisExtra ?? 0) * ratio),
                            })
                          }
                        }}
                        className={cn(editInputCls, 'w-24 text-right')}
                      />
                    ) : (
                      <span className="tabular-nums text-gray-700 dark:text-gray-300">{formatMontant(kpi.budgetTotal)}</span>
                    )}
                  </td>

                  {/* Payé — editable */}
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editPayeTotal()}
                        onChange={(e) => {
                          const newTotal = parseFloat(e.target.value) || 0
                          const oldTotal = editPayeTotal() || 1
                          if (editPaiements) {
                            const ratio = newTotal / oldTotal
                            setEditPaiements({
                              pylone: Math.round((editPaiements.pylone ?? 0) * ratio),
                              local: Math.round((editPaiements.local ?? 0) * ratio),
                              localGE: Math.round((editPaiements.localGE ?? 0) * ratio),
                            })
                          }
                        }}
                        className={cn(editInputCls, 'w-24 text-right')}
                      />
                    ) : (
                      <span className="tabular-nums text-gray-700 dark:text-gray-300">{formatMontant(kpi.totalPaye)}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">{formatPourcent(kpi.pourcentagePaye)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">{formatPourcent(kpi.avancementTheorique)}</td>

                  {/* Av. Réel — editable */}
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editData.avancementReel ?? site.avancementReel}
                        onChange={(e) => setEditData({ ...editData, avancementReel: parseFloat(e.target.value) || 0 })}
                        className={cn(editInputCls, 'w-16 text-right')}
                      />
                    ) : (
                      <span className="tabular-nums text-blue-600 dark:text-blue-400 font-medium">
                        {formatPourcent(kpi.avancementReel)}
                      </span>
                    )}
                  </td>

                  {/* Écart */}
                  <td
                    className={cn(
                      'px-4 py-3 text-right tabular-nums font-medium',
                      kpi.ecartAvancement < -15
                        ? 'text-red-500 dark:text-red-400'
                        : kpi.ecartAvancement < -5
                          ? 'text-amber-500 dark:text-amber-400'
                          : 'text-green-600 dark:text-green-400'
                    )}
                  >
                    {kpi.ecartAvancement > 0 ? '+' : ''}{formatPourcent(kpi.ecartAvancement)}
                  </td>

                  {/* Statut — editable */}
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <select
                        value={editData.statut ?? site.statut}
                        onChange={(e) => setEditData({ ...editData, statut: e.target.value as StatutSite })}
                        className={cn(editInputCls, 'w-28')}
                      >
                        <option value="A_PLANIFIER">A planifier</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="BLOQUE">Bloqué</option>
                        <option value="TERMINE">Terminé</option>
                        <option value="VALIDE">Validé</option>
                      </select>
                    ) : (
                      <StatutBadge statut={site.statut} />
                    )}
                  </td>

                  {/* Risque */}
                  <td className="px-4 py-3 text-center"><AlertBadge level={kpi.alertLevel} /></td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={saveEdit}
                          className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 transition-colors"
                          title="Enregistrer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded-lg bg-red-500/15 text-red-500 hover:bg-red-500/25 transition-colors"
                          title="Annuler"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(site) }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
