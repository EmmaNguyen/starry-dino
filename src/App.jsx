import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Search,
  Mic,
  Play,
  Pause,
  Loader2,
  AlertCircle,
  Radio,
  BookOpen,
  Sparkles,
  Headphones,
  Zap,
  Waves,
  Link as LinkIcon,
} from 'lucide-react'

const modes = [
  {
    id: 'podcast',
    name: 'Podcast',
    icon: Radio,
    description: 'Natural and conversational',
    accent: 'from-emerald-500 to-cyan-500',
  },
  {
    id: 'professor',
    name: 'Professor',
    icon: BookOpen,
    description: 'Clear, structured, and educational',
    accent: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'story',
    name: 'Story',
    icon: Sparkles,
    description: 'Narrative and expressive',
    accent: 'from-orange-500 to-rose-500',
  }
]

function App() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('podcast')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  const selectedMode = useMemo(() => modes.find((m) => m.id === mode) ?? modes[0], [mode])

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
      setError(err.message || 'Unable to generate an answer. Make sure the backend server is running on port 3001.')
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault()
      handleSearch()
    }
  }

  const seekTo = (next) => {
    if (!audioRef.current) return
    const clamped = Math.max(0, Math.min(next, duration || 0))
    audioRef.current.currentTime = clamped
    setCurrentTime(clamped)
  }

  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [result?.audioUrl])

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00'
    const s = Math.max(0, Math.floor(seconds))
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${String(r).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-sky-50 text-slate-900 selection:bg-cyan-200">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/35 blur-3xl" />
        <div className="absolute -right-20 top-24 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-sm">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">EchoSearch</p>
              <p className="text-xs text-slate-600">Audio answers with readable transcripts</p>
            </div>
          </div>

          <div className="hidden items-center gap-4 text-xs text-slate-600 sm:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
              <Zap className="h-3.5 w-3.5" />
              Quick
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
              <Waves className="h-3.5 w-3.5" />
              Natural audio
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
              <Headphones className="h-3.5 w-3.5" />
              Listen and read
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Ask a question and get a clear audio answer.
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-700 sm:text-lg">
              EchoSearch turns your question into a spoken explanation and a clean transcript, with reference topics included.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Response Style</p>
            <div className="mt-3 grid gap-2">
              {modes.map((m) => {
                const Icon = m.icon
                const selected = mode === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={[
                      'rounded-xl border px-3 py-3 text-left transition',
                      selected
                        ? 'border-cyan-400 bg-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.18)_inset]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                      'focus:outline-none focus:ring-2 focus:ring-cyan-300',
                    ].join(' ')}
                    type="button"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={[
                          'grid h-8 w-8 place-items-center rounded-lg text-white',
                          selected ? `bg-gradient-to-br ${m.accent}` : 'bg-slate-300',
                        ].join(' ')}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-600">{m.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-slate-900">Your question</p>
              <p className="mt-1 text-sm text-slate-600">Press Enter to generate. Use Shift + Enter for a new line.</p>
            </div>
            <p className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 sm:block">
              Selected style: <span className="font-semibold text-slate-900">{selectedMode.name}</span>
            </p>
          </div>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Example: Explain how photosynthesis works in one minute."
            rows={5}
            className="mt-5 w-full resize-none rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base leading-relaxed text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Server: npm run dev:server on port 3001
              </span>
              <span className="hidden sm:inline">Audio format: MP3</span>
            </div>

            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:from-cyan-600 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              type="button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating audio...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Generate audio response
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>

        {result && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100">
                    <Headphones className="h-4 w-4 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Audio answer</p>
                    <p className="text-xs text-slate-600">
                      Style: {selectedMode.name}
                      {typeof result.audioSize === 'number' ? ` • ${(result.audioSize / 1024).toFixed(1)} KB` : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <button
                    onClick={togglePlayback}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white transition hover:from-cyan-600 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-cyan-200"
                    type="button"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, duration || 0)}
                      value={Math.min(currentTime, duration || 0)}
                      onChange={(e) => seekTo(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                      aria-label="Seek audio"
                    />
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                      <span>{formatTime(currentTime)}</span>
                      <span>{duration ? formatTime(duration) : '0:00'}</span>
                    </div>
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={result.audioUrl}
                  onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
                  onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />

                {result.sources && result.sources.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      <LinkIcon className="h-4 w-4" />
                      Reference Topics
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.sources.map((source, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                          title={source.url || source.topic}
                        >
                          {source.topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Transcript</p>
                <div className="mt-3 text-sm leading-relaxed text-slate-700 prose prose-sm max-w-none">
                  <ReactMarkdown>{result.answer}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>Powered by ElevenLabs, Turbopuffer, and semantic search.</p>
          <p>Designed for fast listening and easy reading.</p>
        </div>
      </div>
    </div>
  )
}

export default App
