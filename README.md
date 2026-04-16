# EchoSearch

An Audio RAG (Podcast-Style Search Engine) that transforms retrieved knowledge into podcast-style audio responses with AI-powered semantic search and conversation memory.

## Features

- **Semantic Search**: Retrieves relevant information using Qwen embeddings (1024-dimensional vectors)
- **Qwen Text Generation**: Generates intelligent answers using Qwen's chat completions API
- **Conversation Memory**: Turbopuffer-based memory for contextual conversations (requires API write permissions)
- **RAG Pipeline**: Generates structured answers using LLM with memory context
- **Audio Generation**: Converts answers to speech using ElevenLabs
- **Multiple Modes**: Podcast, Professor, and Story response styles
- **Audio Playback**: Play generated audio directly in the browser
- **CLI Chatbot**: Command-line interface for testing voice chatbot functionality
- **Modern UI**: Beautiful dark theme with TailwindCSS

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

1. Enter your question in the search box
2. Choose a response mode (Podcast, Professor, or Story)
3. Click "Search & Listen" to generate an audio response
4. Listen to the answer and view the text transcript

## Response Modes

- **Podcast**: Conversational tone, like a podcast host
- **Professor**: Clear, structured, educational style
- **Story**: Narrative storytelling with vivid descriptions

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Lucide React
- **Backend**: Express.js
- **AI/Embeddings**: Qwen API for text generation and embeddings (text-embedding-v3, qwen-turbo)
- **Memory**: Turbopuffer for conversation context (vector search)
- **Audio**: ElevenLabs for text-to-speech
- **Search**: Semantic search with Qwen embeddings (1024-dimensional vectors)
- **RAG**: Advanced RAG with memory context and Qwen text generation

## MVP Scope

- Single query input
- Semantic search with Qwen embeddings (1024-dimensional vectors)
- Qwen text generation for intelligent answers
- Turbopuffer memory for conversation context
- Single voice narration (ElevenLabs)
- Audio playback
- 3 response modes (Podcast, Professor, Story)
- CLI chatbot for testing

## Future Extensions

- ~~Turbopuffer integration for vector search~~ ✅ Implemented (memory with write permissions needed)
- Background music generation
- Multi-speaker debate mode
- Real-time streaming
- User accounts and history
- Mobile app
- Improve Turbopuffer memory with proper API permissions

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
- **ElevenLabs TTS**: API key lacks TTS permissions, so voice generation in web app doesn't work. CLI chatbot voice mode also affected.
- **Fallback Behavior**: System gracefully falls back to simple RAG when Qwen text generation fails or memory is unavailable.

## License

MIT
