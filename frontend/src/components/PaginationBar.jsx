import './PaginationBar.css'

const PaginationBar = ({ page, pages, total, limit, onPageChange, isMobile = false }) => {
  if (!pages || pages <= 0) return null

  const currentPage = Math.min(Math.max(page || 1, 1), pages)
  const pageSize = limit || 0

  const startIndex = total === 0 || pageSize === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endIndex = total === 0 || pageSize === 0 ? 0 : Math.min(currentPage * pageSize, total)

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < pages

  const handlePageClick = (targetPage) => {
    if (targetPage < 1 || targetPage > pages || targetPage === currentPage) return
    onPageChange?.(targetPage)
  }

  // Mobile compact variant: Prev | Page X of Y | Next
  if (isMobile) {
    return (
      <div className="pagination-mobile">
        <button
          type="button"
          className="pagination-mobile-btn"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={!canGoPrev}
        >
          Prev
        </button>
        <span className="pagination-mobile-info">
          Page {currentPage} of {pages}
        </span>
        <button
          type="button"
          className="pagination-mobile-btn"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={!canGoNext}
        >
          Next
        </button>
      </div>
    )
  }

  const renderPageNumbers = () => {
    const items = []
    const maxVisible = 7

    if (pages <= maxVisible) {
      for (let p = 1; p <= pages; p += 1) {
        items.push(p)
      }
    } else {
      const left = Math.max(2, currentPage - 1)
      const right = Math.min(pages - 1, currentPage + 1)

      items.push(1)
      if (left > 2) items.push('ellipsis-left')

      for (let p = left; p <= right; p += 1) {
        items.push(p)
      }

      if (right < pages - 1) items.push('ellipsis-right')
      items.push(pages)
    }

    return items
  }

  const pageNumbers = renderPageNumbers()

  return (
    <div className="pagination-bar">
      <div className="pagination-left">
        <div className="rows-per-page">
          <span className="rows-label">Rows per page</span>
          <select value={pageSize || 50} disabled>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="pagination-summary">
          {total > 0
            ? `Showing ${startIndex.toLocaleString()}–${endIndex.toLocaleString()} of ${total.toLocaleString()}`
            : 'No results'}
        </div>
      </div>

      <div className="pagination-right">
        <button
          type="button"
          className="pagination-nav-btn"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={!canGoPrev}
        >
          Prev
        </button>

        <div className="pagination-pages">
          {pageNumbers.map((item, index) => {
            if (item === 'ellipsis-left' || item === 'ellipsis-right') {
              return (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  …
                </span>
              )
            }
            const isActive = item === currentPage
            return (
              <button
                key={item}
                type="button"
                className={`pagination-page-btn ${isActive ? 'active' : ''}`}
                onClick={() => handlePageClick(item)}
              >
                {item}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="pagination-nav-btn"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={!canGoNext}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default PaginationBar


