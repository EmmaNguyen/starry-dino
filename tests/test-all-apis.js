import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

console.log('\n=== Testing All APIs ===\n')

// Test Qwen API
async function testQwenAPI() {
  console.log('--- Testing Qwen API ---')
  
  const apiKey = process.env.QWEN_API_KEY
  
  if (!apiKey) {
    console.log('✗ QWEN_API_KEY not found')
    return false
  }
  
  console.log('✓ QWEN_API_KEY found:', apiKey.substring(0, 10) + '...')
  
  const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/embeddings'
  const QWEN_MODEL = 'text-embedding-v3'
  
  const permissions = {
    key_valid: false,
    embedding_generation: false,
    model_access: false
  }
  
  try {
    console.log('Testing embedding generation permission...')
    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        input: 'Quantum computing uses quantum bits or qubits'
      })
    })

    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      permissions.key_valid = true
      permissions.embedding_generation = true
      permissions.model_access = true
      
      console.log('✓ Qwen API permissions:')
      console.log('  ✓ Key is valid')
      console.log('  ✓ Embedding generation permission')
      console.log('  ✓ Model access (text-embedding-v3)')
      console.log('  Embedding dimensions:', data.data[0].embedding.length)
      return permissions
    } else if (response.status === 401) {
      const error = await response.json()
      console.log('✗ Qwen API key invalid or expired')
      console.log('  Error:', error.error?.message)
      return permissions
    } else if (response.status === 403) {
      const error = await response.json()
      permissions.key_valid = true
      console.log('✓ Qwen API key is valid but lacks permissions')
      console.log('  Error:', error.error?.message)
      return permissions
    } else {
      const error = await response.json()
      console.log('✗ Qwen API error:', error.error?.message)
      return permissions
    }
  } catch (error) {
    console.log('✗ Qwen API test failed:', error.message)
    return permissions
  }
}

// Test Turbopuffer API
async function testTurbopufferAPI() {
  console.log('\n--- Testing Turbopuffer API ---')
  
  const apiKey = process.env.TURBOPUFFER_API_KEY
  
  if (!apiKey) {
    console.log('✗ TURBOPUFFER_API_KEY not found')
    return false
  }
  
  console.log('✓ TURBOPUFFER_API_KEY found:', apiKey.substring(0, 10) + '...')
  
  const baseUrl = 'https://api.turbopuffer.com'
  
  const permissions = {
    key_valid: false,
    namespace_read: false,
    vector_write: false,
    vector_read: false
  }
  
  try {
    console.log('Testing namespace read permission...')
    const response = await fetch(`${baseUrl}/v1/namespaces`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      permissions.key_valid = true
      permissions.namespace_read = true
      console.log('✓ Namespace read permission granted')
      console.log('  Existing namespaces:', data.namespaces?.length || 0)
      if (data.namespaces && data.namespaces.length > 0) {
        console.log('  Sample namespaces:', data.namespaces.map(n => n.id).join(', '))
      }
    } else if (response.status === 401) {
      console.log('✗ Turbopuffer API key invalid or expired')
      return permissions
    } else if (response.status === 403) {
      console.log('✗ Turbopuffer API key lacks namespace read permission')
      return permissions
    }
    
    // Test write permissions
    console.log('Testing vector write permission...')
    const writeResponse = await fetch(`${baseUrl}/v1/vectors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        namespace: 'echosearch-test',
        vectors: [
          {
            id: 'test-123',
            vector: new Array(1024).fill(0.1),
            metadata: { text: 'Test', topic: 'test' }
          }
        ]
      })
    })

    console.log('Write response status:', writeResponse.status)
    
    if (writeResponse.ok) {
      permissions.vector_write = true
      console.log('✓ Vector write permission granted')
    } else if (writeResponse.status === 403) {
      console.log('✗ Vector write permission denied (read-only)')
    } else {
      console.log('✗ Vector write error:', writeResponse.status)
    }
    
    // Test read permissions
    console.log('Testing vector read permission...')
    const readResponse = await fetch(`${baseUrl}/v1/vectors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        namespace: 'echosearch',
        vector: new Array(1024).fill(0.1),
        topK: 1,
        includeMetadata: true,
        includeValues: false
      })
    })

    console.log('Read response status:', readResponse.status)
    
    if (readResponse.ok) {
      permissions.vector_read = true
      console.log('✓ Vector read permission granted')
    } else if (readResponse.status === 403) {
      console.log('✗ Vector read permission denied')
    } else {
      console.log('✗ Vector read error:', readResponse.status)
    }
    
    console.log('\n✓ Turbopuffer API permissions summary:')
    console.log('  Key valid:', permissions.key_valid ? '✓' : '✗')
    console.log('  Namespace read:', permissions.namespace_read ? '✓' : '✗')
    console.log('  Vector write:', permissions.vector_write ? '✓' : '✗')
    console.log('  Vector read:', permissions.vector_read ? '✓' : '✗')
    
    return permissions
  } catch (error) {
    console.log('✗ Turbopuffer API test failed:', error.message)
    return permissions
  }
}

