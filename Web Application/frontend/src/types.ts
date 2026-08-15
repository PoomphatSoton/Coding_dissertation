export interface ProductListItem {
  id: string
  title: string
  product_type: string | null
  category_full_path: string | null
  price_min_usd: number
  price_max_usd: number
  featured_image_url: string | null
  review_count: number | null
  review_rating: number | null
  colors: string[]
  sizes: string[]
  created_at?: string
}

export interface ProductRecord extends ProductListItem {
  handle: string
  url: string
  general_category: string | null
  tags: string
  description: string
  in_stock_any: boolean
  variant_count: number
  image_count: number
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  sku: string | null
  variant_title: string
  price_usd: number
  compare_at_price_usd: number | null
  in_stock: boolean
  size: string | null
  color: string | null
}

export interface ProductImage {
  image_index: number
  image_url: string
  alt: string
  width: number
  height: number
}

export interface ProductDetail {
  product: ProductRecord
  variants: ProductVariant[]
  images: ProductImage[]
}

export interface CartItem {
  key: string
  product: ProductListItem
  variant: Pick<ProductVariant, 'variant_title' | 'price_usd' | 'color' | 'size'>
  quantity: number
}

export interface ChatMessage {
  id: number
  role: 'assistant' | 'user'
  text: string
}

export interface ChatProduct extends ProductListItem {
  handle: string
  url: string
  general_category: string | null
  tags: string
  description: string
  in_stock_any: boolean
  created_at: string
  updated_at: string
  similarity: number
}

export type ChatViewContext =
  | {
      type: 'product_list'
      products: Array<ProductListItem & {
        position: number
        general_category?: string | null
        description?: string
        in_stock_any?: boolean
      }>
    }
  | {
      type: 'product_detail'
      product: ProductListItem & {
        general_category?: string | null
        description?: string
        in_stock_any?: boolean
      }
      variants: Array<Pick<ProductVariant, 'variant_title' | 'price_usd' | 'in_stock' | 'size' | 'color'>>
    }

export interface ChatResponse {
  action: 'clarify' | 'recommend' | 'answer' | 'no_answer' | 'chitchat'
  matchStatus: 'relevant' | 'not relevant' | null
  products: ChatProduct[] | null
  message: string
}
