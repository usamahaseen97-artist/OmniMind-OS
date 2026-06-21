"use client";

import { Github, LogIn, LogOut, Server } from "lucide-react";
import { useCallback, useState } from "react";
import {
  clearTokens,
  getGitHubLoginUrl,
  login,
  OMNIFORGE_API_BASE,
} from "../../../lib/omniforge-api";
import { useOmniForgeWorkspaceOptional } from "../../../lib/omniforge-workspace";

export function OmniForgeSessionBar() {
  const workspace = useOmniForgeWorkspaceOptional();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const statusLabel =
    workspace?.status === "ready"
      ? `Project ${workspace.projectId?.slice(0, 8)}…`
      : workspace?.status === "offline"
        ? "Gateway offline · local dev engine"
        : workspace?.status === "connecting"
          ? "Connecting…"
          : workspace?.error ?? "Session error";

  const onGitHub = useCallback(async () => {
    setBusy(true);
    try {
      const url = await getGitHubLoginUrl();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }, []);

  const onLogin = useCallback(async () => {
    if (!email || !password) return;
    setBusy(true);
    try {
      await login(email, password);
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }, [email, password]);

  const onLogout = useCallback(() => {
    clearTokens();
    window.location.reload();
  }, []);

  return (
    <div className="mt-2 space-y-2 border-t border-white/5 pt-2">
      <div className="flex items-center gap-1.5 text-[8px]" style={{ color: "var(--omni-text-muted)" }}>
        <Server className="h-3 w-3 shrink-0" />
        <span className="truncate">{statusLabel}</span>
        <span className="ml-auto shrink-0 opacity-60">{OMNIFORGE_API_BASE.replace(/^https?:\/\//, "")}</span>
      </div>

      {showLogin ? (
        <div className="space-y-1">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] outline-none"
          />
          <button
            type="button"
            disabled={busy}
            onClick={onLogin}
            className="w-full rounded bg-cyan-500/20 px-2 py-1 text-[9px] text-cyan-300"
          >
            Sign in
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-1 rounded px-2 py-1 text-[9px] text-gray-400 hover:bg-white/5"
          >
            <LogIn className="h-3 w-3" />
            Account
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onGitHub}
            className="flex items-center gap-1 rounded px-2 py-1 text-[9px] text-gray-400 hover:bg-white/5"
          >
            <Github className="h-3 w-3" />
            GitHub
          </button>
          {workspace?.authenticated ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1 rounded px-2 py-1 text-[9px] text-gray-500 hover:bg-white/5"
            >
              <LogOut className="h-3 w-3" />
              Logout
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
