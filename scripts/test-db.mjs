import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

// Uses the existing local database. The test transaction always rolls back.
const sql = readFileSync(
  new URL("../supabase/tests/tenant_isolation.test.sql", import.meta.url),
  "utf8",
);
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
