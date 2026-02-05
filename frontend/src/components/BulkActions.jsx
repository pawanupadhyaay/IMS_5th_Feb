import { useState } from 'react'
import { CATEGORY_OPTIONS } from '../constants/productOptions'
import './BulkActions.css'

const BulkActions = ({ 
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

  return (
    <div className="bulk-actions-toolbar">
      <div className="bulk-actions-info">
        <span className="selected-count">{selectedCount} selected</span>
      </div>
      
      <div className="bulk-actions-buttons">
        {showEditForm ? (
          <form onSubmit={handleSubmit} className="bulk-edit-form">
            <input
              type="number"
              placeholder="Inventory"
              value={formData.inventory}
              onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
              className="bulk-input"
            />
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bulk-input"
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bulk-input"
            />
            <button type="submit" className="btn-apply">
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEditForm(false)
                setFormData({ inventory: '', price: '', category: '' })
              }}
              className="btn-cancel"
            >
              Cancel
            </button>
          </form>
        ) : showCategoryForm ? (
          <form onSubmit={handleCategorySubmit} className="bulk-category-form">
            <select
              value={categoryValue}
              onChange={(e) => setCategoryValue(e.target.value)}
              className="bulk-select"
            >
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-apply">
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCategoryForm(false)
                setCategoryValue('')
              }}
              className="btn-cancel"
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <button onClick={() => setShowEditForm(true)} className="btn-bulk-edit">
              Bulk Edit
            </button>
            <button onClick={() => setShowCategoryForm(true)} className="btn-change-category">
              Change Category
            </button>
            <button onClick={onBulkDelete} className="btn-delete-selected">
              Delete Selected
            </button>
            <button onClick={onBulkExportCSV} className="btn-export-csv">
              Export CSV
            </button>
            <button onClick={onClearSelection} className="btn-clear-selection">
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default BulkActions
