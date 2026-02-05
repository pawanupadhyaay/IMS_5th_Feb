import { useState } from 'react'
import { CATEGORY_OPTIONS } from '../../constants/productOptions'
import './MobileSelectionBar.css'

const MobileSelectionBar = ({ 
  selectedCount, 
  selectedIds,
  products,
  onBulkEdit, 
  onBulkDelete,
  onBulkCategoryChange,
  onBulkExportCSV,
  onClearSelection 
}) => {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [formData, setFormData] = useState({
    inventory: '',
    price: '',
    category: '',
  })
  const [categoryValue, setCategoryValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const updates = {}
    
    if (formData.inventory !== '') {
      updates.inventory = parseFloat(formData.inventory) || 0
    }
    if (formData.price !== '') {
      updates.price = parseFloat(formData.price) || 0
    }
    if (formData.category !== '') {
      updates.category = formData.category
    }

    if (Object.keys(updates).length === 0) {
      alert('Please enter at least one field to update')
      return
    }

    onBulkEdit(updates)
    setShowEditForm(false)
    setFormData({ inventory: '', price: '', category: '' })
  }

  const handleCategorySubmit = (e) => {
    e.preventDefault()
    if (!categoryValue) {
      alert('Please select a category')
      return
    }
    onBulkCategoryChange(categoryValue)
    setShowCategoryForm(false)
    setCategoryValue('')
  }

  if (showEditForm) {
    return (
      <div className="mobile-selection-bar edit-mode">
        <form onSubmit={handleSubmit} className="mobile-bulk-form">
          <input
            type="number"
            placeholder="Inventory"
            value={formData.inventory}
            onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
            className="mobile-bulk-input"
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="mobile-bulk-input"
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="mobile-bulk-input"
          />
          <div className="mobile-bulk-actions">
            <button type="submit" className="btn-apply-mobile">
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEditForm(false)
                setFormData({ inventory: '', price: '', category: '' })
              }}
              className="btn-cancel-mobile"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (showCategoryForm) {
    return (
      <div className="mobile-selection-bar edit-mode">
        <form onSubmit={handleCategorySubmit} className="mobile-bulk-form">
          <select
            value={categoryValue}
            onChange={(e) => setCategoryValue(e.target.value)}
            className="mobile-bulk-select"
          >
            <option value="">Select Category</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="mobile-bulk-actions">
            <button type="submit" className="btn-apply-mobile">
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCategoryForm(false)
                setCategoryValue('')
              }}
              className="btn-cancel-mobile"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="mobile-selection-bar">
      <div className="mobile-selection-info">
        <span className="mobile-selected-count">{selectedCount} selected</span>
      </div>
      <div className="mobile-selection-actions">
        <button onClick={() => setShowEditForm(true)} className="btn-bulk-edit-mobile">
          Edit
        </button>
        <button onClick={() => setShowCategoryForm(true)} className="btn-change-category-mobile">
          Category
        </button>
        <button onClick={onBulkDelete} className="btn-delete-mobile">
          Delete
        </button>
        <button onClick={onBulkExportCSV} className="btn-export-mobile">
          Export
        </button>
        <button onClick={onClearSelection} className="btn-clear-mobile">
          Clear
        </button>
      </div>
    </div>
  )
}

export default MobileSelectionBar
