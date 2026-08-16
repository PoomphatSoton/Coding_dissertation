import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { similarity } from "ml-distance";
import { chatWithOllama, embedQueries } from "../Shared/ollama.js";
import { promptRecommendation } from "./prompts.js";

const TOP_K = 50;
const PRODUCT_FILE = new URL(
  "../Datasets/PSCon/Clean Dataset/pscon_product_table_en.jsonl",
  import.meta.url,
);

async function loadCatalog() {
  const catalog = [];
  const lines = createInterface({
    input: createReadStream(PRODUCT_FILE),
    crlfDelay: Infinity,
  });

  for await (const line of lines) {
    if (!line) continue;
    const product = JSON.parse(line);
    const vector = Float32Array.from(product.embedding);
    catalog.push({
      id: String(product.product_id),
      vector,
    });
  }

  return catalog;
}

const catalog = await loadCatalog();

function schema(properties) {
  return {
    type: "object",
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  };
}

function splitConversation(messages) {
  const index = messages.findLastIndex((message) => message.role === "user");

  return {
    history: messages.slice(0, index),
    currentMessage: messages[index].content,
  };
}

function conversationInput(conversation) {
  return {
    role: "user",
    content: JSON.stringify(conversation),
  };
}

async function callJson(messages, properties, think = false, model) {
  const content = await chatWithOllama(messages, {
    format: schema(properties),
    think,
    model,
  });

  return JSON.parse(content);
}

async function createSemanticSearch(messages, model) {
  const conversation = splitConversation(messages);
  const search = await callJson(
    [
      {
        role: "system",
        content: promptRecommendation,
      },
      conversationInput(conversation),
    ],
    {
      semanticQuery: { type: "string" },
      relatedSearchTerms: {
        type: "array",
        items: { type: "string" },
        maxItems: 3,
      },
    },
    true,
    model,
  );

  return search;
}

function matchProducts(vector) {
  const scores = catalog.map((product) => ({
    id: product.id,
    similarity: similarity.cosine(product.vector, vector),
  }));

  return scores
    .sort((first, second) => second.similarity - first.similarity)
    .slice(0, TOP_K);
}

async function semanticSearch({ queries }) {
  const vectors = await embedQueries(queries);
  const resultSets = vectors.map(matchProducts);
  const fused = new Map();

  resultSets.forEach((products, queryIndex) => {
    const weight = queryIndex === 0 ? 1 : 0.3;

    products.forEach((product, rank) => {
      fused.set(
        product.id,
        (fused.get(product.id) ?? 0) + weight / (61 + rank),
      );
    });
  });

  return [...fused.entries()]
    .sort(([, firstScore], [, secondScore]) => secondScore - firstScore)
    .slice(0, TOP_K)
    .map(([id]) => ({ id }));
}

async function recommend(analysis) {
  return semanticSearch({
    queries: [
      analysis.semanticQuery,
      ...analysis.relatedSearchTerms,
    ],
  });
}

export async function modelPipeline(messages, model) {
  const startedAt = performance.now();
  const analysis = await createSemanticSearch(messages, model);
  const search = await recommend(analysis);

  return {
    model,
    analysis,
    search,
    timing: {
      totalMs: performance.now() - startedAt,
    },
  };
}
