import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

console.log('Testing ElevenLabs API Key...\n')

const apiKey = process.env.ELEVENLABS_API_KEY

if (!apiKey) {
  console.log('✗ ELEVENLABS_API_KEY not found in environment')
  process.exit(1)
}

console.log('✓ API Key found:', apiKey.substring(0, 10) + '...')

const baseUrl = 'https://api.elevenlabs.io/v1'

async function testUserEndpoint() {
  console.log('\nTesting user endpoint...')
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
    console.log('✓ ElevenLabs API key is valid')
    console.log('  Email:', data.email?.substring(0, 10) + '...')
    console.log('  Subscription tier:', data.subscription?.tier || 'unknown')
    return true
  } else if (response.status === 401) {
    console.log('✗ ElevenLabs API key is invalid or expired')
    const error = await response.text()
    console.log('  Error:', error)
    return false
  } else {
    console.log('✗ Unexpected response:', response.status)
    const error = await response.text()
    console.log('  Error:', error)
    return false
  }
}

async function testVoicesEndpoint() {
  console.log('\nTesting voices endpoint...')
  const response = await fetch(`${baseUrl}/voices`, {
    method: 'GET',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    }
  })

  console.log('Response status:', response.status)
  
  if (response.ok) {
    const data = await response.json()
    console.log('✓ Voices endpoint works')
    console.log('  Available voices:', data.voices?.length || 0)
    if (data.voices && data.voices.length > 0) {
      console.log('  Sample voice:', data.voices[0].name)
    }
    return true
  } else {
    console.log('✗ Voices endpoint error:', response.status)
    const error = await response.text()
    console.log('  Error:', error)
    return false
  }
}

async function runTests() {
  const userTest = await testUserEndpoint()
  const voicesTest = await testVoicesEndpoint()
  
  console.log('\n=== Summary ===')
  console.log('User endpoint:', userTest ? '✓ PASS' : '✗ FAIL')
  console.log('Voices endpoint:', voicesTest ? '✓ PASS' : '✗ FAIL')
  
  if (userTest && voicesTest) {
    console.log('\n✓ ElevenLabs API is working!')
  } else {
    console.log('\n✗ ElevenLabs API has issues')
  }
}

runTests().catch(error => {
  console.error('Error:', error.message)
  process.exit(1)
})
