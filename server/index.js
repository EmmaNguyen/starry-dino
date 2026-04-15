import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { semanticSearch } from './turbopuffer.js'
import { generateRAGAnswer } from './rag.js'
import { generateAudio } from './audio.js'

dotenv.config({ path: '.env.local' })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'EchoSearch API' })
})

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query, mode = 'podcast' } = req.body
    
    console.log(`Processing query: "${query}" in mode: ${mode}`)
    
    // Step 1: Semantic search to retrieve relevant context
    const { context, sources } = await semanticSearch(query)
    console.log('Retrieved context from knowledge base')
    
    // Step 2: Generate RAG answer using LLM
    const answer = await generateRAGAnswer(query, context, mode)
    console.log('Generated RAG answer')
    
    // Step 3: Generate audio using ElevenLabs
    const audioStream = await generateAudio(answer, mode)
    console.log('Generated audio')
    
    // Convert ReadableStream to buffer for response
    const reader = audioStream.getReader()
    const chunks = []
    let totalBytes = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      totalBytes += value.length
    }

    const audioBuffer = Buffer.concat(chunks)
    
    res.json({
      query,
      mode,
      answer,
      sources,
      audioData: audioBuffer.toString('base64'),
      audioSize: totalBytes
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: error.message || 'Search failed' })
  }
})

app.listen(PORT, () => {
  console.log(`EchoSearch API running on port ${PORT}`)
})
