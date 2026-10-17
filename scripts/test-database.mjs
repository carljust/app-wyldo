import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
const name = "wyldo-phase3-security-test";
const image =
  "postgres:17-alpine@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24";
function run(args, input) {
  const r = spawnSync("docker", args, { input, encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || "Docker failed");
  return r.stdout;
}
run([
  "run",
  "--rm",
  "--detach",
  "--name",
  name,
  "--network",
  "none",
  "--tmpfs",
  "/var/lib/postgresql/data:rw",
  "-e",
  "POSTGRES_HOST_AUTH_METHOD=trust",
  image,
]);
try {
  for (let i = 0; i < 60; i++) {
    const r = spawnSync(
      "docker",
      ["exec", name, "pg_isready", "-h", "127.0.0.1", "-U", "postgres"],
      { encoding: "utf8" },
    );
    if (r.status === 0) break;
    if (i === 59) throw new Error("PostgreSQL readiness timed out");
    await new Promise((r) => setTimeout(r, 250));
  }
  for (const file of [
    "supabase/tests/bootstrap.sql",
    "supabase/PREFLIGHT.sql",
    "supabase/migrations/202610170001_foundation.sql",
    "supabase/migrations/202610170002_navigation_checkpoints.sql",
    "supabase/tests/security.sql",
    "supabase/tests/navigation.sql",
  ]) {
    if (file === "supabase/PREFLIGHT.sql") {
      const collisions = run(
        [
          "exec",
          "--interactive",
          name,
          "psql",
          "-U",
          "postgres",
          "--set",
          "ON_ERROR_STOP=1",
          "--tuples-only",
          "--no-align",
        ],
        readFileSync(file, "utf8"),
      ).trim();
      if (collisions)
        throw new Error("Preflight unexpectedly found a collision");
      console.log(file + ": no collisions");
      continue;
    }
    const result = run(
      [
        "exec",
        "--interactive",
        name,
        "psql",
        "-U",
        "postgres",
        "--set",
        "ON_ERROR_STOP=1",
      ],
      readFileSync(file, "utf8"),
    );
    console.log(
      file +
        ": " +
        (result.includes("PASS:")
          ? result.split("\n").find((x) => x.startsWith("PASS:"))
          : "applied"),
    );
  }
} finally {
  run(["stop", name]);
}
