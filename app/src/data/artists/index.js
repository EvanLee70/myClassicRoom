// 팬클럽 음악가 목록 — 새 음악가는 JSON 하나를 만들고 아래 목록에 한 줄 추가하면 된다
import sonYeoleum from './son-yeoleum.json'

const artists = [
  {
    ...sonYeoleum,
    key: 'son-yeoleum',
    role: '피아니스트',
    country: '대한민국',
  },
]

// 팬 영상을 재생기가 쓰는 곡 형태로 바꾼다 (era 대신 artist)
export const fanTracks = artists.flatMap((a) =>
  a.videos.map((v) => ({
    id: v.id,
    era: null,
    artist: a.key,
    artistName: a.profile.nameKo,
    order: 0,
    title: v.type === 'interview' ? `인터뷰 · ${v.title}` : v.title,
    composer: v.composer || a.profile.nameKo,
    composerYears: null,
    workYear: v.year || '',
    performer: v.with ? `${a.profile.nameKo} / ${v.with}` : a.profile.nameKo,
    section: null,
    intro: false,
    desc: v.desc,
    youtubeId: v.youtubeId,
    ytTitle: v.ytTitle,
    ytChannel: v.ytChannel,
    type: v.type,
    fallbackUrl: null,
    fallbackAudio: null,
    searchQuery: `${a.profile.nameEn} ${v.ytTitle || v.title}`,
  })),
)

export default artists
