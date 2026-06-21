"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Paperclip, Send, Sparkles } from "lucide-react";
import type { DevTrioSlug } from "../../../../lib/dev-trio";
import { OMNIFORGE_API_BASE, streamChat } from "../../../../lib/omniforge-api";
import { fetchOmniForgeChatSeed, useOmniForgeWorkspaceOptional } from "../../../../lib/omniforge-workspace";
import { detectRomanLanguage, romanLanguageInstruction } from "../../../../lib/roman-language";
import type { OmniForgeForgeControls } from "../../workspace/DevOmniChatConsole";
import { useIDE } from "../../IDEProvider";
import { useOmniForgeShell } from "../../../../lib/omniforge-shell-context";
import { GlassChip, GlassSection } from "./ui/GlassSection";
import { OF, purpleFocusRing } from "./omniforge-theme";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  provider?: string;
};

const AGENTS = ["OmniMind Core", "Scaffold Agent", "Debug Agent", "Refactor Agent", "Deploy Agent"] as const;

const MACROS = [
  { id: "build", label: "Build", text: "Scaffold a complete production app for this workspace.", mode: "build" as const },
  { id: "fix", label: "Fix Errors", text: "Analyze and fix all errors in the workspace.", mode: "build" as const },
  { id: "explain", label: "Explain Code", text: "Explain the currently selected file and its role in the project.", mode: "chat" as const },
  { id: "component", label: "Generate Component", text: "Generate a new UI component based on my next message.", mode: "build" as const },
  { id: "refactor", label: "Refactor", text: "Refactor the selected file for clarity and maintainability.", mode: "chat" as const },
  { id: "optimize", label: "Optimize", text: "Optimize performance of the current codebase.", mode: "chat" as const },
  { id: "deploy", label: "Deploy", text: "Prepare production deployment configuration and scripts.", mode: "build" as const },
] as const;

const QUICK_CHIPS = [
  { label: "Build Feature", text: "Build a new feature for this project." },
  { label: "Fix Bug", text: "Find and fix bugs in the workspace." },
  { label: "Explain", text: "Explain the architecture of this project." },
  { label: "Generate UI", text: "Generate a modern responsive UI screen." },
  { label: "Optimize", text: "Optimize bundle size and runtime performance." },
  { label: "Refactor", text: "Refactor code structure without changing behavior." },
] as const;

