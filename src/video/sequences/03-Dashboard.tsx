import { AbsoluteFill, useCurrentFrame, spring } from 'remotion'
import { AnimatedKPI } from '../components/AnimatedKPI'
import { MockDashboard } from '../components/MockDashboard'

export function Dashboard() {
  const frame = useCurrentFrame()
  const titleE = spring({ frame, fps: 30, config: { damping: 14 } })
  const dashE = spring({ frame: frame - 20, fps: 30, config: { damping: 14 } })

  function fmt(v: number) {
    return new Intl.NumberFormat('fr-MA').format(Math.round(v))
  }

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b2e 100%)',
      display: 'flex', fontFamily: 'sans-serif',
    }}>
      {/* Left panel */}
      <div style={{ width: 640, flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '80px 60px', gap: 32 }}>
        <div style={{ opacity: titleE, transform: `translateX(${(1 - titleE) * -30}px)` }}>
          <div style={{ fontSize: 13, color: '#3b82f6', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
            ● Dashboard
          </div>
          <div style={{ fontSize: 50, fontWeight: 800, color: '#f8fafc', lineHeight: 1.15 }}>
            Vision 360°<br /><span style={{ color: '#3b82f6' }}>instantanée</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatedKPI label="Budget global" value={2_947_500} suffix=" DH" color="#3b82f6" delay={20} formatFn={fmt} />
          <AnimatedKPI label="Total payé" value={361_801} suffix=" DH" color="#10b981" delay={28} formatFn={fmt} />
          <AnimatedKPI label="Sites actifs" value={9} color="#8b5cf6" delay={36} />
          <AnimatedKPI label="Alertes actives" value={3} color="#ef4444" delay={44} />
        </div>
      </div>

      {/* Right panel — mock dashboard */}
      <div style={{
        flex: 1, padding: '60px 60px 60px 0',
        opacity: dashE,
        transform: `translateX(${(1 - dashE) * 40}px)`,
      }}>
        <MockDashboard />
      </div>
    </AbsoluteFill>
  )
}
