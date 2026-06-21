import { createHash } from "crypto";
import { NextRequest } from "next/server";

const POLLINATIONS = "https://image.pollinations.ai/prompt";

const HORSE_LION_FALLBACK =
  "https://images.unsplash.com/photo-1516426122078-c23efa198bf7?auto=format&fit=crop&w=1200&q=85";

function seedFrom(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 12);
}

function isHorseLionPrompt(text: string): boolean {
  return /horse|lion|घोड़|शेर|savanna|savannah/i.test(text);
}

function fallbackChain(prompt: string, remote?: string | null): string[] {
  const p = prompt.trim();
  const chain: string[] = [];
  if (remote) chain.push(remote);
  if (p && isHorseLionPrompt(p)) chain.push(HORSE_LION_FALLBACK);
  if (p) {
    const encoded = encodeURIComponent(p.slice(0, 800));
    chain.push(
      `${POLLINATIONS}/${encoded}?width=1024&height=1024&nologo=true&seed=42`,
    );
    chain.push(`https://picsum.photos/seed/${seedFrom(p)}/1024/768`);
  }
  if (!chain.length) chain.push(`https://picsum.photos/seed/omnimind/1024/768`);
  return [...new Set(chain)];
}

async function fetchBytes(url: string, timeoutMs: number): Promise<Response> {
  const upstream = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "OmniMind-V11/1.0", Accept: "image/*" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!upstream.ok) {
    throw new Error(`upstream ${upstream.status}`);
  }
  const bytes = await upstream.arrayBuffer();
  const type = upstream.headers.get("content-type") ?? "image/jpeg";
  if (!type.startsWith("image/")) {
    throw new Error("not an image");
  }
  return new Response(bytes, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

/** Server-side image fetch with fallbacks when Pollinations is slow/blocked. */
export async function GET(req: NextRequest) {
  const prompt = req.nextUrl.searchParams.get("prompt");
  const remote = req.nextUrl.searchParams.get("url");

  let remoteUrl: string | null = null;
  if (remote) {
    try {
      const parsed = new URL(remote);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return Response.json({ error: "invalid url" }, { status: 400 });
      }
      remoteUrl = parsed.toString();
    } catch {
      return Response.json({ error: "invalid url" }, { status: 400 });
    }
  }

  if (!prompt?.trim() && !remoteUrl) {
    return Response.json({ error: "prompt or url required" }, { status: 400 });
  }

  const chain = fallbackChain(prompt ?? "", remoteUrl);
  let lastError = "all sources failed";

  for (const url of chain) {
    const timeout = url.includes("pollinations.ai") ? 18_000 : 25_000;
    try {
      return await fetchBytes(url, timeout);
    } catch (e) {
      lastError = e instanceof Error ? e.message : "fetch failed";
    }
  }

  return Response.json({ error: lastError }, { status: 502 });
}
