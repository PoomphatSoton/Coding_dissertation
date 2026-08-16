import { prisma } from '../db.js'
import { semanticSearch } from './search.js'

const productSelect = {
  id: true,
  title: true,
  product_type: true,
  general_category: true,
  category_full_path: true,
  description: true,
  price_min_usd: true,
  price_max_usd: true,
  in_stock_any: true,
  featured_image_url: true,
  review_count: true,
  review_rating: true,
  created_at: true,
  variants: { select: { color: true, size: true } },
}

function uniqueValues(values) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second))
}

function toProductDto(product) {
  const variants = product.variants ?? []

  return {
    id: String(product.id),
    title: product.title,
    product_type: product.product_type ?? null,
    general_category: product.general_category ?? null,
    category_full_path: product.category_full_path ?? null,
    description: product.description,
    price_min_usd: Number(product.price_min_usd),
    price_max_usd: Number(product.price_max_usd),
    in_stock_any: product.in_stock_any,
    featured_image_url: product.featured_image_url ?? null,
    review_count: product.review_count ?? null,
    review_rating: product.review_rating == null
      ? null
      : Number(product.review_rating),
    colors: uniqueValues(product.colors ?? variants.map((variant) => variant.color)),
    sizes: uniqueValues(product.sizes ?? variants.map((variant) => variant.size)),
    created_at: product.created_at?.toISOString?.() ?? product.created_at,
  }
}

export async function getProducts({ limit, offset, generalCategory }) {
  const where = generalCategory ? { general_category: generalCategory } : undefined
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      select: productSelect,
      orderBy: { title: 'asc' },
      take: limit,
      skip: offset,
    }),
    prisma.product.count({ where }),
  ])

  return { products: products.map(toProductDto), total }
}

export async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      ...productSelect,
      variants: {
        select: {
          variant_title: true,
          price_usd: true,
          in_stock: true,
          size: true,
          color: true,
        },
        orderBy: { variant_title: 'asc' },
      },
      images: {
        select: {
          image_index: true,
          image_url: true,
          alt: true,
        },
        orderBy: { image_index: 'asc' },
      },
    },
  })

  if (!product) return null

  return {
    product: toProductDto(product),
    variants: product.variants.map((variant) => ({
      variant_title: variant.variant_title,
      price_usd: Number(variant.price_usd),
      in_stock: variant.in_stock,
      size: variant.size,
      color: variant.color,
    })),
    images: product.images.map((image) => ({
      image_index: image.image_index,
      image_url: image.image_url,
      alt: image.alt,
    })),
  }
}

export async function getCategories() {
  const rows = await prisma.product.findMany({
    where: { general_category: { not: null } },
    select: { general_category: true },
    distinct: ['general_category'],
    orderBy: { general_category: 'asc' },
  })

  return rows.map(({ general_category }) => general_category)
}

export async function searchProducts({ query, generalCategory, limit }) {
  const products = await semanticSearch({
    queries: [query],
    generalCategories: generalCategory ? [generalCategory] : [],
    inStockOnly: false,
    limit,
  })

  return products.map(toProductDto)
}
