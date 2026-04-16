import { VoiceChatbot } from '../server/turbopuffer.js'
import { generateAudio } from '../server/audio.js'

// Initialize VoiceChatbot with Turbopuffer API key
const turbopufferApiKey = process.env.TURBOPUFFER_API_KEY
const chatbot = new VoiceChatbot(turbopufferApiKey, 'web-chatbot-memory')
console.log('✓ VoiceChatbot initialized')

// Vercel serverless handler
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { query, mode = 'podcast' } = req.body
    
    console.log(`Processing query: "${query}" in mode: ${mode}`)
    
    // Use VoiceChatbot to process the question (handles memory, Qwen text generation, etc.)
    const answer = await chatbot.processQuestion(query, mode)
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
}
