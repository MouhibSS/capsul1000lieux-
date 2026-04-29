import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useLocationPieces() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPieces = useCallback(async (locationId) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('location_pieces')
        .select('*')
        .eq('location_id', locationId)
        .order('section', { ascending: true })
        .order('display_order', { ascending: true })

      if (err) throw err
      return data || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const addPiece = useCallback(async (locationId, section, subsection) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('location_pieces')
        .insert([{ location_id: locationId, section, subsection, image_urls: [] }])
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePiece = useCallback(async (pieceId) => {
    try {
      setLoading(true)
      setError(null)
      const { error: err } = await supabase
        .from('location_pieces')
        .delete()
        .eq('id', pieceId)

      if (err) throw err
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePieceImages = useCallback(async (pieceId, imageUrls) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('location_pieces')
        .update({ image_urls: imageUrls })
        .eq('id', pieceId)
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    fetchPieces,
    addPiece,
    deletePiece,
    updatePieceImages,
    loading,
    error,
  }
}
