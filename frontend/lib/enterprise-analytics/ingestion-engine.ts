import type {
  DataColumn,
  DataColumnType,
  DataRelationship,
  DataSourceKind,
  DatasetSnapshot,
  IngestionIssue,
  IngestionReport,
} from "./types";

function inferType(values: (string | null)[]): DataColumnType {
  const nonNull = values.filter((v) => v != null && String(v).trim() !== "") as string[];
  if (!nonNull.length) return "unknown";
  if (nonNull.every((v) => /^(true|false)$/i.test(v))) return "boolean";
  if (nonNull.every((v) => /^-?\d+(\.\d+)?$/.test(v.replace(/,/g, "")))) return "number";
  if (nonNull.some((v) => /^\$|€|£|PKR|USD|EUR/i.test(v))) return "currency";
  if (nonNull.some((v) => /\d{4}-\d{2}-\d{2}|T\d{2}:\d{2}/.test(v))) return "date";
  return "string";
}

function parseCsv(text: string): { headers: string[]; rows: Record<string, string | null>[] } {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0]!.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string | null> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? null;
    });
    return row;
  });
  return { headers, rows };
}

function parseJson(text: string): { headers: string[]; rows: Record<string, string | null>[] } {
  const data = JSON.parse(text) as unknown;
  const arr = Array.isArray(data) ? data : [data];
  if (!arr.length || typeof arr[0] !== "object") return { headers: [], rows: [] };
  const headers = [...new Set(arr.flatMap((r) => Object.keys(r as object)))];
  const rows = arr.map((r) => {
    const row: Record<string, string | null> = {};
    for (const h of headers) {
      const v = (r as Record<string, unknown>)[h];
      row[h] = v == null ? null : String(v);
    }
    return row;
  });
  return { headers, rows };
}

export function ingestTextContent(
  content: string,
  sourceKind: DataSourceKind,
  fileName?: string,
): DatasetSnapshot {
  let headers: string[] = [];
  let rows: Record<string, string | null>[] = [];

  if (sourceKind === "json") {
    ({ headers, rows } = parseJson(content));
  } else {
    ({ headers, rows } = parseCsv(content));
  }

  const columns: DataColumn[] = headers.map((name) => {
    const vals = rows.map((r) => r[name] ?? null);
    const nonNull = vals.filter((v) => v != null && v !== "");
    const unique = new Set(nonNull);
    return {
      name,
      type: inferType(vals),
      nullCount: vals.length - nonNull.length,
      uniqueCount: unique.size,
      sample: nonNull.slice(0, 3).map(String),
    };
  });

  const issues: IngestionIssue[] = [];
  for (const col of columns) {
    if (col.nullCount > 0) {
      issues.push({
        kind: "missing",
        column: col.name,
        message: `${col.nullCount} missing values in ${col.name}`,
        severity: col.nullCount / Math.max(rows.length, 1) > 0.2 ? "warning" : "info",
      });
    }
    if (col.type === "currency") {
      issues.push({ kind: "currency", column: col.name, message: `Currency detected in ${col.name}`, severity: "info" });
    }
  }

  const rowKeys = rows.map((r) => JSON.stringify(r));
  const dupCount = rowKeys.length - new Set(rowKeys).size;
  if (dupCount > 0) {
    issues.push({ kind: "duplicate", message: `${dupCount} duplicate rows detected`, severity: "warning" });
  }

  const numericCols = columns.filter((c) => c.type === "number" || c.type === "currency");
  for (const col of numericCols) {
    const nums = rows
      .map((r) => parseFloat(String(r[col.name] ?? "").replace(/[^0-9.-]/g, "")))
      .filter((n) => !Number.isNaN(n));
    if (nums.length >= 4) {
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const outliers = nums.filter((n) => Math.abs(n - mean) > mean * 1.8).length;
      if (outliers > 0) {
        issues.push({
          kind: "outlier",
          column: col.name,
          message: `${outliers} potential outliers in ${col.name}`,
          severity: "info",
        });
      }
    }
  }

  const relationships: DataRelationship[] = [];
  const idCols = columns.filter((c) => /_id$|^id$/i.test(c.name));
  const nameCols = columns.filter((c) => /name|region|area|customer/i.test(c.name));
  for (const id of idCols) {
    for (const nm of nameCols) {
      if (id.name !== nm.name) {
        relationships.push({ from: id.name, to: nm.name, kind: "foreign_key", strength: 0.6 });
      }
    }
  }

  const report: IngestionReport = {
    id: `ing-${Date.now()}`,
    sourceKind,
    fileName,
    rowCount: rows.length,
    columnCount: headers.length,
    columns,
    relationships,
    issues,
    encoding: "UTF-8",
    currencyDetected: columns.find((c) => c.type === "currency")?.name,
    timezoneDetected: /UTC|GMT|PST|PKT/i.test(content) ? "UTC" : undefined,
    createdAt: new Date().toISOString(),
  };

  const typedRows: Record<string, string | number | null>[] = rows.map((r) => {
    const out: Record<string, string | number | null> = {};
    for (const h of headers) {
      const col = columns.find((c) => c.name === h);
      const v = r[h];
      if (v == null) out[h] = null;
      else if (col?.type === "number" || col?.type === "currency") {
        const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
        out[h] = Number.isNaN(n) ? v : n;
      } else out[h] = v;
    }
    return out;
  });

  return {
    id: `ds-${Date.now()}`,
    name: fileName ?? `dataset-${sourceKind}`,
    sourceKind,
    headers,
    rows: typedRows,
    report,
  };
}

export async function ingestFile(file: File, sourceKind: DataSourceKind): Promise<DatasetSnapshot> {
  const text = await file.text();
  return ingestTextContent(text, sourceKind, file.name);
}

export function sampleDataset(): DatasetSnapshot {
  const csv = `region,revenue,profit,customers,date
Karachi,128400,28400,842,2025-01-01
Lahore,98200,22100,620,2025-01-01
Islamabad,76400,19800,410,2025-01-01
Karachi,132100,29100,880,2025-02-01
Lahore,101200,23500,655,2025-02-01
Islamabad,78900,20100,425,2025-02-01`;
  return ingestTextContent(csv, "csv", "karachi-sales.csv");
}
