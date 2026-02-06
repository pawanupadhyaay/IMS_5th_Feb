import { useState, useEffect } from 'react'
import { useCreateProduct, usePatchProduct, useProduct } from '../../hooks/useProducts'
// Unified image pipeline: use product.images directly
import { getDisplayBrand } from '../../utils/brandUtils'
import ImageGallery from '../ImageGallery'
import ImageManager from '../ImageManager'
import {
  CATEGORY_OPTIONS,
  CASE_MATERIAL_OPTIONS,
  WATER_RESISTANCE_OPTIONS,
  WARRANTY_OPTIONS,
  MOVEMENT_OPTIONS,
  GENDER_OPTIONS,
  STRAP_COLOR_OPTIONS,
  CASE_SHAPE_OPTIONS,
} from '../../constants/productOptions'
import './MobileProductModal.css'

const DIAL_COLOR_OPTIONS = [
  'Black',
  'Brown',
  'Blue',
  'Red',
  'Green',
  'White',
  'Grey',
  'Silver',
  'Gold',
  'Rose Gold',
  'Leather Brown',
  'Leather Black',
  'Metal Silver',
  'Metal Gold',
  'Rubber Black',
  'Rubber Blue',
  'Fabric',
  'NATO',
  'Two Toned',
  'Multi Color',
  'Champagne',
  'Mother of Pearl',
  'Beige',
  'Bronze',
  'Pink',
  'Maroon',
  'Transparent',
]

