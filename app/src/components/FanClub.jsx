import { useState } from 'react'
import { usePlayer } from '../player/usePlayer.js'
import { artists, fanTracks, fmt } from '../data/catalog.js'
import { usePhotoAlbum } from '../lib/usePhotoAlbum.js'
import FanPhotos from './FanPhotos.jsx'

// 오늘 날짜(로컬) 'YYYY-MM-DD'
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function dday(date) {
  const a = new Date(`${todayStr()}T00:00:00`)
  const b = new Date(`${date}T00:00:00`)
  const n = Math.round((b - a) / 86400000)
  return n === 0 ? 'D-DAY' : `D-${fmt(n)}`
}
const WEEK = ['일', '월', '화', '수', '목', '금', '토']
function dateLabel(date) {
  const d = new Date(`${date}T00:00:00`)
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${WEEK[d.getDay()]})`
}
function readMemo(key) {
  try {
    return localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

const SECTIONS = [
  ['intro', '소개'],
  ['photos', '사진첩'],
  ['timeline', '연표'],
  ['listen', '연주 듣기'],
  ['concerts', '공연 일정'],
  ['albums', '음반'],
  ['know', '알아두면 좋은 것'],
  ['mine', '나의 팬 기록'],
  ['sources', '출처'],
]

export default function FanClub() {
  const [artistKey, setArtistKey] = useState(() => {
    try {
      const k = localStorage.getItem('mcr.fan.current')
      return artists.some((a) => a.key === k) ? k : artists[0].key
    } catch {
      return artists[0].key
    }
  })
  const pick = (k) => {
    setArtistKey(k)
    try {
      localStorage.setItem('mcr.fan.current', k)
    } catch {
      /* 무시 */
    }
  }
  const artist = artists.find((a) => a.key === artistKey)
  return (
    <div className="fan">
      {/* 팬클럽 음악가 고르기 (여러 명 구조) */}
      <nav className="fan-artists" aria-label="팬클럽 음악가">
        <span className="fan-artists-label">나의 팬클럽</span>
        {artists.map((a) => (
          <button
            type="button"
            key={a.key}
            className={`fan-artist ${a.key === artistKey ? 'on' : ''}`}
            aria-pressed={a.key === artistKey}
            onClick={() => pick(a.key)}
          >
            <b>{a.profile.nameKo}</b>
            <span>{a.role}</span>
          </button>
        ))}
      </nav>
      <ArtistPage key={artist.key} artist={artist} />
    </div>
  )
}

function ArtistPage({ artist }) {
  const p = artist.profile
  const { playQueue, playTrack, current, playing, togglePlay, favorites, toggleFavorite, listenLog } = usePlayer()

  const myTracks = fanTracks.filter((t) => t.artist === artist.key)
  const album = usePhotoAlbum(artist, myTracks)
  const cover = album.cover
  const performances = myTracks.filter((t) => t.type !== 'interview')
  const today = todayStr()
  const upcoming = artist.concerts.filter((c) => c.date >= today)
  const past = artist.concerts.filter((c) => c.date < today).reverse()
  const next = upcoming[0]

  const memoKey = `mcr.fan.${artist.key}.memo`
  const myFav = myTracks.filter((t) => favorites.includes(t.id))
  const listened = myTracks
    .filter((t) => listenLog[t.id])
    .sort((a, b) => (listenLog[b.id].last > listenLog[a.id].last ? 1 : -1))
  const totalPlays = myTracks.reduce((n, t) => n + (listenLog[t.id]?.count || 0), 0)

  const jump = (id) => document.getElementById(`fan-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      {/* 리사이틀 포스터 */}
      <header className="poster">
        <div className={`poster-deco ${artist.deco || 'piano'}`} aria-hidden />
        <div className="poster-inner">
          {cover && (
            <figure className="poster-photo">
              <button type="button" onClick={() => jump('photos')} aria-label="사진첩 열기">
                <img src={cover.src} alt={`${p.nameKo} 대표 사진: ${cover.caption}`} />
              </button>
              <figcaption>
                {cover.kind === 'commons'
                  ? `사진 ${cover.credit} · ${cover.license}`
                  : cover.kind === 'still'
                    ? `영상 화면 · ${cover.credit}`
                    : '내가 올린 사진'}
              </figcaption>
            </figure>
          )}
          <div className="poster-main">
            <p className="poster-kicker">
              {artist.role} · {p.born?.date?.slice(0, 4)} · {p.born?.place}
            </p>
            <h1 className="poster-name">{p.nameKo}</h1>
            <p className="poster-en">{p.nameEn}</p>
            <p className="poster-line">{p.oneLine}</p>
            <div className="poster-actions">
              <button
                type="button"
                className="btn velvet"
                onClick={() =>
                  playQueue(
                    performances.map((t) => t.id),
                    0,
                    `${p.nameKo} 연주`,
                  )
                }
              >
                ▶ 대표 연주 이어 듣기 <small>{fmt(performances.length)}곡</small>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  playQueue(
                    myTracks.map((t) => t.id),
                    0,
                    `${p.nameKo} 전체`,
                  )
                }
              >
                인터뷰까지 전체 <small>{fmt(myTracks.length)}개</small>
              </button>
            </div>
          </div>
          {next && (
            <aside className="poster-next" aria-label="다음 공연">
              <p className="poster-next-label">다음 공연</p>
              <p className="poster-dday">{dday(next.date)}</p>
              <p className="poster-next-date">{dateLabel(next.date)}</p>
              <p className="poster-next-title">{next.title}</p>
              <p className="poster-next-venue">
                {next.city} · {next.venue}
              </p>
              {next.url && (
                <a href={next.url} target="_blank" rel="noreferrer">
                  공연 안내 보기 ↗
                </a>
              )}
            </aside>
          )}
          {!next && (
            <aside className="poster-next empty" aria-label="다음 공연">
              <p className="poster-next-label">다음 공연</p>
              <p className="poster-next-title">공개된 예정 공연이 아직 없습니다</p>
              <p className="poster-next-venue">새 일정은 공식 채널에서 먼저 발표됩니다.</p>
              {p.official[0] && (
                <a href={p.official[0].url} target="_blank" rel="noreferrer">
                  {p.official[0].label} ↗
                </a>
              )}
            </aside>
          )}
        </div>
        <dl className="poster-stats">
          <div>
            <dt>수상</dt>
            <dd>{fmt(p.awards.length)}</dd>
          </div>
          <div>
            <dt>음반</dt>
            <dd>{fmt(artist.albums.length)}</dd>
          </div>
          <div>
            <dt>남은 공연</dt>
            <dd>{fmt(upcoming.length)}</dd>
          </div>
          <div>
            <dt>내가 들은 횟수</dt>
            <dd>{fmt(totalPlays)}</dd>
          </div>
        </dl>
      </header>

      <nav className="fan-sections" aria-label="팬클럽 목차">
        {SECTIONS.map(([id, name]) => (
          <button type="button" key={id} onClick={() => jump(id)}>
            {name}
          </button>
        ))}
      </nav>

      {/* 소개 */}
      <section id="fan-intro" className="fan-sec">
        <h2>소개</h2>
        <p className="fan-bio">{p.bio}</p>
        <div className="fan-grid2">
          <div className="fan-card">
            <h3>기본 정보</h3>
            <dl className="fan-dl">
              <div>
                <dt>이름</dt>
                <dd>
                  {p.nameKo} ({p.nameEn})
                </dd>
              </div>
              <div>
                <dt>출생</dt>
                <dd>
                  {p.born?.date} · {p.born?.place}
                </dd>
              </div>
              <div>
                <dt>악기</dt>
                <dd>{p.instrument}</dd>
              </div>
              <div>
                <dt>매니지먼트</dt>
                <dd>{p.management?.name}</dd>
              </div>
            </dl>
          </div>
          <div className="fan-card">
            <h3>학력과 스승</h3>
            <ul className="fan-list">
              {p.education.map((e, i) => (
                <li key={i}>
                  <span className="when">{e.period}</span> {e.school}
                  {e.teacher && <span className="muted"> · {e.teacher}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="fan-card">
          <h3>공식 채널</h3>
          <ul className="fan-links">
            {p.official.map((o) => (
              <li key={o.url}>
                <a href={o.url} target="_blank" rel="noreferrer">
                  {o.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 연표 */}
      {/* 사진첩 */}
      <section id="fan-photos" className="fan-sec">
        <h2>
          사진첩 <small>{fmt(album.all.length)}장 · 사진을 눌러 크게 보고 대표 사진을 고르세요</small>
        </h2>
        <FanPhotos
          album={album}
          artist={artist}
          onPlayTrack={(id) =>
            playTrack(
              id,
              myTracks.map((x) => x.id),
              `${p.nameKo} 전체`,
            )
          }
        />
      </section>

      <section id="fan-timeline" className="fan-sec">
        <h2>연표</h2>
        <ol className="fan-timeline">
          {p.timeline.map((t, i) => (
            <li key={i}>
              <span className="fan-year">{t.year}</span>
              <span className="fan-dot" aria-hidden />
              <span className="fan-event">{t.event}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 연주 듣기 */}
      <section id="fan-listen" className="fan-sec">
        <h2>연주 듣기</h2>
        <div className="fan-videos">
          {myTracks.map((t) => {
            const isCur = current?.id === t.id
            const fav = favorites.includes(t.id)
            const log = listenLog[t.id]
            return (
              <article key={t.id} className={`fan-video ${isCur ? 'is-current' : ''}`}>
                <div className="fan-video-top">
                  <span className="fan-tag">{t.type === 'interview' ? '인터뷰' : t.composer}</span>
                  {t.workYear && <span className="muted small">{t.workYear}</span>}
                </div>
                <h3>{t.title}</h3>
                {t.performer !== p.nameKo && <p className="muted small">{t.performer}</p>}
                <p className="fan-video-desc">{t.desc}</p>
                <p className="muted small">출처 채널 · {t.ytChannel}</p>
                <div className="fan-video-actions">
                  <button
                    type="button"
                    className="track-play"
                    onClick={() =>
                      isCur
                        ? togglePlay()
                        : playTrack(
                            t.id,
                            myTracks.map((x) => x.id),
                            `${p.nameKo} 전체`,
                          )
                    }
                    aria-label={isCur && playing ? `${t.title} 일시정지` : `${t.title} 재생`}
                  >
                    {isCur && playing ? '❚❚' : '▶'}
                  </button>
                  <button
                    type="button"
                    className={`track-fav ${fav ? 'on' : ''}`}
                    onClick={() => toggleFavorite(t.id)}
                    aria-label={fav ? '좋아하는 곡 해제' : '좋아하는 곡으로 표시'}
                  >
                    {fav ? '♥' : '♡'}
                  </button>
                  <span className="muted small">
                    {log ? `${fmt(log.count)}번 들음 · 마지막 ${log.last}` : '아직 안 들음'}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* 공연 일정 */}
      <section id="fan-concerts" className="fan-sec">
        <h2>
          공연 일정 <small>남은 공연 {fmt(upcoming.length)}회</small>
        </h2>
        {upcoming.length === 0 && (
          <p className="fan-empty">공개된 예정 공연이 없습니다. 지난 공연 기록은 아래에서 볼 수 있습니다.</p>
        )}
        <ol className="fan-concerts">
          {upcoming.map((c, i) => (
            <li key={i} className="fan-concert">
              <div className="fan-concert-date">
                <b>{dday(c.date)}</b>
                <span>{dateLabel(c.date)}</span>
              </div>
              <div>
                <h3>{c.title}</h3>
                <p className="muted">
                  {c.city} · {c.venue}
                </p>
                {c.with && <p className="small">함께: {c.with}</p>}
                {c.program && <p className="small">프로그램: {c.program}</p>}
                {c.url && (
                  <a className="small" href={c.url} target="_blank" rel="noreferrer">
                    안내 ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
        <details className="fan-past">
          <summary>지난 공연 {fmt(past.length)}회 보기</summary>
          <ol className="fan-concerts">
            {past.map((c, i) => (
              <li key={i} className="fan-concert past">
                <div className="fan-concert-date">
                  <span>{dateLabel(c.date)}</span>
                </div>
                <div>
                  <h3>{c.title}</h3>
                  <p className="muted">
                    {c.city} · {c.venue}
                  </p>
                  {c.program && <p className="small">프로그램: {c.program}</p>}
                </div>
              </li>
            ))}
          </ol>
        </details>
      </section>

      {/* 음반 */}
      <section id="fan-albums" className="fan-sec">
        <h2>
          음반 <small>{fmt(artist.albums.length)}장</small>
        </h2>
        <ol className="fan-albums">
          {artist.albums.map((a, i) => (
            <li key={i}>
              <span className="fan-year">{a.year}</span>
              <div>
                <h3>{a.title}</h3>
                <p className="muted small">{a.label}</p>
                {a.repertoire && <p className="small">{a.repertoire}</p>}
                {a.note && <p className="small muted">{a.note}</p>}
                {a.url && (
                  <a className="small" href={a.url} target="_blank" rel="noreferrer">
                    음반 정보 ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 알아두면 좋은 것 */}
      <section id="fan-know" className="fan-sec">
        <h2>팬이라면 알아두면 좋은 것</h2>
        <ul className="fan-facts">
          {p.facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <div className="fan-grid2">
          {p.awards.length > 0 && (
            <div className="fan-card">
              <h3>수상</h3>
              <ul className="fan-list">
                {p.awards.map((a, i) => (
                  <li key={i}>
                    <span className="when">{a.year}</span> {a.title}
                    {a.result && <b className="result"> {a.result}</b>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {p.roles.length > 0 && (
            <div className="fan-card">
              <h3>맡았던 역할</h3>
              <ul className="fan-list">
                {p.roles.map((r, i) => (
                  <li key={i}>
                    <span className="when">{r.period}</span> {r.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {p.books.length + p.writing.length > 0 && (
            <div className="fan-card">
              <h3>글쓰기</h3>
              <ul className="fan-list">
                {p.books.map((b, i) => (
                  <li key={`b${i}`}>
                    <span className="when">{b.year}</span> 『{b.title}』 <span className="muted">{b.publisher}</span>
                    {b.note && <span className="muted small"> · {b.note}</span>}
                  </li>
                ))}
                {p.writing.map((w, i) => (
                  <li key={`w${i}`}>
                    <span className="when">{w.period}</span> {w.where}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {p.media.length > 0 && (
            <div className="fan-card">
              <h3>방송·협업</h3>
              <ul className="fan-list">
                {p.media.map((m, i) => (
                  <li key={i}>
                    <span className="when">{m.year}</span> {m.title} <span className="muted small">{m.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {p.repertoire.length > 0 && (
            <div className="fan-card">
              <h3>자주 연주하는 작곡가</h3>
              <p className="fan-tags">
                {p.repertoire.map((r) => (
                  <span key={r} className="fan-tag">
                    {r}
                  </span>
                ))}
              </p>
            </div>
          )}
          {p.collaborators.length > 0 && (
            <div className="fan-card">
              <h3>함께한 음악가·악단</h3>
              <ul className="fan-list">
                {p.collaborators.map((c, i) => (
                  <li key={i}>
                    <b>{c.name}</b> {c.note && <span className="muted small">· {c.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 나의 팬 기록 */}
      <section id="fan-mine" className="fan-sec">
        <h2>나의 팬 기록</h2>
        <div className="fan-grid2">
          <div className="fan-card">
            <h3>좋아하는 곡 ♥ {fmt(myFav.length)}</h3>
            {myFav.length ? (
              <>
                <button
                  type="button"
                  className="btn velvet small"
                  onClick={() =>
                    playQueue(
                      myFav.map((t) => t.id),
                      0,
                      `내가 좋아하는 ${p.nameKo}`,
                    )
                  }
                >
                  ▶ 좋아하는 곡만 듣기
                </button>
                <ul className="fan-list">
                  {myFav.map((t) => (
                    <li key={t.id}>
                      {t.title} <span className="muted small">{t.composer}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="muted small">연주 카드의 ♡를 누르면 여기에 모입니다.</p>
            )}
          </div>
          <div className="fan-card">
            <h3>들은 날</h3>
            {listened.length ? (
              <ul className="fan-list">
                {listened.map((t) => (
                  <li key={t.id}>
                    <span className="when">{listenLog[t.id].last}</span> {t.title}{' '}
                    <span className="muted small">{fmt(listenLog[t.id].count)}번</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">연주를 들으면 날짜와 횟수가 자동으로 기록됩니다.</p>
            )}
          </div>
        </div>
        <div className="fan-card">
          <label htmlFor="fan-memo">
            <h3>팬 메모</h3>
          </label>
          <FanMemo key={memoKey} memoKey={memoKey} />
          <p className="muted small">팬 기록과 메모는 지금 쓰는 브라우저에만 저장됩니다.</p>
        </div>
      </section>

      {/* 출처 */}
      <section id="fan-sources" className="fan-sec">
        <h2>
          출처 <small>{fmt(artist.sources.length)}곳</small>
        </h2>
        <p className="muted small">
          모든 내용은 공개된 자료를 바탕으로 정리했습니다. "확인 필요"라고 적힌 항목은 출처끼리 엇갈리거나 공식 확인이
          안 된 것입니다. 공연 일정은 바뀔 수 있으니 예매 전에 공식 안내를 꼭 확인하세요.
        </p>
        <ol className="fan-sources">
          {artist.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

// 팬 메모: 음악가가 바뀌면 key가 바뀌어 새로 읽는다
function FanMemo({ memoKey }) {
  const [memo, setMemo] = useState(() => readMemo(memoKey))
  const save = (v) => {
    setMemo(v)
    try {
      localStorage.setItem(memoKey, v)
    } catch {
      /* 저장 불가 환경은 무시 */
    }
  }
  return (
    <textarea
      id="fan-memo"
      className="fan-memo"
      rows={4}
      placeholder="공연을 본 날, 좋았던 연주, 다음에 가고 싶은 공연을 적어 두세요."
      value={memo}
      onChange={(e) => save(e.target.value)}
    />
  )
}
