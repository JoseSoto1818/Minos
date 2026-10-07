import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

// Uses the existing local database. The test transaction always rolls back.
for (const file of readdirSync(new URL("../supabase/tests/", import.meta.url))
  .filter((f) => f.endsWith(".sql"))
  .sort()) {
  const sql = readFileSync(
    new URL(`../supabase/tests/${file}`, import.meta.url),
    "utf8",
  );
  console.log(`Running ${file}`);
  const result = spawnSync(
    "docker",
    [
      "exec",
      "-i",
      "supabase_db_minos",
      "psql",
      "-X",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-qAt",
    ],
    { input: sql, encoding: "utf8" },
  );
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  const output = result.stdout ?? "";
  const plan = output.match(/^1\.\.(\d+)$/m);
  const passed = output.match(/^ok \d+/gm) ?? [];
  if (
    result.status !== 0 ||
    /^not ok /m.test(output) ||
    !plan ||
    passed.length !== Number(plan[1])
  )
    process.exit(1);
  console.log(
    `Database assertions passed: ${passed.length}. Transaction rolled back.`,
  );
}
