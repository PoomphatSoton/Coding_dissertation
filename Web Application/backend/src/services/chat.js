import {
  buildPromptReply,
  buildPromptUiQuery,
  promptIntent,
  promptViewReference,
} from '../prompts.js'
import { chatWithOllama } from '../../../../Shared/ollama.js'
import { getCategories } from './products.js'
import { semanticSearch } from './search.js'

const actions = ['clarify', 'chitchat', 'recommend', 'answer', 'no_answer']

function schema(properties) {
  return {
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  }
}

function splitConversation(messages) {
  const index = messages.findLastIndex((message) => message.role === 'user')

  return {
    history: messages.slice(0, index),
    currentMessage: messages[index].content,
  }
}

function conversationInput(conversation) {
  return {
    role: 'user',
    content: JSON.stringify(conversation),
  }
}

async function callJson(messages, properties, think = false) {
  const content = await chatWithOllama(messages, {
    format: schema(properties),
    think,
  })

  return JSON.parse(content)
}

function getViewProducts(viewContext) {
  if (viewContext?.type === 'product_list') return viewContext.products ?? []
  return viewContext?.product ? [viewContext.product] : []
}

async function referencesView(conversation, visibleProductNames) {
  if (visibleProductNames.length === 0) return false

  const result = await callJson([
    { role: 'system', content: promptViewReference },
    {
      role: 'user',
      content: JSON.stringify({
        latestUserMessage: conversation.currentMessage,
        visibleProductNames,
      }),
    },
  ], { referencesViewContext: { type: 'boolean' } })

  return result.referencesViewContext
}

function compactView(viewContext) {
  if (!viewContext) return null

  const compact = ({
    position,
    id,
    title,
    product_type: productType,
    general_category: generalCategory,
    colors = [],
    sizes = [],
  }) => ({
    position,
    id,
    title,
    productType,
    generalCategory,
    colors,
    sizes,
  })

  if (viewContext.type === 'product_list') {
    return { type: viewContext.type, products: viewContext.products.map(compact) }
  }

  return { type: viewContext.type, product: compact(viewContext.product) }
}

function compactReplyView(viewContext) {
  if (!viewContext) return null

  const compact = (product) => ({
    position: product.position ?? null,
    title: product.title ?? product.name ?? null,
    productType: product.product_type ?? product.productType ?? null,
    price: product.price ?? product.price_min_usd ?? null,
    colors: product.colors ?? [],
    sizes: product.sizes ?? [],
    inStock: product.inStock ?? product.in_stock_any ?? null,
    description: product.description ?? null,
  })

  if (viewContext.type === 'product_list') {
    return { type: viewContext.type, products: viewContext.products.map(compact) }
  }

  return { type: viewContext.type, product: compact(viewContext.product) }
}

function queryProperties(generalCategories) {
  const strings = { type: 'array', items: { type: 'string' } }

  return {
    semanticQuery: { type: 'string' },
    relatedSearchTerms: { ...strings, maxItems: 3 },
    filters: schema({
      generalCategories: {
        type: 'array',
        items: { enum: generalCategories },
      },
      minPrice: { type: ['number', 'null'] },
      maxPrice: { type: ['number', 'null'] },
      colors: strings,
      sizes: strings,
      inStockOnly: { type: 'boolean' },
    }),
  }
}

async function analyzeChat(messages, viewContext) {
  const conversation = splitConversation(messages)
  const currentViewProductNames = getViewProducts(viewContext)
    .map((product) => product.title ?? product.name)
    .filter(Boolean)
    .slice(0, 8)
  const useView = await referencesView(conversation, currentViewProductNames)
  const visibleProductNames = useView ? currentViewProductNames : []
  const intent = await callJson([
    { role: 'system', content: promptIntent },
    conversationInput({ ...conversation, visibleProductNames }),
  ], { action: { enum: actions } })

  if (intent.action !== 'recommend') return { ...intent, useView }

  const categories = await getCategories()
  const search = await callJson([
    {
      role: 'system',
      content: buildPromptUiQuery(
        categories,
        useView ? compactView(viewContext) : null,
      ),
    },
    conversationInput(conversation),
  ], queryProperties(categories), true)

  return { ...intent, useView, ...search }
}

async function recommend(analysis) {
  return semanticSearch({
    queries: [
      analysis.semanticQuery,
      ...analysis.relatedSearchTerms,
    ],
    ...analysis.filters,
    limit: 30,
  })
}

async function reply(messages, viewContext, action, products, useView) {
  const conversation = splitConversation(messages)
  const replyViewContext = useView
    && ['answer', 'clarify', 'no_answer'].includes(action)
    ? compactReplyView(viewContext)
    : null

  return chatWithOllama([
    {
      role: 'system',
      content: buildPromptReply(
        action,
        products?.length ?? 0,
        replyViewContext,
      ),
    },
    conversationInput(conversation),
  ])
}

function removeSimilarity(products) {
  return products?.map(({ similarity, ...product }) => product) ?? null
}

export async function chat(messages, viewContext = null) {
  const analysis = await analyzeChat(messages, viewContext)
  const products = analysis.action === 'recommend'
    ? await recommend(analysis)
    : null
  const message = await reply(
    messages,
    viewContext,
    analysis.action,
    products,
    analysis.useView,
  )

  return {
    products: removeSimilarity(products),
    message,
  }
}
