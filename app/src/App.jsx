import { useCallback, useEffect, useRef, useState } from 'react'
import { allIntro, eraById, eras, fmt, tracks } from './data/catalog.js'
import { usePlayer } from './player/PlayerContext.jsx'
import HistoryPane from './components/HistoryPane.jsx'
import EraTracks from './components/EraTracks.jsx'
import PlayerBar from './components/PlayerBar.jsx'
import LibraryDrawer from './components/LibraryDrawer.jsx'

const DESKTOP_QUERY = '(min-width: 960px)'

function useIsDesktop() {
  const [is, setIs] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const on = () => setIs(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return is
}

export default function App() {
  const isDesktop = useIsDesktop()
  const { playQueue, favorites } = usePlayer()
  const [activeEra, setActiveEra] = useState(1)
  const [drawer, setDrawer] = useState(false)
  const historyRef = useRef(null)
  const panelRef = useRef(null)
  const stripRef = useRef(null)

  // 스크롤 위치로 지금 읽고 있는 시대 찾기
  useEffect(() => {
    const pane = historyRef.current
    const target = isDesktop ? pane : window
    let raf = 0
    const check = () => {
      raf = 0
      const box = isDesktop ? pane.getBoundingClientRect() : { top: 0, height: window.innerHeight }
      const anchor = box.top + box.height * 0.35
      let found = 1
      pane.querySelectorAll('[data-era]').forEach((el) => {
        if (el.getBoundingClientRect().top <= anchor) found = Number(el.dataset.era)
      })
      setActiveEra(found)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    target.addEventListener('scroll', onScroll, { passive: true })
    check()
    return () => {
      target.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [isDesktop])

  // 시대가 바뀌면 오른쪽 패널을 맨 위로, 상단 띠는 해당 칩이 보이게
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    const chip = stripRef.current?.querySelector(`[data-chip="${activeEra}"]`)
    chip?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeEra])

  const jumpTo = useCallback((id) => {
    document.getElementById(`era-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const era = eraById[activeEra]

  return (
    <div className="app" style={{ '--accent': era.accent }}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden>♪</span>
          <div>
            <p className="brand-name">myClassicRoom</p>
            <p className="brand-sub">나의 클래식 음악실</p>
          </div>
        </div>
        <div className="top-actions">
          <button
            className="btn gold"
            onClick={() => playQueue(tracks.map((t) => t.id), 0, '클래식 한 바퀴')}
            title="중세부터 현재까지 모든 곡을 시대 순서대로"
          >
            ▶ 한 바퀴 듣기 <small>{fmt(tracks.length)}곡</small>
          </button>
          <button
            className="btn"
            onClick={() => playQueue(allIntro().map((t) => t.id), 0, '입문 한 바퀴')}
            title="시대별 입문곡만 시대 순서대로"
          >
            ⭐ 입문 <small>{fmt(allIntro().length)}곡</small>
          </button>
          <button className="btn" onClick={() => setDrawer(true)}>
            내 음악실 {favorites.length > 0 && <small>♥ {fmt(favorites.length)}</small>}
          </button>
        </div>
        <nav className="era-strip" ref={stripRef} aria-label="시대 바로가기">
          {eras.map((e) => (
            <button
              key={e.id}
              data-chip={e.id}
              className={e.id === activeEra ? 'on' : ''}
              style={{ '--accent': e.accent }}
              onClick={() => jumpTo(e.id)}
            >
              <span>{String(e.id).padStart(2, '0')}</span> {e.name}
            </button>
          ))}
        </nav>
      </header>

      <main className="layout">
        <HistoryPane ref={historyRef} activeEra={activeEra} isDesktop={isDesktop} />
        {isDesktop && (
          <aside className="panel" ref={panelRef} aria-live="polite">
            <EraTracks key={era.id} era={era} />
          </aside>
        )}
      </main>

      <PlayerBar />
      <LibraryDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  )
}
