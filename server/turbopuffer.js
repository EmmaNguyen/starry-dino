import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Qwen API configuration
const QWEN_EMBEDDING_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/embeddings'
const QWEN_CHAT_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
const QWEN_EMBEDDING_MODEL = 'text-embedding-v3'
const QWEN_CHAT_MODEL = 'qwen-turbo'

// Generate embedding using Qwen API
async function generateQwenEmbedding(text) {
  const apiKey = process.env.QWEN_API_KEY
  
  if (!apiKey) {
    throw new Error('QWEN_API_KEY not found in environment variables')
  }

  try {
    const response = await fetch(QWEN_EMBEDDING_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: QWEN_EMBEDDING_MODEL,
        input: text
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Qwen API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    
    if (data.data && data.data[0] && data.data[0].embedding) {
      return data.data[0].embedding
    }
    
    throw new Error('Invalid response format from Qwen API')
  } catch (error) {
    console.error('Error generating Qwen embedding:', error.message)
    throw error
  }
}

// Generate text using Qwen chat API
export async function generateQwenText(prompt, maxTokens = 300) {
  const apiKey = process.env.QWEN_API_KEY
  
  if (!apiKey) {
    throw new Error('QWEN_API_KEY not found')
  }

  try {
    const response = await fetch(QWEN_CHAT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: QWEN_CHAT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant. Answer the user\'s question concisely and clearly based on the provided context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Qwen API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content
    }
    
    throw new Error('Invalid response format from Qwen API')
  } catch (error) {
    console.error('Error generating Qwen text:', error.message)
    throw error
  }
}

// Turbopuffer Memory class for conversation context
export class TurbopufferMemory {
  constructor(apiKey, namespace = 'voice-chatbot-memory') {
    this.apiKey = apiKey
    this.namespace = namespace
    this.baseUrl = 'https://api.turbopuffer.com'
    this.nextId = 1
  }

  async addMessage(role, content) {
    if (!this.apiKey) {
      console.log('⚠️  Turbopuffer API key not set, memory disabled')
      return
    }

    try {
      const embedding = await generateQwenEmbedding(content)
      
      const response = await fetch(`${this.baseUrl}/v1/vectors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          namespace: this.namespace,
          vectors: [
            {
              id: this.nextId.toString(),
              vector: embedding,
              metadata: {
                role: role,
                content: content,
                text: content
              }
            }
          ]
        })
      })

      if (response.ok) {
        this.nextId++
        console.log(`✓ Message stored in memory (ID: ${this.nextId - 1})`)
      } else {
        console.log('⚠️  Failed to store message in memory (likely permission issue)')
      }
    } catch (error) {
      console.log('⚠️  Memory storage error:', error.message)
    }
  }

  async retrieveContext(query, limit = 3) {
    if (!this.apiKey) {
      return ""
    }

    try {
      const queryEmbedding = await generateQwenEmbedding(query)
      
      const response = await fetch(`${this.baseUrl}/v1/vectors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          namespace: this.namespace,
          vector: queryEmbedding,
          topK: limit,
          includeMetadata: true,
          includeValues: false
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          let context = "Relevant context from previous conversations:\n"
          data.forEach(item => {
            const role = item.metadata?.role || 'unknown'
            const content = item.metadata?.content || ''
            context += `- ${role}: ${content}\n`
          })
          return context
        }
      }
    } catch (error) {
      console.log('⚠️  Memory retrieval error:', error.message)
    }

    return ""
  }
}

// Voice Chatbot class - similar structure to CLI version
export class VoiceChatbot {
  constructor(apiKey, namespace = 'web-chatbot-memory') {
    this.memory = null
    this.hasQwen = !!process.env.QWEN_API_KEY
    this.hasTurbopuffer = !!apiKey
    
    // Initialize memory if Turbopuffer API key is available
    if (this.hasTurbopuffer) {
      this.memory = new TurbopufferMemory(apiKey, namespace)
    }
    
    // Simple in-memory cache for frequent queries
    this.cache = new Map()
    this.cacheMaxSize = 100
  }

  async generateAnswer(question) {
    // Check cache first
    const cacheKey = question.toLowerCase().trim()
    if (this.cache.has(cacheKey)) {
      console.log('✓ Cache hit for query')
      return this.cache.get(cacheKey)
    }

    if (!this.hasQwen) {
      // Fallback to semantic search if Qwen is not available
      console.log('⚠️  Qwen not available, using semantic search fallback')
      const result = await semanticSearch(question, 3)
      return result.context
    }

    // Parallelize memory retrieval
    const memoryPromise = this.memory ? this.memory.retrieveContext(question) : Promise.resolve("")
    
    let context = ""
    try {
      context = await memoryPromise
    } catch (error) {
      console.log('⚠️  Memory retrieval error:', error.message)
    }

    // Build prompt with memory context only (like CLI chatbot)
    const prompt = `${context}Question: ${question}\n\nAnswer:`

    try {
      const answer = await generateQwenText(prompt, 300)
      
      // Cache the result
      if (this.cache.size >= this.cacheMaxSize) {
        // Remove oldest entry (first key)
        const firstKey = this.cache.keys().next().value
        this.cache.delete(firstKey)
      }
      this.cache.set(cacheKey, answer)
      console.log('✓ Cached query result')
      
      return answer
    } catch (error) {
      console.log('⚠️  Qwen text generation failed, using semantic search fallback')
      const result = await semanticSearch(question, 3)
      return result.context
    }
  }

