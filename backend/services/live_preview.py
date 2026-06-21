from __future__ import annotations

import json
import re
from html import escape

import httpx

from config import get_settings

PLOT_RE = re.compile(r"(\d{2,5})\s*(sq\s*yd|yard|yrd|sqft|sq\s*ft)?", re.I)
ROOM_RE = re.compile(r"(\d+)\s*(bed|bath|room)", re.I)


def _shell(title: str, body: str, accent: str = "#00ff88") -> str:
    return f"""<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:system-ui,sans-serif;background:#050605;color:#e4e4e7;min-height:100vh;padding:16px}}
  h1{{color:{accent};font-size:14px;letter-spacing:.2em;text-transform:uppercase;margin-bottom:12px}}
  .card{{border:1px solid {accent}33;background:#0a0f0c;border-radius:12px;padding:16px;margin-top:8px}}
  button{{background:{accent}22;border:1px solid {accent};color:{accent};padding:8px 14px;border-radius:8px;margin:4px;cursor:pointer}}
  .muted{{color:#71717a;font-size:12px;margin-top:8px}}
</style>
</head><body>
<h1>{escape(title)}</h1>
{body}
<p class="muted">OmniMind V11 · Live Preview</p>
</body></html>"""


async def _crypto_chart_html() -> str:
    from services.api_keys import get_key

    price = "—"
    change = ""
    cg_key = get_key("COINGECKO_API_KEY")
    try:
        url = "https://api.coingecko.com/api/v3/simple/price"
        params = {"ids": "bitcoin,ethereum", "vs_currencies": "usd", "include_24hr_change": "true"}
        headers = {"x-cg-demo-api-key": cg_key} if cg_key else {}
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(url, params=params, headers=headers)
            data = r.json()
            btc = data.get("bitcoin", {})
            eth = data.get("ethereum", {})
            price = f"BTC ${btc.get('usd', 0):,.0f} · ETH ${eth.get('usd', 0):,.0f}"
            change = f"24h: BTC {btc.get('usd_24h_change', 0):.1f}%"
    except Exception:
        price = "Connect COINGECKO_API_KEY for live quotes"

    chart = """
    <div class="card">
      <p style="font-size:18px;font-weight:bold;color:#00ff88">""" + escape(price) + """</p>
      <p class="muted">""" + escape(change) + """</p>
      <svg viewBox="0 0 300 80" style="width:100%;margin-top:12px">
        <polyline fill="none" stroke="#00ff88" stroke-width="2"
          points="0,60 40,45 80,50 120,30 160,35 200,20 240,25 280,10 300,15"/>
      </svg>
    </div>
    """
    return _shell("Quantum Trader · Live Signals", chart)


