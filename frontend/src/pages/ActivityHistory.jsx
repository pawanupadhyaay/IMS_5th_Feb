import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useActivityLogs, useActivityLogAdmins } from '../hooks/useActivityLogs'
import { useProducts } from '../hooks/useProducts'
import { useDebounce } from '../hooks/useDebounce'
import { getDisplayBrand } from '../utils/brandUtils'
import { exportActivityLogsToCSV } from '../services/exportService'
import ActivityHistoryTable from '../components/ActivityHistoryTable'
import ActivityDetailsModal from '../components/ActivityDetailsModal'
import MobileActivityHistory from '../components/mobile/MobileActivityHistory'
import './ActivityHistory.css'

const ActivityHistory = () => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    actionType: searchParams.get('action') || searchParams.get('actionType') || '',
    adminId: searchParams.get('admin') || searchParams.get('adminId') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '10', 10),
  })

  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Sync filters to URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.brand) params.set('brand', filters.brand)
    if (filters.actionType) params.set('action', filters.actionType)
    if (filters.adminId) params.set('admin', filters.adminId)
    if (filters.startDate) params.set('startDate', filters.startDate)
    if (filters.endDate) params.set('endDate', filters.endDate)
    if (filters.page > 1) params.set('page', filters.page.toString())
    if (filters.limit !== 10) params.set('limit', filters.limit.toString())
    
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  // Debounce search input
  const debouncedSearch = useDebounce(filters.search, 500)

  // Build query filters
  const queryFilters = useMemo(() => ({
    page: filters.page,
    limit: filters.limit,
    brand: filters.brand || undefined,
    action: filters.actionType || undefined,
    admin: filters.adminId || undefined,
    search: debouncedSearch || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  }), [filters.page, filters.limit, filters.brand, filters.actionType, filters.adminId, filters.startDate, filters.endDate, debouncedSearch])

  // React Query hooks
  const { data: logsData, isLoading } = useActivityLogs(queryFilters)
  // Fetch all products to get complete brand list
  const { data: productsData } = useProducts({ limit: 10000 })
  const { data: adminsData } = useActivityLogAdmins()

  // Extract data with safe defaults (using new response format)
  const logs = logsData?.data || []
  const pagination = {
    page: logsData?.page || 1,
    limit: logsData?.limit || 10,
    total: logsData?.total || 0,
    totalPages: logsData?.totalPages || 0,
    pages: logsData?.totalPages || 0, // Backward compatibility
  }
  const allProducts = productsData?.data || []
  const admins = adminsData?.data || []
  
  // Build brands dynamically from products
  const brands = useMemo(() => {
    return allProducts
      .map(p => p.brand)
      .filter(Boolean)          // remove null/undefined
      .map(b => b.trim())       // remove spaces
      .filter(b => b.length)    // remove empty strings
      .filter((b, i, a) => a.indexOf(b) === i) // unique
      .sort((a, b) => a.localeCompare(b))
  }, [allProducts])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }))
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLimitChange = (newLimit) => {
    setFilters((prev) => ({ ...prev, limit: parseInt(newLimit, 10), page: 1 }))
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      actionType: '',
      adminId: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10,
    })
  }

  const handleViewDetails = (log) => {
    setSelectedLog(log)
    setShowDetailsModal(true)
  }

  const handleCloseDetails = () => {
    setShowDetailsModal(false)
    setSelectedLog(null)
  }

  const handleExportCSV = async () => {
    try {
      await exportActivityLogsToCSV(queryFilters)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV')
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const totalPages = pagination.totalPages
    const currentPage = pagination.page
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page, current page, and last page with ellipsis
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('ellipsis-start')
      }
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis-end')
      }
      
      pages.push(totalPages)
    }
    
    return pages
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <MobileActivityHistory
        logs={logs}
        pagination={pagination}
        brands={brands}
        admins={admins}
        filters={filters}
        isLoading={isLoading}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onPageChange={handlePageChange}
        onBack={() => navigate('/dashboard')}
      />
    )
  }

  // Desktop Layout
  return (
    <div className="activity-history-page">
      <div className="activity-history-header">
        <div className="breadcrumb">
          <button onClick={() => navigate('/dashboard')} className="breadcrumb-link">
            Dashboard
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Activity History</span>
        </div>
        <div className="page-title-section">
          <h1>Activity History</h1>
          <p className="page-subtitle">Track all product operations and changes</p>
        </div>
        <div className="header-actions">
          <button onClick={handleExportCSV} className="btn-export">
            Export CSV
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="activity-history-filters">
        <div className="filters-row">
          <input
            type="text"
            placeholder="Search by Brand or SKU..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="filter-input search-input"
          />
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="filter-select"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {getDisplayBrand(brand)}
              </option>
            ))}
          </select>
          <select
            value={filters.actionType}
            onChange={(e) => handleFilterChange('actionType', e.target.value)}
            className="filter-select"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Created</option>
            <option value="UPDATE">Updated</option>
            <option value="DELETE">Deleted</option>
          </select>
          <select
            value={filters.adminId}
            onChange={(e) => handleFilterChange('adminId', e.target.value)}
            className="filter-select"
          >
            <option value="">All Admins</option>
            {admins.map((admin) => (
              <option key={admin._id} value={admin._id}>
                {admin.name}
              </option>
            ))}
          </select>
          <div className="date-range-picker">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="filter-input date-input"
              placeholder="Start Date"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="filter-input date-input"
              placeholder="End Date"
            />
          </div>
          <button onClick={handleClearFilters} className="btn-clear-filters">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="activity-history-content">
        {isLoading && logs.length === 0 ? (
          <div className="loading-skeletons">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-row">
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No Activity Logs Found</h3>
            <p>Try adjusting your filters or check back later.</p>
            <button onClick={handleClearFilters} className="btn-clear-filters">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="table-controls">
              <div className="rows-per-page">
                <label>Rows per page:</label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleLimitChange(e.target.value)}
                  className="limit-select"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="results-count">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
            </div>
            <ActivityHistoryTable logs={logs} onViewDetails={handleViewDetails} />
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <div className="pagination-numbers">
                  {getPageNumbers().map((pageNum, index) => {
                    if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
                      return <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`pagination-number ${pagination.page === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showDetailsModal && selectedLog && (
        <ActivityDetailsModal log={selectedLog} onClose={handleCloseDetails} />
      )}
    </div>
  )
}

export default ActivityHistory
