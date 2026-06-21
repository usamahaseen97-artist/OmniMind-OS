"use client";

import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

interface AuthButtonProps {
  onUserChange: (userId: string | null, email?: string) => void;
}

export function AuthButton({ onUserChange }: AuthButtonProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setEmail(user?.email ?? null);
      onUserChange(user?.id ?? null, user?.email);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const user = session?.user;
      setEmail(user?.email ?? null);
      onUserChange(user?.id ?? null, user?.email);
    });
    return () => sub.subscription.unsubscribe();
  }, [onUserChange]);

  if (!isSupabaseConfigured()) {
    return (
      <span className="text-[10px] text-zinc-600">Guest mode · set Supabase env for auth</span>
    );
  }

  const signInGoogle = async () => {
    setLoading(true);
    await supabase!.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    setLoading(false);
  };

  const signOut = async () => {
    await supabase!.auth.signOut();
    onUserChange(null);
  };

  if (email) {
    return (
      <button
        type="button"
        onClick={signOut}
        className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-neon-green"
      >
        <LogOut className="h-3 w-3" />
        {email.split("@")[0]}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={signInGoogle}
      className="flex items-center gap-1.5 rounded-lg border border-neon-green/30 px-2 py-1 text-[10px] text-neon-green hover:bg-neon-green/10"
    >
      <LogIn className="h-3 w-3" />
      Google Login
    </button>
  );
}
