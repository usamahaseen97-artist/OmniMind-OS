/**
 * Secure session token storage — access tokens only in sessionStorage.
 * Refresh tokens must remain httpOnly cookies (server-side architecture).
 * Never log or expose token values.
 */

const ACCESS_KEY = "omnimind:access-token";

export const secureSession = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(ACCESS_KEY);
    } catch {
      return null;
    }
  },

  setAccessToken(token: string) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(ACCESS_KEY, token);
  },

  clearAccessToken() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(ACCESS_KEY);
  },

  hasSession() {
    return !!this.getAccessToken();
  },
};
