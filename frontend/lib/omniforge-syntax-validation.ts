/** Lightweight syntax hints for Monaco — Python, JS/TS, C++, Java, HTML/CSS */

export type SyntaxIssue = { line: number; message: string; severity: "error" | "warning" };

export function lintSource(path: string, content: string): SyntaxIssue[] {
  const issues: SyntaxIssue[] = [];
  const lines = content.split("\n");
  const low = path.toLowerCase();

  if (low.endsWith(".py")) {
    lines.forEach((line, i) => {
      if (/\t/.test(line)) issues.push({ line: i + 1, message: "Use spaces instead of tabs (PEP 8)", severity: "warning" });
      if (/print\s+[^(]/.test(line)) issues.push({ line: i + 1, message: "print statement should use parentheses", severity: "error" });
    });
  }

  if (/\.(js|jsx|ts|tsx)$/.test(low)) {
    lines.forEach((line, i) => {
      if (/console\.log\(/.test(line)) issues.push({ line: i + 1, message: "Remove console.log before production", severity: "warning" });
      if (/var\s+/.test(line)) issues.push({ line: i + 1, message: "Prefer const/let over var", severity: "warning" });
    });
    const opens = (content.match(/{/g) ?? []).length;
    const closes = (content.match(/}/g) ?? []).length;
    if (opens !== closes) issues.push({ line: 1, message: "Unbalanced braces detected", severity: "error" });
  }

  if (/\.(cpp|cc|hpp)$/.test(low)) {
    lines.forEach((line, i) => {
      if (line.includes("using namespace std") && !line.trim().startsWith("//")) {
        issues.push({ line: i + 1, message: "Avoid 'using namespace std' in headers", severity: "warning" });
      }
    });
  }

  if (low.endsWith(".java")) {
    if (!content.includes("class ")) issues.push({ line: 1, message: "No class declaration found", severity: "warning" });
  }

  if (low.endsWith(".html")) {
    if (!/<html/i.test(content)) issues.push({ line: 1, message: "Missing <html> root element", severity: "warning" });
    if (!/<!DOCTYPE/i.test(content)) issues.push({ line: 1, message: "Missing DOCTYPE declaration", severity: "warning" });
  }

  if (low.endsWith(".css")) {
    lines.forEach((line, i) => {
      if (line.includes("{") && !line.includes("}")) {
        const rest = lines.slice(i).join("\n");
        if (!rest.includes("}")) issues.push({ line: i + 1, message: "Unclosed CSS rule block", severity: "error" });
      }
    });
  }

  return issues.slice(0, 12);
}
