import { useState, useMemo } from 'react'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import { useIsMobile } from '../hooks/useMediaQuery'
import { AuthContext } from '../context/AuthContext'
import { getDisplayBrand } from '../utils/brandUtils'
import { useProducts, useDeleteProduct, usePatchProduct } from '../hooks/useProducts'
import { useDashboardStats } from '../hooks/useDashboard'
import { exportToCSV } from '../services/exportService'
import InventoryTable from '../components/InventoryTable'
import StatsCards from '../components/StatsCards'
import ProductModal from '../components/ProductModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import BulkActions from '../components/BulkActions'
import BrandSummaryBar from '../components/BrandSummaryBar'
import PaginationBar from '../components/PaginationBar'
// Mobile components
import MobileHeader from '../components/mobile/MobileHeader'
import MobileStatsBar from '../components/mobile/MobileStatsBar'
import MobileSearchBar from '../components/mobile/MobileSearchBar'
import MobileProductList from '../components/mobile/MobileProductList'
import MobileFAB from '../components/mobile/MobileFAB'
import MobileFilterSheet from '../components/mobile/MobileFilterSheet'
import MobileProductModal from '../components/mobile/MobileProductModal'
import MobileActionSheet from '../components/mobile/MobileActionSheet'
import MobileSelectionBar from '../components/mobile/MobileSelectionBar'
import MobilePagination from '../components/mobile/MobilePagination'
import './Dashboard.css'
import './MobileDashboard.css'

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [filters, setFilters] = useState({
    brand: '',
    search: '',
    page: 1,
  })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [modalMode, setModalMode] = useState('view') // view, edit, create
  // Mobile action sheet
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [actionSheetProduct, setActionSheetProduct] = useState(null)
  // Shared delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteProduct, setDeleteProduct] = useState(null)
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Debounce search input (500ms)
  const debouncedSearch = useDebounce(filters.search, 500)

  // Build query filters
  const pageSize = isMobile ? 10 : 50
  const queryFilters = useMemo(() => ({
    page: filters.page,
    limit: pageSize,
    brand: filters.brand || undefined,
    search: debouncedSearch || undefined,
  }), [filters.page, filters.brand, debouncedSearch, pageSize])

  // React Query hooks - automatic caching, background refetching
  const { data: productsData, isLoading: productsLoading } = useProducts(queryFilters)
  // Fetch all products to get complete brand list (no filters)
  const { data: allProductsData } = useProducts({ limit: 10000 })
  const { data: statsData, isLoading: statsLoading, isError: statsError, error: statsErrorObj } = useDashboardStats()
  const deleteProductMutation = useDeleteProduct()
  const patchProductMutation = usePatchProduct()

  // Extract data with safe defaults
  const products = productsData?.data || []
  const pagination = productsData?.pagination || { page: 1, limit: pageSize, total: 0, pages: 0 }
  const allProducts = allProductsData?.data || []
  
  // Build brands dynamically from products + a small static list (so new brands are always available)
  const brands = useMemo(() => {
    const STATIC_BRANDS = ['Timex', 'Cerruti']
    return [...allProducts.map(p => p.brand), ...STATIC_BRANDS]
      .filter(Boolean)          // remove null/undefined
      .map(b => b.trim())       // remove extra spaces
      .filter(b => b.length)    // remove empty strings
      .filter((b, i, a) => a.indexOf(b) === i) // unique
      .sort((a, b) => a.localeCompare(b))
  }, [allProducts])
  // Always provide a stats object so KPI cards never disappear (prevents "nothing shows")
  const stats = statsData?.data || {
    totalProducts: 0,
    totalStock: 0,
    totalStoreValue: 0,
    outOfStockCount: 0,
  }
  if (statsError) {
    console.error('Dashboard stats failed:', statsErrorObj)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      if (prev[key] === value) return prev
      return {
        ...prev,
        [key]: value,
        page: 1, // Reset to first page on filter change
      }
    })
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      handlePageChange(pagination.page + 1)
    }
  }

  const handleClearFilters = () => {
    setFilters({ brand: '', search: '', page: 1 })
  }

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setModalMode('create')
    setShowModal(true)
  }

  // Unified delete handler - opens confirmation modal
  const handleDeleteClick = (product) => {
    setDeleteProduct(product)
    setShowDeleteConfirm(true)
  }

  // Confirmed delete - calls API and updates UI
  const handleConfirmDelete = async () => {
    if (deleteProduct && deleteProduct._id) {
      try {
        await deleteProductMutation.mutateAsync(deleteProduct._id)
        // React Query automatically updates cache and refetches
        setShowDeleteConfirm(false)
        setDeleteProduct(null)
        // Also close action sheet if open
        setShowActionSheet(false)
        setActionSheetProduct(null)
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product')
      }
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setDeleteProduct(null)
  }

  // Mobile-specific handlers
  const handleMoreClick = (product) => {
    setActionSheetProduct(product)
    setShowActionSheet(true)
  }

  const handleActionSheetDelete = () => {
    if (actionSheetProduct) {
      handleDeleteClick(actionSheetProduct)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedProduct(null)
    // No need to reload - React Query handles cache updates
  }

  const handleExportCSV = async () => {
    try {
      await exportToCSV({
        brand: filters.brand || undefined,
        search: debouncedSearch || undefined,
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV')
    }
  }

  const loading = productsLoading && products.length === 0

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="mobile-dashboard">
        <MobileHeader
          user={user}
          onLogout={logout}
          onCreateProduct={handleCreateProduct}
          onExportCSV={handleExportCSV}
        />
        
        <MobileStatsBar stats={stats} />
        
        <MobileSearchBar
          value={filters.search}
          onChange={(value) => handleFilterChange('search', value)}
          onFilterClick={() => setShowFilterSheet(true)}
        />

        <main className="mobile-dashboard-main">
          {loading && products.length === 0 ? (
            <div className="mobile-loading">Loading...</div>
          ) : (
            <>
              <BrandSummaryBar 
                products={products} 
                selectedBrand={filters.brand} 
              />
              <MobileProductList
                products={products}
                onView={handleViewProduct}
                onEdit={handleEditProduct}
                onMoreClick={handleMoreClick}
                loading={productsLoading}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                page={pagination.page}
                limit={pagination.limit}
              />
              {pagination.pages > 0 &&
               !showModal &&
               !showFilterSheet &&
               !showActionSheet &&
               selectedIds.size === 0 && (
                <MobilePagination
                  page={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </main>

        {selectedIds.size > 0 ? (
          <MobileSelectionBar
            selectedCount={selectedIds.size}
            selectedIds={selectedIds}
            products={products}
            onBulkEdit={async (updates) => {
              try {
                await Promise.all(
                  Array.from(selectedIds).map(id =>
                    patchProductMutation.mutateAsync({ id, data: updates })
                  )
                )
                setSelectedIds(new Set())
              } catch (error) {
                console.error('Bulk update error:', error)
                alert('Some products failed to update')
              }
            }}
            onBulkDelete={async () => {
              if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} product(s)?`)) {
                return
              }
              try {
                await Promise.all(
                  Array.from(selectedIds).map(id =>
                    deleteProductMutation.mutateAsync(id)
                  )
                )
                setSelectedIds(new Set())
              } catch (error) {
                console.error('Bulk delete error:', error)
                alert('Some products failed to delete')
              }
            }}
            onBulkCategoryChange={async (category) => {
              try {
                await Promise.all(
                  Array.from(selectedIds).map(id =>
                    patchProductMutation.mutateAsync({ id, data: { category } })
                  )
                )
                setSelectedIds(new Set())
              } catch (error) {
                console.error('Bulk category change error:', error)
                alert('Some products failed to update')
              }
            }}
            onBulkExportCSV={async () => {
              try {
                await exportToCSV({
                  brand: filters.brand || undefined,
                  search: debouncedSearch || undefined,
                })
              } catch (error) {
                console.error('Bulk export error:', error)
                alert('Failed to export CSV')
              }
            }}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        ) : (
          <MobileFAB
            onCreateProduct={handleCreateProduct}
            onExportCSV={handleExportCSV}
          />
        )}

        <MobileFilterSheet
          isOpen={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          brands={brands}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <MobileActionSheet
          isOpen={showActionSheet}
          onClose={() => {
            setShowActionSheet(false)
            setActionSheetProduct(null)
          }}
          onDelete={handleActionSheetDelete}
        />

        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          product={deleteProduct}
        />

        {showModal && (
          <MobileProductModal
            product={selectedProduct}
            mode={modalMode}
            onClose={handleModalClose}
            onSave={handleModalClose}
            brands={brands}
          />
        )}
      </div>
    )
  }

  // Desktop Layout (unchanged)
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="dashboard-brand">
            <img
              src="https://i.ibb.co/2XHCWRL/samay-logo.png"
              alt="Samay IMS logo"
              className="dashboard-logo"
            />
            <span className="dashboard-brand-text">Samay IMS</span>
          </div>
          <div className="header-actions">
            <button
              onClick={() => navigate('/activity-history')}
              className="btn-activity-history"
            >
              Activity History
            </button>
            <span className="user-info">Welcome, {user?.name}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {loading && !stats && products.length === 0 ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <StatsCards stats={stats} />
            
            <div className="dashboard-controls">
              <div className="controls-left">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="search-input"
                />
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="brand-filter"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {getDisplayBrand(brand)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="controls-right">
                <button onClick={handleCreateProduct} className="btn-primary">
                  + Add Product
                </button>
                <button onClick={handleExportCSV} className="btn-secondary">
                  Export CSV
                </button>
              </div>
            </div>

            <BrandSummaryBar 
              products={products} 
              selectedBrand={filters.brand} 
            />

            <InventoryTable
              products={products}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteClick}
              loading={productsLoading}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              page={pagination.page}
              limit={pagination.limit}
            />

            {selectedIds.size > 0 && (
              <BulkActions
                selectedCount={selectedIds.size}
                selectedIds={selectedIds}
                products={products}
                onBulkEdit={async (updates) => {
                  // Bulk update using existing PATCH endpoint
                  try {
                    await Promise.all(
                      Array.from(selectedIds).map(id =>
                        patchProductMutation.mutateAsync({ id, data: updates })
                      )
                    )
                    setSelectedIds(new Set())
                    // React Query will refetch automatically
                  } catch (error) {
                    console.error('Bulk update error:', error)
                    alert('Some products failed to update')
                  }
                }}
                onBulkDelete={async () => {
                  if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} product(s)?`)) {
                    return
                  }
                  try {
                    await Promise.all(
                      Array.from(selectedIds).map(id =>
                        deleteProductMutation.mutateAsync(id)
                      )
                    )
                    setSelectedIds(new Set())
                    // React Query will refetch automatically
                  } catch (error) {
                    console.error('Bulk delete error:', error)
                    alert('Some products failed to delete')
                  }
                }}
                onBulkCategoryChange={async (category) => {
                  try {
                    await Promise.all(
                      Array.from(selectedIds).map(id =>
                        patchProductMutation.mutateAsync({ id, data: { category } })
                      )
                    )
                    setSelectedIds(new Set())
                    // React Query will refetch automatically
                  } catch (error) {
                    console.error('Bulk category change error:', error)
                    alert('Some products failed to update')
                  }
                }}
                onBulkExportCSV={async () => {
                  try {
                    const selectedProducts = products.filter(p => selectedIds.has(p._id))
                    await exportToCSV({
                      // Export only selected products by filtering
                      // Note: CSV export uses current filters, so we'll export all matching filters
                      // For true selected-only export, we'd need backend support, but user said no new endpoints
                      brand: filters.brand || undefined,
                      search: debouncedSearch || undefined,
                    })
                    // Note: This exports filtered products, not just selected ones
                    // To export only selected, we'd need a new endpoint (which user said not to create)
                  } catch (error) {
                    console.error('Bulk export error:', error)
                    alert('Failed to export CSV')
                  }
                }}
                onClearSelection={() => setSelectedIds(new Set())}
              />
            )}

            {pagination.pages > 0 && (
              <PaginationBar
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </main>

      {showModal && (
        <ProductModal
          product={selectedProduct}
          mode={modalMode}
          onClose={handleModalClose}
          onSave={handleModalClose}
          brands={brands}
        />
      )}

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        product={deleteProduct}
      />
    </div>
  )
}

export default Dashboard
