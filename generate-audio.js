import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import dotenv from 'dotenv'
import { writeFile } from 'fs/promises'

dotenv.config({ path: '.env.local' })

const API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'

async function generateAudio() {
  const elevenlabs = new ElevenLabsClient({
    apiKey: API_KEY,
  })

  console.log('Generating audio for: "Hello? Hello? Hello?"')
  
  const audio = await elevenlabs.textToSpeech.convert(
    VOICE_ID,
    {
      text: 'Hello? Hello? Hello?',
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
    }
  )

  console.log('Audio generated, type:', typeof audio)
  console.log('Audio object:', audio)

  // Convert ReadableStream to buffer
  const reader = audio.getReader()
  const chunks = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    totalBytes += value.length
  }

  const buffer = Buffer.concat(chunks)
  await writeFile('hello-audio.mp3', buffer)
  
  console.log(`Audio saved to hello-audio.mp3 (${totalBytes} bytes)`)
}

generateAudio().catch(console.error)
