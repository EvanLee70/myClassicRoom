import { useCallback, useEffect, useRef, useState } from 'react'
import { allIntro, eraById, eras, fmt, tracks } from './data/catalog.js'
import { usePlayer } from './player/usePlayer.js'
import HistoryPane from './components/HistoryPane.jsx'
import EraTracks from './components/EraTracks.jsx'
import PlayerBar from './components/PlayerBar.jsx'
import LibraryDrawer from './components/LibraryDrawer.jsx'
import FanClub from './components/FanClub.jsx'

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
  // 화면 전환: 클래식 연표 / 팬클럽 (주소 끝 #fan 으로 바로 열기 가능)
  const [view, setView] = useState(() => (window.location.hash === '#fan' ? 'fan' : 'timeline'))
  const changeView = (v) => {
    setView(v)
    try {
      window.history.replaceState(null, '', v === 'fan' ? '#fan' : window.location.pathname)
    } catch {
      /* 무시 */
    }
    window.scrollTo(0, 0)
  }
  const historyRef = useRef(null)
  const panelRef = useRef(null)
  const stripRef = useRef(null)

  // 스크롤 위치로 지금 읽고 있는 시대 찾기
  useEffect(() => {
    const pane = historyRef.current
    if (!pane) return undefined // 팬클럽 화면에서는 연표가 없다
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
  }, [isDesktop, view])

  // 시대가 바뀌면 오른쪽 패널을 맨 위로, 상단 띠는 해당 칩이 보이게
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    // 띠 안에서만 가로로 움직인다 (scrollIntoView는 바깥 페이지 스크롤까지 건드릴 수 있음)
    const strip = stripRef.current
    const chip = strip?.querySelector(`[data-chip="${activeEra}"]`)
    if (strip && chip) {
      const left = chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2
      strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
    }
  }, [activeEra])

  const jumpTo = useCallback((id) => {
    document.getElementById(`era-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const era = eraById[activeEra]

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <svg className="brand-mark" width="44" height="44" viewBox="0 0 44 44" aria-hidden>
            <circle cx="22" cy="22" r="21" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M18 30V13l12-3v16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="15" cy="30" r="3.4" fill="currentColor" />
            <circle cx="27" cy="26" r="3.4" fill="currentColor" />
          </svg>
          <div>
            <p className="brand-name">myClassicRoom</p>
            <p className="brand-sub">나의 클래식 음악실 · 성가에서 영화음악까지</p>
          </div>
        </div>
        <div className="top-actions">
          <button
            type="button"
            className="btn gilt"
            onClick={() =>
              playQueue(
                tracks.map((t) => t.id),
                0,
                '클래식 한 바퀴',
              )
            }
            title="중세부터 현재까지 모든 곡을 시대·연도 순서대로"
          >
            ▶ 한 바퀴 듣기 <small>{fmt(tracks.length)}곡</small>
          </button>
          <button
            type="button"
            className="btn on-velvet"
            onClick={() =>
              playQueue(
                allIntro().map((t) => t.id),
                0,
                '추천곡 한 바퀴',
              )
            }
            title="시대별 추천곡만 시대·연도 순서대로"
          >
            <span className="star" aria-hidden>
              ★
            </span>{' '}
            추천곡만 <small>{fmt(allIntro().length)}곡</small>
          </button>
          <button type="button" className="btn on-velvet" onClick={() => setDrawer(true)}>
            내 음악실 {favorites.length > 0 && <small>♥ {fmt(favorites.length)}</small>}
          </button>
        </div>
        <nav className="view-tabs" aria-label="화면 전환">
          <button
            type="button"
            className={view === 'timeline' ? 'on' : ''}
            aria-pressed={view === 'timeline'}
            onClick={() => changeView('timeline')}
          >
            클래식 연표
          </button>
          <button
            type="button"
            className={view === 'fan' ? 'on' : ''}
            aria-pressed={view === 'fan'}
            onClick={() => changeView('fan')}
          >
            ♥ 팬클럽
          </button>
        </nav>
        {view === 'timeline' && (
          <nav className="era-strip" ref={stripRef} aria-label="시대 바로가기">
            {eras.map((e) => (
              <button
                key={e.id}
                data-chip={e.id}
                type="button"
                className={e.id === activeEra ? 'on' : ''}
                onClick={() => jumpTo(e.id)}
              >
                <span>{String(e.id).padStart(2, '0')}</span> {e.name}
              </button>
            ))}
          </nav>
        )}
      </header>

      {view === 'fan' ? (
        <main className="fan-page">
          <FanClub />
        </main>
      ) : (
        <main className="layout">
          <HistoryPane ref={historyRef} activeEra={activeEra} isDesktop={isDesktop} onPick={jumpTo} />
          {isDesktop && (
            <aside className="panel" ref={panelRef} aria-live="polite">
              <EraTracks key={era.id} era={era} />
            </aside>
          )}
        </main>
      )}

      <PlayerBar />
      <LibraryDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  )
}
