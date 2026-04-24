import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function CategoryNode({ path, name, label, level = 0, selected = [], onToggle, children }) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = children && Object.keys(children).length > 0
  const currentPath = [...path, name]
  const isSelected = selected.some(s => s.join('/') === currentPath.join('/'))

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(v => !v)
    } else {
      onToggle(currentPath)
    }
  }

  return (
    <div>
      <motion.div
        onClick={handleClick}
        whileHover={{ x: 2 }}
        className={`w-full text-left flex items-center justify-between transition-colors cursor-pointer rounded select-none ${
          isSelected
            ? 'bg-gold/15 text-gold font-medium'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-low/40'
        }`}
        style={{ paddingLeft: `${12 + level * 14}px`, paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px' }}
      >
        <span className="text-sm flex-1">{label}</span>
        {hasChildren ? (
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-2 flex-shrink-0"
          >
            <ChevronRight className="w-3.5 h-3.5 opacity-60" strokeWidth={2} />
          </motion.div>
        ) : isSelected ? (
          <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
        ) : null}
      </motion.div>

      {hasChildren && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-l border-outline-variant/20 ml-4"
            >
              {Object.entries(children).map(([childKey, childData]) => (
                <CategoryNode
                  key={childKey}
                  path={currentPath}
                  name={childKey}
                  label={childData.label}
                  level={level + 1}
                  selected={selected}
                  onToggle={onToggle}
                  children={childData.children}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

export default function HierarchicalFilters({ category, onFilterChange, selected = [] }) {
  const handleToggle = (path) => {
    const pathStr = path.join('/')
    const newSelected = selected.filter(s => s.join('/') !== pathStr)
    if (newSelected.length === selected.length) newSelected.push(path)
    onFilterChange(newSelected)
  }

  return (
    <div className="border border-outline-variant/25 rounded-lg bg-surface-low/10 overflow-hidden py-1">
      {Object.entries(category.children).map(([key, data], idx, arr) => (
        <div key={key} className={idx < arr.length - 1 ? 'border-b border-outline-variant/10' : ''}>
          <CategoryNode
            path={[]}
            name={key}
            label={data.label}
            level={0}
            selected={selected}
            onToggle={handleToggle}
            children={data.children}
          />
        </div>
      ))}
    </div>
  )
}
