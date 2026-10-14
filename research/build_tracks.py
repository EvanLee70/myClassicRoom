# -*- coding: utf-8 -*-
"""기본 곡 목록 + 서브에이전트 검증 결과를 합쳐 app/src/data/tracks.json 생성"""
import json, glob, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "app", "src", "data", "tracks.json")

# id | 곡 | 작곡가 | 영문 검색어(대체 링크용)
BASE = """
e01-1|그레고리오 성가 「Puer natus est nobis」|그레고리오 성가|Gregorian chant Puer natus est nobis
e01-2|그레고리오 성가 「Dies irae」|그레고리오 성가|Dies irae Gregorian chant
e01-3|그레고리오 성가 「Salve Regina」|그레고리오 성가|Salve Regina Gregorian chant
e01-4|「덕의 질서」|힐데가르트 폰 빙엔|Hildegard Ordo Virtutum
e01-5|「O frondens virga」|힐데가르트 폰 빙엔|Hildegard O frondens virga
e02-1|「Viderunt omnes」|페로탱|Perotin Viderunt omnes
e02-2|「Sederunt principes」|페로탱|Perotin Sederunt principes
e02-3|「여름이 왔도다」|작자 미상|Sumer is icumen in
e02-4|「노트르담 미사」|기욤 드 마쇼|Machaut Messe de Nostre Dame
e02-5|「Ecco la primavera」|프란체스코 란디니|Landini Ecco la primavera
e03-1|「아베 마리아」|조스캥 데 프레|Josquin Ave Maria virgo serena
e03-2|「팡제 링구아 미사」|조스캥 데 프레|Josquin Missa Pange lingua
e03-3|「교황 마르첼루스 미사」|조반니 피에를루이지 다 팔레스트리나|Palestrina Missa Papae Marcelli
e03-4|「Spem in alium」|토머스 탈리스|Tallis Spem in alium
e03-5|「4성부 미사」|윌리엄 버드|Byrd Mass for Four Voices
e03-6|「미제레레」|그레고리오 알레그리|Allegri Miserere
e03-7|「흘러라 나의 눈물이여」|존 다울랜드|Dowland Flow my tears
e03-8|「당스리」|티일만 수자토|Susato Danserye
e04-01|「오르페오」|클라우디오 몬테베르디|Monteverdi L'Orfeo
e04-02|「성모 마리아의 저녁기도」|클라우디오 몬테베르디|Monteverdi Vespro della Beata Vergine
e04-03|「캐논 D장조」|요한 파헬벨|Pachelbel Canon in D
e04-04|「디도와 에네아스」 '디도의 탄식'|헨리 퍼셀|Purcell Dido's Lament
e04-05|「크리스마스 협주곡」|아르칸젤로 코렐리|Corelli Christmas Concerto
e04-06|「사계」|안토니오 비발디|Vivaldi Four Seasons
e04-07|「브란덴부르크 협주곡」|요한 제바스티안 바흐|Bach Brandenburg Concerto
e04-08|「골드베르크 변주곡」|요한 제바스티안 바흐|Bach Goldberg Variations
e04-09|「무반주 첼로 모음곡 1번」|요한 제바스티안 바흐|Bach Cello Suite 1
e04-10|「토카타와 푸가 d단조」|요한 제바스티안 바흐|Bach Toccata and Fugue in D minor
e04-11|「G선상의 아리아」|요한 제바스티안 바흐|Bach Air on the G String
e04-12|「마태 수난곡」|요한 제바스티안 바흐|Bach St Matthew Passion
e04-13|「메시아」|게오르크 프리드리히 헨델|Handel Messiah Hallelujah
e04-14|「수상 음악」|게오르크 프리드리히 헨델|Handel Water Music
e04-15|「건반 소나타 K.141」|도메니코 스카를라티|Scarlatti Sonata K 141
e05-01|교향곡 94번 「놀람」|요제프 하이든|Haydn Symphony 94 Surprise
e05-02|현악4중주 「황제」|요제프 하이든|Haydn Emperor Quartet
e05-03|트럼펫 협주곡|요제프 하이든|Haydn Trumpet Concerto
e05-04|「아이네 클라이네 나흐트무지크」|볼프강 아마데우스 모차르트|Mozart Eine kleine Nachtmusik
e05-05|교향곡 40번|볼프강 아마데우스 모차르트|Mozart Symphony 40
e05-06|교향곡 41번 「주피터」|볼프강 아마데우스 모차르트|Mozart Symphony 41 Jupiter
e05-07|피아노 협주곡 21번|볼프강 아마데우스 모차르트|Mozart Piano Concerto 21
e05-08|「터키 행진곡」|볼프강 아마데우스 모차르트|Mozart Rondo alla Turca
e05-09|「마술피리」 '밤의 여왕 아리아'|볼프강 아마데우스 모차르트|Queen of the Night aria
e05-10|「레퀴엠」|볼프강 아마데우스 모차르트|Mozart Requiem Lacrimosa
e05-11|「엘리제를 위하여」|루트비히 판 베토벤|Beethoven Fur Elise
e05-12|「비창」 소나타|루트비히 판 베토벤|Beethoven Pathetique Sonata
e05-13|「월광」 소나타|루트비히 판 베토벤|Beethoven Moonlight Sonata
e05-14|교향곡 5번 「운명」|루트비히 판 베토벤|Beethoven Symphony 5
e05-15|교향곡 9번 「합창」|루트비히 판 베토벤|Beethoven Symphony 9
e06-01|「마왕」|프란츠 슈베르트|Schubert Erlkonig
e06-02|「겨울나그네」|프란츠 슈베르트|Schubert Winterreise
e06-03|「송어」 5중주|프란츠 슈베르트|Schubert Trout Quintet
e06-04|교향곡 8번 「미완성」|프란츠 슈베르트|Schubert Unfinished Symphony
e06-05|「마탄의 사수」 서곡|카를 마리아 폰 베버|Weber Freischutz Overture
e06-06|「윌리엄 텔」 서곡|조아키노 로시니|Rossini William Tell Overture
e06-07|「환상 교향곡」|엑토르 베를리오즈|Berlioz Symphonie fantastique
e06-08|「한여름 밤의 꿈」 '결혼 행진곡'|펠릭스 멘델스존|Mendelssohn Wedding March
e06-09|바이올린 협주곡 e단조|펠릭스 멘델스존|Mendelssohn Violin Concerto
e06-10|「녹턴 Op.9-2」|프레데리크 쇼팽|Chopin Nocturne Op 9 No 2
e06-11|「발라드 1번」|프레데리크 쇼팽|Chopin Ballade 1
e06-12|「혁명 에튀드」|프레데리크 쇼팽|Chopin Revolutionary Etude
e06-13|피아노 협주곡 1번|프레데리크 쇼팽|Chopin Piano Concerto 1
e06-14|「트로이메라이」|로베르트 슈만|Schumann Traumerei
e06-15|「라 캄파넬라」|프란츠 리스트|Liszt La Campanella
e07-01|「발퀴레의 기행」|리하르트 바그너|Wagner Ride of the Valkyries
e07-02|「트리스탄과 이졸데」 전주곡|리하르트 바그너|Wagner Tristan Prelude
e07-03|「라 트라비아타」 '축배의 노래'|주세페 베르디|Verdi Libiamo
e07-04|「레퀴엠」 '진노의 날'|주세페 베르디|Verdi Requiem Dies irae
e07-05|교향곡 1번|요하네스 브람스|Brahms Symphony 1
e07-06|「헝가리 무곡 5번」|요하네스 브람스|Brahms Hungarian Dance 5
e07-07|바이올린 협주곡|요하네스 브람스|Brahms Violin Concerto
e07-08|「백조의 호수」|표트르 차이콥스키|Tchaikovsky Swan Lake
e07-09|「호두까기 인형」|표트르 차이콥스키|Tchaikovsky Nutcracker
e07-10|피아노 협주곡 1번|표트르 차이콥스키|Tchaikovsky Piano Concerto 1
e07-11|교향곡 6번 「비창」|표트르 차이콥스키|Tchaikovsky Symphony 6
e07-12|「동물의 사육제」 '백조'|카미유 생상스|Saint-Saens The Swan
e07-13|「잔니 스키키」 '오 사랑하는 나의 아버지'|자코모 푸치니|O mio babbino caro
e07-14|교향곡 5번 '아다지에토'|구스타프 말러|Mahler Adagietto
e07-15|교향곡 2번 「부활」|구스타프 말러|Mahler Symphony 2
e08-01|「나의 조국」 '블타바'|베드르지흐 스메타나|Smetana Vltava
e08-02|교향곡 9번 「신세계로부터」|안토닌 드보르자크|Dvorak New World Symphony
e08-03|첼로 협주곡|안토닌 드보르자크|Dvorak Cello Concerto
e08-04|「전람회의 그림」|모데스트 무소르그스키|Mussorgsky Pictures at an Exhibition
e08-05|「세헤라자데」|니콜라이 림스키코르사코프|Rimsky-Korsakov Scheherazade
e08-06|「폴로베츠인의 춤」|알렉산드르 보로딘|Borodin Polovtsian Dances
e08-07|「페르 귄트」 '아침의 기분'|에드바르 그리그|Grieg Morning Mood
e08-08|피아노 협주곡|에드바르 그리그|Grieg Piano Concerto
e08-09|「핀란디아」|장 시벨리우스|Sibelius Finlandia
e08-10|「수수께끼 변주곡」 '님로드'|에드워드 엘가|Elgar Nimrod
e09-01|「달빛」|클로드 드뷔시|Debussy Clair de lune
e09-02|「아마빛 머리의 소녀」|클로드 드뷔시|Debussy La fille aux cheveux de lin
e09-03|「목신의 오후 전주곡」|클로드 드뷔시|Debussy Afternoon of a Faun
e09-04|「바다」|클로드 드뷔시|Debussy La Mer
e09-05|「짐노페디 1번」|에릭 사티|Satie Gymnopedie 1
e09-06|「그노시엔 1번」|에릭 사티|Satie Gnossienne 1
e09-07|「파반」|가브리엘 포레|Faure Pavane
e09-08|「죽은 왕녀를 위한 파반」|모리스 라벨|Ravel Pavane pour une infante defunte
e09-09|「물의 유희」|모리스 라벨|Ravel Jeux d'eau
e09-10|「볼레로」|모리스 라벨|Ravel Bolero
e10-01|피아노 협주곡 2번|세르게이 라흐마니노프|Rachmaninoff Piano Concerto 2
e10-02|「불새」|이고르 스트라빈스키|Stravinsky Firebird
e10-03|「봄의 제전」|이고르 스트라빈스키|Stravinsky Rite of Spring
e10-04|「정화된 밤」|아르놀트 쇤베르크|Schoenberg Verklarte Nacht
e10-05|「달에 홀린 피에로」|아르놀트 쇤베르크|Schoenberg Pierrot lunaire
e10-06|「현악기, 타악기와 첼레스타를 위한 음악」|벨라 바르톡|Bartok Music for Strings Percussion and Celesta
e10-07|「피터와 늑대」|세르게이 프로코피예프|Prokofiev Peter and the Wolf
e10-08|「로미오와 줄리엣」 '기사들의 춤'|세르게이 프로코피예프|Prokofiev Dance of the Knights
e10-09|교향곡 5번|드미트리 쇼스타코비치|Shostakovich Symphony 5
e10-10|「랩소디 인 블루」|조지 거슈윈|Gershwin Rhapsody in Blue
e10-11|「카르미나 부라나」 '오 운명의 여신이여'|카를 오르프|Orff O Fortuna
e10-12|「현을 위한 아다지오」|새뮤얼 바버|Barber Adagio for Strings
e11-1|「4분 33초」|존 케이지|John Cage 4'33
e11-2|「아트모스페르」|죄르지 리게티|Ligeti Atmospheres
e11-3|「예악」|윤이상|Isang Yun Reak
e11-4|「18명의 음악가를 위한 음악」|스티브 라이히|Steve Reich Music for 18 Musicians
e11-5|「디퍼런트 트레인스」|스티브 라이히|Steve Reich Different Trains
e11-6|「메타모포시스 1」|필립 글래스|Philip Glass Metamorphosis One
e11-7|「거울 속의 거울」|아르보 패르트|Arvo Part Spiegel im Spiegel
e11-8|교향곡 3번 「슬픔의 노래」|헨리크 고레츠키|Gorecki Symphony 3
e12-1|「스타워즈」 메인 타이틀|존 윌리엄스|Star Wars Main Title John Williams
e12-2|「쉰들러 리스트」 테마|존 윌리엄스|Schindler's List theme John Williams
e12-3|「미션」 '가브리엘의 오보에'|엔니오 모리코네|Morricone Gabriel's Oboe
e12-4|「인생의 회전목마」|히사이시 조|Joe Hisaishi Merry-Go-Round of Life
e12-5|「Summer」|히사이시 조|Joe Hisaishi Summer
e12-6|「파이널 판타지」 '프렐류드'|우에마츠 노부오|Final Fantasy Prelude orchestra
e12-7|「On the Nature of Daylight」|막스 리히터|Max Richter On the Nature of Daylight
e12-8|바이올린 협주곡|진은숙|Unsuk Chin Violin Concerto
"""

