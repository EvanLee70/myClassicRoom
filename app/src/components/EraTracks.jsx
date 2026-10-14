import { usePlayer } from '../player/PlayerContext.jsx'
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

export default function EraTracks({ era, compact = false }) {
  const { playQueue } = usePlayer()
  const list = tracksOfEra(era.id)
  const ids = list.map((t) => t.id)
  const intro = introOfEra(era.id)

  return (
    <div className={`era-tracks ${compact ? 'compact' : ''}`} style={{ '--accent': era.accent }}>
      {!compact && (
        <header className="panel-head">
          <span className="panel-kicker">
            {String(era.id).padStart(2, '0')} · {era.years}
          </span>
          <h2>{era.name}의 명곡</h2>
          <p className="panel-tagline">{era.tagline}</p>
        </header>
      )}

      <div className="queue-buttons">
        <button className="btn gold" onClick={() => playQueue(ids, 0, `${era.name} 전체`)}>
          ▶ 이 시대 전체 듣기 <small>{fmt(list.length)}곡</small>
        </button>
        <button className="btn" onClick={() => playQueue(intro.map((t) => t.id), 0, `${era.name} 입문`)}>
          ⭐ 입문 {fmt(intro.length)}곡
        </button>
      </div>

      <div className="chips-block">
        <span className="chips-label">작곡가</span>
        <div className="chips">
          {composersOfEra(era.id).map((c) => {
            const all = tracksOfComposer(c)
            return (
              <button
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

      <div className="track-list">
        {list.map((t, i) => (
          <TrackCard key={t.id} track={t} no={i + 1} contextIds={ids} contextName={`${era.name} 전체`} />
        ))}
      </div>
    </div>
  )
}
