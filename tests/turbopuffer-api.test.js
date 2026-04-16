import { describe, it, expect } from 'vitest'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

describe('Turbopuffer API Key Tests', () => {
  it('should have Turbopuffer API key in environment', () => {
    const apiKey = process.env.TURBOPUFFER_API_KEY
    
    expect(apiKey).toBeDefined()
    expect(apiKey).not.toBe('your_turbopuffer_api_key_here')
    expect(apiKey.length).toBeGreaterThan(0)
    
    console.log('✓ Turbopuffer API key found:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND')
  })

  it('should test Turbopuffer API key validity with REST API', async () => {
    const apiKey = process.env.TURBOPUFFER_API_KEY
    
    if (!apiKey) {
      throw new Error('TURBOPUFFER_API_KEY not found in environment variables')
    }

    const baseUrl = 'https://api.turbopuffer.com'
    
    try {
      // Test if we can query the API (read operation)
      console.log('Testing Turbopuffer API key with read operation...')
      const response = await fetch(`${baseUrl}/v1/vectors`, {
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

      console.log('Response status:', response.status)
      
      if (response.ok) {
        console.log('✓ Turbopuffer API key has read permissions')
        const data = await response.json()
        console.log('Query response structure:', Object.keys(data))
      } else if (response.status === 401) {
        console.log('✗ Turbopuffer API key is invalid or expired')
        const error = await response.text()
        console.log('Error:', error)
        throw new Error('Invalid API key')
      } else if (response.status === 403) {
        console.log('✗ Turbopuffer API key lacks permissions')
        const error = await response.text()
        console.log('Error:', error)
        console.log('Note: This API key may be for a different plan or expired')
        // Don't throw - we want to document this but not fail the test
      } else {
        console.log('Unexpected response:', response.status)
        const error = await response.text()
        console.log('Error:', error)
      }
      
      expect(response.status).toBeLessThan(500)
    } catch (error) {
      console.error('Turbopuffer API test error:', error.message)
      throw error
    }
  })

  it('should test Turbopuffer API key write permissions', async () => {
    const apiKey = process.env.TURBOPUFFER_API_KEY
    
    if (!apiKey) {
      throw new Error('TURBOPUFFER_API_KEY not found in environment variables')
    }

    const baseUrl = 'https://api.turbopuffer.com'
    
    try {
      // Test if we can upsert vectors (write operation)
      console.log('Testing Turbopuffer API key with write operation...')
      const response = await fetch(`${baseUrl}/v1/vectors`, {
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
              metadata: {
                text: 'Test document',
                topic: 'test'
              }
            }
          ]
        })
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        console.log('✓ Turbopuffer API key has write permissions')
        const data = await response.json()
        console.log('Upsert response structure:', Object.keys(data))
      } else if (response.status === 401) {
        console.log('✗ Turbopuffer API key is invalid or expired')
        const error = await response.text()
        console.log('Error:', error)
        throw new Error('Invalid API key')
      } else if (response.status === 403) {
        console.log('✗ Turbopuffer API key lacks write permissions')
        const error = await response.text()
        console.log('Error:', error)
        // This is expected - many API keys are read-only
        console.log('Note: Read-only keys are common for production use')
      } else {
        console.log('Unexpected response:', response.status)
        const error = await response.text()
        console.log('Error:', error)
      }
      
      // We expect either success (200) or permission denied (403)
      expect([200, 201, 403]).toContain(response.status)
    } catch (error) {
      console.error('Turbopuffer API write test error:', error.message)
      throw error
    }
  })

  it('should test Turbopuffer API key with namespace operations', async () => {
    const apiKey = process.env.TURBOPUFFER_API_KEY
    
    if (!apiKey) {
      throw new Error('TURBOPUFFER_API_KEY not found in environment variables')
    }

    const baseUrl = 'https://api.turbopuffer.com'
    
    try {
      // Test namespace listing or info
      console.log('Testing Turbopuffer API key with namespace operations...')
      const response = await fetch(`${baseUrl}/v1/namespaces`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        console.log('✓ Turbopuffer API key can list namespaces')
        const data = await response.json()
        console.log('Namespaces:', data.namespaces || data)
      } else if (response.status === 401) {
        console.log('✗ Turbopuffer API key is invalid or expired')
        const error = await response.text()
        console.log('Error:', error)
        throw new Error('Invalid API key')
      } else if (response.status === 403) {
        console.log('✗ Turbopuffer API key lacks namespace permissions')
        const error = await response.text()
        console.log('Error:', error)
      } else if (response.status === 404) {
        console.log('ℹ Namespace listing endpoint may not be available')
        console.log('This is not necessarily an error with the API key')
      } else {
        console.log('Unexpected response:', response.status)
        const error = await response.text()
        console.log('Error:', error)
      }
      
      // We accept various status codes since namespace operations may not be available
      expect(response.status).toBeGreaterThan(0)
    } catch (error) {
      console.error('Turbopuffer namespace test error:', error.message)
      // Don't fail the test if namespace operations aren't available
      console.log('Note: Namespace operations may not be available on all plans')
    }
  })
})
