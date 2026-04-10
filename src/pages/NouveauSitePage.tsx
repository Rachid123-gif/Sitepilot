import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { useStore } from '../store'
import { formatMontant } from '../lib/utils'
import type { Site, Proprietaire, StatutSite } from '../types'

const SOUS_TRAITANTS_CONNUS = ['Toumi', 'Nakabi', 'Leban']

interface FormErrors {
  code?: string
  nom?: string
  proprietaire?: string
  sousTraitant?: string
}

function numVal(s: string): number {
  const n = parseFloat(s.replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) || n < 0 ? 0 : n
}

function inputCls(hasError: boolean) {
  return [
    'w-full px-3 py-2 rounded-lg text-sm border transition-colors',
    'bg-white text-gray-900 placeholder-gray-400',
    'dark:bg-white/5 dark:text-white dark:placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
    hasError
      ? 'border-red-400 dark:border-red-500/60 ring-1 ring-red-400/40'
      : 'border-gray-200 dark:border-white/10',
  ].join(' ')
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5 p-6 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
        {hint && <span className="ml-1 font-normal text-gray-400">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function NumberInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      min="0"
      step="any"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls(false)}
    />
  )
}

function TrancheItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
        {formatMontant(value)} DH
      </p>
    </div>
  )
}

