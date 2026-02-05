import { memo } from 'react'
import MobileProductCard from './MobileProductCard'
import './MobileProductList.css'

const MobileProductList = memo(({ products, onView, onEdit, onMoreClick, loading, selectedIds, onSelectionChange, page = 1, limit = 10 }) => {
  if (loading && products.length === 0) {
    return (
      <div className="mobile-product-list-loading">
        <div className="loading-spinner"></div>
        <div>Loading products...</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="mobile-product-list-empty">
        <div className="empty-icon">📦</div>
        <div className="empty-message">No products found</div>
      </div>
    )
  }

  return (
    <div className="mobile-product-list">
      {products.map((product, index) => {
        const serial = (page - 1) * limit + index + 1
        return (
        <MobileProductCard
          key={product._id}
          product={product}
          serial={serial}
          onView={onView}
          onEdit={onEdit}
          onMoreClick={onMoreClick}
          isSelected={selectedIds?.has(product._id) || false}
          onSelectionChange={(checked) => {
            const newSelectedIds = new Set(selectedIds || [])
            if (checked) {
              newSelectedIds.add(product._id)
            } else {
              newSelectedIds.delete(product._id)
            }
            onSelectionChange?.(newSelectedIds)
          }}
        />
      )})}
    </div>
  )
})

MobileProductList.displayName = 'MobileProductList'

export default MobileProductList

