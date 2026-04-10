import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

interface KPICardProps {
  title: string
  value: string | number
  suffix?: string
  icon: ReactNode
  color?: string
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

export function KPICard({
  title,
  value,
  suffix,
  icon,
  color = 'blue',
  subtitle,
  animate = true,
}: KPICardProps & { animate?: boolean }) {
  const [visible, setVisible] = useState(false)
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  // Only animate pure numbers passed as number type
  const shouldAnimate = animate && typeof value === 'number' && !isNaN(value)
  const numericValue = typeof value === 'number' ? value : 0

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!shouldAnimate || !visible) return
    const duration = 800
    const steps = 30
    const increment = numericValue / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(interval)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [numericValue, shouldAnimate, visible])

  const colorMap: Record<string, string> = {
    blue: 'border-gray-200 shadow-sm dark:from-blue-500/20 dark:to-blue-600/5 dark:border-blue-500/20 dark:shadow-none',
    green: 'border-gray-200 shadow-sm dark:from-emerald-500/20 dark:to-emerald-600/5 dark:border-emerald-500/20 dark:shadow-none',
    amber: 'border-gray-200 shadow-sm dark:from-amber-500/20 dark:to-amber-600/5 dark:border-amber-500/20 dark:shadow-none',
    red: 'border-gray-200 shadow-sm dark:from-red-500/20 dark:to-red-600/5 dark:border-red-500/20 dark:shadow-none',
    purple: 'border-gray-200 shadow-sm dark:from-purple-500/20 dark:to-purple-600/5 dark:border-purple-500/20 dark:shadow-none',
    cyan: 'border-gray-200 shadow-sm dark:from-cyan-500/20 dark:to-cyan-600/5 dark:border-cyan-500/20 dark:shadow-none',
  }

  const iconColorMap: Record<string, string> = {
    blue: 'text-blue-500 dark:text-blue-400',
    green: 'text-emerald-500 dark:text-emerald-400',
    amber: 'text-amber-500 dark:text-amber-400',
    red: 'text-red-500 dark:text-red-400',
    purple: 'text-purple-500 dark:text-purple-400',
    cyan: 'text-cyan-500 dark:text-cyan-400',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-white dark:bg-transparent bg-gradient-to-br backdrop-blur-sm p-5 transition-all duration-500',
        colorMap[color] ?? colorMap.blue,
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {shouldAnimate
              ? new Intl.NumberFormat('fr-MA').format(Math.round(displayValue))
              : value}
            {suffix && (
              <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                {suffix}
              </span>
            )}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-2 rounded-lg bg-gray-100 dark:bg-white/5', iconColorMap[color])}>
          {icon}
        </div>
      </div>
    </div>
  )
}
