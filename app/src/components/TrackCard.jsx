import { usePlayer } from '../player/usePlayer.js'

// 오른쪽 한 줄: 연도 | 연도축 점 | 곡 정보 | 추천 별표 | 재생·즐겨찾기
export default function TrackCard({ track, contextIds, contextName, dimYear }) {
  const { current, playing, mode, playTrack, togglePlay, favorites, toggleFavorite } = usePlayer()
  const isCurrent = current?.id === track.id
  const fav = favorites.includes(track.id)
  // 지금 듣는 곡을 다시 누르면 처음부터 다시 틀지 않고 일시정지·재개
  const onPlay = () =>
    isCurrent && mode !== 'failed' ? togglePlay() : playTrack(track.id, contextIds, contextName)

  return (
    <li className={`track ${isCurrent ? 'is-current' : ''}`}>
      <span className={`track-year ${dimYear ? 'dim' : ''}`}>{track.workYear || '—'}</span>
      <span className="track-node" aria-hidden>
        <i />
      </span>
      <div className="track-body">
        <h4 className="track-title">
          {track.intro && (
            <span className="star star-inline" role="img" aria-label="추천">
              ★{' '}
            </span>
          )}
          {track.title}
          {track.section && <span className="track-section"> · {track.section}</span>}
        </h4>
        <p className="track-meta">
          <b>{track.composer}</b>
          {track.composerYears && <span> ({track.composerYears})</span>}
        </p>
        <p className="track-performer">
          <span className="label">연주</span> {track.performer}
          {!track.youtubeId && (
            <span className="badge-warn" title="영상 준비 중 · 유튜브 검색으로 연결됩니다">
              영상 준비 중
            </span>
          )}
        </p>
        <p className="track-desc">{track.desc}</p>
      </div>
      <span className="track-star">
        {track.intro && (
          <span className="star" role="img" aria-label="추천" title="처음 듣는 분께 추천하는 곡">
            ★
          </span>
        )}
      </span>
      <div className="track-actions">
        <button
          type="button"
          className="track-play"
          onClick={onPlay}
          aria-label={isCurrent && playing ? `${track.title} 일시정지` : `${track.title} 재생`}
        >
          {isCurrent && playing ? (
            <span className="eq" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M3 1.5l7.5 4.5L3 10.5z" fill="currentColor" />
            </svg>
          )}
        </button>
        <button
          type="button"
          className={`track-fav ${fav ? 'on' : ''}`}
          onClick={() => toggleFavorite(track.id)}
          aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          title={fav ? '즐겨찾기 해제' : '즐겨찾기'}
        >
          {fav ? '♥' : '♡'}
        </button>
      </div>
    </li>
  )
}
