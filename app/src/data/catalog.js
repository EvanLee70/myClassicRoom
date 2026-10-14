// 곡 목록과 대기열을 만드는 도우미 함수 모음
import rawTracks from './tracks.json'
import eras from './eras.js'
import artists, { fanTracks } from './artists/index.js'

// "1690년경" → 1690, "9세기경" → 800 (세기는 그 세기의 첫해로)
export function yearNum(s) {
  const txt = s || ''
  const c = txt.match(/(\d{1,2})세기/)
  if (c) return (Number(c[1]) - 1) * 100
  const y = txt.match(/(\d{3,4})/)
  return y ? Number(y[1]) : 9999
}

// 시대 순 → 같은 시대 안에서는 작곡 연도 순 (같은 해는 원래 순서 유지)
const tracks = [...rawTracks].sort(
  (a, b) => a.era - b.era || yearNum(a.workYear) - yearNum(b.workYear) || a.order - b.order,
)

export { tracks, eras, artists, fanTracks }

// 재생기·즐겨찾기는 연표 곡과 팬클럽 영상을 함께 다룬다
export const trackById = Object.fromEntries([...tracks, ...fanTracks].map((t) => [t.id, t]))
export const artistByKey = Object.fromEntries(artists.map((a) => [a.key, a]))
// 곡이 속한 곳의 이름표: 시대 이름 또는 "팬클럽 · 음악가"
export const placeLabel = (t) => (t.era ? eraById[t.era]?.name : `팬클럽 · ${t.artistName}`)
export const eraById = Object.fromEntries(eras.map((e) => [e.id, e]))

// 시대 연도 나누기: "1600~1750" → { from: "1600", to: "1750" }
export function eraRange(era) {
  const [from, to] = era.years.split('~')
  return from ? { from, to: to || '' } : { from: `~${to}`, to: '' }
}

// 연주자 대표 이름: "트레버 피녹 / 잉글리시 콘서트" → "트레버 피녹"
export const performerKey = (p) => (p || '').split('/')[0].trim()

export const tracksOfEra = (eraId) => tracks.filter((t) => t.era === eraId)
export const introOfEra = (eraId) => tracks.filter((t) => t.era === eraId && t.intro)
export const tracksOfComposer = (name) => tracks.filter((t) => t.composer === name)
export const tracksOfPerformer = (key) => tracks.filter((t) => t.performer.includes(key))

export const unique = (arr) => [...new Set(arr)]

export const composersOfEra = (eraId) => unique(tracksOfEra(eraId).map((t) => t.composer))
export const performersOfEra = (eraId) =>
  unique(tracksOfEra(eraId).map((t) => performerKey(t.performer))).filter(
    (p) => p && p !== '연주 정보 없음',
  )

export const allIntro = () => tracks.filter((t) => t.intro)

// 쉼표 천 단위 표기
export const fmt = (n) => Number(n).toLocaleString('ko-KR')

export const searchUrl = (t) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(t.searchQuery)}`
