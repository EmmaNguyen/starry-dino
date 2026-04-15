export async function generateRAGAnswer(query, context, mode = 'podcast') {
  // Simple RAG without LLM - returns context directly with mode-appropriate prefix
  const prefixes = {
    podcast: `Let's break this down. Here's what I found: `,
    professor: `Based on the available information, here's the answer: `,
    story: `Here's the story behind this: `
  }

  const prefix = prefixes[mode] || prefixes.podcast
  
  // If no relevant context found, provide a generic response
  if (!context || context.includes('No relevant information found')) {
    return `${prefix}I couldn't find specific information about "${query}" in the knowledge base. Try asking about quantum computing, machine learning, climate change, or renewable energy.`
  }

  return `${prefix}${context}`
}
