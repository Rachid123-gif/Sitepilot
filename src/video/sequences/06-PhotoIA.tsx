import { AbsoluteFill, useCurrentFrame, spring, interpolate } from 'remotion'

const ELEMENTS = ['fondations', 'dalle coulée', 'pylône en montage', 'local technique', 'clôture partielle']

export function PhotoIA() {
  const frame = useCurrentFrame()
  const titleE = spring({ frame, fps: 30, config: { damping: 14 } })

  // Scan animation (frame 40-100)
  const scanY = interpolate(frame, [40, 100], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const scanOpacity = interpolate(frame, [35, 45, 90, 105], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Result card appears at frame 100
  const resultE = spring({ frame: frame - 100, fps: 30, config: { damping: 14 } })

  // Slider position animates from 45 to 52 (manager adjusts)
  const sliderVal = interpolate(frame, [220, 280], [45, 52], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Validated badge appears at frame 290
  const validatedE = spring({ frame: frame - 290, fps: 30, config: { damping: 12, stiffness: 120 } })

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0e1220 100%)',
      display: 'flex', fontFamily: 'sans-serif',
    }}>
      {/* Left title */}
      <div style={{ width: 440, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 48px', gap: 24 }}>
        <div style={{ opacity: titleE, transform: `translateX(${(1 - titleE) * -30}px)` }}>
          <div style={{ fontSize: 12, color: '#8b5cf6', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
            ● Intelligence Artificielle
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
            Analyse IA<br />des photos<br /><span style={{ color: '#8b5cf6' }}>terrain</span>
          </div>
          <div style={{ marginTop: 20, fontSize: 16, color: '#64748b', lineHeight: 1.7 }}>
            Claude Sonnet analyse chaque photo et estime l'avancement. Le manager valide en un geste.
          </div>
        </div>
      </div>

      {/* Center — photo + scan */}
      <div style={{ width: 480, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 20px', gap: 20 }}>
        {/* Photo placeholder */}
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(139,92,246,0.4)' }}>
          {/* Simulated construction photo */}
          <div style={{
            width: '100%', height: 280,
            background: 'linear-gradient(160deg, #2d3748 0%, #4a5568 30%, #718096 60%, #4a5568 80%, #2d3748 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Structural elements */}
            <svg viewBox="0 0 440 280" style={{ width: '100%', height: '100%', position: 'absolute' }}>
              {/* Ground */}
              <rect x="0" y="220" width="440" height="60" fill="#5a4a3a" />
              {/* Foundation */}
              <rect x="100" y="200" width="240" height="30" fill="#8b7355" rx="2" />
              {/* Concrete slab */}
              <rect x="80" y="170" width="280" height="35" fill="#a0997a" rx="2" />
              {/* Walls */}
              <rect x="110" y="100" width="80" height="75" fill="#b0a882" rx="2" />
              <rect x="250" y="100" width="80" height="75" fill="#b0a882" rx="2" />
              {/* Pylone */}
              <rect x="210" y="20" width="20" height="155" fill="#c0c0c0" rx="1" />
              <rect x="190" y="30" width="60" height="4" fill="#a0a0a0" rx="1" />
              <rect x="185" y="60" width="70" height="4" fill="#a0a0a0" rx="1" />
              <rect x="190" y="90" width="60" height="4" fill="#a0a0a0" rx="1" />
            </svg>
          </div>

          {/* Scan line */}
          <div style={{
            position: 'absolute', left: 0, right: 0,
            top: `${scanY}%`,
            height: 3,
            background: 'linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, #8b5cf6, transparent)',
            opacity: scanOpacity,
            boxShadow: '0 0 20px #8b5cf6',
          }} />
          {/* Scan corners */}
          {[{ top: 8, left: 8 }, { top: 8, right: 8 }, { bottom: 8, left: 8 }, { bottom: 8, right: 8 }].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos,
              width: 20, height: 20,
              borderColor: '#8b5cf6',
              borderStyle: 'solid',
              borderWidth: 0,
              borderTopWidth: pos.top !== undefined ? 2 : 0,
              borderBottomWidth: pos.bottom !== undefined ? 2 : 0,
              borderLeftWidth: pos.left !== undefined ? 2 : 0,
              borderRightWidth: pos.right !== undefined ? 2 : 0,
              opacity: scanOpacity,
            }} />
          ))}
        </div>

        {/* Slider */}
        <div style={{
          opacity: resultE,
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>
            <span>Score validé manager</span>
            <span style={{ color: '#f8fafc', fontWeight: 700 }}>{Math.round(sliderVal)}%</span>
          </div>
          <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${sliderVal}%`, background: '#8b5cf6', borderRadius: 3 }} />
            <div style={{
              position: 'absolute', top: '50%', left: `${sliderVal}%`,
              transform: 'translate(-50%, -50%)',
              width: 14, height: 14, borderRadius: '50%',
              background: '#f8fafc', border: '3px solid #8b5cf6',
            }} />
          </div>
        </div>
      </div>

      {/* Right — result card */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 48px', gap: 16, opacity: resultE }}>
        {/* Score gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16 }}>
          <svg width={80} height={80} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
            <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
            <circle cx={40} cy={40} r={32} fill="none" stroke="#8b5cf6" strokeWidth={8}
              strokeDasharray={201}
              strokeDashoffset={201 - (201 * interpolate(frame, [100, 160], [0, 0.45], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))}
              strokeLinecap="round"
            />
          </svg>
          <div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#f8fafc' }}>45%</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Score IA estimé</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Confiance IA</div>
            <div style={{ height: 6, width: 100, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${interpolate(frame, [110, 160], [0, 78], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`, background: '#10b981', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 12, color: '#10b981', marginTop: 3 }}>78% — Élevée</div>
          </div>
        </div>

        {/* Justification */}
        <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>
          Fondations visibles et dalle coulée. Structure pylône partiellement montée, local technique en gros œuvre. Clôture non finalisée.
        </div>

        {/* Elements tags */}
        <div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Éléments identifiés</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ELEMENTS.map((el, i) => {
              const tagE = spring({ frame: frame - 120 - i * 10, fps: 30, config: { damping: 14 } })
              return (
                <span key={el} style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  background: 'rgba(139,92,246,0.2)', color: '#a78bfa',
                  border: '1px solid rgba(139,92,246,0.3)',
                  opacity: tagE, transform: `scale(${0.8 + tagE * 0.2})`,
                }}>
                  {el}
                </span>
              )
            })}
          </div>
        </div>

        {/* Validated badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
          borderRadius: 12,
          opacity: validatedE, transform: `scale(${0.9 + validatedE * 0.1})`,
        }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 800 }}>✓</div>
          <span style={{ fontSize: 14, color: '#10b981', fontWeight: 700 }}>Score validé — 52% — Avancement réel mis à jour</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
