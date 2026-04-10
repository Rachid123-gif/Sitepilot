import { useCurrentFrame, interpolate, spring } from 'remotion'

interface Props {
  label: string
  budget: number
  paid: number
  color?: string
  delay?: number
}

function fmt(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`
  return String(Math.round(v))
}

export function ProgressBar({ label, budget, paid, color = '#3b82f6', delay = 0 }: Props) {
  const frame = useCurrentFrame()
  const entrance = spring({ frame: frame - delay, fps: 30, config: { damping: 14, stiffness: 80 } })
  const pct = budget > 0 ? (paid / budget) * 100 : 0
  const animPct = interpolate(frame - delay, [0, 40], [0, pct], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981'

  return (
    <div style={{ opacity: entrance, transform: `translateX(${(1 - entrance) * -30}px)`, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: 'sans-serif' }}>
        <span style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{fmt(paid)} / {fmt(budget)} DH</span>
      </div>
      <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(animPct, 100)}%`,
          background: `linear-gradient(90deg, ${barColor}aa, ${barColor})`,
          borderRadius: 5,
          transition: 'none',
        }} />
      </div>
      <div style={{ textAlign: 'right', marginTop: 3, fontSize: 11, color: barColor, fontFamily: 'sans-serif' }}>
        {animPct.toFixed(1)}% payé
      </div>
    </div>
  )
}
