import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useLocationPieces } from '../hooks/useLocationPieces'
import { useLanguage, useTranslation } from '../context/LanguageContext'

export default function LocationPieces({ locationId }) {
  const { lang } = useLanguage()
  const t = useTranslation('pieces')
  const { fetchPieces, loading } = useLocationPieces()
  const [pieces, setPieces] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  const getSubsectionName = (piece) => {
    if (lang === 'fr') {
      return piece.name_fr || piece.subsection
    }
    return piece.name_en || piece.subsection
  }

  const getSectionName = (section) => {
    return t[section] || section
  }

  useEffect(() => {
    loadPieces()
  }, [locationId])

  const loadPieces = async () => {
    const data = await fetchPieces(locationId)
    setPieces(data)
  }

  if (loading) return null

  const groupedPieces = {
    interior: pieces.filter(p => p.section === 'interior'),
    exterior: pieces.filter(p => p.section === 'exterior'),
  }

  if (pieces.length === 0) return null

  return (
    <div className="space-y-12">
      {['interior', 'exterior'].map((section) => {
        const sectionPieces = groupedPieces[section]
        if (sectionPieces.length === 0) return null

        return (
          <div key={section} className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-2xl font-light text-on-surface uppercase tracking-wide">
                {getSectionName(section)}
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gold/50 to-transparent" />
            </div>

            <div className="space-y-8">
              {sectionPieces.map((piece) => (
                <div key={piece.id} className="space-y-3">
                  <h4 className="text-lg font-light text-on-surface">
                    {getSubsectionName(piece)}
                  </h4>

                  {piece.image_urls && piece.image_urls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {piece.image_urls.map((url, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => setSelectedImage({ url, subsection: piece.subsection })}
                          whileHover={{ scale: 1.02 }}
                          className="group relative overflow-hidden rounded-lg aspect-square"
                        >
                          <img
                            src={url}
                            alt={`${piece.subsection} ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          <div className="absolute top-0 left-0 right-0 px-3 py-2 bg-gradient-to-b from-black/60 to-transparent">
                            <p className="text-white text-xs font-semibold uppercase tracking-wider">
                              {getSubsectionName(piece)}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-surface-low border border-outline-variant/25 rounded-lg text-on-surface-variant text-sm">
                      No images added yet
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function Lightbox({ image, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] w-full"
      >
        <img
          src={image.url}
          alt={image.subsection}
          className="w-full h-full object-contain"
        />
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-gold transition-colors"
        >
          <X className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </motion.div>
    </motion.div>
  )
}
