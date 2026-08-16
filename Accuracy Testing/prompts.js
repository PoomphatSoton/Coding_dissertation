export const promptRecommendation = `The user's action has already been classified as recommend.

Use the complete conversation, but prioritize the user's latest request. Use earlier messages only when the latest request depends on them.

Create these two search values:

1. semanticQuery
Create one concise English semantic query using relevant details from the request, such as product type, style, material, fit, features, and intended use. Do not invent details.

2. relatedSearchTerms
Create up to 3 related search terms using established retail product names, synonyms, or concrete product styles that could satisfy the user's request or intended use.
Use them only as optional search expansions.

Include all explicitly requested product requirements in semanticQuery, such as color, price, size, brand, compatibility, and exclusions.

Return English JSON only with semanticQuery and relatedSearchTerms.`
