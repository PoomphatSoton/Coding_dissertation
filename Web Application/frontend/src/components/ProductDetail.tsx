import { useState } from 'react'
import { Badge, Button, Image, Row, Stack } from 'react-bootstrap'
import { formatPrice, formatPriceRange } from '../format'
import type { ProductDetail as ProductDetailData, ProductVariant } from '../types'

interface ProductDetailProps {
  detail: ProductDetailData
  onBack: () => void
  onAdd: (variant: ProductVariant, quantity: number) => void
}

function unique(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

export function ProductDetail({ detail, onBack, onAdd }: ProductDetailProps) {
  const { product, variants } = detail
  const images = detail.images.length
    ? detail.images
    : product.featured_image_url
      ? [{ image_index: 0, image_url: product.featured_image_url, alt: product.title }]
      : []
  const available = variants.filter((variant) => variant.in_stock)
  const colors = unique(available.map((variant) => variant.color))
  const sizes = unique(available.map((variant) => variant.size))
  const initialVariant = available[0]
  const [image, setImage] = useState(images[0]?.image_url ?? null)
  const [color, setColor] = useState<string | null>(initialVariant?.color ?? null)
  const [size, setSize] = useState<string | null>(initialVariant?.size ?? null)
  const [quantity, setQuantity] = useState(1)
  const selectedVariant = available.find((variant) =>
    variant.color === color && variant.size === size,
  )

  function selectColor(value: string) {
    const next = available.find((variant) => variant.color === value && variant.size === size)
      ?? available.find((variant) => variant.color === value)
    setColor(next?.color ?? null)
    setSize(next?.size ?? null)
  }

  function selectSize(value: string) {
    const next = available.find((variant) => variant.size === value && variant.color === color)
      ?? available.find((variant) => variant.size === value)
    setColor(next?.color ?? null)
    setSize(next?.size ?? null)
  }

  return (
    <div>
      <Button variant="outline-secondary" size="sm" className="mb-3" onClick={onBack}>
        ← Back to results
      </Button>
      <Row className="g-4">
        <div className="w-50">
          {image ? (
            <Image src={image} alt={product.title} fluid className="product-detail-image" />
          ) : (
            <div className="product-detail-image d-flex align-items-center justify-content-center text-secondary">
              No image
            </div>
          )}
          {images.length > 1 && (
            <Stack direction="horizontal" gap={2} className="mt-2 flex-wrap">
              {images.map((item) => (
                <Button
                  key={item.image_index}
                  variant={image === item.image_url ? 'dark' : 'outline-secondary'}
                  className="product-thumbnail p-1"
                  aria-label={`Show image ${item.image_index + 1}`}
                  onClick={() => setImage(item.image_url)}
                >
                  <Image src={item.image_url} alt={item.alt || product.title} />
                </Button>
              ))}
            </Stack>
          )}
        </div>

        <div className="w-50">
          {product.product_type && <Badge bg="secondary">{product.product_type}</Badge>}
          <h2 className="h3 mt-2">{product.title}</h2>
          {product.category_full_path && <p className="small text-secondary">{product.category_full_path}</p>}
          <p className="h4">
            {selectedVariant
              ? formatPrice(selectedVariant.price_usd)
              : formatPriceRange(product.price_min_usd, product.price_max_usd)}
          </p>
          <p className="small">
            {product.review_rating == null
              ? 'No rating available'
              : `★ ${product.review_rating.toFixed(1)} (${product.review_count ?? 0} reviews)`}
          </p>
          <Badge bg={product.in_stock_any ? 'success' : 'secondary'}>
            {product.in_stock_any ? 'In stock' : 'Out of stock'}
          </Badge>

          {colors.length > 0 && (
            <div className="mt-4">
              <h3 className="h6">Color</h3>
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                {colors.map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={color === value ? 'dark' : 'outline-secondary'}
                    onClick={() => selectColor(value)}
                  >
                    {value}
                  </Button>
                ))}
              </Stack>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mt-3">
              <h3 className="h6">Size</h3>
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                {sizes.map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={size === value ? 'dark' : 'outline-secondary'}
                    onClick={() => selectSize(value)}
                  >
                    {value}
                  </Button>
                ))}
              </Stack>
            </div>
          )}

          <p className="small text-secondary mt-3">{available.length} of {variants.length} variants available</p>
          <Stack direction="horizontal" gap={2} className="mt-4">
            <Button variant="outline-secondary" disabled={quantity === 1} onClick={() => setQuantity(quantity - 1)} aria-label="Decrease quantity">−</Button>
            <span className="px-2 fw-semibold" aria-live="polite">{quantity}</span>
            <Button variant="outline-secondary" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</Button>
            <Button
              variant="dark"
              className="ms-2"
              disabled={!selectedVariant}
              onClick={() => selectedVariant && onAdd(selectedVariant, quantity)}
            >
              Add to cart
            </Button>
          </Stack>
          {!selectedVariant && <p className="small text-danger mt-2">This option is unavailable.</p>}
        </div>
      </Row>

      <section className="border-top mt-4 pt-4">
        <h3 className="h5">Product details</h3>
        <p className="mb-0">{product.description}</p>
      </section>
    </div>
  )
}
