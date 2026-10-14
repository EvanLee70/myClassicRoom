import { forwardRef } from 'react'
import { composersOfEra, eraRange, eras, fmt, tracks, tracksOfEra } from '../data/catalog.js'
import EraTracks from './EraTracks.jsx'

// 왼쪽: 위아래를 잇는 선 하나에 12개 시대를 연도와 함께 건다
const HistoryPane = forwardRef(function HistoryPane({ activeEra, isDesktop, onPick }, ref) {
  return (
    <section className="history" ref={ref} aria-label="클래식의 역사 연표">
      <div className="hero">
        <p className="hero-kicker">A THOUSAND YEARS OF MUSIC</p>
        <h1>클래식 1,000년의 연표</h1>
        <p className="hero-text">
          수도원의 성가에서 영화관의 오케스트라까지, {fmt(eras.length)}개의 시대와 {fmt(tracks.length)}곡의 명곡을
          순서대로 걸어 봅니다. 아래로 내려가며 시대 이야기를 읽으면
          {isDesktop ? ' 오른쪽에 그 시대의 명곡이 작곡된 해 순서로' : ' 이야기 바로 아래에 그 시대의 명곡이 작곡된 해 순서로'}{' '}
          펼쳐집니다.
        </p>
        <p className="hero-hint">
          <span className="star" aria-hidden>★</span> 별표는 처음 듣는 분께 추천하는 곡입니다.
        </p>
      </div>

      <ol className="timeline">
        {eras.map((era) => {
          const { from, to } = eraRange(era)
          const on = activeEra === era.id
          return (
            <li key={era.id} id={`era-${era.id}`} data-era={era.id} className={`era ${on ? 'is-active' : ''}`}>
              <div className="era-years" aria-hidden>
                <span className="era-from">{from}</span>
                {to && <span className="era-to">— {to}</span>}
              </div>
              <div className="era-node" aria-hidden>
                <span className="era-dot" />
              </div>
              <div className="era-content">
                <p className="era-head">
                  <span className="era-no">{String(era.id).padStart(2, '0')}</span>
                  <button type="button" className="era-name" onClick={() => onPick(era.id)}>
                    {era.name}
                  </button>
                  <span className="era-count">{fmt(tracksOfEra(era.id).length)}곡</span>
                  <span className="sr-only">
                    {era.years}
                  </span>
                </p>
                <p className="era-tagline">{era.tagline}</p>
                <p className="era-summary">{era.summary}</p>
                <ul className="era-points">
                  {era.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <dl className="era-facts">
                  <div>
                    <dt>주요 음악가</dt>
                    <dd>{composersOfEra(era.id).join(', ')}</dd>
                  </div>
                  <div>
                    <dt>시대 배경</dt>
                    <dd>{era.context}</dd>
                  </div>
                </dl>
              </div>
              {/* 모바일: 곡 목록은 연표 들여쓰기 밖으로 꺼내 화면 폭 전체를 쓴다 */}
              {!isDesktop && (
                <div className="era-tracks-wrap">
                  <EraTracks era={era} compact />
                </div>
              )}
            </li>
          )
        })}
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
