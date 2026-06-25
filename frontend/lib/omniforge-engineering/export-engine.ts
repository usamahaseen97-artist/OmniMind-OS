import type { GeneratedFileAsset } from "../execution-preview";
import type { ExportFormat } from "./types";

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]!;
    for (let j = 0; j < 8; j++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(n: number) {
  return new Uint8Array([n & 0xff, (n >> 8) & 0xff]);
}

function u32(n: number) {
  return new Uint8Array([n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff]);
}

/** Stored (no compression) ZIP — sufficient for text project export without extra deps. */
export function buildZipBlob(files: GeneratedFileAsset[]): Blob {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    if (file.isFolder || file.path.startsWith(".omniforge/")) continue;
    const nameBytes = enc.encode(file.path.replace(/\\/g, "/"));
    const data = enc.encode(file.content ?? "");
    const crc = crc32(data);
    const localHeader = new Uint8Array([
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(nameBytes.length),
      ...u16(0),
      ...nameBytes,
      ...data,
    ]);
    parts.push(localHeader);

    const centralHeader = new Uint8Array([
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(nameBytes.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
      ...nameBytes,
    ]);
    central.push(centralHeader);
    offset += localHeader.length;
  }

  const centralSize = central.reduce((s, c) => s + c.length, 0);
  const end = new Uint8Array([
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(central.length),
    ...u16(central.length),
    ...u32(centralSize),
    ...u32(offset),
    ...u16(0),
  ]);

  const totalLen = parts.reduce((s, p) => s + p.length, 0) + centralSize + end.length;
  const out = new Uint8Array(totalLen);
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  for (const c of central) {
    out.set(c, pos);
    pos += c.length;
  }
  out.set(end, pos);
  return new Blob([out], { type: "application/zip" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsZip(files: GeneratedFileAsset[], projectName: string) {
  const blob = buildZipBlob(files);
  downloadBlob(blob, `${sanitizeFilename(projectName)}.zip`);
}

export function exportAsGitBundle(files: GeneratedFileAsset[], projectName: string) {
  const readme = files.find((f) => f.path === "README.md")?.content ?? "# Project\n";
  const gitignore = `node_modules/\n.next/\n.env\n__pycache__/\n`;
  const bundle = [
    ...files.filter((f) => !f.path.startsWith(".omniforge/")),
    { path: ".gitignore", content: gitignore, language: "plaintext" },
    { path: "README.md", content: readme, language: "markdown" },
  ];
  exportAsZip(bundle, `${sanitizeFilename(projectName)}-git-ready`);
}

export function exportAsDockerProject(files: GeneratedFileAsset[], projectName: string) {
  const dockerfile = `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD ["npm","start"]\n`;
  const compose = `services:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    env_file:\n      - .env\n`;
  const bundle = [
    ...files.filter((f) => !f.path.startsWith(".omniforge/")),
    { path: "Dockerfile", content: dockerfile, language: "dockerfile" },
    { path: "docker-compose.yml", content: compose, language: "yaml" },
  ];
  exportAsZip(bundle, `${sanitizeFilename(projectName)}-docker`);
}

export function exportProductionBuild(files: GeneratedFileAsset[], projectName: string) {
  const prod = files.filter(
    (f) =>
      !f.path.startsWith(".omniforge/") &&
      !f.path.includes("node_modules") &&
      !/\.(test|spec)\./.test(f.path),
  );
  exportAsZip(prod, `${sanitizeFilename(projectName)}-production`);
}

export function runExport(format: ExportFormat, files: GeneratedFileAsset[], projectName: string) {
  switch (format) {
    case "zip":
      exportAsZip(files, projectName);
      break;
    case "git":
      exportAsGitBundle(files, projectName);
      break;
    case "docker":
      exportAsDockerProject(files, projectName);
      break;
    case "production":
      exportProductionBuild(files, projectName);
      break;
  }
}

function sanitizeFilename(name: string): string {
  return (name || "omniforge-project").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
}
