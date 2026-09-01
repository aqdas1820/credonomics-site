import { expect, test } from "@playwright/test";

test("verified stock search opens the canonical stock page", async ({ page }) => {
  await page.goto("/stocks/search");
  await page.getByPlaceholder(/RELIANCE/).fill("RELIANCE");
  const result = page.getByRole("link", { name: /Reliance Industries/i }).first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/stocks\/nse\/RELIANCE$/i);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Reliance Industries/i);
});

test("stock detail preserves unavailable market data", async ({ page }) => {
  await page.goto("/stocks/nse/RELIANCE");
  await expect(page.getByText(/authentication is not configured/i).first()).toBeVisible();
  await expect(page.getByText("Fundamental data source not connected.")).toBeVisible();
});

test("mobile stock detail does not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/stocks/nse/TCS");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("invalid canonical stock route returns not found", async ({ page }) => {
  await page.goto("/stocks/nse/NOT-A-REAL-STOCK");
  await expect(page.getByText(/not found|could not be found/i).first()).toBeVisible();
});
