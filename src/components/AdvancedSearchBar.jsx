import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocations } from '../hooks/useLocations'

// ─────────────────────────────────────────────────────────────────
// Filter data — modeled on 20000lieux.com
// (Gouvernorat / Ville keep Tunisia values)
// ─────────────────────────────────────────────────────────────────

// All filter_categories keys are globally unique (FK constraint),
// so we prefix per type: gov_*, type_*, arch_*, deco_*.
// Cities stay as plain strings (not in filter_categories).

export const GOVERNORATES_GROUPED = [
  { section: 'Grand Tunis',  options: [
    { key: 'gov_tunis',       label: 'Tunis' },
    { key: 'gov_ariana',      label: 'Ariana' },
    { key: 'gov_ben_arous',   label: 'Ben Arous' },
    { key: 'gov_manouba',     label: 'Manouba' },
  ]},
  { section: 'Nord-Est',     options: [
    { key: 'gov_nabeul',      label: 'Nabeul' },
    { key: 'gov_zaghouan',    label: 'Zaghouan' },
    { key: 'gov_bizerte',     label: 'Bizerte' },
  ]},
  { section: 'Nord-Ouest',   options: [
    { key: 'gov_beja',        label: 'Béja' },
    { key: 'gov_jendouba',    label: 'Jendouba' },
    { key: 'gov_le_kef',      label: 'Le Kef' },
    { key: 'gov_siliana',     label: 'Siliana' },
  ]},
  { section: 'Centre-Est',   options: [
    { key: 'gov_sousse',      label: 'Sousse' },
    { key: 'gov_monastir',    label: 'Monastir' },
    { key: 'gov_mahdia',      label: 'Mahdia' },
    { key: 'gov_sfax',        label: 'Sfax' },
  ]},
  { section: 'Centre-Ouest', options: [
    { key: 'gov_kairouan',    label: 'Kairouan' },
    { key: 'gov_kasserine',   label: 'Kasserine' },
    { key: 'gov_sidi_bouzid', label: 'Sidi Bouzid' },
  ]},
  { section: 'Sud-Est',      options: [
    { key: 'gov_gabes',       label: 'Gabès' },
    { key: 'gov_medenine',    label: 'Médenine' },
    { key: 'gov_tataouine',   label: 'Tataouine' },
  ]},
  { section: 'Sud-Ouest',    options: [
    { key: 'gov_gafsa',       label: 'Gafsa' },
    { key: 'gov_tozeur',      label: 'Tozeur' },
    { key: 'gov_kebili',      label: 'Kébili' },
  ]},
]
export const GOVERNORATES = GOVERNORATES_GROUPED.flatMap((g) => g.options)

// Cities are plain text (locations.city is not FK). Keys here are governorate keys.
export const CITIES_BY_GOVERNORATE = {
  gov_tunis:       ['Tunis', 'Carthage', 'Sidi Bou Said', 'La Marsa', 'La Goulette'],
  gov_ariana:      ['Ariana', 'Raoued', 'Soukra'],
  gov_ben_arous:   ['Ben Arous', 'Hammam Lif', 'Radès'],
  gov_manouba:     ['Manouba', 'Den Den'],
  gov_nabeul:      ['Nabeul', 'Hammamet', 'Kelibia', 'Korba', 'Dar Chaabane'],
  gov_zaghouan:    ['Zaghouan', 'Zriba'],
  gov_bizerte:     ['Bizerte', 'Menzel Bourguiba', 'Ras Jebel'],
  gov_beja:        ['Béja', 'Téboursouk', 'Medjez el-Bab'],
  gov_jendouba:    ['Jendouba', 'Tabarka', 'Aïn Draham', 'Bou Salem'],
  gov_le_kef:      ['Le Kef', 'Dahmani', 'Tajerouine'],
  gov_siliana:     ['Siliana', 'Bou Arada', 'Gaâfour'],
  gov_kairouan:    ['Kairouan', 'Sbikha', 'Haffouz'],
  gov_kasserine:   ['Kasserine', 'Sbeitla', 'Fériana'],
  gov_sidi_bouzid: ['Sidi Bouzid', 'Regueb', 'Menzel Bouzaiene'],
  gov_sousse:      ['Sousse', 'Hammam Sousse', 'Akouda', 'Kalâa Kebira'],
  gov_monastir:    ['Monastir', 'Ksar Hellal', 'Moknine', 'Skanès'],
  gov_mahdia:      ['Mahdia', 'Ksour Essef', 'Chebba'],
  gov_sfax:        ['Sfax', 'Sakiet Ezzit', 'Thyna'],
  gov_gabes:       ['Gabès', 'Mareth', 'Métouia'],
  gov_medenine:    ['Médenine', 'Djerba', 'Houmt Souk', 'Zarzis', 'Ben Gardane'],
  gov_tataouine:   ['Tataouine', 'Remada', 'Ghomrassen'],
  gov_gafsa:       ['Gafsa', 'Métlaoui', 'Redeyef'],
  gov_tozeur:      ['Tozeur', 'Nefta', 'Degache'],
  gov_kebili:      ['Kébili', 'Douz', 'Souk Lahad'],
}

