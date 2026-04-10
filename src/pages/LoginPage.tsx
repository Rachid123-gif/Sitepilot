import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Building2, TrendingUp, BarChart3, Shield } from 'lucide-react'
import { useStore } from '../store'
import { cn } from '../lib/utils'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, currentUser, darkMode } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)

  // If already logged in, redirect
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true })
    }
  }, [currentUser, navigate])

  // Force dark mode on login page for consistent visuals
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    return () => {
      document.documentElement.classList.toggle('dark', darkMode)
      document.documentElement.classList.toggle('light', !darkMode)
    }
  }, [darkMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const result = login(email, password)
      if (!result.ok) {
        setError(result.error || 'Erreur de connexion')
        setLoading(false)
      } else {
        navigate('/', { replace: true })
      }
    }, 600)
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#0f1229] to-[#1a1f3a] relative">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Left panel - Branding */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 z-10">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SitePilot</h1>
              <p className="text-xs text-blue-300">Construction Management</p>
            </div>
          </div>

          <div className="space-y-6 max-w-md">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Pilotez vos chantiers<br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                en temps reel
              </span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              La solution complete pour gerer vos sites de construction, budgets, plannings et rapports.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 max-w-md">
            <FeatureItem icon={<BarChart3 className="w-5 h-5" />} title="Dashboard interactif" desc="KPIs et graphiques en temps reel" />
            <FeatureItem icon={<TrendingUp className="w-5 h-5" />} title="Suivi budgetaire" desc="Avancement et paiements detailles" />
            <FeatureItem icon={<Shield className="w-5 h-5" />} title="Donnees securisees" desc="Acces protege par authentification" />
          </div>
        </div>

        <div className="text-xs text-gray-500">
          © 2026 SitePilot — Tous droits reserves · <span className="text-gray-400">Rachid Idrissi</span>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="relative flex-1 flex items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">SitePilot</h1>
          </div>

          {/* Glassmorphism card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Bienvenue</h2>
              <p className="text-sm text-gray-400">Connectez-vous pour acceder a votre espace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2 uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@sitepilot.ma"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider">Mot de passe</label>
                  <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Mot de passe oublie ?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors" />
                    {remember && (
                      <svg className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Se souvenir de moi</span>
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all',
                  'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600',
                  'hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]',
                  'active:scale-[0.98]',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                )}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-xs text-gray-500 text-center mb-3">Compte de demonstration</p>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@sitepilot.ma')
                  setPassword('sitepilot2026')
                }}
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-xs text-gray-400 hover:text-gray-200 transition-all"
              >
                admin@sitepilot.ma · sitepilot2026
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            Probleme de connexion ? Contactez votre administrateur
          </p>

          {/* Mobile footer signature */}
          <p className="lg:hidden text-center text-[11px] text-gray-600 mt-4">
            © 2026 SitePilot — Tous droits reserves · Rachid Idrissi
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
  )
}
