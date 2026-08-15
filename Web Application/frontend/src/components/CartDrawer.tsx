import { Button, Image, ListGroup, Offcanvas, Stack } from 'react-bootstrap'
import { formatPrice } from '../format'
import type { CartItem } from '../types'

interface CartDrawerProps {
  isOpen: boolean
  items: CartItem[]
  onClose: () => void
  onRemove: (key: string) => void
}

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onRemove,
}: CartDrawerProps) {
  return (
    <Offcanvas show={isOpen} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Shopping cart</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {!items.length ? (
          <p className="text-secondary">Your cart is empty.</p>
        ) : (
          <ListGroup variant="flush">
            {items.map(({ key, product, variant, quantity }) => (
              <ListGroup.Item key={key} className="px-0">
                <Stack direction="horizontal" gap={3}>
                  {product.featured_image_url && (
                    <Image
                      src={product.featured_image_url}
                      alt=""
                      rounded
                      width={56}
                      height={56}
                      className="object-fit-cover"
                    />
                  )}
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="fw-semibold text-truncate">{product.title}</div>
                    <small className="text-secondary">
                      {[variant.color, variant.size].filter(Boolean).join(' / ') || variant.variant_title}
                      <br />{quantity} × {formatPrice(variant.price_usd)}
                    </small>
                  </div>
                  <Button variant="outline-danger" size="sm" onClick={() => onRemove(key)}>
                    Remove
                  </Button>
                </Stack>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  )
}
