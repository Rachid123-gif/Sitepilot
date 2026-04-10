import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  CreditCard,
  Percent,
  Building2,
  AlertTriangle,
  CalendarClock,
  X,
  ExternalLink,
  Search,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Sector,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useStore } from '../store'
import { KPICard } from '../components/ui/KPICard'
import { AlertBadge, StatutBadge, ProprietaireBadge } from '../components/ui/Badge'
import { computeKPIGlobal, budgetTotal, totalPaye, generateAlertes, computeKPISite } from '../lib/engine'
import { formatMontant, formatPourcent, cn } from '../lib/utils'
import type { StatutSite, Proprietaire } from '../types'

const chartCard = 'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm p-5'

// Map display labels back to raw statut values
const STATUT_FROM_LABEL: Record<string, StatutSite> = {
  'A planifier': 'A_PLANIFIER',
  'En cours': 'EN_COURS',
  'Bloque': 'BLOQUE',
  'Termine': 'TERMINE',
  'Valide': 'VALIDE',
}

const PIE_COLORS = ['#6b7280', '#3b82f6', '#ef4444', '#10b981', '#059669']

export function DashboardPage() {
  const { sites, photos, avances, darkMode } = useStore()
  const navigate = useNavigate()
  const kpiGlobal = computeKPIGlobal(sites, photos, avances)
  const alertes = generateAlertes(sites, photos)

  // Interactive state
  const [selectedStatut, setSelectedStatut] = useState<string | null>(null)
  const [selectedProp, setSelectedProp] = useState<string | null>(null)
  const [activeStatutIdx, setActiveStatutIdx] = useState<number | undefined>(undefined)
  const [activePropIdx, setActivePropIdx] = useState<number | undefined>(undefined)
  const [barFilter, setBarFilter] = useState<'all' | 'FAR' | 'REP'>('all')
  const [barSearch, setBarSearch] = useState('')

  const tooltipStyle = darkMode
    ? { backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }
    : { backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827' }

  const axisColor = darkMode ? '#9ca3af' : '#6b7280'

  // ── Charts data ─────────────────────────────────────────────────────────
  const farCount = sites.filter((s) => s.proprietaire === 'FAR').length
  const repCount = sites.filter((s) => s.proprietaire === 'REP').length

  const filteredBarSites = sites.filter((s) => {
    if (barFilter !== 'all' && s.proprietaire !== barFilter) return false
    if (barSearch && !s.nom.toLowerCase().includes(barSearch.toLowerCase())) return false
    return true
  })

  const barData = filteredBarSites.map((s) => ({
    name: s.nom.length > 12 ? s.nom.slice(0, 12) + '...' : s.nom,
    Budget: budgetTotal(s),
    Paye: totalPaye(s),
  }))

  const statutCounts: Record<string, number> = {}
  for (const s of sites) statutCounts[s.statut] = (statutCounts[s.statut] || 0) + 1
  const pieData = Object.entries(statutCounts).map(([name, value]) => ({
    name:
      name === 'A_PLANIFIER' ? 'A planifier'
      : name === 'EN_COURS' ? 'En cours'
      : name === 'BLOQUE' ? 'Bloque'
      : name === 'TERMINE' ? 'Termine'
      : 'Valide',
    rawStatut: name as StatutSite,
    value,
  }))

  const sortedAvances = [...avances].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let cumPrevu = 0
  const lineData = sortedAvances.map((av) => {
    cumPrevu += av.montant
    return { date: format(parseISO(av.date), 'dd/MM', { locale: fr }), Prevu: cumPrevu }
  })
  const totalPayeGlobal = kpiGlobal.totalPaye
  if (lineData.length > 0) {
    (lineData[0] as any).Reel = totalPayeGlobal * 0.3
    if (lineData.length > 1) (lineData[1] as any).Reel = totalPayeGlobal * 0.6
    if (lineData.length > 2) (lineData[2] as any).Reel = totalPayeGlobal
  }

  // ── FAR vs REP ────────────────────────────────────────────────────────
  const farSites = sites.filter((s) => s.proprietaire === 'FAR')
  const repSites = sites.filter((s) => s.proprietaire === 'REP')
  const propPieData = [
    { name: 'FAR', value: farSites.length, color: '#1e3a8a' },
    { name: 'REP', value: repSites.length, color: '#7c3aed' },
  ]
  const propBudgetData = [
    {
      name: 'FAR',
      Budget: farSites.reduce((a, s) => a + budgetTotal(s), 0),
      Paye: farSites.reduce((a, s) => a + totalPaye(s), 0),
    },
    {
      name: 'REP',
      Budget: repSites.reduce((a, s) => a + budgetTotal(s), 0),
      Paye: repSites.reduce((a, s) => a + totalPaye(s), 0),
    },
  ]

  // ── Budget par poste ──────────────────────────────────────────────────
  const postesData = [
    { name: 'Pylone',        Budget: sites.reduce((a, s) => a + s.budget.pylone, 0),       Paye: sites.reduce((a, s) => a + s.paiements.pylone, 0) },
    { name: 'Local',         Budget: sites.reduce((a, s) => a + s.budget.local, 0),        Paye: sites.reduce((a, s) => a + s.paiements.local, 0) },
    { name: 'Local GE',      Budget: sites.reduce((a, s) => a + s.budget.localGE, 0),      Paye: sites.reduce((a, s) => a + s.paiements.localGE, 0) },
    { name: 'Mur Cloture',   Budget: sites.reduce((a, s) => a + s.budget.murCloture, 0),   Paye: 0 },
    { name: 'Electricite',   Budget: sites.reduce((a, s) => a + s.budget.electricite, 0),  Paye: 0 },
    { name: 'Frais Extra',   Budget: sites.reduce((a, s) => a + s.budget.fraisExtra, 0),   Paye: 0 },
  ]

  // ── Par sous-traitant ────────────────────────────────────────────────
  const stList = [...new Set(sites.map((s) => s.sousTraitant))]
  const stStats = stList.map((st) => {
    const stSites = sites.filter((s) => s.sousTraitant === st)
    const bTotal = stSites.reduce((a, s) => a + budgetTotal(s), 0)
    const pTotal = stSites.reduce((a, s) => a + totalPaye(s), 0)
    const avgAv = stSites.length > 0
      ? stSites.reduce((a, s) => a + s.avancementReel, 0) / stSites.length
      : 0
    return { name: st, nbSites: stSites.length, budget: bTotal, paye: pTotal, avancement: avgAv }
  })

  // ── Filtered sites for interactive panels ─────────────────────────────
  const filteredByStatut = selectedStatut
    ? sites.filter((s) => s.statut === selectedStatut)
    : []
  const filteredByProp = selectedProp
    ? sites.filter((s) => s.proprietaire === selectedProp)
    : []

  // ── Active sector renderer for pie charts ─────────────────────────────
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props
    return (
      <g>
        <text x={cx} y={cy - 8} textAnchor="middle" fill={darkMode ? '#fff' : '#111'} fontSize={14} fontWeight={700}>
          {payload.name}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12}>
          {value} site{value > 1 ? 's' : ''}
        </text>
        <Sector
          cx={cx} cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
        <Sector
          cx={cx} cy={cy}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 14}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  function handleStatutClick(_: any, idx: number) {
    const entry = pieData[idx]
    if (selectedStatut === entry.rawStatut) {
      setSelectedStatut(null)
      setActiveStatutIdx(undefined)
    } else {
      setSelectedStatut(entry.rawStatut)
      setActiveStatutIdx(idx)
    }
  }

  function handlePropClick(_: any, idx: number) {
    const entry = propPieData[idx]
    if (selectedProp === entry.name) {
      setSelectedProp(null)
      setActivePropIdx(undefined)
    } else {
      setSelectedProp(entry.name)
      setActivePropIdx(idx)
    }
  }

  // ── Site list component ───────────────────────────────────────────────
  function SiteList({ siteList, title, onClose }: { siteList: typeof sites; title: string; onClose: () => void }) {
    return (
      <div className="mt-3 rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 p-4 animate-in fade-in">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400">
            {title} — {siteList.length} site{siteList.length > 1 ? 's' : ''}
          </h4>
          <button onClick={onClose} className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-500/10">
            <X className="w-4 h-4 text-blue-400" />
          </button>
        </div>
        <div className="space-y-2">
          {siteList.map((site) => {
            const sitePhotos = photos.filter((p) => p.siteId === site.id)
            const kpi = computeKPISite(site, sitePhotos)
            return (
              <div
                key={site.id}
                onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}`)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-14">{site.code}</span>
                  <ProprietaireBadge prop={site.proprietaire} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{site.nom}</span>
                  <span className="text-xs text-gray-400">S/T: {site.sousTraitant}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Budget</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formatMontant(kpi.budgetTotal)} DH</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Paye</span>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatMontant(kpi.totalPaye)} DH</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Av.</span>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatPourcent(kpi.avancementReel)}</p>
                  </div>
                  <StatutBadge statut={site.statut} />
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Executif</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard title="Budget Global" value={kpiGlobal.budgetGlobal} suffix="DH" icon={<DollarSign className="w-5 h-5" />} color="blue" />
        <KPICard title="Total Paye" value={kpiGlobal.totalPaye} suffix="DH" icon={<CreditCard className="w-5 h-5" />} color="green" />
        <KPICard title="% Paye" value={kpiGlobal.pourcentagePaye.toFixed(1)} suffix="%" icon={<Percent className="w-5 h-5" />} color="cyan" />
        <KPICard title="Sites en cours" value={kpiGlobal.nbSitesEnCours} icon={<Building2 className="w-5 h-5" />} color="purple" />
        <KPICard title="Alertes" value={kpiGlobal.nbAlertes} icon={<AlertTriangle className="w-5 h-5" />} color={kpiGlobal.nbAlertes > 0 ? 'red' : 'green'} />
        <KPICard
          title="Prochaine echeance"
          value={kpiGlobal.prochaineEcheance ? format(parseISO(kpiGlobal.prochaineEcheance), 'dd/MM/yyyy') : '—'}
          icon={<CalendarClock className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Budget vs Paye + Statuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={chartCard}>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Budget vs Paye par site</h3>

          {/* Filter pills + search */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {([
              { key: 'all' as const, label: `Tous (${sites.length})` },
              { key: 'FAR' as const, label: `FAR (${farCount})` },
              { key: 'REP' as const, label: `REP (${repCount})` },
            ]).map((f) => (
              <button
                key={f.key}
                onClick={() => setBarFilter(f.key)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors',
                  barFilter === f.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-400 dark:hover:bg-white/20'
                )}
              >
                {f.label}
              </button>
            ))}

            <div className="relative ml-auto">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={barSearch}
                onChange={(e) => setBarSearch(e.target.value)}
                placeholder="Rechercher un site..."
                className="pl-7 pr-3 py-1 text-xs rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 w-40"
              />
            </div>
          </div>

          {/* Scrollable bar chart */}
          <div className="overflow-x-auto relative" style={{ minHeight: 310 }}>
            <BarChart
              data={barData}
              width={Math.max(500, filteredBarSites.length * 70)}
              height={300}
              margin={{ bottom: 60, left: 10, right: 10 }}
            >
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 10 }} angle={-45} textAnchor="end" />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => formatMontant(val) + ' DH'} />
              <Legend />
              <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Paye" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
            {filteredBarSites.length > 8 && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-[#1a1a2e] to-transparent pointer-events-none" />
            )}
          </div>
        </div>

        {/* Statuts — Interactive */}
        <div className={chartCard}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Repartition des statuts</h3>
            {selectedStatut && (
              <span className="text-xs text-blue-500 dark:text-blue-400">Cliquez pour deselectionner</span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                activeIndex={activeStatutIdx}
                activeShape={renderActiveShape}
                onClick={handleStatutClick}
                onMouseEnter={(_, idx) => { if (activeStatutIdx === undefined) setActiveStatutIdx(idx) }}
                onMouseLeave={() => { if (!selectedStatut) setActiveStatutIdx(undefined) }}
                label={activeStatutIdx === undefined ? ({ name, value }: any) => `${name} (${value})` : undefined}
                style={{ cursor: 'pointer' }}
              >
                {pieData.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    opacity={selectedStatut && pieData[idx].rawStatut !== selectedStatut ? 0.3 : 1}
                    stroke={selectedStatut === pieData[idx].rawStatut ? (darkMode ? '#fff' : '#000') : 'none'}
                    strokeWidth={selectedStatut === pieData[idx].rawStatut ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>

          {/* Interactive site list */}
          {selectedStatut && filteredByStatut.length > 0 && (
            <SiteList
              siteList={filteredByStatut}
              title={pieData.find((p) => p.rawStatut === selectedStatut)?.name || ''}
              onClose={() => { setSelectedStatut(null); setActiveStatutIdx(undefined) }}
            />
          )}
        </div>
      </div>

      {/* ── FAR vs REP ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Propriete — Interactive */}
        <div className={chartCard}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Repartition par propriete</h3>
            {selectedProp && (
              <span className="text-xs text-blue-500 dark:text-blue-400">Cliquez pour deselectionner</span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={propPieData}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  activeIndex={activePropIdx}
                  activeShape={renderActiveShape}
                  onClick={handlePropClick}
                  onMouseEnter={(_, idx) => { if (activePropIdx === undefined) setActivePropIdx(idx) }}
                  onMouseLeave={() => { if (!selectedProp) setActivePropIdx(undefined) }}
                  style={{ cursor: 'pointer' }}
                >
                  {propPieData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.color}
                      opacity={selectedProp && entry.name !== selectedProp ? 0.3 : 1}
                      stroke={selectedProp === entry.name ? (darkMode ? '#fff' : '#000') : 'none'}
                      strokeWidth={selectedProp === entry.name ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} sites`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-4">
              {propPieData.map((entry) => (
                <div
                  key={entry.name}
                  onClick={() => {
                    if (selectedProp === entry.name) {
                      setSelectedProp(null)
                      setActivePropIdx(undefined)
                    } else {
                      setSelectedProp(entry.name)
                      setActivePropIdx(propPieData.findIndex((p) => p.name === entry.name))
                    }
                  }}
                  className={cn(
                    'cursor-pointer rounded-lg p-2 -mx-2 transition-all',
                    selectedProp === entry.name
                      ? 'bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-300 dark:ring-blue-500/30'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{entry.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.value} sites</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(entry.value / sites.length) * 100}%`, backgroundColor: entry.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive site list */}
          {selectedProp && filteredByProp.length > 0 && (
            <SiteList
              siteList={filteredByProp}
              title={selectedProp}
              onClose={() => { setSelectedProp(null); setActivePropIdx(undefined) }}
            />
          )}
        </div>

        <div className={chartCard}>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Budget FAR vs REP</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={propBudgetData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fill: axisColor, fontSize: 10 }} tickFormatter={(v) => formatMontant(v)} />
              <YAxis type="category" dataKey="name" tick={{ fill: axisColor, fontSize: 12, fontWeight: 600 }} width={36} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => formatMontant(val) + ' DH'} />
              <Legend />
              <Bar dataKey="Budget" fill="#1e3a8a" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Paye" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Budget par poste ──────────────────────────────────────────────────── */}
      <div className={chartCard}>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Budget global par poste</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={postesData} layout="vertical" margin={{ left: 20, right: 40 }}>
            <XAxis type="number" tick={{ fill: axisColor, fontSize: 10 }} tickFormatter={(v) => formatMontant(v)} />
            <YAxis type="category" dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} width={90} />
            <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => formatMontant(val) + ' DH'} />
            <Legend />
            <Bar dataKey="Budget" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            <Bar dataKey="Paye" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Par sous-traitant ────────────────────────────────────────────────── */}
      <div className={chartCard}>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Par sous-traitant</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stStats.map((st) => {
            const pct = st.budget > 0 ? (st.paye / st.budget) * 100 : 0
            return (
              <div key={st.name} className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{st.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 font-medium">
                    {st.nbSites} sites
                  </span>
                </div>
                <div className="space-y-1 text-xs mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">{formatMontant(st.budget)} DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paye</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatMontant(st.paye)} DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Av. moyen</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{st.avancement.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{pct.toFixed(1)}% paye</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Line chart */}
      <div className={chartCard}>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Decaissement cumule — Prevu</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
            <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 11 }} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => formatMontant(val) + ' DH'} />
            <Legend />
            <Line type="monotone" dataKey="Prevu" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className={chartCard}>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Alertes actives ({alertes.length})
          </h3>
          <div className="space-y-2">
            {alertes.slice(0, 10).map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/sites/${encodeURIComponent(a.siteId)}`)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <AlertBadge level={a.level} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{a.siteNom}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">{a.message}</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
