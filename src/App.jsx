import { useState, useRef } from 'react'
import { Search, Mic, Play, Pause, Loader2, AlertCircle, Radio, BookOpen, Sparkles } from 'lucide-react'

const modes = [
  { id: 'podcast', name: 'Podcast', icon: Radio, description: 'Conversational tone, like a podcast host' },
  { id: 'professor', name: 'Professor', icon: BookOpen, description: 'Clear, structured, educational' },
  { id: 'story', name: 'Story', icon: Sparkles, description: 'Narrative storytelling with vivid descriptions' }
]

function App() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('podcast')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a question')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, mode })
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      
      // Convert base64 audio to blob and create URL
      if (data.audioData) {
        const audioBlob = new Blob([Uint8Array.from(atob(data.audioData), c => c.charCodeAt(0))], { type: 'audio/mpeg' })
        const audioUrl = URL.createObjectURL(audioBlob)
        data.audioUrl = audioUrl
      }

      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to search. Please make sure the backend server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mic className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">EchoSearch</h1>
          </div>
          <p className="text-xl text-gray-300">Search that speaks. Turn any question into a podcast.</p>
        </div>

        {/* Search Box */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 mb-8">
          {/* Query Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ask anything
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Explain quantum computing simply..."
              rows={3}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
            />
          </div>

          {/* Mode Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Response Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {modes.map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      mode === m.id
                        ? 'bg-purple-600/30 border-purple-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${mode === m.id ? 'text-purple-400' : 'text-gray-400'}`} />
                    <div className={`text-sm font-medium ${mode === m.id ? 'text-white' : 'text-gray-400'}`}>
                      {m.name}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generating Audio...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                Search & Listen
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            {/* Audio Player */}
            <div className="mb-6 p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlayback}
                    className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>
                  <div>
                    <p className="text-white font-semibold text-lg">Audio Response</p>
                    <p className="text-gray-400 text-sm">Mode: {modes.find(m => m.id === mode)?.name}</p>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  {(result.audioSize / 1024).toFixed(1)} KB
                </div>
              </div>
              <audio
                ref={audioRef}
                src={result.audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>

            {/* Answer Text */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                Answer
              </h3>
              <p className="text-gray-300 leading-relaxed">{result.answer}</p>
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-400" />
                  Sources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((source, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300 border border-white/10"
                    >
                      {source.topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-white font-semibold mb-3">How it works:</h3>
          <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
            <li>Enter your question in the search box</li>
            <li>Choose a response mode (Podcast, Professor, or Story)</li>
            <li>Click "Search & Listen" to generate an audio response</li>
            <li>The system retrieves relevant information and converts it to speech</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default App
