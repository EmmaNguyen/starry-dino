import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Sample knowledge base - in production, this would be indexed in Turbopuffer
const sampleKnowledge = [
  { id: 1, text: "Quantum computing uses quantum bits or qubits, which can exist in superposition of states.", topic: "quantum" },
  { id: 2, text: "Superposition allows qubits to represent multiple states simultaneously, enabling parallel processing.", topic: "quantum" },
  { id: 3, text: "Entanglement is a quantum phenomenon where particles become correlated regardless of distance.", topic: "quantum" },
  { id: 4, text: "Machine learning algorithms can be trained on large datasets to recognize patterns.", topic: "ai" },
  { id: 5, text: "Neural networks are inspired by the human brain's structure and function.", topic: "ai" },
  { id: 6, text: "Climate change refers to long-term shifts in global temperatures and weather patterns.", topic: "climate" },
  { id: 7, text: "Greenhouse gases like CO2 trap heat in the Earth's atmosphere.", topic: "climate" },
  { id: 8, text: "Renewable energy sources include solar, wind, and hydroelectric power.", topic: "energy" },
  { id: 9, text: "Y Combinator is a startup accelerator that provides seed funding, advice, and connections.", topic: "yc" },
  { id: 10, text: "YC has funded over 4,000 startups including Airbnb, Dropbox, and Stripe.", topic: "yc" },
  { id: 11, text: "The YC program runs twice a year and accepts startups through a competitive application process.", topic: "yc" },
  { id: 12, text: "Y Combinator invests $500,000 in each startup for 7% equity.", topic: "yc" },
  { id: 13, text: "Bloomberg LP is a financial, software, data, and media company headquartered in Midtown Manhattan, New York City.", topic: "bloomberg" },
  { id: 14, text: "Bloomberg was founded by Michael Bloomberg in 1981 and has grown to become a global financial data and analytics powerhouse.", topic: "bloomberg" },
  { id: 15, text: "The Bloomberg Terminal is a computer software system provided by Bloomberg L.P. that enables financial professionals to access Bloomberg's financial data.", topic: "bloomberg" },
  { id: 16, text: "Bloomberg News is a global news organization delivering business and markets news, data, and analysis.", topic: "bloomberg" },
  { id: 17, text: "Bloomberg Philanthropies focuses on public health, environment, education, and the arts, with over $10 billion in total giving.", topic: "bloomberg" },
  { id: 18, text: "Michael Bloomberg served as the 108th mayor of New York City from 2002 to 2013 and is a major philanthropist.", topic: "bloomberg" },
]

export async function semanticSearch(query, topK = 3) {
  try {
    const apiKey = process.env.TURBOPUFFER_API_KEY
    
    if (apiKey && apiKey !== 'your_turbopuffer_api_key_here') {
      // Use Turbopuffer API if API key is provided
      return await turbopufferSearch(query, topK, apiKey)
    } else {
      // Fallback to simple keyword matching
      console.log('Turbopuffer API key not set, using simple search fallback')
      return await simpleSearch(query, topK)
    }
  } catch (error) {
    console.error('Semantic search error:', error)
    // Fallback to simple search on error
    console.log('Turbopuffer API error, using simple search fallback')
    return await simpleSearch(query, topK)
  }
}

async function turbopufferSearch(query, topK, apiKey) {
  try {
    // Import Turbopuffer dynamically
    const { TPClient } = await import('@turbopuffer/turbopuffer')
    
    const tp = new TPClient({
      apiKey: apiKey
    })

    // For this MVP, we'll use the knowledge base directly with Turbopuffer-style search
    // In production, you would:
    // 1. Index your documents in Turbopuffer
    // 2. Use vector embeddings for semantic search
    // 3. Query the Turbopuffer API
    
    // For now, we'll simulate Turbopuffer by using the simple search
    // but log that we're using the API key
    console.log('Using Turbopuffer API for search (simulated with local knowledge base)')
    return await simpleSearch(query, topK)
    
    // To implement actual Turbopuffer API:
    // const results = await tp.query({
    //   vector: queryEmbedding,
    //   topK: topK,
    //   namespace: 'your-namespace'
    // })
    // return processTurbopufferResults(results)
    
  } catch (error) {
    console.error('Turbopuffer API error:', error)
    throw error
  }
}

async function simpleSearch(query, topK) {
  // Handle empty query
  if (!query || query.trim() === '') {
    return {
      context: 'No relevant information found in the knowledge base.',
      sources: []
    }
  }

  const queryLower = query.toLowerCase()
  const relevantDocs = sampleKnowledge
    .filter(doc => 
      doc.text.toLowerCase().includes(queryLower) || 
      doc.topic.toLowerCase().includes(queryLower)
    )
    .slice(0, topK)

  const context = relevantDocs.map(doc => doc.text).join('\n\n')
  
  return {
    context: context || 'No relevant information found in the knowledge base.',
    sources: relevantDocs.map(doc => ({ id: doc.id, topic: doc.topic }))
  }
}
