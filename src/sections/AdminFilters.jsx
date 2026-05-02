import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, ChevronDown, Grid3X3, LayoutList, Edit2 } from 'lucide-react'
import { useFilterCategories } from '../hooks/useFilterCategories'

const CATEGORY_TYPES = [
  { value: 'placeType', label: 'Place Type', accent: 'text-gold' },
  { value: 'architectureStyle', label: 'Architecture', accent: 'text-purple-400' },
  { value: 'decorationStyle', label: 'Decoration', accent: 'text-pink-400' },
  { value: 'amenity', label: 'Amenities', accent: 'text-emerald-400' },
  { value: 'typedemande', label: 'Type de Demande', accent: 'text-blue-400' },
  { value: 'maxpersons', label: 'Max Persons', accent: 'text-amber-400' },
]

export default function AdminFilters() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useFilterCategories()
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [viewMode, setViewMode] = useState('tree')
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    categoryType: 'placeType',
    parentKey: null,
  })

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!formData.key || !formData.label) return

    try {
      if (editingId) {
        await updateCategory(editingId, {
          label: formData.label,
          key: formData.key,
        })
        setEditingId(null)
      } else {
        // No parent set => the new filter itself becomes a parent (parent_key = null)
        await addCategory(
          formData.key,
          formData.label,
          formData.categoryType,
          formData.parentKey || null
        )
      }
      setFormData({ key: '', label: '', categoryType: 'placeType', parentKey: null })
      setShowAddForm(false)
    } catch (err) {
      console.error('Failed to save category:', err)
      alert(`Failed to save: ${err.message || err}`)
    }
  }

  const handleStartEdit = (cat) => {
    setFormData({
      key: cat.key,
      label: cat.label,
      categoryType: cat.category_type,
      parentKey: cat.parent_key,
    })
    setEditingId(cat.id)
    setShowAddForm(true)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ key: '', label: '', categoryType: 'placeType', parentKey: null })
    setShowAddForm(false)
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        await deleteCategory(id)
      } catch (err) {
        console.error('Failed to delete category:', err)
        alert(`Failed to delete: ${err.message || err}`)
      }
    }
  }

  const getChildren = (parentKey) => categories.filter(c => c.parent_key === parentKey)

  const renderCategoryTree = (parentCategories) => (
    <div className="space-y-1">
      {parentCategories.map((cat) => {
        const children = getChildren(cat.key)
        const isExpanded = expandedCategories.has(cat.id)
        const toggleExpand = (id) => setExpandedCategories(prev => {
          const next = new Set(prev)
          next.has(id) ? next.delete(id) : next.add(id)
          return next
        })

        return (
          <div key={cat.id}>
            <div
              className="flex items-center gap-1 px-3 py-2 bg-surface-low/30 hover:bg-surface-low/50 rounded text-sm transition-colors cursor-pointer"
              onClick={() => children.length > 0 && toggleExpand(cat.id)}
            >
              {children.length > 0 ? (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-3 h-3 text-on-surface-variant" strokeWidth={2} />
                </motion.div>
              ) : (
                <span className="w-3 h-3 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface text-xs truncate">{cat.label}</p>
                <p className="text-[10px] text-on-surface-variant">{cat.key}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleStartEdit(cat) }}
                className="p-1 hover:text-gold transition-colors flex-shrink-0"
              >
                <Edit2 className="w-3 h-3" strokeWidth={1.5} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id) }}
                className="p-1 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3 h-3" strokeWidth={1.5} />
              </button>
            </div>

            {isExpanded && children.length > 0 && (
              <div className="ml-4 mt-1 space-y-1 border-l border-outline-variant/20 pl-1">
                {renderCategoryTree(children)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  if (loading) {
    return <div className="text-center py-10 text-on-surface-variant text-sm">Loading...</div>
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex border border-outline-variant/40 rounded">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('tree')}
              className={`p-1.5 transition-colors ${viewMode === 'tree' ? 'text-gold bg-gold/10' : 'text-on-surface-variant hover:text-gold'}`}
            >
              <LayoutList className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors border-l border-outline-variant/40 ${viewMode === 'list' ? 'text-gold bg-gold/10' : 'text-on-surface-variant hover:text-gold'}`}
            >
              <Grid3X3 className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gold text-bg font-medium rounded hover:bg-gold-light transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Add
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-3 border border-gold/30 rounded-lg bg-gold/5"
        >
          <form onSubmit={handleAddCategory} className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="px-3 py-1.5 text-sm bg-surface-low border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                placeholder="Key (e.g. modern_villa)"
                disabled={editingId}
              />
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="px-3 py-1.5 text-sm bg-surface-low border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                placeholder="Label (e.g. Modern Villa)"
              />
            </div>
            {!editingId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <select
                  value={formData.categoryType}
                  onChange={(e) => setFormData({ ...formData, categoryType: e.target.value, parentKey: null })}
                  className="px-3 py-1.5 text-sm bg-surface-low border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                >
                  {CATEGORY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <select
                  value={formData.parentKey || ''}
                  onChange={(e) => setFormData({ ...formData, parentKey: e.target.value || null })}
                  className="px-3 py-1.5 text-sm bg-surface-low border border-outline-variant/40 rounded text-on-surface outline-none focus:border-gold transition-colors"
                >
                  <option value="">No parent — make this a parent</option>
                  {categories
                    .filter(c => c.category_type === formData.categoryType && !c.parent_key)
                    .map(c => (
                      <option key={c.id} value={c.key}>↳ child of {c.label}</option>
                    ))
                  }
                </select>
              </div>
            )}
            {!editingId && !formData.parentKey && (
              <p className="text-[10px] text-gold/70 italic">
                ✦ No parent selected — this filter will become a top-level parent in <span className="font-medium">{CATEGORY_TYPES.find(t => t.value === formData.categoryType)?.label}</span>.
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-gold text-bg font-medium rounded hover:bg-gold-light transition-colors"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-sm border border-outline-variant/40 text-on-surface-variant rounded hover:text-gold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Content — one section per category type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CATEGORY_TYPES.map(type => {
          const parents = categories.filter(c => c.category_type === type.value && !c.parent_key)
          return (
            <div key={type.value}>
              <h3 className={`text-xs font-medium uppercase mb-2 ${type.accent}`}>{type.label}</h3>
              <div className="border border-outline-variant/25 rounded-lg p-3 min-h-[60px]">
                {parents.length > 0 ? (
                  renderCategoryTree(parents)
                ) : (
                  <p className="text-xs text-on-surface-variant">No categories</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {CATEGORY_TYPES.map(type => (
          <div key={type.value} className="bg-surface-low rounded-lg p-3 border border-outline-variant/25">
            <p className="text-on-surface-variant text-[10px] font-medium mb-1 uppercase tracking-wider">{type.label}</p>
            <p className={`font-display text-2xl font-light ${type.accent}`}>
              {categories.filter(c => c.category_type === type.value).length}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
