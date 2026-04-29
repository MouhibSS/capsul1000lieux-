import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, X, Image as ImageIcon } from 'lucide-react'
import { useLocationPieces } from '../hooks/useLocationPieces'
import { supabase } from '../lib/supabase'

export default function AdminLocationPieces({ locationId }) {
  const { fetchPieces, addPiece, deletePiece, updatePieceImages, loading } = useLocationPieces()
  const [pieces, setPieces] = useState([])
  const [newSubsection, setNewSubsection] = useState({ interior: { en: '', fr: '' }, exterior: { en: '', fr: '' } })
  const [editingPieceId, setEditingPieceId] = useState(null)
  const [imageInput, setImageInput] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (locationId) {
      loadPieces()
    }
  }, [locationId])

  const loadPieces = async () => {
    const data = await fetchPieces(locationId)
    setPieces(data)
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddSubsection = async (section) => {
    const nameEn = newSubsection[section].en.trim()
    const nameFr = newSubsection[section].fr.trim()

    if (!nameEn || !nameFr) {
      showToast('Veuillez entrer les noms en anglais et français', 'error')
      return
    }

    try {
      const { data, error: err } = await supabase
        .from('location_pieces')
        .insert([{
          location_id: locationId,
          section,
          subsection: nameEn,
          name_en: nameEn,
          name_fr: nameFr,
          image_urls: []
        }])
        .select()
        .single()

      if (err) throw err
      await loadPieces()
      setNewSubsection({ interior: { en: '', fr: '' }, exterior: { en: '', fr: '' } })
      showToast(`${nameEn} ajouté`)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDeletePiece = async (pieceId) => {
    if (!window.confirm('Supprimer cette section?')) return
    try {
      await deletePiece(pieceId)
      await loadPieces()
      showToast('Section supprimée')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleAddImage = async (pieceId) => {
    if (!imageInput.trim()) {
      showToast('Veuillez entrer une URL', 'error')
      return
    }

    const piece = pieces.find(p => p.id === pieceId)
    const urls = [...(piece.image_urls || []), imageInput]

    try {
      await updatePieceImages(pieceId, urls)
      await loadPieces()
      setImageInput('')
      setEditingPieceId(null)
      showToast('Image ajoutée')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleRemoveImage = async (pieceId, index) => {
    const piece = pieces.find(p => p.id === pieceId)
    const urls = piece.image_urls.filter((_, i) => i !== index)

    try {
      await updatePieceImages(pieceId, urls)
      await loadPieces()
      showToast('Image supprimée')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const groupedPieces = {
    interior: pieces.filter(p => p.section === 'interior'),
    exterior: pieces.filter(p => p.section === 'exterior'),
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
              toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {['interior', 'exterior'].map((section) => (
        <div key={section} className="border border-outline-variant/25 rounded-lg overflow-hidden">
          {/* Section Header */}
          <div className="px-4 py-3 bg-surface-low border-b border-outline-variant/25 flex items-center justify-between">
            <h3 className="font-display text-sm uppercase tracking-wide text-on-surface capitalize">
              {section}
            </h3>
            <span className="text-xs text-on-surface-variant">
              {groupedPieces[section].length} subsection{groupedPieces[section].length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Add new subsection */}
          <div className="p-4 border-b border-outline-variant/15 bg-bg/50 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newSubsection[section].en}
                onChange={(e) => setNewSubsection({
                  ...newSubsection,
                  [section]: { ...newSubsection[section], en: e.target.value }
                })}
                placeholder={`English (ex: ${section === 'interior' ? 'Kitchen' : 'Pool'})`}
                className="px-3 py-2 text-xs bg-bg border border-outline-variant/40 rounded text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-gold transition-colors"
              />
              <input
                type="text"
                value={newSubsection[section].fr}
                onChange={(e) => setNewSubsection({
                  ...newSubsection,
                  [section]: { ...newSubsection[section], fr: e.target.value }
                })}
                placeholder={`Français (ex: ${section === 'interior' ? 'Cuisine' : 'Piscine'})`}
                className="px-3 py-2 text-xs bg-bg border border-outline-variant/40 rounded text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-gold transition-colors"
              />
            </div>
            <button
              onClick={() => handleAddSubsection(section)}
              disabled={loading}
              className="w-full px-3 py-2 bg-gold text-bg text-xs font-medium rounded hover:bg-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add Subsection
            </button>
          </div>

          {/* Subsections list */}
          <div className="divide-y divide-outline-variant/15">
            {groupedPieces[section].length > 0 ? (
              groupedPieces[section].map((piece) => (
                <div key={piece.id} className="p-4 space-y-3">
                  {/* Subsection header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-on-surface text-sm">
                        {piece.name_en} / {piece.name_fr}
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        EN: {piece.name_en} — FR: {piece.name_fr}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePiece(piece.id)}
                      disabled={loading}
                      className="p-1.5 text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Images grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {piece.image_urls?.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`${piece.subsection} ${idx}`}
                          className="w-full h-20 object-cover rounded border border-outline-variant/25"
                        />
                        <button
                          onClick={() => handleRemoveImage(piece.id, idx)}
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full transition-opacity"
                        >
                          <X className="w-3 h-3" strokeWidth={2} />
                        </button>
                      </div>
                    ))}

                    {/* Add image button */}
                    {editingPieceId === piece.id ? (
                      <div className="col-span-3 sm:col-span-4 space-y-2">
                        <input
                          type="text"
                          value={imageInput}
                          onChange={(e) => setImageInput(e.target.value)}
                          placeholder="https://cdn.example.com/image.jpg"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddImage(piece.id)}
                          className="w-full px-3 py-2 text-xs bg-bg border border-outline-variant/40 rounded text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-gold transition-colors"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddImage(piece.id)}
                            disabled={loading}
                            className="flex-1 px-2 py-1.5 bg-gold text-bg text-xs font-medium rounded hover:bg-gold-light transition-colors disabled:opacity-50"
                          >
                            Ajouter
                          </button>
                          <button
                            onClick={() => {
                              setEditingPieceId(null)
                              setImageInput('')
                            }}
                            className="px-3 py-1.5 border border-outline-variant/40 text-on-surface-variant text-xs rounded hover:border-gold transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingPieceId(piece.id)}
                        className="h-20 border-2 border-dashed border-outline-variant/40 rounded hover:border-gold hover:bg-gold/5 flex items-center justify-center transition-colors"
                      >
                        <ImageIcon className="w-5 h-5 text-on-surface-variant" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-on-surface-variant">
                    {piece.image_urls?.length || 0} image{(piece.image_urls?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-on-surface-variant text-xs">
                Aucune subsection. Ajoutez-en une ci-dessus.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
