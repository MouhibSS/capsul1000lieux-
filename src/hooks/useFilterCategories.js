import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFilterCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error: err } = await supabase
        .from('filter_categories')
        .select('*')
        .order('category_type, display_order')

      if (err) throw err
      setCategories(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (key, label, categoryType, parentKey = null) => {
    try {
      const { data, error: err } = await supabase
        .from('filter_categories')
        .insert([{ key, label, category_type: categoryType, parent_key: parentKey }])
        .select()

      if (err) throw err
      setCategories([...categories, data[0]])
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateCategory = async (id, updates) => {
    try {
      const { data, error: err } = await supabase
        .from('filter_categories')
        .update(updates)
        .eq('id', id)
        .select()

      if (err) throw err
      setCategories(categories.map(c => c.id === id ? data[0] : c))
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteCategory = async (id) => {
    try {
      const { error: err } = await supabase
        .from('filter_categories')
        .delete()
        .eq('id', id)

      if (err) throw err
      setCategories(categories.filter(c => c.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
