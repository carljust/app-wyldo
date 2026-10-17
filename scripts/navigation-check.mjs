import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const out = "docs/implementation/phase4/screenshots";
await mkdir(out, { recursive: true });
const results = [];
const browser = await chromium.launch({
  executablePath: process.env.WYLDO_CHROMIUM || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const base = process.env.WYLDO_TEST_URL || "http://localhost:8083";
try {
  for (const [width, height] of [
    [320, 640],
    [360, 800],
    [390, 844],
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    await context.addInitScript(() => {
      window.__wyldoGeoRequests = 0;
      for (const name of ["watchPosition", "getCurrentPosition"])
        navigator.geolocation[name] = () => {
          window.__wyldoGeoRequests++;
          throw new Error("Live GPS must not run in the draft simulation");
        };
    });
    let page = await context.newPage();
    const errors = [];
    let syncRequests = 0;
    const observe = (p) => {
      p.on("pageerror", (e) => errors.push(e.message));
      p.on("request", (r) => {
        if (r.url().includes("/rpc/save_navigation_checkpoint")) syncRequests++;
      });
    };
    observe(page);
    const shot = async (name) =>
      page.screenshot({ path: `${out}/${width}x${height}-${name}.png` });
    await page.goto(base + "/navigate/externsteine");
    await page.getByText("Luftlinie zum Startpunkt", { exact: true }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    await shot("navigation-gespeichert");
    const before = await page.getByText(/Simulierte Peilung/).innerText();
    await page
      .getByRole("button", {
        name: "Gerätedrehung simulieren (+45°)",
        exact: true,
      })
      .click();
    await page.waitForFunction(
      (text) => !document.body.innerText.includes(text),
      before,
    );
    const after = await page.getByText(/Simulierte Peilung/).innerText();
    await page.reload();
    await page.getByText(after, { exact: true }).waitFor();
    await page
      .getByRole("button", {
        name: "Startbereich · 3 Messungen simulieren",
        exact: true,
      })
      .click();
    await page
      .getByText("Simulierter Startbereich erreicht", { exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Intro beenden", exact: true })
        .count(),
      0,
    );
    await page
      .getByText("Simulierter Startbereich erreicht", { exact: true })
      .scrollIntoViewIfNeeded();
    await shot("ankunft-bestaetigen");
    await page
      .getByRole("button", { name: "Navigation pausieren", exact: true })
      .click();
    await page.getByText("Navigation pausiert", { exact: true }).waitFor();
    await page.reload();
    await page.getByText("Navigation pausiert", { exact: true }).waitFor();
    await shot("pause-nach-neustart");
    await page
      .getByRole("button", { name: "Simulation fortsetzen", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Startbereich · 3 Messungen simulieren",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Simulation bewusst starten", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Intro beenden", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Intro beenden", exact: true })
      .scrollIntoViewIfNeeded();
    await shot("intro");
    await page.goto(base + "/backpack");
    await page
      .getByRole("button", {
        name: "Fortsetzen: Der verlorene Schatz der Externsteine",
        exact: true,
      })
      .waitFor();
    await shot("rucksack-fortsetzen");
    await page
      .getByRole("button", {
        name: "Fortsetzen: Der verlorene Schatz der Externsteine",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Intro beenden", exact: true })
      .waitFor();
    await context.setOffline(true);
    await page
      .getByRole("button", { name: "Intro beenden", exact: true })
      .click();
    await page
      .getByText("Nächste Station noch nicht freigegeben", { exact: true })
      .waitFor();
    await shot("offline-wartet-auf-freigabe");
    assert.equal(
      await page.getByTestId("real-map").filter({ visible: true }).count(),
      0,
    );
    await page
      .getByRole("button", { name: "Navigation pausieren", exact: true })
      .click();
    await page.getByText("Navigation pausiert", { exact: true }).waitFor();
    const geo = await page.evaluate(() => window.__wyldoGeoRequests);
    assert.equal(geo, 0);
    await context.setOffline(false);
    await page.close();
    page = await context.newPage();
    observe(page);
    await page.goto(base + "/navigate/externsteine");
    await page.getByText("Navigation pausiert", { exact: true }).waitFor();
    await page
      .getByRole("button", { name: "Simulation fortsetzen", exact: true })
      .click();
    await page
      .getByText("Nächste Station noch nicht freigegeben", { exact: true })
      .waitFor();
    assert.ok(
      await page
        .getByRole("button", {
          name: "Quest-Aufgaben · folgen in Phase 5",
          exact: true,
        })
        .isDisabled(),
    );
    assert.equal(syncRequests, 0);
    assert.deepEqual(errors, []);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    );
    results.push({
      viewport: `${width}x${height}`,
      headingSurvivesReload: true,
      pauseSurvivesReload: true,
      consciousStart: true,
      backpackResume: true,
      offlineLocalCommit: true,
      newPageRestoresPhase: true,
      noLiveGps: true,
      noSimulationUploads: true,
      noStationLeak: true,
      noRuntimeErrors: true,
    });
    console.log(
      `PASS ${width}: persisted navigation, arrival gate, conscious start, pause/resume, offline and no uploads/GPS`,
    );
    await context.close();
  }
  await writeFile(
    "docs/implementation/phase4/ui-results.json",
    JSON.stringify(results, null, 2) + "\n",
  );
} finally {
  await browser.close();
}
