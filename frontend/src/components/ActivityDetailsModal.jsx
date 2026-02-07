import { memo } from 'react'
import { getDisplayBrand } from '../utils/brandUtils'
import './ActivityDetailsModal.css'

const ActivityDetailsModal = memo(({ log, onClose }) => {
  if (!log) return null

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const getActionBadge = (actionType) => {
    const config = {
      CREATE: { label: 'Created', className: 'badge-created', icon: '✓' },
      UPDATE: { label: 'Updated', className: 'badge-updated', icon: '✎' },
      DELETE: { label: 'Deleted', className: 'badge-deleted', icon: '×' },
    }
    const action = config[actionType] || { label: actionType, className: 'badge-default', icon: '•' }
    return (
      <span className={`action-badge ${action.className}`}>
        <span className="badge-icon">{action.icon}</span>
        {action.label}
      </span>
    )
  }

  const formatFieldValue = (value) => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') return value.toString()
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None'
      return value.join(', ')
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return value || '—'
  }

  const getFieldLabel = (field) => {
    const labels = {
      brand: 'Brand',
      sku: 'SKU',
      category: 'Category',
      inventory: 'Inventory',
      price: 'Price',
      oldPrice: 'Old Price (MRP)',
      description: 'Description',
      caseMaterial: 'Case Material',
      dialColor: 'Dial Color',
      waterResistance: 'Water Resistance',
      warrantyPeriod: 'Warranty Period',
      movement: 'Movement',
      gender: 'Gender',
      strapColor: 'Strap Color',
      caseShape: 'Case Shape',
      caseSize: 'Case Size',
      images: 'Images',
    }
    return labels[field] || field
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '—'
    return `₹${parseFloat(value).toLocaleString('en-IN')}`
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="activity-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Activity Details</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-content">
          <div className="detail-section">
            <div className="detail-row">
              <span className="detail-label">Brand:</span>
              <span className="detail-value">{getDisplayBrand(log.brand) || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">SKU:</span>
              <span className="detail-value">{log.sku || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Action:</span>
              <span className="detail-value">{getActionBadge(log.actionType)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Admin Name:</span>
              <span className="detail-value">{log.adminName || 'Unknown'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Admin Email:</span>
              <span className="detail-value">{log.adminEmail || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Timestamp:</span>
              <span className="detail-value">{formatDate(log.createdAt)}</span>
            </div>
          </div>

          {/* Changes Diff Section */}
          {log.changes && Object.keys(log.changes).length > 0 && (
            <div className="changes-section">
              <h3 className="changes-title">Changes Made</h3>
              <div className="changes-list">
                {Object.entries(log.changes).map(([field, change]) => (
                  <div key={field} className="change-item">
                    <div className="change-field-name">{getFieldLabel(field)}</div>
                    <div className="change-values">
                      <div className="change-old">
                        <span className="change-label">Before:</span>
                        <span className="change-value old-value">
                          {field === 'price' || field === 'oldPrice' 
                            ? formatCurrency(change.old)
                            : formatFieldValue(change.old)}
                        </span>
                      </div>
                      <div className="change-arrow">→</div>
                      <div className="change-new">
                        <span className="change-label">After:</span>
                        <span className="change-value new-value">
                          {field === 'price' || field === 'oldPrice'
                            ? formatCurrency(change.new)
                            : formatFieldValue(change.new)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="detail-row">
              <span className="detail-label">Metadata:</span>
              <div className="detail-value">
                <pre className="metadata-display">{JSON.stringify(log.metadata, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
})

ActivityDetailsModal.displayName = 'ActivityDetailsModal'

export default ActivityDetailsModal
