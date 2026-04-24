import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react'
import { useFilterCategories } from '../hooks/useFilterCategories'

const ease = [0.22, 1, 0.36, 1]

export default function AdminFilters() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useFilterCategories()
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
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
      await addCategory(
        formData.key,
        formData.label,
        formData.categoryType,
        formData.parentKey
      )
      setFormData({ key: '', label: '', categoryType: 'placeType', parentKey: null })
      setShowAddForm(false)
    } catch (err) {
      console.error('Failed to add category:', err)
    }
  }

  const handleUpdateCategory = async (id, updates) => {
    try {
      await updateCategory(id, updates)
      setEditingId(null)
    } catch (err) {
      console.error('Failed to update category:', err)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id)
      } catch (err) {
        console.error('Failed to delete category:', err)
      }
    }
  }

  const placeTypeCategories = categories.filter(c => c.category_type === 'placeType')
  const architectureCategories = categories.filter(c => c.category_type === 'architecture')

  const renderCategoryTree = (parentCategories) => {
    return (
      <div className="space-y-2">
        {parentCategories.map((cat) => {
          const childCategories = categories.filter(c => c.parent_key === cat.key)
          const isExpanded = expandedCategory === cat.id

          return (
            <div key={cat.id} className="border border-outline-variant/30 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 p-4 bg-surface-low/30 hover:bg-surface-low/50 transition-colors">
                {childCategories.length > 0 && (
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                    className="p-1"
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-on-surface-variant" strokeWidth={1.5} />
                    </motion.div>
                  </button>
                )}
                <div className="flex-1">
                  <p className="font-medium text-on-surface">{cat.label}</p>
                  <p className="text-xs text-on-surface-variant">Key: {cat.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(cat.id)}
                    className="p-2 text-on-surface-variant hover:text-gold transition-colors"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-on-surface-variant hover:text-red-400 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {isExpanded && childCategories.length > 0 && (
                <div className="p-4 bg-surface-container/20 border-t border-outline-variant/20 ml-4">
                  {renderCategoryTree(childCategories)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg pt-32">
        <div className="container-main text-center">
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="min-h-screen bg-bg pt-32 pb-16"
    >
      <div className="container-main max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease }}
          className="mb-12"
        >
          <h1 className="font-display font-light text-6xl md:text-7xl text-on-surface uppercase tracking-display mb-4">
            Filter Categories
          </h1>
          <p className="text-on-surface-variant font-light">
            Manage hierarchical filter categories for the Explore page
          </p>
        </motion.div>

        {/* Add Category Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 border border-gold/30 rounded-lg bg-gold/5"
          >
            <h2 className="font-display text-2xl font-light text-on-surface uppercase tracking-wide mb-4">
              Add New Category
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant uppercase mb-2">
                  Key (internal identifier)
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  className="w-full bg-surface-low border border-outline-variant/40 text-on-surface px-4 py-2 text-sm outline-none focus:border-gold transition-colors"
                  placeholder="e.g., villa, photo_studio"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant uppercase mb-2">
                  Label (display name)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-surface-low border border-outline-variant/40 text-on-surface px-4 py-2 text-sm outline-none focus:border-gold transition-colors"
                  placeholder="e.g., Villa"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant uppercase mb-2">
                    Category Type
                  </label>
                  <select
                    value={formData.categoryType}
                    onChange={(e) => setFormData({ ...formData, categoryType: e.target.value })}
                    className="w-full bg-surface-low border border-outline-variant/40 text-on-surface px-4 py-2 text-sm outline-none focus:border-gold transition-colors"
                  >
                    <option value="placeType">Place Type</option>
                    <option value="architecture">Architecture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant uppercase mb-2">
                    Parent Category (optional)
                  </label>
                  <select
                    value={formData.parentKey || ''}
                    onChange={(e) => setFormData({ ...formData, parentKey: e.target.value || null })}
                    className="w-full bg-surface-low border border-outline-variant/40 text-on-surface px-4 py-2 text-sm outline-none focus:border-gold transition-colors"
                  >
                    <option value="">None</option>
                    {categories
                      .filter(c => c.category_type === formData.categoryType && !c.parent_key)
                      .map(c => (
                        <option key={c.id} value={c.key}>{c.label}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold text-bg font-medium text-sm uppercase tracking-[0.15em] hover:bg-gold-light transition-colors"
                >
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 border border-outline-variant/40 text-on-surface-variant font-medium text-sm uppercase tracking-[0.15em] hover:text-gold hover:border-gold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {!showAddForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            className="mb-8 px-6 py-3 bg-gold text-bg font-medium uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-gold-light transition-colors"
          >
            <Plus className="w-5 h-5" strokeWidth={1.5} />
            Add Category
          </motion.button>
        )}

        {/* Place Type Categories */}
        <div className="mb-12">
          <h2 className="font-display text-3xl font-light text-on-surface uppercase tracking-wide mb-6">
            Place Type Categories
          </h2>
          {placeTypeCategories.length > 0 ? (
            renderCategoryTree(placeTypeCategories.filter(c => !c.parent_key))
          ) : (
            <p className="text-on-surface-variant">No place type categories yet</p>
          )}
        </div>

        {/* Architecture Categories */}
        <div>
          <h2 className="font-display text-3xl font-light text-on-surface uppercase tracking-wide mb-6">
            Architecture Categories
          </h2>
          {architectureCategories.length > 0 ? (
            renderCategoryTree(architectureCategories.filter(c => !c.parent_key))
          ) : (
            <p className="text-on-surface-variant">No architecture categories yet</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
