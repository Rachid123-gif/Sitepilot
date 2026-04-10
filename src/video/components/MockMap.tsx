import { useCurrentFrame, spring, interpolate } from 'remotion'

// All rendering is done in SVG to avoid DOM/SVG coordinate mismatch.
// The viewBox is in lon/lat coordinates directly (flipped Y for screen).

// Bounding box covering Morocco + Western Sahara + margins
const LON_MIN = -18
const LON_MAX = -0.5
const LAT_MIN = 20
const LAT_MAX = 36.5
const VB_W = LON_MAX - LON_MIN   // 17.5
const VB_H = LAT_MAX - LAT_MIN   // 16.5

// Convert lon/lat to SVG viewBox coordinates (Y is flipped: north=top)
const toSVG = (lon: number, lat: number) => ({
  x: lon - LON_MIN,
  y: LAT_MAX - lat,
})

// Morocco + Western Sahara outline (simplified but accurate)
const outlinePts: Array<[number, number]> = [
  // North coast: Tangier → Mediterranean
  [-5.92, 35.78], [-5.30, 35.90], [-4.80, 35.80], [-4.30, 35.74],
  [-3.80, 35.70], [-3.00, 35.60], [-2.42, 35.28], [-2.20, 34.87],
  // Eastern border (Algerian) going south
  [-1.80, 34.65], [-1.70, 34.30], [-1.75, 33.90], [-1.80, 33.50],
  [-1.85, 33.00], [-2.00, 32.50], [-1.95, 32.10], [-1.90, 31.50],
  [-2.10, 31.00], [-2.90, 30.30], [-3.40, 29.40], [-4.50, 28.95],
  [-5.20, 28.00], [-6.50, 27.90], [-8.67, 27.67],
  // Western Sahara southern border → Mauritania
  [-8.67, 27.67], [-12.00, 25.90], [-13.00, 24.50],
  [-13.10, 23.50], [-13.20, 22.50], [-13.20, 21.40],
  [-16.50, 21.00], [-17.06, 20.90],
  // Atlantic coast going north
  [-17.06, 21.30], [-17.00, 22.30], [-16.80, 23.20],
  [-16.30, 23.90], [-15.80, 24.30], [-15.00, 25.00],
  [-14.50, 25.50], [-14.00, 26.10], [-13.50, 26.80],
  [-13.10, 27.30], [-12.30, 27.90],
  [-11.40, 28.50], [-10.80, 29.00], [-10.20, 29.40],
  [-10.00, 29.60], [-9.80, 30.10], [-9.60, 30.70],
  [-9.50, 31.30], [-9.20, 32.30],
  [-8.60, 32.65], [-8.50, 33.20],
  [-7.60, 33.60], [-6.85, 34.03],
  [-6.50, 34.50], [-6.20, 35.17],
  [-5.92, 35.78],
]

