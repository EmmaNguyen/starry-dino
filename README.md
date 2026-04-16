# Starry Dino 🦕✨

A child-friendly space-themed educational app for toddlers under 5 that answers questions with fun, engaging audio responses. Built for the ElevenLabs Hackathon.

## Features

- **🎯 Kid-Friendly UI**: Designed specifically for children under 5 with cute dinosaur theme
- **🦕 Dinosaur Characters**: Three adorable dino friends (Brontosaurus, T-Rex, Butterfly) for different voice modes
- **🎵 ElevenLabs Voice**: Converts AI answers to fun, child-friendly speech
- **🤖 Qwen AI**: Generates intelligent, simple answers perfect for young children
- **💫 Quick Questions**: Pre-built space-themed questions for easy exploration
- **🎨 Cute Animations**: Confetti celebrations, floating decorations, and playful interactions
- **📖 Large Text**: Easy-to-read transcript with markdown support
- **🚀 Space Theme**: Beautiful starry background with planets and decorations
- **🎤 Voice Modes**: 
  - **Chatty** (🦕 Brontosaurus): Friendly, conversational tone
  - **Teacher** (🦖 T-Rex): Clear, educational explanations
  - **Story** (🦋 Butterfly): Magical storytelling
- **💾 Conversation Memory**: Remembers previous questions for context
- **🌐 Live Demo**: Deployed on Vercel at https://starrydino.vercel.app

## How It Works

```
Child asks a question
   ↓
Qwen AI generates a simple, fun answer (under 100 words)
   ↓
ElevenLabs converts text to child-friendly speech
   ↓
Child listens to the answer and reads along
   ↓
Conversation is remembered for future questions
```

## Architecture

```
User Query
   ↓
Retrieve Context from Turbopuffer Memory (if available)
   ↓
Semantic Search with Qwen Embeddings (Knowledge Base)
   ↓
Qwen Text Generation with Memory + Knowledge Context
   ↓
Store Conversation in Turbopuffer Memory
   ↓
Audio Generation (ElevenLabs)
   ↓
Audio Playback
```

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add:
   # QWEN_API_KEY=your_qwen_api_key_here
   # ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   # TURBOPUFFER_API_KEY=your_turbopuffer_api_key_here
   # QWEN_REGION=singapore
   ```

3. Start the backend server:
   ```bash
   npm run dev:server
   ```

4. Start the frontend (in another terminal):
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

### Live Demo

Visit https://starrydino.vercel.app to try Starry Dino without installing anything!

## CLI Chatbot

A command-line interface is available for testing the voice chatbot functionality:

```bash
# Text-only mode
node cli-chatbot.js

# Voice mode (requires ElevenLabs API with TTS permissions)
node cli-chatbot.js --voice
```

The CLI chatbot includes:
- Qwen text generation for intelligent answers
- Turbopuffer memory for conversation context
- ElevenLabs text-to-speech for voice output

## Usage

1. **Pick a Dino Friend**: Choose between Chatty (🦕), Teacher (🦖), or Story (🦋) mode
2. **Ask a Question**: Type your space question or click a quick question button
3. **Blast Off!**: Click the "Blast Off!" button to get your answer
4. **Listen & Read**: Hear the fun audio answer and read along with the text
5. **Explore More**: Ask follow-up questions - the dino remembers!

### Quick Questions
Pre-built space-themed questions for instant exploration:
- "Why is the sky blue?"
- "How do stars twinkle?"
- "What do astronauts eat?"
- "Why do we have day and night?"
- "What is the moon made of?"
- "How big is space?"

## Voice Modes

- **Chatty** (🦕 Brontosaurus): Friendly, conversational tone like a fun friend
- **Teacher** (🦖 T-Rex): Clear, educational explanations for learning
- **Story** (🦋 Butterfly): Magical storytelling with imagination

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Lucide React, React Markdown
- **Backend**: Express.js (Vercel serverless functions)
- **AI**: Qwen API for child-friendly text generation (qwen-turbo model)
- **Voice**: ElevenLabs for text-to-speech with kid-friendly voices
- **Memory**: Turbopuffer for conversation context (vector search)
- **Deployment**: Vercel (https://starrydino.vercel.app)
- **Styling**: Custom CSS animations, gradients, and playful effects
- **Icons**: Lucide React for UI icons
- **Markdown**: React Markdown for transcript rendering

## MVP Scope (ElevenLabs Hackathon)

- **Child-Friendly UI**: Designed for toddlers under 5 with large text and cute animations
- **Quick Questions**: Pre-built space-themed questions for instant exploration
- **Qwen AI Integration**: Simple, child-friendly answers under 100 words
- **ElevenLabs Voice**: Fun, engaging speech for children
- **3 Voice Modes**: Chatty, Teacher, and Story with dinosaur characters
- **Conversation Memory**: Remembers context for follow-up questions
- **Audio Playback**: Listen to answers directly in the browser
- **Markdown Support**: Read along with formatted text
- **Confetti Celebrations**: Fun animations when answers arrive
- **Vercel Deployment**: Live demo available at https://starrydino.vercel.app

## Future Extensions

- **More Dino Characters**: Add more dinosaur friends with different personalities
- **Background Music**: Add space-themed background music to audio responses
- **Voice Cloning**: Allow parents to record their own voice for narration
- **Image Generation**: Add AI-generated illustrations for answers
- **Interactive Stories**: Create choose-your-own-adventure space stories
- **Mobile App**: Native iOS and Android applications
- **Multi-Language Support**: Add support for different languages
- **Learning Progress**: Track child's learning journey and achievements
- **Offline Mode**: Download answers for offline use
- **Parent Dashboard**: Tools for parents to monitor and customize content

## Integration Tests

The project includes integration tests for all APIs:
- Qwen API (embeddings and text generation)
- Turbopuffer API (permissions and operations)
- ElevenLabs API (TTS capabilities)

### Running Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test tests/turbopuffer.test.js
npm test tests/turbopuffer-api.test.js
node tests/test-all-apis.js
```

### API Permission Tests

Run the comprehensive API test to check all API permissions:
```bash
node tests/test-all-apis.js
```

## Current Limitations

- **Turbopuffer Memory**: API key lacks write permissions, so conversation memory storage doesn't work. Memory retrieval works if data exists.
- **ElevenLabs TTS**: API key requires TTS permissions for voice generation to work in production.

## Built for ElevenLabs Hackathon 🎉

This project was built for the ElevenLabs Hackathon, showcasing:
- **Child-Friendly Voice**: Using ElevenLabs TTS to create engaging, age-appropriate speech
- **Simple AI**: Qwen generates answers under 100 words for easy comprehension
- **Fun Learning**: Space-themed questions to inspire curiosity in young children
- **Beautiful UI**: Designed specifically for toddlers under 5 with large text and cute animations

## License

MIT
