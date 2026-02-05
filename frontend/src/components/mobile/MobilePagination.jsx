import './MobilePagination.css'

const MobilePagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null

  const currentPage = Math.min(Math.max(page || 1, 1), totalPages)
  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  const handleClick = (targetPage) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === currentPage) return
    onPageChange?.(targetPage)
  }

  const buildPages = () => {
    const items = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let p = 1; p <= totalPages; p += 1) {
        items.push(p)
      }
      return items
    }

    items.push(1)

    const left = Math.max(2, currentPage - 1)
    const right = Math.min(totalPages - 1, currentPage + 1)

    if (left > 2) items.push('ellipsis-left')

    for (let p = left; p <= right; p += 1) {
      items.push(p)
    }

    if (right < totalPages - 1) items.push('ellipsis-right')

    items.push(totalPages)
    return items
  }

  const pages = buildPages()

  return (
    <div className="mobile-pagination-bar">
      <button
        type="button"
        className="mobile-pagination-btn"
        onClick={() => handleClick(currentPage - 1)}
        disabled={!canPrev}
      >
        Prev
      </button>

      <div className="mobile-pagination-pages">
        {pages.map((item, index) => {
          if (item === 'ellipsis-left' || item === 'ellipsis-right') {
            return (
              <span key={`ellipsis-${index}`} className="mobile-pagination-ellipsis">
                …
              </span>
            )
          }
          const isActive = item === currentPage
          return (
            <button
              key={item}
              type="button"
              className={`mobile-pagination-page ${isActive ? 'active' : ''}`}
              onClick={() => handleClick(item)}
            >
              {item}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="mobile-pagination-btn"
        onClick={() => handleClick(currentPage + 1)}
        disabled={!canNext}
      >
        Next
      </button>
    </div>
  )
}

export default MobilePagination



