import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const path = "docs/implementation/phase3/screenshots";
await mkdir(path, { recursive: true });
const results = [];
const browser = await chromium.launch({
  executablePath: process.env.WYLDO_CHROMIUM || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  for (const [width, height] of [
    [320, 640],
    [360, 800],
    [390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    let authRequests = 0;
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (r.url().includes("/auth/v1/")) authRequests++;
    });
    await page.goto(
      (process.env.WYLDO_TEST_URL || "http://localhost:8081") + "/profile",
    );
    await page.getByRole("button", { name: "Anmelden", exact: true }).click();
    await page.getByText("Mit E-Mail anmelden", { exact: true }).waitFor();
    assert.ok(
      await page
        .getByRole("button", { name: "Anmeldelink senden", exact: true })
        .isDisabled(),
    );
    assert.ok(
      await page
        .getByRole("button", {
          name: "Google · Provider noch nicht eingerichtet",
          exact: true,
        })
        .isDisabled(),
    );
    await page
      .getByText(/Supabase-Projekt noch nicht verbunden/)
      .filter({ visible: true })
      .first()
      .waitFor();
    assert.ok(
      (await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )) <= 1,
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `${path}/${width}x${height}-anmelden-ohne-konfiguration.png`,
    });
    await page
      .getByRole("button", { name: "Anmeldelink senden", exact: true })
      .scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `${path}/${width}x${height}-anmeldeformular.png`,
    });
    await page.goto(
      (process.env.WYLDO_TEST_URL || "http://localhost:8081") +
        "/auth/callback?code=test_fixture_invalid",
    );
    await page
      .getByText("Anmeldelink nicht nutzbar", { exact: true })
      .waitFor();
    await page.screenshot({
      path: `${path}/${width}x${height}-ungueltiger-anmeldelink.png`,
    });
    await page
      .getByRole("button", { name: "Erneut anmelden", exact: true })
      .click();
    await page.getByText("Mit E-Mail anmelden", { exact: true }).waitFor();
    assert.equal(authRequests, 0);
    assert.deepEqual(errors, []);
    results.push({
      viewport: `${width}x${height}`,
      disabledEmail: true,
      disabledGoogle: true,
      configurationNotice: true,
      noHorizontalOverflow: true,
      invalidCallback: true,
      retryNavigation: true,
      noAuthRequests: true,
      noRuntimeErrors: true,
    });
    console.log(
      `PASS ${width}: auth configuration, disabled providers, invalid callback, retry and zero outbound auth requests`,
    );
    await page.close();
  }
  await writeFile(
    "docs/implementation/phase3/auth-ui-results.json",
    JSON.stringify(results, null, 2) + "\n",
  );
} finally {
  await browser.close();
}
