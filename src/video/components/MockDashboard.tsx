import { useCurrentFrame, spring, interpolate } from 'remotion'

const BARS = [
  { label: 'Toumi',  budget: 1_250_000, paid: 180_000, color: '#3b82f6' },
  { label: 'Nakabi', budget: 980_000,   paid: 120_000, color: '#8b5cf6' },
  { label: 'Leban',  budget: 717_500,   paid: 61_801,  color: '#06b6d4' },
]

export function MockDashboard() {
  const frame = useCurrentFrame()

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.08)',
      padding: 24,
      display: 'flex', flexDirection: 'column', gap: 20,
      fontFamily: 'sans-serif',
    }}>
      {/* Mini KPI row */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { label: 'Budget global', val: '2 947 500', color: '#3b82f6' },
          { label: 'Total payé',    val: '361 801',   color: '#10b981' },
          { label: 'Sites actifs',  val: '9',         color: '#8b5cf6' },
          { label: 'Alertes',       val: '3',         color: '#ef4444' },
        ].map(({ label, val, color }, i) => {
          const entrance = spring({ frame: frame - i * 6, fps: 30, config: { damping: 14 } })
          return (
            <div key={label} style={{
              flex: 1, padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 10,
              borderTop: `3px solid ${color}`,
              opacity: entrance,
              transform: `translateY(${(1 - entrance) * 15}px)`,
            }}>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc' }}>{val}</div>
            </div>
          )
        })}
      </div>

      {/* Bar chart */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Budget par sous-traitant
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {BARS.map(({ label, budget, paid, color }, i) => {
            const delay = 15 + i * 8
            const entrance = spring({ frame: frame - delay, fps: 30, config: { damping: 14 } })
            const barW = interpolate(frame - delay, [0, 30], [0, (paid / budget) * 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            return (
              <div key={label} style={{ opacity: entrance }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#e2e8f0' }}>{label}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    {Math.round(paid / 1000)}K / {Math.round(budget / 1000)}K DH
                  </span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${barW}%`, background: color, borderRadius: 4 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alert row */}
      {[
        { site: 'R15/23 — PA_HAOUZA', msg: 'Retard avancement', color: '#ef4444' },
        { site: 'R15/14 — PA_GUELMIM', msg: 'Trésorerie tendue', color: '#f59e0b' },
      ].map(({ site, msg, color }, i) => {
        const entrance = spring({ frame: frame - 30 - i * 5, fps: 30, config: { damping: 14 } })
        return (
          <div key={site} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px',
            background: `${color}15`,
            border: `1px solid ${color}40`,
            borderRadius: 8,
            opacity: entrance,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 12, color: '#e2e8f0', flex: 1 }}>{site}</span>
            <span style={{ fontSize: 11, color }}>{msg}</span>
          </div>
        )
      })}
    </div>
  )
}
