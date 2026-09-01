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

test("stock detail renders connected or unavailable market data", async ({ page }) => {
  await page.goto("/stocks/nse/RELIANCE");
  const authenticationNotice = page.getByText(/authentication is not configured/i).first();
  const quoteMetadata = page.locator("main header small");

  await expect.poll(async () => (
    await authenticationNotice.isVisible() || await quoteMetadata.isVisible()
  )).toBe(true);
  await expect(page.getByText(/Loading fundamentals/i)).not.toBeVisible();

  if (await authenticationNotice.isVisible()) {
    await expect(page.getByText("Fundamental data source not connected.")).toBeVisible();
  } else {
    await expect(quoteMetadata).toContainText(/LIVE|DELAYED|STALE/i);
    await expect(page.getByText("Open", { exact: true })).toBeVisible();
  }
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