const MobileProductModal = ({ product, mode, onClose, onSave, brands = [] }) => {
  const [formData, setFormData] = useState({
    brand: '',
    title: '',
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
  const [activeSection, setActiveSection] = useState('basic')
  const [samePriceChecked, setSamePriceChecked] = useState(false)

  const createMutation = useCreateProduct()
  const patchMutation = usePatchProduct()
  
  // Fetch full product when modal opens (only if product._id exists)
  const { data: fullProductData } = useProduct(product?._id)
  const fullProduct = fullProductData?.data
  const displayProduct = fullProduct || product

  useEffect(() => {
    if (!displayProduct) return;

    setFormData((prev) => ({
      ...prev,
      brand: displayProduct.brand || prev.brand || '',
      title: displayProduct.title || '',
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
        onClose()
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to save product')
    }
  }

  const loading = createMutation.isLoading || patchMutation.isLoading
  const isViewMode = mode === 'view'

  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-modal-header">
          <h2>
            {mode === 'view' && 'View Product'}
            {mode === 'edit' && 'Edit Product'}
            {mode === 'create' && 'Create Product'}
          </h2>
          <button onClick={onClose} className="mobile-modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="mobile-modal-form">
          {error && <div className="mobile-error-message">{error}</div>}

          {/* Section Tabs */}
          <div className="mobile-modal-tabs">
            <button
              type="button"
              className={`mobile-tab ${activeSection === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveSection('basic')}
            >
              Basic
            </button>
            <button
              type="button"
              className={`mobile-tab ${activeSection === 'details' ? 'active' : ''}`}
              onClick={() => setActiveSection('details')}
            >
              Details
            </button>
            <button
              type="button"
              className={`mobile-tab ${activeSection === 'image' ? 'active' : ''}`}
              onClick={() => setActiveSection('image')}
            >
              Image
            </button>
          </div>

          <div className="mobile-modal-body">
            {/* Basic Info Section */}
            {activeSection === 'basic' && (
              <div className="mobile-form-section">
                <div className="mobile-form-group">
                  <label>Brand</label>
                  {mode === 'create' ? (
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      disabled={isViewMode}
                      required
                      className="mobile-form-select"
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
                      className="mobile-form-input mobile-form-input-readonly"
                    />
                  )}
                </div>
                <div className="mobile-form-group">
                  <label>Title</label>
                  {isViewMode ? (
                    <div className="mobile-view-value">{displayProduct?.title?.trim() || '—'}</div>
                  ) : (
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      disabled={isViewMode}
                      required={mode === 'create'}
                      className="mobile-form-input"
                    />
                  )}
                </div>
                <div className="mobile-form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    disabled={isViewMode || mode === 'edit'}
                    readOnly={mode === 'edit'}
                    className={`mobile-form-input ${mode === 'edit' ? 'mobile-form-input-readonly' : ''}`}
                  />
                </div>
                <div className="mobile-form-group">
                  <label>Category</label>
                  {isViewMode ? (
                    <div className="mobile-view-value">{displayProduct?.category || '-'}</div>
                  ) : (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="mobile-form-input"
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
                <div className="mobile-form-group">
                  <label>Inventory</label>
                  <input
                    type="number"
                    name="inventory"
                    value={formData.inventory}
                    onChange={handleChange}
                    disabled={isViewMode}
                    min="0"
                    className="mobile-form-input"
                  />
                </div>
                {isViewMode ? (
                  <div className="mobile-form-group">
                    <label>Price</label>
                    <div className="mobile-view-value">
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
                  </div>
                ) : (
                  <div className="mobile-pricing-stack">
                    <div className="mobile-form-group">
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        disabled={isViewMode}
                        min="0"
                        step="0.01"
                        className="mobile-form-input"
                      />
                    </div>
                    <div className="mobile-same-price-checkbox">
                      <input
                        type="checkbox"
                        id="mobileSamePriceCheckbox"
                        checked={samePriceChecked}
                        onChange={(e) => setSamePriceChecked(e.target.checked)}
                        disabled={isViewMode}
                      />
                      <label htmlFor="mobileSamePriceCheckbox">
                        Old price same as price
                      </label>
                    </div>
                    <div className="mobile-form-group">
                      <label>Old Price (MRP) (₹)</label>
                      <input
                        type="number"
                        name="oldPrice"
                        value={formData.oldPrice}
                        onChange={handleChange}
                        disabled={isViewMode || samePriceChecked}
                        min="0"
                        step="0.01"
                        className="mobile-form-input"
                      />
                    </div>
                  </div>
                )}
                <div className="mobile-form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isViewMode}
                    rows="4"
                    className="mobile-form-textarea"
                  />
                </div>
              </div>
            )}

            {/* Product Details Section */}
            {activeSection === 'details' && (
              <div className="mobile-form-section">
                <div className="mobile-form-group">
                  <label>Case Material</label>
                  {isViewMode ? (
                    <div className="mobile-view-value">{displayProduct?.caseMaterial || '-'}</div>
                  ) : (
                    <select
                      name="caseMaterial"
                      value={formData.caseMaterial}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="mobile-form-input"
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
                <div className="mobile-form-group">
                  <label>Dial Color</label>
                  {isViewMode ? (
                    <div className="mobile-view-value">{displayProduct?.dialColor || '-'}</div>
                  ) : (
                    <select
                      name="dialColor"
                      value={formData.dialColor}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="mobile-form-input"
                    >
                      <option value="">Select Dial Color</option>
                      {DIAL_COLOR_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="mobile-form-group">
                  <label>Water Resistance</label>
                  {isViewMode ? (
                    <div className="mobile-view-value">{displayProduct?.waterResistance || '-'}</div>
                  ) : (
                    <select
                      name="waterResistance"
                      value={formData.waterResistance}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="mobile-form-input"
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
                <div className="mobile-form-group">
                  <label>Warranty Period</label>
                  {isViewMode ? (
                    <div className="mobile-view-value">{displayProduct?.warrantyPeriod || '-'}</div>
                  ) : (
                    <select
                      name="warrantyPeriod"
                      value={formData.warrantyPeriod}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="mobile-form-input"
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
                <div className="mobile-form-group">
                  <label>Movement</label>
                  {isViewMode ? (
                    <div className="mobile-view-value">{displayProduct?.movement || '-'}</div>
                  ) : (
                    <select
                      name="movement"
                      value={formData.movement}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="mobile-form-input"
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
                <div className="mobile-form-group">
                  <label>Gender</label>
                  {isViewMode ? (
                    <div className="mobile-view-value">{displayProduct?.gender || '-'}</div>
                  ) : (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="mobile-form-input"
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
                <div className="mobile-form-group">
                  <label>Strap Color</label>
                  {isViewMode ? (
                    <div className="mobile-view-value">{displayProduct?.strapColor || '-'}</div>
                  ) : (
                    <select
                      name="strapColor"
                      value={formData.strapColor}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="mobile-form-input"
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
                <div className="mobile-form-group">
                  <label>Case Shape</label>
                  {isViewMode ? (
                    <div className="mobile-view-value">{displayProduct?.caseShape || '-'}</div>
                  ) : (
                    <select
                      name="caseShape"
                      value={formData.caseShape}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="mobile-form-input"
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
                <div className="mobile-form-group">
                  <label>Case Size</label>
                  {isViewMode ? (
                    <div className="mobile-view-value">{displayProduct?.caseSize || '-'}</div>
                  ) : (
                    <input
                      type="text"
                      name="caseSize"
                      value={formData.caseSize}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="mobile-form-input"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Image Section */}
            {activeSection === 'image' && (
              <div className="mobile-form-section">
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
            )}
          </div>

          {/* Sticky Footer Actions */}
          <div className="mobile-modal-footer">
            <button type="button" onClick={onClose} className="mobile-modal-btn cancel">
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            {!isViewMode && (
              <button type="submit" disabled={loading} className="mobile-modal-btn save">
                {loading ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default MobileProductModal

