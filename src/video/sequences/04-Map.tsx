import { AbsoluteFill, useCurrentFrame, spring } from 'remotion'
import { MockMap } from '../components/MockMap'

export function MapSeq() {
  const frame = useCurrentFrame()
  const titleE = spring({ frame, fps: 30, config: { damping: 14 } })
  const mapE = spring({ frame: frame - 10, fps: 30, config: { damping: 14 } })
  const showPopup = frame > 150

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0f1e 0%, #071020 100%)',
      display: 'flex', fontFamily: 'sans-serif',
    }}>
      {/* Left */}
      <div style={{ width: 500, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 60px', gap: 28 }}>
        <div style={{ opacity: titleE, transform: `translateX(${(1 - titleE) * -30}px)` }}>
          <div style={{ fontSize: 13, color: '#06b6d4', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
            ● Géolocalisation
          </div>
          <div style={{ fontSize: 50, fontWeight: 800, color: '#f8fafc', lineHeight: 1.15 }}>
            Vos 14 sites,<br /><span style={{ color: '#06b6d4' }}>sur la carte</span>
          </div>
        </div>

        <div style={{ opacity: spring({ frame: frame - 20, fps: 30, config: { damping: 14 } }) }}>
          {[
            { icon: '📍', text: '14 sites géolocalisés au Maroc' },
            { icon: '🎯', text: 'Statut par couleur en temps réel' },
            { icon: '🔍', text: 'Popup avec KPIs au survol' },
          ].map(({ icon, text }, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 0',
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <span style={{ fontSize: 24 }}>{icon}</span>
              <span style={{ fontSize: 18, color: '#cbd5e1' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — map */}
      <div style={{
        flex: 1, padding: '50px 60px 50px 20px',
        opacity: mapE,
        transform: `scale(${0.95 + mapE * 0.05})`,
      }}>
        <MockMap showPopup={showPopup} />
      </div>
    </AbsoluteFill>
  )
}
