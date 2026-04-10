import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { computeKPISite } from '../lib/engine'
import { formatMontant, formatPourcent } from '../lib/utils'
import type { StatutSite } from '../types'

const SITE_COORDS: Record<string, [number, number]> = {
  'R15/6': [29.7400, -7.9700],
  'R15/8': [29.3200, -8.1500],
  'R15/10': [29.3900, -8.2500],
  'R15/23': [27.1500, -8.8700],
  'R15/29': [29.7500, -7.9600],
  'R15/24': [29.2000, -9.8000],
  'R15/25': [29.1000, -9.7000],
  'R15/26': [29.1500, -9.7500],
  'R15/27': [29.0500, -9.6500],
  'R15/28': [29.2500, -9.8500],
  'R15/14': [29.5000, -9.3000],
  'R15/19': [29.3800, -10.1700],
  'R15/22-DPM': [28.4400, -10.0100],
  'R15/22-CFA': [28.4500, -10.0000],
}

const STATUS_COLORS: Record<StatutSite, string> = {
  TERMINE: '#10b981',
  VALIDE: '#059669',
  EN_COURS: '#3b82f6',
  A_PLANIFIER: '#6b7280',
  BLOQUE: '#ef4444',
}

const STATUS_LABELS: Record<StatutSite, string> = {
  TERMINE: 'Terminé',
  VALIDE: 'Validé',
  EN_COURS: 'En cours',
  A_PLANIFIER: 'À planifier',
  BLOQUE: 'Bloqué',
}

const ALERT_COLORS: Record<string, string> = {
  vert: '#10b981',
  orange: '#f59e0b',
  rouge: '#ef4444',
}

// Esri World Street Map — no disputed territory labels
const ESRI_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
const ESRI_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ'

// Esri Dark Gray for dark mode
const ESRI_DARK_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
const ESRI_DARK_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'

export function CartePage() {
  const { sites, photos, darkMode } = useStore()
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carte des sites</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(STATUS_COLORS).map(([statut, color]) => (
            <div key={statut} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span
                style={{ backgroundColor: color }}
                className="inline-block w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
              />
              {STATUS_LABELS[statut as StatutSite]}
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm"
        style={{ height: 'calc(100vh - 10rem)' }}
      >
        <MapContainer
          center={[29.5, -9.0]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            key={darkMode ? 'dark' : 'light'}
            url={darkMode ? ESRI_DARK_URL : ESRI_URL}
            attribution={darkMode ? ESRI_DARK_ATTRIBUTION : ESRI_ATTRIBUTION}
          />

          {sites.map((site) => {
            const coords: [number, number] | undefined =
              SITE_COORDS[site.id] ??
              (site.lat != null && site.lng != null ? [site.lat, site.lng] : undefined)
            if (!coords) return null
            const sitePhotos = photos.filter((p) => p.siteId === site.id)
            const kpi = computeKPISite(site, sitePhotos)
            const fillColor = STATUS_COLORS[site.statut]

            return (
              <CircleMarker
                key={site.id}
                center={coords}
                radius={10}
                pathOptions={{
                  fillColor,
                  fillOpacity: 0.9,
                  color: '#ffffff',
                  weight: 2,
                }}
              >
                <Popup minWidth={220}>
                  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '4px 2px' }}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 2 }}>
                        {site.nom}
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{site.code}</span>
                        <span style={{
                          padding: '1px 7px',
                          borderRadius: 9999,
                          fontSize: 10,
                          fontWeight: 700,
                          backgroundColor: site.proprietaire === 'FAR' ? '#dbeafe' : '#ede9fe',
                          color: site.proprietaire === 'FAR' ? '#1e40af' : '#6d28d9',
                          border: `1px solid ${site.proprietaire === 'FAR' ? '#bfdbfe' : '#ddd6fe'}`,
                        }}>
                          {site.proprietaire}
                        </span>
                        <span>{site.sousTraitant}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 1 }}>Budget</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                          {formatMontant(kpi.budgetTotal)} DH
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 1 }}>% Payé</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                          {formatPourcent(kpi.pourcentagePaye)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 1 }}>Avancement réel</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>
                          {formatPourcent(kpi.avancementReel)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 1 }}>Risque</div>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: ALERT_COLORS[kpi.alertLevel],
                        }}>
                          {kpi.alertLevel.charAt(0).toUpperCase() + kpi.alertLevel.slice(1)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        backgroundColor: fillColor + '20',
                        color: fillColor,
                        fontWeight: 600,
                        border: `1px solid ${fillColor}40`,
                      }}>
                        {STATUS_LABELS[site.statut]}
                      </span>
                      <button
                        onClick={() => navigate(`/sites/${encodeURIComponent(site.id)}`)}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '4px 12px',
                          borderRadius: 6,
                          backgroundColor: '#111827',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Voir fiche →
                      </button>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
