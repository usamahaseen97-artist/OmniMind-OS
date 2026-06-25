import type { StreamingPlatform, StreamingSession } from "../broadcast-types";
import { DEFAULT_STREAMING_SESSION, STREAMING_PLATFORMS } from "./constants";

export class LiveStreamingCore {
  session: StreamingSession = { ...DEFAULT_STREAMING_SESSION, scenes: [...DEFAULT_STREAMING_SESSION.scenes] };

  platforms() {
    return STREAMING_PLATFORMS;
  }

  setPlatform(platform: StreamingPlatform) {
    const p = STREAMING_PLATFORMS.find((x) => x.id === platform);
    this.session.platform = platform;
    if (p) this.session.rtmpUrl = p.rtmp;
    return this.session;
  }

  goLive() {
    this.session.status = "live";
    this.session.viewerCount = 12;
    return this.session;
  }

  stop() {
    this.session.status = "ended";
    return this.session;
  }

  switchScene(sceneId: string) {
    this.session.scenes.forEach((s) => { s.active = s.id === sceneId; });
    return this.session;
  }

  toggleRecording(on: boolean) {
    this.session.recordingEnabled = on;
    if (on && this.session.status === "live") this.session.status = "recording";
    return this.session;
  }
}

export const liveStreamingCore = new LiveStreamingCore();
