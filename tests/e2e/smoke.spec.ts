import { expect, test } from "@playwright/test";

const routes = ["/", "/markets", "/search", "/research", "/ipo", "/mutual-funds", "/tools/mf-portfolio-tracker", "/cards", "/tools", "/tools/cashback-calculator", "/stocks/search", "/stocks/nse/RELIANCE"];

for (const route of routes) {
  test(`${route} loads without runtime errors or page overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route);
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("public pages do not expose common mojibake", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const text = await page.locator("body").innerText();
    expect(text, `Malformed text on ${route}`).not.toMatch(/\u00c3\u00a2|\u00c3\u0082|\u00c3\u0192|\u00ef\u00bf\u00bd/);
  }
});

test("primary navigation reaches IPO intelligence", async ({ page }, testInfo) => {
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Toggle navigation" });
  if (testInfo.project.name !== "desktop" && await menuButton.isVisible()) await menuButton.click();
  const link = page.locator('a[href="/ipo"]:visible').first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/ipo/);
});