// ── Type de lieu — values from 20000lieux.com ────────────────────
export const PLACE_TYPES_GROUPED = [
  {
    section: 'Habitations',
    options: [
      { key: 'type_appartement',          label: 'Appartement' },
      { key: 'type_loft',                 label: 'Loft' },
      { key: 'type_duplex',               label: 'Duplex / triplex' },
      { key: 'type_hlm',                  label: 'HLM' },
      { key: 'type_penthouse',            label: 'Penthouse' },
      { key: 'type_atelier_artiste',      label: "Atelier d'artiste" },
      { key: 'type_bateau_peniche',       label: 'Bateau-Péniche' },
      { key: 'type_demeure_chateau',      label: 'Demeure et château' },
      { key: 'type_hotel_particulier',    label: 'Hôtel particulier' },
      { key: 'type_ferme',                label: 'Ferme' },
      { key: 'type_chalet',               label: 'Chalet' },
      { key: 'type_maison_architecte',    label: "Maison d'architecte (XXe)" },
      { key: 'type_maison',               label: 'Maison / Maison de ville' },
      { key: 'type_mas',                  label: 'Mas' },
      { key: 'type_pavillon',             label: 'Pavillon' },
      { key: 'type_immeuble',             label: 'Immeuble' },
      { key: 'type_ile',                  label: 'Île' },
      { key: 'type_rooftop',              label: 'Rooftop' },
      { key: 'type_parties_communes',     label: 'Parties communes' },
    ],
  },
  {
    section: 'Bureaux',
    options: [
      { key: 'type_open_space',       label: 'Open space' },
      { key: 'type_bureaux',          label: 'Bureaux' },
      { key: 'type_bureaux_ministere',label: 'Bureaux ministère' },
    ],
  },
  {
    section: 'Edifice religieux',
    options: [
      { key: 'type_abbaye',           label: 'Abbaye / couvent' },
      { key: 'type_eglise',           label: 'Eglise / chapelle' },
      { key: 'type_cimetiere',        label: 'Cimetière' },
    ],
  },
  {
    section: 'Entrepôt / Carrière',
    options: [
      { key: 'type_entrepot',         label: 'Entrepôt / Hangar / Usine' },
      { key: 'type_carriere',         label: 'Carrière' },
      { key: 'type_atelier_couture',  label: 'Atelier de couture' },
      { key: 'type_serre',            label: 'Serre' },
    ],
  },
  {
    section: 'Bâtiments Public',
    options: [
      { key: 'type_bibliotheque',     label: 'Bibliothèque' },
      { key: 'type_centre_culturel',  label: 'Centre culturel' },
      { key: 'type_commissariat',     label: 'Commissariat' },
      { key: 'type_creche',           label: 'Crèche' },
      { key: 'type_ecole',            label: 'Ecole / Collège / Lycée' },
      { key: 'type_fort_militaire',   label: 'Fort militaire / Tranchées' },
      { key: 'type_mairie',           label: 'Mairie' },
      { key: 'type_musee',            label: 'Musée' },
      { key: 'type_prison',           label: 'Prison' },
      { key: 'type_salle_des_fetes',  label: 'Salle des fêtes' },
      { key: 'type_tribunal',         label: 'Tribunal' },
    ],
  },
  {
    section: 'Santé',
    options: [
      { key: 'type_cabinet_medical',  label: 'Cabinets médicaux' },
      { key: 'type_hopital',          label: 'Hôpital' },
      { key: 'type_pharmacie',        label: 'Pharmacie' },
      { key: 'type_maison_retraite',  label: 'Maison de retraite' },
    ],
  },
  {
    section: 'Transport',
    options: [
      { key: 'type_aviation',         label: 'Aviation' },
      { key: 'type_train_locomotive', label: 'Train Wagon Locomotive' },
      { key: 'type_car_wash',         label: 'Car Wash / Station de lavage' },
      { key: 'type_casse_auto',       label: 'Casse auto' },
      { key: 'type_garage',           label: 'Garage' },
      { key: 'type_circuit_auto',     label: 'Circuit automobile' },
      { key: 'type_parking',          label: 'Parking' },
    ],
  },
]
export const PLACE_TYPES = PLACE_TYPES_GROUPED.flatMap((g) => g.options)

