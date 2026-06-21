/** Map legacy `/dashboard` paths to the App Router home (`/`). */
export function normalizeHomeRoute(route: string): string {
  if (!route || route === "/dashboard") return "/";
  if (route.startsWith("/dashboard?")) {
    return `/${route.slice("/dashboard".length)}`;
  }
  if (route.startsWith("/dashboard/")) {
    const rest = route.slice("/dashboard".length);
    return rest.length ? rest : "/";
  }
  return route;
}
