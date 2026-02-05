/**
 * Compare old and new product data and extract only changed fields
 * @param {Object} oldProduct - Original product data
 * @param {Object} newProduct - Updated product data
 * @returns {Object} Object with field names as keys and {old, new} as values
 */
const compareProductChanges = (oldProduct, newProduct) => {
  const changes = {}
  
  // Fields to track for changes
  const trackableFields = [
    'brand',
    'sku',
    'category',
    'inventory',
    'price',
    'oldPrice',
    'description',
    'images',
    'caseMaterial',
    'dialColor',
    'waterResistance',
    'warrantyPeriod',
    'movement',
    'gender',
    'strapColor',
    'caseShape',
    'caseSize',
  ]
  
  // Convert both to plain objects for comparison
  const oldData = oldProduct.toObject ? oldProduct.toObject() : oldProduct
  const newData = newProduct.toObject ? newProduct.toObject() : newProduct
  
  // Compare each trackable field
  for (const field of trackableFields) {
    const oldValue = oldData[field]
    const newValue = newData[field]
    
    // Handle different data types
    if (field === 'images') {
      // Compare arrays
      const oldImages = Array.isArray(oldValue) ? oldValue : []
      const newImages = Array.isArray(newValue) ? newValue : []
      const oldImagesStr = JSON.stringify(oldImages.sort())
      const newImagesStr = JSON.stringify(newImages.sort())
      
      if (oldImagesStr !== newImagesStr) {
        changes[field] = {
          old: oldImages,
          new: newImages,
        }
      }
    } else if (field === 'inventory' || field === 'price' || field === 'oldPrice') {
      // Compare numbers (handle null/undefined)
      const oldNum = oldValue ?? 0
      const newNum = newValue ?? 0
      
      if (oldNum !== newNum) {
        changes[field] = {
          old: oldNum,
          new: newNum,
        }
      }
    } else {
      // Compare strings (handle null/undefined/empty)
      const oldStr = oldValue ?? ''
      const newStr = newValue ?? ''
      
      if (oldStr !== newStr) {
        changes[field] = {
          old: oldStr,
          new: newStr,
        }
      }
    }
  }
  
  // Only return if there are changes
  return Object.keys(changes).length > 0 ? changes : null
}

module.exports = { compareProductChanges }

