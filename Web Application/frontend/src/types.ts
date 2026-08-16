export interface ProductListItem {
  id: string
  title: string
  product_type: string | null
  general_category: string | null
  category_full_path: string | null
  description: string
  price_min_usd: number
  price_max_usd: number
  in_stock_any: boolean
  featured_image_url: string | null
  review_count: number | null
  review_rating: number | null
  colors: string[]
  sizes: string[]
  created_at: string
}

export interface ProductVariant {
  variant_title: string
  price_usd: number
  in_stock: boolean
  size: string | null
  color: string | null
}

export interface ProductImage {
  image_index: number
  image_url: string
  alt: string
}

export interface ProductDetail {
  product: ProductListItem
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

export type ChatProduct = ProductListItem

export type ChatViewContext =
  | {
      type: 'product_list'
      products: Array<ProductListItem & { position: number }>
    }
  | {
      type: 'product_detail'
      product: ProductListItem
      variants: Array<Pick<ProductVariant, 'variant_title' | 'price_usd' | 'in_stock' | 'size' | 'color'>>
    }

export interface ChatResponse {
  products: ChatProduct[] | null
  message: string
}