def build_preview(agent_id: str, message: str, assistant_text: str = "") -> dict:
    msg = message.lower()
    key = agent_id

    if key in ("web-architect", "sovereign-core", "logic-translator") or "web" in msg or "app" in msg:
        theme = "dark neon" if "dark" in msg else "sovereign green"
        html = _shell(
            "App / Web Architect",
            f"""
            <div class="card">
              <p>Generated UI shell — theme: <strong>{escape(theme)}</strong></p>
              <nav style="margin-top:12px">
                <button>Dashboard</button><button>Agents</button><button>Vault</button><button>Settings</button>
              </nav>
              <div style="margin-top:16px;padding:12px;border:1px dashed #00ff8833;border-radius:8px">
                <p style="font-size:13px">{escape(message[:200])}</p>
              </div>
            </div>
            """,
        )
        return {"type": "html", "html": html}

    if key == "architect" or "3d" in msg or "plot" in msg or "room" in msg:
        plot = "500 sq yd"
        m = PLOT_RE.search(message)
        if m:
            plot = f"{m.group(1)} {m.group(2) or 'sq yd'}"
        rooms = ROOM_RE.findall(message) or [("3", "bed"), ("2", "bath")]
        room_labels = ", ".join(f"{n} {t}" for n, t in rooms[:4])
        svg_rooms = "".join(
            f'<rect x="{20+i*70}" y="40" width="60" height="50" fill="#00ff8822" stroke="#00ff88"/>'
            f'<text x="{35+i*70}" y="70" fill="#00ff88" font-size="10">R{i+1}</text>'
            for i in range(min(4, len(rooms)))
        )
        html = _shell(
            "Architectural Intelligence",
            f"""
            <div class="card">
              <p>Plot: <strong>{escape(plot)}</strong> · Rooms: {escape(room_labels)}</p>
              <svg viewBox="0 0 320 140" style="width:100%;margin-top:12px;background:#000;border-radius:8px">
                <rect x="10" y="10" width="300" height="120" fill="none" stroke="#00ff88" stroke-width="2"/>
                {svg_rooms}
              </svg>
            </div>
            """,
        )
        return {"type": "html", "html": html}

    if key == "data-science" or "data" in msg or "excel" in msg or "chart" in msg:
        html = _shell(
            "Business Analytics",
            """
            <div class="card">
              <p>Sales trend · Top products (demo dataset)</p>
              <svg viewBox="0 0 300 120" style="width:100%;margin-top:8px">
                <rect x="20" y="80" width="30" height="30" fill="#00ff88"/>
                <rect x="70" y="50" width="30" height="60" fill="#00ff88aa"/>
                <rect x="120" y="65" width="30" height="45" fill="#00ff88"/>
                <rect x="170" y="35" width="30" height="75" fill="#00ff88"/>
                <rect x="220" y="55" width="30" height="55" fill="#00ff8866"/>
                <text x="20" y="115" fill="#71717a" font-size="9">Jan</text>
                <text x="220" y="115" fill="#71717a" font-size="9">May</text>
              </svg>
              <p class="muted">Upload Excel to replace with Pandas-cleaned live charts.</p>
            </div>
            """,
        )
        return {"type": "html", "html": html}

    if key == "trade-oracle" or "trade" in msg or "crypto" in msg or "stock" in msg:
        return {"type": "html", "html": "", "async": "crypto"}

    if key in ("medical-specialist", "bio-heal") or "medical" in msg or "scan" in msg:
        html = _shell(
            "Medical Vision Analysis",
            """
            <div class="card">
              <p><strong>Vision scan simulation</strong> (sandbox)</p>
              <ul style="margin-top:10px;font-size:13px;line-height:1.8;color:#a1a1aa">
                <li>Eye tone: normal range</li>
                <li>Skin hydration: monitor intake</li>
                <li>Jaundice cues: none flagged in demo</li>
              </ul>
              <p class="muted">Upload image + enable DeepFace in production .env.</p>
            </div>
            """,
        )
        return {"type": "html", "html": html}

    if key in ("video-vfx", "creative-visionary") or "video" in msg or "vfx" in msg:
        html = _shell(
            "Video VFX Master",
            """
            <div class="card" style="text-align:center;padding:32px">
              <div style="width:100%;aspect-ratio:16/9;background:#000;border:1px solid #00ff8833;border-radius:8px;display:flex;align-items:center;justify-content:center">
                <span style="color:#00ff88">▶ Auto-Editor timeline preview</span>
              </div>
              <p class="muted" style="margin-top:12px">Scene cuts · trim · VFX overlay pipeline ready</p>
            </div>
            """,
        )
        return {"type": "html", "html": html}

  # default sovereign preview from assistant snippet
    snippet = escape((assistant_text or message)[:400])
    html = _shell("Live Output", f'<div class="card"><pre style="white-space:pre-wrap;font-size:12px">{snippet}</pre></div>')
    return {"type": "html", "html": html}


async def resolve_preview(agent_id: str, message: str, assistant_text: str = "") -> dict:
    spec = build_preview(agent_id, message, assistant_text)
    if spec.get("async") == "crypto":
        spec["html"] = await _crypto_chart_html()
        del spec["async"]
    return spec
