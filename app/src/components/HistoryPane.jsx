import { forwardRef } from 'react'
import { eras, fmt, tracks } from '../data/catalog.js'
import EraTracks from './EraTracks.jsx'

const HistoryPane = forwardRef(function HistoryPane({ activeEra, isDesktop }, ref) {
  return (
    <section className="history" ref={ref} aria-label="클래식의 역사">
      <div className="hero">
        <p className="hero-kicker">From Chant to Cinema</p>
        <h1>
          클래식 <em>1,000년</em>의 여행
        </h1>
        <p className="hero-text">
          수도원의 성가에서 영화관의 오케스트라까지, {fmt(eras.length)}개의 시대와 {fmt(tracks.length)}곡의 명곡을
          순서대로 걸어 봅니다. 아래로 내려가며 시대 이야기를 읽으면
          {isDesktop ? ' 오른쪽에 그 시대의 명곡이' : ' 이야기 바로 아래에 그 시대의 명곡이'} 펼쳐집니다.
        </p>
        <p className="hero-hint">⭐ 표시는 처음 듣는 분께 추천하는 입문곡입니다.</p>
      </div>

      <ol className="timeline">
        {eras.map((era) => (
          <li
            key={era.id}
            id={`era-${era.id}`}
            data-era={era.id}
            className={`era ${activeEra === era.id ? 'is-active' : ''}`}
            style={{ '--accent': era.accent }}
          >
            <div className="era-rail" aria-hidden>
              <span className="era-dot" />
            </div>
            <div className="era-content">
              <p className="era-years">
                <span className="era-no">{String(era.id).padStart(2, '0')}</span> {era.years}
              </p>
              <h2 className="era-name">{era.name}</h2>
              <p className="era-tagline">{era.tagline}</p>
              <p className="era-summary">{era.summary}</p>
              <ul className="era-points">
                {era.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="era-context">
                <span>시대 배경</span> {era.context}
              </p>
              {!isDesktop && <EraTracks era={era} compact />}
            </div>
          </li>
        ))}
      </ol>
      <footer className="history-end">
        <p>여기까지가 지금의 클래식입니다. 이 역사는 오늘도 계속 쓰이고 있습니다.</p>
        <p className="small">
          영상은 유튜브 임베드로 재생되며 저작권은 각 채널에 있습니다. 재생이 막힌 곡은 무료 녹음(Musopen,
          Internet Archive)이나 유튜브 검색으로 연결됩니다.
        </p>
      </footer>
    </section>
  )
})

export default HistoryPane
