// 팬클럽 사진첩: 공개 사진(Commons) + 연주 장면(유튜브 썸네일) + 내 사진(IndexedDB) + 대표 사진
import { useCallback, useEffect, useState } from 'react'
import { fetchCommonsPhotos } from './commons.js'
import { addPhoto, deletePhoto, listPhotos } from './photoStore.js'

const MAX_MB = 15

export function usePhotoAlbum(artist, tracks) {
  const [commons, setCommons] = useState({ status: 'loading', items: [] })
  const [mine, setMine] = useState([])
  const coverKey = `mcr.fan.${artist.key}.cover`
  const [cover, setCoverState] = useState(() => {
    try {
      return localStorage.getItem(coverKey) || ''
    } catch {
      return ''
    }
  })

  // 공개 사진
  useEffect(() => {
    let alive = true
    const ps = artist.photoSearch || {}
    fetchCommonsPhotos(artist.key, ps.terms || [artist.profile.nameEn], ps.names || [artist.profile.nameEn], ps.wiki)
      .then((items) => alive && setCommons({ status: 'ok', items }))
      .catch(() => alive && setCommons({ status: 'error', items: [] }))
    return () => {
      alive = false
    }
  }, [artist])

  // 내 사진
  const reloadMine = useCallback(() => {
    listPhotos(artist.key)
      .then((rows) =>
        setMine((old) => {
          old.forEach((p) => URL.revokeObjectURL(p.src))
          return rows.map((r) => {
            const url = URL.createObjectURL(r.blob)
            return {
              id: r.id,
              kind: 'mine',
              src: url,
              full: url,
              caption: r.name,
              date: new Date(r.added).toISOString().slice(0, 10),
              credit: '내가 올린 사진',
            }
          })
        }),
      )
      .catch(() => setMine([]))
  }, [artist.key])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => reloadMine(), [reloadMine])

  const addMine = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'))
    const tooBig = list.filter((f) => f.size > MAX_MB * 1024 * 1024)
    for (const f of list) if (f.size <= MAX_MB * 1024 * 1024) await addPhoto(artist.key, f)
    reloadMine()
    return tooBig.length ? `${tooBig.length}장은 ${MAX_MB}MB가 넘어서 넣지 않았습니다.` : ''
  }
  const removeMine = async (id) => {
    await deletePhoto(id)
    reloadMine()
  }

  // 연주 장면: 검증된 유튜브 영상의 대표 화면
  const stills = tracks.map((t) => ({
    id: `yt:${t.youtubeId}`,
    kind: 'still',
    src: `https://i.ytimg.com/vi/${t.youtubeId}/hqdefault.jpg`,
    full: `https://i.ytimg.com/vi/${t.youtubeId}/hqdefault.jpg`,
    caption: t.title,
    credit: t.ytChannel,
    trackId: t.id,
  }))

  const all = [...commons.items, ...stills, ...mine]
  const setCover = (id) => {
    setCoverState(id)
    try {
      localStorage.setItem(coverKey, id)
    } catch {
      /* 무시 */
    }
  }
  // 지정한 대표 사진이 없거나 사라졌으면: 공개 사진 → 연주 장면 순으로 첫 장
  const coverPhoto = all.find((p) => p.id === cover) || commons.items[0] || stills[0] || null

  return { commons, stills, mine, all, cover: coverPhoto, setCover, addMine, removeMine }
}