INTRO = set("""e01-1 e01-2 e01-4 e02-1 e02-3 e02-4 e03-3 e03-4 e03-6
e04-03 e04-06 e04-11 e05-04 e05-13 e05-14 e06-01 e06-10 e06-14
e07-03 e07-06 e07-08 e08-01 e08-02 e08-07 e09-01 e09-05 e09-10
e10-01 e10-10 e10-11 e11-1 e11-4 e11-7 e12-1 e12-3 e12-4""".split())

import re
_CJK = re.compile(r"[぀-ヿ㐀-䶿一-鿿～「」：]+")

def clean(s):
    """한자·일본어 문자 제거 (사용자 규칙: 한문 사용 불가)"""
    if not s:
        return s
    return re.sub(r"\s{2,}", " ", _CJK.sub(" ", s)).strip(" /")

research = {}
for f in sorted(glob.glob(os.path.join(HERE, "g*.json"))):
    for r in json.load(open(f, encoding="utf-8")):
        research[r["id"]] = r

tracks, errors = [], []
for order, line in enumerate(l for l in BASE.strip().splitlines() if l.strip()):
    tid, title, composer, query = [x.strip() for x in line.split("|")]
    r = research.get(tid, {})
    if not r:
        errors.append(f"{tid}: 조사 결과 없음")
    yid = r.get("youtubeId") if r.get("verified") else None
    if yid and len(yid) != 11:
        errors.append(f"{tid}: 영상 ID 길이 이상 {yid}")
    tracks.append({
        "id": tid,
        "era": int(tid[1:3]),
        "order": order,
        "title": title,
        "composer": composer,
        "composerYears": r.get("composerYears"),
        "workYear": r.get("workYear"),
        "performer": (r.get("performer") or "").strip() or "연주 정보 없음",
        "section": r.get("section"),
        "intro": tid in INTRO,
        "desc": r.get("desc") or "곡 설명을 준비 중입니다.",
        "youtubeId": yid,
        "ytTitle": clean(r.get("ytTitle")),
        "ytChannel": r.get("ytChannel"),
        "fallbackUrl": r.get("fallbackUrl"),
        "fallbackAudio": r.get("fallbackAudio"),
        "searchQuery": query,
    })

