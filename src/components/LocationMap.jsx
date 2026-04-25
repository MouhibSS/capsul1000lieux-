import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

/**
 * LocationMap — privacy-circle map.
 * Uses Leaflet + OpenStreetMap (free, no API key). Shows a gold circle
 * around the approximate area instead of the exact pin, so the address
 * is only revealed after a booking is confirmed.
 */
export default function LocationMap({
  latitude,
  longitude,
  label,
  city,
  country = 'Tunisia',
  height = 460,
  zoom = 14,
  radius = 800, // metres — kept large on purpose to obscure the exact spot
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (latitude == null || longitude == null) return
    let cancelled = false

    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([{ default: L }]) => {
      if (cancelled || !containerRef.current) return

      // Tear down previous instance (e.g. on prop change / route remount)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      const map = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      })
      mapRef.current = map

      // CARTO Dark Matter — free OSM tiles, fits the editorial palette
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map)

      // Privacy radius — a soft gold circle covering the general area
      L.circle([latitude, longitude], {
        radius,
        color: '#C8A96A',
        weight: 1.5,
        opacity: 0.9,
        fillColor: '#C8A96A',
        fillOpacity: 0.18,
      }).addTo(map)

      // Inner accent ring
      L.circle([latitude, longitude], {
        radius: Math.max(60, radius * 0.18),
        color: '#E8C98A',
        weight: 1,
        opacity: 0.7,
        fillColor: '#E8C98A',
        fillOpacity: 0.3,
      }).addTo(map)

      // Make sure the circle fits comfortably with breathing room
      map.fitBounds(
        L.latLng(latitude, longitude).toBounds(radius * 2.6),
        { padding: [20, 20] }
      )
    })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude, zoom, radius])

  if (latitude == null || longitude == null) {
    return (
      <div
        className="relative overflow-hidden bg-surface-low border border-outline-variant/30 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="diamond mx-auto mb-4">
            <MapPin className="w-5 h-5 text-gold" strokeWidth={1.4} />
          </div>
          <div className="eyebrow-sm mb-1">Location</div>
          <div className="font-display text-2xl font-light text-on-surface">
            {label || city}
          </div>
          <div className="text-on-surface-variant text-xs mt-2 font-mono uppercase tracking-widest">
            Coordinates pending
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden border border-outline-variant/30" style={{ height }}>
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Top-left badge */}
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <div className="bg-bg/70 backdrop-blur-md border border-gold/30 px-3 py-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold">
            Approx. area
          </span>
        </div>
      </div>

      {/* Bottom overlay label */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] flex items-end justify-between pointer-events-none gap-3">
        <div className="bg-bg/55 backdrop-blur-md px-3 py-2">
          <div className="eyebrow-sm text-gold mb-0.5">Location</div>
          <div className="font-display text-base md:text-lg text-on-surface drop-shadow-lg leading-tight">
            {label || city}
          </div>
          <div className="text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-widest">
            {city}, {country}
          </div>
        </div>
        <div className="font-mono text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-on-surface-variant bg-bg/55 backdrop-blur-md px-3 py-1.5 whitespace-nowrap">
          ~ {Math.round(radius)} m radius
        </div>
      </div>
    </div>
  )
}
