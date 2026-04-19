const CDN_BASE = 'https://1000lieuxtn.b-cdn.net'

/**
 * Generate CDN image URL with optional optimization
 * @param {string} path - Path relative to CDN root (e.g., 'locations/location-01.jpg')
 * @param {object} options - Optimization options
 * @returns {string} Full CDN URL
 */
export const getCDNUrl = (path, options = {}) => {
  const { width, quality = 80, format = 'auto' } = options

  const url = new URL(`${CDN_BASE}/${path}`)

  if (width) url.searchParams.set('width', width)
  url.searchParams.set('quality', quality)
  if (format) url.searchParams.set('auto', format)

  return url.toString()
}

/**
 * Get location image URL (with responsive sizing)
 */
export const getLocationImageUrl = (locationId, imageIndex = 1, width = 800) => {
  const imageName = `location-${String(imageIndex).padStart(2, '0')}.jpg`
  return getCDNUrl(`locations/${imageName}`, { width, quality: 85 })
}

/**
 * Get hero image URL
 */
export const getHeroImageUrl = (heroIndex = 1) => {
  const imageName = `hero-${String(heroIndex).padStart(2, '0')}.jpg`
  return getCDNUrl(`hero/${imageName}`, { width: 1920, quality: 85 })
}

/**
 * Get category image URL
 */
export const getCategoryImageUrl = (category) => {
  return getCDNUrl(`categories/${category}.jpg`, { width: 600, quality: 80 })
}

/**
 * Get featured image URL
 */
export const getFeaturedImageUrl = (index) => {
  const imageName = `featured-${String(index).padStart(2, '0')}.jpg`
  return getCDNUrl(`featured/${imageName}`, { width: 800, quality: 80 })
}

/**
 * Get amenity icon URL
 */
export const getAmenityImageUrl = (amenity) => {
  return getCDNUrl(`amenities/${amenity}.png`, { width: 300, quality: 90 })
}

/**
 * Get about image URL
 */
export const getAboutImageUrl = (index) => {
  const imageName = `about-${String(index).padStart(2, '0')}.jpg`
  return getCDNUrl(`about/${imageName}`, { width: 800, quality: 80 })
}

/**
 * Get studio image URL
 */
export const getStudioImageUrl = (index) => {
  const imageName = `studio-${String(index).padStart(2, '0')}.jpg`
  return getCDNUrl(`studio/${imageName}`, { width: 800, quality: 80 })
}