# 무결성 점검
ids = [t["id"] for t in tracks]
assert len(ids) == len(set(ids)), "중복 id"
per_era = {}
for t in tracks:
    per_era.setdefault(t["era"], []).append(t)
for e, ts in sorted(per_era.items()):
    n_intro = sum(t["intro"] for t in ts)
    if n_intro != 3:
        errors.append(f"시대 {e}: 입문곡 {n_intro}개")
for t in tracks:
    for k in ("fallbackUrl", "fallbackAudio"):
        if t[k] and not t[k].startswith("https://"):
            errors.append(f"{t['id']}: {k} 가 https 주소가 아님 → 제거")
            t[k] = None
    if t["youtubeId"] and not re.fullmatch(r"[A-Za-z0-9_-]{11}", t["youtubeId"]):
        errors.append(f"{t['id']}: 영상 ID 형식 오류 → 제거")
        t["youtubeId"] = None
yt_ids = [t["youtubeId"] for t in tracks if t["youtubeId"]]
dups = {y for y in yt_ids if yt_ids.count(y) > 1}
if dups:
    errors.append(f"중복 영상 ID: {dups}")

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(tracks, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"총 {len(tracks):,}곡, 영상 {len(yt_ids):,}곡, 대체음원 {sum(1 for t in tracks if t['fallbackAudio']):,}곡")
print("시대별:", {e: len(ts) for e, ts in sorted(per_era.items())})
print("점검 결과:", errors or "이상 없음")
