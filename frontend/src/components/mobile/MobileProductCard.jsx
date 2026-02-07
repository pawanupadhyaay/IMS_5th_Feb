import { memo } from 'react'
import ProductThumbnail from '../ProductThumbnail'
import { getDisplayBrand } from '../../utils/brandUtils'
import './MobileProductCard.css'

const MobileProductCard = memo(({ product, serial, onView, onEdit, onMoreClick, isSelected, onSelectionChange }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const totalValue = (product.inventory || 0) * (product.price || 0)
  const isOutOfStock = (product.inventory || 0) === 0

  return (
    <div className={`mobile-product-card ${isOutOfStock ? 'out-of-stock' : ''} ${isSelected ? 'selected' : ''}`}>
      <div className="mobile-product-checkbox">
        <input
          type="checkbox"
          checked={isSelected || false}
          onChange={(e) => onSelectionChange?.(e.target.checked)}
          className="mobile-checkbox"
        />
      </div>
      <div className="mobile-product-top">
        <ProductThumbnail
          product={product}
          alt={product.brand || 'Product'}
          size={64}
          onClick={() => onView(product)}
          className="mobile-product-thumbnail"
        />
        <div className="mobile-product-info">
          <div className="mobile-product-header">
            <div className="mobile-product-title">
              {typeof serial === 'number' && (
                <span className="mobile-product-serial">#{serial}</span>
              )}
              <span className="mobile-product-brand">
                {getDisplayBrand(product.brand) || 'No Brand'}
              </span>
            </div>
            <div className="mobile-product-sku">{product.sku || 'No SKU'}</div>
          </div>
          <div className="mobile-product-category">{product.category || 'Uncategorized'}</div>
        </div>
      </div>
      
      <div className="mobile-product-details">
        <div className="mobile-product-detail-item">
          <span className="detail-label">Stock:</span>
          <span className={`detail-value ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {product.inventory || 0}
          </span>
        </div>
        <div className="mobile-product-detail-item">
          <span className="detail-label">Price:</span>
          <span className="detail-value">
            {product.oldPrice && product.oldPrice > product.price ? (
              <>
                <span style={{ textDecoration: 'line-through', color: '#666', marginRight: '0.5rem' }}>
                  {formatCurrency(product.oldPrice)}
                </span>
                {formatCurrency(product.price || 0)}
              </>
            ) : (
              formatCurrency(product.price || 0)
            )}
          </span>
        </div>
        <div className="mobile-product-detail-item">
          <span className="detail-label">Value:</span>
          <span className="detail-value">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      <div className="mobile-product-actions">
        <button
          className="mobile-action-btn view-btn"
          onClick={() => onView(product)}
          aria-label="View product"
        >
          <span className="action-icon">👁</span>
          <span>View</span>
        </button>
        <button
          className="mobile-action-btn edit-btn"
          onClick={() => onEdit(product)}
          aria-label="Edit product"
        >
          <span className="action-icon">✏️</span>
          <span>Edit</span>
        </button>
        <button
          className="mobile-action-btn more-btn"
          onClick={() => onMoreClick(product)}
          aria-label="More options"
        >
          <span className="more-icon">⋮</span>
        </button>
      </div>
    </div>
  )
})

MobileProductCard.displayName = 'MobileProductCard'

export default MobileProductCard

