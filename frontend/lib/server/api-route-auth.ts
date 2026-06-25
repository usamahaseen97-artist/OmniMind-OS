import { NextResponse } from "next/server";

/**
 * Guard server-side execution/deploy API routes.
 * Accepts OMNIMIND_INTERNAL_API_SECRET via X-OmniMind-Api-Key or Bearer token.
 */
export function requireInternalApiAuth(req: Request): NextResponse | null {
  const secret = process.env.OMNIMIND_INTERNAL_API_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "development") return null;
    return NextResponse.json(
      { error: "OMNIMIND_INTERNAL_API_SECRET is not configured" },
      { status: 503 },
    );
  }

  const headerKey = req.headers.get("x-omnimind-api-key")?.trim();
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const token = headerKey || bearer;

  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
