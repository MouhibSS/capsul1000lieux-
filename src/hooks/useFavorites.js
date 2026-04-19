import { useState, useEffect } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('capsul_favorites') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('capsul_favorites', JSON.stringify(favorites))
  }, [favorites])

  const toggle = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const isFavorite = (id) => favorites.includes(id)

  return { favorites, toggle, isFavorite }
}
