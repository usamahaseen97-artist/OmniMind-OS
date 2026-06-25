export type BuildError = {
  source: string;
  message: string;
  line?: number;
};

export type AutoFixResult = {
  analyzed: string;
  fix: string;
  canRetry: boolean;
};

const ERROR_PATTERNS: { pattern: RegExp; analyze: string; fix: string }[] = [
  {
    pattern: /unbalanced braces|unexpected token/i,
    analyze: "Syntax error — mismatched brackets or invalid token.",
    fix: "Balance braces/parentheses and verify import statements.",
  },
  {
    pattern: /cannot find module|module not found/i,
    analyze: "Missing dependency or incorrect import path.",
    fix: "Install the package or correct the relative import path.",
  },
  {
    pattern: /eaddrinuse|port.*in use/i,
    analyze: "Development port is already occupied.",
    fix: "Change PORT in .env or stop the conflicting process.",
  },
  {
    pattern: /cors|cross-origin/i,
    analyze: "CORS policy blocking API requests.",
    fix: "Add allowed origins to backend CORS middleware.",
  },
  {
    pattern: /401|unauthorized/i,
    analyze: "Authentication failed or token missing.",
    fix: "Verify JWT secret, login flow, and Authorization header.",
  },
  {
    pattern: /connection refused|econnrefused/i,
    analyze: "Backend service is not reachable.",
    fix: "Start the API server and confirm DATABASE_URL / API URL.",
  },
];

export function parseBuildErrors(logLines: string[]): BuildError[] {
  return logLines
    .filter((l) => /error|✗|failed|exception/i.test(l))
    .map((message) => ({
      source: "terminal",
      message: message.trim(),
    }))
    .slice(0, 12);
}

export function analyzeAndSuggestFix(error: BuildError): AutoFixResult {
  for (const rule of ERROR_PATTERNS) {
    if (rule.pattern.test(error.message)) {
      return { analyzed: rule.analyze, fix: rule.fix, canRetry: true };
    }
  }
  return {
    analyzed: "Build step failed — inspect logs for the first actionable error.",
    fix: "Fix the root cause, save files, and retry the build pipeline.",
    canRetry: true,
  };
}

export function buildAutoFixPrompt(error: BuildError, filePath?: string): string {
  const ctx = filePath ? `File: ${filePath}\n` : "";
  return `${ctx}Build error:\n${error.message}\n\nAnalyze, explain, fix, and return corrected code.`;
}
