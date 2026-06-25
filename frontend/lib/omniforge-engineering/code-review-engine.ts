import { lintSource } from "../omniforge-syntax-validation";
import type { CodeReviewCategory, CodeReviewFinding } from "./types";

const CATEGORY_RULES: { category: CodeReviewCategory; test: (path: string, content: string) => CodeReviewFinding[] }[] = [
  {
    category: "security",
    test: (path, content) => {
      const findings: CodeReviewFinding[] = [];
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (/password\s*=\s*['"][^'"]+['"]/i.test(line) && !line.includes("process.env")) {
          findings.push({ category: "security", line: i + 1, message: "Hardcoded password detected — use environment variables", severity: "error" });
        }
        if (/eval\s*\(/.test(line)) {
          findings.push({ category: "security", line: i + 1, message: "Avoid eval() — security risk", severity: "error" });
        }
        if (/dangerouslySetInnerHTML/.test(line) && !line.includes("sanitize")) {
          findings.push({ category: "security", line: i + 1, message: "dangerouslySetInnerHTML without sanitization", severity: "warning" });
        }
        if (/api[_-]?key\s*=\s*['"][^'"]+['"]/i.test(line)) {
          findings.push({ category: "security", line: i + 1, message: "Hardcoded API key — move to env", severity: "error" });
        }
      });
      return findings;
    },
  },
  {
    category: "performance",
    test: (_path, content) => {
      const findings: CodeReviewFinding[] = [];
      if (content.includes("useEffect") && content.includes("fetch(") && !content.includes("[]")) {
        findings.push({ category: "performance", message: "Fetch inside useEffect without stable deps may over-fetch", severity: "warning" });
      }
      if ((content.match(/\.map\(/g) ?? []).length > 8) {
        findings.push({ category: "performance", message: "Many .map() calls — consider memoization for large lists", severity: "info" });
      }
      return findings;
    },
  },
  {
    category: "accessibility",
    test: (path, content) => {
      if (!/\.(tsx|jsx|html)$/.test(path)) return [];
      const findings: CodeReviewFinding[] = [];
      if (/<img[^>]*(?!alt=)/i.test(content)) {
        findings.push({ category: "accessibility", message: "Image missing alt attribute", severity: "warning" });
      }
      if (/<button[^>]*>[\s]*<\/button>/i.test(content)) {
        findings.push({ category: "accessibility", message: "Empty button — add accessible label", severity: "warning" });
      }
      return findings;
    },
  },
  {
    category: "type_safety",
    test: (path, content) => {
      if (!/\.(ts|tsx)$/.test(path)) return [];
      const findings: CodeReviewFinding[] = [];
      const anyCount = (content.match(/:\s*any\b/g) ?? []).length;
      if (anyCount > 2) {
        findings.push({ category: "type_safety", message: `${anyCount} explicit 'any' types — tighten types`, severity: "warning" });
      }
      if (content.includes("@ts-ignore")) {
        findings.push({ category: "type_safety", message: "@ts-ignore suppresses type errors", severity: "warning" });
      }
      return findings;
    },
  },
  {
    category: "imports",
    test: (path, content) => {
      if (!/\.(ts|tsx|js|jsx)$/.test(path)) return [];
      const findings: CodeReviewFinding[] = [];
      const importLines = content.split("\n").filter((l) => /^import\s/.test(l));
      const froms = importLines.map((l) => l.match(/from\s+['"]([^'"]+)['"]/)?.[1]).filter(Boolean);
      if (froms.length !== new Set(froms).size) {
        findings.push({ category: "imports", message: "Duplicate import sources detected", severity: "info" });
      }
      if (importLines.some((l) => l.includes("from './") && path.includes("/"))) {
        /* relative imports ok */
      }
      const reactImport = importLines.some((l) => l.includes("react"));
      if (/\.tsx$/.test(path) && !reactImport && content.includes("JSX")) {
        findings.push({ category: "imports", message: "TSX file may be missing React import", severity: "warning" });
      }
      return findings;
    },
  },
  {
    category: "routes",
    test: (path, content) => {
      const findings: CodeReviewFinding[] = [];
      if (path.includes("route") || path.includes("pages/") || path.includes("app/")) {
        if (content.includes("href=\"#\"") || content.includes("href='#'")) {
          findings.push({ category: "routes", message: "Placeholder href='#' — wire real routes", severity: "warning" });
        }
      }
      return findings;
    },
  },
  {
    category: "best_practices",
    test: (path, content) => {
      const findings: CodeReviewFinding[] = [];
      if (content.length > 8000) {
        findings.push({ category: "best_practices", message: "Large file — consider splitting modules", severity: "info" });
      }
      if (/TODO|FIXME|HACK/i.test(content)) {
        findings.push({ category: "best_practices", message: "Unresolved TODO/FIXME markers", severity: "info" });
      }
      return findings;
    },
  },
];

export function reviewGeneratedFile(path: string, content: string, allPaths: string[]): CodeReviewFinding[] {
  const findings: CodeReviewFinding[] = [];

  for (const lint of lintSource(path, content)) {
    findings.push({
      category: lint.severity === "error" ? "type_safety" : "best_practices",
      line: lint.line,
      message: lint.message,
      severity: lint.severity,
    });
  }

  for (const rule of CATEGORY_RULES) {
    findings.push(...rule.test(path, content));
  }

  const baseName = path.split("/").pop() ?? path;
  const dupes = allPaths.filter((p) => p.split("/").pop() === baseName && p !== path);
  if (dupes.length) {
    findings.push({
      category: "duplicates",
      message: `Similar filename exists: ${dupes.slice(0, 2).join(", ")}`,
      severity: "info",
    });
  }

  return findings.slice(0, 24);
}

export function reviewScore(findings: CodeReviewFinding[]): number {
  if (!findings.length) return 100;
  let score = 100;
  for (const f of findings) {
    if (f.severity === "error") score -= 12;
    else if (f.severity === "warning") score -= 5;
    else score -= 1;
  }
  return Math.max(0, Math.min(100, score));
}
