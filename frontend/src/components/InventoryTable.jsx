import { memo } from 'react'
import { FixedSizeList as List } from 'react-window'
import ProductThumbnail from './ProductThumbnail'
import { getDisplayBrand } from '../utils/brandUtils'
import './InventoryTable.css'

const InventoryTable = memo(({ products, onView, onEdit, onDelete, loading, selectedIds, onSelectionChange, page = 1, limit = 50 }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Memoized row component for performance
  const Row = memo(({ index, style, data }) => {
    const product = data.products[index]
    const selectedIds = data.selectedIds
    const onSelectionChange = data.onSelectionChange
    const onView = data.onView
    const onEdit = data.onEdit
    const onDelete = data.onDelete
    const page = data.page || 1
    const limit = data.limit || 50
    
    if (!product) return null
    
    const totalValue = (product.inventory || 0) * (product.price || 0)
    const serial = (page - 1) * limit + index + 1
    const isSelected = selectedIds?.has(product._id) || false

    const handleCheckboxChange = (e) => {
      const newSelectedIds = new Set(selectedIds || [])
      if (e.target.checked) {
        newSelectedIds.add(product._id)
      } else {
        newSelectedIds.delete(product._id)
      }
      onSelectionChange?.(newSelectedIds)
    }

    return (
      <div style={style} className="table-row">
        <div className="table-cell checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="row-checkbox"
          />
        </div>
        <div className="table-cell serial">
          {serial}
        </div>
        <div className="table-cell image">
          <ProductThumbnail
            product={product}
            alt={product.brand || 'Product'}
            size={44}
            onClick={() => onView(product)}
          />
        </div>
        <div className="table-cell brand">{getDisplayBrand(product.brand) || '-'}</div>
        <div className="table-cell sku">{product.sku || '-'}</div>
        <div className="table-cell category">{product.category || '-'}</div>
        <div className="table-cell inventory">
          <span className={product.inventory === 0 ? 'out-of-stock' : ''}>
            {product.inventory || 0}
          </span>
        </div>
        <div className="table-cell price">
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
        </div>
        <div className="table-cell total-value">{formatCurrency(totalValue)}</div>
        <div className="table-cell actions">
          <button
            type="button"
            onClick={() => onView(product)}
            className="action-btn view-btn"
            title="View product"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="action-btn edit-btn"
            title="Edit product"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="action-btn delete-btn"
            title="Delete product"
          >
            Delete
          </button>
        </div>
      </div>
    )
  })

  if (loading && products.length === 0) {
    return (
      <div className="table-container">
        <div className="loading-message">Loading products...</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-message">No products found</div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <div className="table-cell checkbox">
          <input
            type="checkbox"
            checked={products.length > 0 && products.every(p => selectedIds?.has(p._id))}
            onChange={(e) => {
              const newSelectedIds = new Set()
              if (e.target.checked) {
                products.forEach(p => newSelectedIds.add(p._id))
              }
              onSelectionChange?.(newSelectedIds)
            }}
            className="header-checkbox"
          />
        </div>
        <div className="table-cell serial">S.No</div>
        <div className="table-cell image">Image</div>
        <div className="table-cell brand">Brand</div>
        <div className="table-cell sku">SKU</div>
        <div className="table-cell category">Category</div>
        <div className="table-cell inventory">Inventory</div>
        <div className="table-cell price">Price</div>
        <div className="table-cell total-value">Total Value</div>
        <div className="table-cell actions">Actions</div>
      </div>
      <div className="table-body">
        <List
          height={Math.min(600, products.length * 50)}
          itemCount={products.length}
          itemSize={50}
          width="100%"
          itemData={{ products, selectedIds, onSelectionChange, onView, onEdit, onDelete, page, limit }}
        >
          {Row}
        </List>
      </div>
    </div>
  )
})

InventoryTable.displayName = 'InventoryTable'

export default InventoryTable

