import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
const out = "docs/implementation/phase3/screenshots";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.WYLDO_CHROMIUM || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const results = [];
try {
  for (const [width, height] of [
    [320, 640],
    [360, 800],
    [390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    let writes = 0;
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (
        r.url().includes(".supabase.co/") &&
        !["GET", "HEAD", "OPTIONS"].includes(r.method())
      )
        writes++;
    });
    await page.goto("http://localhost:8083/auth");
    await page.getByText("Mit E-Mail anmelden", { exact: true }).waitFor();
    const input = page.getByRole("textbox", { name: "E-Mail-Adresse" });
    assert.ok(await input.isEnabled());
    await input.fill("familie@example.invalid");
    assert.ok(
      await page
        .getByRole("button", { name: "Anmeldelink senden", exact: true })
        .isEnabled(),
    );
    assert.ok(
      await page
        .getByRole("button", {
          name: "Google · Provider noch nicht eingerichtet",
          exact: true,
        })
        .isDisabled(),
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `${out}/${width}x${height}-anmelden-konfiguriert.png`,
    });
    await page.goto("http://localhost:8083/");
    await page
      .getByText("Noch keine veröffentlichten Abenteuer.", { exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByText("Quests konnten nicht geladen werden.", { exact: true })
        .count(),
      0,
    );
    await page
      .getByText("Noch keine veröffentlichten Abenteuer.", { exact: true })
      .scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `${out}/${width}x${height}-leerer-server-katalog.png`,
    });
    await page.route("**/rest/v1/quest_summaries**", (route) =>
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          code: "PGRST205",
          message: "Simulated missing schema for UI regression",
        }),
      }),
    );
    await page.reload();
    await page
      .getByText("Quests konnten nicht geladen werden.", { exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Erneut laden", exact: true })
      .scrollIntoViewIfNeeded();
    assert.equal(
      await page
        .getByRole("button", {
          name: "Quest entdecken: Das Geheimnis des Waldlichts",
          exact: true,
        })
        .count(),
      0,
    );
    await page.screenshot({
      path: `${out}/${width}x${height}-fehlendes-server-schema.png`,
    });
    assert.equal(writes, 0);
    assert.deepEqual(errors, []);
    results.push({
      viewport: `${width}x${height}`,
      configuredEmailUI: true,
      googleDisabled: true,
      liveEmptyCatalog: true,
      noFixtureFallbackOnBackendError: true,
      noRemoteWrites: true,
      noRuntimeErrors: true,
    });
    console.log(
      `PASS ${width}: configured auth, disabled Google, live empty catalog, simulated schema error, no remote writes`,
    );
    await page.close();
  }
  await writeFile(
    "docs/implementation/phase3/backend-ui-results.json",
    JSON.stringify(results, null, 2) + "\n",
  );
} finally {
  await browser.close();
}
