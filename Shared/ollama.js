async function request(path, body) {
  const response = await fetch(`http://127.0.0.1:11434${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function chatWithOllama(
  messages,
  { format, think = false, model = "qwen3:8b" } = {},
) {
  const result = await request("/api/chat", {
    model,
    messages,
    format,
    think,
    stream: false,
    keep_alive: "30m",
    options: { temperature: 0, seed: 42 },
  });

  return result.message.content;
}

export async function embedQueries(queries) {
  if (queries.length === 0) return [];

  const result = await request("/api/embed", {
    model: "embeddinggemma",
    input: queries.map((query) => `task: search result | query: ${query}`),
    truncate: true,
    keep_alive: "30m",
  });

  return result.embeddings;
}