export function NouveauSitePage() {
  const { sites, addSite } = useStore()
  const navigate = useNavigate()

  // Informations générales
  const [code, setCode] = useState('')
  const [nom, setNom] = useState('')
  const [proprietaire, setProprietaire] = useState<Proprietaire | ''>('')
  const [sousTraitantSelect, setSousTraitantSelect] = useState('')
  const [sousTraitantLibre, setSousTraitantLibre] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  // Budget
  const [budgetPylone, setBudgetPylone] = useState('0')
  const [budgetLocal, setBudgetLocal] = useState('0')
  const [budgetLocalGE, setBudgetLocalGE] = useState('0')
  const [budgetMur, setBudgetMur] = useState('0')
  const [budgetElec, setBudgetElec] = useState('0')
  const [budgetExtra, setBudgetExtra] = useState('0')

  // Pylône
  const [hauteurPylone, setHauteurPylone] = useState('')

  // Paiements
  const [payePylone, setPayePylone] = useState('0')
  const [payeLocal, setPayeLocal] = useState('0')
  const [payeLocalGE, setPayeLocalGE] = useState('0')

  // Planning
  const [dateDemarrage, setDateDemarrage] = useState('')
  const [statut, setStatut] = useState<StatutSite>('A_PLANIFIER')

  // Notes
  const [notes, setNotes] = useState('')

  // Validation
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const budgetTotal = useMemo(
    () =>
      numVal(budgetPylone) +
      numVal(budgetLocal) +
      numVal(budgetLocalGE) +
      numVal(budgetMur) +
      numVal(budgetElec) +
      numVal(budgetExtra),
    [budgetPylone, budgetLocal, budgetLocalGE, budgetMur, budgetElec, budgetExtra]
  )

  const totalPaye = useMemo(
    () => numVal(payePylone) + numVal(payeLocal) + numVal(payeLocalGE),
    [payePylone, payeLocal, payeLocalGE]
  )

  const sousTraitantFinal =
    sousTraitantSelect === '__autre__' ? sousTraitantLibre : sousTraitantSelect

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!code.trim()) {
      e.code = 'Code obligatoire'
    } else if (sites.some((s) => s.id === code.trim())) {
      e.code = 'Ce code existe déjà'
    }
    if (!nom.trim()) e.nom = 'Nom obligatoire'
    if (!proprietaire) e.proprietaire = 'Propriété obligatoire'
    if (!sousTraitantFinal.trim()) e.sousTraitant = 'Sous-traitant obligatoire'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    const hasCoords = lat !== '' && lng !== '' && !isNaN(latNum) && !isNaN(lngNum)

    const newSite: Site = {
      id: code.trim(),
      code: code.trim(),
      proprietaire: proprietaire as Proprietaire,
      nom: nom.trim().toUpperCase(),
      hauteurPylone: hauteurPylone !== '' ? parseFloat(hauteurPylone) : null,
      budget: {
        pylone: numVal(budgetPylone),
        local: numVal(budgetLocal),
        localGE: numVal(budgetLocalGE),
        murCloture: numVal(budgetMur),
        electricite: numVal(budgetElec),
        fraisExtra: numVal(budgetExtra),
      },
      paiements: {
        pylone: numVal(payePylone),
        local: numVal(payeLocal),
        localGE: numVal(payeLocalGE),
      },
      sousTraitant: sousTraitantFinal.trim(),
      notes: notes.trim() || null,
      statut,
      dateDemarrage: dateDemarrage || null,
      avancementReel: 0,
      ...(hasCoords ? { lat: latNum, lng: lngNum } : {}),
    }

    addSite(newSite)
    navigate(`/sites/${encodeURIComponent(newSite.id)}`)
  }

  return (
    <div className="space-y-6 max-w-3xl pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/sites')}
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <h1 className="text-2xl font-bold">Nouveau site</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* ── Informations générales ─────────────────────────────────────── */}
        <Section title="Informations générales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Code de réalisation"
              error={submitted ? errors.code : undefined}
              required
            >
              <input
                type="text"
                placeholder="ex: R16/01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={inputCls(submitted && !!errors.code)}
              />
            </Field>

            <Field label="Nom du site" error={submitted ? errors.nom : undefined} required>
              <input
                type="text"
                placeholder="ex: JBEL SAHRO"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className={inputCls(submitted && !!errors.nom)}
              />
            </Field>

            <Field
              label="Propriété"
              error={submitted ? errors.proprietaire : undefined}
              required
            >
              <select
                value={proprietaire}
                onChange={(e) => setProprietaire(e.target.value as Proprietaire)}
                className={inputCls(submitted && !!errors.proprietaire)}
              >
                <option value="">Sélectionner…</option>
                <option value="FAR">FAR</option>
                <option value="REP">REP</option>
              </select>
            </Field>

            <Field
              label="Sous-traitant"
              error={submitted ? errors.sousTraitant : undefined}
              required
            >
              <select
                value={sousTraitantSelect}
                onChange={(e) => setSousTraitantSelect(e.target.value)}
                className={inputCls(
                  submitted && !!errors.sousTraitant && sousTraitantSelect !== '__autre__'
                )}
              >
                <option value="">Sélectionner…</option>
                {SOUS_TRAITANTS_CONNUS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
                <option value="__autre__">Autre (saisie libre)</option>
              </select>
              {sousTraitantSelect === '__autre__' && (
                <input
                  type="text"
                  placeholder="Nom du sous-traitant"
                  value={sousTraitantLibre}
                  onChange={(e) => setSousTraitantLibre(e.target.value)}
                  className={`mt-2 ${inputCls(submitted && !!errors.sousTraitant)}`}
                />
              )}
            </Field>

            <Field label="Latitude GPS" hint="optionnel">
              <input
                type="number"
                step="any"
                placeholder="ex: 29.7400"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={inputCls(false)}
              />
            </Field>

            <Field label="Longitude GPS" hint="optionnel">
              <input
                type="number"
                step="any"
                placeholder="ex: -7.9700"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className={inputCls(false)}
              />
            </Field>
          </div>
        </Section>

        {/* ── Budget détaillé ────────────────────────────────────────────── */}
        <Section title="Budget détaillé">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Budget pylône (DH)">
              <NumberInput value={budgetPylone} onChange={setBudgetPylone} />
            </Field>
            <Field label="Budget local construction (DH)">
              <NumberInput value={budgetLocal} onChange={setBudgetLocal} />
            </Field>
            <Field label="Budget local GE (DH)">
              <NumberInput value={budgetLocalGE} onChange={setBudgetLocalGE} />
            </Field>
            <Field label="Budget mur clôture (DH)">
              <NumberInput value={budgetMur} onChange={setBudgetMur} />
            </Field>
            <Field label="Budget électricité (DH)">
              <NumberInput value={budgetElec} onChange={setBudgetElec} />
            </Field>
            <Field label="Frais extra (DH)">
              <NumberInput value={budgetExtra} onChange={setBudgetExtra} />
            </Field>
          </div>

          <div className="mt-2 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Budget total
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                {formatMontant(budgetTotal)} DH
              </span>
            </div>
            {budgetTotal > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-white/10">
                <TrancheItem label="Avance N°1 (45%)" value={budgetTotal * 0.45} />
                <TrancheItem label="Avance N°2 (45%)" value={budgetTotal * 0.45} />
                <TrancheItem label="Solde (10%)" value={budgetTotal * 0.1} />
              </div>
            )}
          </div>
        </Section>

        {/* ── Pylône ─────────────────────────────────────────────────────── */}
        <Section title="Pylône">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Hauteur pylône (m)" hint="optionnel">
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="ex: 30"
                value={hauteurPylone}
                onChange={(e) => setHauteurPylone(e.target.value)}
                className={inputCls(false)}
              />
            </Field>
          </div>
        </Section>

        {/* ── Paiements initiaux ─────────────────────────────────────────── */}
        <Section title="Paiements initiaux">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Montant payé pylône (DH)">
              <NumberInput value={payePylone} onChange={setPayePylone} />
            </Field>
            <Field label="Montant payé local (DH)">
              <NumberInput value={payeLocal} onChange={setPayeLocal} />
            </Field>
            <Field label="Montant payé local GE (DH)">
              <NumberInput value={payeLocalGE} onChange={setPayeLocalGE} />
            </Field>
          </div>

          <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total payé</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatMontant(totalPaye)} DH
            </span>
          </div>
        </Section>

        {/* ── Planning ───────────────────────────────────────────────────── */}
        <Section title="Planning">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date de démarrage" hint="optionnel">
              <input
                type="date"
                value={dateDemarrage}
                onChange={(e) => setDateDemarrage(e.target.value)}
                className={inputCls(false)}
              />
            </Field>
            <Field label="Statut initial">
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as StatutSite)}
                className={inputCls(false)}
              >
                <option value="A_PLANIFIER">À planifier</option>
                <option value="EN_COURS">En cours</option>
                <option value="BLOQUE">Bloqué</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* ── Notes ──────────────────────────────────────────────────────── */}
        <Section title="Notes">
          <textarea
            placeholder="Commentaires, observations…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className={`${inputCls(false)} resize-none`}
          />
        </Section>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer le site
          </button>
          <button
            type="button"
            onClick={() => navigate('/sites')}
            className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/10 dark:hover:bg-white/15 dark:text-gray-300 text-sm font-medium transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
