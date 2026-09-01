import { expect, test } from "@playwright/test";

const routes = ["/", "/ipo", "/mutual-funds", "/tools/mf-portfolio-tracker", "/cards", "/tools/cashback-calculator", "/stocks/search"];

for (const route of routes) {
  test(`${route} loads without runtime errors or page overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route);
    await expect(page.locator("main").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("primary navigation reaches IPO intelligence", async ({ page }, testInfo) => {
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Toggle navigation" });
  if (testInfo.project.name !== "desktop" && await menuButton.isVisible()) await menuButton.click();
  const link = page.locator('a[href="/ipo"]:visible').first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/ipo/);
});