// ── Architecture — modeled on 20000lieux ────────────────────────
export const ARCHITECTURES_GROUPED = [
  {
    section: 'Styles historiques',
    options: [
      { key: 'arch_medieval',     label: 'Médiéval' },
      { key: 'arch_renaissance',  label: 'Renaissance' },
      { key: 'arch_baroque',      label: 'Baroque' },
      { key: 'arch_classique',    label: 'Classique' },
      { key: 'arch_neoclassique', label: 'Néoclassique' },
    ],
  },
  {
    section: '19e — 20e siècle',
    options: [
      { key: 'arch_haussmannien', label: 'Haussmannien' },
      { key: 'arch_art_nouveau',  label: 'Art Nouveau' },
      { key: 'arch_art_deco',     label: 'Art Déco' },
      { key: 'arch_bauhaus',      label: 'Bauhaus' },
      { key: 'arch_moderniste',   label: 'Moderniste' },
    ],
  },
  {
    section: 'Moderne / Contemporain',
    options: [
      { key: 'arch_industriel',    label: 'Industriel' },
      { key: 'arch_brutaliste',    label: 'Brutaliste' },
      { key: 'arch_minimaliste',   label: 'Minimaliste' },
      { key: 'arch_contemporain',  label: 'Contemporain' },
      { key: 'arch_loft',          label: 'Loft' },
    ],
  },
  {
    section: 'Régional / Vernaculaire',
    options: [
      { key: 'arch_mediterraneen', label: 'Méditerranéen' },
      { key: 'arch_provencal',     label: 'Provençal' },
      { key: 'arch_tudor',         label: 'Tudor' },
      { key: 'arch_colombages',    label: 'Maison à colombages' },
      { key: 'arch_mas',           label: 'Mas' },
      { key: 'arch_riad',          label: 'Riad' },
    ],
  },
]
export const ARCHITECTURES = ARCHITECTURES_GROUPED.flatMap((g) => g.options)

// ── Décoration — split into two rows ─────────────────────────────
export const DECORATIONS_GROUPED = [
  {
    section: 'Époques & styles classiques',
    options: [
      { key: 'deco_anglaise',         label: "A l'anglaise" },
      { key: 'deco_vintage',          label: 'Vintage' },
      { key: 'deco_baroque',          label: 'Baroque' },
      { key: 'deco_classique_xviii',  label: 'Classique (17-18-19è)' },
      { key: 'deco_art_deco_nouveau', label: 'Art déco / Art nouveau' },
      { key: 'deco_provencal',        label: 'Provençal' },
      { key: 'deco_basque',           label: 'Basque' },
      { key: 'deco_campagne',         label: 'Campagne / Rustique' },
      { key: 'deco_defraichi',        label: 'Défraîchi / Pâtiné' },
      { key: 'deco_exotique_med',     label: 'Exotique / méditerranéen' },
      { key: 'deco_industriel_ny',    label: 'Industriel / New-York' },
      { key: 'deco_scandinave',       label: 'Scandinave' },
    ],
  },
  {
    section: 'Modernes & ambiances',
    options: [
      { key: 'deco_contemporaine',  label: 'Contemporaine' },
      { key: 'deco_design',         label: 'Design' },
      { key: 'deco_epure',          label: 'Epuré' },
      { key: 'deco_luxueux',        label: 'Luxueux' },
      { key: 'deco_deco',           label: 'Déco' },
      { key: 'deco_middle_class',   label: 'Middle Class' },
      { key: 'deco_boheme',         label: 'Bohème' },
      { key: 'deco_noir_blanc',     label: 'Noir / blanc' },
      { key: 'deco_colore',         label: 'Coloré' },
      { key: 'deco_vegetal',        label: 'Végétal' },
      { key: 'deco_vide',           label: 'Vide' },
    ],
  },
]
export const DECORATIONS = DECORATIONS_GROUPED.flatMap((g) => g.options)

