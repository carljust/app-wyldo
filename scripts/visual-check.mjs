import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const out = "docs/implementation/screenshots";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.WYLDO_CHROMIUM || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const results = [];
const errors = [];
const base = process.env.WYLDO_TEST_URL || "http://localhost:8081";
async function check(name, fn) {
  await fn();
  results.push({ name, status: "passed" });
  console.log("PASS", name);
}
try {
  for (const [width, height] of [
    [320, 640],
    [360, 800],
    [390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    const tileResponses = [];
    page.on("response", (response) => {
      if (response.url().startsWith("https://tile.openstreetmap.org/"))
        tileResponses.push({
          status: response.status(),
          blocked: response.headers()["x-blocked"] || null,
        });
    });
    async function open(path) {
      await page.goto(base + path, { waitUntil: "domcontentloaded" });
      await page
        .getByRole("button", { name: "Profil öffnen" })
        .or(page.getByText("FIKTIVE TESTQUEST", { exact: true }))
        .or(page.getByRole("button", { name: "Zurück zu Entdecken" }))
        .or(page.getByRole("button", { name: "Zurück zur Quest" }))
        .or(page.getByText("LOKALER TESTKATALOG", { exact: true }))
        .or(page.getByText("PROFIL · VORSCHAU"))
        .or(page.getByText("DEIN ABENTEUER-INVENTAR · VORSCHAU"))
        .first()
        .waitFor({ timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
    }
    async function shot(name) {
      await page.screenshot({ path: `${out}/${width}x${height}-${name}.png` });
    }
    async function noOverflow(name) {
      await check(`${width} ${name}: no horizontal overflow`, async () => {
        const n = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        assert.ok(n <= 1, `overflow ${n}px`);
      });
    }
    await open("/");
    await shot("entdecken");
    await noOverflow("discovery");
    await check(`${width} search and empty reset`, async () => {
      await page
        .getByRole("textbox", { name: "Quests suchen" })
        .fill("unbekannt");
      await page.getByText("Keine Quest gefunden.").waitFor();
      await page.getByRole("button", { name: "Suche zurücksetzen" }).click();
      await page
        .getByRole("button", {
          name: "Quest entdecken: Das Geheimnis des Waldlichts",
          exact: true,
        })
        .waitFor();
    });
    await page
      .getByRole("button", {
        name: "Quest entdecken: Der verlorene Schatz der Externsteine",
        exact: true,
      })
      .click();
    await page.getByText("Über diese Quest", { exact: true }).waitFor();
    await shot("quest-details");
    await noOverflow("details");
    await page
      .getByTestId("real-map")
      .filter({ visible: true })
      .scrollIntoViewIfNeeded();
    await page.locator(".leaflet-container:visible").waitFor();
    await check(
      `${width} real basemap tiles load with TLS verification`,
      async () => {
        await page.waitForFunction(() =>
          [...document.querySelectorAll(".leaflet-tile")].some(
            (img) => img.complete && img.naturalWidth > 0,
          ),
        );
        assert.ok(tileResponses.some((r) => r.status === 200 && !r.blocked));
        assert.ok(tileResponses.every((r) => r.status < 400 && !r.blocked));
        await page
          .getByText("Karte wird geladen …", { exact: true })
          .waitFor({ state: "hidden" });
      },
    );
    await shot("quest-route");
    await check(
      `${width} detail track and combined start-finish marker`,
      async () => {
        assert.equal(
          await page.locator(".leaflet-overlay-pane path:visible").count(),
          1,
        );
        assert.equal(await page.locator(".wyldo-marker:visible").count(), 1);
        assert.equal(
          await page.locator(".wyldo-marker:visible").getAttribute("title"),
          "Start / Ziel · Kandidat",
        );
        const points = await page
          .locator(".leaflet-overlay-pane path:visible")
          .getAttribute("d");
        assert.ok(points.length > 500);
      },
    );
    await page
      .getByRole("button", { name: "Zum Startpunkt · Simulation", exact: true })
      .click();
    await page.getByText("Luftlinie zum Startpunkt", { exact: true }).waitFor();
    await shot("navigation-richtung");
    await page
      .getByText("Luftlinie zum Startpunkt", { exact: true })
      .locator("..")
      .scrollIntoViewIfNeeded();
    await shot("navigation-richtung-distanz");
    await noOverflow("direction");
    await check(
      `${width} heading, missing location, pause and resume`,
      async () => {
        const before = await page.getByText(/Simulierte Peilung/).innerText();
        await page
          .getByRole("button", {
            name: "Gerätedrehung simulieren (+45°)",
            exact: true,
          })
          .click();
        await page.waitForFunction(
          (previous) => !document.body.innerText.includes(previous),
          before,
        );
        await page
          .getByRole("button", {
            name: "Fehlenden Standort simulieren",
            exact: true,
          })
          .click();
        await page
          .getByText("Standort nicht verfügbar", { exact: true })
          .waitFor();
        await page
          .getByRole("button", {
            name: "Simulierten Standort wiederherstellen",
            exact: true,
          })
          .click();
        await page
          .getByRole("button", { name: "Navigation pausieren", exact: true })
          .click();
        await page.getByText("Navigation pausiert", { exact: true }).waitFor();
        await page
          .getByRole("button", { name: "Simulation fortsetzen", exact: true })
          .click();
      },
    );
    await page.getByRole("button", { name: "Karte", exact: true }).click();
    await page
      .getByTestId("real-map")
      .filter({ visible: true })
      .scrollIntoViewIfNeeded();
    await page.locator(".wyldo-marker:visible").first().waitFor();
    await page.waitForTimeout(1000);
    await shot("navigation-karte");
    await noOverflow("navigation map");
    await open("/map");
    await page.locator(".wyldo-marker:visible").first().waitFor();
    await page.waitForTimeout(1500);
    await shot("globale-karte");
    await noOverflow("global map");
    await check(
      `${width} global map has exactly two start pins and no route`,
      async () => {
        assert.equal(await page.locator(".wyldo-marker:visible").count(), 2);
        assert.equal(
          await page.locator(".leaflet-overlay-pane path:visible").count(),
          0,
        );
      },
    );
    for (const title of [
      "Das Geheimnis des Waldlichts",
      "Die Botschaft vom Silberbach",
    ]) {
      await check(`${width} pin preview and detail: ${title}`, async () => {
        await page.locator(`.wyldo-marker:visible[title="${title}"]`).click();
        await page
          .getByRole("button", { name: "Quest entdecken", exact: true })
          .click();
        await page
          .getByText(title, { exact: true })
          .filter({ visible: true })
          .first()
          .waitFor();
        await page
          .getByText("Route wird noch geprüft", { exact: true })
          .waitFor();
        assert.equal(
          await page.getByTestId("real-map").filter({ visible: true }).count(),
          0,
        );
      });
      await open("/map");
      await page.locator(".wyldo-marker:visible").first().waitFor();
    }
    await open("/backpack");
    await shot("rucksack");
    await noOverflow("backpack");
    await open("/profile");
    await shot("profil");
    await noOverflow("profile");
    await check(
      `${width} offline quest data and unavailable tiles`,
      async () => {
        await open("/quest/externsteine");
        await page
          .getByTestId("real-map")
          .filter({ visible: true })
          .scrollIntoViewIfNeeded();
        await page.route("https://tile.openstreetmap.org/**", (route) =>
          route.abort(),
        );
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.getByText("Über diese Quest", { exact: true }).waitFor();
        await page
          .getByTestId("real-map")
          .filter({ visible: true })
          .scrollIntoViewIfNeeded();
        await page.getByText(/Kartenkacheln fehlen/).waitFor();
        assert.equal(
          await page.locator(".leaflet-overlay-pane path:visible").count(),
          1,
        );
        await shot("kartenfehler");
      },
    );
    await context.close();
  }
  assert.deepEqual(errors, [], "Browser runtime errors");
  await writeFile(
    "docs/implementation/ui-results.json",
    JSON.stringify({ results, runtimeErrors: errors }, null, 2) + "\n",
  );
  console.log(`${results.length} UI checks passed; 30 screenshots captured.`);
} finally {
  await browser.close();
}
