// 곡 목록과 대기열을 만드는 도우미 함수 모음
import tracks from './tracks.json'
import eras from './eras.js'

export { tracks, eras }

export const trackById = Object.fromEntries(tracks.map((t) => [t.id, t]))
export const eraById = Object.fromEntries(eras.map((e) => [e.id, e]))

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