const MOROCCO_PATH = (() => {
  const pts = outlinePts.map(([lon, lat]) => {
    const { x, y } = toSVG(lon, lat)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`
})()

// Sites with real coordinates
const SITES = [
  { id: 'R15/6',   lon: -7.97,  lat: 29.74, color: '#10b981', label: 'PA TATA' },
  { id: 'R15/8',   lon: -7.50,  lat: 29.30, color: '#3b82f6', label: 'TOUIZGI' },
  { id: 'R15/10',  lon: -8.25,  lat: 29.36, color: '#3b82f6', label: 'AKKA' },
  { id: 'R15/23',  lon: -9.00,  lat: 27.15, color: '#ef4444', label: 'S/S MAHBES' },
  { id: 'R15/29',  lon: -7.00,  lat: 30.10, color: '#10b981', label: 'TISSINT' },
  { id: 'R15/24',  lon: -9.80,  lat: 29.70, color: '#6b7280', label: 'TIZNIT' },
  { id: 'R15/25',  lon: -10.05, lat: 29.58, color: '#6b7280', label: 'MIRLEFT' },
  { id: 'R15/26',  lon: -9.50,  lat: 29.55, color: '#3b82f6', label: 'ASSARAG' },
  { id: 'R15/27',  lon: -9.35,  lat: 30.05, color: '#3b82f6', label: 'O.IFRANE' },
  { id: 'R15/28',  lon: -8.98,  lat: 29.72, color: '#6b7280', label: 'TAFRAOUT' },
  { id: 'R15/14',  lon: -10.06, lat: 28.98, color: '#f59e0b', label: 'GUELMIM' },
  { id: 'R15/19',  lon: -10.17, lat: 29.38, color: '#10b981', label: 'SIDI IFNI' },
  { id: 'R15/22A', lon: -11.40, lat: 28.50, color: '#3b82f6', label: 'DPM Tantan' },
  { id: 'R15/22B', lon: -11.10, lat: 28.30, color: '#6b7280', label: '4 CFA Tantan' },
]

const CITIES = [
  { name: 'Casablanca', lon: -7.62, lat: 33.59 },
  { name: 'Rabat', lon: -6.85, lat: 34.02 },
  { name: 'Marrakech', lon: -8.00, lat: 31.63 },
  { name: 'Agadir', lon: -9.60, lat: 30.42 },
  { name: 'Tiznit', lon: -9.80, lat: 29.70 },
  { name: 'Guelmim', lon: -10.06, lat: 28.98 },
  { name: 'Tan-Tan', lon: -11.10, lat: 28.44 },
  { name: 'Laayoune', lon: -13.20, lat: 27.15 },
]

const LEGEND = [
  { color: '#10b981', label: 'Termine' },
  { color: '#3b82f6', label: 'En cours' },
  { color: '#f59e0b', label: 'Bloque' },
  { color: '#6b7280', label: 'A planifier' },
  { color: '#ef4444', label: 'En retard' },
]

interface Props { showPopup?: boolean }

export function MockMap({ showPopup = false }: Props) {
  const frame = useCurrentFrame()

  // viewBox in "shifted" lon/lat coords
  const vb = `0 0 ${VB_W} ${VB_H}`

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: 'linear-gradient(135deg, #06111f 0%, #0a1929 100%)',
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <svg viewBox={vb} preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>

        {/* Grid */}
        {Array.from({ length: 8 }).map((_, i) => {
          const y = ((i + 1) / 9) * VB_H
          return <line key={`h${i}`} x1={0} y1={y} x2={VB_W} y2={y} stroke="rgba(59,130,246,0.06)" strokeWidth={0.03} />
        })}
        {Array.from({ length: 10 }).map((_, i) => {
          const x = ((i + 1) / 11) * VB_W
          return <line key={`v${i}`} x1={x} y1={0} x2={x} y2={VB_H} stroke="rgba(59,130,246,0.06)" strokeWidth={0.03} />
        })}

        {/* Morocco fill + outline */}
        <path d={MOROCCO_PATH} fill="rgba(30,58,138,0.3)" stroke="rgba(99,179,237,0.6)" strokeWidth={0.06} />
        <path d={MOROCCO_PATH} fill="none" stroke="rgba(147,210,255,0.15)" strokeWidth={0.12} />

        {/* City labels */}
        {CITIES.map(({ name, lon, lat }) => {
          const { x, y } = toSVG(lon, lat)
          return (
            <g key={name}>
              <circle cx={x} cy={y} r={0.12} fill="rgba(148,163,184,0.5)" />
              <text x={x + 0.3} y={y + 0.1} fontSize={0.55} fill="rgba(148,163,184,0.55)" fontFamily="sans-serif">
                {name}
              </text>
            </g>
          )
        })}

        {/* Site dots */}
        {SITES.map((site, i) => {
          const { x, y } = toSVG(site.lon, site.lat)
          const delay = i * 4
          const entrance = spring({ frame: frame - delay, fps: 30, config: { damping: 12, stiffness: 100 } })
          const pulse = interpolate(Math.sin((frame - delay * 0.3) * 0.12), [-1, 1], [0.6, 1.4])

          return (
            <g key={site.id} opacity={entrance} transform={`translate(${x},${y})`}>
              {/* Pulse ring */}
              <circle cx={0} cy={0} r={0.5 * pulse} fill="none"
                stroke={site.color} strokeWidth={0.04} opacity={0.5} />
              {/* Glow */}
              <circle cx={0} cy={0} r={0.25} fill={site.color} opacity={0.3} />
              {/* Dot */}
              <circle cx={0} cy={0} r={0.18} fill={site.color} stroke="white" strokeWidth={0.04} />
              {/* Label */}
              <text x={0.35} y={-0.15} fontSize={0.38} fill="rgba(255,255,255,0.75)" fontFamily="sans-serif" fontWeight="bold">
                {site.label}
              </text>
            </g>
          )
        })}

        {/* Popup card */}
        {showPopup && (() => {
          const popupOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const popupY = interpolate(frame, [80, 100], [0.3, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const { x, y } = toSVG(-7.97, 29.74) // PA TATA
          return (
            <g opacity={popupOpacity} transform={`translate(${x + 0.5},${y - 2.5 + popupY})`}>
              <rect x={0} y={0} width={5} height={3.2} rx={0.2} fill="rgba(10,25,50,0.95)"
                stroke="rgba(99,179,237,0.5)" strokeWidth={0.04} />
              {/* Arrow */}
              <polygon points={`1,3.2 1.3,3.5 1.6,3.2`} fill="rgba(10,25,50,0.95)" />
              <text x={0.25} y={0.65} fontSize={0.45} fill="white" fontWeight="bold" fontFamily="sans-serif">PA TATA</text>
              <text x={0.25} y={1.1} fontSize={0.32} fill="#94a3b8" fontFamily="sans-serif">R15/6 · FAR · Toumi</text>
              <text x={0.25} y={1.65} fontSize={0.28} fill="#64748b" fontFamily="sans-serif">Budget</text>
              <text x={0.25} y={2.0} fontSize={0.38} fill="white" fontWeight="bold" fontFamily="sans-serif">175 000 DH</text>
              <text x={2.5} y={1.65} fontSize={0.28} fill="#64748b" fontFamily="sans-serif">Avancement</text>
              <text x={2.5} y={2.0} fontSize={0.38} fill="#10b981" fontWeight="bold" fontFamily="sans-serif">64%</text>
              {/* Mini progress */}
              <rect x={0.25} y={2.4} width={4.5} height={0.25} rx={0.08} fill="rgba(255,255,255,0.1)" />
              <rect x={0.25} y={2.4} width={2.88} height={0.25} rx={0.08} fill="#10b981" />
              <rect x={0.25} y={2.85} width={1.8} height={0.25} rx={0.08} fill="#10b981" opacity={0.6} />
              <text x={2.2} y={3.05} fontSize={0.22} fill="#10b981" fontFamily="sans-serif">En cours</text>
            </g>
          )
        })()}

        {/* Legend */}
        {LEGEND.map((item, i) => {
          const lx = VB_W - 3.5
          const ly = VB_H - 3 + i * 0.55
          return (
            <g key={item.label}>
              <circle cx={lx} cy={ly} r={0.15} fill={item.color} />
              <text x={lx + 0.3} y={ly + 0.12} fontSize={0.38} fill="#94a3b8" fontFamily="sans-serif">{item.label}</text>
            </g>
          )
        })}

        {/* Title badge */}
        <rect x={0.3} y={0.3} width={5} height={0.9} rx={0.15} fill="rgba(0,0,0,0.5)" />
        <text x={0.6} y={0.9} fontSize={0.4} fill="rgba(148,163,184,0.8)" fontFamily="sans-serif">
          Maroc · 14 sites actifs
        </text>
      </svg>
    </div>
  )
}
