import type { CleaningOperation, CleaningPreview, DatasetSnapshot } from "./types";

export function previewCleaning(dataset: DatasetSnapshot, operation: CleaningOperation): CleaningPreview {
  const applied = applyCleaningOps(dataset, operation);
  const affected = Math.abs(dataset.rows.length - applied.rows.length) +
    dataset.rows.reduce((sum, r, i) => {
      const a = applied.rows[i];
      if (!a) return sum + dataset.headers.length;
      return sum + dataset.headers.filter((h) => r[h] !== a[h]).length;
    }, 0);

  return {
    operation,
    beforeRows: dataset.rows.length,
    afterRows: applied.rows.length,
    affectedCells: affected,
    sampleBefore: dataset.rows.slice(0, 3),
    sampleAfter: applied.rows.slice(0, 3),
  };
}

function applyCleaningOps(dataset: DatasetSnapshot, operation: CleaningOperation): DatasetSnapshot {
  let rows = dataset.rows.map((r) => ({ ...r }));

  if (operation === "remove_duplicates") {
    const seen = new Set<string>();
    rows = rows.filter((r) => {
      const k = JSON.stringify(r);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  } else if (operation === "fix_missing") {
    rows = rows.map((r) => {
      const next = { ...r };
      for (const h of dataset.headers) {
        if (next[h] == null || next[h] === "") {
          const nums = dataset.rows.map((x) => x[h]).filter((v) => typeof v === "number") as number[];
          next[h] = nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
        }
      }
      return next;
    });
  } else if (operation === "normalize_formats") {
    rows = rows.map((r) => {
      const next = { ...r };
      for (const h of dataset.headers) {
        if (typeof next[h] === "string") next[h] = String(next[h]).trim().toLowerCase();
      }
      return next;
    });
  } else if (operation === "standardize_dates") {
    rows = rows.map((r) => {
      const next = { ...r };
      for (const h of dataset.headers) {
        if (/date|time/i.test(h) && next[h]) {
          const d = new Date(String(next[h]));
          if (!Number.isNaN(d.getTime())) next[h] = d.toISOString().slice(0, 10);
        }
      }
      return next;
    });
  } else if (operation === "convert_currency") {
    rows = rows.map((r) => {
      const next = { ...r };
      for (const h of dataset.headers) {
        if (/revenue|profit|sales|amount/i.test(h)) {
          const n = parseFloat(String(next[h]).replace(/[^0-9.-]/g, ""));
          if (!Number.isNaN(n)) next[h] = n;
        }
      }
      return next;
    });
  } else if (operation === "remove_noise") {
    rows = rows.filter((r) => Object.values(r).some((v) => v != null && v !== ""));
  }

  return { ...dataset, rows };
}

export function applyCleaning(dataset: DatasetSnapshot, operation: CleaningOperation): DatasetSnapshot {
  const next = applyCleaningOps(dataset, operation);
  return {
    ...next,
    report: { ...dataset.report, rowCount: next.rows.length },
  };
}