function uid() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Section 4 — AI Agent (20%) */
export function OmniForgeCommsConsole({
  toolSlug,
  forgeControls,
}: {
  toolSlug: DevTrioSlug;
  forgeControls: OmniForgeForgeControls;
}) {
  const omniforge = useOmniForgeWorkspaceOptional();
  const { appendTerminal, mergeGenerated, projectFiles, selectedFile } = useIDE();
  const { targetStack, useFreeOpenSourcePipeline } = useOmniForgeShell();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [agent, setAgent] = useState<(typeof AGENTS)[number]>("OmniMind Core");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const providerHint = forgeControls.providerKey.trim()
    ? "openai"
    : useFreeOpenSourcePipeline
      ? "free"
      : forgeControls.modelLayer === "Local GPU"
        ? "local"
        : "auto";

  useEffect(() => {
    scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight);
  }, [messages]);

  const runBuild = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sending || !omniforge) return;

      const assistantId = uid();
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content: text },
        { id: assistantId, role: "assistant", content: "", streaming: true, provider: "scaffold" },
      ]);
      setInput("");
      setSending(true);

      try {
        if (omniforge.status !== "ready") throw new Error(`Offline — ${OMNIFORGE_API_BASE}`);
        appendTerminal(`▸ ${text.slice(0, 72)}…`);
        const files = await omniforge.runScaffold(text, {
          mode: forgeControls.mode,
          modelLayer: forgeControls.modelLayer,
          githubRepo: forgeControls.githubRepo || undefined,
          targetStack,
          onFile: (file, _all, meta) => {
            appendTerminal(`  ↳ ${meta.index + 1}/${meta.total} · ${file.path}`);
            window.dispatchEvent(new CustomEvent("omnimind:omniforge-preview-refresh"));
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: `Streaming ${meta.index + 1}/${meta.total} files…\n· ${file.path}`,
                    }
                  : m,
              ),
            );
          },
        });
        if (files.length) {
          mergeGenerated(files);
          appendTerminal(`✓ ${files.length} file(s)`);
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: files.length
                    ? `Generated ${files.length} file(s):\n${files.map((f) => `· ${f.path}`).join("\n")}`
                    : "Scaffold returned no files.",
                  streaming: false,
                }
              : m,
          ),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed";
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: msg, streaming: false } : m)));
      } finally {
        setSending(false);
      }
    },
    [appendTerminal, forgeControls, mergeGenerated, omniforge, sending, targetStack],
  );

  useEffect(() => {
    if (!omniforge?.projectId || omniforge.status !== "ready" || historyLoaded) return;
    void (async () => {
      try {
        const items = await fetchOmniForgeChatSeed(omniforge.projectId!);
        if (items.length) {
          setMessages(
            items.map((m, i) => ({
              id: `hist-${i}`,
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
              provider: m.provider,
            })),
          );
        }
      } catch {
        /* empty */
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, [historyLoaded, omniforge?.projectId, omniforge?.status]);

  useEffect(() => {
    const onQuick = (e: Event) => {
      const detail = (e as CustomEvent<{ prompt: string }>).detail;
      if (detail?.prompt) void runBuild(detail.prompt);
    };
    window.addEventListener("omnimind:omniforge-quick-scaffold", onQuick);
    return () => window.removeEventListener("omnimind:omniforge-quick-scaffold", onQuick);
  }, [runBuild]);

  const runChat = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sending) return;

      const assistantId = uid();
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content: text },
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);
      setInput("");
      setSending(true);
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const contextLine = selectedFile ? `\n[Context: ${selectedFile.path}]\n` : "";
      const roman = romanLanguageInstruction(detectRomanLanguage(text));
      const payload = `${roman ?? ""}${contextLine}${text}`;

      try {
        if (!omniforge?.projectId || omniforge.status !== "ready") throw new Error(`Offline — ${OMNIFORGE_API_BASE}`);
        await streamChat(
          omniforge.projectId,
          payload,
          {
            onToken: (token) =>
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m)),
              ),
            onDone: ({ provider }) =>
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, provider, streaming: false } : m)),
              ),
            onError: (message) =>
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: message, streaming: false } : m)),
              ),
          },
          providerHint,
          ac.signal,
          useFreeOpenSourcePipeline,
        );
      } catch (err) {
        if (!ac.signal.aborted) {
          const msg = err instanceof Error ? err.message : "Chat failed";
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: msg, streaming: false } : m)));
        }
      } finally {
        setSending(false);
      }
    },
    [omniforge?.projectId, omniforge?.status, providerHint, selectedFile, sending, useFreeOpenSourcePipeline],
  );

  const dispatch = useCallback(
    (text: string, mode: "build" | "chat") => {
      if (mode === "build" || forgeControls.mode === "vibe") void runBuild(text);
      else void runChat(text);
    },
    [forgeControls.mode, runBuild, runChat],
  );

  const submit = () => {
    if (!input.trim()) return;
    dispatch(input, forgeControls.mode === "vibe" ? "build" : "chat");
  };

  return (
    <GlassSection
      title="AI Agent"
      subtitle={toolSlug}
      actions={
        <select
          value={agent}
          onChange={(e) => setAgent(e.target.value as (typeof AGENTS)[number])}
          className="rounded-md border px-1.5 py-0.5 text-[8px] outline-none"
          style={{ background: OF.inputBg, borderColor: OF.border, color: OF.text }}
        >
          {AGENTS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      }
      noPad
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={scrollRef} className="ide-pane-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {!messages.length ? (
            <div className="rounded-lg border p-3 text-[10px] leading-relaxed" style={{ borderColor: OF.border, background: "rgba(255,255,255,0.02)", color: OF.textMuted }}>
              <Sparkles className="mb-2 h-4 w-4" style={{ color: OF.cyan }} />
              Agent ready. Selected file context: {selectedFile?.path ?? "none"}.
            </div>
          ) : null}
          {messages.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border px-2.5 py-2 text-[11px] leading-relaxed"
              style={{
                borderColor: m.role === "user" ? OF.purpleBorder : OF.border,
                background: m.role === "user" ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
                color: OF.text,
              }}
            >
              {m.streaming && !m.content ? (
                <span className="flex items-center gap-2" style={{ color: OF.textMuted }}>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Working…
                </span>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t p-2" style={{ borderColor: OF.glassBorder, background: "rgba(0,0,0,0.25)" }}>
          <div className="mb-2 flex flex-wrap gap-1">
            {QUICK_CHIPS.map((c) => (
              <GlassChip key={c.label} disabled={sending} onClick={() => dispatch(c.text, "build")}>
                {c.label}
              </GlassChip>
            ))}
          </div>
          <div className="mb-2 flex flex-wrap gap-1">
            {MACROS.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={sending}
                onClick={() => dispatch(m.text, m.mode)}
                className="rounded-md border px-2 py-0.5 text-[8px] font-semibold uppercase disabled:opacity-40"
                style={{ borderColor: OF.border, color: OF.cyan }}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div
            className="flex items-end gap-2 rounded-xl border p-2"
            style={{ ...purpleFocusRing(Boolean(input)), background: OF.inputBg }}
          >
            <button type="button" className="shrink-0 p-1" style={{ color: OF.textMuted }} aria-label="Attach context">
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={2}
              placeholder="Plan, @ for context, / for commands…"
              className="max-h-24 min-h-[2.5rem] flex-1 resize-none bg-transparent text-[11px] outline-none"
              style={{ color: OF.text }}
              disabled={sending}
            />
            <button
              type="button"
              onClick={submit}
              disabled={sending || !input.trim()}
              className="shrink-0 rounded-lg p-2 transition disabled:opacity-40"
              style={{ background: OF.indigoSolid, color: "#fff" }}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-[8px]" style={{ color: OF.textMuted }}>
            {projectFiles.filter((f) => !f.isFolder).length} files · {agent} · {omniforge?.status ?? "…"}
          </p>
        </div>
      </div>
    </GlassSection>
  );
}