// ── Budget — 20000lieux-style daily ranges ───────────────────────
export const BUDGETS = [
  { key: 'lt500',       label: '< 500 €/jour',          min: 0,     max: 500 },
  { key: '500-1000',    label: '500 – 1 000 €/jour',    min: 500,   max: 1000 },
  { key: '1000-2500',   label: '1 000 – 2 500 €/jour',  min: 1000,  max: 2500 },
  { key: '2500-5000',   label: '2 500 – 5 000 €/jour',  min: 2500,  max: 5000 },
  { key: '5000-10000',  label: '5 000 – 10 000 €/jour', min: 5000,  max: 10000 },
  { key: 'gt10000',     label: '10 000 + €/jour',       min: 10000, max: 999999 },
]
export const BUDGETS_GROUPED = [{ section: 'Budget journalier', options: BUDGETS }]

const BUDGET_RANGE = Object.fromEntries(BUDGETS.map((o) => [o.key, [o.min, o.max]]))

export function buildCitySections(governorates) {
  const govs = governorates.length === 0 ? Object.keys(CITIES_BY_GOVERNORATE) : governorates
  return govs
    .filter((g) => CITIES_BY_GOVERNORATE[g])
    .map((g) => {
      const govLabel = GOVERNORATES.find(gov => gov.key === g)?.label || g
      return { section: govLabel, options: CITIES_BY_GOVERNORATE[g] }
    })
}

// ── Compute matching count given filter state ────────────────────
export function applyFilters(locations, f) {
  let result = locations
  if (f.governorates?.length) {
    result = result.filter((l) => {
      if (l.governorate) return f.governorates.includes(l.governorate)
      const cityGov = Object.entries(CITIES_BY_GOVERNORATE).find(([, cs]) => cs.includes(l.city))?.[0]
      return cityGov && f.governorates.includes(cityGov)
    })
  }
  if (f.cities?.length)        result = result.filter((l) => f.cities.includes(l.city))

  // Filter by place types — support both single type and array of type keys
  if (f.types?.length) {
    result = result.filter((l) => {
      const placeTypeKeys = l.place_type_keys || (l.type ? [l.type] : [])
      return f.types.some(t => placeTypeKeys.includes(t))
    })
  }

  // Filter by architecture styles — support both single style and array of style keys
  if (f.architectures?.length) {
    result = result.filter((l) => {
      const archStyleKeys = l.architecture_style_keys || (l.architecture_style ? [l.architecture_style] : [])
      return f.architectures.some(a => archStyleKeys.includes(a))
    })
  }

  // Filter by decoration styles — support both single style and array of style keys
  if (f.decorations?.length) {
    result = result.filter((l) => {
      const decoStyleKeys = l.decoration_style_keys || (l.decoration_style ? [l.decoration_style] : [])
      return f.decorations.some(d => decoStyleKeys.includes(d))
    })
  }

  if (f.budgets?.length)       result = result.filter((l) => f.budgets.some((b) => {
    const [min, max] = BUDGET_RANGE[b] || [0, 999999]
    return l.price >= min && l.price < max
  }))

  // Keyword filtering — search in name, city, description, and tags
  if (f.keyword && f.keyword.trim()) {
    const q = f.keyword.trim().toLowerCase()
    result = result.filter((l) => {
      const nameMatch = (l.name || '').toLowerCase().includes(q)
      const cityMatch = (l.city || '').toLowerCase().includes(q)
      const descMatch = (l.description || '').toLowerCase().includes(q)
      const tagsMatch = (l.tags || []).some(tag => tag.toLowerCase().includes(q))
      return nameMatch || cityMatch || descMatch || tagsMatch
    })
  }

  return result
}

