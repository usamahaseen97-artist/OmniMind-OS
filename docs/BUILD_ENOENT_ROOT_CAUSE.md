# Root Cause Report — ENOENT `routes-manifest.json`

**Date:** 2026-06-17  
**Error:** `ENOENT: no such file or directory, open 'frontend/.next/routes-manifest.json'`  
**Symptom:** `GET /` returned **HTTP 500**

---

## Root Cause

The `.next` directory was in a **partial / stale dev state**: it contained dev compilation artifacts (`cache/`, `server/`, `build-manifest.json`, `app-path-routes-manifest.json`, etc.) but **`routes-manifest.json` was missing**.

`next dev` was still running and attempted to read `routes-manifest.json` on every request. Without that file, the server threw ENOENT and returned **500**.

This typically happens when:

1. `.next` was **partially deleted** or interrupted mid-write while dev was running  
2. A **concurrent `next build`** or manual cache cleanup removed/overwrote files while dev held port 3000  
3. Dev server was started against an **incomplete** cache (never finished first full compile)

**Not caused by:** `next.config.ts` misconfiguration, app route bugs, or OmniForge / Architectural Designer code. Config is valid; production build succeeds.

---

## Evidence

| Check | Before repair | After repair |
|-------|---------------|--------------|
| `.next` exists | ✅ Yes | ✅ Yes |
| `routes-manifest.json` | ❌ Missing | ✅ Present (805 bytes) |
| Other manifests | Present (partial set) | Full production + dev set |
| `npm run build` | Not run on clean tree | ✅ Exit 0, 35 pages |
| `GET /` | HTTP 500 | **HTTP 200** |

Partial `.next` contents before clean: `cache`, `server`, `static`, `app-build-manifest.json`, `build-manifest.json` — **no** `routes-manifest.json`.

---

## Repair Actions (build environment only)

1. Stopped dev server on port 3000 (PID 26940)  
2. `npm run clean` — removed entire `.next`  
3. `npm run build` — full production compile (~250s), exit 0  
4. Verified `routes-manifest.json` created  
5. `npm run dev` — fresh dev server  
6. Verified `GET http://127.0.0.1:3000/` → **HTTP 200**

**No application architecture or protected module changes.**

---

## Prevention

- Use `npm run dev:clean` after cache corruption instead of running dev on a broken `.next`  
- Stop `npm run dev` before `npm run build` or manual `.next` deletion  
- If `GET /` returns 500 with ENOENT on `routes-manifest.json`, run:  
  `npm run clean && npm run build` then restart dev

---

## Next.js Config

`next.config.ts` reviewed — no issues. Rewrites, redirects, `optimizePackageImports`, and webpack aliases are valid. One pre-existing build warning: `omnitv-events.ts` dynamic require (unrelated to ENOENT).
