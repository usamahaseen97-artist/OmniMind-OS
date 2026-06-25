"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { setTokens } from "../../../lib/omniforge-api";

function AuthCallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    if (!access) {
      setError("Missing access token from OAuth callback.");
      return;
    }
    setTokens(access, refresh);
    router.replace("/omniforge-engine");
  }, [params, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-red-400">
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-cyan-300">
      <p>Signing you in…</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-cyan-300">
          <p>Signing you in…</p>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
