import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

interface Props {
  label: string
  value: number
  suffix?: string
  prefix?: string
  color?: string
  delay?: number
  formatFn?: (v: number) => string
}

function formatNum(v: number) {
  return new Intl.NumberFormat('fr-MA').format(Math.round(v))
}

export function AnimatedKPI({
  label,
  value,
  suffix = '',
  prefix = '',
  color = '#3b82f6',
  delay = 0,
  formatFn = formatNum,
}: Props) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const entrance = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 80 } })
  const count = interpolate(frame - delay, [0, 45], [0, value], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 20}px) scale(${0.9 + entrance * 0.1})`,
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${color}40`,
        borderRadius: 16,
        padding: '24px 32px',
        minWidth: 200,
        borderTop: `3px solid ${color}`,
      }}
    >
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, fontFamily: 'sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: 'sans-serif', letterSpacing: -1 }}>
        {prefix}{formatFn(count)}{suffix}
      </div>
      <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: `${color}30` }}>
        <div style={{ height: '100%', width: `${Math.min(entrance * 100, 100)}%`, background: color, borderRadius: 2 }} />
      </div>
    </div>
  )
}
