"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { notifyChatsUpdated } from "../../lib/chat-events";
import type { ChatMessage } from "../../lib/chat-api";
import { streamChat } from "../../lib/chat-api";
import { appendChatMessage, createChat } from "../../lib/api";
import {
  getAgentArchitectureOption,
  type AgentArchitectureOption,
} from "../../lib/agent-architecture-options";
import { getOmniTool } from "../../lib/omni-tools";
import type { OmniRouteId } from "../../lib/omni-tools";
import { ActiveToolChips } from "./ActiveToolChips";
import {
  detectToolFromMessage,
  executionPromptFromHistory,
} from "../../lib/execution-detect";
import { parseSlashCommand } from "../../lib/slash-commands";
import {
  durationHintForMessage,
  type CreativeVideoDurationSec,
} from "../../lib/creative-video-profiles";
import { isSovereignGeneralChatRoute } from "../../lib/tool-routes";
import { previewFromApi, type ExecutionPreviewState } from "../../lib/execution-preview";
import { musicPlayerTrackFromApi } from "../../lib/music-player-types";
import type { MusicPlayerSsePayload } from "../../lib/chat-api";
import { DEMO_VIDEO_MP4 } from "../../lib/demo-media";
import { resolveMediaUrl } from "../../lib/media-url";
import {
  buildPollinationsUrl,
  advanceRenderSession,
  createRenderSession,
  proxiedImageUrl,
  type LiveRenderSession,
} from "../../lib/live-render-pipeline";
import { isImageEditInstruction } from "../../lib/image-prompt-intelligence";
import { VisualContextManager } from "../../lib/visual-context-manager";
import { agentIdForRoute } from "../../lib/tool-routes";
import { uploadVideoSourceFrames } from "../../lib/video-source-api";
import {
  buildActiveVideoSourceFromFile,
  revokeActiveVideoSource,
  type ActiveVideoSourceImage,
} from "../../lib/active-video-source";
import { ChatInput } from "./ChatInput";
import { ChatWorkspace } from "./ChatWorkspace";
import { GeminiCenterComposer } from "./GeminiCenterComposer";
import { DevChatInputDock } from "../ide/workspace/DevChatInputDock";
import type { StagedAttachment } from "../../lib/staged-attachments";
import { toUploadMeta, createStagedAttachment } from "../../lib/staged-attachments";
import { hasRichChatAttachmentPanel } from "../../lib/chat-suggestions";
import { ChatWindow } from "./ChatWindow";
import {
  dispatchOmniTool,
  generateVideo,
  synthesizeImage,
  type OmniToolId,
} from "../../lib/omni-tools-api";
import { runAgentResearch } from "../../lib/agents-research-api";
import { AgentSandboxSplit } from "../layout/AgentSandboxSplit";
import {
  resolveStreamConversationId,
  setRouteConversationId,
} from "../../lib/agent-chat-storage";
import {
  triggerAnalyticsFromChat,
  triggerMedicalFromChat,
} from "../../lib/agent-pipeline-triggers";
import {
  interceptAgentOutput,
  resetStreamAccumulator,
} from "../../lib/agent-output-interceptor";
import { runAgentRuntimeFallback } from "../../lib/agent-runtime-fallback";
import { buildLocalChatFallback } from "../../lib/local-chat-fallback";
import { publishStreamingEvent } from "../../lib/streaming-events";
import { isAgentDrivenDeckRoute } from "../../lib/agent-driven-deck";
import {
  applyWorkbenchStreamToken,
  beginWorkbenchStream,
  endWorkbenchStream,
  pushWorkbenchPreview,
  pushWorkbenchRenderSession,
  pushWorkbenchStatus,
  pushWorkbenchVideoProgress,
} from "../../lib/workbench-live-store";
import { useAgentChatMessages } from "../../hooks/useAgentChatMessages";
import type { SovereignToolSlug } from "../../lib/sovereign-tool-registry";
import {
  appendPromptText,
  UnifiedChatChipsMemo,
} from "../ide/workspace/UnifiedWorkbenchChatLayers";
import { pushWorkbenchDesignPrompt } from "../../lib/workbench-live-store";
import { isDevFileTreeSlug } from "../../lib/dev-file-trees";
import { streamExecuteDevPrompt } from "../../lib/dev-engine-api";
import { sendChat } from "../../lib/omniforge-api";
import { detectRomanLanguage, romanLanguageInstruction } from "../../lib/roman-language";
import { processSpatialDirective, spatialModuleForSlug } from "../../lib/spatial-engine-api";
import {
  setSpatialConfigText,
  applySpatialHybridSync,
  setSpatialSessionId,
  useSpatialRenderMode,
  useSpatialSessionId,
} from "../../lib/spatial-render-store";

const GUEST_ID = "guest-founder";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface OmniChatShellProps {
  routeId: OmniRouteId | string;
  userId?: string;
  conversationId?: string;
  onConversationId?: (id: string) => void;
  showDashboardTools?: boolean;
  /** Workbench embed — hide the narrow live sandbox strip beside chat */
  hideLiveDeck?: boolean;
  /** Drives Live Sandbox header — synced with '+' menu / left nav */
  activeAgent?: AgentArchitectureOption;
  workspaceRouteId?: OmniRouteId | string;
  /** Architect split view — sync chat to Code Bot wizard */
  onUserMessage?: (text: string) => void;
  onAssistantComplete?: (text: string) => void;
  /** Workbench embed — single unified prompt + history (no duplicate ChatInput) */
  workbenchUnified?: boolean;
  toolSlug?: SovereignToolSlug;
  designMode?: boolean;
  /** Dev trio exclusive — Cursor-style premium dock */
  devTrioPremium?: boolean;
  devTrioFileCount?: number;
  onDevTrioReview?: () => void;
  /** Medical diagnostic exclusive — clinical scan dock */
  medicalPremium?: boolean;
  medicalScanCount?: number;
  /** Gemini full-screen paradigm — glass dock + wide stream */
  geminiLayout?: boolean;
  geminiDisplayName?: string;
  /** OmniForge — Postgres-backed project chat via gateway */
  omniforgeProjectId?: string | null;
  omniforgeProviderHint?: string | null;
  omniforgeMode?: "coding" | "terminal" | "vibe";
  onOmniForgeScaffold?: (
    prompt: string,
  ) => Promise<{ path: string; content: string }[]>;
}

