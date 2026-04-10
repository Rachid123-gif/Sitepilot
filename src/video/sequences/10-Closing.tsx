import { AbsoluteFill, useCurrentFrame, spring, interpolate } from 'remotion'

export function Closing() {
  const frame = useCurrentFrame()
  const { durationInFrames } = { durationInFrames: 240 }

  const logoE = spring({ frame: frame - 5, fps: 30, config: { damping: 16, stiffness: 70 } })
  const tag1E = spring({ frame: frame - 45, fps: 30, config: { damping: 14 } })
  const tag2E = spring({ frame: frame - 75, fps: 30, config: { damping: 14 } })
  const ctaE  = spring({ frame: frame - 110, fps: 30, config: { damping: 12, stiffness: 100 } })

  const fadeOut = interpolate(frame, [190, 240], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const gradShift = interpolate(frame, [0, 240], [0, 20])

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at ${50 + gradShift * 0.5}% ${40 - gradShift * 0.3}%, #1e3a5f 0%, #0d0a1f 50%, #050810 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif',
      opacity: fadeOut,
    }}>
      {/* Top glow */}
      <div style={{
        position: 'absolute', top: -150, left: '25%', right: '25%', height: 300,
        background: 'radial-gradient(ellipse, #3b82f640 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        fontSize: 100, fontWeight: 900, letterSpacing: -4,
        opacity: logoE, transform: `scale(${0.8 + logoE * 0.2})`,
        marginBottom: 8,
      }}>
        <span style={{ color: '#f8fafc' }}>Site</span>
        <span style={{ color: '#3b82f6' }}>Pilot</span>
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: 30, color: '#94a3b8', fontWeight: 300, letterSpacing: 2,
        opacity: tag1E, transform: `translateY(${(1 - tag1E) * 20}px)`,
        marginBottom: 12,
      }}>
        Pilotez vos chantiers. Maîtrisez vos budgets.
      </div>

      {/* Divider */}
      <div style={{
        width: interpolate(frame, [60, 110], [0, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        height: 1,
        background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
        marginBottom: 48,
      }} />

      {/* CTA */}
      <div style={{
        opacity: ctaE,
        transform: `scale(${0.9 + ctaE * 0.1})`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          padding: '18px 52px',
          background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
          borderRadius: 14,
          fontSize: 22, fontWeight: 700, color: '#fff',
          boxShadow: '0 8px 40px rgba(59,130,246,0.4)',
        }}>
          Demandez votre démonstration
        </div>
        <div style={{ fontSize: 16, color: '#475569' }}>
          Solution clé en main · Déploiement en 48h · Support dédié
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        position: 'absolute', bottom: 60,
        display: 'flex', gap: 60,
        opacity: tag2E,
      }}>
        {[['14', 'sites pilotés'], ['2.9M', 'DH gérés'], ['30%', 'gain de temps'], ['100%', 'traçabilité']].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>{val}</div>
            <div style={{ fontSize: 13, color: '#475569' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Bottom glow */}
      <div style={{
        position: 'absolute', bottom: -100, left: '20%', right: '20%', height: 200,
        background: 'radial-gradient(ellipse, #3b82f625 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  )
}
