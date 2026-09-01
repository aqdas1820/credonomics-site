import { test, expect } from '@playwright/test';

test.describe("UI Verification", () => {
  test("Verify /markets", async ({ page }) => {
    await page.goto('http://localhost:3000/markets');
    await expect(page.locator('text="Loading live market overview…"')).not.toBeVisible({ timeout: 10000 });
    const content = await page.innerText('main');
    expect(content).not.toContain("NaN");
    expect(content).not.toContain("temporarily unavailable");
    
    // Check if NIFTY 50 and its data is rendered
    expect(content).toContain("NIFTY 50");
    console.log("Verified NIFTY 50 exists.");
  });

  test("Verify /stocks/nse/RELIANCE", async ({ page }) => {
    await page.goto('http://localhost:3000/stocks/nse/RELIANCE');
    await expect(page.locator('text="Loading market quote…"')).not.toBeVisible({ timeout: 10000 });
    
    const content = await page.innerText('main');
    expect(content).not.toContain("NaN");
    expect(content).not.toContain("temporarily unavailable");
    expect(content).toContain("RELIANCE");
    
    const chart = page.locator('svg[aria-label="Historical closing price chart"]');
    await expect(chart).toBeVisible();
    
    // Check changing periods
    const periods = ['1W', '1M', '3M', '6M', '1Y', '3Y', '5Y'];
    for (const p of periods) {
      await page.getByRole('button', { name: p }).click();
      await page.waitForTimeout(1000);
      await expect(chart).toBeVisible();
    }
  });

  test("Verify /ipo", async ({ page }) => {
    await page.goto('http://localhost:3000/ipo');
    await expect(page.locator('text="Loading current IPO data…"')).not.toBeVisible({ timeout: 10000 });
    const content = await page.innerText('main');
    expect(content).not.toContain("temporarily unavailable");
  });
});
