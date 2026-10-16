import { spawn } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import net from "node:net";
const source = ".env.local",
  backup = ".env.wyldo-fixture-backup";
if (existsSync(backup))
  throw new Error(
    "Existing fixture backup must be preserved and restored first.",
  );
for (const file of [".env", ".env.development", ".env.development.local"])
  if (existsSync(file))
    throw new Error(
      `Fixture isolation requires reviewing ${file}; it was not modified.`,
    );
for (const port of [8081, 8083]) {
  const checks = await Promise.all(
    ["127.0.0.1", "::1"].map(
      (host) =>
        new Promise((resolve) => {
          const socket = net.connect(port, host);
          socket.once("connect", () => {
            socket.destroy();
            resolve(true);
          });
          socket.once("error", () => resolve(false));
        }),
    ),
  );
  if (checks.some(Boolean))
    throw new Error(
      `Port ${port} is occupied. Stop your own dev server before this test.`,
    );
}
const moved = existsSync(source);
if (moved) renameSync(source, backup);
const env = {
  ...process.env,
  CI: "1",
  EXPO_NO_TELEMETRY: "1",
  EXPO_OFFLINE: "1",
  npm_config_cache: "/tmp/wyldo-npm",
};
for (const key of [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "EXPO_PUBLIC_GOOGLE_AUTH_ENABLED",
  "EXPO_NO_CLIENT_ENV_VARS",
])
  delete env[key];
let server;
try {
  server = spawn(
    "npm",
    ["run", "web", "--", "--host", "localhost", "--port", "8081", "--clear"],
    { env, stdio: "inherit", detached: true },
  );
  let ready = false;
  for (let n = 0; n < 120; n++) {
    try {
      const r = await fetch("http://localhost:8081");
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error("Fixture server startup timed out");
  for (const script of ["scripts/visual-check.mjs", "scripts/auth-check.mjs"])
    await new Promise((resolve, reject) => {
      const p = spawn(process.execPath, [script], { env, stdio: "inherit" });
      p.on("error", reject);
      p.on("exit", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`${script} failed with ${code}`)),
      );
    });
} finally {
  if (server?.pid) {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {}
  }
  if (moved) {
    if (existsSync(source))
      throw new Error(
        `A new ${source} appeared during tests; original preserved in ${backup}.`,
      );
    renameSync(backup, source);
  }
}
