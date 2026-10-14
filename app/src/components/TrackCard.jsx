import { usePlayer } from '../player/PlayerContext.jsx'

export default function TrackCard({ track, contextIds, contextName, no }) {
  const { current, playing, playTrack, favorites, toggleFavorite } = usePlayer()
  const isCurrent = current?.id === track.id
  const fav = favorites.includes(track.id)

  return (
    <article className={`track ${isCurrent ? 'is-current' : ''}`}>
      <button
        className="track-play"
        onClick={() => playTrack(track.id, contextIds, contextName)}
        aria-label={`${track.title} 재생`}
      >
        {isCurrent && playing ? <span className="eq" aria-hidden><i /><i /><i /></span> : '▶'}
      </button>
      <div className="track-body">
        <div className="track-top">
          {no != null && <span className="track-no">{String(no).padStart(2, '0')}</span>}
          {track.intro && <span className="badge-intro" title="처음 듣는 분께 추천하는 입문곡">⭐ 입문</span>}
          {!track.youtubeId && <span className="badge-warn" title="영상 준비 중 · 유튜브 검색으로 연결됩니다">영상 준비 중</span>}
        </div>
        <h4 className="track-title">
          {track.title}
          {track.section && <span className="track-section"> · {track.section}</span>}
        </h4>
        <p className="track-meta">
          <b>{track.composer}</b>
          {track.composerYears && <span> ({track.composerYears})</span>}
          {track.workYear && <span> · {track.workYear}</span>}
        </p>
        <p className="track-performer">🎻 {track.performer}</p>
        <p className="track-desc">{track.desc}</p>
      </div>
      <button
        className={`track-fav ${fav ? 'on' : ''}`}
        onClick={() => toggleFavorite(track.id)}
        aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        title={fav ? '즐겨찾기 해제' : '즐겨찾기'}
      >
        {fav ? '♥' : '♡'}
      </button>
    </article>
  )
}
