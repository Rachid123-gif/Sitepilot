import { AbsoluteFill, useCurrentFrame, spring, interpolate } from 'remotion'

const ECHEANCES = [
  { label: 'Avance N°1', montant: '1 326 375 DH', date: 'Avr 2025', color: '#3b82f6', sites: ['R15/6', 'R15/8', 'R15/10', 'R15/14'], delay: 30 },
  { label: 'Avance N°2', montant: '1 326 375 DH', date: 'Juil 2025', color: '#8b5cf6', sites: ['R15/23', 'R15/24', 'R15/25'], delay: 70 },
  { label: 'Solde',      montant: '294 750 DH',   date: 'Oct 2025', color: '#f59e0b', sites: ['Tous sites'],                delay: 110 },
]

export function Planning() {
  const frame = useCurrentFrame()
  const titleE = spring({ frame, fps: 30, config: { damping: 14 } })
  const lineW = interpolate(frame, [20, 120], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1525 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '80px 140px',
      fontFamily: 'sans-serif',
    }}>
      {/* Title */}
      <div style={{ opacity: titleE, transform: `translateY(${(1 - titleE) * -20}px)`, marginBottom: 64 }}>
        <div style={{ fontSize: 13, color: '#f59e0b', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
          ● Planning
        </div>
        <div style={{ fontSize: 58, fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
          Échéances <span style={{ color: '#f59e0b' }}>maîtrisées</span>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: 60 }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute', left: 20, top: 24, bottom: 24, width: 3,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
        }}>
          <div style={{
            width: '100%',
            height: `${lineW}%`,
            background: 'linear-gradient(180deg, #3b82f6, #8b5cf6, #f59e0b)',
            borderRadius: 2,
          }} />
        </div>

        {ECHEANCES.map(({ label, montant, date, color, sites, delay }) => {
          const e = spring({ frame: frame - delay, fps: 30, config: { damping: 14 } })
          return (
            <div key={label} style={{
              display: 'flex', alignItems: 'flex-start', gap: 32, marginBottom: 40,
              opacity: e, transform: `translateX(${(1 - e) * 30}px)`,
            }}>
              {/* Timeline dot */}
              <div style={{
                position: 'absolute', left: 9, width: 24, height: 24, borderRadius: '50%',
                background: color, border: '3px solid #0a0f1e',
                boxShadow: `0 0 20px ${color}80`,
                flexShrink: 0,
              }} />

              {/* Card */}
              <div style={{
                flex: 1, padding: '24px 32px',
                background: `${color}10`,
                border: `1px solid ${color}30`,
                borderLeft: `4px solid ${color}`,
                borderRadius: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>Échéance : {date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color }}>
                      {montant}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Montant théorique</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sites.map((s) => (
                    <span key={s} style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12,
                      background: `${color}20`, color, border: `1px solid ${color}40`,
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