// ─────────────────────────────────────────────────────────────────
// Internal — Filter pill (closed state)
// ─────────────────────────────────────────────────────────────────

function FilterPill({ label, count, isOpen, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex-1 min-w-0 flex items-center justify-between gap-2 px-4 py-3.5 rounded-lg border backdrop-blur-sm transition-all duration-300 ease-out ${
        isOpen
          ? 'bg-surface-container/90 border-gold/70 text-gold z-10 shadow-lg shadow-gold/10 ring-1 ring-gold/20'
          : 'bg-surface-low/80 border-outline-variant/30 text-on-surface hover:border-gold/50 hover:bg-surface-low hover:text-gold hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <span className="flex items-center gap-2 text-xs md:text-sm font-light truncate">
        {label}
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-semibold rounded-full bg-gold text-bg shadow-sm"
          >
            {count}
          </motion.span>
        )}
      </span>
      <ChevronDown
        className={`w-3 h-3 shrink-0 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180 text-gold' : 'text-on-surface-variant group-hover:text-gold'}`}
        strokeWidth={1.8}
      />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────
// Internal — Sectioned multi-column checkbox list
// ─────────────────────────────────────────────────────────────────

const COL_CLASSES = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

function CheckboxGrid({ sections, selected, onToggle, getKey, getLabel, columns = 4 }) {
  return (
    <div className={`grid ${COL_CLASSES[columns] || COL_CLASSES[4]} gap-x-6 gap-y-1`}>
      {sections.map((sec) => (
        <div key={sec.section} className="break-inside-avoid mb-4">
          <div className="text-on-surface font-semibold text-[13px] tracking-wide mb-2 pb-1 border-b border-outline-variant/20">{sec.section}</div>
          <div className="space-y-0.5">
            {sec.options.map((opt) => {
              const k = getKey(opt)
              const lbl = getLabel(opt)
              const active = selected.includes(k)
              return (
                <label
                  key={k}
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer text-[13px] font-light transition-all duration-200 ${
                    active
                      ? 'text-gold bg-gold/5'
                      : 'text-on-surface-variant hover:text-gold hover:bg-gold/5'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-all duration-200 ${
                    active
                      ? 'bg-gold border-gold scale-100'
                      : 'border-on-surface-variant/50 group-hover:border-gold/60'
                  }`}>
                    {active && (
                      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-bg" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onToggle(k)}
                    className="sr-only"
                  />
                  <span className="truncate">{lbl}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Sectioned dropdown — kept exported for backward compat
// ─────────────────────────────────────────────────────────────────

export function SectionedDropdown({ icon: Icon, label, sections, selected, onToggle, onClear, getKey, getLabel }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative flex-1 min-w-[140px]">
      <FilterPill label={label} count={selected.length} isOpen={open} onClick={() => setOpen((v) => !v)} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface-low/95 backdrop-blur-md border border-outline-variant/30 rounded-xl z-30 max-h-[460px] overflow-y-auto shadow-2xl shadow-black/20 min-w-[280px] p-4"
          >
            {selected.length > 0 && (
              <div className="flex items-center justify-end mb-2">
                <button onClick={onClear} className="text-[10px] tracking-[0.25em] uppercase text-gold hover:text-gold-light transition-colors duration-200">Effacer</button>
              </div>
            )}
            <CheckboxGrid sections={sections} selected={selected} onToggle={onToggle} getKey={getKey} getLabel={getLabel} columns={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Composed search bar — 20000lieux-style
// ─────────────────────────────────────────────────────────────────

export default function AdvancedSearchBar({
  initial = {},
  mode = 'navigate',          // 'navigate' (Home → Explore) | 'controlled' (Explore — sync with parent)
  value,                       // when mode === 'controlled', filter state from parent
  onChange,                    // (next) => void   — called on every filter change
  resultsCount,                // optional — overrides internal count when provided
}) {
  const navigate = useNavigate()
  const { locations } = useLocations()
  const containerRef = useRef(null)

  // Controlled vs internal state
  const isControlled = mode === 'controlled' && value && onChange
  const [internal, setInternal] = useState({
    governorates:  initial.governorates  || [],
    cities:        initial.cities        || [],
    types:         initial.types         || [],
    architectures: initial.architectures || [],
    decorations:   initial.decorations   || [],
    budgets:       initial.budgets       || [],
    keyword:       initial.keyword       || '',
  })
  const state = isControlled ? value : internal
  const setField = (field) => (next) => {
    const merged = { ...state, [field]: next }
    if (isControlled) onChange(merged)
    else setInternal(merged)
  }
  const toggleField = (field) => (k) => {
    const cur = state[field] || []
    const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]
    setField(field)(next)
  }
  const clearAll = () => {
    const empty = { governorates: [], cities: [], types: [], architectures: [], decorations: [], budgets: [], keyword: '' }
    if (isControlled) onChange(empty)
    else setInternal(empty)
  }

  const totalActive =
    state.governorates.length + state.cities.length + state.types.length +
    state.architectures.length + state.decorations.length + state.budgets.length +
    (state.keyword ? 1 : 0)

  // Live count
  const liveCount = useMemo(() => {
    if (typeof resultsCount === 'number') return resultsCount
    return applyFilters(locations, state).length
  }, [locations, state, resultsCount])

  // Open panel
  const [openId, setOpenId] = useState(null)
  const closePanel = () => setOpenId(null)

  // Outside click
  useEffect(() => {
    if (!openId) return
    const onDown = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) closePanel() }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openId])

  const citySections = useMemo(() => buildCitySections(state.governorates), [state.governorates])

  const filters = [
    { id: 'gouvernorat', label: 'Gouvernorat',  sections: GOVERNORATES_GROUPED, selected: state.governorates,  onToggle: toggleField('governorates'),  onClear: () => setField('governorates')([]),  getKey: (o) => o.key, getLabel: (o) => o.label, columns: 3 },
    { id: 'ville',       label: 'Ville',         sections: citySections,         selected: state.cities,        onToggle: toggleField('cities'),        onClear: () => setField('cities')([]),        getKey: (o) => o,     getLabel: (o) => o,     columns: 4 },
    { id: 'type',        label: 'Type de lieu',  sections: PLACE_TYPES_GROUPED,  selected: state.types,         onToggle: toggleField('types'),         onClear: () => setField('types')([]),         getKey: (o) => o.key, getLabel: (o) => o.label, columns: 4 },
    { id: 'architecture',label: 'Architecture',  sections: ARCHITECTURES_GROUPED,selected: state.architectures, onToggle: toggleField('architectures'), onClear: () => setField('architectures')([]), getKey: (o) => o.key, getLabel: (o) => o.label, columns: 4 },
    { id: 'decoration',  label: 'Décoration',    sections: DECORATIONS_GROUPED,  selected: state.decorations,   onToggle: toggleField('decorations'),   onClear: () => setField('decorations')([]),   getKey: (o) => o.key, getLabel: (o) => o.label, columns: 4 },
    { id: 'budget',      label: 'Budget',        sections: BUDGETS_GROUPED,      selected: state.budgets,       onToggle: toggleField('budgets'),       onClear: () => setField('budgets')([]),       getKey: (o) => o.key, getLabel: (o) => o.label, columns: 2 },
  ]

  const openFilter = filters.find((f) => f.id === openId)

  const handleApply = () => {
    closePanel()
    if (mode === 'navigate') {
      const params = new URLSearchParams()
      if (state.governorates.length)  params.set('governorate',  state.governorates.join(','))
      if (state.cities.length)        params.set('city',         state.cities.join(','))
      if (state.types.length)         params.set('type',         state.types.join(','))
      if (state.architectures.length) params.set('architecture', state.architectures.join(','))
      if (state.decorations.length)   params.set('decoration',   state.decorations.join(','))
      if (state.budgets.length)       params.set('budget',       state.budgets.join(','))
      if (state.keyword)              params.set('q',            state.keyword)
      navigate(`/explore?${params.toString()}`)
    }
  }

  return (
    <div ref={containerRef} className="w-full">
      {/* ─── Pill row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
        {filters.map((f) => (
          <FilterPill
            key={f.id}
            label={f.label}
            count={f.selected.length}
            isOpen={openId === f.id}
            onClick={() => setOpenId(openId === f.id ? null : f.id)}
          />
        ))}

        {/* Mots-clés keyword input — full width on mobile, last cell on desktop */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/60 group-focus-within:text-gold transition-colors duration-300 pointer-events-none" strokeWidth={1.8} />
          <input
            type="text"
            value={state.keyword}
            onChange={(e) => setField('keyword')(e.target.value)}
            placeholder="Mots-clés"
            className="w-full pl-9 pr-9 py-3.5 bg-surface-low/80 backdrop-blur-sm border border-outline-variant/30 rounded-lg text-on-surface text-xs md:text-sm font-light placeholder:text-on-surface-variant/60 focus:outline-none focus:border-gold/60 focus:bg-surface-low focus:shadow-md focus:shadow-gold/5 hover:border-gold/40 transition-all duration-300 ease-out"
          />
          {state.keyword && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={() => setField('keyword')('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-on-surface-variant hover:text-gold hover:bg-gold/10 transition-all duration-200"
              aria-label="Clear keyword"
            >
              <X className="w-3 h-3" strokeWidth={1.8} />
            </motion.button>
          )}
        </div>
      </div>

      {/* ─── Dropdown panel — full width below pills ─── */}
      <AnimatePresence>
        {openFilter && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden mt-2"
          >
            <div className="bg-surface-low/95 backdrop-blur-md border border-outline-variant/30 rounded-xl shadow-2xl shadow-black/20 overflow-hidden">
              <div className="p-5 md:p-7 max-h-[60vh] overflow-y-auto">
                <CheckboxGrid
                  sections={openFilter.sections}
                  selected={openFilter.selected}
                  onToggle={openFilter.onToggle}
                  getKey={openFilter.getKey}
                  getLabel={openFilter.getLabel}
                  columns={openFilter.columns}
                />
              </div>

              {/* Bottom action bar */}
              <div className="flex items-center justify-center gap-6 md:gap-8 px-5 md:px-7 py-4 border-t border-outline-variant/20 bg-bg/30 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={handleApply}
                  className="inline-flex items-center gap-2 bg-gold text-bg px-7 md:px-10 py-3 md:py-3.5 rounded-lg text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-gold-light hover:shadow-lg hover:shadow-gold/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
                >
                  <Search className="w-3.5 h-3.5" strokeWidth={1.8} />
                  Afficher les résultats ({liveCount})
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={totalActive === 0}
                  className={`text-[10px] md:text-[11px] uppercase tracking-[0.25em] underline-offset-4 transition-colors duration-200 ${
                    totalActive > 0 ? 'text-on-surface hover:text-gold underline' : 'text-on-surface-variant/40 cursor-not-allowed'
                  }`}
                >
                  Effacer les filtres
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Persistent results-count bar (only on Home/navigate mode) ─── */}
      {mode === 'navigate' && !openFilter && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 flex items-center justify-between gap-3 flex-wrap"
        >
          <span className="eyebrow-sm text-on-surface-variant">
            {liveCount} {liveCount === 1 ? 'lieu correspond' : 'lieux correspondent'}
            {totalActive > 0 && ` · ${totalActive} filtre${totalActive > 1 ? 's' : ''} actif${totalActive > 1 ? 's' : ''}`}
          </span>
          <div className="flex items-center gap-3">
            {totalActive > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[10px] tracking-[0.25em] uppercase text-on-surface-variant hover:text-gold transition-colors duration-200 underline-offset-4 underline"
              >
                Effacer les filtres
              </button>
            )}
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-2 bg-gold text-bg px-6 md:px-8 py-3 rounded-lg text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-gold-light hover:shadow-lg hover:shadow-gold/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
            >
              <Search className="w-3.5 h-3.5" strokeWidth={1.8} />
              Afficher les résultats ({liveCount})
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
