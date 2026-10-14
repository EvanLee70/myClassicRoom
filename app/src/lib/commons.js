// 위키미디어 공용(Commons)에서 자유 이용 허락된 사진을 찾아온다.
// 저작자와 라이선스를 함께 받아 화면에 표시한다. (origin=* 로 브라우저에서 직접 호출 가능)
const API = 'https://commons.wikimedia.org/w/api.php'
const CACHE_PREFIX = 'mcr.commons.'

function plain(html) {
  if (!html) return ''
  try {
    return new DOMParser().parseFromString(html, 'text/html').body.textContent.trim()
  } catch {
    return String(html).replace(/<[^>]*>/g, '').trim()
  }
}

// 위키백과 문서의 대표 사진 파일 이름 (예: 한국어 위키백과 '손열음' 문서의 사진)
async function pageImageTitle(wiki) {
  if (!wiki) return null
  const res = await fetch(`https://${wiki.lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki.title)}`)
  if (!res.ok) return null
  const data = await res.json()
  const src = data?.originalimage?.source || ''
  const name = decodeURIComponent(src.split('/').pop() || '')
  return name ? `File:${name}` : null
}

async function byTitle(fileTitle) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    titles: fileTitle,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime',
    iiurlwidth: '720',
  })
  const res = await fetch(`${API}?${params}`)
  if (!res.ok) return []
  const data = await res.json()
  return Object.values(data?.query?.pages || {}).map((p) => ({ ...p, pinned: true }))
}

async function search(term) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${term}`,
    gsrnamespace: '6',
    gsrlimit: '30',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime',
    iiurlwidth: '720',
  })
  const res = await fetch(`${API}?${params}`)
  if (!res.ok) throw new Error(`Commons ${res.status}`)
  const data = await res.json()
  return Object.values(data?.query?.pages || {})
}

// names: 이 이름 중 하나라도 파일 제목에 들어 있는 사진만 고른다 (엉뚱한 사진 거르기)
export async function fetchCommonsPhotos(cacheKey, terms, names, wiki) {
  try {
    const cached = sessionStorage.getItem(CACHE_PREFIX + cacheKey)
    if (cached) return JSON.parse(cached)
  } catch {
    /* 무시 */
  }
  const pinnedTitle = await pageImageTitle(wiki).catch(() => null)
  const pinned = pinnedTitle ? await byTitle(pinnedTitle).catch(() => []) : []
  const found = (await Promise.all(terms.map((t) => search(t).catch(() => [])))).flat()
  const pages = [...pinned, ...found]
  const seen = new Set()
  const lower = names.map((n) => n.toLowerCase())
  const photos = []
  for (const p of pages) {
    const info = p.imageinfo?.[0]
    if (!info || seen.has(p.title)) continue
    seen.add(p.title)
    const title = p.title.replace(/^File:/, '')
    if (!p.pinned && !lower.some((n) => title.toLowerCase().includes(n))) continue
    if (!/^image\/(jpeg|png|webp)/.test(info.mime || '')) continue
    const m = info.extmetadata || {}
    photos.push({
      id: `commons:${title}`,
      kind: 'commons',
      src: info.thumburl || info.url,
      full: info.url,
      caption: plain(m.ImageDescription?.value) || title.replace(/\.[a-z]+$/i, '').replace(/_/g, ' '),
      date: plain(m.DateTimeOriginal?.value).slice(0, 10),
      credit: plain(m.Artist?.value) || '저작자 표기 없음',
      license: plain(m.LicenseShortName?.value) || '라이선스 확인',
      licenseUrl: m.LicenseUrl?.value || '',
      page: info.descriptionurl,
    })
  }
  try {
    sessionStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(photos))
  } catch {
    /* 무시 */
  }
  return photos
}
