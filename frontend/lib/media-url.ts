/** Turn backend-relative media paths into browser-playable URLs. */
import { normalizeBackendResourceUrl, resolveApiBaseUrl } from "./api-config";

export function resolveMediaUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return normalizeBackendResourceUrl(pathOrUrl);
  }
  if (pathOrUrl.startsWith("blob:") || pathOrUrl.startsWith("data:")) {
    return pathOrUrl;
  }
  if (pathOrUrl.startsWith("/omni-api")) return pathOrUrl;
  if (pathOrUrl.startsWith("/api/media/video/")) return pathOrUrl;

  const generated = pathOrUrl.match(
    /\/api\/v1\/tools\/media\/generated\/([0-9a-f-]+\.mp4)$/i,
  );
  if (generated) {
    return `/api/media/video/${generated[1]}`;
  }

  const generatedImg = pathOrUrl.match(
    /\/api\/v1\/tools\/media\/generated-image\/([0-9a-f-]+\.(?:png|jpg|jpeg|webp))$/i,
  );
  if (generatedImg) {
    return `/omni-api/api/v1/tools/media/generated-image/${generatedImg[1]}`;
  }

  const sourceFrame = pathOrUrl.match(
    /\/api\/v1\/tools\/media\/source-frame\/([0-9a-f\-]+)$/i,
  );
  if (sourceFrame) {
    return `/omni-api/api/v1/tools/media/source-frame/${sourceFrame[1]}`;
  }

  if (pathOrUrl.startsWith("/api/")) {
    return `/omni-api${pathOrUrl}`;
  }
  const base = resolveApiBaseUrl();
  return normalizeBackendResourceUrl(
    `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`,
  );
}
