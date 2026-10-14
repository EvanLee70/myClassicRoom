// 유튜브 IFrame API를 한 번만 불러오기
let promise = null

export function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (promise) return promise
  promise = new Promise((resolve) => {
    const prevCb = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prevCb?.()
      resolve(window.YT)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.async = true
    document.head.appendChild(s)
  })
  return promise
}
