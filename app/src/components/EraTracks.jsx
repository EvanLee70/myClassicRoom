import { usePlayer } from '../player/usePlayer.js'
import {
  composersOfEra,
  fmt,
  introOfEra,
  performersOfEra,
  tracksOfComposer,
  tracksOfEra,
  tracksOfPerformer,
} from '../data/catalog.js'
import TrackCard from './TrackCard.jsx'

// 오른쪽(모바일은 시대 이야기 아래): 그 시대의 명곡을 작곡 연도 순으로
export default function EraTracks({ era, compact = false }) {
  const { playQueue } = usePlayer()
  const list = tracksOfEra(era.id) // 이미 연도 순
  const ids = list.map((t) => t.id)
  const intro = introOfEra(era.id)

  return (
    <div className={`era-tracks ${compact ? 'compact' : ''}`}>
      {!compact && (
        <header className="panel-head">
          <p className="panel-kicker">
            {String(era.id).padStart(2, '0')} · {era.years.replace('~', ' – ')}
          </p>
          <h2>{era.name}의 명곡</h2>
          <p className="panel-tagline">{era.tagline}</p>
        </header>
      )}

      <div className="queue-buttons">
        <button type="button" className="btn outline" onClick={() => playQueue(ids, 0, `${era.name} 전체`)}>
          ▶ 시대 전체 듣기 <small>{fmt(list.length)}곡</small>
        </button>
        <button type="button" className="btn" onClick={() => playQueue(intro.map((t) => t.id), 0, `${era.name} 추천`)}>
          <span className="star" aria-hidden>★</span> 추천 {fmt(intro.length)}곡
        </button>
      </div>

      <div className="chips-block">
        <span className="chips-label">작곡가</span>
        <div className="chips">
          {composersOfEra(era.id).map((c) => {
            const all = tracksOfComposer(c)
            return (
              <button
                type="button"
                key={c}
                className="chip"
                onClick={() => playQueue(all.map((t) => t.id), 0, `작곡가 · ${c}`)}
                title={`${c}의 곡 ${fmt(all.length)}곡 이어 듣기`}
              >
                {c} <small>{fmt(all.length)}</small>
              </button>
            )
          })}
        </div>
      </div>

      <div className="chips-block">
        <span className="chips-label">연주자</span>
        <div className="chips">
          {performersOfEra(era.id).map((p) => {
            const all = tracksOfPerformer(p)
            return (
              <button
                type="button"
                key={p}
                className="chip chip-performer"
                onClick={() => playQueue(all.map((t) => t.id), 0, `연주자 · ${p}`)}
                title={`${p}의 연주 ${fmt(all.length)}곡 이어 듣기`}
              >
                {p} <small>{fmt(all.length)}</small>
              </button>
            )
          })}
        </div>
      </div>

      <ol className="track-list" aria-label={`${era.name} 명곡, 작곡 연도 순`}>
        {list.map((t, i) => (
          <TrackCard
            key={t.id}
            track={t}
            dimYear={i > 0 && list[i - 1].workYear === t.workYear}
            contextIds={ids}
            contextName={`${era.name} 전체`}
          />
        ))}
      </ol>
      <p className="list-note">연도는 작곡 또는 초연 연도입니다. 별표는 추천곡입니다.</p>
    </div>
  )
}
