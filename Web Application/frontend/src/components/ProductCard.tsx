import { Badge, Card } from 'react-bootstrap'
import { formatPriceRange } from '../format'
import type { ProductListItem } from '../types'

interface ProductCardProps {
  product: ProductListItem
  onSelect: () => void
}

function shortList(values: string[], limit: number) {
  if (!values.length) return null
  const rest = values.length - limit
  return `${values.slice(0, limit).join(', ')}${rest > 0 ? ` +${rest}` : ''}`
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const colors = shortList(product.colors, 3)
  const sizes = shortList(product.sizes, 4)

  return (
    <Card
      className="h-100 product-card"
      role="button"
      tabIndex={0}
      aria-label={`View ${product.title}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      {product.featured_image_url ? (
        <Card.Img className="product-image" variant="top" src={product.featured_image_url} alt={product.title} />
      ) : (
        <div className="product-image d-flex align-items-center justify-content-center text-secondary">
          No image
        </div>
      )}
      <Card.Body className="d-flex flex-column p-2">
        {product.product_type && <Badge bg="secondary" className="align-self-start">{product.product_type}</Badge>}
        <Card.Title className="small fw-semibold mt-2">{product.title}</Card.Title>
        <div className="small mb-2">
          {product.review_rating == null
            ? <span className="text-secondary">No ratings</span>
            : <span><span aria-hidden="true">★</span> {product.review_rating.toFixed(1)} <span className="text-secondary">({product.review_count ?? 0})</span></span>}
        </div>
        {colors && <small className="text-secondary">Colors: {colors}</small>}
        {sizes && <small className="text-secondary">Sizes: {sizes}</small>}
        <strong className="small mt-auto pt-2">
          {formatPriceRange(product.price_min_usd, product.price_max_usd)}
        </strong>
      </Card.Body>
    </Card>
  )
}
