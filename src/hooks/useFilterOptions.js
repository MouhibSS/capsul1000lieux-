import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

export function useFilterOptions() {
  const [allCategories, setAllCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFilters()
  }, [])

  const fetchFilters = async () => {
    try {
      const { data, error: err } = await supabase
        .from('filter_categories')
        .select('key, label, category_type, parent_key, display_order')
        .eq('enabled', true)
        .order('display_order', { ascending: true })

      if (err) throw err
      setAllCategories(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching filter options:', err)
    } finally {
      setLoading(false)
    }
  }

  // Build a key->label lookup map across all categories
  const labelMap = useMemo(() => {
    const map = {}
    allCategories.forEach(cat => { map[cat.key] = cat.label })
    return map
  }, [allCategories])

  // Flat per-type lists (kept for backward compatibility)
  const filters = useMemo(() => {
    const grouped = {
      placeType: [],
      architectureStyle: [],
      decorationStyle: [],
      amenity: [],
      typeDemande: [],
      maxPersons: [],
    }
    allCategories.forEach(cat => {
      const item = { key: cat.key, label: cat.label }
      if (cat.category_type === 'placeType') grouped.placeType.push(item)
      else if (cat.category_type === 'architectureStyle') grouped.architectureStyle.push(item)
      else if (cat.category_type === 'decorationStyle') grouped.decorationStyle.push(item)
      else if (cat.category_type === 'amenity') grouped.amenity.push(item)
      else if (cat.category_type === 'typedemande') grouped.typeDemande.push(item)
      else if (cat.category_type === 'maxpersons') grouped.maxPersons.push(item)
    })
    return grouped
  }, [allCategories])

  // Sectioned (parent → children) — for hierarchical dropdowns
  // Returns { [type]: [{ section, sectionKey, options:[{key,label}] }] }
  // Top-level rows (parent_key=null) become section headers; orphans (rows
  // whose parent_key doesn't resolve) get bucketed into "Autres".
  const sectioned = useMemo(() => {
    const types = ['placeType', 'architectureStyle', 'decorationStyle', 'amenity', 'typedemande', 'maxpersons']
    const result = {}
    for (const type of types) {
      const rows = allCategories.filter(c => c.category_type === type)
      const parents = rows.filter(r => !r.parent_key)
      const children = rows.filter(r => r.parent_key)
      const parentKeys = new Set(parents.map(p => p.key))

      if (parents.length === 0) {
        // Flat list — single unnamed section
        result[type] = rows.length > 0
          ? [{ section: 'Tous', options: rows.map(r => ({ key: r.key, label: r.label })) }]
          : []
        continue
      }

      const sections = parents.map(p => {
        const kids = children.filter(c => c.parent_key === p.key)
        return {
          section: p.label,
          sectionKey: p.key,
          // If a parent has no children, expose the parent itself as a selectable option
          // so admins immediately see new parents in the dropdown.
          options: kids.length > 0
            ? kids.map(c => ({ key: c.key, label: c.label }))
            : [{ key: p.key, label: p.label }],
        }
      })

      // Bucket orphans (children whose parent_key isn't a known parent)
      const orphans = children.filter(c => !parentKeys.has(c.parent_key))
      if (orphans.length > 0) {
        sections.push({
          section: 'Autres',
          options: orphans.map(o => ({ key: o.key, label: o.label })),
        })
      }

      result[type] = sections
    }
    return result
  }, [allCategories])

  const getLabel = (key) => labelMap[key] || key

  return { filters, sectioned, labelMap, getLabel, loading, error, refetch: fetchFilters }
}
