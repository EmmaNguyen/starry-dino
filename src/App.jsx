import { useState, useRef } from 'react'
import { Search, Mic, Play, Pause, Loader2, AlertCircle, Radio, BookOpen, Sparkles, Headphones, Zap, Waves, Image as ImageIcon } from 'lucide-react'

const modes = [
  { 
    id: 'podcast', 
    name: 'Podcast', 
    icon: Radio, 
    description: 'Conversational tone, like a podcast host', 
    color: 'from-purple-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop'
  },
  { 
    id: 'professor', 
    name: 'Professor', 
    icon: BookOpen, 
    description: 'Clear, structured, educational', 
    color: 'from-blue-500 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop'
  },
  { 
    id: 'story', 
    name: 'Story', 
    icon: Sparkles, 
    description: 'Narrative storytelling with vivid descriptions', 
    color: 'from-amber-500 to-orange-500',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop'
  }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl rounded-3xl"></div>
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  EchoSearch
                </h1>
              </div>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Transform any question into a podcast-style audio response powered by AI
              </p>
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Waves className="w-4 h-4" />
                  <span>Audio-First</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Headphones className="w-4 h-4" />
                  <span>Immersive</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl rounded-3xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop"
              alt="AI Technology"
              className="relative w-full h-64 object-cover rounded-3xl opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent rounded-3xl"></div>
          </div>
        </div>

        {/* Search Box */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 mb-8">
          {/* Query Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Your Question
            </label>
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What would you like to know about?"
                rows={4}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none text-lg transition-all"
              />
              <div className="absolute bottom-4 right-4 text-gray-500 text-sm">
                Press Enter to search
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
              Response Style
            </label>
            <div className="grid grid-cols-3 gap-4">
              {modes.map((m) => {
                const Icon = m.icon
                const selected = mode === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`relative overflow-hidden rounded-2xl border-2 transition-all group ${
                      selected
                        ? 'bg-white/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${m.color} opacity-0 rounded-2xl transition-opacity ${selected ? 'opacity-10' : 'group-hover:opacity-5'}`}></div>
                    <div className="relative">
                      {/* Image */}
                      <div className="relative h-32 mb-3 overflow-hidden rounded-xl">
                        <img 
                          src={m.image} 
                          alt={m.name}
                          className={`w-full h-full object-cover transition-transform group-hover:scale-110 ${selected ? 'opacity-100' : 'opacity-60'}`}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent ${selected ? 'opacity-30' : 'opacity-50'}`}></div>
                      </div>
                      <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center transition-all -mt-6 relative z-10 ${
                        selected 
                          ? `bg-gradient-to-r ${m.color}` 
                          : 'bg-white/10 backdrop-blur'
                      }`}>
                        <Icon className={`w-5 h-5 ${selected ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className={`text-sm font-semibold ${selected ? 'text-white' : 'text-gray-400'}`}>
                        {m.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{m.description}</div>
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
            className="w-full px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generating Audio Response...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                Generate Audio Response
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-4">
            {/* Audio Player */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button
                    onClick={togglePlayback}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </div>
                  </button>
                  <div>
                    <p className="text-white font-semibold text-lg">Audio Response</p>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-purple-500/20 rounded-full text-purple-300 text-xs uppercase tracking-wider">
                        {modes.find(m => m.id === mode)?.name}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm font-medium">
                    {(result.audioSize / 1024).toFixed(1)} KB
                  </div>
                  <div className="text-gray-500 text-xs">MP3 Audio</div>
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
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                Transcript
              </h3>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <p className="text-gray-300 leading-relaxed text-lg">{result.answer}</p>
              </div>
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  Knowledge Sources
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.sources.map((source, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white/5 rounded-xl text-sm text-gray-300 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      {source.topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            Powered by ElevenLabs • Turbopuffer • Semantic Search
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
