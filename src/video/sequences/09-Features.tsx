import { AbsoluteFill, useCurrentFrame, spring } from 'remotion'

const FEATURES = [
  { icon: '📥', title: 'Import Excel', desc: 'Chargement en 1 clic des données existantes', color: '#3b82f6' },
  { icon: '💰', title: 'Budget multi-postes', desc: 'Pylône, Local, GE, Clôture, Électricité, Extra', color: '#10b981' },
  { icon: '🗺️', title: 'Carte interactive', desc: '14 sites géolocalisés avec statuts temps réel', color: '#06b6d4' },
  { icon: '🤖', title: 'Analyse IA terrain', desc: 'Score d\'avancement automatique par photo', color: '#8b5cf6' },
  { icon: '🚨', title: 'Alertes automatiques', desc: 'Détection des dérives budget et planning', color: '#ef4444' },
  { icon: '📄', title: 'Rapport PDF corporate', desc: 'Export hebdomadaire 5 pages prêt direction', color: '#f59e0b' },
]

export function Features() {
  const frame = useCurrentFrame()
  const titleE = spring({ frame, fps: 30, config: { damping: 14 } })

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f0a1e 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '60px 100px',
      fontFamily: 'sans-serif',
    }}>
      {/* Title */}
      <div style={{ opacity: titleE, transform: `translateY(${(1 - titleE) * -20}px)`, marginBottom: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#94a3b8', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
          ● Fonctionnalités
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, color: '#f8fafc' }}>
          Tout ce dont vous avez besoin
        </div>
      </div>

      {/* 2x3 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 24, flex: 1 }}>
        {FEATURES.map(({ icon, title, desc, color }, i) => {
          const row = Math.floor(i / 3)
          const col = i % 3
          const delay = row * 20 + col * 12 + 15
          const e = spring({ frame: frame - delay, fps: 30, config: { damping: 14, stiffness: 80 } })

          return (
            <div key={title} style={{
              padding: '28px 28px',
              background: `${color}08`,
              border: `1px solid ${color}25`,
              borderRadius: 20,
              borderTop: `3px solid ${color}`,
              opacity: e,
              transform: `translateY(${(1 - e) * 30}px)`,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ fontSize: 36 }}>{icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc' }}>{title}</div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>{desc}</div>
              <div style={{ marginTop: 'auto' }}>
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: `${color}20`, color, border: `1px solid ${color}40` }}>
                  Disponible
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
