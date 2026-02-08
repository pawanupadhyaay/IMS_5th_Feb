/**
 * Brand Display Utility
 * 
 * Normalizes brand names for UI display by removing trailing "watch" or "watches"
 * Full brand name remains in DB and API responses
 * 
 * Examples:
 * "Just Cavali Watch" → "Just Cavali"
 * "Calvin Klein Watches" → "Calvin Klein"
 * "Armani Exchange Watch" → "Armani Exchange"
 * "Casio" → "Casio"
 * 
 * @param {string} brand - Full brand name from product/log
 * @returns {string} - Normalized brand name for display
 */
export function getDisplayBrand(brand) {
  if (!brand || typeof brand !== 'string') {
    return ''
  }

  const trimmed = brand.trim()
  if (!trimmed) return ''

  // Remove trailing "watch" or "watches" (case-insensitive)
  // Only if they appear at the end of the string
  const match = trimmed.match(/^(.*?)(?:\s+watch(?:es)?)$/i)
  if (match && match[1]) {
    return match[1].trim()
  }

  return trimmed
}

