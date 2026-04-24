/**
 * Filter utilities for hierarchical category matching
 */

/**
 * Check if a location matches a selected place type filter path
 * @param {Array<string>} locationPath - The location's place_type_path (e.g., ['residential', 'villa'])
 * @param {Array<string>} selectedPath - The user's selected path (e.g., ['residential'])
 * @returns {boolean}
 */
export const matchesPlaceTypePath = (locationPath, selectedPath) => {
  if (!locationPath || !selectedPath || selectedPath.length === 0) return true

  return (
    locationPath.slice(0, selectedPath.length).join('/') ===
    selectedPath.join('/')
  )
}

/**
 * Check if a location matches selected place type filters
 * @param {Array<string>} locationPath - Location's place_type_path
 * @param {Array<Array<string>>} selectedPaths - Array of selected paths
 * @returns {boolean}
 */
export const matchesAnyPlaceTypePath = (locationPath, selectedPaths) => {
  if (!selectedPaths || selectedPaths.length === 0) return true
  return selectedPaths.some(path => matchesPlaceTypePath(locationPath, path))
}

/**
 * Check if a location matches any selected architecture style
 * @param {string} locationStyle - Location's architecture_style
 * @param {Array<string>} selectedStyles - Array of selected architecture styles
 * @returns {boolean}
 */
export const matchesArchitectureStyle = (locationStyle, selectedStyles) => {
  if (!selectedStyles || selectedStyles.length === 0) return true
  if (!locationStyle) return false
  return selectedStyles.includes(locationStyle)
}

/**
 * Filter locations by hierarchical place type and architecture
 * @param {Array} locations - Array of location objects
 * @param {Array<Array<string>>} placeTypeFilters - Selected place type paths
 * @param {Array<string>} architectureFilters - Selected architecture styles
 * @returns {Array}
 */
export const filterLocationsByHierarchy = (
  locations,
  placeTypeFilters = [],
  architectureFilters = []
) => {
  return locations.filter(location => {
    const matchesPlaceType = matchesAnyPlaceTypePath(
      location.place_type_path,
      placeTypeFilters
    )
    const matchesArchitecture = matchesArchitectureStyle(
      location.architecture_style,
      architectureFilters
    )

    return matchesPlaceType && matchesArchitecture
  })
}
