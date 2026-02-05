import { useState, useEffect } from 'react'
import { useCreateProduct, usePatchProduct, useUpdateProduct, useProduct } from '../hooks/useProducts'
// Unified image pipeline: use product.images directly
import { getDisplayBrand } from '../utils/brandUtils'
import ImageGallery from './ImageGallery'
import ImageManager from './ImageManager'
import {
  CATEGORY_OPTIONS,
  CASE_MATERIAL_OPTIONS,
  WATER_RESISTANCE_OPTIONS,
  WARRANTY_OPTIONS,
  MOVEMENT_OPTIONS,
  GENDER_OPTIONS,
  STRAP_COLOR_OPTIONS,
  CASE_SHAPE_OPTIONS,
} from '../constants/productOptions'
import './ProductModal.css'

const ProductModal = ({ product, mode, onClose, onSave, brands = [] }) => {
  const [formData, setFormData] = useState({
    brand: '',
    sku: '',
    category: '',
    inventory: 0,
    price: 0,
    oldPrice: 0,
    description: '',
    caseMaterial: '',
    dialColor: '',
    waterResistance: '',
    warrantyPeriod: '',
    movement: '',
    gender: '',
    caseSize: '',
    strapColor: '',
    caseShape: '',
    images: [],
  })
  const [error, setError] = useState('')
  const [samePriceChecked, setSamePriceChecked] = useState(false)

  // React Query mutations with optimistic updates
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const patchMutation = usePatchProduct() // Use PATCH for partial updates (optimized)
  
  // Fetch full product when modal opens (only if product._id exists)
  const { data: fullProductData } = useProduct(product?._id)
  const fullProduct = fullProductData?.data
  const displayProduct = fullProduct || product

  useEffect(() => {
    if (!displayProduct) return;

    setFormData((prev) => ({
      ...prev,
      brand: displayProduct.brand || prev.brand || '',
      sku: displayProduct.sku || prev.sku || '',
      category: displayProduct.category || '',
      inventory: displayProduct.inventory ?? 0,
      price: displayProduct.price ?? 0,
      oldPrice: displayProduct.oldPrice ?? displayProduct.price ?? 0,
      description: displayProduct.description || '',
      images: displayProduct.images || [],

      // Product Details (flat fields)
      caseMaterial: displayProduct.caseMaterial || '',
      dialColor: displayProduct.dialColor || '',
      waterResistance: displayProduct.waterResistance || '',
      warrantyPeriod: displayProduct.warrantyPeriod || '',
      movement: displayProduct.movement || '',
      gender: displayProduct.gender || '',
      strapColor: displayProduct.strapColor || '',
      caseShape: displayProduct.caseShape || '',
      caseSize: displayProduct.caseSize || ''
    }));

    const price = displayProduct.price ?? 0
    const oldPrice = displayProduct.oldPrice ?? price
    setSamePriceChecked(oldPrice === price)
  }, [displayProduct])

  useEffect(() => {
    if (samePriceChecked) {
      setFormData((prev) => ({
        ...prev,
        oldPrice: prev.price,
      }))
    }
  }, [samePriceChecked])


  const handleChange = (e) => {
    const { name, value } = e.target
    const newValue = name === 'inventory' || name === 'price' || name === 'oldPrice' ? parseFloat(value) || 0 : value
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))
    
    // If checkbox checked and price changed, sync oldPrice
    if (name === 'price' && samePriceChecked) {
      setFormData((prev) => ({
        ...prev,
        oldPrice: newValue,
      }))
    }
  }

  const handleImagesChange = (newImages) => {
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'view') {
      onClose()
      return
    }

    setError('')

    try {
      if (mode === 'create') {
        // Ensure oldPrice = price for new products
        const createData = {
          ...formData,
          oldPrice: formData.oldPrice || formData.price || 0,
        }
        await createMutation.mutateAsync(createData)
        // Optimistic: Close modal immediately, React Query handles cache update
        onClose()
      } else if (mode === 'edit') {
        // Send full formData (excluding read-only fields: brand, sku)
        const payload = {
          ...formData,
          images: formData.images?.filter(Boolean) || [],
          samePriceChecked: samePriceChecked,
        }
        
        // Remove read-only fields
        delete payload.brand
        delete payload.sku
        
        await patchMutation.mutateAsync({
          id: product._id,
          data: payload
        })
        // Optimistic: Close modal immediately, UI already updated
        onClose()
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to save product')
      // Don't close on error - let user retry
    }
  }

  const loading = createMutation.isLoading || updateMutation.isLoading || patchMutation.isLoading

  const isViewMode = mode === 'view'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {mode === 'view' && 'View Product'}
            {mode === 'edit' && 'Edit Product'}
            {mode === 'create' && 'Create Product'}
          </h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Brand</label>
                {mode === 'create' ? (
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    disabled={isViewMode}
                    required
                    className="form-select"
                  >
                    <option value="">Select Brand</option>
                    {brands
                      .filter(Boolean)
                      .filter(b => b.trim().length)
                      .map((brand) => (
                        <option key={brand} value={brand}>
                          {getDisplayBrand(brand)}
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    readOnly
                    disabled
                    className="form-input-readonly"
                  />
                )}
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  disabled={isViewMode || mode === 'edit'}
                  readOnly={mode === 'edit'}
                  className={mode === 'edit' ? 'form-input-readonly' : ''}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                {isViewMode ? (
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}>
                    {formData.category || '-'}
                  </div>
                ) : (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="form-select"
                  >
                    <option value="">Select Category</option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Inventory</label>
                <input
                  type="number"
                  name="inventory"
                  value={formData.inventory}
                  onChange={handleChange}
                  disabled={isViewMode}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                {isViewMode ? (
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}>
                    {formData.oldPrice && formData.oldPrice > formData.price ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#666', marginRight: '0.5rem' }}>
                          ₹{formData.oldPrice.toFixed(2)}
                        </span>
                        <span>₹{formData.price?.toFixed(2) || '0.00'}</span>
                      </>
                    ) : (
                      <span>₹{formData.price?.toFixed(2) || '0.00'}</span>
                    )}
                  </div>
                ) : (
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={isViewMode}
                    min="0"
                    step="0.01"
                  />
                )}
              </div>
              {!isViewMode && (
                <div className="form-group">
                  <label>Old Price (MRP) (₹)</label>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={samePriceChecked}
                        onChange={(e) => setSamePriceChecked(e.target.checked)}
                        disabled={isViewMode}
                      />
                      <span>Same as price</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    name="oldPrice"
                    value={formData.oldPrice || ''}
                    onChange={handleChange}
                    disabled={isViewMode || samePriceChecked}
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isViewMode}
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Product Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Case Material</label>
                {isViewMode ? (
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}>
                    {displayProduct?.caseMaterial || '-'}
                  </div>
                ) : (
                  <select
                    name="caseMaterial"
                    value={formData.caseMaterial}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="form-select"
                  >
                    <option value="">Select Case Material</option>
                    {CASE_MATERIAL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Dial Color</label>
                {isViewMode ? (
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}>
                    {displayProduct?.dialColor || '-'}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="dialColor"
                    value={formData.dialColor}
                    onChange={handleChange}
                    disabled={isViewMode}
                  />
                )}
              </div>
              <div className="form-group">
                <label>Water Resistance</label>
                {isViewMode ? (
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}>
                    {displayProduct?.waterResistance || '-'}
                  </div>
                ) : (
                  <select
                    name="waterResistance"
                    value={formData.waterResistance}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="form-select"
                  >
                    <option value="">Select Water Resistance</option>
                    {WATER_RESISTANCE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Warranty Period</label>
                {isViewMode ? (
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}>
                    {displayProduct?.warrantyPeriod || '-'}
                  </div>
                ) : (
                  <select
                    name="warrantyPeriod"
                    value={formData.warrantyPeriod}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="form-select"
                  >
                    <option value="">Select Warranty Period</option>
                    {WARRANTY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Movement</label>
                {isViewMode ? (
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}>
                    {displayProduct?.movement || '-'}
                  </div>
                ) : (
                  <select
                    name="movement"
                    value={formData.movement}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="form-select"
                  >
                    <option value="">Select Movement</option>
                    {MOVEMENT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Gender</label>
                {isViewMode ? (
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}>
                    {displayProduct?.gender || '-'}
                  </div>
                ) : (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="form-select"
                  >
                    <option value="">Select Gender</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Strap Color</label>
                {isViewMode ? (
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}>
                    {displayProduct?.strapColor || '-'}
                  </div>
                ) : (
                  <select
                    name="strapColor"
                    value={formData.strapColor}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="form-select"
                  >
                    <option value="">Select Strap Color</option>
                    {STRAP_COLOR_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Case Shape</label>
                {isViewMode ? (
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}>
                    {displayProduct?.caseShape || '-'}
                  </div>
                ) : (
                  <select
                    name="caseShape"
                    value={formData.caseShape}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="form-select"
                  >
                    <option value="">Select Case Shape</option>
                    {CASE_SHAPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Case Size</label>
                {isViewMode ? (
                  <div style={{ padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}>
                    {displayProduct?.caseSize || '-'}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="caseSize"
                    value={formData.caseSize}
                    onChange={handleChange}
                    disabled={isViewMode}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Images</h3>
            {isViewMode ? (
              <ImageGallery images={formData.images} product={displayProduct} />
            ) : (
              <ImageManager
                images={formData.images}
                onChange={handleImagesChange}
                disabled={isViewMode}
              />
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            {!isViewMode && (
              <button type="submit" disabled={loading} className="btn-save">
                {loading ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductModal

