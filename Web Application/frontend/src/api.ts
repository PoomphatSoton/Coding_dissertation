import type {
  ChatMessage,
  ChatProduct,
  ChatResponse,
  ChatViewContext,
  ProductDetail,
  ProductListItem,
  ProductRecord,
} from './types'

const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, options)

  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string } | null
    throw new Error(error?.message ?? `Request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

function normalizeProduct<T extends ProductListItem>(product: T): T {
  return {
    ...product,
    id: String(product.id),
    price_min_usd: Number(product.price_min_usd),
    price_max_usd: Number(product.price_max_usd),
    review_count: product.review_count == null ? null : Number(product.review_count),
    review_rating: product.review_rating == null ? null : Number(product.review_rating),
    colors: product.colors ?? [],
    sizes: product.sizes ?? [],
  }
}

export async function getProducts({
  limit = 20,
  offset = 0,
  generalCategory,
}: {
  limit?: number
  offset?: number
  generalCategory?: string
} = {}): Promise<{
  products: ProductRecord[]
  pagination: { total: number; limit: number; offset: number }
}> {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  if (generalCategory) query.set('generalCategory', generalCategory)

  const data = await request<{
    products: ProductRecord[]
    pagination: { total: number; limit: number; offset: number }
  }>(`/api/products?${query}`)

  return { ...data, products: data.products.map(normalizeProduct) }
}

export async function getCategories(): Promise<string[]> {
  const data = await request<{ generalCategories: string[] }>('/api/products/categories')
  return data.generalCategories
}

export async function searchProducts({
  query,
  generalCategory,
  limit = 50,
}: {
  query: string
  generalCategory?: string
  limit?: number
}): Promise<ProductListItem[]> {
  const params = new URLSearchParams({ query, limit: String(limit) })
  if (generalCategory) params.set('generalCategory', generalCategory)

  const data = await request<{ products: ProductListItem[] }>(
    `/api/products/search/vector?${params}`,
  )
  return data.products.map(normalizeProduct)
}

export async function getProductDetail(id: string): Promise<ProductDetail> {
  const data = await request<ProductDetail>(`/api/products/${encodeURIComponent(id)}`)

  return {
    ...data,
    product: normalizeProduct(data.product),
    variants: data.variants.map((variant) => ({
      ...variant,
      price_usd: Number(variant.price_usd),
      compare_at_price_usd:
        variant.compare_at_price_usd === null
          ? null
          : Number(variant.compare_at_price_usd),
    })),
  }
}

export async function sendChat(
  messages: ChatMessage[],
  viewContext: ChatViewContext,
): Promise<ChatResponse> {
  const data = await request<ChatResponse>('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map(({ role, text }) => ({ role, content: text })),
      viewContext,
    }),
  })

  return {
    ...data,
    products:
      data.products?.map((product): ChatProduct => ({
        ...normalizeProduct(product),
        similarity: Number(product.similarity),
      })) ?? null,
  }
}
