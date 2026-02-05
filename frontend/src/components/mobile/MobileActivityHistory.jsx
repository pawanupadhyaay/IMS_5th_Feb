import { useState } from 'react'
import MobileActivityHeader from './MobileActivityHeader'
import MobileActivityFilters from './MobileActivityFilters'
import MobileActivityCardList from './MobileActivityCardList'
import ActivityDetailsModal from '../ActivityDetailsModal'
import './MobileActivityHistory.css'

const MobileActivityHistory = ({
  logs,
  pagination,
  brands,
  admins,
  filters,
  isLoading,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onBack,
}) => {
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      onPageChange(pagination.page + 1)
    }
  }

  const handleViewDetails = (log) => {
    setSelectedLog(log)
    setShowDetailsModal(true)
  }

  const handleCloseDetails = () => {
    setShowDetailsModal(false)
    setSelectedLog(null)
  }

  return (
    <div className="mobile-activity-history">
      <MobileActivityHeader onBack={onBack} />

      <MobileActivityFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        brands={brands}
        admins={admins}
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />

      <div className="mobile-activity-search">
        <input
          type="text"
          placeholder="Search by Brand or SKU..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="mobile-search-input"
        />
        <button
          className="mobile-filter-btn"
          onClick={() => setShowFilters(true)}
          aria-label="Filters"
        >
          ⚙️
        </button>
      </div>

      <main className="mobile-activity-main">
        {isLoading && logs.length === 0 ? (
          <div className="mobile-loading">Loading activity logs...</div>
        ) : logs.length === 0 ? (
          <div className="mobile-empty">
            <div className="empty-icon">📋</div>
            <div className="empty-text">No activity logs found</div>
            <button onClick={onClearFilters} className="btn-clear-filters-mobile">
              Clear Filters
            </button>
          </div>
        ) : (
          <MobileActivityCardList
            logs={logs}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            hasMore={pagination.page < pagination.totalPages}
            onViewDetails={handleViewDetails}
            pagination={pagination}
            onPageChange={onPageChange}
          />
        )}
      </main>

      {showDetailsModal && selectedLog && (
        <ActivityDetailsModal log={selectedLog} onClose={handleCloseDetails} />
      )}
    </div>
  )
}

export default MobileActivityHistory
