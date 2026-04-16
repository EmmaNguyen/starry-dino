import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Qwen API configuration
const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/embeddings'
const QWEN_MODEL = 'text-embedding-v3'

// Sample knowledge base
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

// Generate embedding using Qwen API
async function generateQwenEmbedding(text) {
  const apiKey = process.env.QWEN_API_KEY
  
  if (!apiKey) {
    throw new Error('QWEN_API_KEY not found in environment variables')
  }

  try {
    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
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

// Index documents in Turbopuffer using REST API
async function indexDocuments() {
  const apiKey = process.env.TURBOPUFFER_API_KEY
  
  if (!apiKey) {
    throw new Error('TURBOPUFFER_API_KEY not found in environment variables')
  }

  const namespace = 'echosearch'
  const baseUrl = 'https://api.turbopuffer.com'
  
  console.log(`Indexing ${sampleKnowledge.length} documents into Turbopuffer namespace: ${namespace}`)

  let successCount = 0
  let errorCount = 0

  for (const doc of sampleKnowledge) {
    try {
      console.log(`\nProcessing document ${doc.id}: "${doc.text.substring(0, 50)}..."`)
      
      // Generate embedding using Qwen
      console.log('  Generating embedding with Qwen...')
      const embedding = await generateQwenEmbedding(doc.text)
      console.log(`  Embedding generated: ${embedding.length} dimensions`)
      
      // Upsert to Turbopuffer using REST API
      console.log('  Upserting to Turbopuffer...')
      const response = await fetch(`${baseUrl}/v1/vectors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          namespace: namespace,
          vectors: [
            {
              id: doc.id.toString(),
              vector: embedding,
              metadata: {
                text: doc.text,
                topic: doc.topic
              }
            }
          ]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Turbopuffer API error: ${response.status} - ${error}`)
      }
      
      console.log(`  ✓ Document ${doc.id} indexed successfully`)
      successCount++
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
      
    } catch (error) {
      console.error(`  ✗ Failed to index document ${doc.id}:`, error.message)
      errorCount++
    }
  }

  console.log(`\n=== Indexing Complete ===`)
  console.log(`Successfully indexed: ${successCount}/${sampleKnowledge.length} documents`)
  console.log(`Failed: ${errorCount}/${sampleKnowledge.length} documents`)
  console.log(`Namespace: ${namespace}`)
  
  if (successCount > 0) {
    console.log(`\n✅ Your documents are now indexed in Turbopuffer!`)
    console.log(`You can now use semantic search with real embeddings.`)
  }
}

// Run the indexing
indexDocuments().catch(error => {
  console.error('Fatal error during indexing:', error)
  process.exit(1)
})
