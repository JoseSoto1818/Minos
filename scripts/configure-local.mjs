import { existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

// Writes PUBLIC local bindings only. Never overwrites a developer's existing file.
if (existsSync(".env.local")) {
  console.log(
    ".env.local already exists; preserved without reading or printing it.",
  );
  process.exit(0);
}
const raw = execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
const status = JSON.parse(raw);
const url = status.API_URL;
const key = status.PUBLISHABLE_KEY || status.ANON_KEY;
if (
  !url ||
  !key ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
) {
  throw new Error(
    "Expected a running LOCAL Supabase stack and public bindings.",
  );
}
writeFileSync(
  ".env.local",
  `NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${key}\nNEXT_PUBLIC_SITE_URL=http://localhost:3000\n`,
  { mode: 0o600, flag: "wx" },
);
console.log(
  "Local public bindings saved in ignored .env.local. No values printed.",
);
