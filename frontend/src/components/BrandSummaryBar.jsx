import { useMemo } from 'react'
import { getDisplayBrand } from '../utils/brandUtils'
import './BrandSummaryBar.css'

const BrandSummaryBar = ({ products, selectedBrand }) => {
  // Only show when a brand is selected
  if (!selectedBrand || selectedBrand === '') {
    return null
  }

  // Calculate summary stats from filtered products
  const summary = useMemo(() => {
    const totalProducts = products.length
    const totalInventory = products.reduce((sum, p) => sum + (p.inventory || 0), 0)
    const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.inventory || 0)), 0)

    return {
      totalProducts,
      totalInventory,
      totalValue,
    }
  }, [products])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const displayBrand = getDisplayBrand(selectedBrand)

  return (
    <div className="brand-summary">
      <div className="brand-title">{displayBrand}</div>
      <div className="brand-metrics">
        <div className="metric">
          <span className="metric-value">{summary.totalProducts}</span>
          <span className="metric-label">Products</span>
        </div>
        <div className="metric">
          <span className="metric-value">{summary.totalInventory.toLocaleString()}</span>
          <span className="metric-label">Inventory</span>
        </div>
        <div className="metric">
          <span className="metric-value">{formatCurrency(summary.totalValue)}</span>
          <span className="metric-label">Value</span>
        </div>
      </div>
    </div>
  )
}

export default BrandSummaryBar

