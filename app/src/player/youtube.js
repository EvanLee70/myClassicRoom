// 유튜브 IFrame API를 한 번만 불러오기
// 차단된 환경(광고 차단기, 사내망 등)에서는 일정 시간 뒤 실패로 알린다.
const LOAD_TIMEOUT_MS = 10000

let promise = null

export function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (promise) return promise
  promise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('유튜브 API 응답 없음')), LOAD_TIMEOUT_MS)
    const prevCb = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer)
      prevCb?.()
      resolve(window.YT)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.async = true
    s.onerror = () => {
      clearTimeout(timer)
      reject(new Error('유튜브 API를 불러오지 못함'))
    }
    document.head.appendChild(s)
  })
  // 실패한 약속은 다음에 다시 시도할 수 있도록 비운다
  promise.catch(() => {
    promise = null
  })
  return promise
}
