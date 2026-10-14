import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 한글 글꼴: 나눔고딕(본문) + 나눔명조(제목) — 앱에 함께 묶어 어디서나 같은 모양으로 보이게
import '@fontsource/nanum-gothic/400.css'
import '@fontsource/nanum-gothic/700.css'
import '@fontsource/nanum-gothic/800.css'
import '@fontsource/nanum-myeongjo/400.css'
import '@fontsource/nanum-myeongjo/700.css'
import '@fontsource/nanum-myeongjo/800.css'
import './styles.css'
import App from './App.jsx'
import { PlayerProvider } from './player/PlayerContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </StrictMode>,
)
