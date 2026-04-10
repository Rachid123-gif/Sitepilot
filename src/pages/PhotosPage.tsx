import { useState, useRef } from 'react'
import { Upload, CheckCircle, Camera, Sparkles, AlertTriangle, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { analyserPhotoIA, simulerAnalyseIA } from '../lib/photo-ai'
import type { AnalyseIAResult } from '../lib/photo-ai'
import { computeKPISite } from '../lib/engine'
import { cn } from '../lib/utils'
import type { Photo } from '../types'

// ── Circular gauge SVG ────────────────────────────────────────────────────────
function CircularGauge({ value, size = 96 }: { value: number; size?: number }) {
  const r = size * 0.38
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const color = value < 30 ? '#ef4444' : value < 60 ? '#f59e0b' : '#10b981'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={size * 0.09} className="dark:stroke-white/10" />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={size * 0.09}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold leading-none" style={{ color, fontSize: size * 0.22 }}>{value}%</span>
        <span className="text-gray-400 dark:text-gray-500 leading-none mt-0.5" style={{ fontSize: size * 0.1 }}>score IA</span>
      </div>
    </div>
  )
}

// ── Confidence bar ────────────────────────────────────────────────────────────
function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct < 40 ? 'bg-red-400' : pct < 70 ? 'bg-amber-400' : 'bg-emerald-500'
  const label = pct < 40 ? 'Faible' : pct < 70 ? 'Modérée' : 'Élevée'
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-500 dark:text-gray-400">Confiance IA</span>
        <span className="font-semibold text-gray-700 dark:text-gray-300">{pct}% — {label}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function PhotosPage() {
  const { sites, photos, addPhoto, updateSite } = useStore()
  const navigate = useNavigate()

  const [selectedSite, setSelectedSite] = useState(sites[0]?.id ?? '')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalyseIAResult | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [manualScore, setManualScore] = useState(0)
  const [validatorName, setValidatorName] = useState(() => localStorage.getItem('sitepilot-validator') ?? '')
  const [comment, setComment] = useState('')
  const [lastValidated, setLastValidated] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const apiKey = localStorage.getItem('anthropic-api-key') ?? ''
  const hasApiKey = apiKey.trim().length > 0

  const selectedSiteObj = sites.find((s) => s.id === selectedSite)
  const sitePhotos = photos.filter((p) => p.siteId === selectedSite)
  const kpi = selectedSiteObj ? computeKPISite(selectedSiteObj, sitePhotos) : null

  function handleValidatorNameChange(name: string) {
    setValidatorName(name)
    localStorage.setItem('sitepilot-validator', name)
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAnalyzeError(null)
    setAnalysis(null)
    setPhotoFile(file)

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      setPhotoDataUrl(dataUrl)

      setAnalyzing(true)
      try {
        let result: AnalyseIAResult

        if (hasApiKey && selectedSiteObj && kpi) {
          // Extract base64 and mime type from data URL
          const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
          if (!match) throw new Error('Format image invalide')
          const [, mimeType, base64] = match

          result = await analyserPhotoIA(
            base64,
            mimeType,
            {
              nom: selectedSiteObj.nom,
              code: selectedSiteObj.code,
              hauteurPylone: selectedSiteObj.hauteurPylone,
              budgetTotal: kpi.budgetTotal,
              avancementTheorique: kpi.avancementTheorique,
            },
            apiKey
          )
        } else {
          // Fallback simulation
          result = simulerAnalyseIA(file)
        }

        setAnalysis(result)
        setManualScore(result.scoreIA)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        setAnalyzeError(msg)
        // Fallback to manual mode
        const fallback = simulerAnalyseIA(file)
        setAnalysis({ ...fallback, confianceIA: 0, justificationIA: 'Analyse IA indisponible — mode manuel activé.', elementsVisibles: [] })
        setManualScore(fallback.scoreIA)
      } finally {
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleValidate() {
    if (!analysis || !photoFile || !photoDataUrl || !selectedSite) return

    const photo: Photo = {
      id: `photo-${Date.now()}`,
      siteId: selectedSite,
      filename: photoFile.name,
      dataUrl: photoDataUrl,
      dateUpload: new Date().toISOString(),
      scoreIA: analysis.scoreIA,
      confianceIA: analysis.confianceIA,
      justificationIA: analysis.justificationIA,
      elementsVisibles: analysis.elementsVisibles,
      scoreValide: manualScore,
      valide: true,
      dateValidation: new Date().toISOString(),
      nomValidateur: validatorName.trim() || undefined,
      commentaireValidateur: comment.trim() || undefined,
    }

    addPhoto(photo)
    updateSite(selectedSite, { avancementReel: manualScore })

    setLastValidated(selectedSiteObj?.nom ?? selectedSite)
    setAnalysis(null)
    setPhotoFile(null)
    setPhotoDataUrl(null)
    setComment('')
    setAnalyzeError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  // Ecart comparison
  const ecart = analysis && kpi
    ? analysis.scoreIA - kpi.avancementTheorique
    : null

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Module Photos</h1>
        {!hasApiKey && (
          <button
            onClick={() => navigate('/parametres')}
            className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
          >
            <Settings className="w-3.5 h-3.5" /> Configurer la clé API pour l'analyse IA réelle
          </button>
        )}
      </div>

      {/* Success message */}
      {lastValidated && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Photo validée pour {lastValidated} — avancement réel mis à jour.
          <button onClick={() => setLastValidated(null)} className="ml-auto text-emerald-400 hover:text-emerald-600">✕</button>
        </div>
      )}

      {/* Upload section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm p-5">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Uploader une photo</h3>

        {!hasApiKey && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            Mode simulation (pas de clé API). Configurez votre clé dans les Paramètres pour l'analyse IA réelle.
          </div>
        )}

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Site</label>
            <select
              value={selectedSite}
              onChange={(e) => { setSelectedSite(e.target.value); setAnalysis(null); setPhotoFile(null); setPhotoDataUrl(null); setAnalyzeError(null) }}
              className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.code} — {s.nom}</option>
              ))}
            </select>
          </div>

          <div
            onClick={() => !analyzing && fileRef.current?.click()}
            className={cn(
              'flex items-center gap-3 px-6 py-3 rounded-lg border-2 border-dashed transition-colors',
              analyzing
                ? 'border-blue-300 dark:border-blue-500/40 opacity-60 cursor-wait'
                : 'border-gray-300 hover:border-red-400 dark:border-white/20 dark:hover:border-blue-500/40 cursor-pointer'
            )}
          >
            {analyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-blue-600 dark:text-blue-400">Analyse en cours...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Cliquer ou glisser une photo</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      </div>

      {/* Analysis result */}
      {analysis && photoDataUrl && !analyzing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/5 backdrop-blur-sm p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              Analyse IA{!hasApiKey || analyzeError ? ' — Mode simulation' : ''}
            </h3>
          </div>

          {analyzeError && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 text-xs text-red-700 dark:text-red-400">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Analyse IA indisponible ({analyzeError}). Mode manuel activé.</span>
            </div>
          )}

          {/* ── Analyse IA card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <img
              src={photoDataUrl}
              alt="Aperçu"
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 max-h-64 object-cover"
            />

            <div className="space-y-4">
              {/* Score gauge + confiance */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <CircularGauge value={analysis.scoreIA} size={88} />
                <div className="flex-1 space-y-3">
                  <ConfidenceBar value={analysis.confianceIA} />
                  {/* Comparison */}
                  {kpi && (
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">IA dit</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{analysis.scoreIA}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Théorique attendu</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{kpi.avancementTheorique.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/10 pt-0.5">
                        <span className="text-gray-400">Écart</span>
                        <span className={cn('font-bold', ecart! >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
                          {ecart! >= 0 ? '+' : ''}{ecart!.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Justification */}
              <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <p className="text-xs text-gray-400 mb-1">Justification IA</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.justificationIA}</p>
              </div>

              {/* Elements visibles */}
              {analysis.elementsVisibles.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Éléments identifiés</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.elementsVisibles.map((el, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Validation Manager */}
          <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Validation Manager</h4>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500">Score validé</label>
                <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">{manualScore}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={manualScore}
                onChange={(e) => setManualScore(Number(e.target.value))}
                className="w-full accent-red-500 dark:accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nom du validateur</label>
                <input
                  type="text"
                  value={validatorName}
                  onChange={(e) => handleValidatorNameChange(e.target.value)}
                  placeholder="Votre nom..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Commentaire (optionnel)</label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Observation terrain..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            <button
              onClick={handleValidate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Valider cet avancement ({manualScore}%)
            </button>
            <p className="text-xs text-gray-400">
              Le score validé deviendra l'avancement réel officiel du site et mettra à jour le dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Photo gallery */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none backdrop-blur-sm p-5">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
          Historique ({photos.length} photos)
        </h3>

        {photos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Aucune photo uploadée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {photos
              .slice()
              .reverse()
              .map((photo) => {
                const site = sites.find((s) => s.id === photo.siteId)
                return (
                  <div
                    key={photo.id}
                    className="rounded-lg overflow-hidden border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5"
                  >
                    <img src={photo.dataUrl} alt={photo.filename} className="w-full h-36 object-cover" />
                    <div className="p-3 space-y-1.5">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {site?.nom ?? photo.siteId}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{photo.filename}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-blue-600 dark:text-blue-400">IA: {photo.scoreIA}%</span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className={photo.valide ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}>
                          {photo.valide ? `✓ ${photo.scoreValide}%` : 'En attente'}
                        </span>
                      </div>
                      {photo.nomValidateur && (
                        <p className="text-xs text-gray-400 truncate">par {photo.nomValidateur}</p>
                      )}
                      {photo.elementsVisibles && photo.elementsVisibles.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {photo.elementsVisibles.slice(0, 2).map((el, i) => (
                            <span key={i} className="px-1.5 py-0 rounded text-[10px] bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400">{el}</span>
                          ))}
                          {photo.elementsVisibles.length > 2 && (
                            <span className="text-[10px] text-gray-400">+{photo.elementsVisibles.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
