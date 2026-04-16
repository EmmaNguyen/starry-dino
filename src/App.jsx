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

const skyDots = [
  'left-[6%] top-[10%]',
  'left-[14%] top-[26%]',
  'left-[24%] top-[8%]',
  'left-[38%] top-[18%]',
  'left-[72%] top-[11%]',
  'left-[84%] top-[22%]',
  'left-[90%] top-[12%]',
  'left-[10%] top-[62%]',
  'left-[22%] top-[78%]',
  'left-[68%] top-[72%]',
  'left-[80%] top-[84%]',
  'left-[92%] top-[68%]',
]

const modes = [
  {
    id: 'podcast',
    name: 'Chatty',
    icon: Radio,
    description: 'Warm and friendly',
    accent: 'from-yellow-300 to-orange-300',
  },
  {
    id: 'professor',
    name: 'Teacher',
    icon: BookOpen,
    description: 'Slow and clear',
    accent: 'from-sky-300 to-cyan-300',
  },
  {
    id: 'story',
    name: 'Story',
    icon: Sparkles,
    description: 'Soft and dreamy',
    accent: 'from-pink-300 to-fuchsia-300',
  },
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

  const selectedMode = useMemo(() => modes.find((item) => item.id === mode) ?? modes[0], [mode])

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please ask the stars something first!')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, mode }),
      })

      if (!response.ok) {
        throw new Error('Something went wrong.')
      }

      const data = await response.json()

      if (data.audioData) {
        const audioBlob = new Blob([Uint8Array.from(atob(data.audioData), (char) => char.charCodeAt(0))], {
          type: 'audio/mpeg',
        })
        const audioUrl = URL.createObjectURL(audioBlob)
        data.audioUrl = audioUrl
      }

      setResult(data)
    } catch (err) {
      setError(err.message || 'The stars are too far away right now. Try again soon!')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault()
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
    const wholeSeconds = Math.max(0, Math.floor(seconds))
    const minutes = Math.floor(wholeSeconds / 60)
    const remainingSeconds = wholeSeconds % 60
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#20145c] text-slate-900 selection:bg-pink-200">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#4b2cb8_0%,#2e1c81_42%,#20145c_70%,#140d41_100%)]" />
        <div className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-[#7ce7ff]/30 blur-3xl" />
        <div className="absolute right-[-5rem] top-0 h-96 w-96 rounded-full bg-[#ffb7df]/20 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-1/4 h-80 w-80 rounded-full bg-[#ffe58f]/15 blur-3xl" />
        <div className="absolute right-[10%] top-[20%] h-28 w-28 rounded-full bg-gradient-to-br from-[#8de5ff] to-[#60b8ff] opacity-80 shadow-[0_0_80px_rgba(96,184,255,0.45)] floating-slow" />
        <div className="absolute left-[8%] top-[55%] h-20 w-20 rounded-full bg-gradient-to-br from-[#ffd87a] to-[#ffb55c] opacity-85 shadow-[0_0_60px_rgba(255,196,92,0.4)] floating-fast" />
        <div className="absolute right-[18%] bottom-[16%] h-24 w-24 rounded-full bg-gradient-to-br from-[#ffb4e1] to-[#ff8eb8] opacity-80 shadow-[0_0_70px_rgba(255,142,184,0.35)] floating" />
        {skyDots.map((dot, index) => (
          <span key={dot} className={`absolute ${dot} star-dot ${index % 2 === 0 ? 'twinkle-a' : 'twinkle-b'}`} />
        ))}
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 rounded-full bg-white/[0.14] px-4 py-3 backdrop-blur-md">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#ffe17a] to-[#ffb95f] text-[#5a2b00] shadow-[0_8px_24px_rgba(255,190,92,0.45)]">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl text-white">Starry Echo</p>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Little space answers</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-3 py-2 text-sm text-white/80 backdrop-blur-md">
              <Zap className="h-4 w-4 text-[#ffe17a]" />
              Quick
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-3 py-2 text-sm text-white/80 backdrop-blur-md">
              <Waves className="h-4 w-4 text-[#8de5ff]" />
              Gentle voice
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-3 py-2 text-sm text-white/80 backdrop-blur-md">
              <Headphones className="h-4 w-4 text-[#ffb4e1]" />
              Hear and read
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.12] px-6 py-8 backdrop-blur-md shadow-[0_24px_80px_rgba(12,8,60,0.38)] sm:px-8 sm:py-10">
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/10 to-transparent" />
            <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-[#fff0a6] moon-glow" />
            <div className="absolute right-10 top-12 h-3 w-3 rounded-full bg-white/60" />
            <div className="absolute left-6 top-10 h-5 w-5 rounded-full bg-[#ffe17a] twinkle-a" />
            <div className="absolute left-20 top-16 h-3 w-3 rounded-full bg-[#8de5ff] twinkle-b" />
            <div className="relative max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#fff2b0]">Tiny questions, starry answers</p>
              <h1 className="font-display text-balance text-5xl leading-[0.95] text-white sm:text-6xl">
                Ask a little question and hear a magical answer.
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">
                Made for little explorers. Tap a star, ask something fun, and listen together.
              </p>
            </div>
          </div>

          <div className="relative flex min-h-[280px] items-end justify-center overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#84dfff] via-[#7bb6ff] to-[#5b6dff] p-6 shadow-[0_24px_80px_rgba(12,8,60,0.38)]">
            <div className="absolute left-6 top-6 h-7 w-7 rounded-full bg-white/85 twinkle-a" />
            <div className="absolute right-8 top-12 h-4 w-4 rounded-full bg-[#ffe17a] twinkle-b" />
            <div className="absolute bottom-5 left-8 h-24 w-24 rounded-full bg-[#7a4cff] opacity-25 blur-2xl" />
            <div className="absolute bottom-0 left-0 right-0 h-16 rounded-t-[100%] bg-[#4a2caa]/50" />
            <div className="relative flex w-full items-end justify-center gap-4">
              <div className="floating-fast relative h-28 w-24 rounded-[45%] bg-gradient-to-b from-[#ffdb7b] to-[#ffb457] shadow-[0_10px_30px_rgba(255,185,87,0.45)]">
                <div className="absolute left-1/2 top-5 h-8 w-8 -translate-x-1/2 rounded-full bg-white/70" />
                <div className="absolute bottom-5 left-1/2 h-10 w-14 -translate-x-1/2 rounded-full bg-white/22" />
              </div>
              <div className="floating relative mb-2 flex h-40 w-36 items-center justify-center rounded-[50%] bg-gradient-to-b from-[#ffdff0] to-[#ff9bcf] shadow-[0_16px_40px_rgba(255,155,207,0.5)]">
                <div className="absolute -top-3 right-6 h-8 w-8 rotate-12 rounded-full bg-[#fff4a8]" />
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/22 backdrop-blur">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <p className="mt-3 font-display text-2xl text-white">Hi!</p>
                </div>
              </div>
              <div className="floating-slow relative h-24 w-20 rounded-[48%] bg-gradient-to-b from-[#8de5ff] to-[#62b0ff] shadow-[0_10px_30px_rgba(98,176,255,0.45)]">
                <div className="absolute left-1/2 top-4 h-6 w-6 -translate-x-1/2 rounded-full bg-white/65" />
                <div className="absolute bottom-4 left-1/2 h-8 w-12 -translate-x-1/2 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] bg-white/[0.12] p-5 backdrop-blur-md shadow-[0_24px_80px_rgba(12,8,60,0.3)]">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">Pick a voice</p>
            <div className="mt-4 grid gap-3">
              {modes.map((item) => {
                const Icon = item.icon
                const selected = mode === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id)}
                    className={[
                      'rounded-[1.5rem] border px-4 py-4 text-left transition duration-200',
                      selected
                        ? 'border-white/50 bg-white/[0.24] scale-[1.01] shadow-[0_10px_30px_rgba(255,255,255,0.15)]'
                        : 'border-white/[0.15] bg-white/10 hover:bg-white/[0.16]',
                      'focus:outline-none focus:ring-2 focus:ring-[#fff0a6]',
                    ].join(' ')}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          'grid h-10 w-10 place-items-center rounded-full text-[#5a2b00] shadow-sm',
                          selected ? `bg-gradient-to-br ${item.accent}` : 'bg-white/75 text-slate-600',
                        ].join(' ')}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-display text-2xl text-white">{item.name}</p>
                        <p className="text-sm text-white/80">{item.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#fff8ec] p-6 shadow-[0_24px_80px_rgba(12,8,60,0.25)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9c6c26]">Ask the stars</p>
                <p className="mt-2 font-display text-4xl leading-none text-[#5d3271]">What should we learn about?</p>
                <p className="mt-3 text-base text-[#6b5680]">Press Enter to start. Shift+Enter for a new line.</p>
              </div>
              <div className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#7b4aa8] shadow-sm sm:block">
                Voice: {selectedMode.name}
              </div>
            </div>

            <textarea
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How do stars twinkle?"
              rows={5}
              className="mt-5 w-full resize-none rounded-[1.75rem] border-4 border-[#ffd98d] bg-white px-5 py-4 text-lg leading-relaxed text-[#4e3e5b] placeholder:text-[#baacc7] outline-none transition focus:border-[#8de5ff] focus:ring-4 focus:ring-[#8de5ff]/30"
            />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#7b6992]">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  ON
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff2ca] px-3 py-2 shadow-sm">
                  Space sounds
                </span>
              </div>

              <button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#ffcd54] via-[#ffa85a] to-[#ff7eb6] px-7 py-4 font-display text-2xl text-white shadow-[0_12px_30px_rgba(255,126,182,0.35)] transition duration-200 hover:scale-[1.01] hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[#ffd98d] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                type="button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Calling the stars...
                  </>
                ) : (
                  <>
                    <Search className="h-6 w-6" />
                    Blast off!
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-[1.5rem] border-2 border-[#ffb8c8] bg-[#fff0f4] p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff6b8a]" />
                <div className="text-sm text-[#9d4f64]">{error}</div>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(12,8,60,0.25)]">
            <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="bg-gradient-to-b from-[#8edfff] via-[#86b9ff] to-[#7268ff] p-6 text-white sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-white/20 backdrop-blur">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">Listen</p>
                    <p className="font-display text-3xl">Your star answer</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.75rem] bg-white/[0.16] p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayback}
                      className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#fff1a8] to-[#ffc96e] text-[#663300] shadow-[0_12px_28px_rgba(255,212,117,0.45)] transition hover:scale-[1.04] focus:outline-none focus:ring-4 focus:ring-white/40"
                      type="button"
                    >
                      {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 translate-x-[2px]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white/90">{selectedMode.name} voice</p>
                      <p className="text-xs text-white/70">
                        {typeof result.audioSize === 'number' ? `${(result.audioSize / 1024).toFixed(1)} KB` : 'Audio ready'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, duration || 0)}
                      value={Math.min(currentTime, duration || 0)}
                      onChange={(event) => seekTo(Number(event.target.value))}
                      className="kid-slider w-full accent-[#fff1a8]"
                      aria-label="Seek audio"
                    />
                    <div className="mt-2 flex items-center justify-between text-sm text-white/75">
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
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-white/70">
                      <LinkIcon className="h-4 w-4" />
                      Help from
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.sources.map((source, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-white/[0.18] px-3 py-1.5 text-sm text-white/90 backdrop-blur"
                          title={source.url || source.topic}
                        >
                          {source.topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#fff8ec] p-6 sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9c6c26]">Read along</p>
                <div className="mt-4 rounded-[1.75rem] bg-white p-5 shadow-inner">
                  <div className="prose prose-lg max-w-none text-[#5c4c6b] prose-headings:text-[#5d3271] prose-p:leading-9 prose-strong:text-[#5d3271] prose-p:text-xl">
                    <ReactMarkdown>{result.answer}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-between gap-3 text-sm text-white/72 sm:flex-row">
          <p>Made for tiny explorers and grown-up helpers.</p>
          <p>Voices by ElevenLabs. Search by Turbopuffer.</p>
        </div>
      </div>
    </div>
  )
}

export default App
