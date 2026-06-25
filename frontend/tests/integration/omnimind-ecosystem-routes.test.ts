import { describe, expect, it } from "vitest";
import {
  buildBreadcrumbs,
  shellRouteLabel,
  SHELL_ROUTE_LABELS,
} from "../../lib/omnimind-ecosystem-registry";
import { ECOSYSTEM_TOOLS } from "../../lib/omnimind-ecosystem-registry";

describe("Ecosystem shell route labels", () => {
  it("maps mission control and automation routes", () => {
    expect(shellRouteLabel("/mission-control")).toBe("Mission Control");
    expect(shellRouteLabel("/automation-engine")).toBe("Automation Engine");
  });

  it("builds breadcrumbs for platform shell routes", () => {
    const tool = ECOSYSTEM_TOOLS[0]!;
    const crumbs = buildBreadcrumbs(tool, [], "/mission-control");
    expect(crumbs[1]).toBe("Mission Control");
  });

  it("defines all platform shell labels", () => {
    expect(Object.keys(SHELL_ROUTE_LABELS).length).toBeGreaterThanOrEqual(10);
  });
});
