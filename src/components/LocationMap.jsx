import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Lock, Plus, Minus, Maximize2 } from 'lucide-react'

/**
 * LocationMap — clean, readable privacy-area map.
 * Leaflet + CARTO Voyager (free, no key — bright streets + labels).
 * Shows a soft gold halo around the area; exact pin is only revealed
 * after a booking is confirmed.
 */
export default function LocationMap({
  latitude,
  longitude,
  label,
  city,
  country = 'Tunisia',
  height = 520,
  zoom = 14,
  radius = 800,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (latitude == null || longitude == null) return
    let cancelled = false

    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([{ default: L }]) => {
      if (cancelled || !containerRef.current) return

      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      const map = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
        dragging: true,
        doubleClickZoom: true,
        touchZoom: true,
        tap: true,
      })
      mapRef.current = map

      // CARTO Voyager — bright, very clear streets + labels (free, no key)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map)

      // Soft outer halo
      L.circle([latitude, longitude], {
        radius: radius * 1.5,
        color: 'transparent',
        fillColor: '#C8A96A',
        fillOpacity: 0.08,
        interactive: false,
      }).addTo(map)

      // Primary privacy ring
      L.circle([latitude, longitude], {
        radius,
        color: '#A8884A',
        weight: 2,
        opacity: 0.9,
        fillColor: '#C8A96A',
        fillOpacity: 0.18,
        interactive: false,
      }).addTo(map)

      // Inner brighter ring
      L.circle([latitude, longitude], {
        radius: radius * 0.45,
        color: '#8B6F2E',
        weight: 1.25,
        opacity: 0.6,
        fillColor: '#E8C98A',
        fillOpacity: 0.18,
        interactive: false,
      }).addTo(map)

      // Animated pulse marker
      const pulseIcon = L.divIcon({
        className: 'capsul-pulse-icon',
        html: '<span class="capsul-pulse"></span><span class="capsul-pulse-mid"></span><span class="capsul-pulse-core"></span>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })
      L.marker([latitude, longitude], {
        icon: pulseIcon,
        interactive: false,
        keyboard: false,
      }).addTo(map)

      map.fitBounds(
        L.latLng(latitude, longitude).toBounds(radius * 2.6),
        { padding: [32, 32] }
      )

      // Force a paint after layout settles — fixes blank tile issue
      const t1 = setTimeout(() => map.invalidateSize(), 120)
      const t2 = setTimeout(() => { map.invalidateSize(); setReady(true) }, 400)

      // Re-invalidate on resize
      const ro = new ResizeObserver(() => map.invalidateSize())
      ro.observe(containerRef.current)

      map._capsulCleanup = () => {
        clearTimeout(t1); clearTimeout(t2); ro.disconnect()
      }
    })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current._capsulCleanup?.()
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude, zoom, radius])

  // Re-fit when fullscreen toggles
  useEffect(() => {
    if (!mapRef.current) return
    setTimeout(() => mapRef.current.invalidateSize(), 320)
  }, [isFullscreen])

  const zoomIn = () => mapRef.current?.zoomIn()
  const zoomOut = () => mapRef.current?.zoomOut()
  const recenter = () => {
    if (!mapRef.current || latitude == null) return
    import('leaflet').then(({ default: L }) => {
      mapRef.current.flyToBounds(
        L.latLng(latitude, longitude).toBounds(radius * 2.6),
        { padding: [32, 32], duration: 0.8 }
      )
    })
  }

  // Fallback when no coords
  if (latitude == null || longitude == null) {
    return (
      <div
        className="relative overflow-hidden bg-surface-low border border-outline-variant/30 rounded-lg flex items-center justify-center"
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

  const latApprox = Math.round(latitude * 100) / 100
  const lngApprox = Math.round(longitude * 100) / 100
  const latStr = `${Math.abs(latApprox).toFixed(2)}°${latApprox >= 0 ? 'N' : 'S'}`
  const lngStr = `${Math.abs(lngApprox).toFixed(2)}°${lngApprox >= 0 ? 'E' : 'W'}`

  const wrapperClass = isFullscreen
    ? 'fixed inset-0 z-[2000] bg-bg'
    : 'relative w-full'
  const wrapperStyle = isFullscreen ? {} : { height }

  return (
    <>
      <style>{`
        .capsul-pulse-icon { background: transparent; border: none; }
        .capsul-pulse, .capsul-pulse-mid {
          position: absolute; inset: 0;
          border-radius: 50%;
          background: rgba(200,169,106,0.45);
          transform: scale(0.3);
        }
        .capsul-pulse { animation: capsulPulse 2.4s cubic-bezier(0.4,0,0.2,1) infinite; }
        .capsul-pulse-mid { animation: capsulPulse 2.4s cubic-bezier(0.4,0,0.2,1) infinite 0.8s; }
        .capsul-pulse-core {
          position: absolute; left: 50%; top: 50%;
          width: 14px; height: 14px;
          margin: -7px 0 0 -7px;
          border-radius: 50%;
          background: #C8A96A;
          border: 2px solid #FFF8EC;
          box-shadow: 0 2px 8px rgba(200,169,106,0.6), 0 0 0 1px rgba(0,0,0,0.15);
        }
        @keyframes capsulPulse {
          0%   { transform: scale(0.3); opacity: 0.85; }
          80%  { transform: scale(2.6); opacity: 0; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .capsul-map-wrap { isolation: isolate; }
        .capsul-map-wrap .leaflet-container {
          background: #f4ecd8;
          font-family: inherit;
          outline: none;
        }
        .capsul-map-wrap .leaflet-control-attribution {
          background: rgba(255,255,255,0.7) !important;
          backdrop-filter: blur(6px);
          font-size: 9px !important;
          padding: 2px 6px !important;
          border-radius: 2px;
        }
        .capsul-map-wrap .leaflet-control-attribution a { color: #6B5A38 !important; }
      `}</style>

      <div
        className={`capsul-map-wrap ${wrapperClass} overflow-hidden border border-outline-variant/30 bg-surface-low rounded-lg`}
        style={wrapperStyle}
      >
        {/* Tile container */}
        <div ref={containerRef} className="absolute inset-0 z-0" />

        {/* Loading shim */}
        {!ready && (
          <div className="absolute inset-0 z-[300] flex items-center justify-center bg-surface-low/40 backdrop-blur-[2px] pointer-events-none">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-on-surface-variant">
                Loading map
              </span>
            </div>
          </div>
        )}

        {/* Subtle bottom gradient — reserves legibility for the info panel */}
        <div
          className="absolute bottom-0 inset-x-0 h-32 z-[400] pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.55), transparent)' }}
        />

        {/* TOP — pill stack (responsive) */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-[401] flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-bg/85 backdrop-blur-md border border-gold/30 rounded-full shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.28em] uppercase text-gold whitespace-nowrap">
              Approximate area
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-bg/85 backdrop-blur-md border border-outline-variant/30 rounded-full shadow-lg">
            <Navigation className="w-3 h-3 text-on-surface-variant" strokeWidth={1.6} />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-on-surface-variant whitespace-nowrap">
              {latStr} · {lngStr}
            </span>
          </div>
        </div>

        {/* RIGHT — control rail */}
        <div className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 z-[401] flex flex-col gap-1.5">
          <MapBtn onClick={zoomIn} label="Zoom in"><Plus size={15} /></MapBtn>
          <MapBtn onClick={zoomOut} label="Zoom out"><Minus size={15} /></MapBtn>
          <div className="h-1" />
          <MapBtn onClick={recenter} label="Recenter"><Navigation size={13} /></MapBtn>
          <MapBtn
            onClick={() => setIsFullscreen(v => !v)}
            label={isFullscreen ? 'Close fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <span className="text-[14px] leading-none">×</span> : <Maximize2 size={13} />}
          </MapBtn>
        </div>

        {/* BOTTOM — info card */}
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-14 sm:right-20 z-[401]">
          <div className="bg-bg/90 backdrop-blur-xl border border-outline-variant/30 rounded-xl p-3 sm:p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-3 sm:w-4 h-px bg-gold" />
              <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-gold">
                Location
              </span>
            </div>
            <div className="font-display text-base sm:text-xl md:text-2xl font-light text-on-surface leading-tight truncate">
              {label || city}
            </div>
            <div className="flex items-center justify-between gap-3 mt-1.5 sm:mt-2">
              <div className="text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-[0.18em] font-light truncate">
                {city}{country ? ` · ${country}` : ''}
              </div>
              <div className="hidden xs:flex items-center gap-1.5 shrink-0 px-2 py-0.5 sm:py-1 bg-gold/10 border border-gold/25 rounded-full">
                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold" strokeWidth={1.6} />
                <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] uppercase text-gold whitespace-nowrap">
                  ~{Math.round(radius)}m
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function MapBtn({ children, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-bg/90 hover:bg-bg backdrop-blur-md border border-outline-variant/30 hover:border-gold/50 text-on-surface hover:text-gold rounded-lg shadow-lg transition-all active:scale-95"
    >
      {children}
    </button>
  )
}
