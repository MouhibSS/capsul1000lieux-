import { useEffect, useRef, useState } from 'react'
import { MapPin, ExternalLink } from 'lucide-react'

// Editorial Mapbox component — dark styled, subtle gold pin.
// Needs `mapbox-gl` installed (npm i mapbox-gl) and a VITE_MAPBOX_TOKEN
// in .env. Gracefully degrades to a static card if either is missing,
// so the page never breaks during local dev.

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export default function LocationMap({
  latitude,
  longitude,
  label,
  city,
  country = 'Tunisia',
  height = 420,
  zoom = 13,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | loading | ready | missing

  useEffect(() => {
    if (!TOKEN) {
      setStatus('missing')
      return
    }
    let cancelled = false
    setStatus('loading')

    import('mapbox-gl')
      .then(({ default: mapboxgl }) => {
        if (cancelled || !containerRef.current) return
        mapboxgl.accessToken = TOKEN

        const map = new mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [longitude, latitude],
          zoom,
          attributionControl: false,
          cooperativeGestures: true,
        })
        mapRef.current = map

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
        map.addControl(
          new mapboxgl.AttributionControl({ compact: true }),
          'bottom-right'
        )

        // Editorial gold pin
        const el = document.createElement('div')
        el.style.width = '18px'
        el.style.height = '18px'
        el.style.borderRadius = '50%'
        el.style.background = '#C8A96A'
        el.style.boxShadow = '0 0 0 6px rgba(200,169,106,0.18), 0 0 0 12px rgba(200,169,106,0.08)'
        el.style.transform = 'translateY(0)'
        el.style.cursor = 'pointer'

        new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([longitude, latitude])
          .addTo(map)

        map.on('load', () => {
          if (!cancelled) setStatus('ready')
          // Soften land/water tones towards the editorial palette
          try {
            map.setPaintProperty('water', 'fill-color', '#0E0E0E')
            map.setPaintProperty('background', 'background-color', '#0A0A0A')
          } catch { /* style layer names can vary */ }
        })
      })
      .catch(() => {
        if (!cancelled) setStatus('missing')
      })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude, zoom])

  const mapboxHref = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  if (status === 'missing' || !TOKEN) {
    return (
      <div
        className="relative overflow-hidden bg-surface-low border border-outline-variant/30"
        style={{ height }}
      >
        <div
          className="absolute inset-0 tech-grid opacity-20"
          style={{ backgroundSize: '32px 32px' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(200,169,106,0.08) 0%, transparent 60%)',
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
          <div className="diamond">
            <MapPin className="w-5 h-5 text-gold" strokeWidth={1.4} />
          </div>
          <div>
            <div className="eyebrow-sm mb-2">Location</div>
            <div className="font-display text-2xl md:text-3xl font-light text-on-surface">
              {label || city}
            </div>
            <div className="text-on-surface-variant text-sm mt-1 font-mono">
              {latitude.toFixed(4)}°N · {longitude.toFixed(4)}°E
            </div>
          </div>
          <a
            href={mapboxHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 eyebrow-sm text-gold hover:text-gold-light transition-colors"
          >
            Open in maps
            <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
          </a>
        </div>
        {/* Subtle scan-lines at bottom for editorial feel */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] tracking-[0.3em] uppercase text-on-surface-variant">
          <span>{city}</span>
          <span>{country}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden border border-outline-variant/30" style={{ height }}>
      <div ref={containerRef} className="absolute inset-0" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-low">
          <div className="eyebrow-sm text-on-surface-variant animate-pulse">
            Loading map…
          </div>
        </div>
      )}
      {/* Bottom overlay label */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
        <div>
          <div className="eyebrow-sm text-gold mb-1">Location</div>
          <div className="font-display text-xl text-on-surface drop-shadow-lg">
            {label || city}
          </div>
        </div>
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-on-surface-variant bg-bg/50 backdrop-blur px-3 py-1.5">
          {latitude.toFixed(4)}°N · {longitude.toFixed(4)}°E
        </div>
      </div>
    </div>
  )
}
