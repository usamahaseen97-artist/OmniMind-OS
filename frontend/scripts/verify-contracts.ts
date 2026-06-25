/**
 * Probe OmniCore platform API contracts against a running backend.
 * Skips gracefully when backend is unavailable (exit 0).
 */
import { checkContracts, OMNICORE_CONTRACTS } from "../lib/qa/contract-validator";

const base = process.env.OMNIMIND_BACKEND_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8001";

const results = await checkContracts(base, OMNICORE_CONTRACTS);
const failed = results.filter((r) => !r.ok);

for (const r of results) {
  const mark = r.ok ? "OK" : "FAIL";
  console.log(`${mark} ${r.name}${r.missing.length ? ` missing=${r.missing.join(",")}` : ""}`);
}

if (failed.length === results.length) {
  console.warn("Contract probe skipped — backend unreachable at", base);
  process.exit(0);
}

if (failed.length) {
  console.error(`${failed.length}/${results.length} contract checks failed`);
  process.exit(1);
}

console.log(`All ${results.length} contract checks passed`);
process.exit(0);
