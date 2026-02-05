import { memo } from 'react'
import { getDisplayBrand } from '../utils/brandUtils'
import './ActivityHistoryTable.css'

const ActivityHistoryTable = memo(({ logs, onViewDetails }) => {
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

  return (
    <div className="activity-table-container">
      <table className="activity-table">
        <thead className="sticky-header">
          <tr>
            <th className="table-header-thumbnail"></th>
            <th>Brand Name</th>
            <th>SKU</th>
            <th>Action</th>
            <th>Admin</th>
            <th>Timestamp</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td className="table-cell-thumbnail">
                <div className="thumbnail-wrapper">
                  {log.thumbnail ? (
                    <img
                      src={log.thumbnail}
                      alt={log.brand || 'Product'}
                      className="activity-thumbnail"
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
              </td>
              <td className="table-cell-brand">{getDisplayBrand(log.brand) || '-'}</td>
              <td className="table-cell-sku">{log.sku || '-'}</td>
              <td className="table-cell-action">
                {getActionBadge(log.actionType)}
              </td>
              <td className="table-cell-admin">
                <div className="admin-info">
                  <div className="admin-name">{log.adminName || 'Unknown'}</div>
                  <div className="admin-email">{log.adminEmail || ''}</div>
                </div>
              </td>
              <td className="table-cell-timestamp">
                {formatDate(log.createdAt)}
              </td>
              <td className="table-cell-actions">
                <button
                  onClick={() => onViewDetails?.(log)}
                  className="btn-view-details"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

ActivityHistoryTable.displayName = 'ActivityHistoryTable'

export default ActivityHistoryTable
