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

  // Derived: group rows into { [type]: [{ section, sectionKey, options:[{key,label,metadata}] }, ...] }
  // Mirrors the *_GROUPED arrays in AdvancedSearchBar so SectionedDropdown can consume it.
  const enabled = categories.filter((c) => c.enabled !== false)
  const byType = {}
  for (const r of enabled) {
    if (!byType[r.category_type]) byType[r.category_type] = { parents: [], children: {} }
    if (!r.parent_key) byType[r.category_type].parents.push(r)
    else {
      const m = byType[r.category_type].children
      if (!m[r.parent_key]) m[r.parent_key] = []
      m[r.parent_key].push(r)
    }
  }
  const groupedByType = {}
  for (const [type, { parents, children }] of Object.entries(byType)) {
    if (parents.length === 0) {
      const flat = enabled.filter((r) => r.category_type === type)
      groupedByType[type] = [{ section: type, options: flat.map((r) => ({ key: r.key, label: r.label, metadata: r.metadata })) }]
    } else {
      groupedByType[type] = parents.map((p) => ({
        section: p.label,
        sectionKey: p.key,
        options: (children[p.key] || []).map((c) => ({ key: c.key, label: c.label, metadata: c.metadata })),
      }))
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
    groupedByType,
  }
}
