import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  return { user, setUser, isAuthenticated: Boolean(user) };
}
