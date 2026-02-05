import { memo } from 'react'
import MobileActivityCard from './MobileActivityCard'
import './MobileActivityCardList.css'

const MobileActivityCardList = memo(({ logs, isLoading, onLoadMore, hasMore, onViewDetails, pagination, onPageChange }) => {
  if (logs.length === 0) {
    return (
      <div className="mobile-activity-empty">
        <div className="empty-icon">📋</div>
        <div className="empty-text">No activity logs</div>
      </div>
    )
  }

  return (
    <>
      <div className="mobile-activity-card-list">
        {logs.map((log) => (
          <MobileActivityCard key={log._id} log={log} onViewDetails={onViewDetails} />
        ))}
      </div>
      
      {/* Compact Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mobile-pagination-compact">
          <button
            className="pagination-btn-compact"
            onClick={() => onPageChange?.(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            ← Prev
          </button>
          <span className="pagination-info-compact">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            className="pagination-btn-compact"
            onClick={() => onPageChange?.(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Infinite Scroll Option (Load More) */}
      {hasMore && !pagination && (
        <div className="mobile-load-more-container">
          <button
            className="mobile-load-more-btn"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </>
  )
})

MobileActivityCardList.displayName = 'MobileActivityCardList'

export default MobileActivityCardList
