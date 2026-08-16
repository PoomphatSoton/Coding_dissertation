const baseUrl = (process.env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '')
const chatModel = process.env.OLLAMA_CHAT_MODEL || 'qwen3:8b'
const embeddingModel = process.env.OLLAMA_EMBED_MODEL || 'embeddinggemma'

async function request(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return response.json()
}

export async function chatWithOllama(messages, { format, think = false } = {}) {
  const result = await request('/api/chat', {
    model: chatModel,
    messages,
    format,
    think,
    stream: false,
    keep_alive: '30m',
    options: { temperature: 0, seed: 42 },
  })

  return result.message.content
}

export async function embedQueries(queries) {
  if (queries.length === 0) return []

  const result = await request('/api/embed', {
    model: embeddingModel,
    input: queries.map((query) => `task: search result | query: ${query}`),
    truncate: true,
    keep_alive: '30m',
  })

  return result.embeddings
}
