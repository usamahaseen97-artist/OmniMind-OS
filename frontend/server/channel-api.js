import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.CHANNEL_API_PORT || 4001);
const CHANNELS_FILE = path.resolve(__dirname, "../data/legal-live-channels.json");
const CATEGORIES = ["Live News", "Sports", "Dramas", "Movies"];

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CHANNEL_API_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategory(value) {
  return CATEGORIES.includes(value) ? value : "Live News";
}

function withPlayerParams(url) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("autoplay", "1");
    parsed.searchParams.set("mute", "1");
    parsed.searchParams.set("rel", "0");
    return parsed.toString();
  } catch {
    return url;
  }
}

function extractYouTubeId(url) {
  if (!url) return undefined;
  return String(url).match(/(?:\/embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/)?.[1];
}

function youtubeEmbedFromId(videoId) {
  return videoId ? withPlayerParams(`https://www.youtube.com/embed/${videoId}`) : undefined;
}

function youtubeChannelLiveEmbed(channelId) {
  return channelId
    ? withPlayerParams(`https://www.youtube.com/embed/live_stream?channel=${channelId}`)
    : undefined;
}

function isTrustedPublicSource(channel) {
  const sourceType = channel.sourceType || channel.type;
  const embedUrl = channel.embedUrl || channel.embed || "";
  const youtubeLiveUrl = channel.youtubeLiveUrl || channel.officialUrl || "";
  if (channel.verifiedLegal === true) return true;
  if (sourceType === "youtube") {
    return Boolean(
      channel.youtubeId ||
        channel.youtubeChannelId ||
        /^https:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\//.test(embedUrl) ||
        /^https:\/\/(www\.)?youtube\.com\/(@[^/]+|channel\/[^/]+)\/live/.test(youtubeLiveUrl),
    );
  }
  return false;
}

function normalizeChannel(channel) {
  if (!channel || typeof channel !== "object") return null;
  const sourceType = channel.sourceType || channel.type;
  const youtubeId = channel.youtubeId || extractYouTubeId(channel.embedUrl || channel.embed);
  const youtubeLiveUrl =
    channel.youtubeLiveUrl ||
    (channel.youtubeHandle ? `https://www.youtube.com/@${String(channel.youtubeHandle).replace(/^@/, "")}/live` : undefined);
  const embedUrl =
    sourceType === "youtube"
      ? youtubeEmbedFromId(youtubeId) ||
        withPlayerParams(channel.embedUrl || channel.embed) ||
        youtubeChannelLiveEmbed(channel.youtubeChannelId)
      : channel.embedUrl || channel.embed;
  const hlsUrl = channel.hlsUrl || channel.stream;
  if (!channel.name || !["youtube", "hls"].includes(sourceType)) return null;
  if (!isTrustedPublicSource(channel)) return null;

  return {
    id: channel.id || slugify(channel.name),
    name: channel.name,
    category: normalizeCategory(channel.category),
    country: channel.country || "Global",
    language: channel.language || "Unknown",
    sourceType,
    type: sourceType,
    youtubeId,
    youtubeHandle: channel.youtubeHandle,
    youtubeChannelId: channel.youtubeChannelId,
    youtubeLiveUrl,
    embed: embedUrl,
    embedUrl,
    hlsUrl,
    officialUrl: youtubeLiveUrl || channel.officialUrl || embedUrl || hlsUrl || "#",
    description: channel.description || `Official ${String(sourceType).toUpperCase()} source for ${channel.name}.`,
    tags: Array.isArray(channel.tags) ? channel.tags : [channel.name, sourceType],
    posterGradient: channel.posterGradient || "from-emerald-950 via-zinc-950 to-black",
    isLive: channel.isLive ?? sourceType === "youtube",
    verifiedLegal: true,
  };
}

async function resolveCurrentLiveVideoId(channel) {
  if (channel.youtubeId) return channel.youtubeId;

  const liveUrl =
    channel.youtubeLiveUrl ||
    (channel.youtubeHandle ? `https://www.youtube.com/@${String(channel.youtubeHandle).replace(/^@/, "")}/live` : null);
  if (!liveUrl) return null;

  const response = await fetch(liveUrl, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
      Accept: "text/html,*/*",
    },
  });
  const html = await response.text();
  return (
    html.match(/"videoId":"([a-zA-Z0-9_-]{6,})"/)?.[1] ||
    html.match(/watch\?v=([a-zA-Z0-9_-]{6,})/)?.[1] ||
    null
  );
}

async function loadChannels() {
  const raw = await readFile(CHANNELS_FILE, "utf8");
  const channels = JSON.parse(raw);
  if (!Array.isArray(channels)) return [];
  return channels.map(normalizeChannel).filter(Boolean);
}

function matchesQuery(channel, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  return [
    channel.name,
    channel.category,
    channel.country,
    channel.language,
    channel.description,
    ...(channel.tags || []),
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "legal-channel-api", categories: CATEGORIES });
});

app.get("/api/categories", (_req, res) => {
  res.json({ categories: CATEGORIES });
});

app.get("/api/channels", async (req, res, next) => {
  try {
    const category = String(req.query.category || "All");
    const query = String(req.query.q || "");
    const channels = (await loadChannels())
      .filter((channel) => category === "All" || channel.category === category)
      .filter((channel) => matchesQuery(channel, query));
    res.json({ channels, categories: CATEGORIES, legalOnly: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/channels/:id", async (req, res, next) => {
  try {
    const channel = (await loadChannels()).find((item) => item.id === req.params.id);
    if (!channel) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    res.json({ channel });
  } catch (error) {
    next(error);
  }
});

app.get("/api/channels/:id/live", async (req, res, next) => {
  try {
    const channel = (await loadChannels()).find((item) => item.id === req.params.id);
    if (!channel) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.sourceType !== "youtube") {
      res.status(400).json({ error: "Channel is not a YouTube source" });
      return;
    }

    const videoId = await resolveCurrentLiveVideoId(channel);
    const embedUrl =
      youtubeEmbedFromId(videoId) ||
      youtubeChannelLiveEmbed(channel.youtubeChannelId) ||
      withPlayerParams(channel.embedUrl);

    res.json({
      channelId: channel.id,
      videoId,
      embedUrl,
      officialUrl: channel.youtubeLiveUrl || channel.officialUrl,
      resolved: Boolean(videoId),
      fallback: !videoId,
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("[channel-api]", error);
  res.status(500).json({ error: "Channel API failed" });
});

app.listen(PORT, () => {
  console.log(`Legal Channel API listening on http://localhost:${PORT}`);
});