  async processQuestion(question) {
    // Store question in memory
    if (this.memory) {
      await this.memory.addMessage('user', question)
    }

    // Generate answer
    const answer = await this.generateAnswer(question)

    // Store answer in memory
    if (this.memory) {
      await this.memory.addMessage('assistant', answer)
    }

    return answer
  }
}

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

// In-memory cache for document embeddings
let documentEmbeddingsCache = null

// Pre-compute embeddings for all documents
async function precomputeDocumentEmbeddings() {
  if (documentEmbeddingsCache) {
    return documentEmbeddingsCache
  }

  console.log('Pre-computing embeddings for knowledge base documents...')
  documentEmbeddingsCache = []

  for (const doc of sampleKnowledge) {
    try {
      const embedding = await generateQwenEmbedding(doc.text)
      documentEmbeddingsCache.push({
        id: doc.id,
        text: doc.text,
        topic: doc.topic,
        embedding: embedding
      })
      console.log(`  ✓ Document ${doc.id} embedded`)
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`  ✗ Failed to embed document ${doc.id}:`, error.message)
    }
  }

  console.log(`Pre-computed ${documentEmbeddingsCache.length} document embeddings`)
  return documentEmbeddingsCache
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vec1, vec2) {
  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

// Semantic search using Qwen embeddings
async function semanticVectorSearch(query, topK = 3) {
  try {
    // Pre-compute document embeddings if not already done
    const documents = await precomputeDocumentEmbeddings()

    // Generate embedding for the query
    console.log('Generating embedding for query...')
    const queryEmbedding = await generateQwenEmbedding(query)
    console.log('Query embedding generated')

    // Calculate similarities
    const similarities = documents.map(doc => ({
      ...doc,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding)
    }))

    // Sort by similarity (descending) and take topK
    const topResults = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)

    // Format results
    const context = topResults.map(r => r.text).join('\n\n')
    const sources = topResults.map(r => ({ id: r.id, topic: r.topic }))

    console.log(`Found ${topResults.length} similar documents`)
    return {
      context: context || 'No relevant information found.',
      sources: sources
    }
  } catch (error) {
    console.error('Semantic vector search error:', error)
    // Fallback to simple search on error
    console.log('Falling back to simple search')
    return await simpleSearch(query, topK)
  }
}

export async function semanticSearch(query, topK = 3) {
  try {
    // Check if Qwen API key is available
    const qwenApiKey = process.env.QWEN_API_KEY
    
    if (qwenApiKey && qwenApiKey !== 'your_qwen_api_key_here') {
      // Use semantic search with Qwen embeddings
      return await semanticVectorSearch(query, topK)
    } else {
      // Fallback to simple keyword matching
      console.log('QWEN_API_KEY not set, using simple search fallback')
      return await simpleSearch(query, topK)
    }
  } catch (error) {
    console.error('Semantic search error:', error)
    // Fallback to simple search on error
    console.log('Semantic search error, using simple search fallback')
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

    // Try to query Turbopuffer with a namespace
    // Note: This requires documents to be indexed in Turbopuffer first
    const namespace = 'echosearch'
    
    try {
      // Generate embedding for the query using Qwen
      console.log('Generating embedding for query using Qwen...')
      const queryEmbedding = await generateQwenEmbedding(query)
      console.log('Embedding generated with', queryEmbedding.length, 'dimensions')
      
      // Attempt to query the namespace with real embedding
      const results = await tp.query({
        vector: queryEmbedding,
        topK: topK,
        namespace: namespace,
        includeMetadata: true,
        includeValues: false
      })
      
      if (results && results.length > 0) {
        const context = results.map(r => r.metadata?.text || '').join('\n\n')
        const sources = results.map((r, i) => ({ 
          id: i, 
          topic: r.metadata?.topic || 'unknown' 
        }))
        
        return {
          context: context || 'No results found in Turbopuffer index.',
          sources: sources
        }
      }
    } catch (namespaceError) {
      console.log('Turbopuffer namespace query failed, namespace may not exist:', namespaceError.message)
    }
    
    // If Turbopuffer query fails or returns no results, fall back to simple search
    console.log('Falling back to simple search (Turbopuffer namespace not set up)')
    return await simpleSearch(query, topK)
    
  } catch (error) {
    console.error('Turbopuffer API error:', error)
    // Fallback to simple search on error
    return await simpleSearch(query, topK)
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
