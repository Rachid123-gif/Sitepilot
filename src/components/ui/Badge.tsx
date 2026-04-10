import { cn } from '../../lib/utils'
import type { StatutSite, AlertLevel } from '../../types'

const STATUT_COLORS: Record<StatutSite, string> = {
  A_PLANIFIER: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30',
  EN_COURS: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
  BLOQUE: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
  TERMINE: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
  VALIDE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
}

const STATUT_LABELS: Record<StatutSite, string> = {
  A_PLANIFIER: 'À planifier',
  EN_COURS: 'En cours',
  BLOQUE: 'Bloqué',
  TERMINE: 'Terminé',
  VALIDE: 'Validé',
}

export function StatutBadge({ statut }: { statut: StatutSite }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        STATUT_COLORS[statut]
      )}
    >
      {STATUT_LABELS[statut]}
    </span>
  )
}

const ALERT_COLORS: Record<AlertLevel, string> = {
  vert: 'bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  orange: 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  rouge: 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400',
}

export function AlertBadge({ level }: { level: AlertLevel }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        ALERT_COLORS[level]
      )}
    >
      {level === 'vert' ? '●' : level === 'orange' ? '▲' : '◆'}{' '}
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  )
}

export function ProprietaireBadge({ prop }: { prop: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        prop === 'FAR'
          ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/40'
          : 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/40'
      )}
    >
      {prop}
    </span>
  )
}
