import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
})

// Voice configurations for different modes
const voiceConfigs = {
  podcast: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // Rachel (conversational)
    stability: 0.5,
    similarityBoost: 0.75
  },
  professor: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // Using Rachel with different settings for professor mode
    stability: 0.8,
    similarityBoost: 0.4
  },
  story: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // Using Rachel with different settings for story mode
    stability: 0.3,
    similarityBoost: 0.85
  }
}

export async function generateAudio(text, mode = 'podcast') {
  try {
    const config = voiceConfigs[mode] || voiceConfigs.podcast
    
    const audio = await elevenlabs.textToSpeech.convert(config.voiceId, {
      text: text,
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
      voiceSettings: {
        stability: config.stability,
        similarity_boost: config.similarityBoost
      }
    })

    return audio
  } catch (error) {
    console.error('Audio generation error:', error)
    throw new Error('Failed to generate audio')
  }
}
