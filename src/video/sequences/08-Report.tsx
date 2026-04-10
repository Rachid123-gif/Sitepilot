import { AbsoluteFill, useCurrentFrame, spring, interpolate } from 'remotion'

function PagePreview({ title, color, delay, children }: { title: string; color: string; delay: number; children?: React.ReactNode }) {
  const frame = useCurrentFrame()
  const e = spring({ frame: frame - delay, fps: 30, config: { damping: 14 } })
  return (
    <div style={{
      width: 180, background: '#1e2d3d', borderRadius: 10,
      border: `1px solid ${color}40`, overflow: 'hidden',
      opacity: e, transform: `translateY(${(1 - e) * 30}px) scale(${0.9 + e * 0.1})`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
    }}>
      <div style={{ height: 6, background: color }} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 10, color, marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>SitePilot</div>
        <div style={{ fontSize: 11, color: '#f8fafc', fontWeight: 600, marginBottom: 8 }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

function MiniBar({ width, color }: { width: number; color: string }) {
  return <div style={{ height: 6, background: color, borderRadius: 3, marginBottom: 4, width: `${width}%` }} />
}

export function Report() {
  const frame = useCurrentFrame()
  const titleE = spring({ frame, fps: 30, config: { damping: 14 } })

  // PDF generation animation
  const progressW = interpolate(frame, [40, 160], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const downloadE = spring({ frame: frame - 170, fps: 30, config: { damping: 12, stiffness: 120 } })

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0e1520 100%)',
      display: 'flex', fontFamily: 'sans-serif',
    }}>
      {/* Left */}
      <div style={{ width: 480, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 60px', gap: 28 }}>
        <div style={{ opacity: titleE, transform: `translateX(${(1 - titleE) * -30}px)` }}>
          <div style={{ fontSize: 13, color: '#06b6d4', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
            ● Rapport PDF
          </div>
          <div style={{ fontSize: 46, fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
            Hebdomadaire,<br /><span style={{ color: '#06b6d4' }}>automatique</span>
          </div>
          <div style={{ marginTop: 20, fontSize: 16, color: '#64748b', lineHeight: 1.7 }}>
            Chaque jeudi, un rapport 5 pages prêt pour la direction. Aucune saisie manuelle.
          </div>
        </div>

        {/* Generation progress */}
        <div style={{ padding: '20px 24px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>
            <span>Génération PDF en cours...</span>
            <span style={{ color: '#06b6d4', fontWeight: 700 }}>{Math.round(progressW)}%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${progressW}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', borderRadius: 3 }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
            {progressW < 25 ? '📑 Page de couverture...' :
             progressW < 50 ? '📊 Tableau de synthèse...' :
             progressW < 75 ? '💰 Répartition budgétaire...' :
             progressW < 95 ? '⚠️ Sites à risque...' : '✅ Rapport généré !'}
          </div>
        </div>

        {/* Download button */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px',
          background: '#06b6d4', borderRadius: 12, cursor: 'pointer',
          opacity: downloadE, transform: `scale(${0.95 + downloadE * 0.05})`,
        }}>
          <span style={{ fontSize: 20 }}>⬇️</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
            Télécharger SitePilot_Rapport_2025-04-10.pdf
          </span>
        </div>
      </div>

      {/* Right — PDF page previews */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 60px', gap: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <PagePreview title="Rapport Hebdomadaire" color="#3b82f6" delay={30}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {['2.9M DH', '14 sites', '12%', '3 alertes'].map((v) => (
                <div key={v} style={{ padding: '2px 6px', background: 'rgba(59,130,246,0.2)', borderRadius: 4, fontSize: 9, color: '#93c5fd' }}>{v}</div>
              ))}
            </div>
            <div style={{ fontSize: 9, color: '#64748b' }}>Semaine 15 — Avril 2025</div>
          </PagePreview>

          <PagePreview title="Synthèse globale" color="#10b981" delay={55}>
            <MiniBar width={90} color="#3b82f6" />
            <MiniBar width={75} color="#3b82f6" />
            <MiniBar width={60} color="#10b981" />
            <MiniBar width={85} color="#10b981" />
            <MiniBar width={45} color="#f59e0b" />
          </PagePreview>

          <PagePreview title="Budget par poste" color="#8b5cf6" delay={80}>
            {['Pylône', 'Local', 'GE', 'Clôture', 'Élec', 'Extra'].map((p, i) => (
              <div key={p} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginBottom: 3 }}>
                <span>{p}</span><span style={{ color: '#a78bfa' }}>{[850, 720, 560, 340, 280, 197][i]}K</span>
              </div>
            ))}
          </PagePreview>

          <PagePreview title="Sites à risque" color="#ef4444" delay={105}>
            {['R15/23 — ROUGE', 'R15/14 — ORANGE'].map((s, i) => (
              <div key={i} style={{ padding: '4px 6px', background: i === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', borderRadius: 4, fontSize: 9, color: i === 0 ? '#fca5a5' : '#fcd34d', marginBottom: 4 }}>{s}</div>
            ))}
          </PagePreview>

          <PagePreview title="Prochaines échéances" color="#f59e0b" delay={130}>
            {['15/04 — Avance N°1', '20/07 — Avance N°2'].map((e, i) => (
              <div key={i} style={{ fontSize: 9, color: '#fcd34d', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '4px 0' }}>{e}</div>
            ))}
          </PagePreview>
        </div>
      </div>
    </AbsoluteFill>
  )
}