export function OmniChatShell({
  routeId,
  userId = GUEST_ID,
  conversationId,
  onConversationId,
  showDashboardTools = false,
  hideLiveDeck = false,
  activeAgent: activeAgentProp,
  workspaceRouteId,
  onUserMessage,
  onAssistantComplete,
  workbenchUnified = false,
  toolSlug,
  designMode = false,
  devTrioPremium = false,
  devTrioFileCount = 0,
  onDevTrioReview,
  medicalPremium = false,
  medicalScanCount = 0,
  geminiLayout = false,
  geminiDisplayName = "Usama",
  omniforgeProjectId = null,
  omniforgeProviderHint = null,
  omniforgeMode = "coding",
  onOmniForgeScaffold,
}: OmniChatShellProps) {
  const premiumDock = devTrioPremium || medicalPremium;
  const resolvedRoute = workspaceRouteId ?? routeId;
  const tool = getOmniTool(resolvedRoute);
  const activeAgent = activeAgentProp ?? getAgentArchitectureOption(resolvedRoute);
  const { messages, setMessages, loadingHistory } = useAgentChatMessages({
    routeId: resolvedRoute,
    userId,
    parentConversationId: conversationId,
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [preview, setPreview] = useState<ExecutionPreviewState | null>(null);
  const [renderSession, setRenderSession] = useState<LiveRenderSession | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<StagedAttachment[]>([]);
  const [activeTool, setActiveTool] = useState<OmniToolId | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [creativeVideoDuration, setCreativeVideoDuration] =
    useState<CreativeVideoDurationSec>(10);
  const [videoPipelineProgress, setVideoPipelineProgress] = useState(0);
  const [videoPipelinePhaseLabel, setVideoPipelinePhaseLabel] = useState<string | undefined>();
  const [activeVideoSourceImage, setActiveVideoSourceImage] =
    useState<ActiveVideoSourceImage | null>(null);
  const activeVideoSourceRef = useRef<ActiveVideoSourceImage | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const spatialRenderMode = useSpatialRenderMode();
  const spatialSessionId = useSpatialSessionId();
  const assistantContentRef = useRef("");
  const streamingIdRef = useRef<string | null>(null);
  const pendingImagesRef = useRef<import("../../lib/execution-preview").GeneratedImageAsset[] | undefined>(
    undefined,
  );
  const suppressTextStreamRef = useRef(false);
  const dockFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!omniforgeProjectId || !devTrioPremium) return;
    let cancelled = false;
    void (async () => {
      try {
        const { fetchOmniForgeChatSeed } = await import("../../lib/omniforge-workspace");
        const items = await fetchOmniForgeChatSeed(omniforgeProjectId);
        if (cancelled || !items.length) return;
        setMessages(
          items.map((m) => ({
            id: uid(),
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        );
      } catch {
        /* history optional on boot */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [devTrioPremium, omniforgeProjectId, setMessages]);

  const showInputAttachmentPanel = hasRichChatAttachmentPanel(resolvedRoute);
  const isStreamingReply = messages.some((m) => m.streaming);
  const geminiEmpty = geminiLayout && !loadingHistory && messages.length === 0;
  const creativeVideoPipelineActive =
    isSovereignGeneralChatRoute(resolvedRoute) && activeTool === "video" && loading;

  activeVideoSourceRef.current = activeVideoSourceImage;

  useEffect(
    () => () => {
      revokeActiveVideoSource(activeVideoSourceRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!creativeVideoPipelineActive) {
      setVideoPipelineProgress(0);
      return;
    }
    setVideoPipelineProgress(6);
    const id = window.setInterval(() => {
      setVideoPipelineProgress((p) => (p >= 92 ? 92 : p + 3 + Math.random() * 4));
    }, 900);
    return () => window.clearInterval(id);
  }, [creativeVideoPipelineActive]);

  useEffect(() => {
    if (!hideLiveDeck) return;
    pushWorkbenchPreview(resolvedRoute, preview);
  }, [hideLiveDeck, resolvedRoute, preview]);

  useEffect(() => {
    if (!hideLiveDeck) return;
    pushWorkbenchRenderSession(resolvedRoute, renderSession);
  }, [hideLiveDeck, resolvedRoute, renderSession]);

  useEffect(() => {
    if (!hideLiveDeck) return;
    pushWorkbenchStatus(resolvedRoute, statusText);
  }, [hideLiveDeck, resolvedRoute, statusText]);

  useEffect(() => {
    if (!hideLiveDeck) return;
    if (videoPipelineProgress > 0) {
      pushWorkbenchVideoProgress(resolvedRoute, videoPipelineProgress, videoPipelinePhaseLabel ?? null);
    }
  }, [hideLiveDeck, resolvedRoute, videoPipelineProgress, videoPipelinePhaseLabel]);

  useEffect(() => {
    if (!hideLiveDeck) return;
    if (streamActive || loading) {
      pushWorkbenchStatus(resolvedRoute, statusText ?? "Streaming response…");
    }
  }, [hideLiveDeck, resolvedRoute, streamActive, loading, statusText]);

  const flushStreamingUi = useCallback(() => {
    const id = streamingIdRef.current;
    if (!id) return;
    const content = assistantContentRef.current;
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content, streaming: true } : m)),
    );
  }, [setMessages]);

  const appendToken = useCallback(
    (assistantId: string, token: string) => {
      streamingIdRef.current = assistantId;
      assistantContentRef.current += token;
      setStreamActive(true);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: assistantContentRef.current, streaming: true }
            : m,
        ),
      );
    },
    [setMessages],
  );

  const startImageRender = useCallback(
    (prompt: string, imageUrl?: string, mode: "generate" | "inpaint" = "generate") => {
    suppressTextStreamRef.current = true;
    const url = proxiedImageUrl(imageUrl ?? buildPollinationsUrl(prompt));
    const session = createRenderSession(prompt, url, {
      mode,
      processState: "WARM-UP",
      sourceImageUrl: mode === "inpaint" ? VisualContextManager.getVisualMedia(userId)?.url : undefined,
    });
    setRenderSession(session);
    setActiveTool("create_image");
    setStatusText("WARM-UP · warming engine…");
    setPreview(
      previewFromApi(
        {
          type: "image",
          image_url: url,
          images: [{ url, alt: prompt }],
          active_tab: "live",
        },
        tool.name,
      ),
    );
  }, [tool.name, userId]);

  const runSpecializedTool = useCallback(
    async (q: string, detected: OmniToolId, execPrompt: string) => {
      const chatAgentId = agentIdForRoute(resolvedRoute);
      VisualContextManager.setActiveChatAgent(userId, chatAgentId);

      if (detected === "create_image") {
        const inpaint = isImageEditInstruction(execPrompt) &&
          Boolean(VisualContextManager.getVisualMedia(userId));
        startImageRender(execPrompt, undefined, inpaint ? "inpaint" : "generate");
        setRenderSession((prev) =>
          prev ? advanceRenderSession(prev, { processState: "BUILD" }) : prev,
        );
        setStatusText(inpaint ? "BUILD · in-painting background…" : "BUILD · generating…");
      } else       if (detected === "video") {
        setActiveTool("video");
        const hasSource = attachedFiles.some((a) => a.kind === "image");
        setStatusText(
          hasSource
            ? `I2V · ${creativeVideoDuration}s — Frame 0 locked to your upload…`
            : `Rendering ${creativeVideoDuration}s cinematic video — please wait…`,
        );
        setVideoPipelineProgress(8);
      } else {
        setActiveTool(detected);
        setStatusText("Warming up…");
        if (detected === "app_build") {
          setPreview(
            previewFromApi({ type: "app_build", active_tab: "code", files: [] }, tool.name),
          );
        }
        if (detected === "architecture") {
          setPreview(
            previewFromApi({ type: "blueprint", active_tab: "blueprint" }, tool.name),
          );
        }
      }

      const uploads = attachedFiles.map(toUploadMeta);
      const imageRefs = uploads.filter((u) => u.kind === "image").map((u) => u.name);
      const videoRefs = uploads.filter((u) => u.kind === "video").map((u) => u.name);
      const audioRefs = uploads.filter((u) => u.kind === "file").map((u) => u.name);
      const fileRefs = uploads.map((u) => ({
        name: u.name,
        kind: u.kind === "image" ? "image" : u.kind === "video" ? "video" : "document",
      }));

      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      if (detected !== "create_image" && detected !== "video") {
        const thinkingSec = detected === "thinking" ? 8 : detected === "deep_research" ? 6 : 4;
        setStatusText(`Thinking for ${thinkingSec} seconds…`);
      }

      const videoMessage =
        detected === "video"
          ? `${execPrompt}\n\n${durationHintForMessage(creativeVideoDuration)}`
          : execPrompt;

      let sourceImageId: string | undefined;
      let initImagePayload: string | undefined = activeVideoSourceImage?.dataUrl;
      const imageAttachments = attachedFiles.filter((a) => a.kind === "image");
      if (detected === "video" && imageAttachments.length > 0) {
        if (!initImagePayload) {
          try {
            const built = await buildActiveVideoSourceFromFile(imageAttachments[0].file);
            setActiveVideoSourceImage((prev) => {
              revokeActiveVideoSource(prev);
              return built;
            });
            initImagePayload = built.dataUrl;
          } catch {
            /* fall through to multipart upload */
          }
        }
        if (!initImagePayload) {
          setStatusText("Uploading source frame for image-to-video lock…");
          try {
            sourceImageId = await uploadVideoSourceFrames(
              userId,
              imageAttachments.map((a) => a.file),
            );
          } catch (uploadErr) {
            const msg =
              uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
            return { text: `**Upload failed:** ${msg}` };
          }
        } else {
          setVideoPipelinePhaseLabel(
            `Frame 0 lock · ${activeVideoSourceImage?.fileName ?? imageAttachments[0].name}`,
          );
        }
      }

      const synthPayload = VisualContextManager.buildSynthesizePayload(
        userId,
        execPrompt,
        chatAgentId,
      );

      const result =
        detected === "video"
          ? await generateVideo(
              {
                user_id: userId,
                message: videoMessage,
                image_refs: imageRefs,
                video_refs: videoRefs,
                audio_refs: audioRefs,
                history,
                agent_id: chatAgentId,
                source_image_id: sourceImageId,
                init_image: initImagePayload,
                init_image_weight: initImagePayload || sourceImageId ? 1 : undefined,
                init_image_locked: Boolean(initImagePayload || sourceImageId),
                clip_guidance_scale: initImagePayload || sourceImageId ? 0.95 : undefined,
                denoising_strength: initImagePayload || sourceImageId ? 0.05 : undefined,
                image_guidance_scale: initImagePayload || sourceImageId ? 0.08 : undefined,
              },
              (msg, pct) => {
                setVideoPipelineProgress(pct);
                setVideoPipelinePhaseLabel(msg);
                setStatusText(msg);
              },
            )
          : detected === "create_image"
            ? await synthesizeImage(synthPayload)
            : detected === "deep_research"
              ? await runAgentResearch({
                  user_id: userId,
                  message: execPrompt,
                  agent_id: chatAgentId,
                  conversation_id: conversationId,
                  images: attachedFiles
                    .filter((a) => a.kind === "image")
                    .map((a) => a.file),
                })
              : await dispatchOmniTool({
                  user_id: userId,
                  message: execPrompt,
                  tool: detected,
                  image_refs: imageRefs,
                  video_refs: videoRefs,
                  audio_refs: audioRefs,
                  file_refs: fileRefs,
                  history,
                  agent_id: chatAgentId,
                });

      if (result.status_steps?.length) {
        setStatusText(result.status_steps.join(" · "));
      } else if (result.status) {
        setStatusText(result.status);
      }

      const rawUrl =
        result.image_url ??
        result.images?.[0]?.url ??
        result.preview?.image_url ??
        buildPollinationsUrl(execPrompt);
      const finalUrl = proxiedImageUrl(rawUrl);

      if (detected === "create_image") {
        const mode =
          (result as { mode?: "generate" | "inpaint" }).mode ??
          (isImageEditInstruction(execPrompt) ? "inpaint" : "generate");
        setRenderSession((prev) =>
          prev
            ? advanceRenderSession(prev, {
                imageUrl: finalUrl,
                thumbnailUrl: finalUrl,
                processState: "FINAL",
                mode,
                contextLabel:
                  mode === "inpaint"
                    ? "In-paint complete · subject preserved"
                    : "Final output render",
              })
            : createRenderSession(execPrompt, finalUrl, {
                processState: "FINAL",
                thumbnailUrl: finalUrl,
                mode,
              }),
        );
        VisualContextManager.setVisualMedia(userId, {
          mediaId: (result as { media_id?: string }).media_id ?? "",
          url: finalUrl,
          prompt: execPrompt,
          subjectHint: (result as { subject_hint?: string }).subject_hint,
          subjectSegmentation:
            (result as { subject_segmentation?: { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number } })
              .subject_segmentation ?? {
              kind: "ellipse",
              cx: 0.5,
              cy: 0.44,
              rx: 0.36,
              ry: 0.4,
            },
          backgroundDescription: mode === "inpaint" ? execPrompt : undefined,
        });
        const gallery =
          result.images?.map((img) => ({
            ...img,
            url: proxiedImageUrl(img.url),
          })) ?? [{ url: finalUrl, alt: q }];
        setPreview(
          previewFromApi(
            {
              type: "image",
              image_url: finalUrl,
              images: gallery,
              active_tab: "live",
            },
            tool.name,
          ),
        );
        setStatusText("FINAL · output ready in Active Render Workspace");
        return {
          text:
            mode === "inpaint"
              ? "**In-paint edit complete.** Subject preserved — see image below."
              : "**Image render complete.** Your generated image is below.",
          images: gallery,
        };
      }

      if (detected === "video") {
        if (result.success === false || (!result.video_url && !result.preview?.video_url)) {
          return {
            text:
              result.error ??
              result.message ??
              "**Video generation failed.** Check backend is running and try again.",
          };
        }
        setRenderSession(null);
        const rawVideo =
          (result as { video_url?: string }).video_url ??
          result.preview?.video_url ??
          DEMO_VIDEO_MP4;
        const videoUrl = resolveMediaUrl(rawVideo);
        const poster = result.preview?.image_url
          ? proxiedImageUrl(result.preview.image_url)
          : undefined;
        setPreview(
          previewFromApi(
            {
              ...(result.preview ?? {}),
              type: "video",
              video_url: videoUrl,
              image_url: poster,
              active_tab: "live",
            },
            tool.name,
          ),
        );
        setVideoPipelineProgress(100);
        setVideoPipelinePhaseLabel(undefined);
        return {
          text:
            result.message ??
            `**${(result as { duration_seconds?: number }).duration_seconds ?? creativeVideoDuration}-second video ready (H.264).** Tap play — allow 1–2 min if still loading.`,
          video_url: videoUrl,
        };
      }

      if (detected === "create_music") {
        const trackRaw =
          (result as { track?: Record<string, unknown> }).track ??
          (result.preview as { track?: Record<string, unknown> } | undefined)?.track;
        const musicTrack = trackRaw ? musicPlayerTrackFromApi(trackRaw) : null;
        if (musicTrack) {
          setPreview(
            previewFromApi(
              {
                type: "audio",
                active_tab: "live",
                track: trackRaw,
                music_track: musicTrack,
              },
              tool.name,
            ),
          );
          return {
            text: result.message ?? `**${musicTrack.title}** — ${musicTrack.artist}`,
            music_track: musicTrack,
          };
        }
      }

      if (result.preview) {
        const previewRaw = { ...result.preview };
        if (previewRaw.image_url) {
          previewRaw.image_url = proxiedImageUrl(previewRaw.image_url);
        }
        if (previewRaw.images) {
          previewRaw.images = previewRaw.images.map((img) => ({
            ...img,
            url: proxiedImageUrl(img.url),
          }));
        }
        setPreview(
          previewFromApi(
            { ...previewRaw, images: result.images ?? previewRaw.images },
            tool.name,
          ),
        );
      }

      return {
        text: result.message ?? result.error ?? "Tool run complete.",
        images: result.images?.map((img) => ({
          ...img,
          url: proxiedImageUrl(img.url),
        })),
      };
    },
    [
      messages,
      resolvedRoute,
      startImageRender,
      tool.name,
      attachedFiles,
      userId,
      creativeVideoDuration,
      activeVideoSourceImage,
    ],
  );

  const handleAttachmentsSelected = useCallback(
    (files: StagedAttachment[]) => {
      const next = [...attachedFiles, ...files].slice(0, 12);
      setAttachedFiles(next);
      triggerMedicalFromChat(resolvedRoute, { files: next, symptomText: input });

      if (isSovereignGeneralChatRoute(resolvedRoute)) {
        const img = files.find((f) => f.kind === "image");
        if (img) {
          void buildActiveVideoSourceFromFile(img.file)
            .then((src) => {
              setActiveVideoSourceImage((prev) => {
                revokeActiveVideoSource(prev);
                return src;
              });
            })
            .catch(() => {
              /* preview optional; submit will retry encode */
            });
        }
      }
    },
    [attachedFiles, input, resolvedRoute],
  );

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachedFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (!next.some((f) => f.kind === "image")) {
        setActiveVideoSourceImage((s) => {
          revokeActiveVideoSource(s);
          return null;
        });
      }
      return next;
    });
  }, []);

  const handleFillSuggestion = useCallback((s: string) => {
    setInput(s);
  }, []);

  const handleWelcomePillSelect = useCallback((label: string) => {
    if (label === "Files") {
      dockFileRef.current?.click();
      return;
    }
    setInput(`Analyze ${label.toLowerCase()}`);
  }, []);

  useEffect(() => {
    if (!workbenchUnified && !geminiLayout) return;
    const onFill = (e: Event) => {
      const detail = (e as CustomEvent<{ text: string; mode?: "append" | "replace" }>).detail;
      if (!detail?.text) return;
      setInput((prev) =>
        detail.mode === "replace" ? detail.text : appendPromptText(prev, detail.text),
      );
    };
    window.addEventListener("omnimind:fill-prompt", onFill);
    return () => window.removeEventListener("omnimind:fill-prompt", onFill);
  }, [workbenchUnified, geminiLayout]);

  const handleUnifiedInputChange = useCallback(
    (value: string) => {
      setInput(value);
      if (designMode) pushWorkbenchDesignPrompt(value);
    },
    [designMode],
  );

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || loading) return;

      onUserMessage?.(q);

      triggerAnalyticsFromChat(resolvedRoute, q);
      triggerMedicalFromChat(resolvedRoute, {
        files: attachedFiles,
        symptomText: q,
      });

      const uploads = attachedFiles.map(toUploadMeta);
      const userMsg: ChatMessage = { id: uid(), role: "user", content: q };
      const historyForDetect = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const slash = parseSlashCommand(q);
      const hasImageAttachment = attachedFiles.some((a) => a.kind === "image");
      let detected =
        slash?.tool ??
        detectToolFromMessage(q, historyForDetect, resolvedRoute, hasImageAttachment);
      const execPrompt = slash?.prompt ?? executionPromptFromHistory(q, historyForDetect);
      const assistantId = uid();
      assistantContentRef.current = "";
      streamingIdRef.current = assistantId;

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);
      setInput("");
      setLoading(true);
      abortRef.current = new AbortController();
      resetStreamAccumulator();
      if (hideLiveDeck) {
        beginWorkbenchStream(resolvedRoute, q);
      }
      interceptAgentOutput(resolvedRoute, "start", { userPrompt: q });

      const isSpatialDesign =
        designMode &&
        toolSlug &&
        (toolSlug === "architectural-designer" || toolSlug === "interior-landscape");

      if (hideLiveDeck && isSpatialDesign && toolSlug) {
        try {
          const payload = await processSpatialDirective({
            execution_type: "ai_agent",
            module: spatialModuleForSlug(toolSlug),
            parameters: {
              prompt: q,
              session_id: spatialSessionId,
              render_settings: { render_mode: spatialRenderMode },
            },
          });
          applySpatialHybridSync(payload);
          setSpatialSessionId(payload.session_id);
          setSpatialConfigText(payload.config_text);
          const nodeCount =
            payload.active_matrix_coordinates.walls.length +
            payload.active_matrix_coordinates.assets.length;
          pushWorkbenchPreview(resolvedRoute, {
            type: "blueprint",
            label: `${payload.module} · ${nodeCount} nodes`,
            active_tab: "live",
          });
          const reply = [
            `**Hybrid spatial directive compiled** · ${payload.module}`,
            `- Matrix nodes: ${nodeCount} (${payload.active_matrix_coordinates.walls.length} walls · ${payload.active_matrix_coordinates.assets.length} assets)`,
            `- Render: ${payload.render_dialog_state.resolution} · ${payload.render_dialog_state.quality_samples} samples`,
            `- Mode: ${payload.render_mode}`,
            `- Timeline: ${payload.render_dialog_state.duration}s scene · ${payload.render_dialog_state.transition}s transitions`,
          ].join("\n");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: reply, streaming: false } : m,
            ),
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: `**Spatial engine:** ${msg}`, streaming: false } : m,
            ),
          );
        } finally {
          setLoading(false);
          setStreamActive(false);
          streamingIdRef.current = null;
          endWorkbenchStream(resolvedRoute);
        }
        return;
      }

      if (hideLiveDeck && toolSlug && isDevFileTreeSlug(toolSlug)) {
        if (omniforgeProjectId) {
          try {
            if (omniforgeMode === "vibe" && onOmniForgeScaffold) {
              const files = await onOmniForgeScaffold(q);
              for (const file of files) {
                window.dispatchEvent(
                  new CustomEvent("omnimind:dev-file-written", {
                    detail: { path: file.path, content: file.content, tool_type: toolSlug },
                  }),
                );
              }
              const reply = [
                `✓ Scaffolded **${files.length}** file(s) via build-engine.`,
                ...files.slice(0, 12).map((f) => `- \`${f.path}\``),
              ].join("\n");
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: reply, streaming: false } : m,
                ),
              );
              onAssistantComplete?.(reply);
            } else {
              const romanPrefix = romanLanguageInstruction(detectRomanLanguage(q));
              const result = await sendChat(
                omniforgeProjectId,
                `${romanPrefix}${q}`,
                omniforgeProviderHint ?? undefined,
              );
              const reply = `**${result.provider}**${result.routing ? ` · ${result.routing}` : ""}\n\n${result.assistant}`;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: reply, streaming: false } : m,
                ),
              );
              onAssistantComplete?.(result.assistant);
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: `**OmniForge:** ${msg}`, streaming: false } : m,
              ),
            );
          } finally {
            setLoading(false);
            setStreamActive(false);
            streamingIdRef.current = null;
            endWorkbenchStream(resolvedRoute);
          }
          return;
        }

        let accumulated = "";
        try {
          await streamExecuteDevPrompt(
            { tool_type: toolSlug, user_prompt: q },
            {
              onToken: (token) => {
                accumulated += token;
                applyWorkbenchStreamToken(resolvedRoute, token, accumulated);
                appendToken(assistantId, token);
              },
              onFileWritten: (file) => {
                window.dispatchEvent(
                  new CustomEvent("omnimind:dev-file-written", { detail: file }),
                );
                pushWorkbenchPreview(resolvedRoute, {
                  type: "app_build",
                  label: file.path,
                  files: [{ path: file.path, content: file.content }],
                  active_tab: "code",
                });
              },
              onDone: () => {
                endWorkbenchStream(resolvedRoute);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: accumulated || "✓ Code patched in sandbox.", streaming: false }
                      : m,
                  ),
                );
              },
              onError: (msg) => {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: `**Dev engine:** ${msg}`, streaming: false }
                      : m,
                  ),
                );
              },
            },
            abortRef.current?.signal,
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: `**Error:** ${msg}`, streaming: false } : m,
            ),
          );
        } finally {
          setLoading(false);
          setStreamActive(false);
          streamingIdRef.current = null;
          endWorkbenchStream(resolvedRoute);
        }
        return;
      }

      if (detected === "video") {
        setActiveTool("video");
        setVideoPipelineProgress(6);
        const trackedName =
          activeVideoSourceImage?.fileName ??
          attachedFiles.find((a) => a.kind === "image")?.name;
        setVideoPipelinePhaseLabel(
          trackedName ? `Frame 0 lock · ${trackedName}` : "Active render · warming pipeline",
        );
        setStatusText(
          trackedName
            ? `I2V · ${creativeVideoDuration}s — init_image: ${trackedName}`
            : `Rendering ${creativeVideoDuration}s cinematic video — please wait…`,
        );
      }

      if (detected) {
        let toolConversationId = resolveStreamConversationId(
          resolvedRoute,
          userId,
          conversationId,
        );
        try {
          if (!toolConversationId) {
            try {
              const created = await createChat({ id: userId }, q.slice(0, 80) || "New Chat");
              toolConversationId = created.id;
              setRouteConversationId(userId, resolvedRoute, created.id);
              if (resolvedRoute === "dashboard") {
                onConversationId?.(created.id);
              }
              notifyChatsUpdated();
            } catch (persistError) {
              console.warn("[OmniMind] Failed to create chat session:", persistError);
            }
          }
          try {
            if (toolConversationId) {
              await appendChatMessage(toolConversationId, {
                role: "user",
                content: q,
                title: q.slice(0, 80) || "New Chat",
              });
            }
          } catch (persistError) {
            console.warn("[OmniMind] Failed to persist user tool message:", persistError);
          }
          const toolResult = await runSpecializedTool(q, detected, execPrompt);
          const toolReply =
            typeof toolResult === "string" ? toolResult : toolResult.text;
          const toolImages =
            typeof toolResult === "string" ? undefined : toolResult.images;
          const toolVideoRaw =
            typeof toolResult === "string" ? undefined : toolResult.video_url;
          const toolVideo = toolVideoRaw ? resolveMediaUrl(toolVideoRaw) : undefined;
          const toolMusic =
            typeof toolResult === "string" ? undefined : toolResult.music_track;
          assistantContentRef.current = toolReply;
          flushStreamingUi();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: toolReply,
                    images: toolImages,
                    image_url: toolImages?.[0]?.url,
                    imageUrl: toolImages?.[0]?.url,
                    file_url: toolImages?.[0]?.url,
                    video_url: toolVideo,
                    music_track: toolMusic,
                    generation_prompt: execPrompt,
                    streaming: false,
                  }
                : m,
            ),
          );
          try {
            if (toolConversationId) {
              await appendChatMessage(toolConversationId, {
                role: "assistant",
                content: toolReply,
                title: q.slice(0, 80) || "New Chat",
              });
              notifyChatsUpdated();
            }
          } catch (persistError) {
            console.warn("[OmniMind] Failed to persist assistant tool message:", persistError);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: `**Error:** ${msg}`, streaming: false }
                : m,
            ),
          );
          if (toolConversationId) {
            try {
              await appendChatMessage(toolConversationId, {
                role: "assistant",
                content: `**Error:** ${msg}`,
                title: q.slice(0, 80) || "New Chat",
              });
              notifyChatsUpdated();
            } catch {
              /* best effort */
            }
          }
          setRenderSession(null);
        } finally {
          setAttachedFiles([]);
          setLoading(false);
          if (detected !== "create_image" && detected !== "video") {
            setStatusText(null);
            setActiveTool(null);
          } else if (detected === "video") {
            setStatusText("Video ready — play in Live Sandbox");
          }
          streamingIdRef.current = null;
        }
        return;
      }

      setActiveTool(null);
      setStatusText(null);
      setRenderSession(null);
      suppressTextStreamRef.current = false;

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let prompt = q;
      if (uploads.length > 0) {
        const names = uploads.map((u) => `${u.kind}:${u.name}`).join(", ");
        prompt = `[Attachments: ${names}]\n${q}`;
      }

      const streamConversationId = resolveStreamConversationId(
        resolvedRoute,
        userId,
        conversationId,
      );

      try {
        let attachmentText: string | undefined;
        const textFiles = attachedFiles.filter(
          (a) => a.kind === "file" && /\.(txt|md|csv|json|log)$/i.test(a.name),
        );
        if (textFiles.length) {
          const chunks = await Promise.all(
            textFiles.map((a) => a.file.text().catch(() => "")),
          );
          const merged = chunks.filter(Boolean).join("\n\n").slice(0, 12000);
          attachmentText = merged || undefined;
        }

        await streamChat(
          {
            message: prompt,
            user_id: userId,
            conversation_id: streamConversationId,
            agent_id: tool.agentId,
            history,
            skip_proactive: true,
            image_context: uploads.filter((u) => u.kind === "image").length
              ? uploads.map((u) => u.name).join(", ")
              : undefined,
            attachment_text: attachmentText,
          },
          {
            onStreamStart: () => setStreamActive(true),
            onToken: (token) => {
              if (suppressTextStreamRef.current) return;
              appendToken(assistantId, token);
              interceptAgentOutput(resolvedRoute, "token", { token, userPrompt: q });
              if (hideLiveDeck) {
                applyWorkbenchStreamToken(
                  resolvedRoute,
                  token,
                  assistantContentRef.current,
                );
              }
            },
            onPreview: (p) => {
              const state = previewFromApi(p as Record<string, unknown>, tool.name);
              if (state.type === "image" || state.images?.length) {
                const url = state.image_url ?? state.images?.[0]?.url;
                if (url) startImageRender(q, url);
              }
              setPreview(state);
              if (state.images?.length) pendingImagesRef.current = state.images;
            },
            onMeta: (meta) => {
              void publishStreamingEvent(userId, "chat.meta", meta as Record<string, unknown>);
              if (typeof meta.status === "string") {
                const tool = meta.tool as string | undefined;
                if (tool === "play_music" || tool === "web_search" || tool === "chat") {
                  setStatusText(String(meta.status));
                }
              }
              const exec = meta.execution_tool as string | undefined;
              if (exec) {
                suppressTextStreamRef.current = true;
                setActiveTool(exec as OmniToolId);
                setStatusText(
                  typeof meta.status === "string"
                    ? meta.status
                    : `Executing ${exec}…`,
                );
                if (exec === "create_image") startImageRender(execPrompt);
              }
            },
            onMusicPlayer: (payload: MusicPlayerSsePayload) => {
              setStatusText(payload.cached ? "Playing (cached)…" : "Starting playback…");
              const track =
                musicPlayerTrackFromApi(payload.track ?? payload) ??
                musicPlayerTrackFromApi({
                  title: payload.title ?? payload.song_name,
                  artist: payload.artist ?? "",
                  album_image_url: payload.album_image_url ?? "",
                  audio_stream_url: payload.audio_stream_url ?? "",
                  success: payload.success,
                });
              flushStreamingUi();
              setStreamActive(false);
              if (track?.audioUrl) {
                  setPreview(
                    previewFromApi(
                      {
                        type: "audio",
                        active_tab: "live",
                        music_track: track,
                        track: payload.track ?? track,
                      },
                      tool.name,
                    ),
                  );
                  const reply =
                    payload.success === false
                      ? `Could not play **${payload.song_name}**.`
                      : `**${track.title}** — ${track.artist}\n\nPlaying now.`;
                  assistantContentRef.current = reply;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: reply, music_track: track, streaming: false }
                      : m,
                  ),
                );
              }
            },
            onEngineSecure: () => {
              setStatusText(null);
            },
            onEngineDegraded: () => {
              const fallback = buildLocalChatFallback(q, resolvedRoute);
              flushStreamingUi();
              setStreamActive(false);
              assistantContentRef.current = fallback;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: fallback, streaming: false }
                    : m,
                ),
              );
            },
            onError: (err) => {
              interceptAgentOutput(resolvedRoute, "engine_failure", { userPrompt: q });
              if (hideLiveDeck) {
                endWorkbenchStream(resolvedRoute);
              }
              runAgentRuntimeFallback(resolvedRoute, q);
              flushStreamingUi();
              setStreamActive(false);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: err, streaming: false }
                    : m,
                ),
              );
              setRenderSession(null);
            },
            onDone: (convId) => {
              interceptAgentOutput(resolvedRoute, "done", { userPrompt: q });
              if (hideLiveDeck) {
                endWorkbenchStream(resolvedRoute);
              }
              flushStreamingUi();
              setRouteConversationId(userId, resolvedRoute, convId);
              if (resolvedRoute === "dashboard") {
                onConversationId?.(convId);
              }
              notifyChatsUpdated();
              setStreamActive(false);
              const imgs = pendingImagesRef.current;
              pendingImagesRef.current = undefined;
              const proxiedImgs = imgs?.map((img) => ({
                ...img,
                url: proxiedImageUrl(img.url),
              }));
              const short =
                proxiedImgs?.length && renderSession
                  ? "**Image render complete.** Your generated image is below."
                  : undefined;
              setMessages((prev) => {
                const next = prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        streaming: false,
                        images: proxiedImgs ?? m.images,
                        image_url: proxiedImgs?.[0]?.url ?? m.image_url,
                        imageUrl: proxiedImgs?.[0]?.url ?? m.imageUrl,
                        file_url: proxiedImgs?.[0]?.url ?? m.file_url,
                        content: short ?? m.content,
                      }
                    : m,
                );
                const assistantText =
                  assistantContentRef.current ||
                  next.find((m) => m.id === assistantId)?.content ||
                  "";
                if (assistantText.trim()) {
                  onAssistantComplete?.(assistantText);
                }
                return next;
              });
              streamingIdRef.current = null;
            },
          },
          abortRef.current.signal,
        );
      } finally {
        setStreamActive(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && m.streaming ? { ...m, streaming: false } : m,
          ),
        );
        setAttachedFiles([]);
        setLoading(false);
        if (!renderSession) {
          setActiveTool(null);
          setStatusText(null);
        }
        streamingIdRef.current = null;
      }
    },
    [
      activeTool,
      appendToken,
      conversationId,
      flushStreamingUi,
      loading,
      messages,
      onAssistantComplete,
      onConversationId,
      onUserMessage,
      renderSession,
      resolvedRoute,
      runSpecializedTool,
      setMessages,
      startImageRender,
      tool.agentId,
      attachedFiles,
      activeVideoSourceImage,
      userId,
      conversationId,
      creativeVideoDuration,
      hideLiveDeck,
      toolSlug,
      designMode,
      spatialSessionId,
      spatialRenderMode,
      omniforgeProjectId,
      omniforgeProviderHint,
      omniforgeMode,
      onOmniForgeScaffold,
    ],
  );

  return (
    <AgentSandboxSplit
      activeAgent={activeAgent}
      activeAgentSlot={resolvedRoute}
      showLiveDeck={!hideLiveDeck}
      preview={preview}
      renderSession={renderSession}
      creativeVideoDuration={creativeVideoDuration}
      onCreativeVideoDurationChange={
        isSovereignGeneralChatRoute(resolvedRoute) ? setCreativeVideoDuration : undefined
      }
      creativeVideoPipelineActive={creativeVideoPipelineActive}
      creativeVideoPipelineProgress={videoPipelineProgress}
      creativeVideoSourceFileName={activeVideoSourceImage?.fileName ?? null}
      creativeVideoSourcePreviewUrl={activeVideoSourceImage?.objectUrl ?? null}
      creativeVideoPipelinePhaseLabel={videoPipelinePhaseLabel}
      onRenderClose={() => {
        setRenderSession(null);
        suppressTextStreamRef.current = false;
        setStatusText(null);
        setActiveTool(null);
      }}
      onRenderComplete={() => setStatusText("Final output ready")}
    >
      <section
        className={
          geminiLayout
            ? "relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#0f0f11] text-[#e3e3e3]"
            : "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        }
      >
        {!workbenchUnified ? <ActiveToolChips activeTool={activeTool} statusText={statusText} /> : null}

        {geminiLayout ? (
          <>
            <input
              ref={dockFileRef}
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []).map((file) =>
                  createStagedAttachment(file, "file"),
                );
                if (picked.length) handleAttachmentsSelected(picked);
                e.target.value = "";
              }}
            />
            {loadingHistory && messages.length === 0 ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-neutral-500">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-600 border-t-white" />
                <p className="text-xs">Loading conversation…</p>
              </div>
            ) : (
              <ChatWorkspace
                isEmpty={geminiEmpty}
                onPillSelect={handleWelcomePillSelect}
                founderName={geminiDisplayName === "Usama" ? "Usama Haseen" : geminiDisplayName}
                messageStream={
                  <ChatWindow
                    routeId={resolvedRoute}
                    messages={messages}
                    onFillSuggestion={handleFillSuggestion}
                    onRegenerate={(prompt) => void send(prompt)}
                    loadingHistory={loadingHistory}
                    streamActive={streamActive || isStreamingReply}
                    userId={userId}
                    onArchitectPreview={setPreview}
                    onArchitectAction={(step, optionId) =>
                      handleFillSuggestion(`[Architect step ${step}] ${optionId}`)
                    }
                    workbenchUnified={workbenchUnified}
                    geminiLayout={geminiLayout}
                    geminiDisplayName={geminiDisplayName}
                  />
                }
                composer={
                  <GeminiCenterComposer
                    value={input}
                    onChange={setInput}
                    onSubmit={() => void send(input)}
                    onStop={() => abortRef.current?.abort()}
                    loading={loading}
                    variant="clean"
                    placeholder="Message OmniMind..."
                    commandMenuEnabled={showDashboardTools || showInputAttachmentPanel}
                    stagedAttachments={attachedFiles}
                    onAttachmentsSelected={handleAttachmentsSelected}
                    onRemoveAttachment={handleRemoveAttachment}
                  />
                }
              />
            )}
          </>
        ) : (
        <div
          className={
            workbenchUnified
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "flex min-h-0 flex-1 flex-col overflow-hidden px-3 md:px-5"
          }
        >
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            <ChatWindow
              routeId={resolvedRoute}
              messages={messages}
              onFillSuggestion={handleFillSuggestion}
              onRegenerate={(prompt) => void send(prompt)}
              loadingHistory={loadingHistory}
              streamActive={streamActive || isStreamingReply}
              userId={userId}
              onArchitectPreview={setPreview}
              onArchitectAction={(step, optionId) =>
                handleFillSuggestion(`[Architect step ${step}] ${optionId}`)
              }
              workbenchUnified={workbenchUnified}
              geminiLayout={geminiLayout}
              geminiDisplayName={geminiDisplayName}
            />
          </div>

          <div
            className={
              premiumDock
                ? "shrink-0"
                : "shrink-0 bg-gradient-to-t from-[var(--omni-bg)] via-[var(--omni-bg)] to-transparent px-1 pb-4 pt-2"
            }
          >
            {workbenchUnified && !premiumDock ? (
              <UnifiedChatChipsMemo
                toolSlug={toolSlug ?? resolvedRoute}
                routeId={resolvedRoute}
                onFill={(text, mode) => {
                  setInput((prev) => (mode === "replace" ? text : appendPromptText(prev, text)));
                }}
              />
            ) : null}
            {premiumDock ? (
              <>
                {workbenchUnified ? (
                  <div className="border-t border-slate-800/80 px-2 pt-2">
                    <UnifiedChatChipsMemo
                      toolSlug={toolSlug ?? resolvedRoute}
                      routeId={resolvedRoute}
                      onFill={(text, mode) => {
                        setInput((prev) => (mode === "replace" ? text : appendPromptText(prev, text)));
                      }}
                    />
                  </div>
                ) : null}
                <DevChatInputDock
                  value={input}
                  onChange={handleUnifiedInputChange}
                  onSubmit={() => void send(input)}
                  onStop={() => abortRef.current?.abort()}
                  loading={loading}
                  fileCount={devTrioPremium ? devTrioFileCount : medicalScanCount}
                  onReview={devTrioPremium ? onDevTrioReview : undefined}
                  showReviewChip={devTrioPremium}
                  placeholder={
                    medicalPremium
                      ? "Analyze scan, generate clinical report, or ask @for context..."
                      : undefined
                  }
                  fileCountLabel={medicalPremium ? (count) => `> ${count} Scans` : undefined}
                  commandMenuEnabled={showDashboardTools || showInputAttachmentPanel}
                  stagedAttachments={attachedFiles}
                  onAttachmentsSelected={handleAttachmentsSelected}
                  onRemoveAttachment={handleRemoveAttachment}
                />
              </>
            ) : (
              <div>
                <ChatInput
                  value={input}
                  onChange={workbenchUnified ? handleUnifiedInputChange : setInput}
                  onSubmit={() => void send(input)}
                  onStop={() => abortRef.current?.abort()}
                  loading={loading}
                  commandMenuEnabled={showDashboardTools || showInputAttachmentPanel}
                  stagedAttachments={attachedFiles}
                  onAttachmentsSelected={handleAttachmentsSelected}
                  onRemoveAttachment={handleRemoveAttachment}
                  variant="floating"
                />
              </div>
            )}
          </div>
        </div>
        )}
      </section>
    </AgentSandboxSplit>
  );
}
