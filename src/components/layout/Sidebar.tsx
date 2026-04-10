import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Map,
  FileSpreadsheet,
  CalendarClock,
  Camera,
  FileText,
  Settings,
  Upload,
  X,
  Plus,
  Car,
  LogOut,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useStore } from '../../store'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sites', icon: Building2, label: 'Sites' },
  { to: '/carte', icon: Map, label: 'Carte' },
  { to: '/planning', icon: CalendarClock, label: 'Planning' },
  { to: '/photos', icon: Camera, label: 'Photos' },
  { to: '/rapports', icon: FileText, label: 'Rapports' },
  { to: '/trajets', icon: Car, label: 'Frais Trajet' },
  { to: '/import', icon: Upload, label: 'Import' },
  { to: '/parametres', icon: Settings, label: 'Paramètres' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const logout = useStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 border-r border-gray-200 bg-white dark:border-white/10 dark:bg-[#0d0d14] transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              SitePilot
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-gray-100 text-gray-500 dark:hover:bg-white/10 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gray-900 text-white dark:bg-blue-500/15 dark:text-blue-400 dark:shadow-sm dark:shadow-blue-500/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
            <button
              onClick={() => { onClose(); navigate('/sites/nouveau') }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all bg-red-500 hover:bg-red-600 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-white dark:text-blue-400"
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              Nouveau site
            </button>
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          {currentUser && (
            <div className="px-4 py-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 dark:from-blue-500/10 dark:to-purple-500/10 dark:border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-white/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Se deconnecter
              </button>
            </div>
          )}
          <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/10">
            <p className="text-xs text-gray-500">SitePilot v1.1</p>
            <p className="text-xs text-gray-400">14 sites · R15 & R16</p>
          </div>
        </div>
      </aside>
    </>
  )
}
