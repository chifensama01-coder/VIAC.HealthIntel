'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import 'leaflet/dist/leaflet.css'
import type { GeoDataPoint } from '@/lib/types'
import { MapPin, Layers } from 'lucide-react'

interface MapComponentProps {
  geoData: GeoDataPoint[]
  loading?: boolean
}

function getColor(rate: number): string {
  if (rate > 35) return '#dc2626'
  if (rate > 30) return '#ef4444'
  if (rate > 25) return '#f97316'
  if (rate > 20) return '#f59e0b'
  if (rate > 15) return '#eab308'
  if (rate > 10) return '#84cc16'
  return '#22c55e'
}

const DISTRICT_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    { type: 'Feature' as const, properties: { district: 'Buea' }, geometry: { type: 'Polygon' as const, coordinates: [[[9.2, 4.12], [9.28, 4.12], [9.28, 4.19], [9.2, 4.19], [9.2, 4.12]]] } },
    { type: 'Feature' as const, properties: { district: 'Limbe' }, geometry: { type: 'Polygon' as const, coordinates: [[[9.17, 3.97], [9.24, 3.97], [9.24, 4.03], [9.17, 4.03], [9.17, 3.97]]] } },
    { type: 'Feature' as const, properties: { district: 'Bokwaongo' }, geometry: { type: 'Polygon' as const, coordinates: [[[9.255, 4.1], [9.295, 4.1], [9.295, 4.145], [9.255, 4.145], [9.255, 4.1]]] } },
    { type: 'Feature' as const, properties: { district: 'Bwassa' }, geometry: { type: 'Polygon' as const, coordinates: [[[9.16, 4.055], [9.215, 4.055], [9.215, 4.1], [9.16, 4.1], [9.16, 4.055]]] } },
  ],
}

export default function MapComponent({ geoData, loading }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const geojsonLayerRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return
    const rateMap = new Map(geoData.map((d) => [d.district, d]))

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current!, {
          center: [4.09, 9.23],
          zoom: 11,
          zoomControl: true,
          attributionControl: true,
        })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current)
      }

      const map = mapInstanceRef.current
      // Container may have been resized/re-laid-out (filters, responsive grid)
      map.invalidateSize()
      if (geojsonLayerRef.current) map.removeLayer(geojsonLayerRef.current)
      // Clear previously-added circle markers so they don't accumulate
      markersRef.current.forEach((m) => map.removeLayer(m))
      markersRef.current = []

      geojsonLayerRef.current = L.geoJSON(DISTRICT_GEOJSON, {
        style: (feature) => {
          const entry = rateMap.get(feature?.properties?.district)
          return {
            fillColor: getColor(entry?.rate ?? 0),
            weight: 2,
            opacity: 1,
            color: 'rgba(255,255,255,0.6)',
            dashArray: '',
            fillOpacity: 0.75,
          }
        },
        onEachFeature: (feature, layer) => {
          const district: string = feature.properties?.district
          const entry = rateMap.get(district)

          layer.on({
            mouseover(e) {
              e.target.setStyle({ weight: 3, color: '#fff', fillOpacity: 0.9 })
              e.target.bringToFront()
            },
            mouseout(e) { geojsonLayerRef.current?.resetStyle(e.target) },
            click() { router.push(`/dashboard/districts/${district}`) },
          })

          if (entry) {
            const riskColor = entry.riskScore > 60 ? '#ef4444' : entry.riskScore > 40 ? '#f59e0b' : '#10b981'
            const popupHtml = `
              <div style="font-family:Inter,sans-serif;min-width:200px;font-size:12px;">
                <div style="font-size:14px;font-weight:700;margin-bottom:8px;color:hsl(var(--foreground))">${district}</div>
                <div style="display:grid;gap:4px;">
                  <div style="display:flex;justify-content:space-between;">
                    <span style="color:hsl(var(--muted-foreground))">Total Cases</span>
                    <b>${entry.totalCases.toLocaleString()}</b>
                  </div>
                  <div style="display:flex;justify-content:space-between;">
                    <span style="color:hsl(var(--muted-foreground))">Complications</span>
                    <b style="color:${getColor(entry.rate)}">${entry.rate}%</b>
                  </div>
                  <div style="display:flex;justify-content:space-between;">
                    <span style="color:hsl(var(--muted-foreground))">Adolescent Cases</span>
                    <b>${entry.adolescentCases}</b>
                  </div>
                  <div style="display:flex;justify-content:space-between;">
                    <span style="color:hsl(var(--muted-foreground))">Risk Score</span>
                    <b style="color:${riskColor}">${entry.riskScore}/100</b>
                  </div>
                </div>
                <div style="margin-top:10px;padding:6px 10px;background:hsl(var(--primary));color:white;border-radius:6px;text-align:center;cursor:pointer;font-weight:600;font-size:11px;">
                  View District Intelligence →
                </div>
              </div>`
            layer.bindPopup(popupHtml)
          }
        },
      }).addTo(map)

      // Add circle markers for facility visualization
      geoData.forEach((d) => {
        if (!d.lat || !d.lng) return
        const marker = L.circleMarker([d.lat, d.lng], {
          radius: Math.max(5, Math.min(14, d.totalCases / 50)),
          fillColor: getColor(d.rate),
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        })
        marker.addTo(map)
        markersRef.current.push(marker)
        marker.bindTooltip(`<b>${d.district}</b> · ${d.totalCases.toLocaleString()} cases`, {
          permanent: false, direction: 'top',
        })
        marker.on('click', () => router.push(`/dashboard/districts/${d.district}`))
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoData])

  useEffect(() => {
    const onResize = () => mapInstanceRef.current?.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const LEGEND = [
    { label: '< 10%', color: '#22c55e' },
    { label: '10–20%', color: '#eab308' },
    { label: '20–30%', color: '#f97316' },
    { label: '> 30%', color: '#ef4444' },
  ]

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Complication Rate by District</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Click a district to view intelligence report</p>
          </div>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            <span>Rate scale:</span>
          </div>
          {LEGEND.map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1 text-xs">
              <span className="inline-block h-2.5 w-5 rounded-sm" style={{ background: color }} />
              <span className="text-muted-foreground">{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Map container is always mounted so Leaflet keeps its DOM node across
          filter changes; the spinner simply overlays while data refreshes. */}
      <div className="relative flex-1 min-h-[340px]">
        <div ref={mapRef} className="h-full w-full" />
        {loading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-card/60 backdrop-blur-[1px]">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        )}
      </div>
    </div>
  )
}
