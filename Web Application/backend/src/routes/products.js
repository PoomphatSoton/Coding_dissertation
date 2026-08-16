import { Router } from 'express'
import {
  getCategories,
  getProductById,
  getProducts,
  searchProducts,
} from '../services/products.js'

const router = Router()
const MAX_BIGINT = 9_223_372_036_854_775_807n

function integerQuery(value, fallback, minimum, maximum) {
  const number = Number(value)
  return Number.isInteger(number)
    ? Math.min(Math.max(number, minimum), maximum)
    : fallback
}

function textQuery(value) {
  return typeof value === 'string' ? value.trim() : ''
}

router.get('/categories', async (_request, response) => {
  response.json({ generalCategories: await getCategories() })
})

router.get('/search/vector', async (request, response) => {
  const query = textQuery(request.query.query)
  if (!query) return response.json({ products: [] })

  const products = await searchProducts({
    query,
    generalCategory: textQuery(request.query.generalCategory),
    limit: integerQuery(request.query.limit, 50, 1, 100),
  })

  return response.json({ products })
})

router.get('/', async (request, response) => {
  const limit = integerQuery(request.query.limit, 20, 1, 100)
  const offset = integerQuery(request.query.offset, 0, 0, Number.MAX_SAFE_INTEGER)
  const result = await getProducts({
    limit,
    offset,
    generalCategory: textQuery(request.query.generalCategory),
  })

  response.json({
    products: result.products,
    pagination: { total: result.total, limit, offset },
  })
})

router.get('/:id', async (request, response) => {
  if (!/^\d+$/.test(request.params.id)) {
    return response.status(400).json({ message: 'Invalid product id' })
  }

  const id = BigInt(request.params.id)
  if (id > MAX_BIGINT) {
    return response.status(400).json({ message: 'Invalid product id' })
  }

  const product = await getProductById(id)
  if (!product) {
    return response.status(404).json({ message: 'Product not found' })
  }

  return response.json(product)
})

export default router
