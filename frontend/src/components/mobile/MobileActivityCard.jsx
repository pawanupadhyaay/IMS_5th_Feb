import { memo } from 'react'
import { getDisplayBrand } from '../../utils/brandUtils'
import './MobileActivityCard.css'

const MobileActivityCard = memo(({ log, onViewDetails }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getActionConfig = (actionType) => {
    const config = {
      CREATE: { label: 'Created', className: 'action-created', icon: '✓' },
      UPDATE: { label: 'Updated', className: 'action-updated', icon: '✎' },
      DELETE: { label: 'Deleted', className: 'action-deleted', icon: '×' },
    }
    return config[actionType] || { label: actionType, className: 'action-default', icon: '•' }
  }

  const action = getActionConfig(log.actionType)

  return (
    <div className="mobile-activity-card">
      <div className="mobile-activity-thumbnail">
        {log.thumbnail ? (
          <img
            src={log.thumbnail}
            alt={log.brand || 'Product'}
            className="activity-thumbnail-img"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className="activity-thumbnail-placeholder" 
          style={{ display: log.thumbnail ? 'none' : 'flex' }}
        >
          <span className="thumbnail-icon">📦</span>
        </div>
      </div>

      <div className="mobile-activity-card-content">
        <div className="mobile-activity-header">
          <div className="mobile-activity-badge">
            <span className={`action-badge ${action.className}`}>
              <span className="badge-icon">{action.icon}</span>
              {action.label}
            </span>
          </div>
          <div className="activity-timestamp">
            {formatDate(log.createdAt)}
          </div>
        </div>
        
        <div className="mobile-activity-content">
          <div className="activity-brand">{getDisplayBrand(log.brand) || 'No Brand'}</div>
          <div className="activity-sku">SKU: {log.sku || 'No SKU'}</div>
          <div className="activity-admin">
            <span className="admin-label">Admin:</span>
            <span className="admin-name">{log.adminName || 'Unknown'}</span>
          </div>
        </div>

        <div className="mobile-activity-footer">
          <button
            onClick={() => onViewDetails?.(log)}
            className="btn-view-details"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
})

MobileActivityCard.displayName = 'MobileActivityCard'

export default MobileActivityCard
