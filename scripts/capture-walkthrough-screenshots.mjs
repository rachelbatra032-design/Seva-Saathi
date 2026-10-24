import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const media = "/cursor/stores/bc-48cea458-7853-41b1-be4d-57fe8a6dc8f1/media";
await mkdir(media, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(90_000);

await page.goto("http://127.0.0.1:4821/", { waitUntil: "networkidle" });
await page.screenshot({ path: `${media}/seva-home.png`, fullPage: true });

await page.goto("http://127.0.0.1:4821/journeys/name-change-after-marriage", { waitUntil: "networkidle" });
await page.waitForSelector("text=Change your name", { timeout: 15_000 });
await page.screenshot({ path: `${media}/seva-journey.png`, fullPage: true });

await page.goto("http://127.0.0.1:4821/ask", { waitUntil: "networkidle" });
const askPromise = page.waitForResponse((r) => r.url().includes("/api/chat") && r.status() === 200, { timeout: 90_000 });
await page.getByRole("button", { name: /just got married/i }).click();
await askPromise;
await page.getByText("Grounded in official sources", { timeout: 30_000 }).waitFor();
await page.waitForSelector('section[aria-label="Sources"] ol li a[href^="http"]', { timeout: 30_000 });
await page.waitForTimeout(600);
await page.screenshot({ path: `${media}/seva-ask.png`, fullPage: true });

await browser.close();
console.log("Saved screenshots to", media);
