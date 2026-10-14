// 내가 올린 사진을 브라우저 IndexedDB에 저장 (localStorage는 사진을 담기에 너무 작다)
const DB = 'mcr-photos'
const STORE = 'photos'

function open() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('이 브라우저는 사진 저장을 지원하지 않습니다'))
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => {
      const s = req.result.createObjectStore(STORE, { keyPath: 'id' })
      s.createIndex('artist', 'artist')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx(mode, fn) {
  return open().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const out = fn(t.objectStore(STORE))
        t.oncomplete = () => resolve(out?.result ?? out)
        t.onerror = () => reject(t.error)
      }),
  )
}

export const listPhotos = (artist) =>
  tx('readonly', (s) => s.index('artist').getAll(artist)).then((rows) =>
    (rows || []).sort((a, b) => b.added - a.added),
  )

export const addPhoto = (artist, file) =>
  tx('readwrite', (s) =>
    s.put({
      id: `mine-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      artist,
      blob: file,
      name: file.name.replace(/\.[^.]+$/, ''),
      added: Date.now(),
    }),
  )

export const deletePhoto = (id) => tx('readwrite', (s) => s.delete(id))
