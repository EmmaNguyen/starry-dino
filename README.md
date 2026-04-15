# EchoSearch

An Audio RAG (Podcast-Style Search Engine) that transforms retrieved knowledge into podcast-style audio responses.

## Features

- **Semantic Search**: Retrieves relevant information from a knowledge base
- **RAG Pipeline**: Generates structured answers using LLM
- **Audio Generation**: Converts answers to speech using ElevenLabs
- **Multiple Modes**: Podcast, Professor, and Story response styles
- **Audio Playback**: Play generated audio directly in the browser
- **Modern UI**: Beautiful dark theme with TailwindCSS

## Architecture

```
User Query
   ↓
Semantic Search (Knowledge Base)
   ↓
Simple RAG (Context Retrieval)
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
   # ELEVENLABS_API_KEY=your_key_here
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
- **Audio**: ElevenLabs for text-to-speech
- **Search**: Semantic search (MVP uses keyword matching)
- **RAG**: Simple context retrieval with mode-appropriate formatting

## MVP Scope

- Single query input
- Semantic search with knowledge base
- Basic RAG answer generation
- Single voice narration (ElevenLabs)
- Audio playback
- 3 response modes (Podcast, Professor, Story)

## Future Extensions

- Turbopuffer integration for vector search
- Background music generation
- Multi-speaker debate mode
- Real-time streaming
- User accounts and history
- Mobile app

## Integration Tests

The project includes integration tests for ElevenLabs API.

### Running Tests

```bash
npm test
```

## License

MIT
