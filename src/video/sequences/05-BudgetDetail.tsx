import { AbsoluteFill, useCurrentFrame, spring } from 'remotion'
import { ProgressBar } from '../components/ProgressBar'

const POSTES = [
  { label: '🏗️  Pylône',             budget: 850_000, paid: 120_000, delay: 15 },
  { label: '🏠  Local Construction', budget: 720_000, paid: 98_000,  delay: 25 },
  { label: '⚡  Local GE',           budget: 560_000, paid: 75_000,  delay: 35 },
  { label: '🧱  Mur Clôture',        budget: 340_000, paid: 0,       delay: 45 },
  { label: '💡  Électricité',        budget: 280_000, paid: 35_000,  delay: 55 },
  { label: '📦  Frais Extra',        budget: 197_500, paid: 33_801,  delay: 65 },
]

export function BudgetDetail() {
  const frame = useCurrentFrame()
  const titleE = spring({ frame, fps: 30, config: { damping: 14 } })

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f1a10 100%)',
      display: 'flex', fontFamily: 'sans-serif',
    }}>
      {/* Left */}
      <div style={{ width: 480, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 60px', gap: 28 }}>
        <div style={{ opacity: titleE, transform: `translateX(${(1 - titleE) * -30}px)` }}>
          <div style={{ fontSize: 13, color: '#10b981', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
            ● Budget
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#f8fafc', lineHeight: 1.15 }}>
            Transparent,<br /><span style={{ color: '#10b981' }}>poste par poste</span>
          </div>
          <div style={{ marginTop: 24, fontSize: 17, color: '#64748b', lineHeight: 1.7 }}>
            Chaque dirham tracé.<br />Budget vs Payé en temps réel.
          </div>
        </div>

        {/* Total box */}
        <div style={{
          padding: '20px 24px',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 14,
          opacity: spring({ frame: frame - 80, fps: 30, config: { damping: 14 } }),
        }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Budget total</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>2 947 500 DH</div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>361 801 DH payés (12.3%)</div>
        </div>
      </div>

      {/* Right — progress bars */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px 60px 40px',
      }}>
        {POSTES.map((p) => (
          <ProgressBar key={p.label} label={p.label} budget={p.budget} paid={p.paid} delay={p.delay} color="#10b981" />
        ))}
      </div>
    </AbsoluteFill>
  )
}
