import { test, expect } from "@playwright/test";

test.describe("OmniMind OS boot", () => {
  test("home shell loads with navigation chrome", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".omni-app-shell")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("mission control route is reachable", async ({ page }) => {
    await page.goto("/mission-control");
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveURL(/mission-control/);
  });
});
