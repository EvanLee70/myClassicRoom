# myClassicRoom · 나의 클래식 음악실

클래식의 역사와 주요 작품

중세 성가부터 영화·게임 음악까지, 클래식의 역사를 12개 시대로 나누어 읽고 듣는 웹앱입니다.

- 왼쪽: 위아래를 잇는 선 하나에 12개 시대 (연도, 시대 설명, 주요 음악가, 시대 배경)
- 오른쪽: 지금 읽는 시대의 명곡을 작곡 연도 순으로, 추천곡만 별표 (모바일은 시대 이야기 바로 아래)
- 글꼴: 나눔고딕(본문) + 나눔명조(제목), 앱에 함께 묶어 배포 (@fontsource)
- 디자인: 오페라하우스 분위기 (크림색 본문, 와인색 벨벳 머리말·재생기, 금색 테두리, 브라운 골드 포인트)
- 아래: 유튜브 재생기 + 대기열 (시대 전체, 추천 3곡, 곡마다 작곡가·연주자 이름을 누르면 그 사람 곡 전체, 한 바퀴 126곡, 추천곡 36곡)
- 재생이 막힌 영상은 무료 녹음(Musopen, Internet Archive)으로 자동 전환, 없으면 유튜브 검색 링크 안내 후 다음 곡
- 즐겨찾기 + 최근 들은 곡 (브라우저에 저장)
- 팬클럽 탭 (주소 끝 `#fan`): 리사이틀 포스터 분위기의 음악가 팬 페이지. 지금은 손열음, 사라 장(장영주) 2명
  - 소개·학력·공식 채널, 연표, 검증된 연주 영상 15개, 공연 일정(D-day, 지난 공연), 음반, 수상·역할·글·방송·협업·팬 사실, 나의 팬 기록(좋아하는 곡·들은 날·메모), 출처
  - 사진첩: 위키미디어 공용 자유 이용 사진(저작자·라이선스 표시), 연주 장면, 내 사진(브라우저 저장), 대표 사진 고르기
  - 음악가 추가: `research/fan/` 에 `<접두어>_profile/disco/videos.json` 을 만들고 `python research/fan/build_artist.py <접두어> <키>` 실행 후 `app/src/data/artists/index.js` 목록에 한 줄 추가
  - 조사 원본: `research/fan/`

## 폴더 구성

```
myclassicroom/
├─ app/                  React + Vite 웹앱
│  └─ src/
│     ├─ data/eras.js    12개 시대 설명
│     ├─ data/tracks.json 126곡 데이터 (자동 생성)
│     ├─ player/         재생기 (유튜브 + 대체 음원 + 대기열)
│     └─ components/     화면 부품
└─ research/             곡 데이터 원본
   ├─ g1~g7.json         시대별 영상 검증 결과
   └─ build_tracks.py    합쳐서 tracks.json 만드는 스크립트
```

## 실행 (Windows 11)

```powershell
cd myclassicroom\app
npm install
npm run dev
```

브라우저에서 http://localhost:5173 을 엽니다.

## 곡 데이터 고치기

1. `research/g*.json` 에서 해당 곡의 youtubeId 등을 고칩니다.
2. 파이썬 가상환경에서 다시 만듭니다 (외부 패키지 필요 없음).

```powershell
cd myclassicroom
python -m venv .venv
.venv\Scripts\activate
python research\build_tracks.py
```

## Vercel 배포

- Root Directory: `app`
- Framework: Vite (자동 감지), Build: `npm run build`, Output: `dist`
