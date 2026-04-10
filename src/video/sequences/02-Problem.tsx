import { AbsoluteFill, useCurrentFrame, spring } from 'remotion'

const PROBLEMS = [
  {
    icon: '📊',
    title: 'Fichiers Excel éparpillés',
    desc: 'Des dizaines de classeurs, aucune vue consolidée, des données contradictoires entre équipes.',
    delay: 10,
  },
  {
    icon: '📷',
    title: 'Photos sans traçabilité',
    desc: 'Des centaines de photos terrain qui s\'accumulent sans lien avec l\'avancement réel du chantier.',
    delay: 35,
  },
  {
    icon: '🚨',
    title: 'Retards détectés trop tard',
    desc: 'Les écarts budgétaires et les dérapages de planning ne sont identifiés qu\'en fin de projet.',
    delay: 60,
  },
]

export function Problem() {
  const frame = useCurrentFrame()

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0f1e 0%, #120818 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '80px 160px',
      fontFamily: 'sans-serif',
    }}>
      {/* Title */}
      {(() => {
        const e = spring({ frame: frame - 0, fps: 30, config: { damping: 14 } })
        return (
          <div style={{ marginBottom: 64, opacity: e, transform: `translateY(${(1 - e) * -20}px)` }}>
            <div style={{ fontSize: 14, color: '#ef4444', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
              ● Le défi
            </div>
            <div style={{ fontSize: 60, fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
              La réalité du<br /><span style={{ color: '#ef4444' }}>terrain aujourd'hui</span>
            </div>
          </div>
        )
      })()}

      {/* Problem cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {PROBLEMS.map(({ icon, title, desc, delay }) => {
          const entrance = spring({ frame: frame - delay, fps: 30, config: { damping: 14, stiffness: 80 } })
          return (
            <div key={title} style={{
              display: 'flex', alignItems: 'flex-start', gap: 28,
              padding: '28px 36px',
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderLeft: '4px solid #ef4444',
              borderRadius: 16,
              opacity: entrance,
              transform: `translateX(${(1 - entrance) * -40}px)`,
            }}>
              <div style={{ fontSize: 40, lineHeight: 1, flexShrink: 0, marginTop: 4 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.6 }}>{desc}</div>
              </div>
              <div style={{
                marginLeft: 'auto', flexShrink: 0,
                width: 12, height: 12, borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 20px #ef4444',
                alignSelf: 'center',
              }} />
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
