import { describe, it, expect } from 'vitest'
import { QwenEmbedding } from '@seekdb/qwen'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

describe('Qwen API Tests', () => {
  it('should generate embeddings for a simple text', async () => {
    const apiKey = process.env.QWEN_API_KEY
    const region = process.env.QWEN_REGION || 'singapore'

    if (!apiKey) {
      throw new Error('QWEN_API_KEY not found in environment variables')
    }

    const qwen = new QwenEmbedding({
      apiKey: apiKey,
      region: region
    })

    const text = 'Quantum computing uses quantum bits or qubits'
    
    try {
      const embedding = await qwen.embed(text)
      
      expect(embedding).toBeDefined()
      expect(Array.isArray(embedding)).toBe(true)
      expect(embedding.length).toBeGreaterThan(0)
      
      // Check that all values are numbers
      embedding.forEach(value => {
        expect(typeof value).toBe('number')
      })
      
      console.log('✓ Qwen API works! Generated embedding with', embedding.length, 'dimensions')
      console.log('Sample embedding values:', embedding.slice(0, 5))
    } catch (error) {
      console.error('Qwen API error:', error.message)
      throw error
    }
  })

  it('should generate different embeddings for different texts', async () => {
    const apiKey = process.env.QWEN_API_KEY
    const region = process.env.QWEN_REGION || 'singapore'

    if (!apiKey) {
      throw new Error('QWEN_API_KEY not found in environment variables')
    }

    const qwen = new QwenEmbedding({
      apiKey: apiKey,
      region: region
    })

    const text1 = 'Quantum computing uses quantum bits'
    const text2 = 'Machine learning algorithms recognize patterns'
    
    try {
      const embedding1 = await qwen.embed(text1)
      const embedding2 = await qwen.embed(text2)
      
      expect(embedding1).toBeDefined()
      expect(embedding2).toBeDefined()
      expect(embedding1.length).toBe(embedding2.length)
      
      // Embeddings should be different for different texts
      let differences = 0
      for (let i = 0; i < embedding1.length; i++) {
        if (Math.abs(embedding1[i] - embedding2[i]) > 0.01) {
          differences++
        }
      }
      
      expect(differences).toBeGreaterThan(0)
      
      console.log('✓ Qwen generates different embeddings for different texts')
      console.log('Differences in embeddings:', differences, 'out of', embedding1.length, 'dimensions')
    } catch (error) {
      console.error('Qwen API error:', error.message)
      throw error
    }
  })

  it('should handle empty text gracefully', async () => {
    const apiKey = process.env.QWEN_API_KEY
    const region = process.env.QWEN_REGION || 'singapore'

    if (!apiKey) {
      throw new Error('QWEN_API_KEY not found in environment variables')
    }

    const qwen = new QwenEmbedding({
      apiKey: apiKey,
      region: region
    })

    try {
      const embedding = await qwen.embed('')
      
      // Should still return an embedding even for empty text
      expect(embedding).toBeDefined()
      expect(Array.isArray(embedding)).toBe(true)
      
      console.log('✓ Qwen handles empty text gracefully')
    } catch (error) {
      console.error('Qwen API error:', error.message)
      throw error
    }
  })
})
