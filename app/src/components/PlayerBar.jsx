import { useEffect, useRef, useState } from 'react'
import { usePlayer } from '../player/usePlayer.js'
import { eraById, fmt, searchUrl, trackById } from '../data/catalog.js'

const FAIL_TEXT = {
  video: '이 곡의 영상은 지금 재생할 수 없습니다.',
  blocked: '유튜브에 연결할 수 없어 재생하지 못했습니다.',
  audio: '대체 녹음도 재생하지 못했습니다.',
}

export default function PlayerBar() {
  const p = usePlayer()
  const { current, mode, playing, queue, index, label, countdown } = p
  const hostRef = useRef(null)
  const [big, setBig] = useState(false)
  const [showQueue, setShowQueue] = useState(false)

  useEffect(() => {
    p.mountYouTube(hostRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const era = current ? eraById[current.era] : null
  const fav = current && p.favorites.includes(current.id)

  return (
    <>
      {/* 영상 창: 유튜브 정책상 최소 200×200 이상으로 항상 보이게 둔다 */}
      <div
        className={`video-box ${current && mode === 'youtube' ? 'show' : ''} ${big ? 'big' : ''}`}
        aria-hidden={!(current && mode === 'youtube')}
      >
        <div className="video-host" ref={hostRef} />
        <button className="video-size" onClick={() => setBig((b) => !b)}>
          {big ? '작게' : '크게'}
        </button>
      </div>

      {current && mode === 'audio' && (
        <audio
          ref={p.audioRef}
          src={current.fallbackAudio}
          autoPlay
          onPlay={() => p.setPlaying(true)}
          onPause={() => p.setPlaying(false)}
          onEnded={p.next}
          onError={p.failAudio}
        />
      )}

      {current && mode === 'failed' && (
        <div className="fail-box" role="status">
          <p>
            <b>{FAIL_TEXT[p.failReason] || FAIL_TEXT.video}</b>
          </p>
          {p.failReason === 'blocked' && (
            <p className="fail-hint">광고 차단 프로그램이나 회사·공용 와이파이의 차단을 확인해 주세요.</p>
          )}
          <div className="fail-links">
            {current.fallbackUrl && (
              <a href={current.fallbackUrl} target="_blank" rel="noreferrer">
                무료 녹음 페이지 열기 ↗
              </a>
            )}
            <a href={searchUrl(current)} target="_blank" rel="noreferrer">
              유튜브에서 찾아 듣기 ↗
            </a>
          </div>
          {countdown > 0 && (
            <p className="fail-count">
              {fmt(countdown)}초 후 다음 곡으로 넘어갑니다.{' '}
              <button className="link" onClick={p.cancelSkip}>
                멈추기
              </button>
            </p>
          )}
        </div>
      )}

      {showQueue && queue.length > 0 && (
        <div className="queue-pop" role="dialog" aria-label="대기열">
          <header>
            <b>{label || '대기열'}</b>
            <span>
              {fmt(index + 1)} / {fmt(queue.length)}
            </span>
            <button className="link" onClick={() => setShowQueue(false)}>
              닫기
            </button>
          </header>
          <ol>
            {queue.map((id, i) => {
              const t = trackById[id]
              return (
                <li key={`${id}-${i}`} className={i === index ? 'on' : ''}>
                  <button onClick={() => p.goTo(i)}>
                    <span className="q-no">{fmt(i + 1)}</span>
                    <span className="q-title">{t.title}</span>
                    <span className="q-comp">{t.composer}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      <footer className="player" style={{ '--accent': era?.accent || '#d4af37' }}>
        <div className="player-info">
          {current ? (
            <>
              <p className="player-label">
                {era && <span className="pill">{era.name}</span>}
                {label && <span className="player-queue-name">{label}</span>}
                {mode === 'audio' && <span className="pill alt">무료 녹음으로 재생 중</span>}
              </p>
              <p className="player-title">{current.title}</p>
              <p className="player-sub">
                {current.composer} · {current.performer}
              </p>
            </>
          ) : (
            <p className="player-empty">곡을 고르거나 "한 바퀴 듣기"를 눌러 시작하세요.</p>
          )}
        </div>
        <div className="player-ctrl">
          <button onClick={p.prev} disabled={index <= 0} aria-label="이전 곡">
            ⏮
          </button>
          <button
            className="play-main"
            onClick={p.togglePlay}
            disabled={!current || mode === 'failed'}
            aria-label={playing ? '일시정지' : '재생'}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          <button onClick={p.next} disabled={index < 0 || index >= queue.length - 1} aria-label="다음 곡">
            ⏭
          </button>
        </div>
        <div className="player-side">
          {current && (
            <button className={`icon ${fav ? 'on' : ''}`} onClick={() => p.toggleFavorite(current.id)} aria-label="즐겨찾기">
              {fav ? '♥' : '♡'}
            </button>
          )}
          <button className="btn small" onClick={() => setShowQueue((s) => !s)} disabled={!queue.length}>
            대기열 {queue.length > 0 && `${fmt(index + 1)}/${fmt(queue.length)}`}
          </button>
        </div>
      </footer>
    </>
  )
}
