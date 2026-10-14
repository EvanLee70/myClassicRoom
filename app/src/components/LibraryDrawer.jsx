import { useState } from 'react'
import { usePlayer } from '../player/PlayerContext.jsx'
import { eraById, fmt, trackById } from '../data/catalog.js'

export default function LibraryDrawer({ open, onClose }) {
  const { favorites, recent, playQueue, toggleFavorite, clearRecent } = usePlayer()
  const [tab, setTab] = useState('fav')
  const ids = tab === 'fav' ? favorites : recent
  const name = tab === 'fav' ? '즐겨찾기' : '최근 들은 곡'

  return (
    <>
      <div className={`drawer-dim ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="내 음악실">
        <header>
          <h3>내 음악실</h3>
          <button className="link" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="tabs">
          <button className={tab === 'fav' ? 'on' : ''} onClick={() => setTab('fav')}>
            ♥ 즐겨찾기 <small>{fmt(favorites.length)}</small>
          </button>
          <button className={tab === 'recent' ? 'on' : ''} onClick={() => setTab('recent')}>
            🕘 최근 들은 곡 <small>{fmt(recent.length)}</small>
          </button>
        </div>
        {ids.length > 0 ? (
          <>
            <div className="drawer-actions">
              <button className="btn gold" onClick={() => playQueue(ids, 0, name)}>
                ▶ {name} 모두 듣기
              </button>
              {tab === 'recent' && (
                <button className="link" onClick={clearRecent}>
                  기록 지우기
                </button>
              )}
            </div>
            <ol className="drawer-list">
              {ids.map((id, i) => {
                const t = trackById[id]
                return (
                  <li key={id}>
                    <button className="drawer-item" onClick={() => playQueue(ids, i, name)}>
                      <span className="pill" style={{ '--accent': eraById[t.era].accent }}>
                        {eraById[t.era].name}
                      </span>
                      <span className="d-title">{t.title}</span>
                      <span className="d-comp">
                        {t.composer} · {t.performer}
                      </span>
                    </button>
                    {tab === 'fav' && (
                      <button className="icon on" onClick={() => toggleFavorite(id)} aria-label="즐겨찾기 해제">
                        ♥
                      </button>
                    )}
                  </li>
                )
              })}
            </ol>
          </>
        ) : (
          <p className="drawer-empty">
            {tab === 'fav' ? '곡 카드의 ♡를 누르면 여기에 모입니다.' : '아직 들은 곡이 없습니다.'}
          </p>
        )}
        <p className="drawer-note">이 기록은 지금 쓰는 브라우저에만 저장됩니다.</p>
      </aside>
    </>
  )
}
