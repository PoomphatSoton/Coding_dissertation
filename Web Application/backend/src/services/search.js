import { prisma } from '../db.js'
import { embedQueries } from '../../../../Shared/ollama.js'

function normalizeStrings(values) {
  if (!Array.isArray(values)) return []

  return [...new Set(
    values
      .map((value) => String(value).trim().toLowerCase())
      .filter(Boolean),
  )]
}

function normalizeLimit(value, fallback) {
  const limit = Math.trunc(Number(value))
  return Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : fallback
}

function sizeMatches(requested, available) {
  const requestedParts = String(requested).toLowerCase().match(/[a-z]+|\d+(?:\.\d+)?/g) ?? []
  const availableParts = String(available).toLowerCase().match(/[a-z]+|\d+(?:\.\d+)?/g) ?? []
  return requestedParts.length > 0
    && requestedParts.every((part) => availableParts.includes(part))
}

function filterBySizes(products, requestedSizes) {
  if (!requestedSizes.length) return products

  return products.filter((product) =>
    (product.variants ?? []).some((variant) =>
      requestedSizes.some((size) => sizeMatches(size, variant.size)),
    ),
  )
}

export async function matchProducts(vector, {
  generalCategories = [],
  productTypes = [],
  minPrice = null,
  maxPrice = null,
  colors = [],
  sizes = [],
  inStockOnly = true,
  limit = 8,
} = {}) {
  const queryVector = `[${vector.join(',')}]`
  const categories = normalizeStrings(generalCategories)
  const types = normalizeStrings(productTypes)
  const colorFilters = normalizeStrings(colors)
  const sizeFilters = normalizeStrings(sizes)
  const resultLimit = normalizeLimit(limit, 8)
  const databaseLimit = sizeFilters.length
    ? Math.min(resultLimit * 4, 100)
    : resultLimit

  const products = await prisma.$queryRaw`
    select
      p.id::text as id,
      p.title,
      p.product_type,
      p.general_category,
      p.category_full_path,
      p.description,
      p.price_min_usd,
      p.price_max_usd,
      p.in_stock_any,
      p.featured_image_url,
      p.review_count,
      p.review_rating,
      p.created_at,
      1 - (p.embedding <=> ${queryVector}::extensions.vector) as similarity,
      array(
        select distinct v.color
        from public.variants v
        where v.product_id = p.id
          and v.color is not null
      ) as colors,
      array(
        select distinct v.size
        from public.variants v
        where v.product_id = p.id
          and v.size is not null
      ) as sizes,
      coalesce((
        select jsonb_agg(jsonb_build_object(
          'color', v.color,
          'size', v.size,
          'in_stock', v.in_stock
        ))
        from public.variants v
        where v.product_id = p.id
      ), '[]'::jsonb) as variants
    from public.products p
    where p.embedding is not null
      and (
        cardinality(${categories}::text[]) = 0
        or lower(p.general_category) = any(${categories}::text[])
      )
      and (
        cardinality(${types}::text[]) = 0
        or lower(p.product_type) = any(${types}::text[])
      )
      and (
        ${minPrice}::numeric is null
        or p.price_max_usd >= ${minPrice}::numeric
      )
      and (
        ${maxPrice}::numeric is null
        or p.price_min_usd <= ${maxPrice}::numeric
      )
      and (
        ${inStockOnly !== false}::boolean = false
        or p.in_stock_any = true
      )
      and (
        cardinality(${colorFilters}::text[]) = 0
        or exists (
          select 1
          from public.variants v
          where v.product_id = p.id
            and lower(v.color) = any(${colorFilters}::text[])
            and (
              ${inStockOnly !== false}::boolean = false
              or v.in_stock = true
            )
        )
      )
    order by p.embedding <=> ${queryVector}::extensions.vector
    limit ${databaseLimit}
  `

  return filterBySizes(products, sizeFilters)
    .slice(0, resultLimit)
    .map(({ variants, ...product }) => product)
}

export async function semanticSearch({
  queries,
  limit = 30,
  ...options
}) {
  const resultLimit = normalizeLimit(limit, 30)
  const vectors = await embedQueries(queries)
  const resultSets = await Promise.all(
    vectors.map((vector) => matchProducts(vector, { ...options, limit: resultLimit })),
  )
  const productsById = new Map()
  const scores = new Map()

  resultSets.forEach((products, queryIndex) => {
    const weight = queryIndex === 0 ? 1 : 0.3
    products.forEach((product, rank) => {
      const id = String(product.id)
      if (!productsById.has(id)) productsById.set(id, product)
      scores.set(id, (scores.get(id) ?? 0) + weight / (61 + rank))
    })
  })

  return [...productsById.entries()]
    .sort(([firstId], [secondId]) => scores.get(secondId) - scores.get(firstId))
    .slice(0, resultLimit)
    .map(([, product]) => product)
}
