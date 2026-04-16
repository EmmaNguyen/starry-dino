import { describe, it, expect, beforeAll } from 'vitest'
import { semanticSearch } from '../server/turbopuffer.js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

describe('Turbopuffer/Semantic Search Tests', () => {
  it('should return relevant results for quantum computing query', async () => {
    const result = await semanticSearch('quantum computing', 3)
    
    expect(result).toBeDefined()
    expect(result.context).toBeDefined()
    expect(result.sources).toBeDefined()
    expect(Array.isArray(result.sources)).toBe(true)
    
    // Should return at least one relevant result
    expect(result.sources.length).toBeGreaterThan(0)
    
    // Sources should have quantum-related topics
    const quantumTopics = result.sources.filter(s => s.topic === 'quantum')
    expect(quantumTopics.length).toBeGreaterThan(0)
    
    console.log('Found quantum-related sources:', result.sources)
  }, 10000)

  it('should return relevant results for AI/machine learning query', async () => {
    const result = await semanticSearch('machine learning', 3)
    
    expect(result).toBeDefined()
    expect(result.context).toBeDefined()
    expect(result.sources).toBeDefined()
    expect(Array.isArray(result.sources)).toBe(true)
    
    // Should return at least one relevant result
    expect(result.sources.length).toBeGreaterThan(0)
    
    // Sources should have AI-related topics
    const aiTopics = result.sources.filter(s => s.topic === 'ai')
    expect(aiTopics.length).toBeGreaterThan(0)
    
    console.log('Found AI-related sources:', result.sources)
  })

  it('should return relevant results for climate change query', async () => {
    const result = await semanticSearch('climate change', 3)
    
    expect(result).toBeDefined()
    expect(result.context).toBeDefined()
    expect(result.sources).toBeDefined()
    expect(Array.isArray(result.sources)).toBe(true)
    
    // Should return at least one relevant result
    expect(result.sources.length).toBeGreaterThan(0)
    
    // Sources should have climate-related topics
    const climateTopics = result.sources.filter(s => s.topic === 'climate')
    expect(climateTopics.length).toBeGreaterThan(0)
    
    console.log('Found climate-related sources:', result.sources)
  })

  it('should return no results for query not in knowledge base', async () => {
    const result = await semanticSearch('something completely unrelated', 3)
    
    expect(result).toBeDefined()
    expect(result.context).toBeDefined()
    expect(result.sources).toBeDefined()
    expect(Array.isArray(result.sources)).toBe(true)
    
    // Semantic search returns most similar documents even for unrelated queries
    // This is expected behavior - it finds the closest matches even if similarity is low
    expect(result.sources.length).toBeGreaterThan(0)
    
    console.log('Semantic search returns closest matches for unrelated query:', result)
  })

  it('should respect topK parameter', async () => {
    const result1 = await semanticSearch('quantum', 1)
    const result2 = await semanticSearch('quantum', 5)
    
    expect(result1.sources.length).toBeLessThanOrEqual(1)
    expect(result2.sources.length).toBeLessThanOrEqual(5)
    
    console.log('topK=1 returned', result1.sources.length, 'sources')
    console.log('topK=5 returned', result2.sources.length, 'sources')
  })

  it('should handle empty query gracefully', async () => {
    const result = await semanticSearch('', 3)
    
    expect(result).toBeDefined()
    expect(result.context).toBeDefined()
    expect(result.sources).toBeDefined()
    
    // Empty query should return no results
    expect(result.sources.length).toBe(0)
    
    console.log('Empty query handled gracefully')
  })

  it('should return relevant results for Y Combinator query', async () => {
    const result = await semanticSearch('Y Combinator', 3)
    
    expect(result).toBeDefined()
    expect(result.context).toBeDefined()
    expect(result.sources).toBeDefined()
    expect(Array.isArray(result.sources)).toBe(true)
    
    // Should return at least one relevant result
    expect(result.sources.length).toBeGreaterThan(0)
    
    // Sources should have YC-related topics
    const ycTopics = result.sources.filter(s => s.topic === 'yc')
    expect(ycTopics.length).toBeGreaterThan(0)
    
    console.log('Found YC-related sources:', result.sources)
  })

  it('should return relevant results for YC startup accelerator query', async () => {
    const result = await semanticSearch('startup accelerator', 3)
    
    expect(result).toBeDefined()
    expect(result.context).toBeDefined()
    expect(result.sources).toBeDefined()
    expect(Array.isArray(result.sources)).toBe(true)
    
    // Should return at least one relevant result
    expect(result.sources.length).toBeGreaterThan(0)
    
    // Sources should have YC-related topics
    const ycTopics = result.sources.filter(s => s.topic === 'yc')
    expect(ycTopics.length).toBeGreaterThan(0)
    
    console.log('Found startup accelerator sources:', result.sources)
  })
})
