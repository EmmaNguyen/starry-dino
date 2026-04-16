import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const apiKey = process.env.QWEN_API_KEY
const region = process.env.QWEN_REGION || 'singapore'

console.log('=== Qwen API Test ===')
console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND')
console.log('Region:', region)
console.log('')

if (!apiKey) {
  console.error('❌ QWEN_API_KEY not found in .env.local')
  process.exit(1)
}

// Test Qwen API directly using fetch
async function testQwenAPI() {
  try {
    // Qwen DashScope API endpoint - OpenAI-compatible format
    const url = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/embeddings'
    
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
    
    const body = {
      model: 'text-embedding-v3',
      input: 'Quantum computing uses quantum bits or qubits'
    }
    
    console.log('Sending request to Qwen API...')
    console.log('URL:', url)
    console.log('Model:', body.model)
    console.log('Input text:', body.input)
    console.log('')
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    console.log('')
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Qwen API SUCCESS!')
      console.log('Response:', JSON.stringify(data, null, 2))
      
      if (data.output && data.output.embeddings) {
        const embedding = data.output.embeddings[0].embedding
        console.log('')
        console.log('Embedding dimensions:', embedding.length)
        console.log('First 5 values:', embedding.slice(0, 5))
      }
    } else {
      console.log('❌ Qwen API FAILED')
      console.log('Error response:', JSON.stringify(data, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Error calling Qwen API:', error.message)
    console.error(error)
  }
}

testQwenAPI()
