/** Polyglot plugin registry — languages, domains, build profiles (mirrors backend). */

export type LanguageId =
  | "html" | "css" | "javascript" | "typescript" | "python" | "c" | "cpp" | "csharp"
  | "java" | "kotlin" | "swift" | "dart" | "php" | "go" | "rust" | "ruby" | "lua" | "r" | "sql" | "bash" | "powershell";

export type DomainId =
  | "web_saas" | "web_ecommerce" | "web_portfolio" | "mobile_android" | "mobile_ios" | "mobile_flutter"
  | "desktop_win" | "desktop_mac" | "desktop_linux" | "game_2d" | "game_3d" | "microservice"
  | "data_science" | "browser_extension" | "enterprise";

export type LanguagePlugin = {
  id: LanguageId;
  label: string;
  extensions: string[];
  monacoId: string;
  compileCmd?: string;
  runCmd?: string;
};

export type DomainProfile = {
  id: DomainId;
  label: string;
  defaultLanguages: LanguageId[];
  scaffoldAdapter: string;
  previewMode: string;
};

export const LANGUAGE_PLUGINS: Record<LanguageId, LanguagePlugin> = {
  html: { id: "html", label: "HTML", extensions: [".html", ".htm"], monacoId: "html" },
  css: { id: "css", label: "CSS", extensions: [".css", ".scss"], monacoId: "css" },
  javascript: { id: "javascript", label: "JavaScript", extensions: [".js", ".mjs", ".cjs"], monacoId: "javascript", runCmd: "node {file}" },
  typescript: { id: "typescript", label: "TypeScript", extensions: [".ts", ".tsx"], monacoId: "typescript", compileCmd: "tsc", runCmd: "node {file}" },
  python: { id: "python", label: "Python", extensions: [".py"], monacoId: "python", runCmd: "python {file}" },
  c: { id: "c", label: "C", extensions: [".c", ".h"], monacoId: "c" },
  cpp: { id: "cpp", label: "C++", extensions: [".cpp", ".hpp", ".cc"], monacoId: "cpp" },
  csharp: { id: "csharp", label: "C#", extensions: [".cs"], monacoId: "csharp", compileCmd: "dotnet build" },
  java: { id: "java", label: "Java", extensions: [".java"], monacoId: "java" },
  kotlin: { id: "kotlin", label: "Kotlin", extensions: [".kt", ".kts"], monacoId: "kotlin" },
  swift: { id: "swift", label: "Swift", extensions: [".swift"], monacoId: "swift" },
  dart: { id: "dart", label: "Dart", extensions: [".dart"], monacoId: "dart", runCmd: "dart run {file}" },
  php: { id: "php", label: "PHP", extensions: [".php"], monacoId: "php", runCmd: "php {file}" },
  go: { id: "go", label: "Go", extensions: [".go"], monacoId: "go", runCmd: "go run {file}" },
  rust: { id: "rust", label: "Rust", extensions: [".rs"], monacoId: "rust", compileCmd: "cargo build" },
  ruby: { id: "ruby", label: "Ruby", extensions: [".rb"], monacoId: "ruby", runCmd: "ruby {file}" },
  lua: { id: "lua", label: "Lua", extensions: [".lua"], monacoId: "lua" },
  r: { id: "r", label: "R", extensions: [".r", ".R"], monacoId: "r" },
  sql: { id: "sql", label: "SQL", extensions: [".sql"], monacoId: "sql" },
  bash: { id: "bash", label: "Bash", extensions: [".sh"], monacoId: "shell" },
  powershell: { id: "powershell", label: "PowerShell", extensions: [".ps1"], monacoId: "powershell" },
};

export const DOMAIN_PROFILES: Record<DomainId, DomainProfile> = {
  web_saas: { id: "web_saas", label: "Web SaaS", defaultLanguages: ["typescript", "javascript", "html", "css", "python"], scaffoldAdapter: "app-builder", previewMode: "web_blob" },
  web_ecommerce: { id: "web_ecommerce", label: "E-Commerce", defaultLanguages: ["typescript", "html", "css", "python"], scaffoldAdapter: "business-site-maker", previewMode: "web_blob" },
  web_portfolio: { id: "web_portfolio", label: "Portfolio", defaultLanguages: ["html", "css", "javascript"], scaffoldAdapter: "app-builder", previewMode: "web_blob" },
  mobile_flutter: { id: "mobile_flutter", label: "Flutter Mobile", defaultLanguages: ["dart"], scaffoldAdapter: "app-builder", previewMode: "device_frame" },
  mobile_android: { id: "mobile_android", label: "Android", defaultLanguages: ["kotlin"], scaffoldAdapter: "app-builder", previewMode: "device_frame" },
  mobile_ios: { id: "mobile_ios", label: "iOS", defaultLanguages: ["swift"], scaffoldAdapter: "app-builder", previewMode: "device_frame" },
  desktop_win: { id: "desktop_win", label: "Windows Desktop", defaultLanguages: ["csharp"], scaffoldAdapter: "app-builder", previewMode: "desktop_frame" },
  desktop_mac: { id: "desktop_mac", label: "macOS Desktop", defaultLanguages: ["swift"], scaffoldAdapter: "app-builder", previewMode: "desktop_frame" },
  desktop_linux: { id: "desktop_linux", label: "Linux Desktop", defaultLanguages: ["cpp"], scaffoldAdapter: "app-builder", previewMode: "desktop_frame" },
  game_2d: { id: "game_2d", label: "2D Game", defaultLanguages: ["csharp", "javascript"], scaffoldAdapter: "game-dev", previewMode: "game_preview" },
  game_3d: { id: "game_3d", label: "3D Game", defaultLanguages: ["csharp", "cpp"], scaffoldAdapter: "game-dev", previewMode: "game_preview" },
  microservice: { id: "microservice", label: "Microservices", defaultLanguages: ["go", "python", "typescript"], scaffoldAdapter: "app-builder", previewMode: "api_panel" },
  data_science: { id: "data_science", label: "AI / Data Science", defaultLanguages: ["python", "r", "sql"], scaffoldAdapter: "app-builder", previewMode: "notebook" },
  browser_extension: { id: "browser_extension", label: "Browser Extension", defaultLanguages: ["javascript", "typescript", "html"], scaffoldAdapter: "app-builder", previewMode: "web_blob" },
  enterprise: { id: "enterprise", label: "Enterprise", defaultLanguages: ["java", "csharp", "sql"], scaffoldAdapter: "business-site-maker", previewMode: "web_blob" },
};

const pluginByExt = new Map<string, LanguagePlugin>();
for (const plugin of Object.values(LANGUAGE_PLUGINS)) {
  for (const ext of plugin.extensions) pluginByExt.set(ext, plugin);
}

export function resolveLanguagePlugin(path: string): LanguagePlugin | null {
  const low = path.toLowerCase();
  for (const [ext, plugin] of pluginByExt) {
    if (low.endsWith(ext)) return plugin;
  }
  return null;
}

export function registerLanguagePlugin(plugin: LanguagePlugin): void {
  LANGUAGE_PLUGINS[plugin.id] = plugin;
  for (const ext of plugin.extensions) pluginByExt.set(ext, plugin);
}

export function registerDomainProfile(profile: DomainProfile): void {
  DOMAIN_PROFILES[profile.id] = profile;
}
