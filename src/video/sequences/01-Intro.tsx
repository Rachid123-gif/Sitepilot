import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

function Particle({ x, y, size, delay, speed }: { x: number; y: number; size: number; delay: number; speed: number }) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame - delay, [0, 20, 180, 240], [0, 0.6, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const yOff = interpolate(frame - delay, [0, 240], [0, -speed], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(59,130,246,0.6)',
      opacity,
      transform: `translateY(${yOff}px)`,
      filter: `blur(${size * 0.3}px)`,
    }} />
  )
}

const PARTICLES = [
  { x: 10, y: 80, size: 4, delay: 5,  speed: 60 },
  { x: 25, y: 90, size: 3, delay: 12, speed: 45 },
  { x: 45, y: 85, size: 5, delay: 0,  speed: 70 },
  { x: 60, y: 75, size: 3, delay: 8,  speed: 55 },
  { x: 75, y: 88, size: 4, delay: 15, speed: 50 },
  { x: 88, y: 82, size: 6, delay: 3,  speed: 65 },
  { x: 33, y: 70, size: 2, delay: 20, speed: 40 },
  { x: 55, y: 92, size: 3, delay: 10, speed: 48 },
  { x: 82, y: 68, size: 5, delay: 6,  speed: 58 },
  { x: 18, y: 65, size: 2, delay: 18, speed: 42 },
]

const LETTERS = 'SitePilot'.split('')

export function Intro() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Background gradient animation
  const gradientShift = interpolate(frame, [0, 240], [0, 30])

  // Logo letter reveal
  const logoEntrance = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 60 } })

  // Subtitle fade
  const subtitleOpacity = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const subtitleY = interpolate(frame, [60, 100], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Line reveal
  const lineW = interpolate(frame, [80, 130], [0, 320], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at ${50 + gradientShift * 0.3}% ${40 - gradientShift * 0.2}%, #1e3a5f 0%, #0a0f1e 60%, #050810 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* Animated mesh lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }} viewBox="0 0 1920 1080">
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={320 * i} y1="0" x2={320 * i + 200} y2="1080" stroke="#3b82f6" strokeWidth="1" />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <line key={i + 10} x1="0" y1={270 * i} x2="1920" y2={270 * i + 80} stroke="#3b82f6" strokeWidth="1" />
        ))}
      </svg>

      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center',
        transform: `scale(${0.7 + logoEntrance * 0.3})`,
        opacity: logoEntrance,
      }}>
        {LETTERS.map((char, i) => {
          const letterDelay = i * 3
          const op = interpolate(frame - 10 - letterDelay, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const y = interpolate(frame - 10 - letterDelay, [0, 20], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return (
            <span key={i} style={{
              fontSize: 112,
              fontWeight: 900,
              fontFamily: 'sans-serif',
              letterSpacing: -4,
              color: i < 4 ? '#f8fafc' : '#3b82f6',
              opacity: op,
              display: 'inline-block',
              transform: `translateY(${y}px)`,
            }}>
              {char}
            </span>
          )
        })}
      </div>

      {/* Divider line */}
      <div style={{
        width: lineW, height: 2,
        background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
        marginTop: 12, marginBottom: 24,
      }} />

      {/* Subtitle */}
      <div style={{
        fontSize: 28, color: '#94a3b8', fontFamily: 'sans-serif', fontWeight: 300, letterSpacing: 4,
        textTransform: 'uppercase',
        opacity: subtitleOpacity,
        transform: `translateY(${subtitleY}px)`,
      }}>
        Pilotage intelligent de chantiers multi-sites
      </div>

      {/* Bottom glow */}
      <div style={{
        position: 'absolute', bottom: -100, left: '20%', right: '20%',
        height: 200, borderRadius: '50%',
        background: 'radial-gradient(ellipse, #3b82f630 0%, transparent 70%)',
      }} />
    </AbsoluteFill>
  )
}
