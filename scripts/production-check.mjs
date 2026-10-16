import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.WYLDO_CHROMIUM || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const base = process.env.WYLDO_PRODUCTION_URL || "http://localhost:8082";
try {
  await page.goto(base);
  await page.getByRole("button", { name: "Profil öffnen" }).waitFor();
  assert.equal(
    await page
      .getByRole("button", {
        name: "Quest entdecken: Der verlorene Schatz der Externsteine",
        exact: true,
      })
      .count(),
    0,
  );
  console.log("PASS production discovery excludes Externsteine draft");
  await page.goto(base + "/quest/externsteine");
  await page.getByText("Quest nicht verfügbar", { exact: true }).waitFor();
  assert.equal(await page.getByTestId("real-map").count(), 0);
  console.log("PASS production direct draft URL has no route preview");
  await page.goto(base + "/navigate/externsteine");
  await page
    .getByText("Navigation nicht freigegeben", { exact: true })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", {
        name: "Gerätedrehung simulieren (+45°)",
        exact: true,
      })
      .count(),
    0,
  );
  console.log("PASS production simulation URL is disabled");
} finally {
  await browser.close();
}
