# 영상 수집·검증 지침 (myClassicRoom)

한국어 클래식 역사 웹앱에 넣을 곡별 유튜브 영상을 찾고 검증하는 작업입니다.
쉘(curl)은 유튜브에 접근할 수 없습니다. 반드시 WebSearch / WebFetch 도구를 쓰세요.

## 곡마다 할 일

1. **영상 찾기**: WebSearch로 해당 곡의 유튜브 영상을 찾습니다.
   - 지정된 연주자를 우선합니다. 연주자가 "선정"이면 평판 좋은 연주를 골라 연주자 이름을 채웁니다.
   - 공식 채널을 우선합니다: 음반사(Deutsche Grammophon, Decca, Warner Classics, Sony Classical, Naxos, Harmonia Mundi 등), 오케스트라·연주자·작곡가 공식 채널, "- Topic" 자동 생성 채널.
   - 긴 작품(오페라, 수난곡, 교향곡 전곡 등)은 대표 악장이나 발췌를 고르고 section에 적습니다(예: "4악장", "서곡", "할렐루야 합창").
   - 검색 결과의 watch URL에서 11자리 영상 ID를 얻습니다. `site:youtube.com` 검색이 유용합니다.
2. **검증 (필수)**: 후보마다 WebFetch로
   `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json`
   를 열어 title과 author_name이 담긴 JSON이 나와야 합니다(= 존재하고 임베드 가능). 오류(401, 404 등)면 다른 후보로 바꿉니다. 곡당 최대 4개 후보까지 시도합니다.
   반환된 title과 author_name을 그대로 기록합니다. 영상 제목이 실제로 그 곡인지 확인합니다.
3. **대체 소스**: 1927년 이전 작곡(저작권 만료) 곡이면 musopen.org 또는 archive.org에서 같은 곡의 무료 녹음 페이지를 찾아 fallbackUrl에 넣습니다. archive.org에서 직접 재생 가능한 .mp3 주소를 찾으면 fallbackAudio에 넣습니다(못 찾으면 null). 1927년 이후 곡은 둘 다 null.
   대체 소스는 과하게 시간을 쓰지 말고, 곡당 검색 1~2번으로 끝내세요.
4. **설명 작성**: desc는 한국어 2문장, 본인 말로. 이 곡이 무엇이고 무엇을 들어 보면 좋은지. 한문(한자) 금지. 영어는 이름 등 꼭 필요할 때만. 다른 글을 베끼지 않습니다.
   composerYears는 "1685~1750" 형식, workYear는 "1721" 형식(대략이면 "1720년경").

## 출력

지정된 경로에 JSON 배열을 Write 도구로 저장합니다. UTF-8. 각 원소:

```json
{
  "id": "e04-06",
  "youtubeId": "11자리ID 또는 null",
  "ytTitle": "oembed가 돌려준 제목",
  "ytChannel": "oembed가 돌려준 author_name",
  "section": "1악장 '봄' 또는 null",
  "performer": "연주자 한국어 표기 (예: 파비오 비온디 / 유로파 갈란테)",
  "composerYears": "1678~1741",
  "workYear": "1725",
  "desc": "한국어 2문장",
  "fallbackUrl": "https://... 또는 null",
  "fallbackAudio": "https://...mp3 또는 null",
  "verified": true
}
```

검증된 영상을 못 찾은 곡은 youtubeId null, verified false로 남깁니다(빼지 마세요).
마지막 응답은 "검증 N/총 M, 경로" 한 줄과 검증 실패한 곡 id 목록만 적습니다.
