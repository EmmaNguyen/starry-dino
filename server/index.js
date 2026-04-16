import express from 'express'
import cors from 'cors'
import compression from 'compression'
import dotenv from 'dotenv'
import { VoiceChatbot } from './turbopuffer.js'
import { generateAudio } from './audio.js'

dotenv.config({ path: '.env.local' })

const app = express()
const PORT = process.env.PORT || 3001

// Initialize VoiceChatbot with Turbopuffer API key
const turbopufferApiKey = process.env.TURBOPUFFER_API_KEY
const chatbot = new VoiceChatbot(turbopufferApiKey, 'web-chatbot-memory')
console.log('✓ VoiceChatbot initialized')

app.use(cors())
app.use(express.json())
app.use(compression())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'EchoSearch API' })
})

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query, mode = 'podcast' } = req.body
    
    console.log(`Processing query: "${query}" in mode: ${mode}`)
    
    // Use VoiceChatbot to process the question (handles memory, Qwen text generation, etc.)
    const answer = await chatbot.processQuestion(query)
    console.log('Generated answer using VoiceChatbot')
    
    // Generate audio using ElevenLabs
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
