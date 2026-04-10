import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Save, Pencil, X } from 'lucide-react'
import { useStore } from '../store'
import { StatutBadge, AlertBadge, ProprietaireBadge } from '../components/ui/Badge'
import { computeKPISite, tranchesTheoriques } from '../lib/engine'
import { formatMontant, formatPourcent, cn } from '../lib/utils'
import type { StatutSite, Proprietaire, BudgetDetail, PaiementDetail } from '../types'

const BUDGET_POSTES = [
  { key: 'pylone',      label: 'Pylone',              icon: '🏗️', paidKey: 'pylone'   as const },
  { key: 'local',       label: 'Local Construction',  icon: '🏠', paidKey: 'local'    as const },
  { key: 'localGE',     label: 'Local GE',             icon: '⚡', paidKey: 'localGE'  as const },
  { key: 'murCloture',  label: 'Mur Cloture',          icon: '🧱', paidKey: null },
  { key: 'electricite', label: 'Electricite',          icon: '💡', paidKey: null },
  { key: 'fraisExtra',  label: 'Frais Extra',           icon: '📦', paidKey: null },
] as const

export function SiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sites, photos, updateSite } = useStore()
  const site = sites.find((s) => s.id === decodeURIComponent(id ?? ''))

  // ── Edit states ──────────────────────────────────────────────────────
  const [editingHeader, setEditingHeader] = useState(false)
  const [editingBudget, setEditingBudget] = useState(false)
  const [editingTranches, setEditingTranches] = useState(false)

  // Header fields
  const [editNom, setEditNom] = useState('')
  const [editProp, setEditProp] = useState<Proprietaire>('FAR')
  const [editST, setEditST] = useState('')
  const [editHauteur, setEditHauteur] = useState('')
  const [editStatut, setEditStatut] = useState<StatutSite>('A_PLANIFIER')
  const [editDate, setEditDate] = useState('')
  const [editAv, setEditAv] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // Budget fields
  const [editBudget, setEditBudget] = useState<BudgetDetail>({ pylone: 0, local: 0, localGE: 0, murCloture: 0, electricite: 0, fraisExtra: 0 })
  const [editPaiements, setEditPaiements] = useState<PaiementDetail>({ pylone: 0, local: 0, localGE: 0 })

  // Tranches
  const [trancheAv1, setTrancheAv1] = useState(45)
  const [trancheAv2, setTrancheAv2] = useState(45)
  const [trancheSolde, setTrancheSolde] = useState(10)

  if (!site) {
    return (
      <div className="text-center py-20 text-gray-500">
        Site non trouve.{' '}
        <button onClick={() => navigate('/sites')} className="text-blue-600 dark:text-blue-400 underline">
          Retour
        </button>
      </div>
    )
  }

  const sitePhotos = photos.filter((p) => p.siteId === site.id)
  const kpi = computeKPISite(site, sitePhotos)
  const tranches = tranchesTheoriques(kpi.budgetTotal)

  // ── Start editing functions ──────────────────────────────────────────
  function startEditHeader() {
    setEditNom(site!.nom)
    setEditProp(site!.proprietaire)
    setEditST(site!.sousTraitant)
    setEditHauteur(site!.hauteurPylone != null ? String(site!.hauteurPylone) : '')
    setEditStatut(site!.statut)
    setEditDate(site!.dateDemarrage || '')
    setEditAv(String(site!.avancementReel))
    setEditNotes(site!.notes || '')
    setEditingHeader(true)
  }

  function saveHeader() {
    updateSite(site!.id, {
      nom: editNom,
      proprietaire: editProp,
      sousTraitant: editST,
      hauteurPylone: editHauteur ? parseFloat(editHauteur) : null,
      statut: editStatut,
      dateDemarrage: editDate || null,
      avancementReel: parseFloat(editAv) || 0,
      notes: editNotes || null,
    })
    setEditingHeader(false)
  }

  function startEditBudget() {
    setEditBudget({ ...site!.budget })
    setEditPaiements({ ...site!.paiements })
    setEditingBudget(true)
  }

  function saveBudget() {
    updateSite(site!.id, {
      budget: editBudget,
      paiements: editPaiements,
    })
    setEditingBudget(false)
  }

  function startEditTranches() {
    setTrancheAv1(45)
    setTrancheAv2(45)
    setTrancheSolde(10)
    setEditingTranches(true)
  }

  function saveTranches() {
    // Tranches are calculated, but we store custom percentages if user wants
    setEditingTranches(false)
  }

  const inputCls = 'px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40'
  const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'
  const cardCls = 'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm p-5'

  function SectionHeader({ title, editing, onEdit, onSave, onCancel }: { title: string; editing: boolean; onEdit: () => void; onSave: () => void; onCancel: () => void }) {
    return (
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {editing ? (
          <div className="flex items-center gap-2">
            <button onClick={onSave} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors">
              <Save className="w-3 h-3" /> Enregistrer
            </button>
            <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors">
              <X className="w-3 h-3" /> Annuler
            </button>
          </div>
        ) : (
          <button onClick={onEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-600 dark:text-gray-400 text-xs font-medium transition-colors">
            <Pencil className="w-3 h-3" /> Modifier
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <button
        onClick={() => navigate('/sites')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux sites
      </button>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className={cardCls}>
        <SectionHeader
          title="Informations du site"
          editing={editingHeader}
          onEdit={startEditHeader}
          onSave={saveHeader}
          onCancel={() => setEditingHeader(false)}
        />

        {editingHeader ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Nom du site</label>
              <input type="text" value={editNom} onChange={(e) => setEditNom(e.target.value)} className={cn(inputCls, 'w-full')} />
            </div>
            <div>
              <label className={labelCls}>Code</label>
              <input type="text" value={site.code} disabled className={cn(inputCls, 'w-full opacity-50')} />
            </div>
            <div>
              <label className={labelCls}>Proprietaire</label>
              <select value={editProp} onChange={(e) => setEditProp(e.target.value as Proprietaire)} className={cn(inputCls, 'w-full')}>
                <option value="FAR">FAR</option>
                <option value="REP">REP</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Sous-traitant</label>
              <input type="text" value={editST} onChange={(e) => setEditST(e.target.value)} className={cn(inputCls, 'w-full')} />
            </div>
            <div>
              <label className={labelCls}>Hauteur pylone (m)</label>
              <input type="number" value={editHauteur} onChange={(e) => setEditHauteur(e.target.value)} placeholder="Ex: 15" className={cn(inputCls, 'w-full')} />
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <select value={editStatut} onChange={(e) => setEditStatut(e.target.value as StatutSite)} className={cn(inputCls, 'w-full')}>
                <option value="A_PLANIFIER">A planifier</option>
                <option value="EN_COURS">En cours</option>
                <option value="BLOQUE">Bloque</option>
                <option value="TERMINE">Termine</option>
                <option value="VALIDE">Valide</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Date demarrage</label>
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className={cn(inputCls, 'w-full')} />
            </div>
            <div>
              <label className={labelCls}>Avancement reel (%)</label>
              <input type="number" min={0} max={100} value={editAv} onChange={(e) => setEditAv(e.target.value)} className={cn(inputCls, 'w-full')} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls}>Notes</label>
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} className={cn(inputCls, 'w-full')} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{site.nom}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{site.code}</span>
                  <ProprietaireBadge prop={site.proprietaire} />
                  <span className="text-sm text-gray-400 dark:text-gray-500">·</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">S/T: {site.sousTraitant}</span>
                  {site.hauteurPylone && (
                    <>
                      <span className="text-sm text-gray-400 dark:text-gray-500">·</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Pylone {site.hauteurPylone}m</span>
                    </>
                  )}
                  {site.dateDemarrage && (
                    <>
                      <span className="text-sm text-gray-400 dark:text-gray-500">·</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Debut: {site.dateDemarrage}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatutBadge statut={site.statut} />
                <AlertBadge level={kpi.alertLevel} />
              </div>
            </div>
            {site.notes && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
                <p className="text-sm text-amber-800 dark:text-amber-200">{site.notes}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Budget breakdown ───────────────────────────────────────────── */}
      <div className={cardCls}>
        <SectionHeader
          title="Decomposition budgetaire"
          editing={editingBudget}
          onEdit={startEditBudget}
          onSave={saveBudget}
          onCancel={() => setEditingBudget(false)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BUDGET_POSTES.map(({ key, label, icon, paidKey }) => {
            const budgetVal = editingBudget ? (editBudget[key as keyof BudgetDetail] as number) : (site.budget[key as keyof BudgetDetail] as number)
            const paidVal = editingBudget && paidKey ? (editPaiements[paidKey] as number) : paidKey ? (site.paiements[paidKey] as number) : 0
            const pct = budgetVal > 0 ? Math.min(Math.round((paidVal / budgetVal) * 100), 999) : 0
            const barColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981'

            return (
              <div
                key={key}
                className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                </div>

                {editingBudget ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-400">Budget (DH)</label>
                      <input
                        type="number"
                        value={editBudget[key as keyof BudgetDetail]}
                        onChange={(e) => setEditBudget({ ...editBudget, [key]: parseFloat(e.target.value) || 0 })}
                        className={cn(inputCls, 'w-full')}
                      />
                    </div>
                    {paidKey && (
                      <div>
                        <label className="text-xs text-gray-400">Paye (DH)</label>
                        <input
                          type="number"
                          value={editPaiements[paidKey]}
                          onChange={(e) => setEditPaiements({ ...editPaiements, [paidKey]: parseFloat(e.target.value) || 0 })}
                          className={cn(inputCls, 'w-full')}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Budget</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                          {formatMontant(budgetVal)} DH
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Paye</span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {formatMontant(paidVal)} DH
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                          {budgetVal > 0 && (
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
                            />
                          )}
                        </div>
                        <span
                          className="text-xs font-bold tabular-nums w-9 text-right"
                          style={{ color: budgetVal > 0 ? barColor : '#9ca3af' }}
                        >
                          {budgetVal > 0 ? `${pct}%` : '—'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary bar */}
        <div className="mt-4 p-4 rounded-xl bg-gray-900 dark:bg-black/40 text-white">
          <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Budget total</p>
              <p className="text-xl font-bold tabular-nums">{formatMontant(kpi.budgetTotal)} DH</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Total paye</p>
              <p className="text-xl font-bold text-emerald-400 tabular-nums">{formatMontant(kpi.totalPaye)} DH</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Reste a payer</p>
              <p className="text-xl font-bold text-amber-400 tabular-nums">{formatMontant(kpi.resteAPayer)} DH</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(kpi.pourcentagePaye, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{kpi.pourcentagePaye.toFixed(1)}% paye</p>
        </div>
      </div>

      {/* ── Avancement ─────────────────────────────────────────────────── */}
      <div className={cardCls}>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Avancement</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-2">Theorique — Jour {kpi.jourProjet}/27</p>
            <div className="h-4 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{ width: `${Math.min(kpi.avancementTheorique, 100)}%` }}
              />
            </div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
              {formatPourcent(kpi.avancementTheorique)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Reel (valide)</p>
            <div className="h-4 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${Math.min(kpi.avancementReel, 100)}%` }}
              />
            </div>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatPourcent(kpi.avancementReel)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">Ecart avancement: </span>
            <span
              className={cn(
                'font-medium',
                kpi.ecartAvancement < -15
                  ? 'text-red-500 dark:text-red-400'
                  : kpi.ecartAvancement < -5
                    ? 'text-amber-500 dark:text-amber-400'
                    : 'text-green-600 dark:text-green-400'
              )}
            >
              {kpi.ecartAvancement > 0 ? '+' : ''}{formatPourcent(kpi.ecartAvancement)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Ecart tresorerie: </span>
            <span
              className={cn(
                'font-medium',
                kpi.ecartTresorerie > 20 ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
              )}
            >
              {kpi.ecartTresorerie > 0 ? '+' : ''}{formatPourcent(kpi.ecartTresorerie)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tranches ───────────────────────────────────────────────────── */}
      <div className={cardCls}>
        <SectionHeader
          title="Tranches theoriques"
          editing={editingTranches}
          onEdit={startEditTranches}
          onSave={saveTranches}
          onCancel={() => setEditingTranches(false)}
        />

        {editingTranches ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20">
                <label className="text-xs text-blue-700 dark:text-blue-300 block mb-1">Avance 1 (%)</label>
                <input
                  type="number" min={0} max={100} value={trancheAv1}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0
                    setTrancheAv1(v)
                    setTrancheSolde(Math.max(0, 100 - v - trancheAv2))
                  }}
                  className={cn(inputCls, 'w-full')}
                />
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-2">
                  {formatMontant(Math.round(kpi.budgetTotal * trancheAv1 / 100))} DH
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20">
                <label className="text-xs text-blue-700 dark:text-blue-300 block mb-1">Avance 2 (%)</label>
                <input
                  type="number" min={0} max={100} value={trancheAv2}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0
                    setTrancheAv2(v)
                    setTrancheSolde(Math.max(0, 100 - trancheAv1 - v))
                  }}
                  className={cn(inputCls, 'w-full')}
                />
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-2">
                  {formatMontant(Math.round(kpi.budgetTotal * trancheAv2 / 100))} DH
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
                <label className="text-xs text-amber-700 dark:text-amber-300 block mb-1">Solde (%)</label>
                <input
                  type="number" min={0} max={100} value={trancheSolde}
                  onChange={(e) => setTrancheSolde(parseFloat(e.target.value) || 0)}
                  className={cn(inputCls, 'w-full')}
                />
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-2">
                  {formatMontant(Math.round(kpi.budgetTotal * trancheSolde / 100))} DH
                </p>
              </div>
            </div>
            {(trancheAv1 + trancheAv2 + trancheSolde) !== 100 && (
              <p className="text-xs text-red-500">Total: {trancheAv1 + trancheAv2 + trancheSolde}% — doit etre 100%</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20">
              <p className="text-xs text-blue-700 dark:text-blue-300">Avance 1 (45%)</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatMontant(tranches.avance1)} DH</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20">
              <p className="text-xs text-blue-700 dark:text-blue-300">Avance 2 (45%)</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatMontant(tranches.avance2)} DH</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
              <p className="text-xs text-amber-700 dark:text-amber-300">Solde (10%)</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatMontant(tranches.solde)} DH</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Photos ─────────────────────────────────────────────────────── */}
      {sitePhotos.length > 0 && (
        <div className={cardCls}>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Photos ({sitePhotos.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sitePhotos.map((photo) => (
              <div key={photo.id} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                <img src={photo.dataUrl} alt={photo.filename} className="w-full h-32 object-cover" />
                <div className="p-2">
                  <p className="text-xs text-gray-500">{photo.filename}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    IA: {photo.scoreIA}% · Valide: {photo.scoreValide != null ? photo.scoreValide + '%' : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
