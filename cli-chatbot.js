import readline from 'readline'
import { semanticSearch } from './server/turbopuffer.js'
import { spawn } from 'child_process'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Check if voice should be enabled
const enableVoice = process.argv.includes('--voice') || process.argv.includes('-v')
const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY
const qwenApiKey = process.env.QWEN_API_KEY
const turbopufferApiKey = process.env.TURBOPUFFER_API_KEY

// Qwen API configuration
const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
const QWEN_MODEL = 'qwen-turbo'

// Generate embedding using Qwen API
async function generateQwenEmbedding(text) {
  if (!qwenApiKey) {
    throw new Error('QWEN_API_KEY not found')
  }

  try {
    const response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${qwenApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-v3',
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

// Generate text using Qwen API
async function generateQwenText(prompt, maxTokens = 300) {
  if (!qwenApiKey) {
    throw new Error('QWEN_API_KEY not found')
  }

  try {
    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${qwenApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant. Answer the user\'s question concisely and clearly.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Qwen API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content
    }
    
    throw new Error('Invalid response format from Qwen API')
  } catch (error) {
    console.error('Error generating Qwen text:', error.message)
    throw error
  }
}

// Turbopuffer Memory class
class TurbopufferMemory {
  constructor(apiKey, namespace = 'voice-chatbot-memory') {
    this.apiKey = apiKey
    this.namespace = namespace
    this.baseUrl = 'https://api.turbopuffer.com'
    this.nextId = 1
  }

  async addMessage(role, content) {
    if (!this.apiKey) {
      console.log('⚠️  Turbopuffer API key not set, memory disabled')
      return
    }

    try {
      const embedding = await generateQwenEmbedding(content)
      
      const response = await fetch(`${this.baseUrl}/v1/vectors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          namespace: this.namespace,
          vectors: [
            {
              id: this.nextId.toString(),
              vector: embedding,
              metadata: {
                role: role,
                content: content,
                text: content
              }
            }
          ]
        })
      })

      if (response.ok) {
        this.nextId++
        console.log(`✓ Message stored in memory (ID: ${this.nextId - 1})`)
      } else {
        console.log('⚠️  Failed to store message in memory (likely permission issue)')
      }
    } catch (error) {
      console.log('⚠️  Memory storage error:', error.message)
    }
  }

  async retrieveContext(query, limit = 3) {
    if (!this.apiKey) {
      return ""
    }

    try {
      const queryEmbedding = await generateQwenEmbedding(query)
      
      const response = await fetch(`${this.baseUrl}/v1/vectors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          namespace: this.namespace,
          vector: queryEmbedding,
          topK: limit,
          includeMetadata: true,
          includeValues: false
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          let context = "Relevant context from previous conversations:\n"
          data.forEach(item => {
            const role = item.metadata?.role || 'unknown'
            const content = item.metadata?.content || ''
            context += `- ${role}: ${content}\n`
          })
          return context
        }
      }
    } catch (error) {
      console.log('⚠️  Memory retrieval error:', error.message)
    }

    return ""
  }
}

// Generate audio using ElevenLabs
async function generateAudio(text) {
  if (!elevenlabsApiKey) {
    console.log('⚠️  ELEVENLABS_API_KEY not found, voice disabled')
    return null
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.log('⚠️  ElevenLabs API error:', error.detail?.message || error.message)
      return null
    }

    const audioBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(audioBuffer)
    
    // Save to temporary file
    const tempFile = '/tmp/echosearch-response.mp3'
    fs.writeFileSync(tempFile, buffer)
    return tempFile
  } catch (error) {
    console.log('⚠️  Error generating audio:', error.message)
    return null
  }
}

// Play audio file
function playAudio(filePath) {
  if (!filePath) return

  return new Promise((resolve) => {
    const player = spawn('afplay', [filePath])
    player.on('close', () => resolve())
    player.on('error', () => resolve()) // Continue even if audio fails
  })
}

// Voice Chatbot class
class VoiceChatbot {
  constructor() {
    this.memory = null
    this.hasQwen = !!qwenApiKey
    this.hasElevenLabs = !!elevenlabsApiKey
    this.hasTurbopuffer = !!turbopufferApiKey
    
    // Initialize memory if Turbopuffer API key is available
    if (this.hasTurbopuffer) {
      this.memory = new TurbopufferMemory(turbopufferApiKey)
    }
  }

  async generateAnswer(question) {
    if (!this.hasQwen) {
      // Fallback to semantic search if Qwen is not available
      console.log('⚠️  Qwen not available, using semantic search fallback')
      const result = await semanticSearch(question, 3)
      return result.context
    }

    // Retrieve context from memory if available
    let context = ""
    if (this.memory) {
      context = await this.memory.retrieveContext(question)
    }

    // Build prompt with context
    const prompt = `${context}Question: ${question}\n\nAnswer:`

    try {
      const answer = await generateQwenText(prompt, 300)
      return answer
    } catch (error) {
      console.log('⚠️  Qwen text generation failed, using semantic search fallback')
      const result = await semanticSearch(question, 3)
      return result.context
    }
  }

  async speakAnswer(text) {
    if (!this.hasElevenLabs || !enableVoice) {
      return false
    }

    try {
      console.log('🎤 Converting answer to speech...')
      const audioFile = await generateAudio(text)
      if (audioFile) {
        console.log('▶️  Playing audio...')
        await playAudio(audioFile)
        console.log('✅ Playback complete')
        return true
      }
    } catch (error) {
      console.log('❌ Error playing audio:', error.message)
    }
    return false
  }

  async processQuestion(question) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Question: ${question}`)
    console.log(`${'='.repeat(60)}`)

    // Store question in memory
    if (this.memory) {
      await this.memory.addMessage("user", question)
    }

    // Generate answer
    console.log('\n🧠 Generating answer...')
    const answer = await this.generateAnswer(question)
    console.log(`\n📝 Answer: ${answer}`)

    // Store answer in memory
    if (this.memory) {
      await this.memory.addMessage("assistant", answer)
    }

    // Speak the answer
    await this.speakAnswer(answer)

    console.log(`${'='.repeat(60)}`)
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('\n' + '='.repeat(60))
console.log('🎤 Voice Chatbot (Qwen + ElevenLabs + Turbopuffer)')
console.log('='.repeat(60))
console.log('Commands:')
console.log('  /quit - Exit the chatbot')
console.log('  /help - Show this help message')
console.log('='.repeat(60))

console.log('\nAPI Status:')
console.log('  Qwen:', qwenApiKey ? '✓ Available' : '✗ Not configured')
console.log('  ElevenLabs:', elevenlabsApiKey ? '✓ Available' : '✗ Not configured')
console.log('  Turbopuffer:', turbopufferApiKey ? '✓ Available' : '✗ Not configured')

if (enableVoice && elevenlabsApiKey) {
  console.log('🎤 Voice enabled (using ElevenLabs)')
} else if (enableVoice) {
  console.log('⚠️  Voice requested but ELEVENLABS_API_KEY not found')
}

console.log('')

const chatbot = new VoiceChatbot()

function askQuestion() {
  rl.question('\n❓ Ask a question: ', async (query) => {
    if (query.toLowerCase() === '/quit') {
      console.log('\nGoodbye! 👋')
      rl.close()
      process.exit(0)
    }

    if (query.toLowerCase() === '/help') {
      console.log('\nCommands:')
      console.log('  /quit - Exit the chatbot')
      console.log('  /help - Show this help message')
      askQuestion()
      return
    }

    if (!query.trim()) {
      askQuestion()
      return
    }

    try {
      await chatbot.processQuestion(query)
    } catch (error) {
      console.log('\n❌ Error:', error.message)
    }

    askQuestion()
  })
}

askQuestion()
