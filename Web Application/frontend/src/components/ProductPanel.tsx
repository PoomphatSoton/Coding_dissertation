import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Col,
  Row,
  Spinner,
  Stack,
} from 'react-bootstrap'
import { getCategories, getProductDetail, getProducts, searchProducts } from '../api'
import type {
  CartItem,
  ChatProduct,
  ChatViewContext,
  ProductDetail as ProductDetailData,
  ProductListItem,
  ProductVariant,
} from '../types'
import { CartDrawer } from './CartDrawer'
import { ProductCard } from './ProductCard'
import { ProductDetail } from './ProductDetail'
import { defaultFilters, ProductFilters, type Filters } from './ProductFilters'

interface ProductPanelProps {
  chatProducts: ChatProduct[] | null
  onShowAll: () => void
  onViewContextChange: (context: ChatViewContext) => void
}

const PAGE_SIZE = 48
const FETCH_LIMIT = 100

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function ProductPanel({
  chatProducts,
  onShowAll,
  onViewContextChange,
}: ProductPanelProps) {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters })
  const [categories, setCategories] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [catalog, setCatalog] = useState<{
    products: ProductListItem[]
    total: number
    loading: boolean
    error: string | null
  }>({ products: [], total: 0, loading: true, error: null })
  const [detail, setDetail] = useState<{
    id: string | null
    data: ProductDetailData | null
    loading: boolean
    error: string | null
  }>({ id: null, data: null, loading: false, error: null })
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const cleanQuery = submittedQuery.trim()
  const isSearch = Boolean(cleanQuery)
  const hasFilters = Boolean(
    filters.sizes.length
      || filters.colors.length
      || filters.minPrice
      || filters.maxPrice
      || filters.ratings.length,
  )
  const hasControls = hasFilters || Boolean(filters.sort)
  const wideBrowse = !isSearch && hasControls
  const offset = isSearch || wideBrowse ? 0 : (page - 1) * PAGE_SIZE

  useEffect(() => {
    let ignore = false

    getCategories()
      .then((data) => { if (!ignore) setCategories(data) })
      .catch((error: unknown) => {
        if (!ignore) {
          setCatalog((current) => ({
            ...current,
            error: errorMessage(error, 'Failed to load categories'),
          }))
        }
      })

    return () => { ignore = true }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadCatalog() {
      setCatalog((current) => ({ ...current, loading: true, error: null }))

      try {
        if (isSearch) {
          const products = await searchProducts({
            query: cleanQuery,
            generalCategory: filters.category || undefined,
            limit: FETCH_LIMIT,
          })
          if (!ignore) setCatalog({ products, total: products.length, loading: false, error: null })
          return
        }

        const response = await getProducts({
          limit: wideBrowse ? FETCH_LIMIT : PAGE_SIZE,
          offset,
          generalCategory: filters.category || undefined,
        })
        if (!ignore) {
          setCatalog({
            products: response.products,
            total: response.pagination.total,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        if (!ignore) {
          setCatalog({
            products: [],
            total: 0,
            loading: false,
            error: errorMessage(error, 'Failed to load products'),
          })
        }
      }
    }

    loadCatalog()

    return () => { ignore = true }
  }, [cleanQuery, filters.category, isSearch, offset, wideBrowse])

  useEffect(() => {
    if (!detail.id) return
    let ignore = false

    getProductDetail(detail.id)
      .then((data) => {
        if (!ignore) setDetail((current) => ({ ...current, data, loading: false }))
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setDetail((current) => ({
            ...current,
            loading: false,
            error: errorMessage(error, 'Failed to load product details'),
          }))
        }
      })

    return () => { ignore = true }
  }, [detail.id])

  const displayedProducts = chatProducts ?? catalog.products
  const sizeOptions = unique(displayedProducts.flatMap((product) => product.sizes))
  const colorOptions = unique(displayedProducts.flatMap((product) => product.colors))

  const visibleProducts = useMemo(() => {
    const minPrice = filters.minPrice ? Number(filters.minPrice) : null
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null

    return displayedProducts
      .filter((product) => {
        const rating = Math.floor(product.review_rating ?? 0)
        return (
          (!filters.sizes.length || filters.sizes.some((size) => product.sizes.includes(size)))
          && (!filters.colors.length || filters.colors.some((color) => product.colors.includes(color)))
          && (minPrice === null || product.price_max_usd >= minPrice)
          && (maxPrice === null || product.price_min_usd <= maxPrice)
          && (!filters.ratings.length || filters.ratings.includes(String(rating)))
        )
      })
      .sort((first, second) => {
        if (filters.sort === 'price-asc') return first.price_min_usd - second.price_min_usd
        if (filters.sort === 'price-desc') return second.price_min_usd - first.price_min_usd
        if (filters.sort === 'top-rating') {
          return (second.review_rating ?? 0) - (first.review_rating ?? 0)
        }
        if (filters.sort === 'new-arrival') {
          const firstDate = 'created_at' in first ? Date.parse(String(first.created_at)) || 0 : 0
          const secondDate = 'created_at' in second ? Date.parse(String(second.created_at)) || 0 : 0
          return secondDate - firstDate
        }
        return 0
      })
  }, [displayedProducts, filters])

  const isChatResults = chatProducts !== null
  const pageProducts = useMemo(
    () => !isChatResults && isSearch && !hasControls
      ? visibleProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
      : visibleProducts,
    [hasControls, isChatResults, isSearch, page, visibleProducts],
  )
  const resultTotal = isSearch || isChatResults || hasControls
    ? displayedProducts.length
    : catalog.total
  const totalPages = Math.max(1, Math.ceil(catalog.total / PAGE_SIZE))
  const showPagination = !isChatResults && !hasControls && !catalog.loading && totalPages > 1
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    if (detail.id && detail.data) {
      onViewContextChange({
        type: 'product_detail',
        product: detail.data.product,
        variants: detail.data.variants,
      })
      return
    }

    onViewContextChange({
      type: 'product_list',
      products: pageProducts.slice(0, 8).map((product, index) => ({
        ...product,
        position: index + 1,
      })),
    })
  }, [detail.data, detail.id, onViewContextChange, pageProducts])

  function changeFilters(next: Filters) {
    if (next.category !== filters.category) {
      next = { ...next, sizes: [], colors: [] }
      if (isChatResults) onShowAll()
    }
    setFilters(next)
    setPage(1)
  }

  function search() {
    setSubmittedQuery(query.trim())
    setPage(1)
    if (isChatResults) onShowAll()
  }

  function clearFilters() {
    setQuery('')
    setSubmittedQuery('')
    setFilters({ ...defaultFilters })
    setPage(1)
    if (isChatResults) onShowAll()
  }

  function openProduct(id: string) {
    setDetail({ id, data: null, loading: true, error: null })
  }

  function closeProduct() {
    setDetail({ id: null, data: null, loading: false, error: null })
  }

  function addToCart(product: ProductListItem, variant: ProductVariant, quantity: number) {
    const key = `${product.id}:${variant.variant_title}`
    setCartItems((items) => {
      const existing = items.find((item) => item.key === key)
      return existing
        ? items.map((item) => item.key === key
          ? { ...item, quantity: item.quantity + quantity }
          : item)
        : [...items, { key, product, variant, quantity }]
    })
  }

  return (
    <section className="vh-100 overflow-auto bg-white p-4" aria-labelledby="products-heading">
      <Stack direction="horizontal" gap={2} className="mb-3">
        <h1 id="products-heading" className="h4 mb-0">
          {detail.id ? 'Product details' : isChatResults ? 'Chat results' : 'Products'}
        </h1>
        {!detail.id && isChatResults && (
          <Button variant="outline-secondary" size="sm" onClick={onShowAll}>Show all</Button>
        )}
        <Button
          variant="dark"
          size="sm"
          className="ms-auto"
          onClick={() => setCartOpen(true)}
        >
          Cart <Badge bg="light" text="dark">{cartCount}</Badge>
        </Button>
      </Stack>

      {detail.id ? (
        <>
          {(detail.loading || detail.error) && (
            <Button variant="outline-secondary" size="sm" className="mb-3" onClick={closeProduct}>
              Back to results
            </Button>
          )}
          {detail.loading && <div className="text-center py-5"><Spinner /></div>}
          {detail.error && <Alert variant="danger">{detail.error}</Alert>}
          {detail.data && (
            <ProductDetail
              key={detail.data.product.id}
              detail={detail.data}
              onBack={closeProduct}
              onAdd={(variant, quantity) => addToCart(detail.data!.product, variant, quantity)}
            />
          )}
        </>
      ) : (
        <>
          <ProductFilters
            query={query}
            filters={filters}
            categories={categories}
            sizeOptions={sizeOptions}
            colorOptions={colorOptions}
            onQueryChange={setQuery}
            onFiltersChange={changeFilters}
            onSearch={search}
            onClear={clearFilters}
          />

          <p className="small text-secondary">
            {!isChatResults && catalog.loading
              ? 'Loading products...'
              : `${visibleProducts.length} of ${resultTotal} products`}
            {isChatResults && <Badge bg="secondary" className="ms-2">AI result</Badge>}
          </p>

          {!isChatResults && catalog.loading && <div className="text-center py-5"><Spinner /></div>}
          {!isChatResults && catalog.error && <Alert variant="danger">{catalog.error}</Alert>}
          {(isChatResults || (!catalog.loading && !catalog.error)) && (
            pageProducts.length ? (
              <Row xs={4} className="g-2">
                {pageProducts.map((product) => (
                  <Col key={product.id}>
                    <ProductCard product={product} onSelect={() => openProduct(product.id)} />
                  </Col>
                ))}
              </Row>
            ) : <Alert variant="secondary">No results found.</Alert>
          )}

          {showPagination && (
            <Stack direction="horizontal" gap={3} className="justify-content-center mt-4">
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <span className="small text-secondary">Page {page} of {totalPages}</span>
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </Stack>
          )}
        </>
      )}

      <CartDrawer
        isOpen={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onRemove={(key) => setCartItems((items) => items.filter((item) => item.key !== key))}
      />
    </section>
  )
}
