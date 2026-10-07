# Minos

- Implement only the approved sprint. Current scope: Sprint 2A, explicitly approved in docs/sprint-2a.md. Do not start later blocks without user approval.
- Use the existing checkout; cloud tasks are isolated. Do not create a worktree unless requested.
- Minos complements accounting software. Spanish UI, simple business language, progressive detail.
- Never fabricate money, transactions, categories, relationships, trends, exchange rates or explanations. Welcome states must be honest about missing financial data.
- Next.js App Router, strict TypeScript, Server Components by default. Client Components only for interaction. Use pnpm and the committed lockfile.
- Supabase Auth identifies users. Every tenant table requires RLS. Check permissions in each Server Action too; hiding buttons is not authorization.
- Never expose service-role keys. Use the public project key and user session. Never commit environment files, browser traces or credentials.
- Company selection is an untrusted cookie hint: validate membership before each operation. Do not trust company IDs from forms.
- Keep privileged SQL functions narrow, atomic, with explicit authorization and empty search_path. Revoke default PUBLIC execution. Protect tenant keys with column grants.
- Schema changes require migrations, updated types, SQL security tests and documentation. Important history needs restorable operations and auditing.
- Future money fields use PostgreSQL numeric/decimal, never float. Financial periods use company timezone; system timestamps use UTC.
- Use Ocean CSS tokens, tabular numerals, Base UI/shadcn primitives, accessible labels and keyboard focus. Test light/dark and mobile.
- Sprint 2A allows manual financial capture, outstanding balances, history and an initial dashboard. Imports, payment integrations, budgets, goals and advanced reports are future blocks. AI, forecasting, banking/accounting integrations and a general ledger are out of scope.
- Before finishing: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`. With local Supabase: `pnpm db:test` and `MINOS_E2E_AUTH=1 pnpm test:e2e`.
- SQL tests roll back. Browser tests create clearly named QA accounts/companies in LOCAL only. Never run them against production.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
