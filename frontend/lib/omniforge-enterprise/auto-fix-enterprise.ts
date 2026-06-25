import { analyzeAndSuggestFix } from "../omniforge-engineering/auto-fix-engine";
import { reviewGeneratedFile } from "../omniforge-engineering/code-review-engine";

export type AutoFixCategory =
  | "error"
  | "warning"
  | "type"
  | "dependency"
  | "import"
  | "format"
  | "unused"
  | "security";

export type AutoFixItem = {
  id: string;
  category: AutoFixCategory;
  file: string;
  message: string;
  fix?: string;
  applied: boolean;
};

type FileSnapshot = { path: string; content: string; language?: string };

/** Enterprise auto-fix — extends engineering review + auto-fix engines. */
export function scanAndFixWorkspace(files: FileSnapshot[]): AutoFixItem[] {
  const items: AutoFixItem[] = [];
  const paths = files.map((f) => f.path);

  for (const file of files) {
    const findings = reviewGeneratedFile(file.path, file.content, paths);
    for (const issue of findings) {
      const suggestion = analyzeAndSuggestFix({
        source: file.path,
        message: issue.message,
        line: issue.line,
      });
      items.push({
        id: `fix-${file.path}-${issue.line ?? 0}-${issue.category}`,
        category: mapCategory(issue.category),
        file: file.path,
        message: issue.message,
        fix: suggestion.fix,
        applied: false,
      });
    }

    if (/import .+ from ['"]\.\.\/\.\.\/\.\.\//.test(file.content)) {
      items.push({
        id: `import-depth-${file.path}`,
        category: "import",
        file: file.path,
        message: "Deep relative import — consider path alias",
        applied: false,
      });
    }
  }

  return items.slice(0, 40);
}

export function applyAutoFix(file: FileSnapshot, fix: string): string {
  return `${file.content}\n/* Auto-fix: ${fix} */\n`;
}

function mapCategory(cat: string): AutoFixCategory {
  if (cat === "security") return "security";
  if (cat === "type_safety") return "type";
  if (cat === "imports") return "import";
  return "warning";
}
