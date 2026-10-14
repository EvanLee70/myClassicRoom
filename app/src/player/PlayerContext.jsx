// 재생기 상태: 대기열, 유튜브 재생, 대체 음원 자동 전환, 즐겨찾기, 최근 들은 곡
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { trackById } from '../data/catalog.js'
import { loadYouTubeApi } from './youtube.js'

const PlayerCtx = createContext(null)
export const usePlayer = () => useContext(PlayerCtx)

const LS_FAV = 'mcr.favorites'
const LS_RECENT = 'mcr.recent'
const RECENT_MAX = 30
const SKIP_DELAY = 6 // 초: 재생 불가 곡에서 다음 곡으로 넘어가기까지

function readLS(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key))
    return Array.isArray(v) ? v.filter((id) => trackById[id]) : fallback
  } catch {
    return fallback
  }
}
function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 저장 불가 환경(사생활 보호 모드 등)은 조용히 무시 */
  }
}

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]) // 곡 id 배열
  const [index, setIndex] = useState(-1)
  const [label, setLabel] = useState('')
  const [mode, setMode] = useState('idle') // idle | youtube | audio | failed
  const [playing, setPlaying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [favorites, setFavorites] = useState(() => readLS(LS_FAV, []))
  const [recent, setRecent] = useState(() => readLS(LS_RECENT, []))

  const ytRef = useRef(null) // YT.Player
  const ytReady = useRef(false)
  const mountingRef = useRef(false)
  const pendingRef = useRef(null) // API 준비 전 요청된 영상
  const audioRef = useRef(null)
  const timerRef = useRef(null)
  const stateRef = useRef({ queue, index })
  stateRef.current = { queue, index }

  const current = index >= 0 ? trackById[queue[index]] : null

  useEffect(() => writeLS(LS_FAV, favorites), [favorites])
  useEffect(() => writeLS(LS_RECENT, recent), [recent])

  const clearTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = null
    setCountdown(0)
  }

  const goTo = useCallback((i) => {
    const { queue: q } = stateRef.current
    if (i < 0 || i >= q.length) {
      setPlaying(false)
      return
    }
    setIndex(i)
  }, [])

  const next = useCallback(() => goTo(stateRef.current.index + 1), [goTo])
  const prev = useCallback(() => goTo(stateRef.current.index - 1), [goTo])

  // 재생 실패 처리: 대체 음원 → 없으면 안내 후 자동으로 다음 곡
  const handleFail = useCallback(
    (track) => {
      try {
        ytRef.current?.stopVideo?.()
      } catch {
        /* 무시 */
      }
      if (track?.fallbackAudio) {
        setMode('audio')
        return
      }
      setMode('failed')
      setPlaying(false)
      clearTimer()
      const { index: i, queue: q } = stateRef.current
      if (i + 1 < q.length) {
        let left = SKIP_DELAY
        setCountdown(left)
        timerRef.current = setInterval(() => {
          left -= 1
          setCountdown(left)
          if (left <= 0) {
            clearTimer()
            next()
          }
        }, 1000)
      }
    },
    [next],
  )

  // 유튜브 재생기 만들기 (PlayerBar가 자리를 마련한 뒤 호출)
  const mountYouTube = useCallback(
    (el) => {
      if (!el || mountingRef.current) return
      mountingRef.current = true
      // React가 관리하지 않는 안쪽 자리를 따로 만들어 iframe으로 바꾼다
      const slot = document.createElement('div')
      el.appendChild(slot)
      loadYouTubeApi().then((YT) => {
        ytRef.current = new YT.Player(slot, {
          width: '100%',
          height: '100%',
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: () => {
              ytReady.current = true
              if (pendingRef.current) {
                ytRef.current.loadVideoById(pendingRef.current)
                pendingRef.current = null
              }
            },
            onStateChange: (e) => {
              if (e.data === 1) setPlaying(true)
              if (e.data === 2) setPlaying(false)
              if (e.data === 0) {
                setPlaying(false)
                next()
              }
            },
            onError: () => {
              const { queue: q, index: i } = stateRef.current
              handleFail(trackById[q[i]])
            },
          },
        })
      })
    },
    [handleFail, next],
  )

  // 곡이 바뀌면 재생
  useEffect(() => {
    clearTimer()
    if (!current) return
    setRecent((r) => [current.id, ...r.filter((id) => id !== current.id)].slice(0, RECENT_MAX))
    if (audioRef.current) audioRef.current.pause()
    if (!current.youtubeId) {
      handleFail(current)
      return
    }
    setMode('youtube')
    if (ytReady.current) ytRef.current.loadVideoById(current.youtubeId)
    else pendingRef.current = current.youtubeId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, queue])

  // 대기열 시작: ids 배열, 시작 위치, 이름표
  const playQueue = useCallback((ids, start = 0, name = '') => {
    if (!ids.length) return
    setQueue(ids)
    setLabel(name)
    setIndex(start)
  }, [])

  // 한 곡 재생: 같은 목록(context) 안에서 이어 듣기
  const playTrack = useCallback(
    (id, contextIds, name) => {
      const ids = contextIds && contextIds.includes(id) ? contextIds : [id]
      playQueue(ids, ids.indexOf(id), name || '')
    },
    [playQueue],
  )

  const togglePlay = useCallback(() => {
    if (mode === 'youtube' && ytRef.current) {
      const s = ytRef.current.getPlayerState?.()
      if (s === 1) ytRef.current.pauseVideo()
      else ytRef.current.playVideo()
    } else if (mode === 'audio' && audioRef.current) {
      if (audioRef.current.paused) audioRef.current.play()
      else audioRef.current.pause()
    }
  }, [mode])

  const toggleFavorite = useCallback(
    (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f])),
    [],
  )

  const value = {
    queue,
    index,
    label,
    current,
    mode,
    playing,
    countdown,
    favorites,
    recent,
    audioRef,
    setPlaying,
    mountYouTube,
    playQueue,
    playTrack,
    togglePlay,
    next,
    prev,
    goTo,
    cancelSkip: clearTimer,
    toggleFavorite,
    clearRecent: () => setRecent([]),
  }
  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>
}
