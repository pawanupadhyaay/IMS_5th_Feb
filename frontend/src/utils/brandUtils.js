/**
 * Brand Display Utility
 *
 * UI-only formatting helper. Does NOT change how brands are stored in DB or sent via API.
 *
 * Rules:
 * - Trim whitespace
 * - If the last word is "watch" or "watches" (any casing), remove that word
 *   - Examples:
 *     "Alexandre Watches" → "Alexandre"
 *     "Titan Watch" → "Titan"
 * - Only remove when "watch"/"watches" is the FINAL word
 *   - "Just Cavalli"        → "Just Cavalli"
 *   - "Calvin Klein"        → "Calvin Klein"
 *   - "Titan Watch Co."     → "Titan Watch Co." (unchanged)
 * - Preserve original casing and internal spacing (apart from normalizing outer whitespace)
 *
 * @param {string} brand - Full brand name from product/log
 * @returns {string} - Cleaned brand name for display
 */
export function getDisplayBrand(brand) {
  if (!brand || typeof brand !== 'string') {
    return ''
  }

  const trimmed = brand.trim()
  if (!trimmed) return ''

  const parts = trimmed.split(/\s+/)
  if (parts.length === 0) return ''

  const lastWord = parts[parts.length - 1]

  // If the last word is "watch" or "watches" (case-insensitive), drop it
  if (/^watches?$/i.test(lastWord)) {
    parts.pop()
    const cleaned = parts.join(' ').trim()
    // Fallback: if everything was removed, return original trimmed brand
    return cleaned || trimmed
  }

  return trimmed
}

