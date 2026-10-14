# myClassicRoom · 나의 클래식 음악실

클래식의 역사와 주요 작품

중세 성가부터 영화·게임 음악까지, 클래식의 역사를 12개 시대로 나누어 읽고 듣는 웹앱입니다.

- 왼쪽: 시대 이야기를 위에서 아래로 스크롤
- 오른쪽: 지금 읽는 시대의 명곡 카드 (모바일은 이야기 바로 아래)
- 아래: 유튜브 재생기 + 대기열 (시대 전체, 입문 3곡, 작곡가별, 연주자별, 한 바퀴 126곡, 입문 36곡)
- 재생이 막힌 영상은 무료 녹음(Musopen, Internet Archive)으로 자동 전환, 없으면 유튜브 검색 링크 안내 후 다음 곡
- 즐겨찾기 + 최근 들은 곡 (브라우저에 저장)

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