// Test ElevenLabs API
async function testElevenLabsAPI() {
  console.log('\n--- Testing ElevenLabs API ---')
  
  const apiKey = process.env.ELEVENLABS_API_KEY
  
  if (!apiKey) {
    console.log('✗ ELEVENLABS_API_KEY not found')
    return false
  }
  
  console.log('✓ ELEVENLABS_API_KEY found:', apiKey.substring(0, 10) + '...')
  
  const baseUrl = 'https://api.elevenlabs.io/v1'
  
  const permissions = {
    key_valid: false,
    user_read: false,
    voices_read: false,
    tts_generate: false
  }
  
  try {
    console.log('Testing user_read permission...')
    const response = await fetch(`${baseUrl}/user`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      permissions.key_valid = true
      permissions.user_read = true
      console.log('✓ user_read permission granted')
      console.log('  Email:', data.email?.substring(0, 10) + '...')
      console.log('  Subscription tier:', data.subscription?.tier || 'unknown')
    } else if (response.status === 401) {
      const error = await response.json()
      console.log('✗ user_read permission denied')
      console.log('  Error:', error.detail?.message || error.message)
      permissions.key_valid = true
    } else {
      console.log('✗ User endpoint error:', response.status)
      const error = await response.text()
      console.log('  Error:', error)
    }
    
    // Test voices endpoint
    console.log('Testing voices_read permission...')
    const voicesResponse = await fetch(`${baseUrl}/voices`, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    console.log('Voices response status:', voicesResponse.status)
    
    if (voicesResponse.ok) {
      const voicesData = await voicesResponse.json()
      permissions.voices_read = true
      console.log('✓ voices_read permission granted')
      console.log('  Available voices:', voicesData.voices?.length || 0)
      if (voicesData.voices && voicesData.voices.length > 0) {
        console.log('  Sample voice:', voicesData.voices[0].name)
      }
    } else if (voicesResponse.status === 401) {
      const error = await voicesResponse.json()
      console.log('✗ voices_read permission denied')
      console.log('  Error:', error.detail?.message || error.message)
    } else {
      console.log('✗ Voices endpoint error:', voicesResponse.status)
      const error = await voicesResponse.text()
      console.log('  Error:', error)
    }
    
    console.log('\n✓ ElevenLabs API permissions summary:')
    console.log('  Key valid:', permissions.key_valid ? '✓' : '✗')
    console.log('  user_read:', permissions.user_read ? '✓' : '✗')
    console.log('  voices_read:', permissions.voices_read ? '✓' : '✗')
    console.log('  tts_generate:', permissions.tts_generate ? '✓' : '✗ (not tested)')
    
    return permissions
  } catch (error) {
    console.log('✗ ElevenLabs API test failed:', error.message)
    return permissions
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    qwen: await testQwenAPI(),
    turbopuffer: await testTurbopufferAPI(),
    elevenlabs: await testElevenLabsAPI()
  }
  
  console.log('\n=== API Permissions Summary ===')
  console.log('\nQwen API:')
  console.log('  Key valid:', results.qwen.key_valid ? '✓' : '✗')
  console.log('  Embedding generation:', results.qwen.embedding_generation ? '✓' : '✗')
  console.log('  Model access:', results.qwen.model_access ? '✓' : '✗')
  
  console.log('\nTurbopuffer API:')
  console.log('  Key valid:', results.turbopuffer.key_valid ? '✓' : '✗')
  console.log('  Namespace read:', results.turbopuffer.namespace_read ? '✓' : '✗')
  console.log('  Vector write:', results.turbopuffer.vector_write ? '✓' : '✗')
  console.log('  Vector read:', results.turbopuffer.vector_read ? '✓' : '✗')
  
  console.log('\nElevenLabs API:')
  console.log('  Key valid:', results.elevenlabs.key_valid ? '✓' : '✗')
  console.log('  user_read:', results.elevenlabs.user_read ? '✓' : '✗')
  console.log('  voices_read:', results.elevenlabs.voices_read ? '✓' : '✗')
  console.log('  tts_generate:', results.elevenlabs.tts_generate ? '✓' : '✗ (not tested)')
  
  console.log('\n=============================\n')
  
  // Calculate overall status
  const qwenWorking = results.qwen.key_valid && results.qwen.embedding_generation && results.qwen.model_access
  const turbopufferWorking = results.turbopuffer.key_valid && results.turbopuffer.namespace_read
  const elevenlabsWorking = results.elevenlabs.key_valid && (results.elevenlabs.user_read || results.elevenlabs.voices_read)
  
  console.log('Overall Status:')
  console.log('Qwen API:', qwenWorking ? '✓ WORKING' : '✗ ISSUES')
  console.log('Turbopuffer API:', turbopufferWorking ? '✓ WORKING' : '✗ ISSUES')
  console.log('ElevenLabs API:', elevenlabsWorking ? '✓ WORKING' : '✗ ISSUES')
  
  const workingCount = [qwenWorking, turbopufferWorking, elevenlabsWorking].filter(x => x).length
  console.log(`\nTotal: ${workingCount}/3 APIs working`)
  
  if (workingCount === 3) {
    console.log('✓ All APIs are working!')
  } else {
    console.log('✗ Some APIs have permission issues')
  }
}

runAllTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
