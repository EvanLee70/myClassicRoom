# -*- coding: utf-8 -*-
"""팬클럽 음악가 자료 합치기
사용법: python build_artist.py <조사파일 접두어> <앱에서 쓸 키>
예)     python build_artist.py son son-yeoleum
        python build_artist.py chang sarah-chang
<접두어>_profile.json, <접두어>_disco.json, <접두어>_videos.json 을 합쳐
app/src/data/artists/<키>.json 을 만든다.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "..", "..", "app", "src", "data", "artists")
CJK = re.compile(r"[㐀-䶿一-鿿぀-ヿ]")


def load(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as f:
        return json.load(f)


def main(prefix, key):
    p = load(f"{prefix}_profile.json")
    d = load(f"{prefix}_disco.json")
    v = load(f"{prefix}_videos.json")
    problems = []
    ids = set()
    for x in v:
        if not x.get("verified") or len(x.get("youtubeId") or "") != 11:
            problems.append(f"영상 검증 안 됨: {x.get('id')}")
        if x["id"] in ids:
            problems.append(f"영상 id 중복: {x['id']}")
        ids.add(x["id"])
    v = [x for x in v if x.get("verified") and len(x.get("youtubeId") or "") == 11]
    for c in d.get("concerts", []):
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", c.get("date", "")):
            problems.append(f"공연 날짜 형식 오류: {c.get('date')}")
    for lst in (p.get("official", []), d.get("albums", []), d.get("concerts", [])):
        for x in lst:
            u = x.get("url")
            if u and not u.startswith("https://"):
                problems.append(f"https가 아닌 주소 제거: {u}")
                x["url"] = None
    srcs = {s["url"]: s for s in p.get("sources", []) + d.get("sources", []) if s.get("url", "").startswith("https://")}
    out = {
        "id": key,
        "profile": p,
        "albums": sorted(d.get("albums", []), key=lambda a: str(a.get("year"))),
        "concerts": sorted([c for c in d.get("concerts", []) if re.fullmatch(r"\d{4}-\d{2}-\d{2}", c.get("date", ""))], key=lambda c: c["date"]),
        "videos": v,
        "sources": list(srcs.values()),
    }
    text = json.dumps(out, ensure_ascii=False)
    if CJK.search(text):
        problems.append(f"한자·일본어 발견: {set(CJK.findall(text))}")
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, f"{key}.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"{key}: 음반 {len(out['albums']):,} · 공연 {len(out['concerts']):,} · 영상 {len(v):,} · 출처 {len(out['sources']):,}")
    print("점검:", problems or "이상 없음")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
