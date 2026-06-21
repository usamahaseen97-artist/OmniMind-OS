import httpx

hosts = httpx.get("https://api.audius.co", timeout=15).json()
h = hosts["data"][0]
print("host", h)
for q in ["pasoori", "atif aslam", "arijit singh"]:
    r = httpx.get(
        f"{h}/v1/tracks/search",
        params={"query": q, "app_name": "OmniMind", "limit": 2},
        timeout=20,
    )
    print(q, r.status_code)
    if r.is_success:
        for t in r.json().get("data", [])[:1]:
            tid = t["id"]
            print(" ", t.get("title"), "-", (t.get("user") or {}).get("name"))
            stream = f"{h}/v1/tracks/{tid}/stream"
            head = httpx.head(stream, timeout=15, follow_redirects=True)
            print("  stream", head.status_code, head.headers.get("content-type"))
