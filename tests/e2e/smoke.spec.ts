import { test, expect } from "@playwright/test";

test("home loads with ask box and quick services", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("search", { name: /Ask Seva Saathi/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Most-used services/i })).toBeVisible();
});

test("services search and journey page", async ({ page }) => {
  await page.goto("/services?q=passport");
  await expect(page.getByRole("heading", { name: /official site/i })).toBeVisible();
  await page.goto("/journeys/name-change-after-marriage");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/marriage/i);
});

test("ask page and voice status fallback", async ({ page }) => {
  await page.goto("/ask");
  await expect(page.getByText(/What do you need/i)).toBeVisible();
  const res = await page.request.get("/api/voice/status");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty("demoAvailable");
});
