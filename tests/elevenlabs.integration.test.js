import { describe, it, expect, beforeAll } from 'vitest'
import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Get API key from environment variable
const API_KEY = process.env.ELEVENLABS_API_KEY || 'YOUR_API_KEY'
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb' // Default voice ID for testing

describe('ElevenLabs Integration Tests', () => {
  let elevenlabs

  beforeAll(() => {
    elevenlabs = new ElevenLabsClient({
      apiKey: API_KEY,
    })
  })

  it('should initialize ElevenLabs client', () => {
    expect(elevenlabs).toBeDefined()
    expect(elevenlabs.textToSpeech).toBeDefined()
  })

  it('should convert text to speech using the exact code pattern from example', async () => {
    if (API_KEY === 'YOUR_API_KEY') {
      console.warn('Skipping test: ELEVENLABS_API_KEY not set')
      return
    }

    // Exact code pattern from user's example
    const audio = await elevenlabs.textToSpeech.convert(
      VOICE_ID, // voice_id
      {
        text: 'The first move is what sets everything in motion.',
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128', // output_format
      }
    )

    expect(audio).toBeDefined()
    // The SDK returns various types depending on the environment
    console.log('Successfully generated audio, type:', typeof audio)
    console.log('Audio object:', audio)

    // Note: play() function requires browser/audio context, skipping in Node.js test environment
    // In a browser environment, you would use: await play(audio)
  })
})
