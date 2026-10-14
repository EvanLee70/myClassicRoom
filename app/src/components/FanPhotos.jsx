import { useEffect, useRef, useState } from 'react'
import { fmt } from '../data/catalog.js'

// 사진첩: 묶음별 격자 + 크게 보기
export default function FanPhotos({ album, artist, onPlayTrack }) {
  const { commons, stills, mine, all, cover, setCover, addMine, removeMine } = album
  const [openId, setOpenId] = useState(null)
  const [notice, setNotice] = useState('')
  const fileRef = useRef(null)
  const idx = all.findIndex((p) => p.id === openId)
  const photo = idx >= 0 ? all[idx] : null

  const onFiles = async (e) => {
    const msg = await addMine(e.target.files)
    setNotice(msg || '사진을 넣었습니다.')
    e.target.value = ''
  }

  return (
    <div className="photos">
      <div className="photo-group">
        <h3>
          공개 사진 <small>자유 이용이 허락된 사진 · 위키미디어 공용</small>
        </h3>
        {commons.status === 'loading' && <p className="muted small">사진을 불러오는 중입니다…</p>}
        {commons.status === 'error' && (
          <p className="muted small">지금은 위키미디어 공용에 연결할 수 없습니다. 잠시 뒤 다시 열어 보세요.</p>
        )}
        {commons.status === 'ok' && commons.items.length === 0 && (
          <p className="muted small">자유 이용이 허락된 사진을 찾지 못했습니다.</p>
        )}
        {commons.items.length > 0 && <PhotoGrid items={commons.items} cover={cover} onOpen={setOpenId} />}
      </div>

      <div className="photo-group">
        <h3>
          연주 장면 <small>영상 {fmt(stills.length)}개의 대표 화면 · 누르면 크게 보고 바로 재생</small>
        </h3>
        <PhotoGrid items={stills} cover={cover} onOpen={setOpenId} />
      </div>

      <div className="photo-group">
        <h3>
          내 사진 <small>직접 찍은 공연 사진, 티켓, 사인 등 · 이 브라우저에만 저장</small>
        </h3>
        <div className="photo-upload">
          <button type="button" className="btn velvet" onClick={() => fileRef.current?.click()}>
            + 사진 넣기
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
          {notice && (
            <span className="muted small" role="status">
              {notice}
            </span>
          )}
        </div>
        {mine.length > 0 ? <PhotoGrid items={mine} cover={cover} onOpen={setOpenId} /> : <p className="muted small">아직 넣은 사진이 없습니다.</p>}
      </div>

      <div className="photo-group">
        <h3>공식 사진 더 보기</h3>
        <p className="muted small">공식 사진과 보도 사진은 저작권이 사진가·소속사에 있어 앱에 옮기지 않고 원래 자리로 연결합니다.</p>
        <ul className="fan-links">
          {artist.profile.official.map((o) => (
            <li key={o.url}>
              <a href={o.url} target="_blank" rel="noreferrer">
                {o.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>

      {photo && (
        <Lightbox
          photo={photo}
          isCover={cover?.id === photo.id}
          pos={`${fmt(idx + 1)} / ${fmt(all.length)}`}
          onClose={() => setOpenId(null)}
          onPrev={() => setOpenId(all[(idx - 1 + all.length) % all.length].id)}
          onNext={() => setOpenId(all[(idx + 1) % all.length].id)}
          onCover={() => setCover(photo.id)}
          onPlay={photo.trackId ? () => onPlayTrack(photo.trackId) : null}
          onDelete={
            photo.kind === 'mine'
              ? () => {
                  removeMine(photo.id)
                  setOpenId(null)
                }
              : null
          }
        />
      )}
    </div>
  )
}

function Lightbox({ photo, isCover, pos, onClose, onPrev, onNext, onCover, onPlay, onDelete }) {
  const closeRef = useRef(null)
  useEffect(() => closeRef.current?.focus(), [])
  // 사진 창이 열려 있는 동안만 키보드(Esc, ←, →)를 받는다
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={photo.caption}>
      <div className="lightbox-dim" onClick={onClose} />
      <figure className="lightbox-body">
        <img src={photo.full} alt={photo.caption} />
        <figcaption>
          <p className="lightbox-cap">{photo.caption}</p>
          <p className="muted small">
            {photo.date && `${photo.date} · `}
            {photo.kind === 'commons' ? (
              <>
                사진 {photo.credit} ·{' '}
                {photo.licenseUrl ? (
                  <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                    {photo.license}
                  </a>
                ) : (
                  photo.license
                )}{' '}
                ·{' '}
                <a href={photo.page} target="_blank" rel="noreferrer">
                  원본 ↗
                </a>
              </>
            ) : photo.kind === 'still' ? (
              `영상 화면 · ${photo.credit}`
            ) : (
              photo.credit
            )}
          </p>
          <div className="lightbox-actions">
            <button type="button" className="btn small" onClick={onPrev} aria-label="이전 사진">
              ‹ 이전
            </button>
            <span className="muted small">{pos}</span>
            <button type="button" className="btn small" onClick={onNext} aria-label="다음 사진">
              다음 ›
            </button>
            <button type="button" className={`btn small ${isCover ? 'velvet' : ''}`} onClick={onCover} disabled={isCover}>
              {isCover ? '대표 사진' : '대표 사진으로'}
            </button>
            {onPlay && (
              <button type="button" className="btn small velvet" onClick={onPlay}>
                ▶ 이 영상 재생
              </button>
            )}
            {onDelete && (
              <button type="button" className="btn small" onClick={onDelete}>
                사진 지우기
              </button>
            )}
            <button ref={closeRef} type="button" className="btn small" onClick={onClose}>
              닫기
            </button>
          </div>
        </figcaption>
      </figure>
    </div>
  )
}

function PhotoGrid({ items, cover, onOpen }) {
  return (
    <ul className="photo-grid">
      {items.map((p) => (
        <li key={p.id}>
          <button type="button" className="photo-thumb" onClick={() => onOpen(p.id)} aria-label={`${p.caption} 크게 보기`}>
            <img src={p.src} alt={p.caption} loading="lazy" />
            {cover?.id === p.id && <span className="photo-cover-badge">대표</span>}
            {p.kind === 'still' && (
              <span className="photo-play" aria-hidden>
                ▶
              </span>
            )}
          </button>
          <p className="photo-cap">{p.caption}</p>
        </li>
      ))}
    </ul>
  )
}
