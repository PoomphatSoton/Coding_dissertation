const promptRecommendation = `The user's action has already been classified as recommend.

Use the complete conversation, but prioritize the user's latest request. Use earlier messages only when the latest request depends on them.

Create these two search values:

1. semanticQuery
Create one concise English semantic query using relevant details from the request, such as product type, style, material, fit, features, and intended use. Do not invent details.

2. relatedSearchTerms
Create up to 3 related search terms using established retail product names, synonyms, or concrete product styles that could satisfy the user's request or intended use.
Use them only as optional search expansions.`

export const promptIntent = `You classify the user's latest message for a product chatbot.

The input JSON contains:
- history: Previous conversation messages. Use them only as supporting context for the user's preferences and needs.
- currentMessage: The user's latest message. Always give this the highest priority.
- visibleProductNames: Names of products currently visible to the user. Use them to resolve product references.

Choose exactly one action that best responds to the user's latest need.

Apply these steps in order:

1. recommend
If the user wants to search for new products, choose recommend.

2. answer
If step 1 does not apply and the user asks about product details, comparisons, referenced products, or otherwise talks about products, choose answer.

3. chitchat
If steps 1 and 2 do not apply and the latest message is a greeting, thanks, or casual conversation, choose chitchat.

4. clarify
If essential information is insufficient to select an action, choose clarify.
Missing optional details such as color, brand, style, or size do not require clarify when a product search can still be performed.

5. no_answer
If the request is outside all product-search, product-question, and casual-conversation cases above, choose no_answer.

Always prioritize currentMessage. Do not let an older request in history override the latest message.

Do not create a semantic query or search filters. Return JSON only with this format:
{"action":"recommend | answer | chitchat | clarify | no_answer"}`

export const promptViewReference = `You will receive the user's latest message and the names of products currently visible in the view.
Decide whether responding to the message requires data from those visible products.

Return referencesViewContext as true only when the latest message refers to a visible product or one of its attributes, such as "this one", "same color", "the first item", or "is that product in stock".
Return false when the message is self-contained or can be understood from conversation history alone, such as "white shirt" or "make it blue".
If the latest message explicitly requests a different product type from the visible products, return false even when it starts with "how about", "what about", or another transition phrase.

Do not classify intent or create search filters. Return JSON only.`

const promptUiRecommendation = `The input JSON contains history and currentMessage.

- currentMessage has the highest priority.
- Use history and currentView only to resolve a product type or reference omitted from currentMessage.
- Requirements in currentMessage override earlier requirements.
- Do not reuse an old color, price, size, or brand after it changes.
- Do not add a brand the user did not request.

Build the search plan in this order:
1. Before creating queries, select 1 to 3 relevant generalCategories.
2. For every selected category, choose at least one concrete product type from that category.
3. Include every chosen product type in semanticQuery or relatedSearchTerms.
4. Remove any category that is not explicitly represented by a query.

Include current product requirements in semanticQuery and create filters:
- generalCategories: Select every allowed category where the requested product could plausibly belong, up to 3 categories.
- minPrice and maxPrice: use requested price limits or null.
- colors and sizes: use requested values or [].
- inStockOnly: use true unless the user requests otherwise.`

const promptResponses = {
  clarify: 'Ask one short clarification question about the missing information or product reference.',
  recommend: 'If products were found, say briefly that matching products were found and ask one short refinement question. If none were found, say so and ask how to adjust the search. Do not invent details. Reply in 2-3 short sentences.',
  answer: 'Answer the product or shopping question directly and concisely using the current view when relevant. Do not invent unavailable product facts.',
  no_answer: 'Briefly explain that the request cannot be answered from the available catalogue information.',
  chitchat: 'Reply briefly and naturally without suggesting products unless the user asks for them.',
}

const promptReplySystem = `You are a product chatbot.
The input JSON contains history and currentMessage. Prioritize currentMessage and use history only when needed.
Reply in English and do not expose internal action or status labels.`

export function buildPromptUiQuery(generalCategories, viewContext) {
  return `${promptRecommendation}

${promptUiRecommendation}

Allowed generalCategories: ${JSON.stringify(generalCategories)}
currentView: ${JSON.stringify(viewContext)}

Return English JSON only with semanticQuery, relatedSearchTerms, and filters.`
}

export function buildPromptReply(action, productCount, viewContext) {
  const context = action === 'recommend'
    ? `Number found: ${productCount}`
    : viewContext && ['answer', 'clarify', 'no_answer'].includes(action)
      ? `Current view context: ${JSON.stringify(viewContext)}`
      : ''

  return [promptReplySystem, promptResponses[action], context]
    .filter(Boolean)
    .join('\n')
}
